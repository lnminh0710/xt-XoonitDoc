import {
    Component,
    OnInit,
    OnDestroy,
    ElementRef,
    AfterViewInit,
    ChangeDetectorRef,
    ViewChild,
    Type,
    TemplateRef,
} from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { ToasterService } from 'angular2-toaster/angular2-toaster';
import isEmpty from 'lodash-es/isEmpty';
import cloneDeep from 'lodash-es/cloneDeep';
import isEqual from 'lodash-es/isEqual';
import isNil from 'lodash-es/isNil';
import {
    RequestSavingMode,
    MenuModuleId,
    ModuleType,
    GlobalSettingConstant,
    AccessRightTypeEnum,
    Configuration,
    ComboBoxTypeConstant,
    MessageModal,
    LocalStorageKey,
    DocumentMyDMType,
} from '@app/app.constants';
import { Uti, LocalStorageProvider, LocalStorageHelper, String, DocumentHelper } from '@app/utilities';
import { ModuleSettingService, SplitterService, AccessRightsService } from '@app/services';
import {
    TabService,
    ModalService,
    CommonService,
    AppErrorHandler,
    BackOfficeService,
    GlobalSettingService,
} from '@app/services';
import {
    ParkedItemModel,
    TabSummaryModel,
    TabSummaryInfoModel,
    Module,
    ModuleSettingModel,
    SimpleTabModel,
    MessageModel,
    ApiResultResponse,
    AccessRightModel,
    GlobalSettingModel,
    SearchResultItemModel,
} from '@app/models';
import { EditingWidget } from '@app/state-management/store/reducer/widget-content-detail';
import { Store, ReducerManagerDispatcher } from '@ngrx/store';
import { AppState } from '@app/state-management/store';
import { Observable, Subscription, zip } from 'rxjs';
import {
    ParkedItemActions,
    TabSummaryActions,
    ModuleSettingActions,
    ProcessDataActions,
    WidgetDetailActions,
    XnCommonActions,
    SearchResultActions,
    BackofficeActions,
    ModuleActions,
    CustomAction,
    DocumentThumbnailActions,
    AdministrationDocumentActionNames,
    AdministrationDocumentActions,
    LayoutSettingActions,
    GlobalSearchActions,
    LayoutInfoActions,
    NotificationPopupActions,
} from '@app/state-management/store/actions';

import * as tabSummaryReducer from '@app/state-management/store/reducer/tab-summary';
import * as moduleSettingReducer from '@app/state-management/store/reducer/module-setting';
import * as layoutInfoReducer from '@app/state-management/store/reducer/layout-info';
import * as processDataReducer from '@app/state-management/store/reducer/process-data';
import { BaseComponent, ModuleList } from '@app/pages/private/base';
import * as widgetContentReducer from '@app/state-management/store/reducer/widget-content-detail';
import {
    AdministrationDocumentSelectors,
    SubLayoutInfoState,
    AppGlobalSelectors,
} from '@app/state-management/store/reducer';
import { DocumentContainerOcrStateModel } from '@app/state-management/store/models/administration-document/state/document-container-ocr.state.model';
import { DocumentTreeModel } from '@app/models/administration-document/document-tree.payload.model';
import { XnVerticalTabHeaderComponent } from '@app/shared/components/xn-tab';
import { Actions } from '@ngrx/effects';
import { CapturedFormModeEnum } from '@app/models/administration-document/document-form/captured-form-mode.enum';
import { takeUntil, filter, map, take } from 'rxjs/operators';
import {
    OpenInvoiceFormAction,
    OpenContractFormAction,
    OpenOtherDocumentsFormAction,
    ClearMyDMFormAction,
    CloseMyDMFormAction,
    HideMyDMFormUIAction,
    ShowMyDMFormUIAction,
    OpenFormMethodEnum,
    OpenMyDMFormAction,
} from '@widget/components/widget-mydm-form/actions/widget-mydm-form.actions';
import {
    AppGlobalActionNames,
    ExpandDocumentFormGlobalAction,
    DeleteGlobalAction,
} from '@app/state-management/store/actions/app-global/app-global.actions';
import { Location } from '@angular/common';
import { IOpenFormParamsAction } from '@app/xoonit-share/processing-form/interfaces/open-form-params-action.interface';
import { DmsDashboardHandlerService } from '../modules/mydm/services/dms-dashboard-handler.service';
import { DocumentImageOcrService } from '../modules/image-control/services';
import { EnableWidgetTemplateState } from '@app/models/widget-template/enable-widget-template.model';
import * as widgetTemplateReducer from '@app/state-management/store/reducer/widget-template';
import { PopupService } from '@app/xoonit-share/components/global-popup/services/popup.service';
import { HeaderConfirmationRef } from '@app/xoonit-share/components/global-popup/components/header-popup/header-confirmation-ref';

@Component({
    selector: 'dms-dashboard',
    styleUrls: ['./dms-dashboard.component.scss'],
    templateUrl: './dms-dashboard.component.html',
})
export class DMSDashboardComponent extends BaseComponent implements OnInit, OnDestroy, AfterViewInit {
    public menuModuleId = MenuModuleId;
    public CapturedFormModeEnum = CapturedFormModeEnum;

    public subModules: Module[];
    private moduleSetting: ModuleSettingModel[];
    public tabSetting: any;
    public modulePrimaryKey: string;
    private selectedTab: TabSummaryModel;
    private selectedSimpleTab: SimpleTabModel;
    public tabList: TabSummaryModel[] = [];
    private uti: Uti;
    private editingWidgets: Array<EditingWidget> = [];
    public activeModule: Module;
    public activeSubModule: Module;
    public ofModuleLocal: Module;
    public splitterConfig = {
        leftHorizontal: 20,
        rightHorizontal: 80,
        subRightLeftHorizontal: 0,
        subRightRightHorizontal: 100,
    };
    public tabContainerStyle: Object = {};
    public configWidth: any = { left: 0, right: 0, spliter: 0 };
    public config: any = { left: 68, right: 32 };
    public gutterSize: number;
    public editLayout: boolean;
    public capturedFormMode: CapturedFormModeEnum;
    public idDocumentContainerScanConfirm: any;
    private _didManipulateCaptureFile: boolean;

