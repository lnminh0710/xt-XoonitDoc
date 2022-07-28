import { Component, EventEmitter, Input, OnInit } from '@angular/core';
//import { MAT_DATE_FORMATS } from '@angular/material/core';
import { FormControl } from '@angular/forms';
import { debounceTime } from 'rxjs/operators';

export const MY_FORMATS = {
    parse: {
        dateInput: 'MM/DD/YYYY',
    },
    display: {
        dateInput: 'MM/DD/YYYY',
    },
};

@Component({
    selector: 'xn-input-horizontal',
    inputs: ['controlType', 'title', 'icon', 'placeholder', 'name', 'readonly', 'customClass'],
    outputs: ['onFocusout', 'onClick'],
    templateUrl: './xn-input-horizontal.component.html',
    styleUrls: ['./xn-input-horizontal.component.scss'],
    // providers: [{ provide: MAT_DATE_FORMATS, useValue: MY_FORMATS }],
})
export class XnInputHorizontalComponent implements OnInit {
    controlType: string | null = 'text';
    title: string | null = null;
    customClass: string | null = null;
    icon: string | null = null;
    placeholder: string | null = null;
    name: string | null = null;
    readonly: boolean = false;

    onFocusout = new EventEmitter<any>();
    onClick = new EventEmitter<any>();

    private _formControl: FormControl = new FormControl();
    alterValue: string;

    @Input() combobox: { id: any; value: any; [key: string]: any }[] = [];
    @Input() set formControl(formContrl: FormControl) {
        this._formControl = formContrl;
        if (this.controlType === 'combobox') {
            const item = this.combobox.find((p) => p.id === this.formControl.value);
            if (item) {
                this.alterValue = item.value;
            }
        }
    }

    get formControl(): FormControl {
        return this._formControl;
    }

    constructor() {}

    ngOnInit(): void {
        this.formControl.valueChanges.pipe(debounceTime(500)).subscribe(() => {
            if (this.controlType === 'combobox') {
                const item = this.combobox.find((p) => p.id === this.formControl.value);
                if (item) {
                    this.alterValue = item.value;
                }
            }
        });
    }

    focusout() {
        this.onFocusout.emit();
    }

    click() {
        this.onClick.emit();
    }
}
