import { Component, OnInit, AfterViewInit, ViewChild, TemplateRef } from '@angular/core';
import { ToasterService } from 'angular2-toaster';
import { ModuleList, BaseModuleComponent } from '../private/base';
import { Router, ActivatedRoute, NavigationEnd } from '@angular/router';
import { Store, ReducerManagerDispatcher } from '@ngrx/store';
import {
    TabButtonActions,
    ModuleSettingActions,
    XnCommonActions,
    PropertyPanelActions,
    AdditionalInformationActions,
    AdministrationDocumentActions,
    GlobalSearchActions,
    CustomAction,
    AdministrationDocumentActionNames,
    ModuleActions,
    LayoutSettingActions,
} from '@app/state-management/store/actions';
import {
    LoadingService,
    GlobalSettingService,
    AppErrorHandler,
    CommonService,
    PropertyPanelService,
    ModuleSettingService,
} from '@app/services';
import { Uti } from '@app/utilities';
import {
    GlobalSettingConstant,
    MenuModuleId,
    DocumentMyDMType,
    MessageModal,
    LocalStorageKey,
} from '@app/app.constants';
import { Module } from '@app/models';
import { AppState } from '@app/state-management/store';
import { IDocumentManagementState } from './document-management.statemanagement/document-management.state';
import { Observable, MonoTypeOperatorFunction } from 'rxjs';
import { DocumentContainerOcrStateModel } from '../../state-management/store/models/administration-document/state/document-container-ocr.state.model';
import { DocumentTreeModel } from '../../models/administration-document/document-tree.payload.model';
import { ColumnDefinition } from '../../models/common/column-definition.model';
import { SearchPageType } from '../../models/search-page/search-page-type.model';
import { EnableWidgetTemplateState } from '../../models/widget-template/enable-widget-template.model';
import * as widgetTemplateReducer from '@app/state-management/store/reducer/widget-template';
import { DocumentManagementSelectors } from './document-management.statemanagement/document-management.selectors';
import { AdministrationDocumentSelectors } from '../../state-management/store/reducer';
import { IOpenFormParamsAction } from '../../xoonit-share/processing-form/interfaces/open-form-params-action.interface';
import { OpenFormMethodEnum } from '../../xoonit-share/processing-form/consts/common.enum';
import {
    OpenMyDMFormAction,
    ShowMyDMFormUIAction,
    HideMyDMFormUIAction,
} from '../../shared/components/widget/components/widget-mydm-form/actions/widget-mydm-form.actions';
import { Actions, ofType } from '@ngrx/effects';
import { DocumentImageOcrService } from '../private/modules/image-control/services';
import { DocumentManagementHandlerService } from './services/document-management-handler.service';
import { takeUntil, filter, take } from 'rxjs/operators';
import {
    DocumentManagementActionNames,
    DblClickOnWidgetViewerAction,
    SaveDataGlobalSearchAction,
} from './document-management.statemanagement/document-management.actions';
import {
    AppGlobalActionNames,
    DeleteGlobalAction,
    ExpandDocumentFormGlobalAction,
} from '../../state-management/store/actions/app-global/app-global.actions';
import { coerceBooleanProperty } from '@angular/cdk/coercion';
import { PopupService } from '@app/xoonit-share/components/global-popup/services/popup.service';
import { HeaderConfirmationRef } from '@app/xoonit-share/components/global-popup/components/header-popup/header-confirmation-ref';

@Component({
    selector: 'document-management',
    templateUrl: './document-management.component.html',
    styleUrls: ['./document-management.component.scss'],
})
export class DocumentManagementComponent extends BaseModuleComponent implements OnInit, AfterViewInit {
    private _documentContainerOcr: DocumentContainerOcrStateModel;
    private _folder: DocumentTreeModel;
    private _idMainDocument: number;
    private _documentTypeEnum: DocumentMyDMType;
    private _idDocumentContainerScans: number;
    private _idDocumentTree: number;
    private _documentNameDictionary: Map<DocumentMyDMType, string> = new Map([
        [DocumentMyDMType.Invoice, 'Invoice'],
        [DocumentMyDMType.Contract, 'Contract'],
        [DocumentMyDMType.OtherDocuments, 'Other Documents'],
    ]);
    private _columnSettings: ColumnDefinition[];
    private _activeModuleState$: Observable<Module>;
    private _activeModule: Module;