    private activeModuleStateSubscription: Subscription;
    private subModulesStateSubscription: Subscription;
    private activeSubModuleStateSubscription: Subscription;
    private moduleSettingStateSubscription: Subscription;
    private tabHeaderDataModelSubscription: Subscription;
    private selectedTabStateSubscription: Subscription;
    private selectedSimpleTabStateSubscription: Subscription;
    private modulePrimaryKeyStateSubscription: Subscription;
    private editingWidgetsStateSubscription: Subscription;
    private userSubcribe: Subscription;
    private selectedDocumentSubscription: Subscription;
    private layoutInfoModelSubscription: Subscription;
    private requestEditLayoutStateSubscription: Subscription;

    private activeModuleState: Observable<Module>;
    private subModulesState: Observable<Module[]>;
    private activeSubModuleState: Observable<Module>;
    private moduleSettingState: Observable<ModuleSettingModel[]>;
    public tabHeaderDataModel: Observable<TabSummaryModel[]>;
    private selectedTabState: Observable<TabSummaryModel>;
    private selectedSimpleTabState: Observable<SimpleTabModel>;
    private modulePrimaryKeyState: Observable<string>;
    private editingWidgetsState: Observable<Array<EditingWidget>>;
    private moduleToPersonTypeState: Observable<any>;
    private layoutInfoModel: Observable<SubLayoutInfoState>;
    private _selectedSearchResultState$: Observable<SearchResultItemModel>;
    // this field is a flag to describe that user do not select a folder (it means when import document, user do not select a folder to import)
    private _didSelectFolderImport = false;
    private _needToGetDocumentContainerScans: number;
    private _isExpandedDocumentForm = false;
    private _widgetTemplateActionType: Type<any>;
    private _enableWidgetTemplateState$: Observable<EnableWidgetTemplateState>;
    private _isImageOCRCreated = false;
    private _idDocumentContainerScanExecuting: any;

    private _dragProgressTimer = null;

    @ViewChild('horizontalSplit') horizontalSplit: any;
    @ViewChild('subRightHorizontalSplit') subRightHorizontalSplit: any;
    @ViewChild(XnVerticalTabHeaderComponent) xnVerticalTabHeaderComponent: XnVerticalTabHeaderComponent;
    @ViewChild('confirmBeforeChangeNewDocument') confirmBeforeChangeNewDocument: TemplateRef<any>;

    public documentContainerOcr: DocumentContainerOcrStateModel;
    public folder: DocumentTreeModel;

    constructor(
        private elementRef: ElementRef,
        protected router: Router,
        private route: ActivatedRoute,
        private moduleSettingService: ModuleSettingService,
        private tabService: TabService,
        private store: Store<AppState>,
        private action$: Actions,
        private tabSummaryActions: TabSummaryActions,
        private moduleSettingActions: ModuleSettingActions,
        private processDataActions: ProcessDataActions,
        private widgetDetailActions: WidgetDetailActions,
        private layoutInfoActions: LayoutInfoActions,
        private modalService: ModalService,
        private commonService: CommonService,
        private appErrorHandler: AppErrorHandler,
        private xnCommonActions: XnCommonActions,
        private moduleActions: ModuleActions,
        private splitter: SplitterService,
        private toasterService: ToasterService,
        private locationService: Location,
        protected ref: ChangeDetectorRef,
        private dispatcher: ReducerManagerDispatcher,
        private globalSettingService: GlobalSettingService,
        private globalSettingConstant: GlobalSettingConstant,
        private administrationActions: AdministrationDocumentActions,
        private administrationSelectors: AdministrationDocumentSelectors,
        private administrationDocumentActions: AdministrationDocumentActions,
        private dmsDashboardHandler: DmsDashboardHandlerService,
        private appGlobalSelectors: AppGlobalSelectors,
        private notificationPopupAction: NotificationPopupActions,
        private documentService: DocumentImageOcrService,
        private popupService: PopupService,
    ) {
        super(router);

        this.ofModuleLocal = this.ofModule = ModuleList.Processing;

        this.uti = new Uti();
        this.tabHeaderDataModel = store.select(
            (state) => tabSummaryReducer.getTabSummaryState(state, this.ofModule.moduleNameTrim).tabs,
        );
        this.activeModuleState = store.select((state) => state.mainModule.activeModule);
        this.subModulesState = store.select((state) => state.mainModule.subModules);
        this.activeSubModuleState = store.select((state) => state.mainModule.activeSubModule);
        this.moduleSettingState = store.select(
            (state) => moduleSettingReducer.getModuleSettingState(state, this.ofModule.moduleNameTrim).moduleSetting,
        );
        this.selectedTabState = store.select(
            (state) => tabSummaryReducer.getTabSummaryState(state, this.ofModule.moduleNameTrim).selectedTab,
        );
        this.selectedSimpleTabState = store.select(
            (state) => tabSummaryReducer.getTabSummaryState(state, this.ofModule.moduleNameTrim).selectedSimpleTab,
        );
        this.modulePrimaryKeyState = store.select(
            (state) => moduleSettingReducer.getModuleSettingState(state, this.ofModule.moduleNameTrim).modulePrimaryKey,
        );
        this.editingWidgetsState = store.select(
            (state) =>
                widgetContentReducer.getWidgetContentDetailState(state, this.ofModule.moduleNameTrim).editingWidgets,
        );
        this.layoutInfoModel = store.select((state) =>
            layoutInfoReducer.getLayoutInfoState(state, this.ofModule.moduleNameTrim),
        );
        this._selectedSearchResultState$ = store.select(
            (state) => processDataReducer.getProcessDataState(state, this.ofModule.moduleNameTrim).selectedSearchResult,
        );
        this._enableWidgetTemplateState$ = store.select(
            (state) =>
                widgetTemplateReducer.getWidgetTemplateState(state, this.ofModule.moduleNameTrim).enableWidgetTemplate,
        );
        this.gutterSize = 5;
        this.editLayout = false;

        this.subscribe();
    }

