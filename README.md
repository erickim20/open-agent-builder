# Open Agent Builder

A visual, no-code flow builder for creating and executing AI agent workflows. Build complex agent chains with an intuitive drag-and-drop interface, configure agent nodes with custom prompts and models, and execute flows seamlessly.

## ✨ Features

- **Visual Flow Builder**: Drag-and-drop interface for creating agent workflows
- **Multiple Flow Management**: Create, switch between, and manage multiple flows
- **Agent Configuration**: Configure agent nodes with:
  - Model selection (GPT-4, GPT-4 Mini, etc.)
  - Custom system prompts
  - Temperature and max tokens settings
- **Flow Execution**: Run flows end-to-end with real-time execution
- **Import/Export**: Save and share flows as JSON
- **Local Storage**: Automatic saving to browser localStorage
- **Modern UI**: Built with shadcn/ui components and Tailwind CSS
- **Type-Safe**: Full TypeScript support

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ and npm

### Installation

1. Clone the repository:

```bash
git clone https://github.com/erickim20/open-agent-builder.git
cd open-agent-builder
```

2. Install dependencies:

```bash
npm install
```

3. Start the development server:

```bash
npm run dev
```

4. Open your browser and navigate to `http://localhost:5173`

## 📖 Usage

### Creating a Flow

1. Click the "New Flow" button in the toolbar to create a new flow
2. Use the node palette on the left to add nodes:
   - **Start**: Entry point for your flow
   - **Agent**: AI agent node with configurable prompts and models
   - **End**: Exit point for your flow
3. Connect nodes by dragging from one node's output to another node's input
4. Click on a node to configure it in the right panel

### Configuring Agent Nodes

1. Select an agent node
2. Configure the following settings:
   - **Model**: Choose the AI model (e.g., GPT-4, GPT-4 Mini)
   - **System Prompt**: Define the agent's behavior and instructions
   - **Temperature**: Control randomness (0.0 - 1.0)
   - **Max Tokens**: Set the maximum response length

### Running a Flow

1. Click the play button (▶️) in the toolbar
2. Enter the input prompt for the Start node
3. Watch the flow execute step by step
4. View results for each agent node

### Managing Flows

- **Switch Flows**: Use the flow switcher dropdown in the toolbar
- **Export Flow**: Click the menu (⋯) → Export to download as JSON
- **Import Flow**: Click the menu (⋯) → Import to load a saved flow
- **Delete Flow**: Click the menu (⋯) → Delete Flow (requires at least one flow to remain)

### API Key Configuration

1. Click the key icon (🔑) in the toolbar
2. Enter your OpenAI API key
3. The key is stored locally in your browser

## 🛠️ Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint
- `npm run format` - Format code with Prettier
- `npm run typecheck` - Run TypeScript type checking

### Adding shadcn/ui Components

To add new shadcn/ui components:

```bash
npx shadcn@latest add [component-name]
```

For example:

```bash
npx shadcn@latest add button
npx shadcn@latest add card
```

Components will be added to `src/components/ui/` directory.

## 🏗️ Tech Stack

- **React 18** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server
- **Tailwind CSS** - Styling
- **shadcn/ui** - UI component library
- **@xyflow/react** - Flow diagram library
- **React Hook Form** - Form management
- **Zod** - Schema validation
- **Sonner** - Toast notifications

## 📁 Project Structure

```
src/
├── components/
│   ├── flow/          # Flow builder components
│   ├── ui/            # shadcn/ui components
│   └── ThemeProvider.tsx
├── hooks/             # Custom React hooks
├── lib/               # Utility functions
│   ├── flowStorage.ts # Local storage management
│   └── runtime.ts     # Flow execution engine
├── types/             # TypeScript type definitions
│   └── flow.ts        # Flow data models
└── App.tsx            # Main application component
```

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines

- Follow the existing code style
- Write meaningful commit messages
- Add tests for new features when applicable
- Update documentation as needed
- Ensure all linting and type checks pass

## 📝 License

This project is open source and available under the [MIT License](LICENSE).

## 🙏 Acknowledgments

- Built with [shadcn/ui](https://ui.shadcn.com/)
- Flow visualization powered by [React Flow](https://reactflow.dev/)
- Icons from [Lucide](https://lucide.dev/)

## 📧 Support

For issues, questions, or contributions, please open an issue on GitHub.

---

Made with ❤️ by RaumLabs
