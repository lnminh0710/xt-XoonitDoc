import { ChangeDetectorRef, Directive, EventEmitter, Injector, Input, OnInit, Output } from '@angular/core';
import { FormGroup, FormControl } from '@angular/forms';
import { Router } from '@angular/router';
import { MessageModal } from '@app/app.constants';
import { defaultLanguage } from '@app/app.resource';
import { ColumnDefinition } from '@app/models/common/column-definition.model';
import { FormDefinition } from '@app/models/common/form-definition.model';
import { FormFieldDefinition } from '@app/models/common/form-field-definition.model';
import { DynamicFormGroupDefinition } from '@app/models/common/form-group-definition.model';
import { CommonFormComponentV2 } from '@app/xoonit-share/processing-form-v2/common-form/common-form.component';
import { TranslateService } from '@ngx-translate/core';
import { ToasterService } from 'angular2-toaster';
import { takeUntil } from 'rxjs/operators';
import { IMaterialControlConfig } from '../../../../../shared/components/xn-control/xn-dynamic-material-control/interfaces/material-control-config.interface';

@Directive()
export abstract class CommonFormComponent extends CommonFormComponentV2 implements OnInit {
    protected cdRef: ChangeDetectorRef;
    protected toasterService: ToasterService;
    protected translateService: TranslateService;

    @Input() set formDefinition(formDef: FormFieldDefinition) {
        const formGroupDef: DynamicFormGroupDefinition = {
            methodName: '',
            object: '',
            formDefinitions: [formDef],
        };

        this.formGroupConfigDef = this._commonFormHandler.buildFormGroupDefinition(formGroupDef);
    }

    @Output() initialized = new EventEmitter<CommonFormComponent>();

    constructor(protected router: Router, protected injector: Injector) {
        super(router, injector);
        this._setOctopusDependencies();
    }

    ngOnInit() {
        super.ngOnInit();
        this.initialized.next(this);
    }

    protected registerSubscriptions(): void {}

    public setToolbar(): void {
        this.toolbar = {
            addDynamicField: true,
            resetForm: true,
            clearForm: true,
            scanOCR: true,
            scanQR: false,
        };
    }

    public applyQRCode(): void {
        // throw new Error('Method not implemented.');
    }

    public registerGetDetailFn(fn: () => DynamicFormGroupDefinition): void {
        const formGroupDef = fn();
        this.setColumnSettings(formGroupDef);
    }

    public setColumnSettings(formGroupDef: DynamicFormGroupDefinition) {
        this.formGroupConfigDef = this._commonFormHandler.buildFormGroupDefinition(formGroupDef);
        this.cdRef.detectChanges();
    }

    public getColumnSettings(): void {}

    public validateDataBeforeSaving(): boolean {
        //this.documentContainerOcr = this.documentContainerOcr || this.documentMetadata.documentContainerOcr;
        //if (!this.documentContainerOcr) {
        //    this.toasterService.pop(MessageModal.MessageType.warning, 'System', 'There is no document');
        //    return false;
        //}

        //this.folder = this.folder || this.documentMetadata.folder;
        //if (!this.folder) {
        //    this.toasterService.pop(MessageModal.MessageType.warning, 'System', 'Please assign document into a folder');
        //    return false;
        //}
        const isValid = this.validateForms();
        return isValid;
    }

    public getDataForSaving(): { [key: string]: any } {
        const docMetadata = super.mergeDocumentMetadataInfo(
            this.folder,
            this.documentContainerOcr,
            this.documentMetadata,
        );

        const hiddenValues = {
            ...docMetadata,
            idRepVietDocumentType: this.documentContainerOcr?.IdRepDocumentType,
        };
        const json = this._commonFormHandler.buildJsonForSaving(this.formGroupConfigDef, hiddenValues);

        // const data = {};

        // for (const key in json) {
        //     if (json.hasOwnProperty(key)) {
        //         const newKey = key; // key.replace('JSON', '');
        //         data[newKey] = json[key];
        //     }
        // }

        //data['SpObject'] = this.formGroupConfigDef.object;
        //data['SpMethodName'] = this.formGroupConfigDef.methodName;
        return json;
    }

    public get formTitle() {
        return this.formGroupConfigDef?.formConfigDefs[0]?.title;
    }

    public validateForms() {
        if (
            !this.formGroupConfigDef ||
            !this.formGroupConfigDef.formConfigDefs ||
            !this.formGroupConfigDef.formConfigDefs.length
        ) {
            this.toasterService.pop(MessageModal.MessageType.warning, 'System', 'There is no form to save');
            return false;
        }

        const length = this.formGroupConfigDef.formConfigDefs.length;
        const formConfigDefs = this.formGroupConfigDef.formConfigDefs;
        let formValid = true;

        for (let i = 0; i < length; i++) {
            const _formGroup = formConfigDefs[i].formGroup;
            const _formTitle = formConfigDefs[i].title;

            if (!this._validate(_formGroup)) {
                //this.translateService
                //    .get(`${_formTitle}: ${defaultLanguage.COMMON_LABEL__There_are_some_fields_are_invalid}`)
                //    .subscribe((val) => {
                //        this.toasterService.pop(MessageModal.MessageType.warning, 'System', val);
                //    });
                this.cdRef.detectChanges();
                formValid = false;
            }
        }

        return formValid;
    }

