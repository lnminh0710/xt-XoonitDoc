import { Component, OnInit, AfterViewInit, OnDestroy } from '@angular/core';
import { BaseModuleComponent } from '../private/base';
import { Router, ActivatedRoute, NavigationEnd } from '@angular/router';
import { ReducerManagerDispatcher, Store } from '@ngrx/store';
import {
    AppErrorHandler,
    LoadingService,
    PropertyPanelService,
    CommonService,
    ModuleSettingService,
    GlobalSettingService,
    InvoiceAprrovalService,
} from '@app/services';
import { Uti } from '@app/utilities';
import { AppState } from '@app/state-management/store';
import {
    XnCommonActions,
    TabButtonActions,
    PropertyPanelActions,
    AdditionalInformationActions,
    ModuleSettingActions,
    AdministrationDocumentActions,
    CustomAction,
    LayoutSettingActions,
} from '@app/state-management/store/actions';
import { fadeInRightFlexBasis } from '@app/shared/animations/fade-in-right-flex-basic.animation';
import { GlobalSettingConstant } from '../../app.constants';
import { MonoTypeOperatorFunction, Observable } from 'rxjs';
import { filter, take, takeUntil } from 'rxjs/operators';
import { DocumentImageOcrService } from '../private/modules/image-control/services';
import { DmsDashboardHandlerService } from '../private/modules/mydm/services/dms-dashboard-handler.service';

import * as widgetTemplateReducer from '@app/state-management/store/reducer/widget-template';
import { AdministrationDocumentSelectors } from '@app/state-management/store/reducer';
import {
    AppGlobalActionNames,
    DeleteGlobalAction,
} from '@app/state-management/store/actions/app-global/app-global.actions';
import { EnableWidgetTemplateState } from '@app/models/widget-template/enable-widget-template.model';
import { InvoiceApprovalProcessingActions } from './invoice-approval-processing.statemanagement/invoice-approval-processing.actions';

