// src/index.ts - 使用正確的 Tabby API
import { NgModule, Injectable } from '@angular/core'
import { 
    HotkeyDescription, 
    HotkeyProvider, 
    HotkeysService,
    AppService,
    ConfigProvider
} from 'tabby-core'
import * as os from 'os'

@Injectable()
export class ShiftEnterConfigProvider extends ConfigProvider {
    defaults = {
        hotkeys: {
            'shift-enter-newline': ['Shift+Enter'],
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
        
        // 處理 SplitTabComponent
        if (activeTab?.constructor.name === 'SplitTabComponent') {
            // 直接從 SplitTabComponent 找到實際的終端
            const terminal = this.findTerminalInSplit(activeTab)
            if (terminal) {
                this.sendBackslashNewline(terminal)
                return
            }
        }
        
        // 一般情況處理
        this.sendBackslashNewline(activeTab)
    }

    private findTerminalInSplit(splitTab: any): any {
        // 嘗試各種可能的屬性來找到終端
        const props = ['getAllTabs', 'tabs', 'children', 'panes']
        
        for (const prop of props) {
            if (typeof splitTab[prop] === 'function') {
                try {
                    const tabs = splitTab[prop]()
                    if (Array.isArray(tabs)) {
                        for (const tab of tabs) {
                            if (tab.session || tab.frontend) {
                                console.log('在分割視窗中找到終端:', tab.constructor.name)
                                return tab
                            }
                        }
                    }
                } catch (e) {
                    console.log(`方法 ${prop} 調用失敗:`, e)
                }
            } else if (splitTab[prop] && Array.isArray(splitTab[prop])) {
                for (const tab of splitTab[prop]) {
                    if (tab.session || tab.frontend) {
                        console.log('在分割視窗中找到終端:', tab.constructor.name)
                        return tab
                    }
                }
            }
        }
        
        // 嘗試找到焦點標籤
        if (splitTab.focusedTab && (splitTab.focusedTab.session || splitTab.focusedTab.frontend)) {
            console.log('使用焦點標籤:', splitTab.focusedTab.constructor.name)
            return splitTab.focusedTab
        }
        
        console.log('SplitTabComponent 屬性:', Object.keys(splitTab))
        return null
    }

    private sendBackslashNewline(tab: any) {
        if (!tab) {
            console.log('沒有標籤可用')
            return
        }

        const textToSend = ' \\' + os.EOL  // 空格 + 反斜線 + 系統換行符
        
        try {
            // 嘗試使用 session
            if (tab.session) {
                tab.session.write(Buffer.from(textToSend, 'utf8'))
                console.log('透過 session 發送:', textToSend.replace(/\r?\n/g, '\\n'))
                return
            }

            // 嘗試使用 frontend
            if (tab.frontend && tab.frontend.write) {
                tab.frontend.write(textToSend)
                console.log('透過 frontend 發送:', textToSend.replace(/\r?\n/g, '\\n'))
                return
            }

            // 嘗試使用 sendInput
            if (typeof tab.sendInput === 'function') {
                tab.sendInput(textToSend)
                console.log('透過 sendInput 發送:', textToSend.replace(/\r?\n/g, '\\n'))
                return
            }

            console.log('找不到可用的發送方法')
            console.log('標籤屬性:', Object.keys(tab))
            
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