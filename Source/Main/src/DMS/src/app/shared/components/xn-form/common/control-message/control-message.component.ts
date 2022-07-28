import {
    Component,
    Input,
    Output,
    EventEmitter,
    ChangeDetectorRef,
    ElementRef,
    OnInit,
    OnDestroy,
    ViewChild,
    Directive,
    ContentChild
} from '@angular/core';
import {
    FormControl
} from '@angular/forms';
import {
    ValidationService,
    DomHandler,
    AppErrorHandler
} from '@app/services';
import isEmpty from 'lodash-es/isEmpty';
import {
    TriggerClickInsideCboDirective
} from '@app/shared/directives/xn-trigger-click-inside-cbo/xn-trigger-click-inside-cbo.directive';
import {
    Store
} from '@ngrx/store';
import {
    AppState
} from '@app/state-management/store';
import { Observable, Subscription } from 'rxjs';
import {
    HotKey
} from '@app/models';
import {
    XnCommonActions
} from '@app/state-management/store/actions';
import * as commonReducer from '@app/state-management/store/reducer/xn-common';
import {
    BaseComponent
} from '@app/pages/private/base';
import {
    Router
} from '@angular/router';
import {
    Uti
} from '@app/utilities/uti';
import { MatCheckbox } from '@app/shared/components/xn-control/light-material-ui/checkbox';
import { debounceTime } from 'rxjs/operators';
@Component({
    selector: 'control-messages',
    templateUrl: './control-message.component.html',
    styleUrls: ['./control-message.component.scss'],
})
export class ControlMessagesComponent extends BaseComponent implements OnInit, OnDestroy {
    private formValueChangeErrorSubscription: Subscription;
    private controlStatusChangeSubscription: Subscription;
    private controlValueChangescription: Subscription;
    private MAX_TIMES = 5;
    private requiredColor = '#f90404';
    private hotKeyState: Observable<any>;
    private hotKeyStateSubscription: Subscription;
    private _mandatoryColor = '';
    public isButtonControl = false;
    public _errorMessage: string = null;
    public _cssClass: string = null;
    public iconClass: string = null;
    public hasIcon = false;
    public controlType: string = null;
    public htmlControl: any;
    public isShown = false;
    public boderStyle = '';
    public isHotKeyActive: boolean;
    public deferHotKeyDisplay: boolean;
    private timeOutHotKey;
    @Input() control: FormControl;
    @Input() isShowMessage = true;
    @Input() showIcon = true;
    @Input() styleClass = '';
    @Input() componentControl: any;
    @Input() iconContent: string = '';
    @Input() hotKeyValue: {
        key: string,
        value: string
    };
    @Input() set icon(data: any) {
        this.executeIcon(data);
    }
    @Input() set mandatoryColor(data: any) {
        this.executeMandatoryColor(data);
    }
    @Input() set type(type: string) {
        this.controlType = type;
    }
    @Input() errorMessage: string = '';

    @ContentChild(TriggerClickInsideCboDirective) triggerClickInsideCbo;
    @Output() clickOnGroupAddon: EventEmitter<any> = new EventEmitter<any>();
    @Output() onValueReset: EventEmitter<any> = new EventEmitter<any>();
    @Output() onClickComponentControl: EventEmitter<any> = new EventEmitter<any>();
    constructor(public ref: ChangeDetectorRef,
        private eRef: ElementRef,
        private store: Store<AppState>,
        private commonActions: XnCommonActions,
        protected router: Router,
        private domHandler: DomHandler,
        private appErrorHandler: AppErrorHandler,
    ) {
        super(router);
        this.hotKeyState = this.store.select(state => commonReducer.getCommonState(state, this.ofModule.moduleNameTrim).hotKey);
    }
    public ngOnInit() {
        if (this.hotKeyValue) {
            this.subscribeHotkeyState();
        }
        // Is Button control
        this.isButtonControl = this.triggerClickInsideCbo ? true : false;
        if (!this.control || !this.control.root) return;
        this.bindEventToControl(1);
        this.subscribeFormChange();
        this.setValidationDefaultColor();
    }
    public ngOnDestroy() {
        Uti.unsubscribe(this);
    }
    public clearText(event) {
        if (this.control) {
            this.control.setValue('');
            this.control.markAsDirty();
            this.control.updateValueAndValidity();
            this.control.root['clearText'] = true;
            this.onValueReset.emit();
            if (this.componentControl && typeof this.componentControl.focus === 'function') this.componentControl.focus();
        }
    }
    public onClickGroupAddon(event) {
        this.clickOnGroupAddon.emit(event);
    }

