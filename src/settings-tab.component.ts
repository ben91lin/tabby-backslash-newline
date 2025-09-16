import { Component } from '@angular/core'
import { ConfigService } from 'tabby-core'

@Component({
    template: `
        <h3>Backslash Newline Settings</h3>
        <div class="form-group">
            <label>Custom Text to Send:</label>
            <div class="input-group">
                <input
                    type="text"
                    class="form-control"
                    [(ngModel)]="customText"
                    (input)="onTextChange()"
                    placeholder="Enter custom text (e.g., \\\\\\n)"
                />
                <div class="input-group-append">
                    <button class="btn btn-outline-secondary" type="button" (click)="resetToDefault()">
                        Reset
                    </button>
                </div>
            </div>
            <small class="form-text text-muted">
                Enter the text to send when hotkey is pressed. Use \\\\n for newline, \\\\t for tab, \\\\\\\\ for backslash.
                <span class="text-success" *ngIf="saveStatus">✓ Settings saved automatically</span>
            </small>
        </div>
        <div class="form-group">
            <label>Preview:</label>
            <code class="form-control-plaintext bg-light p-2 rounded">{{getPreviewText()}}</code>
        </div>
        <div class="form-group">
            <div class="alert alert-info">
                <strong><i class="fas fa-info-circle"></i> How to use:</strong>
                <ol class="mb-0 mt-2">
                    <li>Configure your custom text above</li>
                    <li>Go to Settings → Hotkeys</li>
                    <li>Find "Send configured custom text"</li>
                    <li>Set your preferred hotkey (default: Shift+Enter)</li>
                    <li>Press the hotkey in any terminal to send your custom text</li>
                </ol>
            </div>
        </div>
    `,
})
export class BackslashNewlineSettingsTabComponent {
    customText: string = ' \\\n'
    saveStatus: boolean = false
    private readonly defaultText = ' \\\n'

    constructor(private config: ConfigService) {
        this.customText = this.config.store?.backslashNewline?.customText || this.defaultText
    }

    onTextChange() {
        // 直接設定配置值
        if (!this.config.store.backslashNewline) {
            (this.config.store as any).backslashNewline = {}
        }
        (this.config.store as any).backslashNewline.customText = this.customText
        this.config.save()

        // Show save status for 2 seconds
        this.saveStatus = true
        setTimeout(() => {
            this.saveStatus = false
        }, 2000)
    }

    resetToDefault() {
        this.customText = this.defaultText
        this.onTextChange()
    }

    getPreviewText(): string {
        return this.customText
            .replace(/\\\\/g, '\\')
            .replace(/\\n/g, '⏎')
            .replace(/\\t/g, '→')
            .replace(/ /g, '·')
    }
}