import { coerceBooleanProperty } from '@angular/cdk/coercion';
import {
    AfterViewInit,
    ComponentRef,
    Directive,
    Injector,
    Input,
    OnDestroy,
    OnInit,
    Type,
    ViewContainerRef,
} from '@angular/core';
import { Router } from '@angular/router';
import { DocumentMyDMType } from '@app/app.constants';
import { CustomAction } from '@app/state-management/store/actions';
import { AppGlobalActionNames } from '@app/state-management/store/actions/app-global/app-global.actions';
import { Action } from '@ngrx/store';
import {
    HideMyDMFormUIAction,
    OpenFormMethodEnum,
    OpenMyDMFormAction,
    ShowMyDMFormUIAction,
    WidgetMyDmFormActionNames,
} from '@widget/components/widget-mydm-form/actions/widget-mydm-form.actions';
import { DocumentMetadata } from '@app/xoonit-share/processing-form/interfaces/document-metadata.interface';
import { IMyDMForm, IToolbarForm } from '@app/xoonit-share/processing-form/interfaces/mydm-form.interface';
import { ISaveFormHandler } from '@app/xoonit-share/processing-form/interfaces/save-form-handler.interface';
import { filter, takeUntil } from 'rxjs/operators';
import { isNullOrUndefined } from 'util';
import { BaseProcessingFormContainer } from './base-processing-form-container';
import { IOpenFormParamsAction } from './interfaces/open-form-params-action.interface';