    public reUpdateStyleForControl() {
        this.setCSSAndMessageForControl();
        this.setRequiredBorder();
    }
    /*****************************************************************************************/
    /*********************************PRIVATE METHODS*****************************************/
    private subscribeFormChange() {
        this.formValueChangeErrorSubscription = this.control.root.valueChanges.pipe(
            debounceTime(300),
        ).subscribe(() => {
            this.appErrorHandler.executeAction(() => {
                this.setCSSAndMessageForControl();
            });
        });
        this.controlStatusChangeSubscription = this.control.statusChanges.subscribe(() => {
            this.appErrorHandler.executeAction(() => {
                this.reUpdateStyleForControl();
            });
        });
        this.controlValueChangescription = this.control.valueChanges.pipe(
            debounceTime(100),
        ).subscribe(() => {
            this.appErrorHandler.executeAction(() => {
                this.setRequiredBorder();
            });
        });
    }
    private setCSSAndMessageForControl() {
        if (this.control['valueIncorrect'] || !this.control.valid) {
            this._errorMessage = this.getErrorMessage();
            this._cssClass = this.getCssClass();
            this.ref.markForCheck();
            return;
        }
        this._errorMessage = '';
        this._cssClass = '';
        this.ref.markForCheck();
    }
    private setRequiredBorder() {
        //valueIncorrect: true or false
        if (this.control['valueIncorrect']) {
            this.boderStyle = this.createBorder();
        }
        else {
            if ((this.control.value && typeof this.control.value === 'string' && this.control.value.trim()) || !this.control.errors || !this.control.errors.required) {
                this.boderStyle = '';
            } else {
                this.boderStyle = this.createBorder();
            }
            // if ((typeof this.control.value === 'string' && !this.control.value.trim() && this.control.errors && this.control.errors.required)
            //     || (typeof this.control.value === 'object' && (isEmpty(this.control.value) || !this.control.value.length))) {
            //     this.boderStyle = this.createBorder();
            // } else {
            //     this.boderStyle = '';
            // }
        }
        this.ref.markForCheck();
    }

