import { ChangeDetectorRef, Directive, Injector, OnDestroy, OnInit, Output, EventEmitter } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { ApiResultResponse } from '@app/models';
import { ExtractedDataFormModel } from '@app/models/administration-document/document-form/extracted-data-form.model';
import { DocumentTreeModel } from '@app/models/administration-document/document-tree.payload.model';
import { BaseService, CommonService } from '@app/services';
import { AdministrationDocumentSelectors } from '@app/state-management/store/reducer';
import { Uti } from '@app/utilities';
import { FocusControlEvent } from '@xn-control/xn-dynamic-material-control/interfaces/focus-control-event.interface';
import {
    IMaterialControlConfig,
    ISelectMaterialControlConfig,
} from '@xn-control/xn-dynamic-material-control/interfaces/material-control-config.interface';

import { XnDynamicMaterialHelperService } from '@xn-control/xn-dynamic-material-control/services/xn-dynamic-matertial-helper.service';
import { Observable, of, Subject } from 'rxjs';
import { switchMap, takeUntil } from 'rxjs/operators';
import { BaseMyDmFormComponentV2 } from '../base/base-mydm-form.component';
import { OpenFormMethodEnumV2 } from '../consts/common.enum';
import { ICommonFormHandlerV2 } from '../handlers/common-form-handler.service';
import { IFormHandlerV2 } from '../handlers/mydm-form-handler.interface';
import { DocumentMetadataV2 } from '../interfaces/document-metadata.interface';
import { DynamicFieldV2 } from '../interfaces/dynamic-field.interface';
import { IMyDMFormV2, IToolbarFormV2 } from '../interfaces/mydm-form.interface';
import { IOpenFormParamsActionV2 } from '../interfaces/open-form-params-action.interface';
import { cloneDeep } from 'lodash-es';
import { DynamicFormGroupDefinition } from '@app/models/common/form-group-definition.model';

