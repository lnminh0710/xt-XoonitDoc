import {
    Component,
    Input,
    Output,
    Provider,
    forwardRef,
    EventEmitter,
    ElementRef,
    ViewChild,
    Renderer2,
    OnInit,
    OnDestroy,
} from '@angular/core';
import { Subscription, Subject } from 'rxjs';
import { ControlValueAccessor, NG_VALUE_ACCESSOR, NG_VALIDATORS, Validator, FormControl } from '@angular/forms';
import { FormGroup } from '@angular/forms';
import { ControlBase, TextboxControl, DropdownControl, SignalRNotifyModel, DateControl } from '@app/models';
import isNil from 'lodash-es/isNil';
import { Uti } from '@app/utilities';
import { PropertyPanelService } from '@app/services';
import { parse, format } from 'date-fns/esm';
import { MatCheckbox } from '@app/shared/components/xn-control/light-material-ui/checkbox';
import { debounceTime } from 'rxjs/operators';

@Component({
    selector: 'inline-edit',
    providers: [
        {
            provide: NG_VALUE_ACCESSOR,
            useExisting: forwardRef(() => InlineEditComponent),
            multi: true,
        },
        {
            provide: NG_VALIDATORS,
            useExisting: forwardRef(() => InlineEditComponent),
            multi: true,
        },
    ],
    styleUrls: ['./inline-edit.component.scss'],
    templateUrl: './inline-edit.component.html',
})
export class InlineEditComponent implements ControlValueAccessor, Validator, OnDestroy {
    @ViewChild('inlineEditControl') inlineEditControl;
    @Output() public onEditField: EventEmitter<any> = new EventEmitter();
    @Output() public onEnterKeyPress: EventEmitter<any> = new EventEmitter();
    @Output() public onUpdateValue: EventEmitter<any> = new EventEmitter();
    @Output() public onCancelEditField: EventEmitter<any> = new EventEmitter();
    @Output() public focusField: EventEmitter<any> = new EventEmitter();

    @Input() form: FormGroup;
    @Input() isDateOfBirth: boolean = false;
    @Input() control: ControlBase<any>;
    @Input() set editing(_editing: boolean) {
        this._editing = _editing;
        if (_editing) {
            const containerHeight = $(this.element.nativeElement).parent().height();
            if (this.controlHeight < containerHeight) this.controlHeight = containerHeight - 6;
            const controlWidth = $(this.element.nativeElement).parent().width();
            if (this.controlWidth < controlWidth) this.controlWidth = controlWidth;
        }
    }
    get editing() {
        return this._editing;
    }
    @Input() isDialogMode: boolean;
    @Input() inputControlWidth = 0;
    @Input() dataStyle: any = {};
    @Input() set globalProperties(globalProperties: any[]) {
        if (this.control && this.control.controlType == 'date') {
            this.globalDateFormat = this.propertyPanelService.buildGlobalDateFormatFromProperties(globalProperties);
        }
        if (this.control && this.control.controlType == 'numberbox')
            this.globalFormatNumber = this.propertyPanelService.buildGlobalNumberFormatFromProperties(globalProperties);
    }
    @Input() errorShow: boolean;

    private controlHeight = 26;
    private controlWidth = 100;
    private _editing = false;
    public preValue: any;
    private randomId: string = Uti.guid();
    private keyupTimeout: any = null;
    public onChange: any = Function.prototype;
    public onTouched: any = Function.prototype;
    public value: any;
    public tempValue: any;
    public perfectScrollbarConfig = {
        suppressScrollX: true,
        suppressScrollY: false,
    };

    private _globalDateFormat: string = null;
    set globalDateFormat(dateFormat: string) {
        this._globalDateFormat = dateFormat;
    }

    get globalDateFormat() {
        return this._globalDateFormat || 'MM.dd.yyyy';
    }

    public globalFormatNumber: string;
    public defaultMaxWidth = 400;
    public userEditingPostion = {
        top: 0,
        left: 0,
    };
    public userEditingListId = Uti.guid();
    public editingClass = '';

    private subject: Subject<any> = new Subject();
    private subscription: Subscription;

    set setValue(v: any) {
        this.tempValue = v;
        if (v !== this.value) {
            this.value = v;
            this.control.value = v;
        }
        this.onChange(v);
        // update the form
        this.onTouched(v);
    }

    set setValueWithoutUpdateValue(v: any) {
        if (v !== this.tempValue) {
            this.control.value = v;
            this.tempValue = v;
        }
        this.onChange(v);
        // update the form
        this.onTouched(v);
    }

