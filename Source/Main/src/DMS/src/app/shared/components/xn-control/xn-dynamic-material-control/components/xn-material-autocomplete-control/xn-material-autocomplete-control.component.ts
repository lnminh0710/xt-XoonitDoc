import { Component, OnInit, Input, ViewChild } from '@angular/core';
import { BaseMaterialControlComponent } from '../base/base-material-control.component';
import { Router } from '@angular/router';
import { IAutocompleteMaterialControlConfig } from '@xn-control/xn-dynamic-material-control/interfaces/material-control-config.interface';
import { Observable, of } from 'rxjs';
import { debounceTime, distinctUntilChanged, map, startWith, switchMap, tap } from 'rxjs/operators';
import { MatAutocompleteSelectedEvent, MatAutocompleteTrigger } from '@xn-control/light-material-ui/autocomplete';
import { isNullOrUndefined, isArray, isString } from 'util';
import { trim, toLower } from 'lodash-es';
import { AutocompleteOptionsState } from '@xn-control/xn-dynamic-material-control/models/autocomplete-material-control-config.model';
import { MatOption } from '@xn-control/light-material-ui/core';

@Component({
    selector: 'xn-material-autocomplete-control',
    templateUrl: 'xn-material-autocomplete-control.component.html',
})
export class XnMaterialAutocompleteControlComponent extends BaseMaterialControlComponent implements OnInit {
    private _autocompleteOptionsState: AutocompleteOptionsState;

    @Input() config: IAutocompleteMaterialControlConfig;
    @Input() value: any;
    @Input() disabled: boolean;

    @ViewChild('autocompleteInput', { read: MatAutocompleteTrigger }) autocompleteTrigger: MatAutocompleteTrigger;

    public displayMember: string;
    public valueMember: string;
    public filterOptions: Observable<any[]>;
    public selected: any;
    public highlightSearchText: boolean;

    public options: Observable<any[]>;

    constructor(protected router: Router) {
        super(router);
    }

    ngOnInit() {
        this.config.setOptions(this.config);

        if (isArray(this.config.options)) {
            this.options = Observable.of(this.config.options);
        } else if (this.config.options instanceof Observable) {
            this.options = this.config.options;
        }

        this.options = this.options || Observable.of([]);
        this._autocompleteOptionsState = {
            hasOptions: false,
            options: [],
        };

        this.displayMember = this.config.displayMemberOpt();
        this.valueMember = this.config.valueMemberOpt();
        this.highlightSearchText = this.config.highlightSearchText || false;
        this.config.updateOptions = this.updateOptions.bind(this);
        this.config.disableAutocomplete = this.disableAutocomplete.bind(this);
        this.config.enableAutocomplete = this.enableAutoComplete.bind(this);
        this.config.openAutocompleteOptions = this.openAutocompleteOptions.bind(this);
        this.config.closeAutocompleteOptions = this.closeAutocompleteOptions.bind(this);
        this.config.setFocus = this.focusAutocomplete.bind(this);
        this.config.getAutocompleteOptionsState = this._getAutocompleteOptionsState.bind(this);
        this.config.setValueAtIndex = this._setValueAtIndex.bind(this);
        this.config.getSelectedAutocomplete = this._getSelectedAutocomplete.bind(this);

        this.filterOptions = this.formGroup.controls[this.config.formControlName].valueChanges.pipe(
            startWith(''),
            debounceTime(300),
            distinctUntilChanged(),
            switchMap((val: string | Object) => {
                if (this.autocompleteTrigger.autocompleteDisabled) return of([]);

                if (isNullOrUndefined(val)) {
                    return of([...this.config.options]);
                }

                let valLowerCase = '';
                if (typeof val === 'string') {
                    valLowerCase = val.toLowerCase();
                } else {
                    valLowerCase = val[this.displayMember].toLowerCase();
                }
                valLowerCase = trim(valLowerCase);
                if (this.highlightSearchText) {
                    return this._highlightOption(typeof val === 'string' ? val : val[this.displayMember]);
                }
                return this.options.pipe(
                    map((_options: any[]) => {
                        return _options.filter((opt) => this._filterFunc(opt, valLowerCase));
                    }),
                );
            }),
            tap((filterOptions: any[]) => {
                this._setAutocompleteOptionsState(filterOptions);
            }),
        );
    }

    public writeValue(value: any): void {
        this._onChange(value);
    }
    public registerOnChange(fn: (value: any) => void): void {
        this._onChange = fn;
    }
    public registerOnTouched(fn: (value: any) => void): void {
        this._onTouch = fn;
    }
    public setDisabledState?(isDisabled: any): void {
        this.disabled = isDisabled;
    }