@Component({
    selector: 'invoice-approval-processing',
    templateUrl: './invoice-approval-processing.component.html',
    styleUrls: ['./invoice-approval-processing.component.scss'],
    animations: [fadeInRightFlexBasis],
})
export class InvoiceApprovalProcessingComponent
    extends BaseModuleComponent
    implements OnInit, AfterViewInit, OnDestroy {
    private _isImageOCRCreated: boolean;
    private _needToGetDocumentContainerScans: any;
    private _enableWidgetTemplateState$: Observable<EnableWidgetTemplateState>;

    private _idDocumentContainerScanExecuting: any;

    public get idDocumentContainerScans() {
        return this._needToGetDocumentContainerScans;
    }

    public idMainDocument: number;
    public idDocumentTree: number;
    public mediaName: string;

    constructor(
        protected router: Router,
        protected appStore: Store<AppState>,
        protected appErrorHandler: AppErrorHandler,
        protected globalSettingConstant: GlobalSettingConstant,

        protected loadingService: LoadingService,
        protected globalSettingService: GlobalSettingService,
        protected moduleSettingService: ModuleSettingService,
        protected propertyPanelService: PropertyPanelService,

        protected moduleSettingActions: ModuleSettingActions,
        protected tabButtonActions: TabButtonActions,
        protected propertyPanelActions: PropertyPanelActions,
        protected additionalInformationActions: AdditionalInformationActions,

        protected commonService: CommonService,
        protected xnCommonActions: XnCommonActions,
        //-----------------------------------------
        private activatedRoute: ActivatedRoute,
        private adminstrationDocumentActions: AdministrationDocumentActions,
        private dmsDashboardHandler: DmsDashboardHandlerService,
        private documentService: DocumentImageOcrService,
        private dispatcher: ReducerManagerDispatcher,
        private administrationSelectors: AdministrationDocumentSelectors,
        private invoiceApprovalProcessingAction: InvoiceApprovalProcessingActions,
        private invoiceApprovalService: InvoiceAprrovalService,
    ) {
        super(
            router,
            appStore,
            appErrorHandler,
            globalSettingConstant,
            loadingService,
            globalSettingService,
            moduleSettingService,
            propertyPanelService,
            moduleSettingActions,
            tabButtonActions,
            propertyPanelActions,
            additionalInformationActions,
            commonService,
            xnCommonActions,
        );

        this._enableWidgetTemplateState$ = this.appStore.select(
            (state) =>
                widgetTemplateReducer.getWidgetTemplateState(state, this.ofModule.moduleNameTrim).enableWidgetTemplate,
        );
        this._subscribe();
    }

    ngOnInit(): void {
        super.onInit();
    }

    ngAfterViewInit(): void {
        this.getModuleToPersonType();
        this.activatedRoute.queryParams.pipe(takeUntil(this.getUnsubscriberNotifier())).subscribe((param) => {
            this.idMainDocument = param.idDocument;
            this._needToGetDocumentContainerScans = param.idDocumentContainerScans;
            this.emitDocumentToState(param.idDocumentContainerScans);
        });
    }

    ngOnDestroy(): void {
        super.onDestroy();
        Uti.unsubscribe(this);
    }

    private _subscribe() {
        this._registerRouterEvent(takeUntil(this.getUnsubscriberNotifier()), () => {
            const idDocumentContainerScans = this.activatedRoute.snapshot.queryParams['idDocumentContainerScans'];
            const idMainDocument = this.activatedRoute.snapshot.queryParams['idDocument'];
            this.idMainDocument = idMainDocument;
            this.emitDocumentToState(idDocumentContainerScans);
        });

        this.dmsDashboardHandler.onDocumentContainerOcrComponentCreated$
            .pipe(
                filter((isCreated) => isCreated),
                take(1),
            )
            .subscribe((_) => {
                this._isImageOCRCreated = true;
                this.emitDocumentToState(this._needToGetDocumentContainerScans);
            });

        this.administrationSelectors
            .actionOfType$(AppGlobalActionNames.APP_DELETE_GLOBAL)
            .pipe(takeUntil(this.getUnsubscriberNotifier()))
            .subscribe((action: DeleteGlobalAction) => {
                this._deleteDocumentCapture();
            });
        this.dispatcher
            .pipe(
                filter((action: CustomAction) => action.type === LayoutSettingActions.REFRESH_STATE_UPDATE_EDIT_MODE),
                takeUntil(this.getUnsubscriberNotifier()),
            )
            .subscribe((action) => {
                this._idDocumentContainerScanExecuting = null;
                this.emitDocumentToState(this._needToGetDocumentContainerScans);
            });

        this._enableWidgetTemplateState$
            .pipe(
                filter(
                    (enableWidgetTemplate: EnableWidgetTemplateState) =>
                        enableWidgetTemplate.status === false && enableWidgetTemplate.previousStatus === true,
                ),
                takeUntil(this.getUnsubscriberNotifier()),
            )
            .subscribe((enableWidgetTemplate: EnableWidgetTemplateState) => {
                this._idDocumentContainerScanExecuting = null;
                this.emitDocumentToState(this._needToGetDocumentContainerScans);
            });
    }

    public emitDocumentToState(IdDocumentContainerScans: any) {
        if (
            !IdDocumentContainerScans ||
            !this._isImageOCRCreated ||
            this._idDocumentContainerScanExecuting === IdDocumentContainerScans
        )
            return;
        this._idDocumentContainerScanExecuting = IdDocumentContainerScans;
        this.documentService
            .getDocumentById(IdDocumentContainerScans)
            .pipe(take(1))
            .subscribe((response: Array<any>) => {
                if (response?.length) {
                    this.idDocumentTree = response[0].IdDocumentTree;
                    this.mediaName = response[0].OriginalFileName;
                    this.invoiceApprovalService.getExtractAIData(IdDocumentContainerScans).subscribe((aiData) => {
                        this.appStore.dispatch(
                            this.invoiceApprovalProcessingAction.applyExtractAIData({ data: aiData, firstInit: true }),
                        );
                    });
                }
                this.appStore.dispatch(
                    this.adminstrationDocumentActions.dispatchDocumentContainerScan({
                        IdDocumentContainerScans: IdDocumentContainerScans,
                        isProcessingPage: true,
                        isInvoiceApproval: true,
                        images: response,
                        idMainDocument: this.idMainDocument,
                    }),
                );
            });
    }

    private _deleteDocumentCapture() {
        if (!this._idDocumentContainerScanExecuting) return;

        this.appStore.dispatch(
            this.adminstrationDocumentActions.deleteImageScanDocumentOnThumbnail(
                this._idDocumentContainerScanExecuting.toString(),
            ),
        );
    }

    private _registerRouterEvent(disposeWhen: MonoTypeOperatorFunction<any>, callback: () => void) {
        this.router.events.pipe(disposeWhen).subscribe((e) => {
            let currentRoute = this.activatedRoute.root;
            while (currentRoute.children[0] !== undefined) {
                currentRoute = currentRoute.children[0];
            }

            if (e instanceof NavigationEnd) {
                callback();
            }
        });
    }
}
