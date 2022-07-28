import { Component, OnInit, Inject, OnDestroy } from '@angular/core';
import { SharingContactInformationModel } from '@app/models/administration-document/document-form/sharing-contact-information.model';
import { MAT_DIALOG_DATA, MatDialogRef } from '@xn-control/light-material-ui/dialog';
import { FormBuilder, FormControl, Validators, FormGroup } from '@angular/forms';
import { ColumnDefinitionSetting, DisplayFieldSetting } from '@app/models/common/column-definition.model';
import { SelectMaterialControlConfig } from '@xn-control/xn-dynamic-material-control/models/select-material-control-config.model';
import { MaterialControlType } from '../../consts/material-control-type.enum';
import { IMaterialControlConfig } from '@xn-control/xn-dynamic-material-control/interfaces/material-control-config.interface';
import { Uti } from '@app/utilities';

@Component({
    selector: 'sharing-contact-dialog',
    templateUrl: 'sharing-contact-dialog.component.html',
    styleUrls: ['sharing-contact-dialog.component.scss'],
})
export class SharingContactDialogComponent implements OnInit, OnDestroy {

    public formGroup: FormGroup;
    public ngStyleMatIcon = {
        color: 'red',
        'font-size': '18px',
    };

    public sharingContactDropdown: SharingContactInformationModel[];
    public optionSelected: SharingContactInformationModel;
    public controlConfigs: IMaterialControlConfig[];

    constructor(
        public dialogRef: MatDialogRef<SharingContactDialogComponent>,
        @Inject(MAT_DIALOG_DATA) public data: SharingContactInformationModel[],
        private fb: FormBuilder,
    ) {
        this.formGroup = this.fb.group({
            'company': new FormControl(data[0].B00SharingCompany_Company, [Validators.required]),
        });
        this.sharingContactDropdown = data || [];
        this.controlConfigs = [
            this._createSelectMaterialControlConfig('company', 'Company', this.sharingContactDropdown),
        ];
    }

    ngOnInit() {}

    ngOnDestroy(): void {
        this.formGroup = null;
        this.optionSelected = null;
    }

    public selectAndClose($event) {
        if (!this._validateForm()) {
            return;
        }
        const selectedCompanyValue = this.formGroup.controls['company'].value;
        this.optionSelected = this.sharingContactDropdown.find(s => s.B00SharingCompany_Company === selectedCompanyValue);
        this.dialogRef.close(this.optionSelected);
    }

    private _validateForm() {
        this.formGroup.markAllAsTouched();
        this.formGroup.markAsDirty();
        if (this.formGroup.invalid) {
            return false;
        }
        return true;
    }

    private _createSelectMaterialControlConfig(fieldName: string, columnName: string, options: SharingContactInformationModel[]) {
        const newColumnSetting = <ColumnDefinitionSetting>{
            DisplayField: <DisplayFieldSetting>{
                Hidden: '0',
                ReadOnly: '0',
                OrderBy: '1',
                GroupHeader: '0',
            },
        };

        const firstOption = options[0];
        const memberProperty = Uti.nameOf(firstOption, s => s.B00SharingCompany_Company);

        const controlConfig = new SelectMaterialControlConfig({
            value: '',
            label: columnName,
            formControlName: fieldName,
            placeholder: columnName,
            setting: newColumnSetting,
            type: MaterialControlType.SELECT,
            options: [],
            setOptions: (ctrlConfig) => {
                ctrlConfig.options = options;
                ctrlConfig.displayMemberOpt = () => memberProperty;
                ctrlConfig.valueMemberOpt = () => memberProperty;
            },
        });
        return controlConfig;
    }
}
