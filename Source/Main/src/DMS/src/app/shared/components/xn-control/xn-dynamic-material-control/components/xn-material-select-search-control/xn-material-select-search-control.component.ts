import { Component, OnInit, Input, ChangeDetectionStrategy, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { BaseMaterialControlComponent } from '../base/base-material-control.component';
import { ISelectMaterialControlConfig } from '@xn-control/xn-dynamic-material-control/interfaces/material-control-config.interface';
import { filter, take, startWith, map, debounceTime } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { find, includes } from 'lodash-es';
import { FormControl, AbstractControl } from '@angular/forms';
import { MatAutocompleteTrigger } from '@xn-control/light-material-ui/autocomplete';

@Component({
    selector: 'xn-material-select-search-control',
    templateUrl: 'xn-material-select-search-control.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class XnMaterialSelectSearchControlComponent extends BaseMaterialControlComponent implements OnInit {
    @ViewChild('autocompleteInput', { read: MatAutocompleteTrigger }) autocompleteTrigger: MatAutocompleteTrigger;

    @Input() config: ISelectMaterialControlConfig;
    @Input() value: any;
    @Input() disabled: boolean;

    public displayMember: string;
    public valueMember: string;
    public options: any[];

    public filteredOptions: Observable<any[]>;
    public dataSelected: any;

    constructor(protected router: Router) {
        super(router);
    }

    ngOnInit() {
        this.config
            .setOptions(this.config)
            .pipe(take(1))
            .subscribe(() => {
                this.displayMember = this.config.displayMemberOpt();
                this.valueMember = this.config.valueMemberOpt();
                this.options = this.config.options;
                this.filteredOptions = this.formGroup.controls[this.config.formControlName].valueChanges.pipe(
                    startWith(''),
                    debounceTime(300),
                    map((value) => {
                        const regex = /^\d+$/g;
                        if (regex.test(value) && this.dataSelected == value) {
                            const item = find(this.options, [this.valueMember, value]) || {};
                            return item[this.displayMember] || value;
                        }
                        return value;
                    }),
                    map((value: string) => (value ? this._filter(value) : this.options.slice())),
                );
                this._reUpdateValue();
            });
        this.config.setFocus = this.focusSelectFilter.bind(this);
    }

    public displayFn(value: any) {
        if (!value) return '';
        if (typeof value === 'string') {
            const item = find(this.options, [this.valueMember, value]);
            return item ? item[this.displayMember] : value;
        }

        return typeof value === 'object' ? value[this.displayMember] || '' : value;
    }

    public select(event) {
        this.dataSelected = event.option.value;
    }

    public onInputFocus(ctrl: AbstractControl) {
        this.autocompleteTrigger.openPanel();
        this.onFocus(ctrl);
    }

    public onInputBlur(ctrl: AbstractControl) {
        if (!this.autocompleteTrigger.panelOpen) {
            this.onClose(ctrl);
            this.autocompleteTrigger.closePanel();
        }
        this.onBlur(ctrl);
    }

    public onClose(ctrl: AbstractControl) {
        if (ctrl.value && ctrl.value !== this.dataSelected) {
            const item = find(this.options, [this.displayMember, ctrl.value]) || {};
            ctrl.setValue(item[this.valueMember] || '');
            this.dataSelected = item[this.valueMember] || '';
        }
    }

    writeValue(value: any): void {
        if (typeof value === 'object' && !!value) {
            const item = find(this.options, [this.valueMember, value[this.valueMember]]);
            if (item) {
                this.dataSelected = item[this.valueMember];
                value = item[this.valueMember];
            }
        }
        this._onChange(value);
    }
    registerOnChange(fn: (value: any) => void): void {
        this._onChange = fn;
    }
    registerOnTouched(fn: (value: any) => void): void {
        this._onTouch = fn;
    }
    setDisabledState?(isDisabled: any): void {
        this.disabled = isDisabled;
    }

    private _onChange(value: any) {
        this.value = value;
    }

    private _onTouch(value: any) {
        this.value = value;
    }

    private _filter(name: string): any[] {
        const filterValue = name.toLowerCase();

        return this.options.filter((option) => includes(option[this.displayMember].toLowerCase(), filterValue));
    }

    // private _getDisplayMemberValue() {
    //     return typeof this.dataSelected === 'object' ? this.dataSelected[this.displayMember] || '' : '';
    // }

    // private _getValueMemberData() {
    //     return typeof this.dataSelected === 'object' ? this.dataSelected[this.valueMember] || '' : '';
    // }

    private focusSelectFilter() {
        this.autocompleteTrigger.setFocus();
    }

    private _reUpdateValue() {
        const item = find(this.config.options, [
            this.valueMember,
            this.formGroup.controls[this.config.formControlName].value,
        ]);
        if (item) {
            this.dataSelected = item[this.valueMember];
            this.formGroup.controls[this.config.formControlName].patchValue(item[this.valueMember]);
            this.formGroup.controls[this.config.formControlName].enable();
        }
    }

    public closePanel() {
        this.autocompleteTrigger.closePanel();
    }
}
