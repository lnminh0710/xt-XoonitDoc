import {
    Component,
    Input,
    Output,
    ElementRef,
    EventEmitter,
    OnInit,
    OnDestroy,
    ViewChild,
    Renderer2,
    forwardRef,
    AfterViewInit,
    OnChanges,
    SimpleChanges
} from '@angular/core';
import {
    ControlValueAccessor,
    NG_VALUE_ACCESSOR,
} from '@angular/forms';
import {
    Uti
} from '@app/utilities';
import {
    IMyOptions,
    NgxMyDatePickerDirective,
    NgxMyDatePickerConfig
} from '@app/shared/components/xn-control/xn-date-picker';
import { format, parse } from 'date-fns/esm';
@Component({
    selector: 'xn-date-picker',
    templateUrl: './xn-date-picker.component.html',
    styleUrls: ['./xn-date-picker.component.scss'],
    providers: [{
        provide: NG_VALUE_ACCESSOR,
        useExisting: forwardRef(() => DatePickerComponent),
        multi: true,
    }],
})
export class DatePickerComponent implements ControlValueAccessor, OnInit, OnDestroy, OnChanges, AfterViewInit {
    public onChange: any = (_: any) => { };
    public datePickerOptions: IMyOptions;
    public hostElement: any;
    public maskInput: Array<string | RegExp> = [];

    private _format: string = 'MM/dd/yyyy';
    private currentValue: any;
    private focusWhenChooseItem: boolean = false;

    @Input() id: string = Uti.guid();
    @Input() customClass: string = '';
    @Input() width: string;
    @Input() isInGrid: any = false;

    @Input() asyncBindings: any;
    @Input() autoExpandSelection: any;
    @Input() calendar: any;
    @Input() controlTemplate: any;
    @Input() dropDown: any;
    @Input() dropDownCssClass: any;
    @Input() set format(data: string) {
        this.formatData(data);
    }
    @Input() gotFocusNg: any;
    @Input() initialized: any;
    @Input() inputElement: any;
    @Input() inputType: any;
    @Input() isAnimated: any;
    @Input() isDisabled: any;
    @Input() isDroppedDown: any;
    @Input() isDroppedDownChangedNg: any;
    @Input() isDroppedDownChangingNg: any;
    @Input() isInitialized: any;
    @Input() isReadOnly: any;
    @Input() isRequired: any;
    @Input() isTouching: any;
    @Input() isUpdating: any;
    @Input() itemFormatter: any;
    @Input() itemValidator: any;
    @Input() lostFocusNg: any;
    @Input() max: any;
    @Input() min: any;
    @Input() placeholder: any = '';
    @Input() rightToLeft: any;
    @Input() selectionMode: any;
    @Input() showDropDownButton: any = true;
    @Input() text: any;
    @Input() textChangedNg: any;
    @Input() value: any; // TODO
    @Input() valueChangedNg: any;
    @Input() wjModelProperty: any;
    @Input() dontAutoFillDateWhenEnter: boolean = false;
    @Input() dontShowCalendarWhenFocus: boolean = false;

