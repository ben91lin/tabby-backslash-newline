# CLAUDE.md

**KEEP IT SIMPLE**
This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Tabby terminal plugin that adds Shift+Enter hotkey functionality to send a backslash newline (`\\\n`) in terminal sessions. The plugin is built using Angular and TypeScript, following Tabby's plugin architecture.

## Build Commands

```bash
# Compile TypeScript to JavaScript
npx tsc

# Watch mode for development
npx tsc --watch
```

## Architecture

### Key Components

1. **ShiftEnterHotkeyProvider** (src/index.ts:11-20): Registers the `shift-enter-newline` hotkey with Tabby's hotkey system
2. **ShiftEnterHandler** (src/index.ts:23-135): Core logic that handles the Shift+Enter event and sends `\\\n` to active terminal
3. **ShiftEnterModule** (src/index.ts:147-151): Angular module that registers providers and initializes the handler

### Integration with Tabby

The plugin integrates with Tabby through:
- `HotkeyProvider`: Multi-provider pattern to register custom hotkeys
- `HotkeysService`: Subscribe to hotkey events
- `AppService`: Access active tabs and terminal sessions
- Terminal session access via `tab.session`, `tab.frontend`, or `tab.sendInput`

### Special Handling

The plugin includes specific logic for SplitTabComponent (split terminal windows) in `findTerminalInSplit()` method, which searches through various properties to locate the actual terminal instance within a split view.

## Dependencies

- **tabby-core**: Core Tabby APIs for hotkeys and app services
- **tabby-terminal**: Terminal-specific functionality
- **@angular/core**: Angular framework (required by Tabby)
- **TypeScript 4.9.5**: Development dependency

## Output

Compiled JavaScript and TypeScript declarations are output to `dist/` directory.