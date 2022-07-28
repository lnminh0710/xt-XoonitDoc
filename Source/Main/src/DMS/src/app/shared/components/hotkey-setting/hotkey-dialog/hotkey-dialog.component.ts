import { Component, OnInit, Input, ChangeDetectorRef, ViewChild, TemplateRef, HostListener, Output, EventEmitter, NgZone } from '@angular/core';
import { AppSelectors } from '../../../../state-management/store/reducer/app';
import { HotKey, GlobalSettingModel, HotKeySetting } from '../../../../models';
import { BaseComponent } from '../../../../pages/private/base';
import { Router } from '@angular/router';
import { PopupService } from '@app/xoonit-share/components/global-popup/services/popup.service';
import { HeaderNoticeRef } from '../../../../xoonit-share/components/global-popup/components/header-popup/header-notice-ref';
import { FormControl, Validators } from '@angular/forms';
import { Uti, String } from '../../../../utilities';
import cloneDeep from 'lodash-es/cloneDeep';
import { Configuration, GlobalSettingConstant } from '../../../../app.constants';
import { GlobalSettingService } from '../../../../services';
import { Observable } from 'rxjs';
import { AppState } from '../../../../state-management/store';
import { Store } from '@ngrx/store';
import { HotKeySettingActions } from '../../../../state-management/store/actions';
import { PopupRef } from '../../../../xoonit-share/components/global-popup/popup-ref';

@Component({
    selector: 'hotkey-dialog',
    templateUrl: './hotkey-dialog.component.html',
    styleUrls: ['./hotkey-dialog.component.scss']
})
export class HotKeyDialogComponent extends BaseComponent {

    private popup: PopupRef<any>;
    private keyBuffer: Array<any> = [];
    private keyBufferKeep: Array<any> = [];
    private timeoutKeyUp: any;
    private currentGlobalSettingModel: any;
    private hotKeySetting: HotKeySetting = {};
    private dirty: boolean;

    @Input()
    controlKey: string = '';

    public hotKey: string = '';
    public hasHandlerKey: boolean = false;
    public hasLetterKey: boolean = false;
    public isHotKeyActive: boolean;
    public deferHotKeyDisplay: boolean;
    public hotKeySettingState: Observable<HotKeySetting>;

    @Input() hotKeyValue: {
        key: string,
        value: string
    };

    @Output() onClose: EventEmitter<boolean> = new EventEmitter<boolean>();
    @Output() onSuccessSaved: EventEmitter<any> = new EventEmitter<any>();

    @ViewChild('hotkeyPopup') hotkeyPopup: TemplateRef<any>;

    public hotkeySettingControl: FormControl;
    private consts: Configuration = new Configuration();

    @HostListener('document:keydown.out-zone', ['$event'])
    onKeyDown($event) {
        this.dirty = true;
        this.pushKeyDownIntoBuffer($event.keyCode);
        Uti.disabledEventPropagation($event);
    }

    @HostListener('document:keyup.out-zone', ['$event'])
    onKeyUp($event) {
        this.removeKeyUpIntoBuffer($event.keyCode);
        // Uti.disabledEventPropagation($event);
    }

    constructor(
        private store: Store<AppState>,
        protected router: Router,
        private globalSettingConstant: GlobalSettingConstant,
        private appSelectors: AppSelectors,
        private popupService: PopupService,
        private globalSettingService: GlobalSettingService,
        private hotKeySettingActions: HotKeySettingActions,
        public ref: ChangeDetectorRef) {
        super(router);
        this.hotKeySettingState = this.store.select(state => state.hotKeySettingtState.hotKeySetting);
        this.hotkeySettingControl = new FormControl(this.hotKey, [this.isValidHotkey()]);
    }

    public ngOnInit() {
        this.getHotKeySetting();
        this.subscribe();
    }

    /**
     * getHotKeySetting
     */
    private getHotKeySetting() {
        this.globalSettingService.getAllGlobalSettings(this.ofModule.idSettingsGUI).subscribe(
            data => this.getAllGlobalSettingSuccess(data)
        );
    }

