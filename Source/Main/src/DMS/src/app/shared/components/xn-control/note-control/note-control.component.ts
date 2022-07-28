import { DatePipe } from '@angular/common';
import {
    AfterViewInit,
    Component,
    EventEmitter,
    forwardRef,
    Input,
    OnDestroy,
    Output,
    QueryList,
    ViewChildren,
} from '@angular/core';
import {
    AbstractControl,
    ControlValueAccessor,
    FormArray,
    FormBuilder,
    FormControl,
    NG_VALUE_ACCESSOR,
} from '@angular/forms';
import { User } from '@app/models';
import { Note, NoteDocument, NoteEnum, NoteLoading } from '@app/models/note.model';
import { XnBsDatepickerComponent } from '@app/xoonit-share/components/xn-bs-datepicker/xn-bs-datepicker.component';
import { DatepickerMaterialControlConfig } from '@xn-control/xn-dynamic-material-control/models/datepicker-material-control-config.model';
import { XnDynamicMaterialHelperService } from '@xn-control/xn-dynamic-material-control/services/xn-dynamic-matertial-helper.service';
import { BsDatepickerConfig } from 'ngx-bootstrap/datepicker';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
    selector: 'note-control',
    templateUrl: './note-control.component.html',
    styleUrls: ['./note-control.component.scss'],
    providers: [
        {
            provide: NG_VALUE_ACCESSOR,
            useExisting: forwardRef(() => NoteControlComponent),
            multi: true,
        },
    ],
})
export class NoteControlComponent implements ControlValueAccessor, AfterViewInit, OnDestroy {
    readonly Object = Object;
    readonly NoteEnum = NoteEnum;

    formArrays: FormArray = this.fb.array([] as Note[] | NoteDocument[]);
    pristineFormArrays: any[] = [];
    selectedDate: Date = new Date();
    isDisabled = false;
    bsConfig: Partial<BsDatepickerConfig>;
    perfectScrollbarConfig: any;
    addingForm: AbstractControl;
    loading: NoteLoading = {
        share: false,
        download: false,
        print: false,
    };

    private onChange: (value: Note[] | NoteDocument[]) => void = () => {};
    private onTouched: Function = () => {};
    private subject: Subject<boolean> = new Subject<boolean>();

    public datepickerConfig: DatepickerMaterialControlConfig;

    @Input() currentUser: User;
    @Input() isDetail: boolean;
    @Input() isHideAddButton: boolean;
    @Input() isHistoryDetail: boolean;
    @Output() onSaveForm: EventEmitter<{ form: AbstractControl; callback: Function }> = new EventEmitter<{
        form: AbstractControl;
        callback: Function;
    }>();
    @Output() onShare: EventEmitter<any> = new EventEmitter<any>();
    @Output() onDownload: EventEmitter<any> = new EventEmitter<any>();
    @Output() onPrint: EventEmitter<any> = new EventEmitter<any>();
    @Output() onFocusForm: EventEmitter<{ form: FormControl; id: string }> = new EventEmitter<{
        form: FormControl;
        id: string;
    }>();

    constructor(
        private fb: FormBuilder,
        private datePipe: DatePipe,
        private xnDynamicMaterialControlHelper: XnDynamicMaterialHelperService,
    ) {}

    ngOnInit() {
        this.setDatePickerConfig();
    }

    ngOnDestroy() {
        this.subject.next();
    }

    ngAfterViewInit() {
        this.formArrays.valueChanges.pipe(takeUntil(this.subject)).subscribe(() => {
            this.onTouched();
            this.onChange(this.formArrays.value);
        });
    }

