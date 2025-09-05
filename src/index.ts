// src/index.ts - Tabby Shift+Enter plugin
import { NgModule, Injectable } from '@angular/core'
import { 
    HotkeyDescription, 
    HotkeyProvider, 
    HotkeysService,
    AppService,
    ConfigProvider,
    BaseTabComponent
} from 'tabby-core'
import * as os from 'os'

// Type definitions
interface SplitTabComponent extends BaseTabComponent {
    getFocusedTab(): BaseTabComponent | null
    focusedTab?: BaseTabComponent
}

interface TerminalTab extends BaseTabComponent {
    session?: any
    frontend?: { write?: (data: string) => void }
    sendInput?: (data: string) => void
}

@Injectable()
export class ShiftEnterConfigProvider extends ConfigProvider {
    defaults = {
        hotkeys: {
            'shift-enter-newline': ['Shift-Enter'],
        },
    }
}

@Injectable()
export class ShiftEnterHotkeyProvider extends HotkeyProvider {
    async provide(): Promise<HotkeyDescription[]> {
        return [
            {
                id: 'shift-enter-newline',
                name: 'Send backslash newline with Shift+Enter',
            },
        ]
    }
}

@Injectable()
export class ShiftEnterHandler {
    constructor(
        private hotkeys: HotkeysService,
        private app: AppService
    ) {
        // Delayed initialization to ensure ConfigProvider is ready
        setTimeout(() => this.init(), 100)
    }

    private init() {
        this.hotkeys.matchedHotkey.subscribe(hotkey => {
            if (hotkey === 'shift-enter-newline') {
                this.handleShiftEnter()
            }
        })
    }

    private handleShiftEnter() {
        const activeTab = this.app.activeTab
        
        // 統一處理：取得實際的終端標籤
        const terminal = this.getActiveTerminal(activeTab)
        if (terminal) {
            this.sendBackslashNewline(terminal)
        } else {
        }
    }

    private getActiveTerminal(tab: BaseTabComponent | null): TerminalTab | null {
        if (!tab) {
            return null
        }
        
        // 檢查是否有 getFocusedTab 方法（容器組件）
        const container = tab as any
        if (typeof container.getFocusedTab === 'function') {
            try {
                const focusedTab = container.getFocusedTab()
                if (focusedTab && this.isTerminalTab(focusedTab)) {
                    return focusedTab as TerminalTab
                }
            } catch (error) {
                console.error('getFocusedTab() failed:', error)
            }
        }
        
        // Check if current tab is a terminal
        if (this.isTerminalTab(tab)) {
            return tab as TerminalTab
        }
        
        return null
    }
    
    private isTerminalTab(tab: BaseTabComponent | null): boolean {
        if (!tab) return false
        const terminalTab = tab as any
        return !!(terminalTab.session || terminalTab.frontend || terminalTab.sendInput)
    }

    private sendBackslashNewline(tab: TerminalTab | BaseTabComponent | null) {
        if (!tab) {
            return
        }
        
        const terminalTab = tab as TerminalTab

        const textToSend = ' \\' + os.EOL  // 空格 + 反斜線 + 系統換行符
        
        try {
            // Try using session
            if (terminalTab.session) {
                terminalTab.session.write(Buffer.from(textToSend, 'utf8'))
                return
            }

            // Try using frontend
            if (terminalTab.frontend && terminalTab.frontend.write) {
                terminalTab.frontend.write(textToSend)
                return
            }

            // Try using sendInput
            if (typeof terminalTab.sendInput === 'function') {
                terminalTab.sendInput(textToSend)
                return
            }

            console.error('No available send method found')
            console.error('Tab properties:', Object.keys(terminalTab).filter(key => !key.startsWith('_')))
            
        } catch (error) {
            console.error('Error sending backslash newline:', error)
        }
    }
}

@NgModule({
    providers: [
        {
            provide: ConfigProvider,
            useClass: ShiftEnterConfigProvider,
            multi: true,
        },
        {
            provide: HotkeyProvider,
            useClass: ShiftEnterHotkeyProvider,
            multi: true,
        },
        ShiftEnterHandler,
    ],
})
export default class ShiftEnterModule {
    constructor(private handler: ShiftEnterHandler) {
    }
}