    private subscribe() {
        this.subcribeModulePrimaryKeyState();
        // this.subcribeActiveModuleState();
        this.subcribeSubModulesState();
        this.subcribeActiveSubModuleState();
        this.subcribeTabHeaderDataModel();
        this.subcribeSelectedTabState();
        this.subscribeSelectedSimpleTabState();
        this.subcribeModuleSettingState();
        this.subscribeEditingWidgetsState();
        this.subcribeLayoutInfoModel();

        //this.subscribeEditLayoutState();

        this.dmsDashboardHandler.onFolderTreeCreated$
            .pipe(
                filter((isCreated) => isCreated),
                take(1),
            )
            .subscribe((_) => {
                this.store.dispatch(this.administrationDocumentActions.changeModeSelectableFolder());
            });

        this.administrationSelectors.didManipulateCaptureFile$
            .pipe(takeUntil(this.getUnsubscriberNotifier()))
            .subscribe((didManipulateCaptureFile: boolean) => {
                this._didManipulateCaptureFile = didManipulateCaptureFile;
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
        this._enableWidgetTemplateState$
            .pipe(
                filter(
                    (enableWidgetTemplate: EnableWidgetTemplateState) =>
                        enableWidgetTemplate.status === false && enableWidgetTemplate.previousStatus === true,
                ),
                takeUntil(this.getUnsubscriberNotifier()),
            )
            .subscribe((enableWidgetTemplate: EnableWidgetTemplateState) => {
                if (!enableWidgetTemplate.status && enableWidgetTemplate.previousStatus) {
                    this._idDocumentContainerScanExecuting = null;
                    this.emitDocumentToState(this._needToGetDocumentContainerScans);
                }
            });
        this.administrationSelectors.capturedFormMode$
            .pipe(takeUntil(this.getUnsubscriberNotifier()))
            .subscribe((mode: CapturedFormModeEnum) => {
                this.capturedFormMode = mode;
            });

        this._selectedSearchResultState$
            .pipe(
                filter((selectedSearchResultState) => !!selectedSearchResultState),
                takeUntil(this.getUnsubscriberNotifier()),
            )
            .subscribe((selectedSearchResultState: SearchResultItemModel) => {
                const data = selectedSearchResultState as any;

                this.onChangedSelectedSearchResult(data);
            });

        this.administrationSelectors
            .actionOfType$(AppGlobalActionNames.APP_EXPAND_DOCUMENT_FORM_GLOBAL)
            .pipe(takeUntil(this.getUnsubscriberNotifier()))
            .subscribe((action: ExpandDocumentFormGlobalAction) => {
                this.expandCapturedForm(action.payload.isExpanded, action.payload.acknowledge);
            });

        this.administrationSelectors
            .actionOfType$(AppGlobalActionNames.APP_DELETE_GLOBAL)
            .pipe(takeUntil(this.getUnsubscriberNotifier()))
            .subscribe((action: DeleteGlobalAction) => {
                this._deleteDocumentCapture();
            });

        this.administrationSelectors.documentContainerOcr$
            .pipe(
                filter((documentContainerOcr) => !!documentContainerOcr),
                takeUntil(this.getUnsubscriberNotifier()),
            )
            .subscribe((documentContainerOcr) => {
                if (this.documentContainerOcr === documentContainerOcr) return;

                this.store.dispatch(new ClearMyDMFormAction());
                this.clearKeywordAndTodo();
                this.clearExtractedDataOcr();
                this._didSelectFolderImport = false;

                // this document already selected folder when importing
                if (documentContainerOcr.IdDocumentTree) {
                    this._didSelectFolderImport = true;
                    this.alreadyChooseFolderWhenUploadCase(documentContainerOcr);
                } else {
                    // not selected folder yet
                    this.didNotSelectFolderCase(documentContainerOcr);
                }

                this.store.dispatch(
                    this.administrationActions.getExtractedDataFromOcr({
                        idDocumentContainerOcr: this.documentContainerOcr.IdDocumentContainerOcr,
                        idRepDocumentType: this.documentContainerOcr.IdRepDocumentType,
                    }),
                );

                // if (!this.folder) {
                //     this.didNotSelectFolderCase(documentContainerOcr);
                //     return;
                // }

                // pick other document and already selected a folder
                // this.chooseNewCaptureFileWithSelectedFolderCase(documentContainerOcr);
            });

        this.administrationSelectors.folder$
            .pipe(takeUntil(this.getUnsubscriberNotifier()))
            .subscribe((folder: DocumentTreeModel) => {
                const payload = folder;

                this.folder = payload;
                this._openDocumentForm();

                if (this._didSelectFolderImport) {
                    this._didSelectFolderImport = false;
                    this.didManipulateCapturedFile(false);
                } else {
                    this.didManipulateCapturedFile(payload ? true : false);
                }

                // if (!payload) {
                //     this.folder = null;
                //     return;
                // }

                // console.log('%c captured-page.component: subscribe SAVE_DOCUMENT_INTO_FOLDER %O', 'color: orange', {
                //     payload,
                //     currentFolder: this.folder,
                // });

                // // there are 2 cases
                // // select a folder for a new captured file.
                // // start selecting other folder from the second time
                // if (!this.folder || (this.folder && payload.idDocumentType !== this.folder.idDocumentType)) {
                //     this.folder = payload;
                //     this.changeTabsFormByFolder(this.folder);
                // } else {
                //     this.setEmptyFormState();
                // }
            });

        this.administrationSelectors
            .actionFailedOfSubtype$(
                AdministrationDocumentActionNames.SAVE_DOCUMENT_INVOICE_FORMS,
                AdministrationDocumentActionNames.SAVE_DOCUMENT_CONTRACT_FORMS,
                AdministrationDocumentActionNames.SAVE_OTHER_DOCUMENT_FORMS,
            )
            .pipe(takeUntil(this.getUnsubscriberNotifier()))
            .subscribe((action) => {
                this.toasterService.pop(
                    MessageModal.MessageType.error,
                    'System',
                    `An error occurs when saving document`,
                );
                this.store.dispatch(this.administrationDocumentActions.saveDocumentFormFailAction());
            });

        this.administrationSelectors
            .actionSuccessOfSubtype$(
                AdministrationDocumentActionNames.SAVE_DOCUMENT_INVOICE_FORMS,
                AdministrationDocumentActionNames.SAVE_DOCUMENT_CONTRACT_FORMS,
                AdministrationDocumentActionNames.SAVE_OTHER_DOCUMENT_FORMS,
            )
            .pipe(takeUntil(this.getUnsubscriberNotifier()))
            .subscribe((_) => {
                this.clearSelectedFolder();
                this.clearDataCaptured();
                // this.expandCapturedForm(false);
                // this.goToCapture(this.folder);
                // this.store.dispatch(this.administrationActions.enableButtonSaveWidgetDmsAction({ isEnabled: true }));
                if (this.idDocumentContainerScanConfirm) {
                    this.emitDocumentToState(this.idDocumentContainerScanConfirm);
                    this.idDocumentContainerScanConfirm = null;
                } else {
                    this.store.dispatch(this.administrationDocumentActions.nextDocumentToClassify(true));
                }
                this.toasterService.pop(MessageModal.MessageType.success, 'System', `Save document successfully`);
                this.store.dispatch(this.administrationDocumentActions.saveDocumentFormSuccessAction());
                this.store.dispatch(new CloseMyDMFormAction());
            });

        this.administrationSelectors
            .actionSuccessOfSubtype$(AdministrationDocumentActionNames.CHANGE_DOCUMENT_TO_OTHER_TREE)
            .pipe(takeUntil(this.getUnsubscriberNotifier()))
            .subscribe((_) => {
                this.clearSelectedFolder();
                this.store.dispatch(this.administrationDocumentActions.nextDocumentToClassify(true));
                this.toasterService.pop(MessageModal.MessageType.success, 'System', `Change document successfully`);
                this.store.dispatch(new CloseMyDMFormAction());
                this.store.dispatch(this.administrationDocumentActions.saveDocumentFormSuccessAction());
            });

        // this.administrationSelectors
        //     .actionOfType$(AdministrationDocumentActionNames.GET_DOCUMENTS_THUMBNAIL_DONE)
        //     .pipe(takeUntil(this.getUnsubscriberNotifier()))
        //     .subscribe((action: CustomAction) => {
        //         // remove later
        //         if (!this._needToGetDocumentContainerScans) return;

        //         this.store.dispatch(
        //             this.administrationActions.selectCaptureDocumentOnGlobalSearch(
        //                 this._needToGetDocumentContainerScans,
        //             ),
        //         );
        //         this._needToGetDocumentContainerScans = null;
        //     });

        this.dispatcher
            .pipe(
                filter((action: CustomAction) => action.type === DocumentThumbnailActions.DOCUMENT_THUMBNAIL_NO_ITEM),
                takeUntil(this.getUnsubscriberNotifier()),
            )
            .subscribe((_) => {
                this.store.dispatch(this.administrationActions.enableButtonSaveWidgetDmsAction({ isEnabled: false }));
                this.store.dispatch(this.administrationActions.enableButtonToggledCapturedForm({ isEnabled: false }));
                this.clearDataCaptured();
            });

        this.dispatcher
            .pipe(
                filter(
                    (action: CustomAction) => action.type === AdministrationDocumentActionNames.GET_DOCUMENT_BY_ID_SCAN,
                ),
                takeUntil(this.getUnsubscriberNotifier()),
            )
            .subscribe((action) => {
                if (this._needToGetDocumentContainerScans && action.payload.firstInit) {
                    return;
                }
                this._needToGetDocumentContainerScans = action.payload.idDocumentContainerScans;
                this.emitDocumentToState(action.payload.idDocumentContainerScans);
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
    }

    private subscribeEditLayoutState() {
        this.requestEditLayoutStateSubscription = this.dispatcher
            .pipe(
                filter((action: CustomAction) => {
                    return (
                        action.type === LayoutSettingActions.REQUEST_TOGGLE_PANEL &&
                        action.module.idSettingsGUI == this.ofModule.idSettingsGUI
                    );
                }),
                map((action: CustomAction) => {
                    return action.payload;
                }),
            )
            .subscribe((isShow: any) => {
                this.appErrorHandler.executeAction(() => {
                    this.editLayout = isShow;
                });
            });
    }

    public ngOnInit() {
        // this.onRowGlobalSearchTableClick();
        this.getModuleSetting();
    }

    public ngAfterViewInit() {
        this.stylingSplitGutter();
        this.loadSplitterSettings();
        this.getModuleToPersonType();
        this.getDocumentContainerOcrWhenRoutingWithParam();
    }

    public ngOnDestroy() {
        super.onDestroy();
        Uti.unsubscribe(this);
        this.clearDataCaptured();
        this.clearSelectedFolder();
    }

    public dragEnd(event: any) {
        this.splitterConfig = {
            ...this.splitterConfig,
            leftHorizontal: this.horizontalSplit.displayedAreas[0].size,
            rightHorizontal: this.horizontalSplit.displayedAreas[1].size,
        };

        this.saveSplitterSettings();
    }

    public dragProgress() {
        clearTimeout(this._dragProgressTimer);
        this._dragProgressTimer = setTimeout(() => {
            this.rotateTabHeader();
        }, 100);
    }

    public rotateTabHeader() {
        if (this.xnVerticalTabHeaderComponent) {
            this.xnVerticalTabHeaderComponent.rotateTabHeader();
        }
    }

    public onTabHeaderClick() {
        this.toggleLeftArea();

        this.dragEnd(null);
    }

    private stylingSplitGutter() {
        if (this.horizontalSplit) {
            this.horizontalSplit.minPercent = 2;

            const gutter = $('.as-split-gutter', this.horizontalSplit.elRef.nativeElement);
            if (gutter.length) {
                gutter.addClass('transparent-gutter');

                gutter.bind('dblclick', () => {
                    this.onTabHeaderClick();
                });
            }

            if (this.horizontalSplit.displayedAreas && this.horizontalSplit.displayedAreas.length) {
                const areas = $('as-split-area', this.horizontalSplit.elRef.nativeElement);
                if (areas.length) {
                    $(areas.get(0)).addClass('min-width-7vw');
                }
            }
        }

        if (this.subRightHorizontalSplit) {
            this.subRightHorizontalSplit.minPercent = 0;
        }
    }

    private loadSplitterSettings() {
        this.globalSettingService.getAllGlobalSettings(this.ofModule.idSettingsGUI).subscribe((data: any) => {
            this.appErrorHandler.executeAction(() => {
                if (data && data.length) {
                    const verticalTabSplitterSettings = data.filter((p) => p.globalName == 'VerticalTabSplitter');
                    if (verticalTabSplitterSettings && verticalTabSplitterSettings.length) {
                        verticalTabSplitterSettings.forEach((setting) => {
                            this.splitterConfig = JSON.parse(setting.jsonSettings);
                            if (!this.horizontalSplit) return;

                            // this.horizontalSplit.updateArea(this.horizontalSplit.displayedAreas[0].component, 1, this.splitterConfig.leftHorizontal, 20);
                            // this.horizontalSplit.updateArea(this.horizontalSplit.displayedAreas[1].component, 1, this.splitterConfig.rightHorizontal, 20);
                        });

                        this.rotateTabHeader();
                    }
                }
            });
        });
    }

    private toggleLeftArea(isOpenUnknownDocumentType = false) {
        if (this.horizontalSplit && this.horizontalSplit.displayedAreas && this.horizontalSplit.displayedAreas.length) {
            if (this.horizontalSplit.displayedAreas && this.horizontalSplit.displayedAreas.length) {
                const areas = $('as-split-area', this.horizontalSplit.elRef.nativeElement);
                if (areas.length) {
                    if ($(areas.get(0)).outerWidth() <= 200) {
                        this.splitterConfig.leftHorizontal = 15;
                        this.splitterConfig.rightHorizontal = 85;
                        // this.horizontalSplit.updateArea(this.horizontalSplit.displayedAreas[0].component, 1, 15, 20);
                        // this.horizontalSplit.updateArea(this.horizontalSplit.displayedAreas[1].component, 1, 85, 20);
                    } else if (!isOpenUnknownDocumentType) {
                        this.splitterConfig.leftHorizontal = 8;
                        this.splitterConfig.rightHorizontal = 92;
                        // this.horizontalSplit.updateArea(this.horizontalSplit.displayedAreas[0].component, 1, 8, 20);
                        // this.horizontalSplit.updateArea(this.horizontalSplit.displayedAreas[1].component, 1, 92, 20);
                    }

                    this.rotateTabHeader();
                }
            }
        }
    }

    private needToSaveCacheGlobalSetting: boolean = false;
    private getModuleSetting() {
        let isGetData = true;

        switch (this.ofModule.idSettingsGUIParent) {
            case MenuModuleId.tools:
            case MenuModuleId.statistic:
            case MenuModuleId.briefe:
            case MenuModuleId.logistic:
            case MenuModuleId.selection:
                break;
            default:
                switch (this.ofModule.idSettingsGUI) {
                    case MenuModuleId.briefe:
                    case MenuModuleId.logistic:
                        //do nothing
                        isGetData = false;
                        break;
                    default:
                        break;
                }
                break;
        } //switch

        if (!isGetData) return;
        zip(
            this.moduleSettingService.getModuleSetting(
                null,
                null,
                this.ofModule.idSettingsGUI.toString(),
                ModuleType.LAYOUT_SETTING,
            ),
            this.globalSettingService.getAllGlobalSettings(this.ofModule.idSettingsGUI).delay(500),
        ).subscribe(
            (response) => {
                this.appErrorHandler.executeAction(() => {
                    const moduleSettingDefault = response[0];
                    const allModuleSettings = response[1] as any;
                    let isLoadModuleSetting = true;
                    if (allModuleSettings && allModuleSettings.length > 0) {
                        const globalSettingName = String.Format(
                            '{0}_{1}',
                            this.globalSettingConstant.moduleLayoutSetting,
                            String.hardTrimBlank(this.ofModule.moduleName),
                        );
                        let moduleSettingItem = allModuleSettings.find(
                            (x) => x.globalName && x.idSettingsGlobal && x.globalName === globalSettingName,
                        );
                        if (moduleSettingItem && moduleSettingItem.idSettingsGlobal && moduleSettingItem.globalName) {
                            moduleSettingItem = JSON.parse(moduleSettingItem.jsonSettings);
                            if (moduleSettingItem) {
                                isLoadModuleSetting = false;
                                const afterMergeModule = Uti.mergeModuleSetting(
                                    moduleSettingDefault['item'],
                                    moduleSettingItem['item'],
                                );
                                this.store.dispatch(
                                    this.moduleSettingActions.loadModuleSettingSuccess(afterMergeModule, this.ofModule),
                                );
                            }
                        }
                    }
                    // If load from GlobalSettings no result -> get from ModuleSettings
                    if (isLoadModuleSetting) {
                        this.needToSaveCacheGlobalSetting = true;

                        this.store.dispatch(
                            this.moduleSettingActions.loadModuleSetting(
                                this.ofModule,
                                null,
                                null,
                                this.ofModule.idSettingsGUI.toString(),
                                ModuleType.LAYOUT_SETTING,
                            ),
                        );
                    }
                });
            },
            (error) => {
                Uti.logError(error);
            },
        );
    }

    private subcribeModuleSettingState() {
        this.moduleSettingStateSubscription = this.moduleSettingState.subscribe(
            (moduleSettingState: ModuleSettingModel[]) => {
                this.appErrorHandler.executeAction(() => {
                    if (!isEmpty(moduleSettingState) && moduleSettingState.length) {
                        if (!isEqual(moduleSettingState, this.moduleSetting)) {
                            this.moduleSetting = cloneDeep(moduleSettingState);
                            const jsonSettingObj = this.moduleSettingService.getValidJsonSetting(this.moduleSetting);
                            if (jsonSettingObj) {
                                //If load from GlobalSettings no result -> get from ModuleSettings and save cache for GlobalSettings
                                this.updateCacheGlobalSetting(this.moduleSetting[0]);

                                this.tabSetting = Uti.tryParseJson(jsonSettingObj.jsonSettings);
                            }
                        }
                    } else {
                        this.moduleSetting = [];
                        this.tabSetting = null;
                    }
                });
            },
        );
    }

    private updateCacheGlobalSetting(moduleSetting: any) {
        if (
            !this.needToSaveCacheGlobalSetting ||
            !moduleSetting ||
            moduleSetting.moduleType != ModuleType.LAYOUT_SETTING
        )
            return;
        this.needToSaveCacheGlobalSetting = false;

        /* moduleSetting:
            idSettingsModule: 159
            objectNr: "38"
            moduleName: "User Management Layout Setting"
            moduleType: "LayoutSetting"
            description: "User Management Layout Setting",
            jsonSettings: "..."
        */

        const globalSettingName = String.Format(
            '{0}_{1}',
            this.globalSettingConstant.moduleLayoutSetting,
            String.hardTrimBlank(this.ofModule.moduleName),
        );
        const globalSettingItem = new GlobalSettingModel({
            globalName: globalSettingName,
            description: 'Module Layout Setting',
            globalType: this.globalSettingConstant.moduleLayoutSetting,
            idSettingsGUI: this.ofModule.idSettingsGUI,
            isActive: true,
            objectNr: this.ofModule.idSettingsGUI.toString(),
            jsonSettings: JSON.stringify({ item: [moduleSetting] }),
        });
        this.globalSettingService.saveUpdateCache(this.ofModule.idSettingsGUI, globalSettingItem);
    }

    private getModuleToPersonType() {
        this.commonService.getModuleToPersonType().subscribe((response: ApiResultResponse) => {
            this.appErrorHandler.executeAction(() => {
                if (!Uti.isResquestSuccess(response) || !response.item.length) {
                    return;
                }
                const result = {};
                for (const item of response.item) {
                    result[item.idSettingsGUI] = item.idRepPersonType;
                }
                this.store.dispatch(this.xnCommonActions.getModuleToPersonType(result, this.ofModule));
            });
        });
    }

    private subcribeSubModulesState() {
        this.subModulesStateSubscription = this.subModulesState.subscribe((subModulesState: Module[]) => {
            this.appErrorHandler.executeAction(() => {
                if (!this.activeModule || this.router.url.indexOf(this.activeModule.moduleNameTrim) === -1) {
                    return;
                }

                if (
                    subModulesState.length &&
                    (subModulesState[0].idSettingsGUI == -1 ||
                        subModulesState[0].idSettingsGUIParent != this.activeModule.idSettingsGUI)
                ) {
                    return;
                }

                this.subModules = subModulesState;
            });
        });
    }

    private subcribeActiveModuleState() {
        this.activeModuleStateSubscription = this.activeModuleState.subscribe((activeModuleState: Module) => {
            this.appErrorHandler.executeAction(() => {
                if (isEmpty(activeModuleState)) {
                    this.activeModule = null;
                    this.store.dispatch(this.moduleActions.setUsingModule(null));
                    return;
                }

                if (this.ofModule && this.ofModule.moduleNameTrim !== 'Base') {
                    // Change other module, then detach the old module to disable detection changes check.
                    if (this.ofModule.moduleNameTrim != activeModuleState.moduleNameTrim) {
                        this.ref.detach();
                        return;
                    } else {
                        this.ref.reattach();
                    }

                    this.store.dispatch(this.moduleActions.setUsingModule(activeModuleState));

                    this.activeModule = activeModuleState;
                }
            });
        });
    }

    private subcribeActiveSubModuleState() {
        this.activeSubModuleStateSubscription = this.activeSubModuleState.subscribe((activeSubModuleState: Module) => {
            this.appErrorHandler.executeAction(() => {
                if (isEmpty(activeSubModuleState)) {
                    return;
                }

                if (
                    this.ofModule.idSettingsGUI == activeSubModuleState.idSettingsGUIParent ||
                    this.ofModule.idSettingsGUI != activeSubModuleState.idSettingsGUI
                ) {
                    return;
                }

                // Change other module, then detach the old module to disable detection changes check.
                if (this.ofModule.moduleNameTrim != activeSubModuleState.moduleNameTrim) {
                    this.ref.detach();
                    return;
                } else {
                    this.ref.reattach();
                }

                this.activeSubModule = activeSubModuleState;
            });
        });
    }

    private subcribeTabHeaderDataModel() {
        this.tabHeaderDataModelSubscription = this.tabHeaderDataModel.subscribe(
            (tabHeaderDataModel: TabSummaryModel[]) => {
                this.appErrorHandler.executeAction(() => {
                    this.tabList = tabHeaderDataModel;
                });
            },
        );
    }

    private subcribeSelectedTabState() {
        this.selectedTabStateSubscription = this.selectedTabState.subscribe((selectedTabState: TabSummaryModel) => {
            this.appErrorHandler.executeAction(() => {
                this.selectedTab = selectedTabState;
            });
        });
    }

    private subscribeSelectedSimpleTabState() {
        this.selectedSimpleTabStateSubscription = this.selectedSimpleTabState.subscribe(
            (selectedSimpleTabState: SimpleTabModel) => {
                this.appErrorHandler.executeAction(() => {
                    this.selectedSimpleTab = selectedSimpleTabState;
                });
            },
        );
    }

    private subcribeModulePrimaryKeyState() {
        this.modulePrimaryKeyStateSubscription = this.modulePrimaryKeyState.subscribe((key: string) => {
            this.appErrorHandler.executeAction(() => {
                this.modulePrimaryKey = key;
            });
        });
    }

    private subscribeEditingWidgetsState() {
        this.editingWidgetsStateSubscription = this.editingWidgetsState.subscribe(
            (editingWidgets: Array<EditingWidget>) => {
                this.appErrorHandler.executeAction(() => {
                    this.editingWidgets = editingWidgets;
                });
            },
        );
    }

    private subcribeLayoutInfoModel() {
        this.layoutInfoModelSubscription = this.layoutInfoModel.subscribe((layoutInfo: SubLayoutInfoState) => {
            this.appErrorHandler.executeAction(() => {
                this.tabContainerStyle = {
                    width: `calc(100% - ${layoutInfo.rightMenuWidth}px)`,
                };
            });
        });
    }

    private saveSplitterSettings() {
        this.globalSettingService
            .getAllGlobalSettings(this.ofModule.idSettingsGUI)
            .subscribe((getAllGlobalSettings) => {
                let verticalTabSplitterSettings = getAllGlobalSettings.find(
                    (x) => x.globalName == 'VerticalTabSplitter',
                );
                if (
                    !verticalTabSplitterSettings ||
                    !verticalTabSplitterSettings.idSettingsGlobal ||
                    !verticalTabSplitterSettings.globalName
                ) {
                    verticalTabSplitterSettings = new GlobalSettingModel({
                        globalName: 'VerticalTabSplitter',
                        globalType: 'VerticalTabSplitter',
                        description: 'Vertical Tab Splitter',
                        isActive: true,
                    });
                }
                verticalTabSplitterSettings.idSettingsGUI = this.ofModule.idSettingsGUI;
                verticalTabSplitterSettings.jsonSettings = JSON.stringify(this.splitterConfig);
                verticalTabSplitterSettings.isActive = true;

                this.globalSettingService.saveGlobalSetting(verticalTabSplitterSettings).subscribe((data) => {
                    this.globalSettingService.saveUpdateCache(
                        this.ofModule.idSettingsGUI.toString(),
                        verticalTabSplitterSettings,
                        data,
                    );
                });
            });
    }

    // private onRowGlobalSearchTableClick() {
    //     const actions = JSON.parse(window.localStorage.getItem(LocalStorageKey.LocalStorageGSStepKey)) as CustomAction[];
    //     if (actions == null || actions[0].type !== GlobalSearchActions.ROW_DOUBLE_CLICK) {
    //         return;
    //     }
    //     const payload = actions[0].payload;
    //     if (!payload || !payload.data || !payload.selectedModule) return;

    //     if (payload.selectedModule.idSettingsGUI === MenuModuleId.invoice ||
    //         payload.selectedModule.idSettingsGUI === MenuModuleId.contract ||
    //         payload.selectedModule.idSettingsGUI === MenuModuleId.otherdocuments ||
    //         payload.selectedModule.idSettingsGUI === MenuModuleId.allDocuments) {
    //             const idMainDocument = payload.data.idMainDocument;
    //             const idRepDocumentGuiType = payload.data.idRepDocumentGuiType;
    //             this.router.navigate([`${Configuration.rootPrivateUrl}/${ModuleList.Capture.moduleName}/${idRepDocumentGuiType}/${idMainDocument}`]);
    //     } else if (payload.selectedModule.idSettingsGUI === MenuModuleId.dokumentErfassen) {
    //         this.store.dispatch(this.administrationActions.selectCaptureDocumentOnGlobalSearch(payload.data.idDocumentContainerScans, this.callbackFromImageSlider));
    //         this.router.navigate([`${Configuration.rootPrivateUrl}/${ModuleList.Capture.moduleName}`]);
    //     }
    // }

    // private callbackFromImageSlider(response: any) {
    //     console.log('dms-dashboard.component: callbackFromImageSlider', response);
    // }

    // private onChangedSelectedSearchResult(searchResult: any) {
    //     const actions = JSON.parse(window.localStorage.getItem(LocalStorageKey.LocalStorageGSStepKey)) as CustomAction[];
    //     if (actions == null || actions[0].type !== GlobalSearchActions.ROW_DOUBLE_CLICK) {
    //         return;
    //     }

    //     const payload = actions[0].payload;
    //     if (!payload || !payload.data || !payload.selectedModule) return;

    // window.localStorage.removeItem(LocalStorageKey.LocalStorageGSStepKey);

    // if (payload.selectedModule.idSettingsGUI === MenuModuleId.invoice ||
    //     payload.selectedModule.idSettingsGUI === MenuModuleId.contract ||
    //     payload.selectedModule.idSettingsGUI === MenuModuleId.otherdocuments ||
    //     payload.selectedModule.idSettingsGUI === MenuModuleId.allDocuments ||
    //     payload.selectedModule.idSettingsGUI === MenuModuleId.dokumentErfassen
    // ) {
    /* this.store.dispatch(this.moduleActions.requestChangeModule(payload.selectedModule as Module));*/
    // const idMainDocument = searchResult.idMainDocument;
    // const idRepDocumentGuiType = searchResult.idRepDocumentGuiType;

    // if (!idMainDocument || !idRepDocumentGuiType) return;

    // this.router.navigate([`${Configuration.rootPrivateUrl}/${ModuleList.Capture.moduleName}/detail`], { queryParams: { idDocumentType: idRepDocumentGuiType, idDocument: idMainDocument } });
    // } else if (payload.selectedModule.idSettingsGUI === MenuModuleId.dokumentErfassen) {
    //     this.store.dispatch(this.moduleActions.requestChangeModule(payload.selectedModule as Module));
    // }
    // }

    private expandCapturedForm(isExpanded: boolean, acknowledge?: (ack: boolean) => void) {
        this._isExpandedDocumentForm = isExpanded;
        const payload = {
            acknowledge: acknowledge,
        };

        if (!isExpanded) {
            this.gutterSize = 0;
            this.splitterConfig.subRightLeftHorizontal = 0;
            this.splitterConfig.subRightRightHorizontal = 100;

            // this.captureCommonSectionWrapperStyle = {
            //     margin: 'auto 5px',
            // };

            this.store.dispatch(new HideMyDMFormUIAction(payload));
            return;
        }

        this.gutterSize = 5;
        // this.splitterConfig.subRightRightHorizontal =
        //     this._splitterConfigSetting.subRightLeftHorizontal <= 0 ? 65 : this._splitterConfigSetting.subRightRightHorizontal;
        // this.splitterConfig.subRightLeftHorizontal =
        //     this._splitterConfigSetting.subRightLeftHorizontal <= 0 ? 35 : this._splitterConfigSetting.subRightLeftHorizontal;

        // this.captureCommonSectionWrapperStyle = {
        //     margin: 'auto',
        // };

        this.store.dispatch(new ShowMyDMFormUIAction(payload));
    }

    private getDocumentContainerOcrWhenRoutingWithParam() {
        const idDocumentContainerScans = +this.route.snapshot.queryParams['idDocumentContainerScans'];

        if (!idDocumentContainerScans || this._needToGetDocumentContainerScans === idDocumentContainerScans) return;

        this._needToGetDocumentContainerScans = idDocumentContainerScans;
        this.locationService.replaceState(`${Configuration.rootPrivateUrl}/${ModuleList.Processing.moduleNameTrim}`);
        this.store.dispatch(
            this.administrationActions.selectCaptureDocumentOnGlobalSearch(this._needToGetDocumentContainerScans),
        );
        // this.store.dispatch(
        //     this.moduleActions.requestToChangeActiveModuleName({
        //         activeModule: ModuleList.Capture,
        //         moduleName: ModuleList.Capture.moduleName,
        //     }),
        // );
    }

    private onChangedSelectedSearchResult(searchResult: any) {
        this._needToGetDocumentContainerScans = searchResult.idDocumentContainerScans;
        this.store.dispatch(
            this.administrationActions.selectCaptureDocumentOnGlobalSearch(this._needToGetDocumentContainerScans),
        );
        if (this._didManipulateCaptureFile) {
            this.idDocumentContainerScanConfirm = searchResult.idDocumentContainerScans;
            this._showPopupConfirmationBeforeChangeNewDocument(searchResult.idDocumentContainerScans);
            return;
        }
        this.emitDocumentToState(searchResult.idDocumentContainerScans);
    }

    private clearKeywordAndTodo() {
        this.store.dispatch(this.administrationActions.setDocumentTodo(''));
        this.store.dispatch(this.administrationActions.setDocumentKeyword(''));
    }

    private clearExtractedDataOcr() {
        this.store.dispatch(this.administrationActions.clearExtractedDataOcr());
    }

    private clearFormsStateAndRemoveTabs() {
        this.store.dispatch(this.administrationActions.clearFormState());
        this.store.dispatch(this.tabSummaryActions.removeAllTabs(ModuleList.Processing));
    }

    private setEmptyFormState() {
        this.store.dispatch(this.administrationActions.setEmptyFormState());
    }

    private didManipulateCapturedFile(isEnabled: boolean) {
        this.store.dispatch(this.administrationActions.didManipulateCapturedFile(isEnabled));
    }

    private alreadyChooseFolderWhenUploadCase(documentContainerOcr: DocumentContainerOcrStateModel) {
        console.log('%c captured-page.component: alreadyChooseFolderWhenUploadCase', 'color: orange');
        this.documentContainerOcr = documentContainerOcr;
        this.store.dispatch(
            this.administrationActions.setHighlightAndSaveDocumentIntoFolder(+documentContainerOcr.IdDocumentTree),
        );
        this.store.dispatch(this.notificationPopupAction.closeTreeNotification());
        // this.clearFormsStateAndRemoveTabs();
        // this.store.dispatch(
        //     this.administrationActions.getExtractedDataFromOcr({
        //         idDocumentContainerOcr: this.documentContainerOcr.IdDocumentContainerOcr,
        //         idRepDocumentType: this.documentContainerOcr.IdRepDocumentType,
        //     }),
        // );
    }

    private clearDataCaptured() {
        this.store.dispatch(this.administrationActions.clearDocumentContainerOcr());
        this.clearFormsStateAndRemoveTabs();
    }

    private clearSelectedFolder() {
        this.didManipulateCapturedFile(false);
        this.store.dispatch(this.administrationActions.clearSelectedFolderOfClassification());
        this.store.dispatch(this.administrationActions.enableButtonSaveWidgetDmsAction({ isEnabled: false }));
        this.store.dispatch(this.administrationActions.enableButtonToggledCapturedForm({ isEnabled: false }));
    }

    private didNotSelectFolderCase(documentContainerOcr: DocumentContainerOcrStateModel) {
        this.documentContainerOcr = documentContainerOcr;
        // this.expandCapturedForm(false);
        this.store.dispatch(this.administrationDocumentActions.changeModeSelectableFolder());
        this.store.dispatch(
            this.notificationPopupAction.openTreeNotification({
                idElement: 'notification-popup-anchor',
                timeOutRemove: -1,
            }),
        );

        this.clearSelectedFolder();
        this.clearFormsStateAndRemoveTabs();

        // this.store.dispatch(this.administrationActions.clearPathFolderOnCapturedTree());
        // setTimeout(() => {
        //     // in case this component is initialized, then it open again, so we need to wait until SplitterCOmponent re-init
        //     this.expandCapturedForm(false);
        //     this.didManipulateCapturedFile(false);
        // }, 500);
    }

    private _openDocumentForm() {
        if (this.folder && this.documentContainerOcr) {
            const payload = <IOpenFormParamsAction>{
                folder: this.folder,
                documentContainerOcr: this.documentContainerOcr,
                config: {
                    method: OpenFormMethodEnum.LOAD_COLUMN_SETTINGS,
                    getDetail: null,
                },
            };
            this.store.dispatch(new OpenMyDMFormAction(payload));
        }
    }

    private _deleteDocumentCapture() {
        if (!this.documentContainerOcr) return;

        this.store.dispatch(
            this.administrationDocumentActions.deleteImageScanDocumentOnThumbnail(
                this.documentContainerOcr.IdDocumentContainerScans.toString(),
            ),
        );
    }

    public emitDocumentToState(IdDocumentContainerScans: any) {
        if (
            !IdDocumentContainerScans ||
            !this._isImageOCRCreated ||
            this._idDocumentContainerScanExecuting === IdDocumentContainerScans
        )
            return;
        this.documentService
            .getDocumentById(IdDocumentContainerScans)
            .pipe(take(1))
            .subscribe((response) => {
                this.store.dispatch(
                    this.administrationDocumentActions.dispatchDocumentContainerScan({
                        IdDocumentContainerScans: IdDocumentContainerScans,
                        isProcessingPage: true,
                        images: response,
                    }),
                );
                if (response[0]) {
                    this._idDocumentContainerScanExecuting = IdDocumentContainerScans;
                    this.store.dispatch(this.administrationDocumentActions.dispatchDocumentContainerOCR(response[0]));
                }
            });
    }

    public saveDocument(closePopup: (data?: any) => void, isSave?: boolean) {
        closePopup();

        if (isSave) {
            try {
                document.getElementById('DokumentErfassen-save-button').click();
            } catch (error) {}
            return;
        } else {
            this.emitDocumentToState(this.idDocumentContainerScanConfirm);
            this.idDocumentContainerScanConfirm = null;
        }
    }

    private _showPopupConfirmationBeforeChangeNewDocument(newIdDocumentContanerScan: number) {
        const popoverRef = this.popupService.open({
            content: this.confirmBeforeChangeNewDocument,
            hasBackdrop: true,
            width: 400,
            header: new HeaderConfirmationRef({ iconClose: true }),
            data: {
                idDocumentContanerScan: newIdDocumentContanerScan,
            },
            disableCloseOutside: true,
        });
    }
}
