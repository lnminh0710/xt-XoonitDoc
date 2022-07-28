import { Component, OnInit, Inject, EventEmitter, Output } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@xn-control/light-material-ui/dialog';
import { FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';
import { DynamicField, DynamicFieldItemDropdown } from '@app/xoonit-share/processing-form/interfaces/dynamic-field.interface';
import { IMaterialControlConfig } from '@xn-control/xn-dynamic-material-control/interfaces/material-control-config.interface';
import { XnDynamicMaterialHelperService } from '@xn-control/xn-dynamic-material-control/services/xn-dynamic-matertial-helper.service';
import { takeUntil } from 'rxjs/operators';
import { ReplaySubject } from 'rxjs';
import { KeyCode } from '@app/app.constants';

@Component({
    selector: 'dynamic-field-dialog',
    templateUrl: 'dynamic-field-dialog.component.html',
    styleUrls: ['dynamic-field-dialog.component.scss'],
})
export class DynamicFieldDialogComponent implements OnInit {
    private _onDestroy = new ReplaySubject<boolean>();

    public formGroup: FormGroup;
    public ngStyleMatIcon = {
        color: 'red',
        'font-size': '18px',
    };
    public dynamicFields: DynamicField[];
    public dynamicFieldsDropdown: DynamicFieldItemDropdown[];
    public optionSelected: DynamicFieldItemDropdown;
    public controlConfigs: IMaterialControlConfig[];
    @Output() dynamicFieldAdded: EventEmitter<DynamicField> = new EventEmitter<DynamicField>();

    constructor(
        public dialogRef: MatDialogRef<DynamicFieldDialogComponent>,
        @Inject(MAT_DIALOG_DATA) public data: DynamicFieldItemDropdown[],
        private fb: FormBuilder,
        private dynamicMaterialHelper: XnDynamicMaterialHelperService,
    ) {
        this.formGroup = this.fb.group({
            title: new FormControl('', [Validators.required]),
            value: new FormControl('', []),
        });
        this.dynamicFieldsDropdown = data || [];
        this.dynamicFields = [];
        this.controlConfigs = [
            this._createAutocompleteMaterialControlConfig('title', 'Title', this.dynamicFieldsDropdown),
            this._createInputMaterialControlConfig('value', 'Value'),
        ];
    }

    ngOnInit() {
        this._registerListeners();
    }

    public addAndClose($event) {
        if (!this._validateForm()) {
            return;
        }

        let title = null;
        if (typeof this.formGroup.controls.title.value === 'string') {
            title = this.formGroup.controls.title.value;
        } else {
            title = this.formGroup.controls.title.value['fieldName'];
        }

        this.dynamicFields.push({
            fieldName: title,
            fieldValue: this.formGroup.controls.value.value,
            idDynamicFieldsEntityName: this.optionSelected?.idDynamicFieldsEntityName,
        });
        this.dialogRef.close(this.dynamicFields);
        this.optionSelected = null;
    }

    public addAndContinue($event) {
        if (!this._validateForm()) {
            return;
        }
        let title: string = null;
        let _idDynamicFieldsEntityName: string = null;

        if (typeof this.formGroup.controls.title.value === 'string') {
            title = this.formGroup.controls.title.value;
            const hasExisted = this._hasDynamicFieldNameExistedInDropdown(title);
            _idDynamicFieldsEntityName = hasExisted.found ? hasExisted.index.toString() : null;
        } else {
            title = this.formGroup.controls.title.value['fieldName'];
            _idDynamicFieldsEntityName = this.optionSelected?.idDynamicFieldsEntityName;
        }

        const newDynamicField = <DynamicField>{
            fieldName: title,
            fieldValue: this.formGroup.controls.value.value,
            idDynamicFieldsEntityName: _idDynamicFieldsEntityName,
        }
        this.dynamicFields.push(newDynamicField);
        this.formGroup.reset();
        this.optionSelected = null;
        this.dynamicFieldAdded.emit(newDynamicField);
    }

    public selectDynamicOption($event: DynamicFieldItemDropdown) {
        this.optionSelected = $event;
    }

    private _validateForm() {
        this.formGroup.markAllAsTouched();
        this.formGroup.markAsDirty();
        if (this.formGroup.invalid) {
            return false;
        }
        return true;
    }

    private _createAutocompleteMaterialControlConfig(
        fieldName: string,
        columnName: string,
        optionsAutocomplete: any[],
    ) {
        const controlConfig = this.dynamicMaterialHelper.createAutocompleteMaterialControlConfig(
            fieldName,
            columnName,
            2,
            (ctrlConfig) => {
                ctrlConfig.options = optionsAutocomplete;
                ctrlConfig.displayMemberOpt = () => 'fieldName';
                ctrlConfig.valueMemberOpt = () => 'idDynamicFieldsEntityName';
            },
        );
        return controlConfig;
    }

    private _createInputMaterialControlConfig(fieldName: string, columnName: string) {
        const controlConfig = this.dynamicMaterialHelper.createInputMaterialControlConfig(fieldName, columnName, 1);
        return controlConfig;
    }

    private _registerListeners() {
        this.dialogRef
            .keydownEvents()
            .pipe(takeUntil(this._onDestroy.asObservable()))
            .subscribe((event: KeyboardEvent) => {
                switch (event.keyCode) {
                    case KeyCode.Escape:
                        this.dialogRef.close();
                        break;

                    default:
                        break;
                }
            });
    }

    private _hasDynamicFieldNameExistedInDropdown(fieldName: string) {
        const foundIndex = this.dynamicFieldsDropdown.findIndex(dfd => dfd.fieldName === fieldName);
        return {
            found: foundIndex !== -1,
            index: foundIndex,
        };
    }
}
