import { coerceBooleanProperty } from '@angular/cdk/coercion';
import { AfterViewInit, ChangeDetectorRef, Directive, Injector, Input, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { Action } from '@ngrx/store';
import { HideMyDMFormUIAction, OpenMyDMFormAction, ShowMyDMFormUIAction, WidgetMyDmFormActionNames } from '@widget/components/widget-mydm-form/actions/widget-mydm-form.actions';
import { DocumentMetadata } from '@app/xoonit-share/processing-form/interfaces/document-metadata.interface';
import { ISaveFormHandler } from '@app/xoonit-share/processing-form/interfaces/save-form-handler.interface';
import { filter, takeUntil } from 'rxjs/operators';
import { isNullOrUndefined } from 'util';
import { BaseProcessingFormContainerV2 } from './base-processing-form-container';
import { DynamicFormGroupDefinition } from '@app/models/common/form-group-definition.model';
import { DynamicFormGroupComponent } from '../components/dynamic-form-group/dynamic-form-group.component';
import { CommonFormComponent } from '../components/widget-dynamic-form/components/common-form/common-form.component';
import { IOpenFormParamsActionV2 } from './interfaces/open-form-params-action.interface';
import { OpenFormMethodEnumV2 } from './consts/common.enum';
import { DocumentService } from '../../services';

@Directive()
export abstract class CommonWidgetDynamicFormGroupContainerV2 extends BaseProcessingFormContainerV2 implements OnInit, OnDestroy, AfterViewInit {
    abstract get methodName(): string;
    abstract get object(): string;

    // protected properties
    protected _commonFormComps: CommonFormComponent[] = [];
    protected _cdRef: ChangeDetectorRef;

    // public properties
    @ViewChild(DynamicFormGroupComponent) dynamicFormGroupComp: DynamicFormGroupComponent;
    public formGroupDef: DynamicFormGroupDefinition;

    @Input() tabID: string;

    constructor(protected router: Router, protected injector: Injector, protected documentService: DocumentService) {
        super(router, injector);
        this._documentMetadata = {};
        this._cdRef = injector.get(ChangeDetectorRef);
        this.registerSubscriptionsOnCreated();
    }

    /**
     * set DynamicFormGroupComponent to know whether dynamic form to be injected or not
     */
    protected abstract setDynamicFormGroupComponent(): DynamicFormGroupComponent;
    /**
     * set dynamic form group definition when get request document detail
     */
    protected abstract setDynamicFormGroupDefinition(dynamicFormGroupDef: DynamicFormGroupDefinition);

    public ngOnInit() {}

    public ngOnDestroy(): void {
        super.onDestroy();
    }

    public ngAfterViewInit(): void {}

    //#region BEGIN public methods event invoked from template
    public onClickResetForm($event: Event) {
        this.resetDataForm();
    }

    public onClickClearForm($event: Event) {
        this.clearDataForm();
    }

    public resetDataForm() {
        if (!this._commonFormComps || !this._commonFormComps.length) return;

        for (let i = 0; i < this._commonFormComps.length; i++) {
            const contactInfoComp = this._commonFormComps[i];
            contactInfoComp.resetDataForm();
        }
    }

    public clearDataForm() {
        if (!this._commonFormComps || !this._commonFormComps.length) return;

        for (let i = 0; i < this._commonFormComps.length; i++) {
            const contactInfoComp = this._commonFormComps[i];
            contactInfoComp.clearForm();
        }
    }
    //#endregion END: BEGIN public methods event invoked from template

    //#region BEGIN: Implements abstract methods
    protected registerSubscriptionsOnCreated() {
        this._subscribeOpenDynamicFormGroup();

        this._subscribeClearDataFormEvent();

        this._subscribeResetDataFormEvent();

        this._subscribeOriginalFileNameChanged();

        this._subscribeToDoChanged();

        this._subscribeIsToDoChanged();

        this._subscribeKeywordChanged();
    }
    //#endregion END: Implements abstract methods

    //#region BEGIN protected methods
    protected processBuildDynamicFormGroup(action: OpenMyDMFormAction) {
        //const payload = (action.payload as IOpenFormParamsActionV2);
        //this.folder = payload.folder;
        //this.documentContainerOcr = payload.documentContainerOcr;
        //this._documentMetadata.folder = payload.folder;
        //this._documentMetadata.documentContainerOcr = payload.documentContainerOcr;
        //switch (payload.config.method) {
        //    case OpenFormMethodEnumV2.LOAD_COLUMN_SETTINGS:
        //        this.getFormGroupSettings(payload.idDocumentContainerScans, payload.idMainDocument); // idMainDocument always NULL
        //        break;
        //    case OpenFormMethodEnumV2.LOAD_DETAIL:
        //        const dynamicFormGroupDef = payload.config.getDetail();
        //        this.setDynamicFormGroupDefinition(dynamicFormGroupDef);
        //        break;
        //    default:
        //        return;
        //}
    }

    protected showMyDMForm(action: ShowMyDMFormUIAction) {
        const params = {
            tabID: this.tabID,
            acknowledge: action.payload.acknowledge,
        };
        this.store.dispatch(this.layoutInfoActions.showSplitAreaTabID(params, this.ofModule));

        // if (!this.componentRef) return;
        // this.componentRef.instance.showFormUI();
    }

    protected hideMyDMForm(action: HideMyDMFormUIAction) {
        const params = {
            tabID: this.tabID,
            acknowledge: action.payload.acknowledge,
        };
        this.store.dispatch(this.layoutInfoActions.hideSplitAreaTabID(params, this.ofModule));

        // if (!this.componentRef) return;
        // this.componentRef.instance.hideFormUI();
    }

    protected didOriginalFileNameChanged(originalFileName: string) {
        this._documentMetadata = Object.assign({}, this._documentMetadata, <DocumentMetadata>{ originalFileName });

        this._setDocumentMetadata(this._documentMetadata);
    }

    protected didToDoChanged(toDos: string) {
        this._documentMetadata = Object.assign({}, this._documentMetadata, <DocumentMetadata>{ toDos });

        this._setDocumentMetadata(this._documentMetadata);
    }

    protected didIsToDoChanged(isToDo: boolean) {
        const _isTodo = coerceBooleanProperty(isToDo);
        this._documentMetadata = Object.assign({}, this._documentMetadata, <DocumentMetadata>{ isTodo: _isTodo });

        this._setDocumentMetadata(this._documentMetadata);
    }

    protected didKeywordChanged(keyword: string) {
        this._documentMetadata = Object.assign({}, this._documentMetadata, <DocumentMetadata>{ keyword });

        this._setDocumentMetadata(this._documentMetadata);
    }

    protected getFormGroupSettings(idDocumentContainerScans: number, idMainDocument: number) {
        if (!this.methodName) return;
        this.documentService
            .getFormGroupSettings({
                idMainDocument: idMainDocument,
                idDocumentContainerScans: idDocumentContainerScans,
                methodName: this.methodName,
                object: this.object,
            })
            .subscribe((data) => {
                this.setDynamicFormGroupDefinition(data);
            });
    }
    //#endregion END protected methods

    //#region BEGIN private methods
    private _filterOpenMyDmFormAction(action: OpenMyDMFormAction): boolean {
        if (!(action instanceof OpenMyDMFormAction)) return false;

        const payload = action.payload;
        // if (!payload.folder || !payload.folder.idDocumentType) {
        if (!payload.folder) {
            return false;
        }

        if (!payload.documentContainerOcr) return false;

        return true;
    }

    private _isInstanceSaveFormHandler(instance: any) {
        return !isNullOrUndefined((instance as ISaveFormHandler).save);
    }

    private _setDocumentMetadata(documentMetadata: DocumentMetadata) {
        if (!this._commonFormComps || !this._commonFormComps.length) return;

        for (let i = 0; i < this._commonFormComps.length; i++) {
            const contactInfoComp = this._commonFormComps[i];
            contactInfoComp.updateDocumentMetadata(documentMetadata);
        }
    }

    //#region BEGIN: Subscriptions
    /**
     * Listen event open form fired
     */
    private _subscribeOpenDynamicFormGroup() {
        //this.reducerMgrDispatcher
        //    .pipe(
        //        filter((action: OpenMyDMFormAction) => this._filterOpenMyDmFormAction(action)),
        //        takeUntil(this.getUnsubscriberNotifier()),
        //    )
        //    .subscribe((action: OpenMyDMFormAction) => {
        //        this.processBuildDynamicFormGroup(action);
        //    });
    }

    /**
     * Listen clear data form event fired
     */
    private _subscribeClearDataFormEvent() {
        this.reducerMgrDispatcher
            .pipe(
                filter((action: Action) => action.type === WidgetMyDmFormActionNames.CLEAR_FORM),
                takeUntil(this.getUnsubscriberNotifier()),
            )
            .subscribe((_) => {
                this.clearDataForm();
            });
    }

    /**
     * Listen reset data form event fired
     */
    private _subscribeResetDataFormEvent() {
        this.reducerMgrDispatcher
            .pipe(
                filter((action: Action) => action.type === WidgetMyDmFormActionNames.RESET_DATA_FORM),
                takeUntil(this.getUnsubscriberNotifier()),
            )
            .subscribe((_) => {
                this.resetDataForm();
            });
    }

    /**
     * Listen show form UI event fired
     */
    private _subscribeShowFormEvent() {
        this.reducerMgrDispatcher
            .pipe(
                filter((action: Action) => action.type === WidgetMyDmFormActionNames.SHOW_MYDM_FORM_UI),
                takeUntil(this.getUnsubscriberNotifier()),
            )
            .subscribe((action: ShowMyDMFormUIAction) => {
                const params = {
                    tabID: this.tabID,
                    acknowledge: action.payload.acknowledge,
                };
                this.store.dispatch(this.layoutInfoActions.showSplitAreaTabID(params, this.ofModule));
                // if (!this.componentRef) return;

                // this.componentRef.instance.showFormUI();
            });
    }

    /**
     * Listen hide form UI event fired
     */
    private _subscribeHideFormEvent() {
        this.reducerMgrDispatcher
            .pipe(
                filter((action: Action) => action.type === WidgetMyDmFormActionNames.HIDE_MYDM_FORM_UI),
                takeUntil(this.getUnsubscriberNotifier()),
            )
            .subscribe((action: HideMyDMFormUIAction) => {
                this.hideMyDMForm(action);
            });
    }

    /**
     * Listen value original file name changed fired
     */
    private _subscribeOriginalFileNameChanged() {
        this.administrationSelectors.originalFileName$.pipe(takeUntil(this.getUnsubscriberNotifier())).subscribe((originalFileName) => {
            this.didOriginalFileNameChanged(originalFileName);
        });
    }

    /**
     * Listen value to do changed fired
     */
    private _subscribeToDoChanged() {
        this.administrationSelectors.toDo$
            .pipe(
                filter((data) => data !== null),
                takeUntil(this.getUnsubscriberNotifier()),
            )
            .subscribe((toDos: string) => {
                this.didToDoChanged(toDos);
            });
    }

    /**
     * Listen value checkbox IsToDo changed fired
     */
    private _subscribeIsToDoChanged() {
        this.administrationSelectors.isToDo$
            .pipe(
                filter((data) => data !== null),
                takeUntil(this.getUnsubscriberNotifier()),
            )
            .subscribe((isToDo: boolean) => {
                this.didIsToDoChanged(isToDo);
            });
    }

    /**
     * Listen value keyword changed fired
     */
    private _subscribeKeywordChanged() {
        this.administrationSelectors.keyword$
            .pipe(
                filter((data) => data !== null),
                takeUntil(this.getUnsubscriberNotifier()),
            )
            .subscribe((keyword: string) => {
                this.didKeywordChanged(keyword);
            });
    }
    //#endregion END: Subscriptions

    public setFormValue(key, value, index: number = 0) {
        if (this._commonFormComps?.length) {
            this._commonFormComps[index].setFormValue(key, value);
        }
    }

    public disableForm() {
        if (this._commonFormComps?.length) {
            for (let i = 0; i < this._commonFormComps.length; i++) {
                this._commonFormComps[i].disableForm();
            }
        }
    }

    public enableForm() {
        if (this._commonFormComps?.length) {
            for (let i = 0; i < this._commonFormComps.length; i++) {
                this._commonFormComps[i].enableForm();
            }
        }
    }

    public disableControl(key: string, index: number = 0) {
        if (this._commonFormComps?.length) {
            this._commonFormComps[index].disableControl(key);
        }
    }

    public getDisplayFields(index: number = 0): Array<{ key: string; value: string }> {
        let arr = [];
        if (this._commonFormComps?.length) {
            arr = this._commonFormComps[index].getDisplayFields();
        }
        return arr;
    }

    public setHiddenField(field: string, status: boolean, index: number = 0) {
        if (this._commonFormComps?.length) {
            if (index == -1) {
                this._commonFormComps.forEach((comp) => {
                    comp.setHiddenField(field, status);
                });
            } else {
                this._commonFormComps[index]?.setHiddenField(field, status);
            }
        }
    }
}
