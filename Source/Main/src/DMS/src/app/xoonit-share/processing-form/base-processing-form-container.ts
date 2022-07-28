import { ComponentFactoryResolver, ComponentRef, Injector, Type } from '@angular/core';
import { Router } from '@angular/router';
import { IconNames } from '@app/app-icon-registry.service';
import { DocumentMyDMType } from '@app/app.constants';
import { DocumentTreeModel } from '@app/models/administration-document/document-tree.payload.model';
import { BaseComponent } from '@app/pages/private/base';
import { AppState } from '@app/state-management/store';
import { AdministrationDocumentActions, LayoutInfoActions } from '@app/state-management/store/actions';
import { DocumentContainerOcrStateModel } from '@app/state-management/store/models/administration-document/state/document-container-ocr.state.model';
import { AdministrationDocumentSelectors } from '@app/state-management/store/reducer';
import { ReducerManagerDispatcher, Store } from '@ngrx/store';
import { DocumentMetadata } from '@app/xoonit-share/processing-form/interfaces/document-metadata.interface';
import { IMyDMForm, IToolbarForm } from '@app/xoonit-share/processing-form/interfaces/mydm-form.interface';
import { MatDialog } from '@xn-control/light-material-ui/dialog';

export abstract class BaseProcessingFormContainer extends BaseComponent {
    protected _componentTypeMap: Map<number, Type<IMyDMForm<IToolbarForm>>>;
    protected _componentRefCacheMap: Map<number, ComponentRef<IMyDMForm<IToolbarForm>>>;
    protected _documentMetadata: DocumentMetadata;
    protected _isShowRollbackButton = false;

    protected store: Store<AppState>;
    protected componentFactoryResolver: ComponentFactoryResolver;
    protected reducerMgrDispatcher: ReducerManagerDispatcher;
    protected layoutInfoActions: LayoutInfoActions;
    protected administrationActions: AdministrationDocumentActions;
    protected administrationSelectors: AdministrationDocumentSelectors;
    protected dialog: MatDialog;

    public componentRef: ComponentRef<IMyDMForm<IToolbarForm>> = null;
    public folder: DocumentTreeModel;
    public documentContainerOcr: DocumentContainerOcrStateModel;

    public svgIconQr = IconNames.WIDGET_MYDM_FORM_Scan_QR;
    public svgIconAI = IconNames.WIDGET_MYDM_FORM_Scan_OCR;
    public svgIconReset = IconNames.WIDGET_MYDM_FORM_Reset;
    public svgIconClear = IconNames.WIDGET_MYDM_FORM_Clear;
    public svgIconTogglePrivatePerson = IconNames.WIDGET_MYDM_FORM_Toggle_Private_Person;
    public svgIconAddDynamicField = IconNames.WIDGET_MYDM_FORM_Add_Dynamic_Field;

    protected abstract registerSubscriptionsOnCreated(): void;

    constructor(
        protected router: Router,
        protected injector: Injector,
    ) {
        super(router);
        this._setDependencies();
    }

    private _setDependencies() {
        this.store = this.injector.get<Store<AppState>>(Store);
        this.componentFactoryResolver = this.injector.get(ComponentFactoryResolver);
        this.reducerMgrDispatcher = this.injector.get(ReducerManagerDispatcher);
        this.layoutInfoActions = this.injector.get(LayoutInfoActions);
        this.administrationActions = this.injector.get(AdministrationDocumentActions);
        this.administrationSelectors = this.injector.get(AdministrationDocumentSelectors);
        this.dialog = this.injector.get(MatDialog);
    }
}
