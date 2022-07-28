import { Injectable, Output, EventEmitter, Injector, ViewChild } from '@angular/core';
import { AppErrorHandler } from '@app/services';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Configuration } from '@app/app.constants';
import { FormOutputModel } from '@app/models';
import camelCase from 'lodash-es/camelCase';
import cloneDeep from 'lodash-es/cloneDeep';
import isEmpty from 'lodash-es/isEmpty';
import lowerFirst from 'lodash-es/lowerFirst';
import { Uti, CustomValidators } from '@app/utilities';
import { BaseComponent } from '@app/pages/private/base';
import { Router } from '@angular/router';
import { ControlFocusComponent } from '@app/shared/components/xn-form';
import { Observable, Subscription } from 'rxjs';
import { debounceTime } from 'rxjs/operators';

@Injectable()
export abstract class FormBase extends BaseComponent {
    public perfectScrollbarConfig: any;
    public isRenderForm = false;
    public formGroup: FormGroup;
    public outputModel: FormOutputModel;
    public defaultData: any;
    public mandatoryData: any;
    public mandatoryColor: any;
    public mandatoryGroup: any;
    public mandatoryGroupItems: any;
    public crossFormGroupData: any = {};
    public globalDateFormat: string = null;
    public hiddenFields: any = {};
    public formBuilder: FormBuilder;
    public consts: Configuration;
    public appErrorHandler: AppErrorHandler;

    protected countrySelectedItem: any;
    protected mainId: any;
    protected formEditMode = false;
    protected formEditData = null;
    protected formEditModeState: Observable<boolean>;
    protected formEditDataState: Observable<any>;
    protected formEditModeStateSubscription: Subscription;
    protected formEditDataStateSubscription: Subscription;

    protected maxCharactersNotes = 0;
    protected isAutoBuildMandatoryField: boolean = false;
    protected formValuesChangeSubscription: Subscription;

    private crossFormGroupDataOld: any = {};
    private mandatoryColorCached: any;

    @ViewChild('focusControl') focusControl: ControlFocusComponent;

    @Output() outputData: EventEmitter<any> = new EventEmitter();

    constructor(
        protected injector: Injector,
        protected router: Router
    ) {
        super(router);

        this.perfectScrollbarConfig = {
            suppressScrollX: false,
            suppressScrollY: false
        };

        this.formBuilder = new FormBuilder();
        this.consts = new Configuration();
        this.appErrorHandler = new AppErrorHandler(this.injector);
        this.outputModel = new FormOutputModel();
        this.maxCharactersNotes = this.consts.noteLengthDefault;
    }

    public abstract submit();
    public abstract isDirty(): boolean;
    public abstract isValid(): boolean;
    public abstract prepareSubmitData(): any;

    protected callSubmit() {
        this.formGroup['submitted'] = true;
        this.formGroup.updateValueAndValidity();
    }

    protected initForm(objectGroup: any, autoSubscribe: boolean = false) {
        this.formGroup = this.formBuilder.group(objectGroup);
        this.formGroup['leftCharacters'] = this.maxCharactersNotes;
        this.formGroup['submitted'] = false;
        if (autoSubscribe) {
            this.subscribeFormValueChange();
        }
    }

    protected afterViewInit() {
        if (this.formEditMode && this.formEditData.id) {
            this.mainId = +this.formEditData.id;
            this.getEditData();
        }
    }

    protected getEditData() {
        // Implement behaviour for parent
    }

    protected makeMadatoryField(rawData: any, clientDefaultData?: any): any {
        if (!rawData || !rawData.length) return;
        this.mandatoryGroup = [];
        this.mandatoryGroupItems = [];
        this.mandatoryData = {};
        this.defaultData = {};

        this.mandatoryColor = {};
        for (const item of rawData) {
            this.defaultData[camelCase(item.Fieldname)] = item.DefaultValue;
            this.mandatoryData[camelCase(item.Fieldname)] = true;
            this.mandatoryColor[camelCase(item.Fieldname)] = item.GroupsColor;
            this.addMandatoryGroup(item);
        }
        if (clientDefaultData) {
            for (const item in clientDefaultData) {
                if (!this.defaultData[item]) {
                    this.defaultData[item] = clientDefaultData[item];
                }
            }
        }
        this.mandatoryColorCached = cloneDeep(this.mandatoryColor);
    }

