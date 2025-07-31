<!-- Use this file to provide workspace-specific custom instructions to Copilot. For more details, visit https://code.visualstudio.com/docs/copilot/copilot-customization#_use-a-githubcopilotinstructionsmd-file -->

# GarapaAgent Assistant - VS Code Extension

This is a VS Code extension project that implements an intelligent AI agent assistant with customizable roles and behaviors. Please use the get_vscode_api with a query as input to fetch the latest VS Code API references.

## Project Structure
- Chat functionality using VS Code's Language Model API (`vscode.lm`)
- Chat Participants API (`vscode.chat`) for interactive conversations
- Webview integration for custom UI components
- Command registration and activation events

## Key Features to Implement
1. **Chat Participant**: Register a custom chat participant for GarapaAgent assistance
2. **Language Model Integration**: Use VS Code's built-in language models
3. **Role System**: Customizable behavior through .mdc files in roles/ directory
4. **Webview Panel**: Custom chat interface with rich UI
5. **Context-Aware Responses**: Integrate with workspace files and projects
6. **Adaptive Intelligence**: Modify behavior based on active role

## Development Guidelines
- Use TypeScript for type safety
- Follow VS Code extension best practices
- Implement proper error handling for language model requests
- Use VS Code's theming system for consistent UI
- Handle user consent and quota limits properly
