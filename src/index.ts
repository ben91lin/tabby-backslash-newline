// src/index.ts - Tabby Shift+Enter plugin
import { NgModule, Injectable } from '@angular/core'
import { FormsModule } from '@angular/forms'
import {
    HotkeyDescription,
    HotkeyProvider,
    HotkeysService,
    AppService,
    ConfigProvider,
    ConfigService,
    BaseTabComponent
} from 'tabby-core'
import { SettingsTabProvider } from 'tabby-settings'

// Import our components
import { BackslashNewlineSettingsTabComponent } from './settings-tab.component'
import { BackslashNewlineSettingsTabProvider } from './settings-tab-provider'

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
export class BackslashNewlineConfigProvider extends ConfigProvider {
    defaults = {
        hotkeys: {
            'shift-enter-newline': ['Shift-Enter'],
        },
        backslashNewline: {
            customText: ' \\\n',
        },
    }
}

@Injectable()
export class BackslashNewlineHotkeyProvider extends HotkeyProvider {
    async provide(): Promise<HotkeyDescription[]> {
        return [
            {
                id: 'shift-enter-newline',
                name: 'Send configured custom text',
            },
        ]
    }
}

@Injectable()
export class BackslashNewlineHandler {
    constructor(
        private hotkeys: HotkeysService,
        private app: AppService,
        private config: ConfigService
    ) {
        // Delayed initialization to ensure ConfigProvider is ready
        setTimeout(() => this.init(), 100)
    }

    private init() {
        this.hotkeys.matchedHotkey.subscribe(hotkey => {
            if (hotkey === 'shift-enter-newline') {
                this.handleBackslashNewline()
            }
        })
    }

    private handleBackslashNewline() {
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

        // 從配置中讀取自訂文字，如果沒有則使用預設值
        const customText = this.config.store?.backslashNewline?.customText || ' \\\n'
        const textToSend = this.processEscapeSequences(customText)
        
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

    private processEscapeSequences(text: string): string {
        return text
            .replace(/\\n/g, '\n')       // 換行符
            .replace(/\\t/g, '\t')       // Tab 字元
            .replace(/\\r/g, '\r')       // 回車符
            .replace(/\\\\/g, '\\')      // 反斜線（必須放在最後）
    }
}

@NgModule({
    imports: [FormsModule],
    declarations: [BackslashNewlineSettingsTabComponent],
    providers: [
        {
            provide: ConfigProvider,
            useClass: BackslashNewlineConfigProvider,
            multi: true,
        },
        {
            provide: HotkeyProvider,
            useClass: BackslashNewlineHotkeyProvider,
            multi: true,
        },
        {
            provide: SettingsTabProvider,
            useClass: BackslashNewlineSettingsTabProvider,
            multi: true,
        },
        BackslashNewlineHandler,
    ],
})
export default class BackslashNewlineModule {
    constructor(private handler: BackslashNewlineHandler) {
    }
}