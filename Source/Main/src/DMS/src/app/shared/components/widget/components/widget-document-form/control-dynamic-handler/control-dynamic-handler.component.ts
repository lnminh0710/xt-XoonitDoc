import {
    Component,
    Input,
    OnDestroy,
    Output,
    EventEmitter,
    ChangeDetectorRef,
    ViewChild,
    ElementRef,
} from '@angular/core';
import { FormGroup } from '@angular/forms';
import { Observable } from 'rxjs';
import { BaseControl, ControlType } from '../control-model/base-control.model';
import { AdministrationDocumentActions } from '@app/state-management/store/actions/administration-document';
import { Store } from '@ngrx/store';
import { AppState } from '@app/state-management/store';
import { FieldFormOnFocusModel } from '@app/state-management/store/models/administration-document/field-form-on-focus.model.payload';
import { TextControl } from '../control-model/text-control.model';
import { TextAreaControl } from '../control-model/text-area-control.model';
import { DropdownControl } from '../control-model/dropdown-control.model';
import { RadioToggleControl } from '../control-model/radio-toggle.model';
import { DatetimeControl } from '../control-model/datetime-control.model';
import { AutocompleteControl } from '../control-model/autocomplete-control.model';
import { MatSelect } from '@app/shared/components/xn-control/light-material-ui/select';
import { MatSlideToggle } from '@app/shared/components/xn-control/light-material-ui/slide-toggle';
import { DocumentFormNameEnum, DocumentFormContactName } from '@app/app.constants';
import { DynamicFormData } from '../control-model/dynamic-form-data.model';
import { element } from 'protractor';
import { map, startWith } from 'rxjs/operators';

@Component({
    selector: 'control-dynamic',
    styleUrls: ['./control-dynamic-handler.component.scss'],
    templateUrl: './control-dynamic-handler.component.html',
})
export class ControlDynamicHandlerComponent implements OnDestroy {
    private _controlData: BaseControl<any>;
    private _listControlData: any;

    public acOptions: any[];
    public acReactiveOptions: Observable<string[]>;

    @Input() set controlData(controlData: BaseControl<any>) {
        this._controlData = controlData;
        this.setFilterAutotComplete();
    }
    get controlData() {
        return this._controlData;
    }
    @Input() form: FormGroup;
    @Input() set listControlData(data: any) {
        this._listControlData = data;
    }
    get listControlData() {
        return this._listControlData;
    }
    // auto complete
    @Output() enterFuncAutoComplete = new EventEmitter<string>();

    @ViewChild('textControl') textControlRef: ElementRef;
    @ViewChild('textAreaControl') textAreaControlRef: ElementRef;
    @ViewChild('selectControl') selectControlRef: MatSelect;
    @ViewChild('textAutoCompleteControl') textAutoCompleteControlRef: ElementRef;
    @ViewChild('textDateTimeControl') textDateTimeControlRef: ElementRef;
    @ViewChild('radioButtonControl') radioButtonControlRef: MatSlideToggle;

    constructor(
        private store: Store<AppState>,
        private administrationActions: AdministrationDocumentActions,
        private cdRef: ChangeDetectorRef,
    ) {}

    get isRequired() {
        return (
            (this.form.controls[this.controlData.originalColumnName].dirty ||
                this.form.controls[this.controlData.originalColumnName].touched) &&
            this.form.controls[this.controlData.originalColumnName].errors &&
            this.form.controls[this.controlData.originalColumnName].errors.required
        );
    }

    // auto complete
    public setFilterAutotComplete() {
        if (this.controlData && this.controlData.controlType === ControlType.AUTOCOMPLETE) {
            if (this.form) {
                this.acReactiveOptions = this.form
                    .get(this.controlData['value'])
                    .valueChanges
                    .pipe(
                        startWith(null),
                        map((object) =>
                            object && object['value'] && object['value'].trim()
                                ? this.filter(object['value'].trim())
                                : this.controlData['options'].slice(),
                        ),
                    );
            } else {
                this.acOptions = this.controlData['options'];
            }
        }
    }
    public displayFn(object: object): string {
        return object ? object['value'] : object;
    }
    public filterStates(data: any) {
        const text = data && data['value'] ? data['value'].trim() : data.trim();
        this.acOptions = text ? this.filter(text) : this.controlData['options'];
    }
    public filter(val: string): string[] {
        return this.controlData['options'].filter(
            (option) => option.value.toLowerCase().indexOf(val.toLowerCase()) === 0,
        );
    }
    public enterFunctionAutoComplete(value: string) {
        this.enterFuncAutoComplete.emit(value);
    }
    // end auto complete