    public isShowSearchPage = true;
    public searchPageContactParam: SearchPageType;
    private _enableWidgetTemplateState$: Observable<EnableWidgetTemplateState>;
    private _originalFileName: string;
    @ViewChild('confirmDeleteDocument') confirmDeleteDocument: TemplateRef<any>;

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

        private documentManagementSelectors: DocumentManagementSelectors,
        private administrationDocumentActions: AdministrationDocumentActions,
        private administrationDocumentSelectors: AdministrationDocumentSelectors,
        private documentManagementHandlerService: DocumentManagementHandlerService,
        private action$: Actions,
        private documentService: DocumentImageOcrService,
        private dispatcher: ReducerManagerDispatcher,
        private activatedRoute: ActivatedRoute,
        private toasterService: ToasterService,
        private moduleActions: ModuleActions,
        private documentStore: Store<IDocumentManagementState>,
        private popupService: PopupService,
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

        // document is all document
        this.searchPageContactParam = <SearchPageType>{
            idSettingsGUI: ModuleList.AllDocumentGlobalSearch.idSettingsGUI,
            placeHolderText: 'Search in Document',
        };

        this._activeModuleState$ = appStore.select((state) => state.mainModule.activeModule);
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

        if (this._idMainDocument && this._documentTypeEnum) {
            this._getDocumentDetail();
        }
    }

    ngOnDestroy(): void {
        this.isShowSearchPage = true;
        super.onDestroy();
        this.appStore.dispatch(this.administrationDocumentActions.clearSelectedFolderOfClassification());
    }

    private isValidPayloadDocument(action: CustomAction) {
        return (
            action.payload &&
            action.payload.selectedModule &&
            (action.payload.selectedModule.idSettingsGUI === MenuModuleId.invoice ||
                action.payload.selectedModule.idSettingsGUI === MenuModuleId.contract ||
                action.payload.selectedModule.idSettingsGUI === MenuModuleId.allDocuments ||
                action.payload.selectedModule.idSettingsGUI === MenuModuleId.otherdocuments ||
                action.payload.selectedModule.idSettingsGUI === MenuModuleId.toDoDocument)
        );
    }

    private _showPopupConfirmationBeforeChangeNewDocument() {
        this.popupService.open({
            content: this.confirmDeleteDocument,
            width: 350,
            hasBackdrop: true,
            header: new HeaderConfirmationRef({ iconClose: true }),
            disableCloseOutside: true,
        });
    }

    public deleteDocument(closePopup: (data?: any) => void) {
        const idDocumentContainerScans = this._documentContainerOcr.IdDocumentContainerScans;
        if (idDocumentContainerScans) {
            this.documentService.deleteImage(idDocumentContainerScans).subscribe(
                (response) => {
                    this.toasterService.pop(MessageModal.MessageType.success, 'System', `Delete document successfully`);
                    this.router.navigateByUrl('/Document');
                },
                (err) => {
                    this.toasterService.pop(MessageModal.MessageType.error, 'System', `Delete document fail`);
                },
            );
        }
        closePopup();
    }

    private _registerRouterEvent(
        disposeWhen: MonoTypeOperatorFunction<any>,
        callback: (idDocument: number, idDocumentType: number, idTreeRoot: number) => void,
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
                );
            }
        });
    }

    private _subscribe() {
        this.administrationDocumentSelectors
            .actionOfType$(AppGlobalActionNames.APP_DELETE_GLOBAL)
            .pipe(takeUntil(this.getUnsubscriberNotifier()))
            .subscribe((action: DeleteGlobalAction) => {
                this._showPopupConfirmationBeforeChangeNewDocument();
            });

        this.documentManagementSelectors
            .actionOfType$(DocumentManagementActionNames.DOUBLE_CLICK_ON_WIDGET_VIEWER)
            .pipe(takeUntil(this.getUnsubscriberNotifier()))
            .subscribe((action: DblClickOnWidgetViewerAction) => {
                if (!action || !action.payload.idMainDocument || !action.payload.idDocumentType) return;

                this.router.navigate(['/module/Capture', action.payload.idDocumentType, action.payload.idMainDocument]);
            });

        this._activeModuleState$.pipe(takeUntil(this.getUnsubscriberNotifier())).subscribe((activeModuleState) => {
            this._activeModule = activeModuleState;
        });

        this.administrationDocumentSelectors
            .actionOfType$(AppGlobalActionNames.APP_EXPAND_DOCUMENT_FORM_GLOBAL)
            .pipe(takeUntil(this.getUnsubscriberNotifier()))
            .subscribe((action: ExpandDocumentFormGlobalAction) => {
                const payload = action.payload;
                const params = {
                    acknowledge: payload.acknowledge,
                };
                if (payload.isExpanded) {
                    this.appStore.dispatch(new ShowMyDMFormUIAction(params));
                } else {
                    this.appStore.dispatch(new HideMyDMFormUIAction(params));
                }
            });

        this.administrationDocumentSelectors
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
                this.appStore.dispatch(this.administrationDocumentActions.saveDocumentFormFailAction());
            });

        this.administrationDocumentSelectors
            .actionSuccessOfSubtype$(
                AdministrationDocumentActionNames.SAVE_DOCUMENT_INVOICE_FORMS,
                AdministrationDocumentActionNames.SAVE_DOCUMENT_CONTRACT_FORMS,
                AdministrationDocumentActionNames.SAVE_OTHER_DOCUMENT_FORMS,
            )
            .pipe(takeUntil(this.getUnsubscriberNotifier()))
            .subscribe((action) => {
                this.toasterService.pop(MessageModal.MessageType.success, 'System', `Update document successfully`);
                this.appStore.dispatch(this.administrationDocumentActions.saveDocumentFormSuccessAction());
            });

        this.administrationDocumentSelectors
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
                this._columnSettings = payload;

                let colIdDocumentContainer: ColumnDefinition;
                let colIdDocumentTree: ColumnDefinition;
                let colKeywords: ColumnDefinition;
                let colToDoNotes: ColumnDefinition;
                let isToDos: ColumnDefinition;
                let colMediaName: ColumnDefinition;
                let colCompanyName: ColumnDefinition;

                this._columnSettings.forEach((data) => {
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

                        case 'ToDoNotes':
                            colToDoNotes = data;
                            return;

                        case 'IsToDo':
                            isToDos = data;
                            return;

                        case 'MediaName':
                            colMediaName = data;
                            return;
                        case 'Company':
                            colCompanyName = data;
                            return;
                    }
                });

                if (!colIdDocumentContainer || !colIdDocumentTree) return;
                this.appStore.dispatch(this.moduleActions.getCompany(colCompanyName.value));
                this.appStore.dispatch(this.administrationDocumentActions.setDocumentTodo(colToDoNotes.value));
                this.appStore.dispatch(this.administrationDocumentActions.setDocumentKeyword(colKeywords.value));
                this.appStore.dispatch(
                    this.administrationDocumentActions.setDocumentIsTodo(coerceBooleanProperty(isToDos.value)),
                );
                this.appStore.dispatch(this.administrationDocumentActions.setOriginalFileName(colMediaName.value));
                this._originalFileName = colMediaName.value;

                this.documentManagementHandlerService.onDocumentContainerOcrComponentCreated$
                    .pipe(
                        filter((isCreated) => isCreated === true),
                        take(1),
                    )
                    .subscribe((_) => {
                        if (
                            this._idDocumentContainerScans !== +colIdDocumentContainer.value ||
                            this._idDocumentTree !== +colIdDocumentTree.value
                        ) {
                            this._idDocumentContainerScans = +colIdDocumentContainer.value;
                            this._idDocumentTree = +colIdDocumentTree.value;
                            this._storageDataToDocumentContainerOCRState();
                        }
                    });
            });

        this.administrationDocumentSelectors.documentContainerOcr$
            .pipe(
                filter((documentContainerOcr) => !!documentContainerOcr),
                takeUntil(this.getUnsubscriberNotifier()),
            )
            .subscribe((documentContainerOcr) => {
                this._documentContainerOcr = documentContainerOcr;

                this.documentManagementHandlerService.onMydmFolderTreeComponentCreated$
                    .pipe(
                        filter((isCreated) => isCreated === true),
                        take(1),
                    )
                    .subscribe((_) => {
                        this.appStore.dispatch(
                            this.administrationDocumentActions.setHighlightAndSaveDocumentIntoFolder(
                                this._idDocumentTree,
                            ),
                        );
                    });
                this._openDocumentForm();
            });

        this.administrationDocumentSelectors.folder$
            .pipe(
                filter((folder: DocumentTreeModel) => !!folder),
                takeUntil(this.getUnsubscriberNotifier()),
            )
            .subscribe((folder: DocumentTreeModel) => {
                this._folder = folder;
                this._updateToChangeFolder(this._folder);
                this._openDocumentForm();
            });

        this._registerRouterEvent(
            takeUntil(this.getUnsubscriberNotifier()),
            (idDocument, idDocumentType, idTreeRoot) => {
                if (idDocument && idDocumentType && idTreeRoot) {
                    this.isShowSearchPage = false;
                } else {
                    this.isShowSearchPage = true;
                }
                window.localStorage.removeItem(
                    LocalStorageKey.buildKey(LocalStorageKey.LocalStorageGSStepKey, Uti.defineBrowserTabId()),
                );
                this.documentStore.dispatch(new SaveDataGlobalSearchAction({ idTreeRoot: idTreeRoot }));
                this._getDocumentDetail();
            },
        );

        this._enableWidgetTemplateState$
            .pipe(
                filter(
                    (enableWidgetTemplate: EnableWidgetTemplateState) =>
                        enableWidgetTemplate.status === false && enableWidgetTemplate.previousStatus === true,
                ),
                takeUntil(this.getUnsubscriberNotifier()),
            )
            .subscribe((enableWidgetTemplate: EnableWidgetTemplateState) => {
                // case when user open edit mode (Widget Customization) and close it
                // !when if user has removed widget WidgetMyDMForm and added again

                // then dispatch open MyDM Form open again
                this._openDocumentForm();

                // then dispatch get DocumentImageOcr again
                this._storageDataToDocumentContainerOCRState();
                this.appStore.dispatch(this.administrationDocumentActions.setOriginalFileName(this._originalFileName));
            });

        this.dispatcher
            .pipe(
                filter((action: CustomAction) => action.type === LayoutSettingActions.REFRESH_STATE_UPDATE_EDIT_MODE),
                takeUntil(this.getUnsubscriberNotifier()),
            )
            .subscribe((action) => {
                this._openDocumentForm();

                this.documentManagementHandlerService.onDocumentContainerOcrComponentCreated$
                    .pipe(
                        filter((isCreated) => isCreated === true),
                        takeUntil(this.getUnsubscriberNotifier()),
                    )
                    .subscribe((_) => {
                        this._storageDataToDocumentContainerOCRState();
                        this.appStore.dispatch(
                            this.administrationDocumentActions.setOriginalFileName(this._originalFileName),
                        );
                    });
            });

        this.action$
            .pipe(
                ofType(GlobalSearchActions.ROW_DOUBLE_CLICK, GlobalSearchActions.ROW_CLICK),
                filter((action: CustomAction) => this.isValidPayloadDocument(action)),
                takeUntil(super.getUnsubscriberNotifier()),
            )
            .subscribe((action: CustomAction) => {
                this.isShowSearchPage = false;
            });
    }

    private _getDocumentDetail() {
        const idDocumentType = +this.activatedRoute.snapshot.queryParams['idDocumentType'];
        const idMainDocument = +this.activatedRoute.snapshot.queryParams['idDocument'];

        if (idMainDocument === this._idMainDocument) return;

        this._idMainDocument = idMainDocument;
        this._documentTypeEnum = idDocumentType;

        this._getDocumentDetailByType(this._documentTypeEnum, this._idMainDocument);

        const documentName = this._documentNameDictionary.get(this._documentTypeEnum) || ModuleList.Document.moduleName;
        this._clearCapturedData();
        this._openDocumentForm();

        // add this if condition, because in widget-file-explorer that re-use this component (captured-document-detail) on popup
        if (this._activeModule && this._activeModule.idSettingsGUI === ModuleList.Document.idSettingsGUI) {
            // dispatch event to change header name for respective document type
            this.appStore.dispatch(
                this.moduleActions.requestToChangeActiveModuleName({
                    activeModule: ModuleList.Document,
                    moduleName: documentName,
                }),
            );
        }
    }

    private _getDocumentDetailByType(idDocumentType: DocumentMyDMType, idMainDocument: number) {
        switch (idDocumentType) {
            case DocumentMyDMType.Invoice:
                this.appStore.dispatch(
                    this.administrationDocumentActions.getCapturedInvoiceDocumentDetail(idMainDocument),
                );
                break;

            case DocumentMyDMType.Contract:
                this.appStore.dispatch(
                    this.administrationDocumentActions.getCapturedContractDocumentDetail(idMainDocument),
                );
                break;

            case DocumentMyDMType.OtherDocuments:
                this.appStore.dispatch(
                    this.administrationDocumentActions.getCapturedOtherDocumentDetail(idMainDocument),
                );
                break;

            default:
                return;
        }
    }

    private _updateToChangeFolder(folder: DocumentTreeModel) {}

    private _clearCapturedData() {
        this.appStore.dispatch(this.administrationDocumentActions.clearDocumentContainerOcr());
        this.appStore.dispatch(this.administrationDocumentActions.clearFormState());
        this.appStore.dispatch(this.administrationDocumentActions.clearSelectedFolderOfClassification());
        this._folder = null;
        this._documentContainerOcr = null;
    }

    private _openDocumentForm() {
        if (this._folder && this._documentContainerOcr) {
            const payload = <IOpenFormParamsAction>{
                folder: this._folder,
                documentContainerOcr: this._documentContainerOcr,
                config: {
                    method: OpenFormMethodEnum.LOAD_DETAIL,
                    getDetail: () => {
                        return this._columnSettings;
                    },
                },
            };
            this.appStore.dispatch(new OpenMyDMFormAction(payload));
        }
    }

    private _storageDataToDocumentContainerOCRState() {
        this.documentService
            .getDocumentById(this._idDocumentContainerScans?.toString())
            .pipe(takeUntil(this.getUnsubscriberNotifier()))
            .subscribe((response) => {
                this.appStore.dispatch(
                    this.administrationDocumentActions.dispatchDocumentContainerScan({
                        IdDocumentContainerScans: this._idDocumentContainerScans,
                        isProcessingPage: false,
                        idMainDocument: this._idMainDocument,
                        indexName: Uti.parseIndexName(this._documentTypeEnum),
                        images: response,
                    }),
                );
                if (response[0]) {
                    this.appStore.dispatch(
                        this.administrationDocumentActions.dispatchDocumentContainerOCR(response[0]),
                    );
                    this._getExtractedDataFromOcr(response[0]);
                }
            });
    }

    private _getExtractedDataFromOcr(documentContainerScan: DocumentContainerOcrStateModel) {
        this.appStore.dispatch(
            this.administrationDocumentActions.getExtractedDataFromOcr({
                idDocumentContainerOcr: documentContainerScan.IdDocumentContainerOcr,
                idRepDocumentType: documentContainerScan.IdRepDocumentType,
            }),
        );
    }
}
