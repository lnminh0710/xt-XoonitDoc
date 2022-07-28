import { Component, Input, ChangeDetectorRef } from '@angular/core';
import { AppSelectors } from '../../../state-management/store/reducer/app';
import { takeUntil } from 'rxjs/operators';
import { HotKey } from '../../../models';
import { BaseComponent } from '../../../pages/private/base';
import { Router } from '@angular/router';
import { FormControl, Validators } from '@angular/forms';

@Component({
    selector: 'hotkey-setting',
    templateUrl: './hotkey-setting.component.html',
    styleUrls: ['./hotkey-setting.component.scss']
})
export class HotKeySettingComponent extends BaseComponent {

    private timeOutHotKey;
    public hasHandlerKey: boolean = false;
    public hasLetterKey: boolean = false;
    public isHotKeyActive: boolean;
    public deferHotKeyDisplay: boolean;
    public isShowHotkeyDialog: boolean;

    @Input()
    controlKey: string = '';

    @Input()
    hotKey: string = '';    

    @Input() hotKeyValue: {
        key: string,
        value: string
    };

    public hotkeySettingControl = new FormControl('', [Validators.required]);

    constructor(protected router: Router,
        private appSelectors: AppSelectors,
        public ref: ChangeDetectorRef) {
        super(router);
    }

    public ngOnInit() {
        this.subscribe();
    }

    public ngOnDestroy() {
        super.onDestroy();
    }

    private subscribe() {
        this.appSelectors.hotKey$
            .pipe(
                takeUntil(this.getUnsubscriberNotifier())
            )
            .subscribe((hotkey: HotKey) => {
                if (hotkey) {
                    this.isHotKeyActive = hotkey.altKey;
                    // When user press combination of Alt + key, do not show the black circle
                    // We need to defer for displaying circle
                    if (this.isHotKeyActive) {
                        if (this.timeOutHotKey) {
                            clearTimeout(this.timeOutHotKey);
                            this.timeOutHotKey = 0;
                        }
                        this.timeOutHotKey = setTimeout(() => {
                            if (this.isHotKeyActive) {
                                this.deferHotKeyDisplay = true;
                                this.ref.detectChanges();
                            }
                        }, 300);
                    }
                    else {
                        this.deferHotKeyDisplay = false;
                    }
                }
                this.ref.detectChanges();
            });
    }

    public editHotkey($event) {
        $event.stopPropagation();
        this.isShowHotkeyDialog = true;
        this.ref.detectChanges();
    }

    public closeForm() {
        this.isShowHotkeyDialog = false;
    }
}