    /**
     * getAllGlobalSettingSuccess
     * @param data
     */
    private getAllGlobalSettingSuccess(data: GlobalSettingModel[]) {
        if (!data || !data.length) {
            return;
        }
        this.currentGlobalSettingModel = data.find(x => x.globalName === this.getHotkeySettingName());
    }

    private isValidHotkey() {
        return (input: FormControl) => {
            if (!this.dirty) return null;

            let isValid: boolean = true;
            if (input.value
                && (
                    (!this.hasHandlerKey || !this.hasLetterKey)
                    || (this.hasHandlerKey && this.hasLetterKey && this.isUnAcceptableCase())
                )
            ) {
                isValid = false;
                input.markAsTouched();
                return { 'invalid': true };
            }
            Object.keys(this.hotKeySetting).forEach(key => {
                if (this.hotKeySetting[key] && input.value) {
                    if (this.hotKeySetting[key].toString().toLowerCase() == input.value.toString().toLowerCase() && this.controlKey != key) {
                        isValid = false;
                    }
                }
            });
            return isValid ? null : { 'exists': true };
        };
    }

    /**
     * shift + key
     * because user want to write upper character in other input fiel
        1. Ignore all hotkey with shift only, for example: Shift + A, Shift + B .....
        2. Ignore some default hotkey:
        - Ctrl + A (select all)
        - Ctrl + C (copy)
        - Ctrl + P (print)
        - Ctrl + T (new tab)
        - Ctrl + V (parse)
        - Ctrl + W (close)
        - Ctrl + X (cut)
        - Ctrl + Z (cut)
     */
    private isUnAcceptableCase(): boolean {
        const handlerKey = [16, 17, 18]; // shift, control, alt
        const characterKey = [65, 67, 80, 84, 86, 87, 88, 90]; // a, c, p, t, v, w, x
        const keyNeedCheck: { [key: number]: boolean } = {};
        handlerKey.concat(characterKey).forEach(keyCode => {
            keyNeedCheck[keyCode] = false;
        });
        this.keyBufferKeep.forEach(keyCode => {
            keyNeedCheck[keyCode] = true;
        });
        return (keyNeedCheck[16] && !keyNeedCheck[17] && !keyNeedCheck[18])
            || (this.keyBufferKeep.length === 2 && keyNeedCheck[17] && characterKey.some(code => keyNeedCheck[code]));
    }


    public ngAfterViewInit() {
        this.popup = this.popupService.open({
            content: this.hotkeyPopup,
            hasBackdrop: true,
            header: new HeaderNoticeRef({
                iconClose: true,
                title: 'Hotkey',
                icon: { content: '', type: 'resource' },
            }),
            disableCloseOutside: true,
        });
        this.popup.afterClosed$.subscribe(
            (() => {
                this.onClose.emit(true);
            }).bind(this),
        );
    }

    public ngOnDestroy() {
        super.onDestroy();
    }

    private pushKeyDownIntoBuffer(keyCode) {
        if (!this.keyBuffer.length) {
            this.keyBufferKeep.length = 0;
        }
        if (this.keyBuffer && this.keyBuffer.indexOf(keyCode) === -1 &&
            ((keyCode > 64 && keyCode < 91) ||  // from A -> Z
                (keyCode > 15 && keyCode < 19) ||  // Ctr + Shift + Alt
                (keyCode > 47 && keyCode < 58))) { // 0 -> 9
            this.keyBuffer.push(keyCode);
        }
        this.keyBufferKeep = cloneDeep(this.keyBuffer);
        this.buildKeyNameToTextBox();
    }

