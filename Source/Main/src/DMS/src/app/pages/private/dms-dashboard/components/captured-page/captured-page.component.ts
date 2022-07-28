import {
    Component,
    OnInit,
    OnDestroy,
    ElementRef,
    AfterViewInit,
    ChangeDetectorRef,
    ViewChild,
    AfterContentInit,
    Type,
} from '@angular/core';
import { Router, NavigationEnd, ActivatedRoute } from '@angular/router';
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
    SearchResultItemModel,
    Module,
    ModuleSettingModel,
    SimpleTabModel,
    MessageModel,
    ApiResultResponse,
    AccessRightModel,
    GlobalSettingModel,
} from '@app/models';
import { EditingWidget } from '@app/state-management/store/reducer/widget-content-detail';
import { Store, ReducerManagerDispatcher } from '@ngrx/store';
import { AppState } from '@app/state-management/store';
import { Observable, Subscription } from 'rxjs';
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
} from '@app/state-management/store/actions';

import * as tabSummaryReducer from '@app/state-management/store/reducer/tab-summary';
import * as moduleSettingReducer from '@app/state-management/store/reducer/module-setting';
import * as layoutInfoReducer from '@app/state-management/store/reducer/layout-info';
import * as processDataReducer from '@app/state-management/store/reducer/process-data';
import { BaseComponent, ModuleList } from '@app/pages/private/base';
import * as widgetContentReducer from '@app/state-management/store/reducer/widget-content-detail';
import { AdministrationDocumentSelectors, SubLayoutInfoState } from '@app/state-management/store/reducer';
import { DocumentContainerOcrStateModel } from '@app/state-management/store/models/administration-document/state/document-container-ocr.state.model';
import { DocumentTreeModel } from '@app/models/administration-document/document-tree.payload.model';
import { XnVerticalTabHeaderComponent } from '@app/shared/components/xn-tab';
import { CapturedFormModeEnum } from '@app/models/administration-document/document-form/captured-form-mode.enum';
import { Location } from '@angular/common';
import { CapturedFormMediator } from '@app/state-management/store/models/administration-document/captured-form-mediator.payload';
import {
    ContactFormColleague,
    CapturedFormColleague,
} from '@app/state-management/store/models/administration-document/captured-form-colleague.payload';
import { OcrDataVisitor } from '@app/state-management/store/models/administration-document/ocr-data-visitor-pattern/ocr-data-visitor.payload';
import { IElement } from '@app/models/common/ielement.model';
import { ExtractedDataOcrState } from '@app/state-management/store/models/administration-document/state/extracted-data-ocr.state.model';
import { takeUntil, filter, map } from 'rxjs/operators';
import { SplitAreaDirective } from 'angular-split';
import {
    AppGlobalActionNames,
    ExpandDocumentFormGlobalAction,
} from '@app/state-management/store/actions/app-global/app-global.actions';
import { IOpenFormParamsAction } from '@app/xoonit-share/processing-form/interfaces/open-form-params-action.interface';
import {
    OpenFormMethodEnum,
    OpenInvoiceFormAction,
    OpenContractFormAction,
    OpenOtherDocumentsFormAction,
    CloseMyDMFormAction,
    ClearMyDMFormAction,
    ShowMyDMFormUIAction,
    HideMyDMFormUIAction,
} from '@widget/components/widget-mydm-form/actions/widget-mydm-form.actions';

@Component({
    selector: 'captured-page',
    templateUrl: './captured-page.component.html',
    styleUrls: ['./captured-page.component.scss'],
})
export class CapturedPageComponent extends BaseComponent implements OnInit, OnDestroy, AfterViewInit {
    private _dragProgressTimer = null;
    private _moduleSetting: ModuleSettingModel[];
    private _widgetTemplateActionType: Type<any>;
    private _isExpandedDocumentForm = false;

    private _layoutInfoModelSubscription: Subscription;
    private _tabHeaderDataModelSubscription: Subscription;
    private _moduleSettingStateSubscription: Subscription;
    //private _requestEditLayoutStateSubscription: Subscription;

