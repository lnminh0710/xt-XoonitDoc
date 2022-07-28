import {
    AfterViewInit,
    Component,
    ContentChild,
    EventEmitter,
    Input,
    OnChanges,
    OnInit,
    Output,
    SimpleChanges,
    TemplateRef,
} from '@angular/core';
import { FormDefinitionType } from '@app/models/common/abstract-form-definition.model';
import { DynamicFormGroupDefinition } from '@app/models/common/form-group-definition.model';
import { FormTableDefinition, FormTableSettingColumnName } from '@app/models/common/form-table-definition.model';
import { GroupFormsDefinition } from '@app/models/common/group-forms-definition.model';
import { DatatableService } from '@app/services';
import { Uti } from '@app/utilities';

@Component({
    selector: 'dynamic-form-group',
    templateUrl: 'dynamic-form-group.component.html',
    styleUrls: ['dynamic-form-group.component.scss'],
})
export class DynamicFormGroupComponent implements OnInit, AfterViewInit, OnChanges {

    private _formGroupDefinition: DynamicFormGroupDefinition;
    @Input() set formGroupDefinition(data: DynamicFormGroupDefinition) {
        this._formGroupDefinition = data;
    }

    get formGroupDefinition() {
        return this._formGroupDefinition;
    }

    @Output() initializedComponent = new EventEmitter<boolean>();

    @ContentChild('formFieldTemplate') formFieldTemplateRef: TemplateRef<any>;
    @ContentChild('formTableTemplate') formTableTemplateRef: TemplateRef<any>;
    @ContentChild('groupFormsTemplate') groupFormsTemplateRef: TemplateRef<any>;

    public FORM_DEF_TYPE = FormDefinitionType;

    constructor(private dataTableService: DatatableService) {}

    ngOnChanges(changes: SimpleChanges): void {
        if (changes.formGroupDefinition && changes.formGroupDefinition.currentValue) {
            this._handleDynamicFormGroupDef(changes.formGroupDefinition.currentValue);
        }
    }

    ngOnInit() {
        this.initializedComponent.next(true);
    }

    ngAfterViewInit(): void {}

    //public validateForm(): boolean {
    //    if (!this._isFormGroupDefValid()) {
    //        return false;
    //    }

    //    const length = this.formGroupDefinition.formDefinitions.length;
    //    let valid = true;

    //    for (let i = 0; i < length; i++) {
    //        const formDef = this.formGroupDefinition.formDefinitions[i];
    //        if (!formDef.validate) continue;

    //        valid = formDef.validate();
    //    }

    //    return valid;
    //}

    //public getFormData(): { [key: string]: any } {
    //    let data = {};

    //    if (!this._isFormGroupDefValid()) {
    //        return data;
    //    }

    //    const length = this.formGroupDefinition.formDefinitions.length;
    //    for (let i = 0; i < length; i++) {
    //        const formDef = this.formGroupDefinition.formDefinitions[i];

    //        if (!formDef.getFormatDataSave) continue;

    //        data = {
    //            ...data,
    //            ...formDef.getFormatDataSave(),
    //        };
    //    }

    //    return data;
    //}

    //public resetForm() {
    //    if (!this._isFormGroupDefValid()) {
    //        return false;
    //    }

    //    const length = this.formGroupDefinition.formDefinitions.length;
    //    for (let i = 0; i < length; i++) {
    //        const formDef = this.formGroupDefinition.formDefinitions[i];

    //        if (!formDef.reset) continue;

    //        formDef.reset();
    //    }
    //}

    //public clearForm() {
    //    if (!this._isFormGroupDefValid()) {
    //        return false;
    //    }

    //    const length = this.formGroupDefinition.formDefinitions.length;
    //    for (let i = 0; i < length; i++) {
    //        const formDef = this.formGroupDefinition.formDefinitions[i];

    //        if (!formDef.clear) continue;

    //        formDef.clear();
    //    }
    //}