    get errorMessage(): string {
        if (this.form.controls[this.control.key].hasError('required')) {
            return this.control.label + ' is required ';
        } else if (this.form.controls[this.control.key].hasError('pattern')) {
            return this.control.label + ' is invalid ';
        } else if (this.form.controls[this.control.key].hasError('max')) {
            return this.control.label + ' is larger than ' + this.form.controls[this.control.key].errors['max'].max;
        }
    }

    constructor(
        private element: ElementRef,
        private _renderer: Renderer2,
        private propertyPanelService: PropertyPanelService,
        private uti: Uti,
    ) {
        this.subscription = this.subject.pipe(debounceTime(150)).subscribe((event) => {
            this.onChangeValue(event);
        });
    }

    public ngOnDestroy() {
        Uti.unsubscribe(this);
    }

    // Required for ControlValueAccessor interface
    writeValue(value: any) {
        //if (this.control.controlType === 'date') {
        //    if (!value || value === '') {
        //        value = null;
        //    } else if (!(value instanceof Date) && value.indexOf('.') !== -1)
        //        value = parse(value, 'dd.MM.yyyy', new Date());
        //}
        this.value = value;
        this.tempValue = value;
        this.preValue = value;
    }

    // Required forControlValueAccessor interface
    public registerOnChange(fn: (_: any) => {}): void {
        this.onChange = fn;
    }

    // Required forControlValueAccessor interface
    public registerOnTouched(fn: () => {}): void {
        this.onTouched = fn;
    }

    // validates the form, returns null when valid else the validation object
    public validate(c: FormControl) {
        return null;
    }

    edit(value, nativeEle) {
        if (this.control.readOnly) return;

        const controlHeight = $('label', $(nativeEle)).height();
        if (this.controlHeight < controlHeight) this.controlHeight = controlHeight - 6;
        this.preValue = value;
        this.tempValue = value;
        this.editing = true;
        this.focus();
        this.onEditField.emit({ isEditing: this.editing, id: this.randomId, control: null });
    }

    focus() {
        setTimeout((_) => {
            if (!this.inlineEditControl) {
                return;
            }
            switch (this.control.controlType) {
                case 'checkbox':
                    this._renderer
                        .selectRootElement((this.inlineEditControl as MatCheckbox)._inputElement.nativeElement)
                        .focus();
                    break;
                case 'numberbox':
                case 'date':
                case 'dropdown':
                case 'textboxMask':
                    this._renderer.selectRootElement(this.inlineEditControl.hostElement).focus();
                    break;
                default:
                    this._renderer.selectRootElement(this.inlineEditControl.nativeElement).focus();
                    break;
            }
        });
    }

    keypress($event) {
        if ($event.which === 13 || $event.keyCode === 13) {
            $event.preventDefault();
            this.onEnterKeyPress.emit(this.control);
        } else {
            this.subject.next($event);
            // setTimeout(() => this.onChangeValue($event));
        }
    }

    keyup($event) {
        // detect for backspace key
        if ($event.which === 8 || $event.keyCode === 8 || $event.which === 46 || $event.keyCode === 46) {
            this.subject.next($event);
            // this.onChangeValue($event);
        }
    }

    // Just detect combobox search field only
    comboboxKeyup($event) {
        clearTimeout(this.keyupTimeout);
        this.keyupTimeout = null;
        this.keyupTimeout = setTimeout(() => {
            if ($event.which === 13 || $event.keyCode === 13) {
                $event.preventDefault();
                this.onEnterKeyPress.emit(this.control);
            }
        }, 200);
    }

    focusin() {
        this.focusField.emit(this.control.key);
    }

    focusout(event) {
        if (event) {
            $<HTMLElement>(event.target, this.element.nativeElement).html(this.tempValue);
        }
        this.value = this.tempValue;
    }

    cancel() {
        this.reset(false);
        this.onCancelEditField.emit({ element: this.element.nativeElement });
    }

    reset(isResetEditing?: boolean) {
        this.setValue = this.preValue;
        this.value = this.preValue;
        this.control.value = this.preValue;
        if (this.control.controlType === 'dropdown') {
            let displayValue = '';
            if (<DropdownControl>this.control && (<DropdownControl>this.control).options) {
                (<DropdownControl>this.control).options.forEach((option) => {
                    if (option.key === this.preValue) {
                        displayValue = option.value;
                    }
                });
            }
            (<DropdownControl>this.control).displayValue = displayValue;
        } else if (
            this.control.controlType === 'textbox' &&
            this.inlineEditControl &&
            this.inlineEditControl.nativeElement
        ) {
            this.inlineEditControl.nativeElement.textContent = this.preValue;
        }

        if (isNil(isResetEditing) || isResetEditing) this.editing = false;
        this.onEditField.emit({ isEditing: false, id: this.randomId, control: null });
    }