    private _layoutInfoModel: Observable<SubLayoutInfoState>;
    private _tabHeaderDataModel: Observable<TabSummaryModel[]>;
    private _moduleSettingState: Observable<ModuleSettingModel[]>;
    private _selectedSearchResultState$: Observable<SearchResultItemModel>;
    private _needToGetDocumentContainerScans: number;
    private _capturedFormMediator: CapturedFormMediator;

    // this field is a flag to describe that user do not select a folder (it means when import document, user do not select a folder to import)
    private _didSelectFolderImport = false;

    public _splitterConfigSetting: {
        leftHorizontal: number;
        rightHorizontal: number;
        subRightLeftHorizontal: number;
        subRightRightHorizontal: number;
    };

    public splitterConfig: {
        leftHorizontal: number;
        rightHorizontal: number;
        subRightLeftHorizontal: number;
        subRightRightHorizontal: number;
    };

    public tabContainerStyle: any;
    public captureCommonSectionWrapperStyle: any;
    public config: any;
    public tabList: TabSummaryModel[];
    public gutterSize: number;
    public tabSetting: any;
    //public editLayout: boolean;
    public documentContainerOcr: DocumentContainerOcrStateModel;
    public folder: DocumentTreeModel;

    @ViewChild('horizontalSplit', { static: true }) horizontalSplit: any;
    @ViewChild(XnVerticalTabHeaderComponent) xnVerticalTabHeaderComponent: XnVerticalTabHeaderComponent;

    constructor(
        private elementRef: ElementRef,
        protected router: Router,
        private locationService: Location,
        private route: ActivatedRoute,
        private moduleSettingService: ModuleSettingService,
        private tabService: TabService,
        private store: Store<AppState>,
        private tabSummaryActions: TabSummaryActions,
        private moduleSettingActions: ModuleSettingActions,
        private processDataActions: ProcessDataActions,
        private widgetDetailActions: WidgetDetailActions,
        private modalService: ModalService,
        private commonService: CommonService,
        private appErrorHandler: AppErrorHandler,
        private xnCommonActions: XnCommonActions,
        private moduleActions: ModuleActions,
        private splitter: SplitterService,
        private toastService: ToasterService,
        protected ref: ChangeDetectorRef,
        private dispatcher: ReducerManagerDispatcher,
        private globalSettingService: GlobalSettingService,
        private globalSettingConstant: GlobalSettingConstant,
        private administrationActions: AdministrationDocumentActions,
        private administrationSelectors: AdministrationDocumentSelectors,
        private administrationDocumentActions: AdministrationDocumentActions,
    ) {
        super(router);

        this.ofModule = ModuleList.Processing;

        router.events.pipe(takeUntil(this.getUnsubscriberNotifier())).subscribe((e) => {
            let currentRoute = this.route.root;
            while (currentRoute.children[0] !== undefined) {
                currentRoute = currentRoute.children[0];
            }
            if (e instanceof NavigationEnd) {
                // you can do it for exact phase
                this.getDocumentContainerOcrWhenRoutingWithParam();
            }
        });

        this._layoutInfoModel = store.select((state) =>
            layoutInfoReducer.getLayoutInfoState(state, this.ofModule.moduleNameTrim),
        );
        this._tabHeaderDataModel = store.select(
            (state) => tabSummaryReducer.getTabSummaryState(state, this.ofModule.moduleNameTrim).tabs,
        );
        this._moduleSettingState = store.select(
            (state) => moduleSettingReducer.getModuleSettingState(state, this.ofModule.moduleNameTrim).moduleSetting,
        );
        this._selectedSearchResultState$ = store.select(
            (state) => processDataReducer.getProcessDataState(state, this.ofModule.moduleNameTrim).selectedSearchResult,
        );
        this.tabContainerStyle = {};
        this.captureCommonSectionWrapperStyle = {};
        this.config = { left: 68, right: 32 };
        this.gutterSize = 0;
        //this.editLayout = false;
        this.splitterConfig = {
            ...this.splitterConfig,
            subRightLeftHorizontal: 0,
            subRightRightHorizontal: 100,
        };
        this._capturedFormMediator = new CapturedFormMediator();

        this.subscribe();
    }