@Directive()
export abstract class CommonWidgetProcessingFormContainer
    extends BaseProcessingFormContainer
    implements OnInit, OnDestroy, AfterViewInit
{
    protected viewFormContainerRef: ViewContainerRef;

    @Input() tabID: string;

    constructor(protected router: Router, protected injector: Injector) {
        super(router, injector);
        this._documentMetadata = {};
        this._setupOnCreated();
        this.registerSubscriptionsOnCreated();
    }

    /**
     * set ViewContainerRef to know where dynamic form to be injected
     */
    protected abstract setViewContainerRef(): ViewContainerRef;

    /**
     * Init for Dictionary key value for supported document type form
     * @returns Map<number, Type<IMyDMForm<IToolbarForm>>>
     */
    protected abstract setSupportedDocumentTypeForm(): Map<number, Type<IMyDMForm<IToolbarForm>>>;

    public ngOnInit() {
        this._setupOnInit();
    }

    public ngOnDestroy(): void {
        super.onDestroy();
        if (this.viewFormContainerRef) {
            this.viewFormContainerRef.clear();
        }

        this.componentRef?.destroy();
    }

    public ngAfterViewInit(): void {
        this._setupAfterViewInit();
    }

    //#region BEGIN: Implements abstract methods
    protected registerSubscriptionsOnCreated() {
        this._subscribeOpenProcessingForm();

        this._subscribeSaveFormEvent();

        this._subscribeCloseFormEvent();

        this._subscribeClearDataFormEvent();

        this._subscribeResetDataFormEvent();

        this._subscribeShowFormEvent();

        this._subscribeHideFormEvent();

        this._subscribeOriginalFileNameChanged();

        this._subscribeToDoChanged();

        this._subscribeIsToDoChanged();

        this._subscribeKeywordChanged();
    }
    //#endregion END: Implements abstract methods

    //#region BEGIN public methods
    public resetDataForm($event?: Event) {
        this.componentRef?.instance.resetDataForm();
    }

    public clearDataForm($event?: Event) {
        this.componentRef?.instance.clearForm();
    }
    //#endregion END: public methods

    //#region BEGIN protected methods
    protected processInitialForm(action: OpenMyDMFormAction) {
        const payload = action.payload as IOpenFormParamsAction;
        this.folder = payload.folder;
        this.documentContainerOcr = payload.documentContainerOcr;
        const _cacheComponentRef = this._getCacheComponentRef(payload.folder.idDocumentType);

        if (this.componentRef) {
            this.componentRef.instance.folder = this.folder;
            this.componentRef.instance.documentContainerOcr = this.documentContainerOcr;
            if (_cacheComponentRef && _cacheComponentRef.instance === this.componentRef.instance) {
                if (payload.config.method === OpenFormMethodEnum.LOAD_DETAIL) {
                    this.componentRef.instance.registerGetDetailFn(payload.config.getDetail);
                    this.componentRef.instance.updateDocumentMetadata(this._documentMetadata);
                }
                this.componentRef.instance.reopenForm(payload);
                return;
            }
            this.componentRef.instance.reset();
            this.componentRef.instance.detach();
            this.viewFormContainerRef.detach();
        }

        this.componentRef = this._renderViewComponentRef(action);
        if (!this.componentRef) return;

        this.componentRef.instance.folder = this.folder;
        this.componentRef.instance.documentContainerOcr = this.documentContainerOcr;
        this.componentRef.instance.openForm(payload);

        if (payload.config.method === OpenFormMethodEnum.LOAD_COLUMN_SETTINGS) {
            this._getFormColumnSettings(this.componentRef, payload.folder.idDocumentType);
        } else if (payload.config.method === OpenFormMethodEnum.LOAD_DETAIL) {
            this.componentRef.instance.registerGetDetailFn(payload.config.getDetail);
            this.componentRef.instance.updateDocumentMetadata(this._documentMetadata);
        }
    }

    protected appSaveGlobal(action: CustomAction) {
        const instance: any = this.componentRef?.instance;
        if (instance && this._isInstanceSaveFormHandler(instance)) {
            (instance as ISaveFormHandler).save();
        }
    }

    protected showMyDMForm(action: ShowMyDMFormUIAction) {
        const params = {
            tabID: this.tabID,
            acknowledge: action.payload.acknowledge,
        };
        this.store.dispatch(this.layoutInfoActions.showSplitAreaTabID(params, this.ofModule));
        if (!this.componentRef) return;

        this.componentRef.instance.showFormUI();
    }

    protected hideMyDMForm(action: HideMyDMFormUIAction) {
        const params = {
            tabID: this.tabID,
            acknowledge: action.payload.acknowledge,
        };
        this.store.dispatch(this.layoutInfoActions.hideSplitAreaTabID(params, this.ofModule));

        if (!this.componentRef) return;
        this.componentRef.instance.hideFormUI();
    }

    protected destroyMyDMFormComponent(action: CustomAction) {
        this.componentRef?.destroy();
        for (const [key, _componentRef] of this._componentRefCacheMap) {
            if (_componentRef === this.componentRef) {
                this._componentRefCacheMap.delete(key);
                break;
            }
        }
    }

    protected didOriginalFileNameChanged(originalFileName: string) {
        this._documentMetadata = Object.assign({}, this._documentMetadata, <DocumentMetadata>{ originalFileName });

        if (!this.componentRef) return;

        this.componentRef.instance.updateDocumentMetadata({
            originalFileName: originalFileName,
        });
    }

    protected didToDoChanged(toDos: string) {
        this._documentMetadata = Object.assign({}, this._documentMetadata, <DocumentMetadata>{ toDos });

        if (!this.componentRef) return;

        this.componentRef.instance.updateDocumentMetadata({
            toDos: toDos,
        });
    }

    protected didIsToDoChanged(isToDo: boolean) {
        const _isTodo = coerceBooleanProperty(isToDo);
        this._documentMetadata = Object.assign({}, this._documentMetadata, <DocumentMetadata>{ isTodo: _isTodo });

        if (!this.componentRef) return;

        this.componentRef.instance.updateDocumentMetadata({
            isTodo: _isTodo,
        });
    }

    protected didKeywordChanged(keyword: string) {
        this._documentMetadata = Object.assign({}, this._documentMetadata, <DocumentMetadata>{ keyword });

        if (!this.componentRef) return;

        this.componentRef.instance.updateDocumentMetadata({
            keyword: keyword,
        });
    }
    //#endregion END protected methods

    //#region BEGIN private methods
    private _filterOpenMyDmFormAction(action: OpenMyDMFormAction): boolean {
        if (!(action instanceof OpenMyDMFormAction)) return false;

        const payload = action.payload;
        if (!payload.folder || !payload.folder.idDocumentType) {
            return false;
        }

        if (!payload.documentContainerOcr) return false;

        return true;
    }
    private _getCacheComponentRef(documentType: number): ComponentRef<IMyDMForm<IToolbarForm>> {
        if (!this._componentRefCacheMap.size) return null;

        const componentRef = this._componentRefCacheMap.get(documentType);
        return componentRef;
    }

    private _renderViewComponentRef(action: OpenMyDMFormAction) {
        const payload = action.payload;
        let componentRef = this._getCacheComponentRef(payload.folder.idDocumentType);

        if (componentRef) {
            componentRef.instance.attach();
            this.viewFormContainerRef.insert(componentRef.hostView);
        } else {
            componentRef = this._loadComponent(payload.folder.idDocumentType);
        }

        return componentRef;
    }

    private _loadComponent(documentType: number): ComponentRef<IMyDMForm<IToolbarForm>> {
        const componentType = this._componentTypeMap.get(documentType) as any;
        if (!componentType) {
            return null;
        }
        const factoryComponennt =
            this.componentFactoryResolver.resolveComponentFactory<IMyDMForm<IToolbarForm>>(componentType);

        const componentRef = this.viewFormContainerRef.createComponent<IMyDMForm<IToolbarForm>>(factoryComponennt);
        this._setCacheComponentRef(documentType, componentRef);
        return componentRef;
    }

    private _setCacheComponentRef(documentType: number, componentRef: ComponentRef<IMyDMForm<IToolbarForm>>) {
        this._componentRefCacheMap.set(documentType, componentRef);
    }

    private _isInstanceSaveFormHandler(instance: any) {
        return !isNullOrUndefined((instance as ISaveFormHandler).save);
    }

    private _getFormColumnSettings(componentRef: ComponentRef<IMyDMForm<IToolbarForm>>, idDocumentType?: number) {
        componentRef.instance.getColumnSettings(idDocumentType);
    }

    /**
     * Invoked when init class constructor
     */
    private _setupOnCreated() {
        this._componentTypeMap = new Map<number, Type<IMyDMForm<IToolbarForm>>>();
        this._componentRefCacheMap = new Map<number, ComponentRef<IMyDMForm<IToolbarForm>>>();
        this._documentMetadata = {};

        const supportedForm = this.setSupportedDocumentTypeForm();
        if (!supportedForm) {
            throw new Error(
                'Please assign dictionary for document type form. Refer this instance Map<number, Type<IMyDMForm<IToolbarForm>>>',
            );
        }
        this._componentTypeMap = supportedForm;
    }

    /**
     * Invoked when run OnInit hook
     */
    private _setupOnInit() {}

    /**
     * Invoked when run AfterViewInit hook
     */
    private _setupAfterViewInit() {
        const viewContainerRef = this.setViewContainerRef();
        if (!viewContainerRef) {
            throw new Error(
                'Please assign ViewContainerRef to inject where it attach dynamic form UI. Refer instance ViewContainerRef from "@angular/core"',
            );
        }
        this.viewFormContainerRef = viewContainerRef;
    }
    //#endregion END private methods

    //#region BEGIN: Subscriptions
    /**
     * Listen event open form fired
     */
    private _subscribeOpenProcessingForm() {
        this.reducerMgrDispatcher
            .pipe(
                filter((action: OpenMyDMFormAction) => this._filterOpenMyDmFormAction(action)),
                takeUntil(this.getUnsubscriberNotifier()),
            )
            .subscribe((action: OpenMyDMFormAction) => {
                this.processInitialForm(action);
            });
    }

    /**
     * Listen save form event fired
     */
    private _subscribeSaveFormEvent() {
        this.reducerMgrDispatcher
            .pipe(
                filter((action: Action) => action.type === AppGlobalActionNames.APP_SAVE_GLOBAL),
                takeUntil(this.getUnsubscriberNotifier()),
            )
            .subscribe((action: CustomAction) => {
                // this.appSaveGlobal(action);
            });
    }

    /**
     * Listen close form event fired
     */
    private _subscribeCloseFormEvent() {
        this.reducerMgrDispatcher
            .pipe(
                filter((action: Action) => action.type === WidgetMyDmFormActionNames.CLOSE_MYDM_FORM),
                takeUntil(this.getUnsubscriberNotifier()),
            )
            .subscribe((action: CustomAction) => {
                this.destroyMyDMFormComponent(action);
            });
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
                this.clearDataForm(null);
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
                this.resetDataForm(null);
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
                if (!this.componentRef) return;

                this.componentRef.instance.showFormUI();
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
        this.administrationSelectors.originalFileName$
            .pipe(takeUntil(this.getUnsubscriberNotifier()))
            .subscribe((originalFileName) => {
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
            .pipe(takeUntil(this.getUnsubscriberNotifier()))
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
}
