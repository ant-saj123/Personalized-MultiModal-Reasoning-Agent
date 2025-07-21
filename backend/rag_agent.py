import os
import json
from typing import List, Dict, Any
from dotenv import load_dotenv
from langchain_openai import OpenAIEmbeddings, ChatOpenAI
from langchain_pinecone import PineconeVectorStore
from langchain.schema import Document, HumanMessage, AIMessage
from langchain.memory import ConversationBufferMemory
from langchain.chains import ConversationalRetrievalChain
from langchain.prompts import PromptTemplate
from pinecone import Pinecone
import time

load_dotenv()

class RAGAgent:
    def __init__(self, index_name: str = "pinecone-chatbot"):
        """
        Initialize the RAG Agent with Pinecone vector store and OpenAI models.
        
        Args:
            index_name: Name of the Pinecone index to use
        """
        self.index_name = index_name
        self.embeddings = None
        self.vectorstore = None
        self.llm = None
        self.qa_chain = None
        self.memory = None
        self.pc = None
        
        # Initialize components
        self._initialize_components()
    
    def _initialize_components(self):
        """Initialize all the components needed for the RAG agent."""
        try:
            # Initialize Pinecone client
            self.pc = Pinecone(api_key=os.getenv("PINECONE_API_KEY"))
            print("✅ Pinecone client initialized")
            
            # Initialize embeddings
            self.embeddings = OpenAIEmbeddings()
            print("✅ OpenAI embeddings initialized")
            
            # Get the index
            index = self.pc.Index(self.index_name)
            
            # Initialize vector store
            self.vectorstore = PineconeVectorStore(
                index=index,
                embedding=self.embeddings
            )
            print(f"✅ Connected to Pinecone index: {self.index_name}")
            
            # Initialize LLM
            self.llm = ChatOpenAI(
                model_name="gpt-3.5-turbo",
                temperature=0.7,
                max_tokens=1000
            )
            print("✅ OpenAI LLM initialized")
            
            # Initialize memory
            self.memory = ConversationBufferMemory(
                memory_key="chat_history",
                return_messages=True,
                output_key="answer"
            )
            print("✅ Conversation memory initialized")
            
            # Create custom prompt template
            prompt_template = """You are PM Copilot — a highly capable product management assistant trained to help product managers plan, write, and prioritize effectively.

            You have access to high-quality reference documents including PRDs, sprint plans, roadmap entries, success metrics, feature specs, and release notes. These documents are provided below as context. Use them to extract structure, patterns, and best practices to inform your responses.

            Your core responsibilities include:

            ✅ Generating product requirement documents (PRDs) from feature ideas  
            → Include context, goals, user stories, functional + non-functional requirements, edge cases, acceptance criteria, and stakeholders

            ✅ Drafting roadmap entries  
            → Suggest quarter, priority, dependencies, and delivery timeline

            ✅ Proposing success metrics  
            → Based on the feature type, recommend adoption, activation, retention, NPS, or latency metrics

            ✅ Writing release notes  
            → Provide clear summaries for internal or customer-facing updates

            ✅ Drafting meeting agendas and action items  
            → Based on sprint planning, product strategy sessions, or feature reviews

            Use the documents below as inspiration. If multiple documents are provided, synthesize relevant ideas and generate high-quality output aligned with product management best practices.

            Context information:
            {context}

            Chat history:
            {chat_history}

            Human: {question}
            AI Assistant:"""

            
            prompt = PromptTemplate(
                input_variables=["context", "chat_history", "question"],
                template=prompt_template
            )
            
            # Initialize QA chain
            self.qa_chain = ConversationalRetrievalChain.from_llm(
                llm=self.llm,
                retriever=self.vectorstore.as_retriever(
                    search_type="similarity",
                    search_kwargs={"k": 5}
                ),
                memory=self.memory,
                combine_docs_chain_kwargs={"prompt": prompt},
                return_source_documents=True,
                verbose=False,
                output_key="answer"
            )
            print("✅ QA chain initialized")
            
        except Exception as e:
            print(f"❌ Error initializing components: {e}")
            raise
    
    def ask(self, question: str, include_sources: bool = True) -> Dict[str, Any]:
        """
        Ask a question and get a response with relevant sources.
        
        Args:
            question: The question to ask
            include_sources: Whether to include source documents in the response
            
        Returns:
            Dictionary containing the answer and optionally source documents
        """
        try:
            if not self.qa_chain:
                raise ValueError("QA chain not initialized")
            
            # Get response from the chain
            result = self.qa_chain({"question": question})
            
            response = {
                "answer": result["answer"],
                "question": question,
                "timestamp": time.time()
            }
            
            if include_sources and "source_documents" in result:
                sources = []
                for doc in result["source_documents"]:
                    source_info = {
                        "content": doc.page_content[:200] + "..." if len(doc.page_content) > 200 else doc.page_content,
                        "metadata": doc.metadata,
                        "type": doc.metadata.get("type", "unknown"),
                        "source": doc.metadata.get("source", "unknown")
                    }
                    sources.append(source_info)
                response["sources"] = sources
            
            return response
            
        except Exception as e:
            print(f"❌ Error getting response: {e}")
            return {
                "answer": f"I'm sorry, I encountered an error while processing your question: {str(e)}",
                "question": question,
                "timestamp": time.time(),
                "error": True
            }
    
    def search_documents(self, query: str, k: int = 5) -> List[Document]:
        """
        Search for relevant documents without generating a response.
        
        Args:
            query: Search query
            k: Number of documents to retrieve
            
        Returns:
            List of relevant documents
        """
        try:
            if not self.vectorstore:
                raise ValueError("Vector store not initialized")
            
            docs = self.vectorstore.similarity_search(query, k=k)
            return docs
            
        except Exception as e:
            print(f"❌ Error searching documents: {e}")
            return []
    
    def get_conversation_history(self) -> List[Dict[str, str]]:
        """
        Get the current conversation history.
        
        Returns:
            List of conversation turns
        """
        if not self.memory:
            return []
        
        history = []
        for message in self.memory.chat_memory.messages:
            if isinstance(message, HumanMessage):
                history.append({"role": "user", "content": message.content})
            elif isinstance(message, AIMessage):
                history.append({"role": "assistant", "content": message.content})
        
        return history
    
    def clear_memory(self):
        """Clear the conversation memory."""
        if self.memory:
            self.memory.clear()
            print("✅ Conversation memory cleared")
    
    def get_index_stats(self) -> Dict[str, Any]:
        """
        Get statistics about the vector store index.
        
        Returns:
            Dictionary with index statistics
        """
        try:
            if not self.pc:
                return {"error": "Pinecone client not initialized"}
            
            # Get index info
            index = self.pc.Index(self.index_name)
            stats = index.describe_index_stats()
            
            return {
                "index_name": self.index_name,
                "total_vector_count": stats.get("total_vector_count", 0),
                "dimension": stats.get("dimension", 0),
                "namespaces": stats.get("namespaces", {}),
                "index_fullness": stats.get("index_fullness", 0)
            }
            
        except Exception as e:
            return {"error": f"Could not get index stats: {e}"}


