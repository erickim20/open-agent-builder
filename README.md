# Open Agent Builder

A visual, no-code flow builder for creating and executing AI agent workflows. Build complex agent chains with an intuitive drag-and-drop interface, configure agent nodes with custom prompts and models, and execute flows seamlessly.

## 🔗 Links

- **Live Demo**: [agent.raumlabs.com](https://agent.raumlabs.com)
- **GitHub Repository**: [github.com/erickim20/open-agent-builder](https://github.com/erickim20/open-agent-builder.git)

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

## 📋 Roadmap & TODO

### Core Components

#### ✅ Completed
- [x] **Agent** - AI agent node with configurable prompts and models
- [x] **End** - Exit point for flows
- [x] **Note** - Annotation/documentation nodes

#### 🚧 In Progress / Planned

- [ ] **Classify** - Classification node for categorizing inputs
  - [ ] Create ClassifyNode component
  - [ ] Add classification configuration panel
  - [ ] Implement classification logic in runtime
  - [ ] Add ClassifyNodeCard to node palette
  - [ ] Support multiple classification categories
  - [ ] Add confidence scoring

### Tools

- [ ] **File Search** - Search and retrieve files from filesystem or storage
  - [ ] Create FileSearchNode component
  - [ ] Implement file search functionality
  - [ ] Add file path/pattern configuration
  - [ ] Support file content extraction
  - [ ] Add file filtering options
  - [ ] Integrate with runtime execution

- [ ] **Guardrails** - Content moderation and safety checks
  - [ ] Create GuardrailsNode component
  - [ ] Implement content filtering logic
  - [ ] Add configurable guardrail rules
  - [ ] Support custom moderation policies
  - [ ] Add violation handling and routing
  - [ ] Integrate with external moderation APIs (optional)

- [ ] **MCP (Model Context Protocol)** - Integration with MCP servers
  - [ ] Create MCPNode component
  - [ ] Implement MCP client connection
  - [ ] Add MCP server configuration
  - [ ] Support MCP resource access
  - [ ] Add MCP tool execution
  - [ ] Handle MCP errors and retries

### Logic Components

- [ ] **If / Else** - Conditional branching logic
  - [ ] Create IfElseNode component
  - [ ] Add condition expression builder
  - [ ] Implement conditional routing in runtime
  - [ ] Support multiple output paths (true/false)
  - [ ] Add condition validation
  - [ ] Visual indicators for active branch

- [ ] **While** - Loop/iteration node
  - [ ] Create WhileNode component
  - [ ] Implement loop condition evaluation
  - [ ] Add loop iteration limits
  - [ ] Support break/continue logic
  - [ ] Add loop variable tracking
  - [ ] Prevent infinite loops with max iterations

- [ ] **User Approval** - Human-in-the-loop approval step
  - [ ] Create UserApprovalNode component
  - [ ] Implement approval request UI
  - [ ] Add approval timeout handling
  - [ ] Support approval/rejection routing
  - [ ] Add approval history tracking
  - [ ] Email/notification integration (optional)

### Data Components

- [ ] **Transform** - Data transformation and manipulation
  - [ ] Create TransformNode component
  - [ ] Add transformation expression builder
  - [ ] Support common transformations (map, filter, reduce)
  - [ ] Add data validation
  - [ ] Support JSON/object manipulation
  - [ ] Add transformation preview

- [ ] **Set State** - State management and variable assignment
  - [ ] Create SetStateNode component
  - [ ] Implement flow-level state management
  - [ ] Add variable assignment UI
  - [ ] Support different data types
  - [ ] Add state persistence
  - [ ] Implement state access in other nodes

### Multi-Model Support

- [ ] **Multi-Model Agent Configuration**
  - [ ] Add support for multiple models per agent node
  - [ ] Implement model fallback/retry logic
  - [ ] Add model comparison/selection UI
  - [ ] Support model-specific configurations
  - [ ] Add model performance tracking

- [ ] **Model Providers**
  - [ ] Add Anthropic Claude support
  - [ ] Add Google Gemini support
  - [ ] Add Cohere support
  - [ ] Add local model support (Ollama, etc.)
  - [ ] Add custom API endpoint support
  - [ ] Implement provider-specific configurations

- [ ] **Model Selection Strategy**
  - [ ] Add automatic model selection based on task
  - [ ] Implement cost-based model selection
  - [ ] Add performance-based model routing
  - [ ] Support A/B testing between models

### Triggers & Automation

- [ ] **GitHub Triggers**
  - [ ] Create GitHub trigger node
  - [ ] Implement GitHub webhook integration
  - [ ] Support commit event triggers
  - [ ] Support pull request triggers
  - [ ] Support issue event triggers
  - [ ] Add GitHub authentication
  - [ ] Filter events by branch/repository

- [ ] **Webhook Triggers**
  - [ ] Create generic webhook trigger node
  - [ ] Add webhook endpoint generation
  - [ ] Support custom webhook payloads
  - [ ] Add webhook authentication
  - [ ] Implement webhook validation

- [ ] **Schedule Triggers**
  - [ ] Create schedule trigger node
  - [ ] Add cron expression support
  - [ ] Support one-time scheduled runs
  - [ ] Add timezone configuration
  - [ ] Implement schedule management UI

- [ ] **API Triggers**
  - [ ] Create API trigger node
  - [ ] Add REST API endpoint support
  - [ ] Support GraphQL triggers
  - [ ] Add request/response schema validation
  - [ ] Implement API authentication

- [ ] **Event Triggers**
  - [ ] Create event trigger node
  - [ ] Support custom event types
  - [ ] Add event filtering
  - [ ] Implement event queue management
  - [ ] Add event history tracking

### Infrastructure & Improvements

- [ ] **Runtime Enhancements**
  - [ ] Improve error handling and recovery
  - [ ] Add flow execution history
  - [ ] Implement flow debugging tools
  - [ ] Add execution performance metrics
  - [ ] Support parallel node execution

- [ ] **UI/UX Improvements**
  - [ ] Add node templates/presets
  - [ ] Implement flow validation
  - [ ] Add flow testing/debugging mode
  - [ ] Improve node connection visualization
  - [ ] Add keyboard shortcuts
  - [ ] Implement undo/redo functionality

- [ ] **Storage & Persistence**
  - [ ] Add cloud storage integration
  - [ ] Support flow versioning
  - [ ] Add flow sharing/collaboration
  - [ ] Implement flow templates library
  - [ ] Add export to various formats

- [ ] **Documentation**
  - [ ] Add component usage examples
  - [ ] Create flow templates documentation
  - [ ] Add API documentation
  - [ ] Create video tutorials
  - [ ] Add best practices guide

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
