import { Component, OnInit, AfterViewInit, ViewChild, TemplateRef, Type, ChangeDetectorRef } from '@angular/core';
import { ToasterService } from 'angular2-toaster';
import { ModuleList, BaseModuleComponent } from '../private/base';
import { Router, ActivatedRoute } from '@angular/router';
import { Store, ReducerManagerDispatcher } from '@ngrx/store';
import {
    TabButtonActions,
    ModuleSettingActions,
    XnCommonActions,
    PropertyPanelActions,
    AdditionalInformationActions,
    AdministrationDocumentActions,
    CustomAction,
    AdministrationDocumentActionNames,
    LayoutSettingActions,
    NotificationPopupActions,
    TabSummaryActions,
    DocumentThumbnailActions
} from '@app/state-management/store/actions';
import { LoadingService, GlobalSettingService, AppErrorHandler, CommonService, PropertyPanelService, ModuleSettingService } from '@app/services';
import { GlobalSettingConstant, MessageModal, Configuration } from '@app/app.constants';
import { Module, SearchResultItemModel } from '@app/models';
import { AppState } from '@app/state-management/store';
import { Observable} from 'rxjs';
import { DocumentContainerOcrStateModel } from '../../state-management/store/models/administration-document/state/document-container-ocr.state.model';
import { DocumentTreeModel } from '../../models/administration-document/document-tree.payload.model';
import { EnableWidgetTemplateState } from '../../models/widget-template/enable-widget-template.model';
import * as widgetTemplateReducer from '@app/state-management/store/reducer/widget-template';
import { AdministrationDocumentSelectors } from '../../state-management/store/reducer';
import { IOpenFormParamsAction } from '../../xoonit-share/processing-form/interfaces/open-form-params-action.interface';
import { OpenFormMethodEnum } from '../../xoonit-share/processing-form/consts/common.enum';
import { OpenMyDMFormAction, ShowMyDMFormUIAction, HideMyDMFormUIAction, CloseMyDMFormAction, ClearMyDMFormAction } from '../../shared/components/widget/components/widget-mydm-form/actions/widget-mydm-form.actions';
import { DocumentImageOcrService } from '../private/modules/image-control/services';
import { takeUntil, filter, take } from 'rxjs/operators';
import { AppGlobalActionNames, ExpandDocumentFormGlobalAction, DeleteGlobalAction } from '../../state-management/store/actions/app-global/app-global.actions';
import { CapturedFormModeEnum } from '../../models/administration-document/document-form/captured-form-mode.enum';
import { PopupService } from '@app/xoonit-share/components/global-popup/services/popup.service';
import { DmsDashboardHandlerService } from '../private/modules/mydm/services/dms-dashboard-handler.service';
import { HeaderConfirmationRef } from '../../xoonit-share/components/global-popup/components/header-popup/header-confirmation-ref';
import { Location } from '@angular/common';
import * as processDataReducer from '@app/state-management/store/reducer/process-data';

@Component({
    selector: 'document-processing',
    templateUrl: './document-processing.component.html',
    styleUrls: ['./document-processing.component.scss']
})
export class DocumentProcessingComponent extends BaseModuleComponent implements OnInit, AfterViewInit {
    public CapturedFormModeEnum = CapturedFormModeEnum;
    public capturedFormMode: CapturedFormModeEnum;
    public idDocumentContainerScanConfirm: any;
    private _didManipulateCaptureFile: boolean;
    // this field is a flag to describe that user do not select a folder (it means when import document, user do not select a folder to import)
    private _didSelectFolderImport = false;
    private _needToGetDocumentContainerScans: number;
    private _isExpandedDocumentForm = false;
    private _widgetTemplateActionType: Type<any>;
    private _isImageOCRCreated = false;
    private _idDocumentContainerScanExecuting: any;
    public documentContainerOcr: DocumentContainerOcrStateModel;
    public folder: DocumentTreeModel;

    @ViewChild('confirmBeforeChangeNewDocument') confirmBeforeChangeNewDocument: TemplateRef<any>;

    private _activeModule: Module;
    private _activeModuleState$: Observable<Module>;
    private _enableWidgetTemplateState$: Observable<EnableWidgetTemplateState>;
    private _selectedSearchResultState$: Observable<SearchResultItemModel>;

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

