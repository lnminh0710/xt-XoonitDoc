import { ChangeDetectorRef, Directive, Injector, OnDestroy, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { ExtractedDataFormModel } from '@app/models/administration-document/document-form/extracted-data-form.model';
import { DocumentTreeModel } from '@app/models/administration-document/document-tree.payload.model';
import { ColumnDefinition } from '@app/models/common/column-definition.model';
import { AdministrationDocumentSelectors } from '@app/state-management/store/reducer';
import { FocusControlEvent } from '@xn-control/xn-dynamic-material-control/interfaces/focus-control-event.interface';
import { IMaterialControlConfig } from '@xn-control/xn-dynamic-material-control/interfaces/material-control-config.interface';

import { XnDynamicMaterialHelperService } from '@xn-control/xn-dynamic-material-control/services/xn-dynamic-matertial-helper.service';
import { Observable, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { BaseMyDmFormComponent } from '../base/base-mydm-form.component';
import { OpenFormMethodEnum } from '../consts/common.enum';
import { ICommonFormHandler } from '../handlers/common-form-handler.service';
import { IFormHandler } from '../handlers/mydm-form-handler.interface';
import { DocumentMetadata } from '../interfaces/document-metadata.interface';
import { DynamicField } from '../interfaces/dynamic-field.interface';
import { IMyDMForm, IToolbarForm } from '../interfaces/mydm-form.interface';
import { IOpenFormParamsAction } from '../interfaces/open-form-params-action.interface';

@Directive()
export abstract class CommonFormComponent extends BaseMyDmFormComponent implements IMyDMForm<IToolbarForm>, OnInit, OnDestroy {
    // dependencies
    private _commonFormHandler: ICommonFormHandler;
    private _administrationSelectors: AdministrationDocumentSelectors;
    private _cdRef: ChangeDetectorRef;

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
    public toolbar: IToolbarForm;
    public folder: DocumentTreeModel;

    constructor(
        protected router: Router,
        protected injector: Injector,
    ) {
        super(router, injector);
    }

    public abstract applyQRCode(): void;
    public abstract registerGetDetailFn(fn: () => ColumnDefinition[]): void;
    public abstract getColumnSettings(): void;
    public abstract setToolbar(): void;
    protected abstract configFormHandlerDependency(): IFormHandler;

    /**
     * - This function is invoked when form has attached into view container.
     * - If this form had already initialized so it is going to cache.
     * - This function just invoke once when it has not existed
     */
    protected abstract registerSubscriptions(): void;

    ngOnInit() {
    }

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

    public openForm(payload: IOpenFormParamsAction) {
        this._throwErrorIfFormHandlerNull();

        this._commonFormHandler.listenDetachEvent(this._detachSubject);
        this._commonFormHandler.registerCommonSubscriptions();

        if (payload.config.method === OpenFormMethodEnum.LOAD_DETAIL) return;

        this.subscribeExtractedDataFromOcrUntilHasData();
    }

    public reopenForm(params: IOpenFormParamsAction): void {
        if (params.config.method === OpenFormMethodEnum.LOAD_DETAIL) return;

        this.subscribeExtractedDataFromOcrUntilHasData();
    }

    public applyOcr(ocr: ExtractedDataFormModel[]): void {
        this._commonFormHandler.applyOcr(ocr);
    }

    public reset(): void {
        this.columnSettings = [];
        this.controls = [];

        // should call reset before set null
        this.formGroup?.reset();
        this.formGroup = null;

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
        this._commonFormHandler.clearForm();
    }

    public resetDataForm(): void {
        this._commonFormHandler.resetDataForm();
    }

    public addDynamicFields(dynamicFields: DynamicField[]) {
        this._commonFormHandler.addDynamicFields(dynamicFields);
    }

    public removeDynamicField(controlConfig: IMaterialControlConfig) {
        this._commonFormHandler.removeDynamicField(controlConfig);
    }

    public updateDocumentMetadata(newMetadata: DocumentMetadata) {
        this._commonFormHandler.updateDocumentMetadata(newMetadata);
    }

    public detach(): void {
        this._detachSubject.next(true);
    }

    public attach(): void {
        this.registerSubscriptions();
    }

    public onFocusChanged($event: FocusControlEvent) {
        this._commonFormHandler.onFocusChanged($event);
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

                if (this.formGroup) {
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
