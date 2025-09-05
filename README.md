# Tabby Backslash Newline Plugin

A Tabby terminal plugin that enables line continuation in terminal sessions by adding Shift+Enter hotkey to send backslash newline (`\\\n`) sequences. Perfect for writing multi-line shell commands, scripts, and command-line operations.

## Features

- **Line Continuation**: Press Shift+Enter to send ` \\\n` (space + backslash + newline) for continuing commands across multiple lines
- **Shell Scripting Support**: Perfect for writing long commands, complex pipes, and multi-line shell scripts
- **Multi-tab Support**: Works across all terminal tabs and split views  
- **Smart Terminal Detection**: Automatically finds the active terminal instance, including in split views
- **Cross-platform**: Uses system-appropriate line endings (Windows/Unix compatible)

## Installation

### Via Tabby Plugin Manager (Recommended)

1. Open Tabby
2. Go to **Settings** → **Plugins**
3. Search for "**Backslash Newline**"
4. Click **Install**

### Manual Installation

```bash
npm install -g tabby-backslash-newline
```

### Development Installation

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

The plugin sends a **space + backslash + newline** sequence (` \\\n`) when you press Shift+Enter, which is the standard shell syntax for line continuation. This allows you to:

- Break long commands across multiple lines for better readability
- Write complex shell scripts interactively
- Continue pipe chains and command sequences
- Maintain proper shell escaping and formatting

**Example usage:**
```bash
# Instead of this long one-liner:
find /path -name "*.js" -type f -exec grep -l "function" {} \; | xargs wc -l

# Write it across multiple lines with Shift+Enter:
find /path -name "*.js" -type f \\
  -exec grep -l "function" {} \; \\
  | xargs wc -l
```

### Technical Implementation

1. **HotkeyProvider**: Registers the `shift-enter-newline` hotkey with Tabby
2. **ShiftEnterHandler**: Handles the hotkey event and sends the continuation sequence
3. **Terminal Detection**: Finds the active terminal, including special handling for split views

## Use Cases

- **Long Commands**: Break complex commands with many options across multiple lines
- **Shell Scripts**: Write and test multi-line scripts interactively
- **Pipe Chains**: Create readable command pipelines
- **Configuration**: Multi-line environment variable definitions and exports

## Requirements

- Tabby Terminal v1.0.0 or higher
- Node.js and npm for building

## License

MIT License