    //public setDocumentMetadata(metadata: DocumentMetadata) {
    //    if (!this._isFormGroupDefValid()) {
    //        return false;
    //    }

    //    const length = this.formGroupDefinition.formDefinitions.length;
    //    for (let i = 0; i < length; i++) {
    //        const formDef = this.formGroupDefinition.formDefinitions[i];

    //        if (!formDef.setDocumentMetadata) continue;

    //        formDef.setDocumentMetadata(metadata);
    //    }
    //}

    //private _isFormGroupDefValid() {
    //    if (
    //        !this.formGroupDefinition ||
    //        !this.formGroupDefinition.formDefinitions ||
    //        !this.formGroupDefinition.formDefinitions.length
    //    ) {
    //        return false;
    //    }

    //    return true;
    //}

    private _handleDynamicFormGroupDef(dynamicFormGroupDef: DynamicFormGroupDefinition) {
        if (
            !dynamicFormGroupDef ||
            !dynamicFormGroupDef.formDefinitions ||
            !dynamicFormGroupDef.formDefinitions.length
        ) {
            return;
        }

        const length = dynamicFormGroupDef.formDefinitions.length;
        for (let i = 0; i < length; i++) {
            const formDef = dynamicFormGroupDef.formDefinitions[i];
            switch (formDef.type) {
                case FormDefinitionType.DATA_TABLE:
                    this._handleTableDef(formDef as FormTableDefinition);
                    break;

                case FormDefinitionType.GROUP_FORMS:
                    this._handleGroupFormsDef(formDef as GroupFormsDefinition);
                    break;
            }
        }
    }

    private _handleGroupFormsDef(groupFormsDef: GroupFormsDefinition) {
        if (!groupFormsDef || !groupFormsDef.formDefinitions || !groupFormsDef.formDefinitions.length) return;

        const dataGrids = [];
        const length = groupFormsDef.formDefinitions.length;

        for (let i = 0; i < length; i++) {
            const formDef = groupFormsDef.formDefinitions[i];

            // !right now we just support group of form table definition
            // !so if formDef.type !== Table then we skip it.
            if (formDef.type !== FormDefinitionType.DATA_TABLE) continue;

            const tableDef = formDef as FormTableDefinition;
            const _enterDirection = this._getEnterDirection(tableDef.columns[0].SettingColumnName[0]);

            dataGrids.push({
                id: Uti.guid(),
                data: this.dataTableService.buildEditableDataSourceV2(
                    tableDef.data,
                    tableDef.columns[0].SettingColumnName,
                    groupFormsDef.groupSetting?.groupTitle,
                ),
                title: groupFormsDef.groupSetting.groupTitle,
                enterDirection: _enterDirection,
            });
        }

        groupFormsDef.dataGrids = dataGrids;
    }

    private _handleTableDef(tableDef: FormTableDefinition) {
        if (!tableDef.columns || !tableDef.columns.length) return;

        const _enterDirection = this._getEnterDirection(tableDef.columns[0]?.SettingColumnName[0]);

        const dataGrids = [];
        dataGrids.push({
            id: Uti.guid(),
            data: this.dataTableService.buildEditableDataSourceV2(
                tableDef.data,
                tableDef.columns[0].SettingColumnName,
                tableDef.columns[0].SettingColumnName[0]?.WidgetSetting?.WidgetTitle,
            ),
            title: tableDef.columns[0].SettingColumnName[0]?.WidgetSetting?.WidgetTitle,
            enterDirection: _enterDirection,
        });

        tableDef.dataGrids = dataGrids;
    }

    private _getEnterDirection(settingColumnName: FormTableSettingColumnName): boolean {
        try {
            // Default is true, if service don't return value so that is default
            // If service return 0 that is false
            return (settingColumnName.TableDirectionSetting.EnterDirection !== 0);
        } catch (e) {
            return true;
        }
    }
}
