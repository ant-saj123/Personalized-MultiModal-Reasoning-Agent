# PM Copilot Frontend

A modern, responsive React frontend for the PM Copilot - an AI-powered product management assistant with RAG capabilities.

## Features

- 🤖 **AI Chat Interface** - Interactive conversations with the PM Assistant
- 📚 **Document Search** - Search through your knowledge base with semantic similarity
- 📊 **Analytics Dashboard** - Monitor usage statistics and system health
- 📝 **Conversation History** - Track and manage chat sessions
- 🌙 **Dark Mode** - Professional dark theme optimized for long sessions
- 📱 **Responsive Design** - Works seamlessly across all devices

## Tech Stack

- **React 18** with TypeScript
- **Vite** for fast development
- **Tailwind CSS** with custom design system
- **Shadcn/ui** components
- **TanStack Query** for API state management
- **React Router** for navigation
- **Lucide React** for icons

## Quick Start

### Prerequisites

- Node.js 18+
- npm or yarn
- Backend API running on port 8000

### Installation

1. **Install dependencies:**
   ```bash
   cd frontend
   npm install
   ```

2. **Start development server:**
   ```bash
   npm run dev
   ```

3. **Open in browser:**
   Navigate to `http://localhost:3000`

### Backend Connection

The frontend connects to your FastAPI backend at `http://localhost:8000`. Make sure your backend is running before starting the frontend.

## Project Structure

```
frontend/
├── src/
│   ├── components/          # Reusable UI components
│   │   ├── ui/             # Shadcn/ui components
│   │   ├── ChatInterface.tsx
│   │   ├── DocumentSearch.tsx
│   │   ├── StatsPanel.tsx
│   │   └── HistoryPanel.tsx
│   ├── lib/
│   │   ├── api.ts          # API client and types
│   │   └── utils.ts        # Utility functions
│   ├── pages/              # Page components
│   └── App.tsx             # Main application component
├── public/                 # Static assets
└── package.json
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## API Integration

The frontend integrates with all backend endpoints:

- **POST /chat** - Send messages to the AI assistant
- **POST /search** - Search documents in the knowledge base
- **GET /stats** - Retrieve system statistics
- **GET /history** - Get conversation history
- **DELETE /history** - Clear conversation history
- **GET /health** - Health check

## Design System

The app uses a custom design system built on Tailwind CSS with:

- **Dark theme** optimized for professional use
- **Purple accent colors** for primary actions
- **Glass morphism effects** for modern aesthetics
- **Semantic color tokens** for consistent theming
- **Responsive typography** scales

## Development

### Adding New Components

1. Create component in `src/components/`
2. Use TypeScript for type safety
3. Follow the existing design patterns
4. Add to the appropriate route if needed

### Styling Guidelines

- Use Tailwind CSS classes
- Prefer semantic color tokens from the design system
- Ensure dark mode compatibility
- Test responsive behavior

## Deployment

1. **Build the application:**
   ```bash
   npm run build
   ```

2. **Deploy the `dist` folder** to your hosting provider

3. **Configure environment variables** if needed for production API endpoints

## Contributing

1. Follow the existing code style
2. Add TypeScript types for new features
3. Test responsive design
4. Ensure accessibility standards

## License

This project is part of the PM Copilot suite. See the main repository for licensing information.