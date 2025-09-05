# Tabby Shift+Enter Plugin

A Tabby terminal plugin that adds Shift+Enter hotkey functionality to send a backslash newline (`\\\n`) in terminal sessions.

## Features

- **Shift+Enter Hotkey**: Press Shift+Enter to send `\\\n` to the active terminal
- **Multi-tab Support**: Works across all terminal tabs and split views
- **Smart Terminal Detection**: Automatically finds the active terminal instance, including in split views

## Installation

1. Clone this repository
2. Install dependencies: `npm install`
3. Build the plugin: `npx tsc`
4. Copy the `dist` folder to your Tabby plugins directory

## Development

### Build Commands

```bash
# Compile TypeScript to JavaScript
npx tsc

# Watch mode for development
npx tsc --watch
```

### Project Structure

```
src/
├── index.ts          # Main plugin entry point
└── ...
dist/                 # Compiled output
package.json          # Dependencies and build config
tsconfig.json         # TypeScript configuration
```

## How It Works

The plugin integrates with Tabby's architecture through:

1. **HotkeyProvider**: Registers the `shift-enter-newline` hotkey
2. **ShiftEnterHandler**: Handles the hotkey event and sends `\\\n` to the terminal
3. **Terminal Detection**: Finds the active terminal, including special handling for split views

## Requirements

- Tabby Terminal v1.0.0 or higher
- Node.js and npm for building

## License

MIT License