    private addMandatoryGroup(groupItem: any) {
        this.mandatoryGroup.push({
            fieldName: camelCase(groupItem.Fieldname),
            groupName: groupItem.Groups
        });
        if (this.mandatoryGroupItems.indexOf(groupItem.Groups) < 0 && groupItem.Groups != '0') {
            this.mandatoryGroupItems.push(groupItem.Groups);
        }
    }


    protected makeValidationForFormControl() {
        this.setCrossFormGroupData();
        const groupChanged: Array<any> = this.getGroupItemChange();
        if (!groupChanged || !groupChanged.length)
            return;

        let groupFields: Array<any> = [];
        groupChanged.forEach(groupItem => {
            groupFields = this.mandatoryGroup.filter(x => { return x.groupName == groupItem.groupName });
            if (groupFields) {
                for (let groupField of groupFields) {
                    // add validatoin for all item in this group
                    this.addValidationForControl(this.formGroup.controls, groupField.fieldName);
                }
                // remove validation for control in special
                for (let groupField of groupFields) {
                    if ((typeof this.crossFormGroupData[groupField.fieldName] === 'object' && !isEmpty(this.crossFormGroupData[groupField.fieldName]))
                        || (this.crossFormGroupData[groupField.fieldName] && typeof this.crossFormGroupData[groupField.fieldName] === 'string' && !!this.crossFormGroupData[groupField.fieldName].trim())
                        || (typeof this.crossFormGroupData[groupField.fieldName] === 'boolean' && this.crossFormGroupData[groupField.fieldName])) {
                        this.removeValidationWithoutThisControl(groupField.fieldName, groupFields);
                        break;
                    }
                }
            }
        });
    }

    protected setDefaultDataForForm() {
        for (let item in this.defaultData) {
            this.setDefaultDataForControl(this.formGroup.controls, item);
        }
        this.makeValidationForFormControl();
    }

    protected subscribeFormValueChange(func1?: Function, condition: boolean = true) {
        if (this.formValuesChangeSubscription) this.formValuesChangeSubscription.unsubscribe();

        this.formValuesChangeSubscription = this.formGroup.valueChanges
            .pipe(
                debounceTime(this.consts.valueChangeDeboundTimeDefault)
            )
            .subscribe((data) => {
                this.appErrorHandler.executeAction(() => {
                    this.processFormChanged();
                });
            });
    }

    protected processFormChanged(func1?: Function, condition: boolean = true) {
        if (!(this.formGroup.pristine && this.formGroup.untouched) && condition) {
        if (func1) {
            func1();
        }
        this.setFormOutputData(null);
        Uti.setNullValueForBooleanWhenFalse(this.formGroup);
        if (!this.isAutoBuildMandatoryField) return;
        this.makeValidationForFormControl();
    }
    }

    protected getFieldNameChanged() {
        let changedFields: Array<string> = [];
        for (let item in this.crossFormGroupData) {
            if (Uti.isDateValid(this.crossFormGroupData[item]) || Uti.isDateValid(this.crossFormGroupDataOld[item])) {
                var date1 = this.crossFormGroupData[item] ? this.crossFormGroupData[item].getFullYear() + '/' + (this.crossFormGroupData[item].getMonth() + 1) + '/' + this.crossFormGroupData[item].getDate() : '';
                var date2 = this.crossFormGroupDataOld[item] ? this.crossFormGroupDataOld[item].getFullYear() + '/' + (this.crossFormGroupDataOld[item].getMonth() + 1) + '/' + this.crossFormGroupDataOld[item].getDate() : '';
                if (date1 !== date2) {
                    changedFields.push(item);
                }
            } else if (typeof this.crossFormGroupData[item] === 'object' || typeof this.crossFormGroupDataOld[item] === 'object') {
                if (JSON.stringify(this.crossFormGroupData[item]) !== JSON.stringify(this.crossFormGroupDataOld[item])) {
                    changedFields.push(item);
                }
            } else if (this.crossFormGroupData[item] !== this.crossFormGroupDataOld[item]) {
                changedFields.push(item);
            }
        }
        return changedFields;
    }

    private getGroupItemChange(): any {
        let groupItems: Array<string> = [];

        const fieldNameChanged: Array<string> = this.getFieldNameChanged();
        if (!fieldNameChanged || !fieldNameChanged.length)
            return groupItems;

        fieldNameChanged.forEach(field => {
            let groupField = this.mandatoryGroup.find(x => { return x.fieldName == field });
            if (groupField && groupField.groupName != '0') {
                groupItems.push(groupField);
            }
        })
        return groupItems;
    }

