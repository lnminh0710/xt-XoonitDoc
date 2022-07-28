import { Component, OnInit, AfterViewInit, OnDestroy } from '@angular/core';
import { BaseModuleComponent, ModuleList } from '../private/base';
import { Router, ActivatedRoute, NavigationEnd } from '@angular/router';
import { ReducerManagerDispatcher, Store } from '@ngrx/store';
import { SearchResultItemModel } from '@app/models';
import {
    AppErrorHandler,
    LoadingService,
    PropertyPanelService,
    ModuleSettingService,
    GlobalSettingService,
    CommonService,
} from '@app/services';
import { Uti } from '@app/utilities';
import { AppState } from '@app/state-management/store';
import {
    XnCommonActions,
    TabButtonActions,
    PropertyPanelActions,
    AdditionalInformationActions,
    ModuleSettingActions,
    CustomAction,
    GlobalSearchActions,
    AdministrationDocumentActions,
    LayoutSettingActions,
} from '@app/state-management/store/actions';
import { fadeInRightFlexBasis } from '@app/shared/animations/fade-in-right-flex-basic.animation';
import { GlobalSettingConstant, LocalStorageKey, MenuModuleId } from '../../app.constants';
import { Observable, MonoTypeOperatorFunction } from 'rxjs';
import { filter, take, takeUntil } from 'rxjs/operators';
import { Actions, ofType } from '@ngrx/effects';
import { SearchPageType } from '@app/models/search-page/search-page-type.model';
import * as processDataReducer from '@app/state-management/store/reducer/process-data';
import * as widgetTemplateReducer from '@app/state-management/store/reducer/widget-template';
import { DocumentImageOcrService } from '../private/modules/image-control/services';
import { DmsDashboardHandlerService } from '../private/modules/mydm/services/dms-dashboard-handler.service';
import { EnableWidgetTemplateState } from '@app/models/widget-template/enable-widget-template.model';

@Component({
    selector: 'invoice-approval',
    templateUrl: './invoice-approval.component.html',
    styleUrls: ['./invoice-approval.component.scss'],
    animations: [fadeInRightFlexBasis],
})
export class InvoiceApprovalComponent extends BaseModuleComponent implements OnInit, AfterViewInit, OnDestroy {
    private _isImageOCRCreated: boolean;
    private _needToGetDocumentContainerScans: any;
    private _enableWidgetTemplateState$: Observable<EnableWidgetTemplateState>;
    public get idDocumentContainerScans() {
        return this._needToGetDocumentContainerScans;
    }
    private _selectedSearchResultState$: Observable<SearchResultItemModel>;
    private _idDocumentContainerScanExecuting: any;

    public isShowSearchPage = true;
    public searchPageContactParam: SearchPageType;

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
        private action$: Actions,

        private admintrationDocumentActions: AdministrationDocumentActions,
        private documentService: DocumentImageOcrService,

        private dmsDashboardHandler: DmsDashboardHandlerService,
        private dispatcher: ReducerManagerDispatcher,
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

        // init param for search page
        this.searchPageContactParam = <SearchPageType>{
            idSettingsGUI: ModuleList.Approval.idSettingsGUI,
            placeHolderText: 'Search in Approval',
        };

