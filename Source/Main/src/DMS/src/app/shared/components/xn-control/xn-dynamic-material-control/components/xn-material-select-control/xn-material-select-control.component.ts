import { Component, OnInit, Input } from '@angular/core';
import { Router } from '@angular/router';
import { BaseMaterialControlComponent } from '../base/base-material-control.component';
import { ISelectMaterialControlConfig } from '@xn-control/xn-dynamic-material-control/interfaces/material-control-config.interface';
import { Observable } from 'rxjs';

@Component({
    selector: 'xn-material-select-control',
    templateUrl: 'xn-material-select-control.component.html',
})
export class XnMaterialSelectControlComponent extends BaseMaterialControlComponent implements OnInit {
    @Input() config: ISelectMaterialControlConfig;
    @Input() value: any;
    @Input() disabled: boolean;

    public displayMember: string;
    public valueMember: string;

    constructor(protected router: Router) {
        super(router);
    }

    ngOnInit() {
        const opt = this.config.setOptions(this.config);
        if (opt instanceof Observable) {
            opt.subscribe((status) => {
                this.displayMember = this.config?.displayMemberOpt();
                this.valueMember = this.config.valueMemberOpt();
            });
        }
        else {
            this.displayMember = this.config.displayMemberOpt();
            this.valueMember = this.config.valueMemberOpt();
        }
    }

    writeValue(value: any): void {
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
}
