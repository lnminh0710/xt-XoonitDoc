import {
    Component,
    OnInit,
    OnDestroy,
    ElementRef,
    AfterViewInit,
    ChangeDetectorRef,
    ViewChild,
    SimpleChanges,
    DoCheck,
    Input,
    Type,
} from '@angular/core';
import { Router, ActivatedRoute, NavigationEnd } from '@angular/router';
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
    DocumentMyDMType,
    DocumentFormNameEnum,
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
import { Actions } from '@ngrx/effects';
import { documentContactTypeList } from '@app/shared/components/widget/components/widget-document-form/control-model/document.enum';
import {
    FormState,
    DocumentForm,
    DocumentsState,
} from '@app/state-management/store/models/administration-document/state/document-forms.state.model';
import { ExtractedDataFormModel } from '@app/models/administration-document/document-form/extracted-data-form.model';
import { CapturedFormColleague } from '@app/state-management/store/models/administration-document/captured-form-colleague.payload';
import { CapturedFormMediator } from '@app/state-management/store/models/administration-document/captured-form-mediator.payload';
import { takeUntil, map, filter, take } from 'rxjs/operators';
import { ColumnDefinition } from '@app/models/common/column-definition.model';
import { IOpenFormParamsAction } from '@app/xoonit-share/processing-form/interfaces/open-form-params-action.interface';
import {
    OpenFormMethodEnum,
    OpenInvoiceFormAction,
    OpenContractFormAction,
    OpenOtherDocumentsFormAction,
} from '@widget/components/widget-mydm-form/actions/widget-mydm-form.actions';

@Component({
    selector: 'captured-document-detail',
    templateUrl: './captured-document-detail.component.html',
    styleUrls: ['./captured-document-detail.component.scss'],
})
export class CapturedDocumentDetailComponent extends BaseComponent implements OnInit, DoCheck, OnDestroy {
    @Input() idDocumentTypeEnumInput: number;
    @Input() idMainDocumentInput: number;

    private _previousUrl;
    private _dragProgressTimer = null;
    private _moduleSetting: ModuleSettingModel[];
    private _documentNameDictionary: Map<DocumentMyDMType, string> = new Map([
        [DocumentMyDMType.Invoice, 'Invoice'],
        [DocumentMyDMType.Contract, 'Contract'],
        [DocumentMyDMType.OtherDocuments, 'Other Documents'],
    ]);
    private _widgetTemplateActionType: Type<any>;

    private _idMainDocument: number;
    private _documentTypeEnum: DocumentMyDMType;
    private _selectedFolder: DocumentTreeModel;
    private _activeModule: Module;
    private _dataDetails: {
        data: ColumnDefinition[];
        newDocumentType: DocumentMyDMType;
        currentDocumentType: DocumentMyDMType;
    };
    private _isChangedFolder: boolean;

    private _layoutInfoModelSubscription: Subscription;
    private _tabHeaderDataModelSubscription: Subscription;
    private _moduleSettingStateSubscription: Subscription;
    private _requestEditLayoutStateSubscription: Subscription;

    private _layoutInfoModel: Observable<SubLayoutInfoState>;
    private _tabHeaderDataModel: Observable<TabSummaryModel[]>;
    private _moduleSettingState: Observable<ModuleSettingModel[]>;
    private _selectedSearchResultState$: Observable<SearchResultItemModel>;
    private _activeModuleState$: Observable<Module>;
    private _capturedFormMediator: CapturedFormMediator;

    public splitterConfig: {
        leftHorizontal: number;
        rightHorizontal: number;
        subRightLeftHorizontal: number;
        subRightRightHorizontal: number;
    };

    public tabContainerStyle: any;
    public captureCommonSectionWrapperStyle: any;
    public configWidth: any;
    public config: any;
    public tabList: TabSummaryModel[];
    public gutterSize: number;
    public tabSetting: any;
    public editLayout: boolean;
    public idDocumentContainerScans: number;
    public idDocumentTree: number;
    public documentContainerOcr: DocumentContainerOcrStateModel;
    public folder: DocumentTreeModel;