def main():
    """Main function to run the RAG agent interactively."""
    print("🤖 Initializing RAG Agent...")
    
    try:
        # Initialize the agent
        agent = RAGAgent()
        
        # Get index stats
        stats = agent.get_index_stats()
        if "error" not in stats:
            print(f"📊 Index Stats: {stats['total_vector_count']} documents indexed")
        
        print("\n" + "="*50)
        print("🎯 RAG Agent Ready! Ask me anything about your documents.")
        print("Commands:")
        print("  - Type 'history' to see conversation history")
        print("  - Type 'clear' to clear conversation memory")
        print("  - Type 'stats' to see index statistics")
        print("  - Type 'quit' or 'exit' to end the session")
        print("="*50 + "\n")
        
        while True:
            try:
                # Get user input
                user_input = input("🤔 You: ").strip()
                
                if not user_input:
                    continue
                
                # Handle commands
                if user_input.lower() in ['quit', 'exit']:
                    print("👋 Goodbye!")
                    break
                elif user_input.lower() == 'history':
                    history = agent.get_conversation_history()
                    if history:
                        print("\n📜 Conversation History:")
                        for i, turn in enumerate(history, 1):
                            print(f"{i}. {turn['role'].title()}: {turn['content'][:100]}...")
                    else:
                        print("📜 No conversation history yet.")
                    continue
                elif user_input.lower() == 'clear':
                    agent.clear_memory()
                    continue
                elif user_input.lower() == 'stats':
                    stats = agent.get_index_stats()
                    print(f"\n📊 Index Statistics: {json.dumps(stats, indent=2)}")
                    continue
                
                # Get response
                print("🤖 Thinking...")
                response = agent.ask(user_input)
                
                # Display response
                print(f"\n🤖 Assistant: {response['answer']}")
                
                # Display sources if available
                if 'sources' in response and response['sources']:
                    print(f"\n📚 Sources ({len(response['sources'])} documents):")
                    for i, source in enumerate(response['sources'], 1):
                        print(f"{i}. {source['type'].title()} - {source['source']}")
                        print(f"   {source['content'][:150]}...")
                
                print("\n" + "-"*50)
                
            except KeyboardInterrupt:
                print("\n👋 Goodbye!")
                break
            except Exception as e:
                print(f"❌ Error: {e}")
    
    except Exception as e:
        print(f"❌ Failed to initialize RAG Agent: {e}")
        print("Please check your environment variables and Pinecone setup.")


if __name__ == "__main__":
    main()
