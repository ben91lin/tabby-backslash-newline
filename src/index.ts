// src/index.ts - 使用正確的 Tabby API
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

// 型別定義
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
        // 延遲初始化以確保 ConfigProvider 已經被處理
        setTimeout(() => this.init(), 100)
    }

    private init() {
        console.log('初始化 Shift+Enter 熱鍵處理器')
        this.hotkeys.matchedHotkey.subscribe(hotkey => {
            if (hotkey === 'shift-enter-newline') {
                this.handleShiftEnter()
            }
        })
    }

    private handleShiftEnter() {
        console.log('Shift+Enter triggered for backslash newline')
        
        const activeTab = this.app.activeTab
        console.log('當前標籤:', activeTab?.constructor.name)
        
        // 統一處理：取得實際的終端標籤
        const terminal = this.getActiveTerminal(activeTab)
        if (terminal) {
            this.sendBackslashNewline(terminal)
        } else {
            console.log('沒有找到可用的終端標籤')
        }
    }

    private getActiveTerminal(tab: BaseTabComponent | null): TerminalTab | null {
        if (!tab) {
            console.log('沒有活動標籤')
            return null
        }
        
        // 檢查是否有 getFocusedTab 方法（容器組件）
        const container = tab as any
        if (typeof container.getFocusedTab === 'function') {
            try {
                const focusedTab = container.getFocusedTab()
                if (focusedTab && this.isTerminalTab(focusedTab)) {
                    console.log('使用 getFocusedTab() 找到終端:', focusedTab.constructor.name)
                    return focusedTab as TerminalTab
                }
            } catch (error) {
                console.log('getFocusedTab() 調用失敗:', error)
            }
        }
        
        // 檢查當前標籤本身是否為終端
        if (this.isTerminalTab(tab)) {
            console.log('直接使用終端標籤:', tab.constructor.name)
            return tab as TerminalTab
        }
        
        console.log('標籤不是終端也沒有 getFocusedTab 方法:', tab.constructor.name)
        return null
    }
    
    private isTerminalTab(tab: BaseTabComponent | null): boolean {
        if (!tab) return false
        const terminalTab = tab as any
        return !!(terminalTab.session || terminalTab.frontend || terminalTab.sendInput)
    }

    private sendBackslashNewline(tab: TerminalTab | BaseTabComponent | null) {
        if (!tab) {
            console.log('沒有標籤可用')
            return
        }
        
        const terminalTab = tab as TerminalTab

        const textToSend = ' \\' + os.EOL  // 空格 + 反斜線 + 系統換行符
        
        try {
            // 嘗試使用 session
            if (terminalTab.session) {
                terminalTab.session.write(Buffer.from(textToSend, 'utf8'))
                console.log('透過 session 發送:', textToSend.replace(/\r?\n/g, '\\n'))
                return
            }

            // 嘗試使用 frontend
            if (terminalTab.frontend && terminalTab.frontend.write) {
                terminalTab.frontend.write(textToSend)
                console.log('透過 frontend 發送:', textToSend.replace(/\r?\n/g, '\\n'))
                return
            }

            // 嘗試使用 sendInput
            if (typeof terminalTab.sendInput === 'function') {
                terminalTab.sendInput(textToSend)
                console.log('透過 sendInput 發送:', textToSend.replace(/\r?\n/g, '\\n'))
                return
            }

            console.log('找不到可用的發送方法')
            console.log('標籤屬性:', Object.keys(terminalTab).filter(key => !key.startsWith('_')))
            
        } catch (error) {
            console.log('發送時出錯:', error)
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
        console.log('Shift+Enter backslash newline 模組載入')
    }
}