    @ViewChild('horizontalSplit') horizontalSplit: any;
    @ViewChild(XnVerticalTabHeaderComponent) xnVerticalTabHeaderComponent: XnVerticalTabHeaderComponent;

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
        private modalService: ModalService,
        private commonService: CommonService,
        private appErrorHandler: AppErrorHandler,
        private xnCommonActions: XnCommonActions,
        private moduleActions: ModuleActions,
        private splitter: SplitterService,
        private toasterService: ToasterService,
        protected ref: ChangeDetectorRef,
        private dispatcher: ReducerManagerDispatcher,
        private globalSettingService: GlobalSettingService,
        private globalSettingConstant: GlobalSettingConstant,
        private administrationActions: AdministrationDocumentActions,
        private administrationSelectors: AdministrationDocumentSelectors,
        private administrationDocumentActions: AdministrationDocumentActions,
    ) {
        super(router);
        // for dialog edit at myDM
        this.ofModule = ModuleList.Processing;

        router.events.pipe(takeUntil(this.getUnsubscriberNotifier())).subscribe((e) => {
            let currentRoute = this.route.root;
            while (currentRoute.children[0] !== undefined) {
                currentRoute = currentRoute.children[0];
            }
            if (e instanceof NavigationEnd) {
                // you can do it for exact phase
                if (
                    !this.route.snapshot.queryParams['idDocumentType'] ||
                    !this.route.snapshot.queryParams['idDocument']
                ) {
                    return;
                }
                this.getDocumentDetail();
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
        this._activeModuleState$ = store.select((state) => state.mainModule.activeModule);

        this.tabContainerStyle = { width: '100%' };
        this.captureCommonSectionWrapperStyle = { margin: 'auto' };
        this.splitterConfig = {
            leftHorizontal: 20,
            rightHorizontal: 80,
            subRightLeftHorizontal: 50,
            subRightRightHorizontal: 50,
        };
        this.configWidth = { left: 0, right: 0, spliter: 0 };
        this.config = { left: 68, right: 32 };
        this.gutterSize = 5;
        this.editLayout = false;
        this._dataDetails = {
            data: null,
            newDocumentType: null,
            currentDocumentType: null,
        };
        this._capturedFormMediator = new CapturedFormMediator();
        this.subscribe();
    }

    public onRouteChanged(event: NavigationEnd) {
        this._previousUrl = event.url;
    }

    public ngOnInit(): void {
        this.loadUndergroundTabs(this.ofModule);
        this.store.dispatch(this.administrationActions.setCapturedFormsMode(CapturedFormModeEnum.Updated));
        this.getDocumentDetail();

        setTimeout(() => {
            this.stylingSplitGutter();
            this.loadSplitterSettings();
        }, 200);
    }

    public ngDoCheck(): void {}

    public ngOnDestroy() {
        super.onDestroy();
        Uti.unsubscribe(this);
        this.clearCapturedData();
    }

    public dragEnd(event: any) {
        this.splitterConfig = {
            ...this.splitterConfig,
            subRightLeftHorizontal: this.horizontalSplit.displayedAreas[0].size,
            subRightRightHorizontal: this.horizontalSplit.displayedAreas[1].size,
        };

        this.saveSplitterSettings();
    }

    private clearCapturedData() {
        this.store.dispatch(this.administrationActions.clearDocumentContainerOcr());
        this.store.dispatch(this.administrationActions.clearFormState());
        this.store.dispatch(this.administrationActions.clearSelectedFolderOfClassification());
        this.store.dispatch(this.tabSummaryActions.removeAllTabs(ModuleList.Processing));
        this.folder = null;
        this.documentContainerOcr = null;
    }

    private subscribe() {
        // this._layoutInfoModelSubscription = this._layoutInfoModel.subscribe((layoutInfo: SubLayoutInfoState) => {
        //     this.appErrorHandler.executeAction(() => {
        //         this.tabContainerStyle = {
        //             'width': `calc(100% - ${layoutInfo.rightMenuWidth}px)`
        //         };
        //     });
        // });

        this._tabHeaderDataModelSubscription = this._tabHeaderDataModel.subscribe(
            (tabHeaderDataModel: TabSummaryModel[]) => {
                this.appErrorHandler.executeAction(() => {
                    if (this.tabList && this.tabList.length) {
                        this.tabList.forEach((tab) => tab.badgeColorChanged && tab.badgeColorChanged.unsubscribe());
                    }
                    this.tabList = tabHeaderDataModel;

                    if (this._isChangedFolder && this.tabList && this.tabList.length) {
                        this.fillUpdatedDataWhenChangeFolder();
                    }
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

        this._requestEditLayoutStateSubscription = this.dispatcher
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
                    `An error occurs when update document`,
                );
            });

        this.administrationSelectors
            .actionSuccessOfSubtype$(
                AdministrationDocumentActionNames.SAVE_DOCUMENT_INVOICE_FORMS,
                AdministrationDocumentActionNames.SAVE_DOCUMENT_CONTRACT_FORMS,
                AdministrationDocumentActionNames.SAVE_OTHER_DOCUMENT_FORMS,
            )
            .pipe(takeUntil(this.getUnsubscriberNotifier()))
            .subscribe((action) => {
                this.toasterService.pop(MessageModal.MessageType.success, 'System', `Update document successfully`);
            });

        this.administrationSelectors
            .actionSuccessOfSubtype$(
                AdministrationDocumentActionNames.GET_CAPTURED_INVOICE_DOCUMENT_DETAIL,
                AdministrationDocumentActionNames.GET_CAPTURED_CONTRACT_DOCUMENT_DETAIL,
                AdministrationDocumentActionNames.GET_CAPTURED_OTHER_DOCUMENT_DETAIL,
            )
            .pipe(takeUntil(this.getUnsubscriberNotifier()))
            .subscribe((action: CustomAction) => {
                if (!action.payload || !action.payload.length) {
                    this.toasterService.pop(MessageModal.MessageType.warning, 'System', `There is no document exists`);
                    return;
                }
                const payload = action.payload as ColumnDefinition[];
                this._dataDetails.data = payload;

                let colIdDocumentContainer: ColumnDefinition;
                let colIdDocumentTree: ColumnDefinition;
                let colKeywords: ColumnDefinition;
                let colNotes: ColumnDefinition;
                let colMediaName: ColumnDefinition;

                this._dataDetails.data.forEach((data) => {
                    switch (data.columnName) {
                        case 'IdDocumentContainerScans':
                            colIdDocumentContainer = data;
                            return;

                        case 'IdDocumentTree':
                            colIdDocumentTree = data;
                            return;

                        case 'SearchKeyWords':
                            colKeywords = data;
                            return;

                        case 'Notes':
                            colNotes = data;
                            return;

                        case 'MediaName':
                            colMediaName = data;
                            return;
                    }
                });

                if (!colIdDocumentContainer || !colIdDocumentTree) return;

                this.store.dispatch(this.administrationActions.setDocumentTodo(colNotes.value));
                this.store.dispatch(this.administrationActions.setDocumentKeyword(colKeywords.value));
                this.store.dispatch(this.administrationActions.setOriginalFileName(colMediaName.value));

                if (this.idDocumentContainerScans) {
                    if (
                        this.idDocumentContainerScans !== +colIdDocumentContainer.value ||
                        this.idDocumentTree !== +colIdDocumentTree.value
                    ) {
                        this.store.dispatch(
                            this.administrationDocumentActions.getDocumentImageOcrForDocumentDetail({
                                idDocumentContainerScans: +colIdDocumentContainer.value,
                                idMainDocument: this._idMainDocument,
                                indexName: Uti.parseIndexName(this._documentTypeEnum),
                            }),
                        );
                    }
                }

                this.idDocumentContainerScans = +colIdDocumentContainer.value;
                this.idDocumentTree = +colIdDocumentTree.value;
            });

        this.administrationSelectors
            .actionOfType$(AdministrationDocumentActionNames.NOTIFY_DOCUMENT_IMAGE_OCR_COMPONENT_INIT_DONE)
            .pipe(
                filter((action) => !!this.idDocumentContainerScans),
                takeUntil(this.getUnsubscriberNotifier()),
            )
            .subscribe((action: CustomAction) => {
                this.store.dispatch(
                    this.administrationDocumentActions.getDocumentImageOcrForDocumentDetail({
                        idDocumentContainerScans: this.idDocumentContainerScans,
                        idMainDocument: this._idMainDocument,
                        indexName: Uti.parseIndexName(this._documentTypeEnum),
                    }),
                );
            });

        this.administrationSelectors.documentContainerOcr$
            .pipe(
                filter((documentContainerOcr) => !!documentContainerOcr),
                takeUntil(this.getUnsubscriberNotifier()),
            )
            .subscribe((documentContainerOcr) => {
                this.documentContainerOcr = documentContainerOcr;
                this.store.dispatch(
                    this.administrationActions.setHighlightAndSaveDocumentIntoFolder(this.idDocumentTree),
                );
                this._openDocumentForm();

                // delay 300ms for widget-forms (widget-kontakt, invoice, notes, contract, etc...) re-init and run lifecycle done
                setTimeout(() => {
                    this.loadTabsByDocumentType();
                }, 300);
            });

        this._selectedSearchResultState$
            .pipe(
                filter((selectedSearchResultState) => !!selectedSearchResultState),
                takeUntil(this.getUnsubscriberNotifier()),
            )
            .subscribe((_selectedSearchResultState: SearchResultItemModel) => {
                const data = _selectedSearchResultState as any;
                // this.router.navigate([], { queryParams: { idDocumentType: data.idRepDocumentGuiType, idDocument: data.idMainDocument } });
                this.getDocumentDetail();
            });

        this._activeModuleState$.pipe(takeUntil(this.getUnsubscriberNotifier())).subscribe((activeModuleState) => {
            this._activeModule = activeModuleState;
        });

        this.administrationSelectors
            .actionOfType$(AdministrationDocumentActionNames.SAVE_DOCUMENT_INTO_FOLDER)
            .pipe(
                filter((action: CustomAction) => !!action.payload),
                takeUntil(this.getUnsubscriberNotifier()),
            )
            .subscribe((action: CustomAction) => {
                this.folder = action.payload as DocumentTreeModel;
                this.updateToChangeFolder(this.folder);
                this._openDocumentForm();
            });

        this.administrationSelectors
            .actionOfType$(AdministrationDocumentActionNames.EXPAND_CAPTURED_FORM)
            .pipe(takeUntil(this.getUnsubscriberNotifier()))
            .subscribe((action: CustomAction) => {
                const payload = action.payload as boolean;
                this.expandCapturedForm(payload);
            });

        this.administrationSelectors
            .actionOfType$(AdministrationDocumentActionNames.REGISTER_LINK_CONNECTION_CONTACT_FORM_COLLEAGUE)
            .pipe(takeUntil(this.getUnsubscriberNotifier()))
            .subscribe((action: CustomAction) => {
                const payload = action.payload as CapturedFormColleague;
                this._capturedFormMediator.register(payload);
            });
    }
    private fillUpdatedDataWhenChangeFolder() {
        this._isChangedFolder = false;
        this.store.dispatch(this.administrationActions.fillUpdatedDataAfterFolder({ data: this._dataDetails.data }));
    }

    // private mapDataAndChangeSuffixOriginalColumnName(
    //     oldIdDocumentType: number,
    //     newIdDocumentType: number,
    //     sourceData: ColumnDefinition[],
    //     contactData: ColumnDefinition[],
    // ) {
    //     const oldDocumentProcessingTypeEnum = DocumentHelper.parseDocumentTypeToDocumentProcessingTypeEnum(
    //         oldIdDocumentType,
    //     );
    //     const newDocumentProcessingTypeEnum = DocumentHelper.parseDocumentTypeToDocumentProcessingTypeEnum(
    //         newIdDocumentType,
    //     );
    //     const oldDocumentContactType = documentContactTypeList.find(
    //         (item) => item.type === oldDocumentProcessingTypeEnum,
    //     );
    //     const newDocumentContactType = documentContactTypeList.find(
    //         (item) => item.type === newDocumentProcessingTypeEnum,
    //     );

    //     const newContactData = cloneDeep(contactData) as ExtractedDataFormModel[];
    //     sourceData.forEach((item, index) => {
    //         let originalColumnName = item.originalColumnName as string;

    //         for (let i = 0; i < newContactData.length; i++) {
    //             const contactData = newContactData[i];
    //             if (contactData.OriginalColumnName !== item.originalColumnName) continue;

    //             if (originalColumnName.endsWith(oldDocumentContactType.data[0].prefix)) {
    //                 originalColumnName = originalColumnName.replace(
    //                     oldDocumentContactType.data[0].prefix,
    //                     newDocumentContactType.data[0].prefix,
    //                 );
    //                 contactData.OriginalColumnName = originalColumnName;
    //             } else if (originalColumnName.endsWith(oldDocumentContactType.data[1].prefix)) {
    //                 originalColumnName = originalColumnName.replace(
    //                     oldDocumentContactType.data[1].prefix,
    //                     newDocumentContactType.data[1].prefix,
    //                 );
    //                 contactData.OriginalColumnName = originalColumnName;
    //             }

    //             ExtractedDataFormModel.mergeWith(item, contactData);
    //             return;
    //         }
    //     });
    // }

    private updateToChangeFolder(folder: DocumentTreeModel) {
        if (folder.idDocument === this.idDocumentTree) {
            // we just dispatch action setHighlightAndSaveDocumentIntoFolder when subscribe this.administrationSelectors.documentContainerOcr$
            // so do nothing
            this._dataDetails.currentDocumentType = this._dataDetails.currentDocumentType
                ? this._dataDetails.currentDocumentType
                : folder.idDocumentType;
            return;
        }

        if (folder.idDocumentType === this._documentTypeEnum) {
            // the same document type folder
            return;
        }

        this.idDocumentTree = folder.idDocument;

        this.administrationSelectors.documentsState$
            .pipe(
                filter((documentsState$) => !!documentsState$),
                take(1),
            )
            .subscribe((documentsState$) => {
                // this.mapDataContactToDataDetails(documentsState$, this._documentTypeEnum, folder.idDocumentType);

                this._documentTypeEnum = folder.idDocumentType;
                this._isChangedFolder = true;
                this.store.dispatch(this.tabSummaryActions.removeAllTabs(ModuleList.Processing));
                this.loadTabsByDocumentType();

                this._documentTypeEnum = folder.idDocumentType;
            });
    }

    private loadTabsByDocumentType() {
        const param = {
            module: this.ofModule,
            idObject: this._idMainDocument,
            idRepDocumentType: this._documentTypeEnum,
            documentType: DocumentHelper.parseDocumentTypeToDocumentProcessingTypeEnum(this._documentTypeEnum),
        };
        this.store.dispatch(this.tabSummaryActions.loadTabsByIdDocumentType(param));
    }

    private getDocumentDetail() {
        const idDocumentType = +this.route.snapshot.queryParams['idDocumentType'];
        const idMainDocument = +this.route.snapshot.queryParams['idDocument'];

        if (idMainDocument === this._idMainDocument) return;

        this._capturedFormMediator.clearContactFormColleagues();

        this._idMainDocument = idMainDocument ? idMainDocument : this.idMainDocumentInput;
        this._documentTypeEnum = idDocumentType ? idDocumentType : this.idDocumentTypeEnumInput;

        this.getDocumentDetailByType(this._documentTypeEnum, this._idMainDocument);

        const documentName = this._documentNameDictionary.get(this._documentTypeEnum);
        this.clearCapturedData();
        this._openDocumentForm();

        // add this if condition, because in widget-file-explorer that re-use this component (captured-document-detail) on popup
        if (this._activeModule && this._activeModule.idSettingsGUI === ModuleList.Processing.idSettingsGUI) {
            // dispatch event to change header name for respective document type
            this.store.dispatch(
                this.moduleActions.requestToChangeActiveModuleName({
                    activeModule: ModuleList.Processing,
                    moduleName: documentName,
                }),
            );
        }
    }

    private getDocumentDetailByType(idDocumentType: DocumentMyDMType, idMainDocument: number) {
        switch (idDocumentType) {
            case DocumentMyDMType.Invoice:
                this._widgetTemplateActionType = OpenInvoiceFormAction;
                this.store.dispatch(
                    this.administrationDocumentActions.getCapturedInvoiceDocumentDetail(idMainDocument),
                );
                break;

            case DocumentMyDMType.Contract:
                this._widgetTemplateActionType = OpenContractFormAction;
                this.store.dispatch(
                    this.administrationDocumentActions.getCapturedContractDocumentDetail(idMainDocument),
                );
                break;

            case DocumentMyDMType.OtherDocuments:
                this._widgetTemplateActionType = OpenOtherDocumentsFormAction;
                this.store.dispatch(this.administrationDocumentActions.getCapturedOtherDocumentDetail(idMainDocument));
                break;

            default:
                return;
        }
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

    private loadSplitterSettings() {
        this.globalSettingService.getAllGlobalSettings(this.ofModule.idSettingsGUI).subscribe((data: any) => {
            this.appErrorHandler.executeAction(() => {
                if (data && data.length) {
                    const verticalTabSplitterSettings = data.filter((p) => p.globalName == 'VerticalTabSplitter');
                    if (verticalTabSplitterSettings && verticalTabSplitterSettings.length) {
                        verticalTabSplitterSettings.forEach((setting) => {
                            this.splitterConfig = JSON.parse(setting.jsonSettings);
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

    // private mapDataContactToDataDetails(
    //     documentsState: DocumentsState,
    //     currentDocumentType: DocumentMyDMType,
    //     newDocumentType: DocumentMyDMType,
    // ) {
    //     const documentProcessingType = DocumentHelper.parseDocumentTypeToDocumentProcessingTypeEnum(
    //         currentDocumentType,
    //     );
    //     const documentsData = documentsState.documentsForm[documentProcessingType] as DocumentForm;
    //     const widgetContactForm = documentsData.formsState[DocumentFormNameEnum.WIDGET_CONTACT] as FormState;
    //     this._dataDetails.newDocumentType = newDocumentType;

    //     this.mapDataAndChangeSuffixOriginalColumnName(
    //         currentDocumentType,
    //         newDocumentType,
    //         this._dataDetails.data,
    //         widgetContactForm.data,
    //     );

    // const documentProcessingType = DocumentHelper.parseDocumentTypeToDocumentProcessingTypeEnum(
    //     this._documentTypeEnum,
    // );
    // const documentsData = documentsState$.documentsForm[documentProcessingType] as DocumentForm;
    // const widgetContactForm = documentsData.formsState[DocumentFormNameEnum.WIDGET_CONTACT] as FormState;
    // this._dataDetails = {
    //     data: widgetContactForm.data,
    //     newDocumentType: this._documentTypeEnum,
    //     currentDocumentType: folder.idDocumentType,
    // };

    // const newData = this.changeSuffixOriginalColumnNameOfUpdatedData(
    //     this._documentTypeEnum,
    //     folder.idDocumentType,
    //     this._dataDetails.data,
    // );
    // this._dataDetails.data = newData;
    // }

    private expandCapturedForm(isExpanded: boolean) {
        if (!isExpanded) {
            this.gutterSize = 0;
            this.splitterConfig.subRightLeftHorizontal = 0;
            this.splitterConfig.subRightRightHorizontal = 100;

            return;
        }

        this.gutterSize = 5;
        this.splitterConfig.subRightRightHorizontal =
            this.splitterConfig.subRightLeftHorizontal <= 0 ? 65 : this.splitterConfig.subRightRightHorizontal;
        this.splitterConfig.subRightLeftHorizontal =
            this.splitterConfig.subRightLeftHorizontal <= 0 ? 35 : this.splitterConfig.subRightLeftHorizontal;

        this.captureCommonSectionWrapperStyle = {
            margin: 'auto',
        };
    }

    private _openDocumentForm() {
        if (this.folder && this.documentContainerOcr && this._widgetTemplateActionType) {
            const payload = <IOpenFormParamsAction>{
                folder: this.folder,
                documentContainerOcr: this.documentContainerOcr,
                config: {
                    method: OpenFormMethodEnum.LOAD_DETAIL,
                    getDetail: () => {
                        return this._dataDetails.data;
                    },
                },
            };
            this.store.dispatch(new this._widgetTemplateActionType(payload));
        }
    }
}