    updatePrevalue() {
        this.preValue = this.value;
    }

    public onNumberValueChanged($event): void {
        setTimeout(() => this.subject.next($event));
    }

    public onChangeValue(event) {
        if (this.control.controlType === 'dropdown') {
            switch (this.control.type) {
                case 'multi-select':
                    const checkedItems: Array<any> = this.inlineEditControl.checkedItems;
                    const dropdownControl: DropdownControl = this.control as DropdownControl;
                    if (checkedItems.length) {
                        const s: Array<string> = checkedItems.map((p) => {
                            return p.value;
                        });

                        const keys: Array<any> = checkedItems.map((p) => {
                            return p.key;
                        });
                        dropdownControl.displayValue = s.join(',');
                        dropdownControl.value = keys.join(',');
                    } else {
                        dropdownControl.displayValue = '';
                        dropdownControl.value = '';
                    }
                    this.setValue = dropdownControl.value;
                    this.onUpdateValue.emit(this.control);
                    break;
                default:
                    this.setValue = this.inlineEditControl.selectedValue || '';
                    this.onUpdateValue.emit(this.control);
                    let displayValue = this.control.value;
                    if (this.control['options'] && this.control['options'].length) {
                        const rs = this.control['options'].find((i) => i.key === this.control.value);
                        if (rs) {
                            displayValue = rs.value;
                        }
                    }
                    this.control['displayValue'] = displayValue;
                    break;
            }
        } else if (this.control.controlType === 'date' || this.control.controlType === 'numberbox') {
            if (this.value) {
                this.control.value = this.value;
                this.onChange(this.value);
                this.onTouched(this.value);
            }
        } else if (this.control.controlType === 'textboxMask') {
            this.setValue = this.inlineEditControl.rawValue || '';
        } else {
            if (event && event.target) {
                if (!isNil(event.target.textContent)) {
                    //this.setValue = event.target.textContent;
                    this.setValueWithoutUpdateValue = event.target.textContent;
                } else {
                    const newValue = event.target.value;
                    this.setValue = newValue;
                }
            }
        }
        this.onEditField.emit({ isEditing: this.editing, id: this.randomId, control: this.control });
    }

    private onCheckboxChange(event) {
        // const newValue = this.value;
        const newValue = event.checked;
        this.setValue = newValue;
        this.onUpdateValue.emit(this.control);
    }

    mouseenter(pop) {
        if (!this.form.controls[this.control.key].valid && this.form.controls[this.control.key].touched) {
            pop.tooltip = this.errorMessage;
            pop.show();
        } else {
            pop.hide();
        }
    }

    mouseleave(pop) {
        pop.hide();
    }

    onSelectDate(date) {
        this.setValue = date;
    }

    public formartDateString = 'MM/dd/yyyy';

    public formatDate(date) {
        let dateObj: any = date;
        if (!dateObj || dateObj.toString() === 'Invalid Date') return '';

        if (!(date instanceof Date)) {
            dateObj = parse(dateObj, 'MM/dd/yyyy', new Date());
            if (dateObj.toString() === 'Invalid Date') {
                dateObj = parse(dateObj, 'dd/MM/yyyy', new Date());
                if (dateObj.toString() === 'Invalid Date') {
                    dateObj = parse(dateObj, 'yyyy/MM/dd', new Date());
                    if (dateObj.toString() === 'Invalid Date') {
                        return dateObj;
                    }
                }
            }
        }
        const formatDate = (this.control as DateControl).format;
        return this.uti.formatLocale(dateObj, formatDate ? formatDate : this.globalDateFormat);
    }

    public getDateFormatForDOB() {
        const formatDate = (this.control as DateControl).format;
        return (formatDate ? formatDate : this.globalDateFormat) || 'MM/dd/yyyy';
    }

    public appendDataStyle(data) {
        data = data || {};
        return Object.assign({}, this.dataStyle, data);
    }

    public updateDataCaptured(value) {
        this.setValue = value;
        this.onEditField.emit({ isEditing: this.editing, id: this.randomId, control: this.control });
    }
}