    writeValue(value: Note[] | NoteDocument[]) {
        this.removeAllForm();
        this.pristineFormArrays = value || [];
        this.addingForm = null;
        if (value?.length) {
            value.forEach((v) => {
                let form;
                if (v.idMainDocument && v.idMainDocumentNotes) {
                    form = this.fb.group(
                        new NoteDocument({
                            date: v.date,
                            notes: v.notes,
                            loginName: v.loginName,
                            idLogin: v.idLogin,
                            idMainDocumentNotes: v.idMainDocumentNotes,
                            isDeleted: v.isDeleted,
                            editing: v.editing,
                            removeable: v.removeable,
                            cancelable: v.cancelable,
                            idMainDocument: v.idMainDocument,
                            isActive: v.isActive,
                        }),
                    );
                } else {
                    form = this.fb.group(
                        new Note({
                            date: v.date,
                            notes: v.notes,
                            loginName: v.loginName,
                            idLogin: v.idLogin,
                            idInvoiceApprovalNotes: v.idInvoiceApprovalNotes,
                            isDeleted: v.isDeleted,
                            editing: v.editing,
                            removeable: v.removeable,
                            cancelable: v.cancelable,
                            idInvoiceMainApproval: v.idInvoiceMainApproval,
                            isActive: v.isActive,
                        }),
                    );
                }

                this.formArrays.push(form);
            });
        }
    }

    registerOnChange(fn: (args: any) => void) {
        this.onChange = fn;
    }

    registerOnTouched(fn: Function) {
        this.onTouched = fn;
    }

    setDisabledState(disabled: boolean) {
        this.isDisabled = disabled;
    }

    addNote() {
        const newForm = this.fb.group(
            new Note({
                date: new Date(),
                notes: '',
                loginName: this.currentUser.getName(),
                idLogin: this.currentUser.id,
                editing: true,
                removeable: true,
                cancelable: false,
            }),
        );
        this.formArrays.insert(0, newForm);
        this.addingForm = newForm;
    }

    changeDate(date: Date) {
        this.selectedDate = date;
    }

    editForm(form: AbstractControl, edited: boolean, indexForm: number) {
        let oldValue: Note | NoteDocument;
        if (!edited) {
            oldValue = this.pristineFormArrays.find((f) => {
                return (
                    f.idInvoiceApprovalNotes === form.value.idInvoiceApprovalNotes ||
                    f.idMainDocumentNotes === form.value.idMainDocumentNotes
                );
            });
            form.patchValue({ ...oldValue, editing: edited, cancelable: edited });
            return;
        }
        form.patchValue({ editing: edited, cancelable: edited });
    }

    saveForm(form: AbstractControl, isDeleted: NoteEnum) {
        // emit form
        const callback = (): void => {
            form.patchValue({ editing: false, cancelable: false, removeable: false });
            let index = this.pristineFormArrays.findIndex(
                (f) =>
                    f.idInvoiceApprovalNotes === form.value.idInvoiceApprovalNotes ||
                    f.idMainDocumentNotes === form.value.idMainDocumentNotes,
            );
            if (index > -1) {
                this.pristineFormArrays[index] = form.value;
            } else {
                this.pristineFormArrays.push(form.value);
            }
        };
        form.patchValue({ isDeleted, isActive: isDeleted === NoteEnum.ZERO ? NoteEnum.ONE : NoteEnum.ZERO });
        if (form === this.addingForm) {
            this.addingForm = null;
        }
        this.onSaveForm.emit({ form, callback });
    }

    onFocus(event: FocusEvent, form: FormControl) {
        this.onFocusForm.emit({ form, id: event.target?.['id'] });
    }

    removeForm(index: number) {
        if (this.formArrays.controls[index] === this.addingForm) {
            this.addingForm = null;
        }
        this.formArrays.removeAt(index);
    }

    share() {
        const callback = () => {
            this.loading.share = false;
        };
        this.loading.share = true;
        this.onShare.emit({ callback });
    }

    download() {
        const callback = () => {
            this.loading.download = false;
        };
        this.loading.download = true;
        this.onDownload.emit({ callback });
    }

    print() {
        const callback = () => {
            this.loading.print = false;
        };
        this.loading.print = true;
        this.onPrint.emit({ callback });
    }

    private setDatePickerConfig() {
        // this.datepickerConfig = this.xnDynamicMaterialControlHelper.createDatepickerMaterialControlConfig(
        //   'date',
        //   '',
        //   1,
        // );
        // this.bsConfig = new BsDatepickerConfig();
        // this.bsConfig.containerClass = 'theme-default';
        // this.bsConfig.showWeekNumbers = false;
        // this.bsConfig.dateInputFormat = 'DD.MM.YYYY';
        // this.bsConfig.maxDate = new Date();
    }

    private removeAllForm() {
        while (this.formArrays.length) {
            this.formArrays.removeAt(0);
        }
    }
}