    protected _validate(formGroup: FormGroup): boolean {
        super.markFormGroupTouchedAndDirty(formGroup);
        // super.markFormGroupDynamicFieldTouchedAndDirty(this.formDynamic, this.dynamicFields);
        if (formGroup.controls) {
            const keys = Object.keys(formGroup.controls);
            keys.forEach((key) => {
                if (formGroup.controls[key].disabled) {
                    formGroup.controls[key].enable();
                    formGroup.controls[key].updateValueAndValidity();
                    const errors = formGroup.controls[key].errors;
                    formGroup.controls[key].disable();
                    formGroup.controls[key].setErrors(errors);
                }
            });
        }
        if (formGroup.invalid) {
            return false;
        }

        return true;
    }

    private _setOctopusDependencies() {
        this.cdRef = this.injector.get(ChangeDetectorRef);
        this.toasterService = this.injector.get(ToasterService);
        this.translateService = this.injector.get(TranslateService);
    }

    public getFormGroup() {
        return this.formGroupConfigDef?.formConfigDefs[0]?.formGroup;
    }

    public setFormValue(key, value) {
        const formGroup = this.getFormGroup();
        if (formGroup) {
            formGroup.controls[key]?.setValue(value);
            formGroup.updateValueAndValidity();
            if (formGroup.controls[key]?.disabled) {
                formGroup.controls[key]?.enable();
                formGroup.controls[key]?.disable();
            }
        }
    }

    public disableForm() {
        const formGroup = this.getFormGroup();
        if (formGroup) {
            const keys = Object.keys(formGroup.controls);
            keys.forEach((key) => {
                formGroup.controls[key].disable();
            });
        }
    }

    public enableForm() {
        const formGroup = this.getFormGroup();
        if (formGroup) {
            const keys = Object.keys(formGroup.controls);
            const formNeedEnableMap = new Map<string, boolean>();
            this.formGroupConfigDef.formConfigDefs.forEach((formConfigDef) => {
                formConfigDef.controlConfigs.forEach((controlConfig) => {
                    if (!formNeedEnableMap.has(controlConfig.formControlName)) {
                        formNeedEnableMap.set(
                            controlConfig.formControlName,
                            controlConfig.setting.DisplayField.ReadOnly === '0',
                        );
                    }
                });
            });
            keys.forEach((key) => {
                if (formNeedEnableMap.get(key)) {
                    formGroup.controls[key].enable();
                }
            });
        }
    }

    public disableControl(key: string) {
        const formGroup = this.getFormGroup();
        if (formGroup) {
            formGroup.controls[key].disable();
        }
    }

    public listenChangedOnControl(key: string, callback: Function) {
        const formGroup = this.getFormGroup();
        if (formGroup) {
            const formCtrl = formGroup.controls[key] as FormControl;
            if (formCtrl) {
                formCtrl.valueChanges.pipe(takeUntil(this.onDetachForm$)).subscribe((value: any) => {
                    if (callback) {
                        callback(formCtrl, value);
                    }
                });
            }
        }
    }

    public setInvisibleField(field: string, status: boolean) {
        this.formGroupConfigDef.formConfigDefs.forEach((formConfigDef) => {
            formConfigDef.controlConfigs.forEach((controlConfig) => {
                if (controlConfig.formControlName == field) {
                    controlConfig.invisible = status;
                }
            });
        });
        this.cdRef.detectChanges();
    }

    public setHiddenField(field: string, status: boolean) {
        this.formGroupConfigDef.formConfigDefs.forEach((formConfigDef) => {
            formConfigDef.controlConfigs.forEach((controlConfig) => {
                if (controlConfig.formControlName == field) {
                    controlConfig.hidden = status;
                }
            });
        });
        this.cdRef.detectChanges();
    }

    public getDisplayFields(): Array<{ key: string; value: string }> {
        let fields = [];
        this.formGroupConfigDef.formConfigDefs.forEach((formConfigDef) => {
            formConfigDef.controlConfigs.forEach((controlConfig) => {
                if (!controlConfig.hidden) {
                    const materialControlConfig = controlConfig as IMaterialControlConfig;
                    fields.push({
                        key: materialControlConfig.formControlName,
                        value: materialControlConfig.label,
                    });
                }
            });
        });
        return fields;
    }

    public isAllDisplayFieldsEmpty(): boolean {
        let isEmpty = true;
        const formGroup = this.getFormGroup();
        const formGroupConfigDef = this.formGroupConfigDef?.formConfigDefs;
        if (!formGroup.value || !formGroup?.controls) return isEmpty;
        for (let index = 0; index < formGroupConfigDef.length; index++) {
            const formConfigDef = formGroupConfigDef[index];
            const allDisplayField = formConfigDef.controlConfigs.filter((x) => !x.hidden);
            if (!allDisplayField?.length) continue;

            for (let index = 0; index < allDisplayField.length; index++) {
                const displayField = allDisplayField[index];
                if (displayField?.formControlName && formGroup.value[displayField.formControlName]) {
                    isEmpty = false;
                    break;
                }
            }
        }

        return isEmpty;
    }
}
