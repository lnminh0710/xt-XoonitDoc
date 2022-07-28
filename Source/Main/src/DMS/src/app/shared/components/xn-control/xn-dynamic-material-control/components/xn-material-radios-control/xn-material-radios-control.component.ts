import { Component, OnInit, Input, ViewChild, QueryList, ViewChildren } from '@angular/core';
import { BaseMaterialControlComponent } from '../base/base-material-control.component';
import { IRadiosMaterialControlConfig } from '@xn-control/xn-dynamic-material-control/interfaces/material-control-config.interface';
import { Router } from '@angular/router';
import { MatRadioGroup, MatRadioButton } from '@xn-control/light-material-ui/radio';

@Component({
    selector: 'xn-material-radios-control',
    templateUrl: 'xn-material-radios-control.component.html',
    styleUrls: ['xn-material-radios-control.component.scss'],
})
export class XnMaterialRadiosControlComponent extends BaseMaterialControlComponent implements OnInit {

    @Input() config: IRadiosMaterialControlConfig;
    @Input() value: any;
    @Input() disabled: boolean;

    public displayMember: string;
    public valueMember: string;

    @ViewChild('matRadioGroupRef', { read: MatRadioGroup }) matRadioGroup: MatRadioGroup;
    @ViewChildren('matRadioButtonRef') matRadioButtons: QueryList<MatRadioButton>;

    constructor(protected router: Router) {
        super(router);
    }

    ngOnInit() {
        this.config.setOptions(this.config);
        this.displayMember = this.config.displayMemberOpt();
        this.valueMember = this.config.valueMemberOpt();
        this.config.enableRadioGroup = this.enableRadioGroup.bind(this);
        this.config.disableRadioGroup = this.disableRadioGroup.bind(this);
        this.config.enableRadioButton = this.enableRadioButton.bind(this);
        this.config.disableRadioButton = this.disableRadioButton.bind(this);
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

    public enableRadioGroup() {
        this.matRadioGroup.disabled = false;
    }

    public disableRadioGroup() {
        this.matRadioGroup.disabled = true;
    }

    public enableRadioButton(radioValue: any) {
        const found = this._getRadioButtonByValue(radioValue);
        if (!found) return;

        found.disabled = false;
    }

    public disableRadioButton(radioValue: any) {
        const found = this._getRadioButtonByValue(radioValue);
        if (!found) return;

        found.disabled = true;
    }

    private _onChange(value: any) {
        this.value = value;
    }

    private _onTouch(value: any) {
        this.value = value;
    }

    private _getRadioButtonByValue(radioValue: any) {
        return this.matRadioButtons.find(rb => rb.value === radioValue);
    }
}