    private setDefaultDataForControl(formControls: any, controlName: string) {
        for (let item in formControls) {
            if (item == controlName) {
                if (!formControls[item].value) {
                    formControls[item].setValue(this.defaultData[controlName]);
                    formControls[item].updateValueAndValidity();
                }
                return;
            }
        }
        for (let item in formControls) {
            if (formControls[item].controls) {
                this.setDefaultDataForControl(formControls[item].controls, controlName);
            }
        }
    }

    private addValidationForControl(formControls: any, controlName: string) {
        for (let item in formControls) {
            if (item == controlName) {
                this.mandatoryColor[item] = this.mandatoryColorCached[item];
                formControls[item].setValidators(formControls[item]['isTextBox'] ? CustomValidators.required : Validators.required);
                formControls[item].setErrors({ 'required': true });
                formControls[item].updateValueAndValidity();
                return;
            }
        }
        for (let item in formControls) {
            if (formControls[item].controls) {
                this.addValidationForControl(formControls[item].controls, controlName);
            }
        }
    }

    private removeValidationWithoutThisControl(fieldName: string, groupFields: any) {
        for (let groupField of groupFields) {
            if (groupField.fieldName != fieldName) {
                this.removeValidationForControl(this.formGroup.controls, groupField.fieldName);
            }
        }
    }

    private removeValidationForControl(formControls: any, controlName: string) {
        for (let item in formControls) {
            if (item == controlName) {
                if (!this.crossFormGroupData[item])
                    this.mandatoryColor[item] = '';
                formControls[item].clearValidators();
                formControls[item].setErrors(null);
                formControls[item].updateValueAndValidity();
                return;
            }
        }
        for (let item in formControls) {
            if (formControls[item].controls) {
                this.removeValidationForControl(formControls[item].controls, controlName);
            }
        }
    }

    private setCrossFormGroupData() {
        if (!this.formGroup || !this.formGroup.controls) { return; }
        this.crossFormGroupDataOld = cloneDeep(this.crossFormGroupData);
        this.crossFormGroupData = {};
        this.makeCrossFormGroupData(this.crossFormGroupData, this.formGroup.controls);
    }

    private makeCrossFormGroupData(crossFormGroupData, data) {
        for (const item in data) {
            if (data[item] && data[item]['controls']) {
                this.makeCrossFormGroupData(crossFormGroupData, data[item]['controls']);
            } else {
                crossFormGroupData[item] = data[item].value;
            }
        }
    }

    protected setValueForOutputModel(data: any) {
        this.outputModel = data;
        this.outputData.emit(this.outputModel);
    }

    protected setFormOutputData(submitResult: any, returnID?: any) {
        this.setValueOutputModel(submitResult, returnID);
        this.outputData.emit(this.outputModel);
    }

    private setValueOutputModel(submitResult: any, returnID?: any) {
        this.outputModel = new FormOutputModel({
            submitResult: submitResult,
            formValue: this.formGroup.value,
            isValid: this.isValid(),
            isDirty: this.isDirty(),
            returnID: returnID
        });
    }

    protected buidlHiddenFields(currentData: any) {
        this.hiddenFields = {};
        if (!currentData || !currentData.sharingAddressHiddenFields) {
            return;
        }
        let rawHiddenData = currentData['sharingAddressHiddenFields'].value;
        let arrHidden = rawHiddenData.split(';');
        for (let item of arrHidden) {
            this.hiddenFields[lowerFirst(item)] = true;
            this.removeValidationForControl(this.formGroup.controls, item);
        }
    }


    protected updateLeftCharacters(event) {
        setTimeout(() => {
            this.formGroup['leftCharacters'] = this.maxCharactersNotes - event.target.value.length;
        });
    }

    protected onCountryChangedHandler($event: any) {
        $event = $event || {};
        this.countrySelectedItem = $event;
        this.buidlHiddenFields({ sharingAddressHiddenFields: { value: $event.sharingAddressHiddenFields || '' } });
        if (this.focusControl) {
            const noFocusFirstControl = this.focusControl.hasControl() ? true : false ;
            this.focusControl.initControl(noFocusFirstControl);
        }
    }
}