        this._selectedSearchResultState$ = this.appStore.select(
            (state) => processDataReducer.getProcessDataState(state, this.ofModule.moduleNameTrim).selectedSearchResult,
        );
        this._enableWidgetTemplateState$ = this.appStore.select(
            (state) =>
                widgetTemplateReducer.getWidgetTemplateState(state, this.ofModule.moduleNameTrim).enableWidgetTemplate,
        );
        this.onSubscribeAction();
    }

    ngOnInit(): void {
        super.onInit();
    }

    ngAfterViewInit(): void {
        super.getModuleToPersonType();

        // const idDocumentContainerScans = this.activatedRoute.snapshot.queryParams['idDocumentContainerScans'];
        // const idMainDocument = this.activatedRoute.snapshot.queryParams['idDocument'];
        // this.idMainDocument = idMainDocument;
        // this.emitDocumentToState(idDocumentContainerScans);
        // this._needToGetDocumentContainerScans = idDocumentContainerScans;

        // Subcribe param url until unsubcribe
        this.activatedRoute.queryParams.pipe(takeUntil(this.getUnsubscriberNotifier())).subscribe((param) => {
            this.idMainDocument = param.idDocument;
            this.emitDocumentToState(param.idDocumentContainerScans);
            this._needToGetDocumentContainerScans = param.idDocumentContainerScans;
        });
    }

    ngOnDestroy(): void {
        this.isShowSearchPage = true;
        super.onDestroy();
    }

    private onSubscribeAction() {
        this.dmsDashboardHandler.onDocumentContainerOcrComponentCreated$
            .pipe(
                filter((isCreated) => isCreated),
                take(1),
            )
            .subscribe((_) => {
                this._isImageOCRCreated = true;
                this.emitDocumentToState(this._needToGetDocumentContainerScans);
            });

        this._selectedSearchResultState$
            .pipe(
                filter((selectedSearchResultState) => !!selectedSearchResultState),
                takeUntil(this.getUnsubscriberNotifier()),
            )
            .subscribe((selectedSearchResultState: SearchResultItemModel) => {
                const data = selectedSearchResultState as any;
                if (!!data.idMainDocument) return;
                this._needToGetDocumentContainerScans = data.idDocumentContainerScans;
                this.emitDocumentToState(data.idDocumentContainerScans);
            });

        this._registerRouterEvent(takeUntil(this.getUnsubscriberNotifier()), () => {
            const idDocumentContainerScans = this.activatedRoute.snapshot.queryParams['idDocumentContainerScans'];
            const idMainDocument = this.activatedRoute.snapshot.queryParams['idDocument'];
            this.idMainDocument = idMainDocument;
            this.emitDocumentToState(idDocumentContainerScans);
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
        // show-hide search page
        this.action$
            .pipe(
                ofType(GlobalSearchActions.ROW_DOUBLE_CLICK, GlobalSearchActions.ROW_CLICK),
                filter((action: CustomAction) => this.isValidPayloadDocument(action)),
                takeUntil(super.getUnsubscriberNotifier()),
            )
            .subscribe((action: CustomAction) => {
                this.isShowSearchPage = false;
            });
        this._registerRouterEvent(
            takeUntil(this.getUnsubscriberNotifier()),
            (idDocument, idDocumentType, idTreeRoot, idInvoiceMainApproval, idDocumentContainerScans) => {
                if (idDocument && idDocumentType && idTreeRoot) {
                    this.isShowSearchPage = false;
                } else {
                    this.isShowSearchPage = true;
                }
                window.localStorage.removeItem(
                    LocalStorageKey.buildKey(LocalStorageKey.LocalStorageGSStepKey, Uti.defineBrowserTabId()),
                );
            },
        );
        // show-hide search page
    }

    private isValidPayloadDocument(action: CustomAction) {
        return (
            action.payload &&
            action.payload.selectedModule &&
            action.payload.selectedModule.idSettingsGUI === MenuModuleId.invoiceApproval
        );
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
            .subscribe((response) => {
                if (response?.length) {
                    this.idDocumentTree = response[0].IdDocumentTree;
                    this.mediaName = response[0].OriginalFileName;
                }
                this.appStore.dispatch(
                    this.admintrationDocumentActions.dispatchDocumentContainerScan({
                        IdDocumentContainerScans: IdDocumentContainerScans,
                        idMainDocument: this.idMainDocument,
                        isProcessingPage: true,
                        isInvoiceApproval: true,
                        images: response,
                    }),
                );
            });
    }

    private _registerRouterEvent(
        disposeWhen: MonoTypeOperatorFunction<any>,
        callback: (
            idDocument: number,
            idDocumentType: number,
            idTreeRoot: number,
            idInvoiceMainApproval: number,
            idDocumentContainerScans: number,
        ) => void,
    ) {
        this.router.events.pipe(disposeWhen).subscribe((e) => {
            let currentRoute = this.activatedRoute.root;
            while (currentRoute.children[0] !== undefined) {
                currentRoute = currentRoute.children[0];
            }

            if (e instanceof NavigationEnd) {
                callback(
                    +this.activatedRoute.snapshot.queryParams['idDocumentType'],
                    +this.activatedRoute.snapshot.queryParams['idDocument'],
                    +this.activatedRoute.snapshot.queryParams['idTreeRoot'],
                    +this.activatedRoute.snapshot.queryParams['idInvoiceMainApproval'],
                    +this.activatedRoute.snapshot.queryParams['idDocumentContainerScans'],
                );
            }
        });
    }
}