    private removeKeyUpIntoBuffer(keyCode) {
        if (this.keyBuffer && this.keyBuffer.indexOf(keyCode) > -1) {
            this.keyBuffer = this.keyBuffer.filter(x => x !== keyCode);
        }
        if (this.timeoutKeyUp) {
            clearTimeout(this.timeoutKeyUp);
            this.timeoutKeyUp = null;
        }
        this.timeoutKeyUp = setImmediate(() => {
            if (this.keyBuffer.length === 0) return;
            this.buildKeyNameToTextBox();
        }, 300);
    }

    private buildKeyNameToTextBox() {
        if (this.keyBufferKeep.length === 0) {
            this.hotkeySettingControl.setValue('');
            return;
        }
        this.keyBufferKeep = this.keyBufferKeep.sort((a, b) => a - b);
        let displayText = '';
        for (let i = 0; i < this.keyBufferKeep.length; i++) {
            displayText += this.consts.keyCode[this.keyBufferKeep[i]];
            if (i < this.keyBufferKeep.length - 1) {
                displayText += '+';
            }
        }
        this.checkLetterKeyInArray();
        this.hotkeySettingControl.setValue(displayText);
        this.hotkeySettingControl.updateValueAndValidity();
        document.body.click();
        this.ref.reattach();
        this.ref.detectChanges();
    }

    private checkLetterKeyInArray() {
        this.hasLetterKey = this.hasHandlerKey = false;
        for (let keyCode of this.keyBufferKeep) {
            if ((keyCode > 64 && keyCode < 91) ||  // from A -> Z
                (keyCode > 47 && keyCode < 58)) { // 0 -> 9
                this.hasLetterKey = true;
            }
            if (keyCode > 15 && keyCode < 19) {// Ctr + Shift + Alt
                this.hasHandlerKey = true;
            }
        }
    }

    private subscribe() {
        this.hotKeySettingState.takeUntil(super.getUnsubscriberNotifier()).subscribe(hotKeySetting => {
            this.hotKeySetting = hotKeySetting;
            if (hotKeySetting) {
                this.hotKey = hotKeySetting[this.controlKey];
                this.hotkeySettingControl.setValue(this.hotKey);
                this.hotkeySettingControl.updateValueAndValidity();
            }
        });
    }

    public saveSetting() {
        if (this.hotkeySettingControl.valid) {
            this.hotKey = this.hotkeySettingControl.value;
            this.hotKeySetting[this.controlKey] = this.hotKey;
            this.saveHotKeyConfig();
        }
    }

    /**
     * saveHotKeyConfig
     * @param data
     */
    private saveHotKeyConfig() {
        if (!this.currentGlobalSettingModel || !this.currentGlobalSettingModel.idSettingsGlobal || !this.currentGlobalSettingModel.globalName) {
            this.currentGlobalSettingModel = new GlobalSettingModel({
                globalName: this.getHotkeySettingName(),
                description: 'Hotkey Setting',
                globalType: this.globalSettingConstant.hotkeySetting
            });
        }
        this.currentGlobalSettingModel.idSettingsGUI = this.ofModule.idSettingsGUI;
        this.currentGlobalSettingModel.jsonSettings = JSON.stringify(this.hotKeySetting);
        this.currentGlobalSettingModel.isActive = true;

        this.globalSettingService.saveGlobalSetting(this.currentGlobalSettingModel).subscribe(
            _data => this.saveHotKeyConfigSuccess(_data));
    }

    /**
     * saveHotKeyConfigSuccess
     * @param data
     */
    private saveHotKeyConfigSuccess(data: any) {
        this.globalSettingService.saveUpdateCache(this.ofModule.idSettingsGUI, this.currentGlobalSettingModel, data);
        this.store.dispatch(this.hotKeySettingActions.addHotKeySetting(this.controlKey, this.hotKey));
        this.onSuccessSaved.emit(this.hotKey);
        this.popup.close();
    }

    /**
     * getHotkeySettingName
     */
    private getHotkeySettingName() {
        return String.Format('{0}_{1}',
            this.globalSettingConstant.hotkeySetting,
            this.ofModule ? String.hardTrimBlank(this.ofModule.moduleName) : '');
    }

}