    ngOnInit(): void {
        this.loadUndergroundTabs(this.ofModule);
        this.store.dispatch(this.administrationActions.setCapturedFormsMode(CapturedFormModeEnum.Created));
        this.store.dispatch(this.administrationDocumentActions.changeModeSelectableFolder());

        // style for angular-split
        this.stylingSplitGutter();
        this.expandCapturedForm(false);
        this.loadSplitterSettings();
    }

    ngAfterViewInit(): void {
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
            subRightLeftHorizontal: this.horizontalSplit.displayedAreas[0].size,
            subRightRightHorizontal: this.horizontalSplit.displayedAreas[1].size,
        };

        this.saveSplitterSettings();
    }

    private loadSplitterSettings() {
        this.globalSettingService.getAllGlobalSettings(this.ofModule.idSettingsGUI).subscribe((data: any) => {
            this.appErrorHandler.executeAction(() => {
                if (data && data.length) {
                    const verticalTabSplitterSettings = data.filter((p) => p.globalName == 'VerticalTabSplitter');
                    if (verticalTabSplitterSettings && verticalTabSplitterSettings.length) {
                        verticalTabSplitterSettings.forEach((setting) => {
                            /*  //!Notice
                                    we save splitterConfig to another variable
                                    because we don't want this config to apply now to UI
                                    at the first time load captured-page, document-image-ocr component (subRightRightHorizontal) always display 100% flex-basis
                                    when click button to toggle captured form then we apply this config (this._splitterConfigSetting) to this.splitterConfigSetting
                                */
                            this._splitterConfigSetting = JSON.parse(setting.jsonSettings);
                            // if (!this.horizontalSplit) return;

                            // this.horizontalSplit.updateArea(
                            //     this.horizontalSplit.displayedAreas[0].component,
                            //     1,
                            //     this.splitterConfig.subRightLeftHorizontal,
                            //     20,
                            // );
                            // this.horizontalSplit.updateArea(
                            //     this.horizontalSplit.displayedAreas[1].component,
                            //     1,
                            //     this.splitterConfig.subRightRightHorizontal,
                            //     20,
                            // );
                        });
                    }
                }
            });
        });
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

    private subscribe() {
        this._selectedSearchResultState$
            .pipe(
                filter((selectedSearchResultState) => !!selectedSearchResultState),
                takeUntil(this.getUnsubscriberNotifier()),
            )
            .subscribe((selectedSearchResultState: SearchResultItemModel) => {
                const data = selectedSearchResultState as any;

                this.onChangedSelectedSearchResult(data);
            });

        this._layoutInfoModelSubscription = this._layoutInfoModel.subscribe((layoutInfo: SubLayoutInfoState) => {
            this.appErrorHandler.executeAction(() => {
                this.tabContainerStyle = {
                    width: `calc(100% - ${layoutInfo.rightMenuWidth}px)`,
                };
            });
        });

        this._tabHeaderDataModelSubscription = this._tabHeaderDataModel.subscribe(
            (tabHeaderDataModel: TabSummaryModel[]) => {
                this.appErrorHandler.executeAction(() => {
                    if (this.tabList && this.tabList.length) {
                        this.tabList.forEach((tab) => tab.badgeColorChanged && tab.badgeColorChanged.unsubscribe());
                    }
                    this.tabList = tabHeaderDataModel;

                    if (!this.tabList || !this.tabList.length || !this.documentContainerOcr) return;

                    this.store.dispatch(
                        this.administrationActions.getExtractedDataFromOcr({
                            idDocumentContainerOcr: this.documentContainerOcr.IdDocumentContainerOcr,
                            idRepDocumentType: this.documentContainerOcr.IdRepDocumentType,
                        }),
                    );
                });
            },
        );

        this._moduleSettingStateSubscription = this._moduleSettingState.subscribe(
            (moduleSettingState: ModuleSettingModel[]) => {
                this.appErrorHandler.executeAction(() => {
                    if (!isEmpty(moduleSettingState) && moduleSettingState.length) {
                        if (!isEqual(moduleSettingState, this._moduleSetting)) {
                            this._moduleSetting = cloneDeep(moduleSettingState);
                            const jsonSettings = this.moduleSettingService.parseJsonSettings(this._moduleSetting);
                            if (jsonSettings) {
                                this.tabSetting = jsonSettings;
                            }
                        }
                    } else {
                        this._moduleSetting = [];
                        this.tabSetting = null;
                    }
                });
            },
        );

        //this._requestEditLayoutStateSubscription = this.dispatcher.pipe(
        //    filter((action: CustomAction) => {
        //        return (
        //            action.type === LayoutSettingActions.REQUEST_TOGGLE_PANEL &&
        //            action.module.idSettingsGUI == this.ofModule.idSettingsGUI
        //        );
        //    }),
        //    map((action: CustomAction) => {
        //        return action.payload;
        //    })
        //)
        //    .subscribe((isShow: any) => {
        //        this.appErrorHandler.executeAction(() => {
        //            this.editLayout = isShow;
        //        });
        //    });

        this.administrationSelectors
            .actionOfType$(AppGlobalActionNames.APP_EXPAND_DOCUMENT_FORM_GLOBAL)
            .pipe(takeUntil(this.getUnsubscriberNotifier()))
            .subscribe((action: ExpandDocumentFormGlobalAction) => {
                this.expandCapturedForm(action.payload.isExpanded);
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

                if (folder) {
                    this._widgetTemplateActionType = this.convertToWidgetTemplateAction(payload);
                }

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
                this.toastService.pop(MessageModal.MessageType.error, 'System', `An error occurs when saving document`);
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
                this.expandCapturedForm(false);
                // this.goToCapture(this.folder);
                // this.store.dispatch(this.administrationActions.enableButtonSaveWidgetDmsAction({ isEnabled: true }));
                this.toastService.pop(MessageModal.MessageType.success, 'System', `Save document successfully`);
                this.store.dispatch(new CloseMyDMFormAction());
            });

        this.administrationSelectors
            .actionOfType$(AdministrationDocumentActionNames.GET_DOCUMENTS_THUMBNAIL_DONE)
            .pipe(takeUntil(this.getUnsubscriberNotifier()))
            .subscribe((action: CustomAction) => {
                if (!this._needToGetDocumentContainerScans) return;

                this.store.dispatch(
                    this.administrationActions.selectCaptureDocumentOnGlobalSearch(
                        this._needToGetDocumentContainerScans,
                    ),
                );
                this._needToGetDocumentContainerScans = null;
            });

        this.dispatcher
            .pipe(
                filter((action: CustomAction) => action.type === DocumentThumbnailActions.DOCUMENT_THUMBNAIL_NO_ITEM),
                takeUntil(this.getUnsubscriberNotifier()),
            )
            .subscribe((_) => {
                this.expandCapturedForm(false);
                this.store.dispatch(this.administrationActions.enableButtonSaveWidgetDmsAction({ isEnabled: false }));
                this.store.dispatch(this.administrationActions.enableButtonToggledCapturedForm({ isEnabled: false }));
                this.clearDataCaptured();
            });

        this.administrationSelectors
            .actionOfType$(AdministrationDocumentActionNames.REGISTER_LINK_CONNECTION_CONTACT_FORM_COLLEAGUE)
            .pipe(takeUntil(this.getUnsubscriberNotifier()))
            .subscribe((action: CustomAction) => {
                const payload = action.payload as CapturedFormColleague;
                this._capturedFormMediator.register(payload);
            });
    }

    private loadUndergroundTabs(moduleInfo: Module) {
        const param = {
            module: moduleInfo,
            idObject: '',
        };

        this.tabService.getTabSummaryInfor(param).subscribe((response: ApiResultResponse) => {
            if (!Uti.isResquestSuccess(response)) {
                return;
            }
            this.store.dispatch(this.tabSummaryActions.storeUndergroundTabs(response.item, this.ofModule));
        });
    }

    private stylingSplitGutter() {
        if (this.horizontalSplit) {
            this.horizontalSplit.minPercent = 0;

            const gutter = $('.as-split-gutter', this.horizontalSplit.elRef.nativeElement);
            if (gutter.length) {
                gutter.addClass('transparent-gutter');
            }
        }
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

    private changeTabsFormByFolder(folder: DocumentTreeModel) {
        const docType = DocumentHelper.parseDocumentTypeToDocumentProcessingTypeEnum(folder.idDocumentType);

        if (!this.documentContainerOcr || !folder.idDocumentType || !docType) return;

        const param = {
            module: this.ofModule,
            idObject: this.documentContainerOcr.IdDocumentContainerOcr,
            idRepDocumentType: folder.idDocumentType,
            documentType: docType,
        };
        this.store.dispatch(this.tabSummaryActions.loadTabsByIdDocumentType(param));
    }

    private expandCapturedForm(isExpanded: boolean) {
        // this._isExpandedDocumentForm = isExpanded;
        // if (!isExpanded) {
        //     this.gutterSize = 0;
        //     this.splitterConfig.subRightLeftHorizontal = 0;
        //     this.splitterConfig.subRightRightHorizontal = 100;
        //     this.captureCommonSectionWrapperStyle = {
        //         margin: 'auto 5px',
        //     };
        //     this.store.dispatch(new HideMyDMFormUIAction());
        //     return;
        // }
        // this.gutterSize = 5;
        // this.splitterConfig.subRightRightHorizontal =
        //     this._splitterConfigSetting.subRightLeftHorizontal <= 0 ? 65 : this._splitterConfigSetting.subRightRightHorizontal;
        // this.splitterConfig.subRightLeftHorizontal =
        //     this._splitterConfigSetting.subRightLeftHorizontal <= 0 ? 35 : this._splitterConfigSetting.subRightLeftHorizontal;
        // this.captureCommonSectionWrapperStyle = {
        //     margin: 'auto',
        // };
        // this.store.dispatch(new ShowMyDMFormUIAction());
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
    }

    private clearKeywordAndTodo() {
        this.store.dispatch(this.administrationActions.setDocumentTodo(''));
        this.store.dispatch(this.administrationActions.setDocumentKeyword(''));
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
        // this.clearFormsStateAndRemoveTabs();
        this.store.dispatch(
            this.administrationActions.getExtractedDataFromOcr({
                idDocumentContainerOcr: this.documentContainerOcr.IdDocumentContainerOcr,
                idRepDocumentType: this.documentContainerOcr.IdRepDocumentType,
            }),
        );
    }

    private didNotSelectFolderCase(documentContainerOcr: DocumentContainerOcrStateModel) {
        this.documentContainerOcr = documentContainerOcr;
        this.expandCapturedForm(false);
        this.store.dispatch(this.administrationDocumentActions.changeModeSelectableFolder());
        this.clearSelectedFolder();
        this.clearFormsStateAndRemoveTabs();

        // this.store.dispatch(this.administrationActions.clearPathFolderOnCapturedTree());
        // setTimeout(() => {
        //     // in case this component is initialized, then it open again, so we need to wait until SplitterCOmponent re-init
        //     this.expandCapturedForm(false);
        //     this.didManipulateCapturedFile(false);
        // }, 500);
    }

    private convertToWidgetTemplateAction(folder: DocumentTreeModel) {
        switch (folder.idDocumentType) {
            case DocumentMyDMType.Invoice:
                return OpenInvoiceFormAction;

            case DocumentMyDMType.Contract:
                return OpenContractFormAction;

            case DocumentMyDMType.OtherDocuments:
                return OpenOtherDocumentsFormAction;

            default:
                throw new Error(`this document type id ${folder.idDocumentType} is unknown`);
        }
    }

    private _openDocumentForm() {
        if (this.folder && this.documentContainerOcr && this._widgetTemplateActionType) {
            const payload = <IOpenFormParamsAction>{
                folder: this.folder,
                documentContainerOcr: this.documentContainerOcr,
                config: {
                    method: OpenFormMethodEnum.LOAD_COLUMN_SETTINGS,
                    getDetail: null,
                },
            };
            this.store.dispatch(new this._widgetTemplateActionType(payload));
        }
    }
}
