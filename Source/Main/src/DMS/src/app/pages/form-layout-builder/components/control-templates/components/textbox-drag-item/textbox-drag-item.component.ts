import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { IMaterialControlConfig } from '@xn-control/xn-dynamic-material-control/interfaces/material-control-config.interface';
import { XnDynamicMaterialHelperService } from '@xn-control/xn-dynamic-material-control/services/xn-dynamic-matertial-helper.service';
import { BaseDragItemComponent } from '../base-drag-item.component';

@Component({
    selector: 'textbox-drag-item',
    styleUrls: ['textbox-drag-item.component.scss'],
    templateUrl: 'textbox-drag-item.component.html',
})
export class TextboxDragItemComponent extends BaseDragItemComponent implements OnInit {
    public controlConfig: IMaterialControlConfig;
    public formGroup: FormGroup;

    constructor(
        protected router: Router,
        private fb: FormBuilder,
        private dynamicMaterialHelper: XnDynamicMaterialHelperService,
    ) {
        super(router);

        this.formGroup = this.fb.group({
            fieldNameA: new FormControl('', []),
        });
        this.controlConfig = this._createInputMaterialControlConfig('fieldNameA', 'Title');
    }

    ngOnInit() {}

    private _createInputMaterialControlConfig(fieldName: string, columnName: string) {
        const controlConfig = this.dynamicMaterialHelper.createInputMaterialControlConfig(fieldName, columnName, 1);
        return controlConfig;
    }
}
