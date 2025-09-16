import { Injectable } from '@angular/core'
import { SettingsTabProvider } from 'tabby-settings'
import { BackslashNewlineSettingsTabComponent } from './settings-tab.component'

@Injectable()
export class BackslashNewlineSettingsTabProvider extends SettingsTabProvider {
    id = 'backslash-newline'
    icon = 'fas fa-keyboard'
    title = 'Backslash Newline'
    weight = 10

    getComponentType() {
        return BackslashNewlineSettingsTabComponent
    }
}