    public disableAutocomplete() {
        this.autocompleteTrigger.autocompleteDisabled = true;
    }

    public enableAutoComplete() {
        this.autocompleteTrigger.autocompleteDisabled = false;
    }

    public openAutocompleteOptions() {
        this.autocompleteTrigger.openPanel();
    }

    public closeAutocompleteOptions() {
        this.autocompleteTrigger.closePanel();
    }

    public focusAutocomplete() {
        this.autocompleteTrigger.setFocus();
    }

    public updateOptions(options: any[] | Observable<any[]>) {
        this.filterOptions = this._setOptions(options).pipe(
            tap((_options: any[]) => {
                this._setAutocompleteOptionsState(_options);
            }),
        );
    }

    public keyPress($event: KeyboardEvent) {
        if (this.config.ignoreKeyCodes && this.config.ignoreKeyCodes.indexOf($event.keyCode) !== -1) {
            $event.preventDefault();
            return false;
        }
        return true;
    }

    public displayFn(value: any): string {
        if (isNullOrUndefined(value)) return '';
        if (isString(value)) return value;

        return value[this.displayMember];
    }

    public selectOption($event: MatAutocompleteSelectedEvent) {
        this.selected = $event.option.value;
        this.controlValueChanged.emit(this.selected);
    }

    private _onChange(value: any) {
        this.value = value;
    }

    private _onTouch(value: any) {
        this.value = value;
    }

    private _highlightOption(highlightText: string) {
        if (!highlightText) return this.options;

        const valLowerCase = trim(highlightText.toLowerCase());
        highlightText = trim(highlightText.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, '\\$&'));

        return this.options.pipe(
            map((_options: any[]) => {
                _options = _options.filter((opt) => this._filterFunc(opt, valLowerCase));
                if (!highlightText) return _options;
                _options.forEach((element) => {
                    element.HighlightOption = element[this.displayMember].replace(
                        new RegExp(highlightText, 'i'),
                        `<b class="mat-option--highlight">$&</b>`,
                    );
                    return element;
                });
                return _options;
            }),
        );
    }

    private _filterFunc(_opt: any, textSearch: string) {
        const optionValue = toLower(trim(_opt[this.displayMember]));

        // get result start with textSearch but this func is implement in API OR SP_STORE
        return optionValue.indexOf(textSearch) === 0;
    }

    private _setOptions(options: any[] | Observable<any[]>): Observable<any[]> {
        if (isArray(options)) {
            this.options = Observable.of(options);
        } else if (options instanceof Observable) {
            this.options = options;
        }

        this.options = (options as Observable<any[]>) || of([]);

        if (!this.formGroup) return of([]);

        const ctrl = this.formGroup.controls[this.config.formControlName];
        let valLowerCase = ctrl.value?.toLowerCase() || '';
        valLowerCase = trim(valLowerCase);

        if (this.highlightSearchText) {
            return this._highlightOption(ctrl.value);
        }

        return this.options.pipe(
            map((_options: any[]) => {
                return _options.filter((opt) => this._filterFunc(opt, valLowerCase));
            }),
        );
    }

    private _getAutocompleteOptionsState(): AutocompleteOptionsState {
        return this._autocompleteOptionsState;
    }

    private _setAutocompleteOptionsState(options: any[]) {
        this._autocompleteOptionsState.hasOptions = options && options.length > 0;
        this._autocompleteOptionsState.options = options || [];
    }

    private _setValueAtIndex(index: number) {
        const autoCompleteOptionsState = this._getAutocompleteOptionsState();
        if (!autoCompleteOptionsState.hasOptions || autoCompleteOptionsState.options.length <= 0) return;

        // if the number of count autocompleteOptionsState model is different from this.autocompleteTrigger
        if (autoCompleteOptionsState.options.length !== this.autocompleteTrigger.autocomplete.options.length) return;

        // if index is out of range of option item in array
        if (index >= autoCompleteOptionsState.options.length) return;

        const _options = this.autocompleteTrigger.autocomplete.options.toArray();

        const selectedOption = _options[index];
        this.selected = selectedOption.value;
        // if (selectedOption.value[this.valueMember] === this.autocompleteTrigger.activeOption.value[this.valueMember]) return;

        this.formGroup.controls[this.config.formControlName].setValue(selectedOption.value[this.valueMember]);
    }

    private _getSelectedAutocomplete() {
        return this.selected;
    }
}
