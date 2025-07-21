# 🧠 PM Copilot – AI-Powered Product Management Assistant

PM Copilot is an intelligent agent designed to assist product managers by generating product strategy artifacts like PRDs, roadmap entries, metrics, and meeting notes — all based on your input. It references high-quality example documents to extract structure, patterns, and best practices.

Give it a feature idea like:

> "Add Slack integration to our task app"

And it can generate:

- 📄 A full PRD draft  
- 🛣️ Roadmap entry with timeline and dependencies  
- 📊 Success metrics (e.g., NPS, adoption, latency)  
- 📢 Internal or customer-facing release notes  
- 📅 Planning meeting agendas and follow-ups

---

## 🔧 Features

✅ **Context-Aware Agent** — Uses Retrieval-Augmented Generation (RAG) to pull examples from embedded docs for inspiration  
✅ **Intelligent Composition** — Synthesizes patterns from product examples to draft new content tailored to your prompt  
✅ **Chat Interface** — API-powered LLM chat experience with memory and traceable reasoning  
✅ **Multi-Modal Frontend** — TypeScript React frontend **already included** for easy user interaction

---

## 🛠️ Tech Stack

- **FastAPI** – High-performance Python backend  
- **LangChain + LangGraph** – Modular LLM agent orchestration and tracing  
- **OpenAI GPT-3.5** – Language model for response generation  
- **Pinecone** – Vector database for semantic document retrieval  
- **TypeScript** – Frontend using React (already included)

---

## 📈 Impact

- ⚡ Generates product drafts in seconds vs. hours of manual writing  
- 🔍 Reduces ambiguity by grounding responses in real example docs  
- 🧠 Enables new PMs to follow best practices with zero ramp-up  
- 🛠️ Built on 30 curated sample documents across PRDs, sprints, and roadmaps

---

## 🚀 Getting Started

1. Clone the repo  
2. Set up your `.env` with your OpenAI + Pinecone API keys  
3. Run `setup.py` to embed your example documents  
4. Start the API with `uvicorn api:app --reload`  
5. Start the TypeScript React frontend (see below) or chat via cURL/Postman

---

## 📂 Folder Structure

```
├── backend/
│   ├── api.py              # FastAPI backend server
│   ├── rag_agent.py        # RAG agent implementation
│   ├── setup.py            # Document ingestion script
│   └── copilot-data/       # Your documents (PRDs, sprints, roadmaps)
├── frontend/
│   ├── src/
│   │   ├── app/            # Next.js app directory
│   │   ├── components/     # React components (with shadcn/ui)
│   │   └── lib/            # Utilities and API service
│   └── package.json
└── README.md
```

---

## 🏃‍♂️ How to Run

### 1. Environment Setup

Create a `.env` file in the root directory:

```bash
# Pinecone
PINECONE_API_KEY=your_pinecone_api_key
PINECONE_ENVIRONMENT=your_pinecone_environment

# OpenAI
OPENAI_API_KEY=your_openai_api_key
```

### 2. Backend Setup

```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate
pip3 install fastapi uvicorn langchain-openai langchain-pinecone pinecone-client python-dotenv
python setup.py   # (run once to embed documents)
uvicorn api:app --reload
```

The backend will be available at `http://localhost:8000`

### 3. Frontend Setup (TypeScript React)

```bash
cd frontend
npm install
npm run dev
```

The frontend will be available at `http://localhost:3000`

---

## 🔧 API Endpoints

The backend provides these REST API endpoints:

- `GET /health` - Health check
- `POST /chat` - Send a message and get AI response
- `POST /search` - Search documents without AI response
- `GET /stats` - Get vector store statistics
- `GET /history` - Get conversation history
- `DELETE /history` - Clear conversation history

---

## 🎨 UI & Design System

- **Dark Mode**: Optimized for professional use
- **Glassmorphism**: Modern, semi-transparent UI effects
- **Responsive Design**: Works on desktop and mobile
- **shadcn/ui**: Component library for consistent, accessible UI
- **Tailwind CSS**: Utility-first styling
- **Purple accent colors** and semantic color tokens
- **Loading States**: Smooth animations during processing

---

## 📦 Frontend Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

---

## 🚀 Deployment

### Backend Deployment

The FastAPI backend can be deployed to:
- Heroku
- Railway
- DigitalOcean App Platform
- AWS/GCP/Azure

### Frontend Deployment

The Next.js frontend can be deployed to:
- Vercel (recommended)
- Netlify
- AWS Amplify

---

## 🔍 Troubleshooting

1. **Connection Error**: Make sure the backend is running on port 8000
2. **Pinecone Error**: Verify your Pinecone API key and environment
3. **OpenAI Error**: Check your OpenAI API key and billing
4. **Import Errors**: Ensure all dependencies are installed

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

---

## 📄 License

This project is licensed under the MIT License.

---

**Happy product managing with PM Copilot! 🚀** 