    public onControlFocus(control?: BaseControl<any>) {
        const currentCotrol = control ? control : this.controlData;
        if (!currentCotrol.canFocus) return;

        const payload = new FieldFormOnFocusModel();
        payload.formOnFocus = this.form;
        payload.fieldOnFocus = currentCotrol.originalColumnName;
        payload.documentFormType = currentCotrol.documentFormType;
        payload.documentFormName = currentCotrol.documentFormName;

        // for UI show button clear field
        if (currentCotrol.constructor === TextControl) {
            (currentCotrol as TextControl).isFocus = true;
            (<TextControl>currentCotrol).isShowClearField = true;
        }

        this.cdRef.detectChanges();
        this.store.dispatch(this.administrationActions.setFieldFormOnFocus(payload));
    }

    public onControlLostFocus() {
        // for UI hide button clear field
        if (this.controlData.constructor === TextControl) {
            (this.controlData as TextControl).isFocus = false;
            (<TextControl>this.controlData).isShowClearField = false;
        }
        this.cdRef.detectChanges();
    }

    public onMouseEnter() {
        if (this.controlData.constructor === TextControl) {
            (<TextControl>this.controlData).isShowClearField = true;
        }
    }

    public onMouseLeave() {
        if (this.controlData.constructor === TextControl && !(this.controlData as TextControl).isFocus) {
            (<TextControl>this.controlData).isShowClearField = false;
        }
    }

    public onEnter() {
        if (this.controlData && this.controlData.documentFormName === DocumentFormNameEnum.WIDGET_CONTACT) {
            let currentForm = '';
            let nextControls = [];
            let nextControl = null;
            this.listControlData.forEach((element: DynamicFormData) => {
                const control = element.listControl.find(
                    (x) => x.originalColumnName === this.controlData.originalColumnName,
                );
                if (!control) return;
                currentForm = element.nameForm;
                nextControls = element.listControl.filter((x) => Number(x.orderBy) > Number(this.controlData.orderBy));
                if (!nextControls.length && currentForm === DocumentFormContactName.SUB_CONTACT) {
                    document.getElementById(this.controlData.originalColumnName).blur();
                    return;
                } else if (
                    !nextControls.length &&
                    currentForm === DocumentFormContactName.MAIN_CONTACT &&
                    this.listControlData[1]
                ) {
                    nextControl = this.listControlData[1].listControl.sort(function (a, b) {
                        return Number(a.orderBy) - Number(b.orderBy);
                    })[0];
                } else {
                    nextControl = nextControls.sort(function (a, b) {
                        return Number(a.orderBy) - Number(b.orderBy);
                    })[0];
                }
                if (!document.getElementById(nextControl.originalColumnName)) {
                    document.getElementById(this.controlData.originalColumnName).blur();
                    return;
                }
                document.getElementById(nextControl.originalColumnName).focus();
                this.onControlFocus(nextControl);

                return;
            });
        } else {
            const nextControls = this.listControlData.filter(
                (x) => Number(x.orderBy) > Number(this.controlData.orderBy),
            );
            if (!nextControls.length) {
                document.getElementById(this.controlData.originalColumnName).blur();
                return;
            }
            const nextControl = nextControls.sort(function (a, b) {
                return Number(a.orderBy) - Number(b.orderBy);
            })[0];
            const id =
                nextControl.controlType === ControlType.RADIO
                    ? `${nextControl.originalColumnName}-input`
                    : nextControl.originalColumnName;
            document.getElementById(id).focus();
            this.onControlFocus(nextControl);
        }
    }

    public onArrowDown() {
        this.cdRef.detectChanges();
    }

    public onArrowUp() {
        this.cdRef.detectChanges();
    }

    public onSpace() {
        this.cdRef.detectChanges();
    }

    public setFocus(): void {
        switch (this.controlData.constructor) {
            case TextControl:
                this.textControlRef.nativeElement.focus();
                break;

            case TextAreaControl:
                this.textAreaControlRef.nativeElement.focus();
                break;

            case DropdownControl:
                this.selectControlRef.focus();
                break;

            case RadioToggleControl:
                this.radioButtonControlRef.focus();
                break;

            case DatetimeControl:
                this.textDateTimeControlRef.nativeElement.focus();
                break;

            case AutocompleteControl:
                this.textAutoCompleteControlRef.nativeElement.focus();
                break;
        }
    }

    public keyPress($event: KeyboardEvent) {
        if (this._controlData.ignoreKeyCodes && this._controlData.ignoreKeyCodes.indexOf($event.keyCode) !== -1) {
            $event.preventDefault();
            return false;
        }
        return true;
    }

    public clearTextField(controlName: string) {
        this.form.controls[controlName].setValue('');
    }

    public ngOnDestroy(): void {}
}