    @Output() inGrid: EventEmitter<any> = new EventEmitter();
    @Output() keyup: EventEmitter<any> = new EventEmitter();
    @Output() keypress: EventEmitter<any> = new EventEmitter(); // TODO:
    @Output() valueChanged: EventEmitter<string> = new EventEmitter(); // TODO:
    @Output() gotFocus: EventEmitter<any> = new EventEmitter();
    @Output() lostFocus: EventEmitter<any> = new EventEmitter();
    @Output() onSearchButtonClicked: EventEmitter<string> = new EventEmitter();
    @ViewChild('inputControl') inputControl;
    @ViewChild('datePicker') datePicker: NgxMyDatePickerDirective;
    constructor(
        private renderer: Renderer2,
        private elementRef: ElementRef,
        private uti: Uti
    ) {
        this.datePickerOptions = new NgxMyDatePickerConfig();
        this.formatData();
    }
    /* Begin Overrite methods */
    writeValue(value: any): void {
        const input = this.inputControl.nativeElement;
        try {
            this.value = value;
            const setValue = (this.value && this.value.getFullYear)
                ? this.uti.formatLocale(this.value, this.datePickerOptions.dateFormat)
                : '';
            this.renderer.setProperty(input, 'value', setValue);
            this.currentValue = setValue;
        } catch (e) {
            this.renderer.setProperty(input, 'value', '');
            this.currentValue = '';
        }
    }
    registerOnChange(fn: any): void {
        this.onChange = fn;
    }
    registerOnTouched(fn: any): void { }
    setDisabledState?(isDisabled: boolean): void { }
    /* End Overrite methods */
    public onValueChange($event) {
        const input = this.inputControl.nativeElement;
        if (!$event) {
            this.renderer.setProperty(input, 'value', '');
            this.onChange('');
            this.value = '';
            return;
        }
        if (!this.datePicker.isDateValid($event)) {
            this.renderer.setProperty(input, 'value', this.currentValue);
            return;
        }
        let dateValue = null;
        try {
            dateValue = Uti.getUTCDate(parse($event, this.datePickerOptions.dateFormat, new Date()));
        } catch (e) {
            dateValue = null;
        }
        this.currentValue = $event;
        this.value = dateValue;
        if (dateValue) {
            this.onChange(dateValue);
            this.valueChanged.emit(dateValue);
        }
    }
    public ngOnInit(): void { }
    public ngOnDestroy(): void { }
    public ngAfterViewInit(): void {
        this.hostElement = this.inputControl.nativeElement;
        this.registerEvent();
    }
    public ngOnChanges(changes: SimpleChanges) {
        if (changes.hasOwnProperty('format')
            || changes.hasOwnProperty('width')
            || changes.hasOwnProperty('min')
            || changes.hasOwnProperty('max')) {
            this.buildCalendarOption();
        }

        if (changes.hasOwnProperty('value') || changes.hasOwnProperty('format')) {
            setTimeout(() => {
                if (!this.value || !this.value.getFullYear) {
                    this.renderer.setProperty(this.inputControl.nativeElement, 'value', '');
                    return;
                }
                this.renderer.setProperty(this.inputControl.nativeElement, 'value', this.uti.formatLocale(this.value, this.datePickerOptions.dateFormat));
            }, 200);
        }
    }
    public openCalendar($event) {
        if (this.datePicker) this.datePicker.toggleCalendar();
        $event.stopPropagation();
    }
    public openCalendarFromOutSide() {
        if (this.datePicker) this.datePicker.toggleCalendar();
        setTimeout(() => {
            this.focusWhenChooseItem = true;
            this.focus();
        }, 100);
    }
    public calendarToggle($event) {
        if (this.isInGrid) {
            this.inGrid.emit($event);
        }
    }
    public onKeyDown($event) {
        this.keypress.emit($event);
    }
    public onKeyUp($event) {
        this.keyup.emit($event);
    }
    private timesCounter = 0;
    public registerEvent() {
        if (this.timesCounter === 100) {
            this.timesCounter = 0;
            return;
        }
        setTimeout(() => {
            this.timesCounter++;
            let control = $('#' + this.id);
            if (!control || !control.length) {
                this.registerEvent();
                return;
            }
            this.timesCounter = 0;
            this.width = control.parent().parent().outerWidth() + 'px';
            this.buildCalendarOption();
        });
    }
    public onFocus() {
        this.hostElement.select();
        if (this.focusWhenChooseItem) {
            setTimeout(() => {
                this.focusWhenChooseItem = false;
            }, 200);
            return;
        }
        if (this.isFocusing) return;
        if (!this.dontShowCalendarWhenFocus)
            this.openCalendarFromOutSide();
        this.gotFocus.emit(true);
        this.isFocusing = true;
    }
    private isFocusing = false;
    public onLostFocus() {
        this.isFocusing = false;
        this.lostFocus.emit();
    }
    public setFocusWhenChooseDateHandle() {
        this.focusWhenChooseItem = true;
    }
    private buildCalendarOption() {
        let newConfig = Object.assign({}, this.datePickerOptions);
        newConfig.dateFormat = this._format ? this._format.replace(/m/g, 'M') : this.datePickerOptions.dateFormat;
        newConfig.selectorWidth = this.width || this.datePickerOptions.selectorWidth;
        newConfig.minYear = (this.min && this.min.getFullYear) ? this.min.getFullYear() : this.datePickerOptions.minYear;
        newConfig.maxYear = (this.max && this.max.getFullYear) ? this.max.getFullYear() : this.datePickerOptions.maxYear;
        newConfig.dontAutoFillDateWhenEnter = this.dontAutoFillDateWhenEnter;
        this.datePickerOptions = newConfig;
    }
    private makeMaskForInput(mask: string) {
        mask = mask.toLowerCase().replace(/d/g, 'y').replace(/m/g, 'y');
        const newMaskArr = mask.split('');
        let separates = [];
        for (let i = 0; i < newMaskArr.length; i++) {
            if (newMaskArr[i] === 'y') {
                separates.push(/\d/);
            } else {
                separates.push(newMaskArr[i]);
            }
        }
        this.maskInput = separates;
    }

    public focus() {
        $('#' + this.id).focus();
    }

    private formatData(format?: string) {
        this._format = format || 'MM/dd/yyyy';
        this.makeMaskForInput(this._format);
    }
}