        private route: ActivatedRoute,
        private toasterService: ToasterService,
        protected ref: ChangeDetectorRef,
        private dispatcher: ReducerManagerDispatcher,
        private administrationActions: AdministrationDocumentActions,
        private administrationSelectors: AdministrationDocumentSelectors,
        private administrationDocumentActions: AdministrationDocumentActions,
        private dmsDashboardHandler: DmsDashboardHandlerService,
        private notificationPopupAction: NotificationPopupActions,
        private documentService: DocumentImageOcrService,
        private popupService: PopupService,
        private locationService: Location,
        private tabSummaryActions: TabSummaryActions,
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

        this._activeModuleState$ = appStore.select((state) => state.mainModule.activeModule);
        this._enableWidgetTemplateState$ = appStore.select((state) => widgetTemplateReducer.getWidgetTemplateState(state, this.ofModule.moduleNameTrim).enableWidgetTemplate);
        this._selectedSearchResultState$ = appStore.select((state) => processDataReducer.getProcessDataState(state, this.ofModule.moduleNameTrim).selectedSearchResult);

        this._subscribe();
    }

    ngOnInit(): void {
        super.onInit();
    }

    ngAfterViewInit(): void {
        this.getModuleToPersonType();
        this.getDocumentContainerOcrWhenRoutingWithParam();
    }

    ngOnDestroy(): void {
        super.onDestroy();
        this.clearDataCaptured();
        this.clearSelectedFolder();
    }

    private _subscribe() {
        this.dmsDashboardHandler.onFolderTreeCreated$
            .pipe(
                filter((isCreated) => isCreated),
                take(1),
            )
            .subscribe((_) => {
                this.appStore.dispatch(this.administrationDocumentActions.changeModeSelectableFolder());
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

                this.appStore.dispatch(new ClearMyDMFormAction());
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

                this.appStore.dispatch(
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
                this.appStore.dispatch(this.administrationDocumentActions.saveDocumentFormFailAction());
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
                    this.appStore.dispatch(this.administrationDocumentActions.nextDocumentToClassify(true));
                }
                this.toasterService.pop(MessageModal.MessageType.success, 'System', `Save document successfully`);
                this.appStore.dispatch(this.administrationDocumentActions.saveDocumentFormSuccessAction());
                this.appStore.dispatch(new CloseMyDMFormAction());
            });

        this.administrationSelectors
            .actionSuccessOfSubtype$(AdministrationDocumentActionNames.CHANGE_DOCUMENT_TO_OTHER_TREE)
            .pipe(takeUntil(this.getUnsubscriberNotifier()))
            .subscribe((_) => {
                this.clearSelectedFolder();
                this.appStore.dispatch(this.administrationDocumentActions.nextDocumentToClassify(true));
                this.toasterService.pop(MessageModal.MessageType.success, 'System', `Change document successfully`);
                this.appStore.dispatch(new CloseMyDMFormAction());
                this.appStore.dispatch(this.administrationDocumentActions.saveDocumentFormSuccessAction());
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
                this.appStore.dispatch(this.administrationActions.enableButtonSaveWidgetDmsAction({ isEnabled: false }));
                this.appStore.dispatch(this.administrationActions.enableButtonToggledCapturedForm({ isEnabled: false }));
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

    private expandCapturedForm(isExpanded: boolean, acknowledge?: (ack: boolean) => void) {
        this._isExpandedDocumentForm = isExpanded;
        const payload = {
            acknowledge: acknowledge,
        };

        if (!isExpanded) {
            //this.gutterSize = 0;
            //this.splitterConfig.subRightLeftHorizontal = 0;
            //this.splitterConfig.subRightRightHorizontal = 100;

            // this.captureCommonSectionWrapperStyle = {
            //     margin: 'auto 5px',
            // };

            this.appStore.dispatch(new HideMyDMFormUIAction(payload));
            return;
        }

        //this.gutterSize = 5;
        // this.splitterConfig.subRightRightHorizontal =
        //     this._splitterConfigSetting.subRightLeftHorizontal <= 0 ? 65 : this._splitterConfigSetting.subRightRightHorizontal;
        // this.splitterConfig.subRightLeftHorizontal =
        //     this._splitterConfigSetting.subRightLeftHorizontal <= 0 ? 35 : this._splitterConfigSetting.subRightLeftHorizontal;

        // this.captureCommonSectionWrapperStyle = {
        //     margin: 'auto',
        // };

        this.appStore.dispatch(new ShowMyDMFormUIAction(payload));
    }

    private getDocumentContainerOcrWhenRoutingWithParam() {
        const idDocumentContainerScans = +this.route.snapshot.queryParams['idDocumentContainerScans'];

        if (!idDocumentContainerScans || this._needToGetDocumentContainerScans === idDocumentContainerScans) return;

        this._needToGetDocumentContainerScans = idDocumentContainerScans;
        //this.locationService.replaceState(`${Configuration.rootPrivateUrl}/${ModuleList.Processing.moduleNameTrim}`);
        // this.locationService.replaceState(`/${ModuleList.Processing.moduleNameTrim}`);
        this.appStore.dispatch(
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
        this.appStore.dispatch(
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
        this.appStore.dispatch(this.administrationActions.setDocumentTodo(''));
        this.appStore.dispatch(this.administrationActions.setDocumentKeyword(''));
    }

    private clearExtractedDataOcr() {
        this.appStore.dispatch(this.administrationActions.clearExtractedDataOcr());
    }

    private clearFormsStateAndRemoveTabs() {
        this.appStore.dispatch(this.administrationActions.clearFormState());
        this.appStore.dispatch(this.tabSummaryActions.removeAllTabs(ModuleList.Processing));
    }

    private setEmptyFormState() {
        this.appStore.dispatch(this.administrationActions.setEmptyFormState());
    }

    private didManipulateCapturedFile(isEnabled: boolean) {
        this.appStore.dispatch(this.administrationActions.didManipulateCapturedFile(isEnabled));
    }

    private alreadyChooseFolderWhenUploadCase(documentContainerOcr: DocumentContainerOcrStateModel) {
        console.log('%c captured-page.component: alreadyChooseFolderWhenUploadCase', 'color: orange');
        this.documentContainerOcr = documentContainerOcr;
        this.appStore.dispatch(
            this.administrationActions.setHighlightAndSaveDocumentIntoFolder(+documentContainerOcr.IdDocumentTree),
        );
        this.appStore.dispatch(this.notificationPopupAction.closeTreeNotification());
        // this.clearFormsStateAndRemoveTabs();
        // this.store.dispatch(
        //     this.administrationActions.getExtractedDataFromOcr({
        //         idDocumentContainerOcr: this.documentContainerOcr.IdDocumentContainerOcr,
        //         idRepDocumentType: this.documentContainerOcr.IdRepDocumentType,
        //     }),
        // );
    }

    private clearDataCaptured() {
        this.appStore.dispatch(this.administrationActions.clearDocumentContainerOcr());
        this.clearFormsStateAndRemoveTabs();
    }

    private clearSelectedFolder() {
        this.didManipulateCapturedFile(false);
        this.appStore.dispatch(this.administrationActions.clearSelectedFolderOfClassification());
        this.appStore.dispatch(this.administrationActions.enableButtonSaveWidgetDmsAction({ isEnabled: false }));
        this.appStore.dispatch(this.administrationActions.enableButtonToggledCapturedForm({ isEnabled: false }));
    }

    private didNotSelectFolderCase(documentContainerOcr: DocumentContainerOcrStateModel) {
        this.documentContainerOcr = documentContainerOcr;
        // this.expandCapturedForm(false);
        this.appStore.dispatch(this.administrationDocumentActions.changeModeSelectableFolder());
        this.appStore.dispatch(
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
            this.appStore.dispatch(new OpenMyDMFormAction(payload));
        }
    }

    private _deleteDocumentCapture() {
        if (!this.documentContainerOcr) return;

        this.appStore.dispatch(
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
                this.appStore.dispatch(
                    this.administrationDocumentActions.dispatchDocumentContainerScan({
                        IdDocumentContainerScans: IdDocumentContainerScans,
                        isProcessingPage: true,
                        images: response,
                    }),
                );
                if (response[0]) {
                    this._idDocumentContainerScanExecuting = IdDocumentContainerScans;
                    this.appStore.dispatch(this.administrationDocumentActions.dispatchDocumentContainerOCR(response[0]));
                }
            });
    }

    public saveDocument(closePopup: (data?: any) => void, isSave?: boolean) {
        closePopup();

        if (isSave) {
            try {
                document.getElementById('DokumentErfassen-save-button').click();
            } catch (error) { }
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