    /**
     * subscribeHotkeyState
     */
    private subscribeHotkeyState() {
        this.hotKeyStateSubscription = this.hotKeyState.subscribe((hotkey: HotKey) => {
            this.appErrorHandler.executeAction(() => {
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
                    const isEditHotKeyInDialog = this.domHandler.findSingle(document, '.prime-dialog-article-hot-key');
                    if (this.isHotKeyActive && !isEditHotKeyInDialog) {
                        if (hotkey.keyCombineCode && this.hotKeyValue && hotkey.keyCombineCode.toLowerCase() == String(this.hotKeyValue.value).toLowerCase()) {
                            if (this.componentControl) {
                                if (this.componentControl instanceof MatCheckbox) {
                                    const currentStatus = (this.componentControl as MatCheckbox).checked;
                                    this.onClickComponentControl.emit(currentStatus);
                                } else {
                                    this.componentControl.focus();
                                    if (typeof this.componentControl.click === "function") {
                                        $(this.componentControl).click();
                                        this.onClickComponentControl.emit(true);
                                    }
                                }
                            }
                            else {
                                this.onClickComponentControl.emit(true);
                            }
                            this.store.dispatch(this.commonActions.addHotKey(new HotKey({
                                altKey: false,
                                keyCombineCode: null
                            }), this.ofModule));
                            this.deferHotKeyDisplay = false;
                        }
                    }
                    this.ref.detectChanges();
                }
            });
        });
    }
    private executeIcon(data: any) {
        this.iconClass = data;
        this.hasIcon = !!this.iconClass.trim();
    }
    private executeMandatoryColor(data: any) {
        this._mandatoryColor = data;
        if (data) {
            this.boderStyle = this.createBorder(data);
        } else {
            this.boderStyle = '';
        }
    }
    private setValidationDefaultColor() {
        // fix bug, change validation for control the border don't effect
        // if (this.boderStyle) return;
        // set default required color for control
        if (((typeof this.control.value === 'string' && this.control.value) || (typeof this.control.value === 'object' && this.control.value && !!this.control.value.length))
            || !this.control.errors
            || !this.control.errors.required) {
            this.boderStyle = '';
            return;
        }
        this.boderStyle = this.createBorder();
    }
    private createBorder(color?: any): string {
        return '3px ' + (color ? color : this._mandatoryColor ? this._mandatoryColor : this.requiredColor) + ' solid';
    }
    private randLetter() {
        const letters = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "a", "b", "c", "d", "e", "f", "g", "h", "i", "j", "k", "l", "m", "n", "o", "p", "q", "r", "s", "t", "u", "v", "w", "x", "y", "z"];
        const index = Math.floor(Math.random() * (letters.length));
        const letter = letters[index];
        return letter;
    }
    private bindEventToControl(currentLoopTimes: number) {
        currentLoopTimes++;
        setTimeout(() => {
            if (this.control && this.eRef) {
                const wijmoControl = $('wj-combo-box', $(this.eRef.nativeElement).parent());
                if (wijmoControl.length) {
                    return;
                }
                this.htmlControl = $('input[type=text]', $(this.eRef.nativeElement).parent());
                if (this.htmlControl) {
                    this.htmlControl.bind('focusin', () => {
                        this.isShown = true;
                    }).bind('keyup', (event) => {
                        this.isShown = true;
                    }).bind('focusout', (event) => {
                        setTimeout(() => {
                            this.isShown = false;
                        }, 200);
                    });
                    return;
                }
                if (currentLoopTimes < this.MAX_TIMES) this.bindEventToControl(currentLoopTimes);
            }
        }, 100);
    }
    private getErrorMessage() {
        if (this.errorMessage && this.control.hasOwnProperty('valueIncorrect') && this.control['valueIncorrect']) return this.errorMessage;
        if (!(this.control.root as any).submitted) return '';
        for (const propertyName in this.control.errors) {
            if ((this.control.errors.hasOwnProperty(propertyName) && !this.control.pristine) || (propertyName != 'required' && propertyName != 'email') || ((this.control.root as any).submitted)) {
                let label = '';
                if (this.control['label']) label = this.control['label'] + ' is ';
                return label + ValidationService.getValidatorErrorMessage(propertyName, this.control.errors[propertyName]);
            }
        }
        return null;
    }
    private getCssClass() {
        if (!(this.control.root as any).submitted) return '';
        let cssClass = '';
        if ((!(this.control.root as any).submitted || !this.hasValidation()) && !this.control['valueIncorrect']) return cssClass;
        cssClass = (this.control.valid && !this.control['valueIncorrect']) ? '' : 'invalid-group-addon  ';
        cssClass += (this.control.pristine && this.control.value === '') ? 'pristine-group-addon' : '';
        return cssClass;
    }
    private hasValidation(): boolean {
        return !isEmpty(this.control.errors);
    }
    public isShowHotkeyDialog: boolean;
    public editHotkey($event) {
        $event.stopPropagation();
        this.isShowHotkeyDialog = true;
        this.ref.detectChanges();
    }
    public onClose() {
        this.isShowHotkeyDialog = false;
        this.ref.detectChanges();
    }
}
