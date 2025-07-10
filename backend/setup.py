import os
import csv
from langchain.schema import Document
from langchain_community.document_loaders import TextLoader
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain_openai import OpenAIEmbeddings  # Updated import
from dotenv import load_dotenv
from langchain_pinecone import PineconeVectorStore
from pinecone import Pinecone
import time

load_dotenv()

# Initialize Pinecone client
pc = Pinecone(api_key=os.getenv("PINECONE_API_KEY"))

# Use the updated OpenAI embeddings
embeddings = OpenAIEmbeddings()
all_docs = []
base_path = "backend/copilot-data"

# Loop over folders: prds, sprints, roadmaps
for folder in ["prds", "sprints", "roadmaps"]:
    full_path = os.path.join(base_path, folder)
    
    # Check if folder exists
    if not os.path.exists(full_path):
        print(f"Warning: Folder {full_path} does not exist, skipping...")
        continue
    
    for filename in os.listdir(full_path):
        file_path = os.path.join(full_path, filename)
        
        # Load .md or .txt files
        if filename.endswith(".md") or filename.endswith(".txt"):
            try:
                loader = TextLoader(file_path, encoding='utf-8')
                docs = loader.load()
                for doc in docs:
                    doc.metadata["type"] = folder
                    doc.metadata["source"] = filename
                    all_docs.append(doc)
            except Exception as e:
                print(f"Error loading {file_path}: {e}")
        
        # Load .csv files
        elif filename.endswith(".csv"):
            try:
                with open(file_path, newline='', encoding='utf-8') as f:
                    reader = csv.DictReader(f)
                    for row_idx, row in enumerate(reader):
                        content = "\n".join(f"{k}: {v}" for k, v in row.items())
                        doc = Document(
                            page_content=content,
                            metadata={
                                "type": folder,
                                "source": filename,
                                "row_index": row_idx
                            }
                        )
                        all_docs.append(doc)
            except Exception as e:
                print(f"Error loading {file_path}: {e}")

print(f"Loaded {len(all_docs)} documents")

# Split documents
if all_docs:
    splitter = RecursiveCharacterTextSplitter(chunk_size=500, chunk_overlap=50)
    chunks = splitter.split_documents(all_docs)
    print(f"Created {len(chunks)} chunks")
    
    # Function to upload documents in batches
    def upload_in_batches(documents, batch_size=50):
        """Upload documents to Pinecone in batches to avoid size limits"""
        total_uploaded = 0
        
        try:
            # Get the index
            index = pc.Index("pinecone-chatbot")
            
            # Create vectorstore instance
            vectorstore = PineconeVectorStore(
                index=index,
                embedding=embeddings
            )
            
            # Process in batches
            for i in range(0, len(documents), batch_size):
                batch = documents[i:i + batch_size]
                
                try:
                    # Add this batch to Pinecone
                    vectorstore.add_documents(batch)
                    total_uploaded += len(batch)
                    print(f"✅ Uploaded batch {i//batch_size + 1}: {len(batch)} documents (Total: {total_uploaded}/{len(documents)})")
                    
                    # Add a small delay to avoid rate limiting
                    time.sleep(0.5)
                    
                except Exception as batch_error:
                    print(f"❌ Failed to upload batch {i//batch_size + 1}: {batch_error}")
                    
                    # Try with smaller batch size if this batch failed
                    if batch_size > 10:
                        print(f"Retrying with smaller batch size...")
                        smaller_batch_size = batch_size // 2
                        for j in range(0, len(batch), smaller_batch_size):
                            smaller_batch = batch[j:j + smaller_batch_size]
                            try:
                                vectorstore.add_documents(smaller_batch)
                                total_uploaded += len(smaller_batch)
                                print(f"✅ Uploaded smaller batch: {len(smaller_batch)} documents (Total: {total_uploaded}/{len(documents)})")
                                time.sleep(0.5)
                            except Exception as smaller_batch_error:
                                print(f"❌ Failed smaller batch too: {smaller_batch_error}")
            
            return total_uploaded
            
        except Exception as e:
            print(f"Error initializing vectorstore: {e}")
            return 0
    
    # Try uploading in batches
    print("\nStarting batch upload to Pinecone...")
    uploaded_count = upload_in_batches(chunks, batch_size=50)
    
    if uploaded_count > 0:
        print(f"✅ Successfully uploaded {uploaded_count} out of {len(chunks)} chunks to Pinecone")
    else:
        print("❌ Failed to upload any documents to Pinecone")
        
        # Fallback: try with very small batches
        print("Trying with very small batch size (10)...")
        uploaded_count = upload_in_batches(chunks, batch_size=10)
        
        if uploaded_count > 0:
            print(f"✅ Successfully uploaded {uploaded_count} out of {len(chunks)} chunks with small batches")
        else:
            print("❌ All upload attempts failed")
            
            # Debug information
            print("\nDebugging information:")
            print(f"PINECONE_API_KEY exists: {bool(os.getenv('PINECONE_API_KEY'))}")
            print(f"Index name: pinecone-chatbot")
            
            # List available indexes
            try:
                indexes = pc.list_indexes()
                print(f"Available indexes: {[idx.name for idx in indexes]}")
            except Exception as list_error:
                print(f"Could not list indexes: {list_error}")
                
            # Sample document info
            if chunks:
                sample_doc = chunks[0]
                print(f"Sample document length: {len(sample_doc.page_content)} characters")
                print(f"Sample metadata: {sample_doc.metadata}")

else:
    print("No documents found to embed.")

print("\nScript completed!")