@Directive()
export abstract class CommonFormComponentV2
    extends BaseMyDmFormComponentV2
    implements IMyDMFormV2<IToolbarFormV2>, OnInit, OnDestroy {
    // dependencies
    private _administrationSelectors: AdministrationDocumentSelectors;
    private _cdRef: ChangeDetectorRef;
    private _commonService: CommonService;
    protected _commonFormHandler: ICommonFormHandlerV2;

    // event emitter
    private _loadFormCompletelySubject = new Subject<boolean>();
    private _detachSubject = new Subject<boolean>();

    // protected properties
    protected get onFormInitialized$(): Observable<boolean> {
        return this._loadFormCompletelySubject.asObservable();
    }

    protected get onDetachForm$(): Observable<boolean> {
        return this._detachSubject.asObservable();
    }

    // properties of IMyDMForm<IToolbarForm>
    public toolbar: IToolbarFormV2;
    public folder: DocumentTreeModel;

    constructor(protected router: Router, protected injector: Injector) {
        super(router, injector);
    }

    public abstract validateDataBeforeSaving(): boolean;
    public abstract getDataForSaving(): { [key: string]: any; };

    public abstract applyQRCode(): void;
    public abstract registerGetDetailFn(fn: () => DynamicFormGroupDefinition): void;
    public abstract getColumnSettings(): void;
    public abstract setColumnSettings(formGroupDef: DynamicFormGroupDefinition): void;
    public abstract setToolbar(): void;
    protected abstract configFormHandlerDependency(): IFormHandlerV2;

    /**
     * - This function is invoked when form has attached into view container.
     * - If this form had already initialized so it is going to cache.
     * - This function just invoke once when it has not existed
     */
    protected abstract registerSubscriptions(): void;

    @Output() onControlClick = new EventEmitter<FocusControlEvent>();
    @Output() onControlIconClick = new EventEmitter<FocusControlEvent>();

    ngOnInit() { }

    ngOnDestroy() {
        this._detachSubject.next(true);
    }

    protected setup() {
        this.currentModule = this.ofModule;

        this.setupDefaultValue();

        this.setToolbar();
        if (!this.toolbar) {
            throw new Error('Please to assign toolbar instance');
        }

        const formHandler = this.configFormHandlerDependency();
        this._commonFormHandler = formHandler;
        this._throwErrorIfFormHandlerNull();

        this.middlewareMaterialControlConfigFn = this.configMaterialControlConfigMiddleware();

        this._setDependencies();
        this._setInstanceFormComponent();
        this.registerSubscriptions();
    }

    private _setInstanceFormComponent() {
        this._commonFormHandler.setInstanceFormComponent(this);
    }

    private _setDependencies() {
        this._administrationSelectors = this.injector.get(AdministrationDocumentSelectors);
        this._cdRef = this.injector.get(ChangeDetectorRef);
        this.dynamicMaterialHelper = this.injector.get(XnDynamicMaterialHelperService);
        this._commonService = this.injector.get(CommonService);
    }

    protected setupDefaultValue() {
        this.formDynamic = new FormGroup({});
        this.dynamicControlConfigList = [];
        this.dynamicFields = [];
        this.documentMetadata = {};
    }

    public hideFormUI() {
        this._commonFormHandler.formComponent.isShowUI = false;
        this._commonFormHandler.formComponent.ctrlFocusing = null;
    }

    public showFormUI() {
        this._commonFormHandler.formComponent.isShowUI = true;
    }

    public openForm(payload?: IOpenFormParamsActionV2) {
        this._throwErrorIfFormHandlerNull();

        this._commonFormHandler.listenDetachEvent(this._detachSubject);
        this._commonFormHandler.registerCommonSubscriptions();

        if (payload && payload.config && payload.config.method === OpenFormMethodEnumV2.LOAD_DETAIL) return;

        this.subscribeExtractedDataFromOcrUntilHasData();
    }

    public reopenForm(params: IOpenFormParamsActionV2): void {
        if (params.config.method === OpenFormMethodEnumV2.LOAD_DETAIL) return;

        this.subscribeExtractedDataFromOcrUntilHasData();
    }

    // public applyOcr(ocr: ExtractedDataFormModel[]): void {
    //     this._commonFormHandler.applyOcr(ocr);
    // }

    public applyOcr(ocr: ExtractedDataFormModel[]): void {
        if (
            !this.formGroupConfigDef ||
            !this.formGroupConfigDef.formConfigDefs ||
            !this.formGroupConfigDef.formConfigDefs.length
        ) {
            return;
        }

        const length = this.formGroupConfigDef.formConfigDefs.length;
        for (let i = 0; i < this.formGroupConfigDef.formConfigDefs.length; i++) {
            const formConfigDef = this.formGroupConfigDef.formConfigDefs[i];

            this._commonFormHandler.applyOcr(ocr, formConfigDef.formGroup);
        }
    }

    public reset(): void {
        // should call reset before set null
        this._commonFormHandler.resetDataForm();

        // should call reset before set null
        this.formDynamic?.reset();
        this.formDynamic = null;
        this.dynamicFields = [];
        this.dynamicControlConfigList = [];

        this.resetDataForm();

        // should fire detectChanges() to update formGroup
        // if don't when we open this component again there is no form control in formGroup cause error
        // There is no FormControl instance attached to form control element with name: 'xxx'
        this._cdRef.detectChanges();
    }

    public clearForm(): void {
        // this._commonFormHandler.clearForm();
        this._commonFormHandler.clearAllForms(this.formGroupConfigDef);
    }

    public resetDataForm(): void {
        this._commonFormHandler.resetDataForm();
    }

    public addDynamicFields(dynamicFields: DynamicFieldV2[]) {
        this._commonFormHandler.addDynamicFields(dynamicFields);
    }

    public removeDynamicField(controlConfig: IMaterialControlConfig) {
        this._commonFormHandler.removeDynamicField(controlConfig);
    }

    public updateDocumentMetadata(newMetadata: DocumentMetadataV2) {
        this._commonFormHandler.updateDocumentMetadata(newMetadata);
    }

    public detach(): void {
        this._detachSubject.next(true);
    }

    public attach(): void {
        this.registerSubscriptions();
    }

    public onFocusChanged($event: FocusControlEvent) {
        console.log('onFocusChanged');
        this._commonFormHandler.onFocusChanged($event);
    }

    public onClickChanged($event: FocusControlEvent) {
        this.onControlClick.emit($event);
    }

    public onIconClickChanged($event: FocusControlEvent) {
        this.onControlIconClick.emit($event);
    }

    public configSelectControl(selectCtrl: ISelectMaterialControlConfig): Observable<boolean> {
        if (!selectCtrl.setting?.ControlType?.Value) return of(false);

        const comboboxName = selectCtrl.setting?.ControlType?.Value;

        return BaseService.cacheService.get(comboboxName, this._commonService.getListComboBox(comboboxName)).pipe(
            switchMap((response: ApiResultResponse) => {
                if (!response || !response.item) return of(false);

                const data = response.item[comboboxName] as {
                    dataType: string;
                    idValue: string;
                    textValue: string;
                }[];

                if (!data || !data.length) return of(false);

                selectCtrl.options = cloneDeep(data);
                selectCtrl.valueMemberOpt = () => Uti.nameOf(data[0], (o) => o.idValue);
                selectCtrl.displayMemberOpt = () => Uti.nameOf(data[0], (o) => o.textValue);

                return of(true);
            }),
        );
    }

    protected publishEventFormIntialized(initialized: boolean) {
        this._loadFormCompletelySubject.next(initialized);
    }

    protected subscribeExtractedDataFromOcrUntilHasData() {
        const extractDoneSubject = new Subject<boolean>();

        this._administrationSelectors.extractedDataFromOcr$
            .pipe(takeUntil(extractDoneSubject.asObservable()))
            .subscribe((dataOcr) => {
                if (!dataOcr || !dataOcr.length) return;

                if (this.formGroupConfigDef) {
                    this.applyOcr(dataOcr);
                    this.applyQRCode();

                    extractDoneSubject.next(true);
                    extractDoneSubject.complete();
                } else {
                    this.onFormInitialized$
                        .pipe(takeUntil(extractDoneSubject.asObservable()))
                        .subscribe((didLoadForm) => {
                            if (!didLoadForm) return;

                            this.applyOcr(dataOcr);
                            this.applyQRCode();

                            extractDoneSubject.next(true);
                            extractDoneSubject.complete();
                        });
                }
            });
    }

    private _throwErrorIfFormHandlerNull() {
        if (!this._commonFormHandler) {
            throw new Error('Please config dependency IFormHandler instance');
        }
    }
}
