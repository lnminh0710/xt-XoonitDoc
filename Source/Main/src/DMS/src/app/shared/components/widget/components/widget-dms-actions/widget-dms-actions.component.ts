import { Component, OnInit, OnDestroy, ChangeDetectorRef, ViewChild, AfterViewInit, ElementRef } from '@angular/core';
import { BaseComponent, ModuleList } from '@app/pages/private/base';
import { ActivatedRoute, Router } from '@angular/router';
import { DocumentContainerOcrStateModel } from '@app/state-management/store/models/administration-document/state/document-container-ocr.state.model';
import { AdministrationDocumentSelectors } from '@app/state-management/store/reducer';
import {
    AdministrationDocumentActions,
    AdministrationDocumentActionNames,
    CustomAction,
} from '@app/state-management/store/actions';
import { ToasterService } from 'angular2-toaster';
import { AppState } from '@app/state-management/store';
import { ReducerManagerDispatcher, Store } from '@ngrx/store';
import { GlobalSettingConstant, UserRoles } from '@app/app.constants';
import { DocumentTreeModel } from '@app/models/administration-document/document-tree.payload.model';
import { filter, takeUntil, take } from 'rxjs/operators';
import { IconNames } from '@app/app-icon-registry.service';
import { MatButton } from '@xn-control/light-material-ui/button';
import {
    SaveGlobalAction,
    ExpandDocumentFormGlobalAction,
    DeleteGlobalAction,
} from '@app/state-management/store/actions/app-global/app-global.actions';
import { GlobalSettingService, AppErrorHandler, UserService } from '@app/services';
import { GlobalSettingModel, SearchResultItemModel } from '@app/models';
import * as processDataReducer from '@app/state-management/store/reducer/process-data';
import { Observable } from 'rxjs/Rx';

@Component({
    selector: 'widget-dms-actions',
    styleUrls: ['./widget-dms-actions.component.scss'],
    templateUrl: './widget-dms-actions.component.html',
})
export class WidgetDmsActionsComponent extends BaseComponent implements OnInit, AfterViewInit, OnDestroy {
    private _documentContainerOcr: DocumentContainerOcrStateModel;
    private _idsStoreForUpdate: {
        IdMainDocument: string;
        IdDocumentTree: string;
        IdDocumentTreeMedia: string;
        OldFolder?: DocumentTreeModel;
        NewFolder?: DocumentTreeModel;
    };
    public isExpanded = true;

    public isUpdateMode: boolean;
    public isSaving: boolean;
    public folder: DocumentTreeModel;

    public svgSave = IconNames.WIDGET_DMS_ACTIONS_Save;
    public svgDelete = IconNames.WIDGET_DMS_ACTIONS_Delete;
    public svgToggleCapturedForm = IconNames.WIDGET_DMS_ACTIONS_Toggle_Captured_Form;

    public isDisplayWidget = true;
    public isDisplayToggle = true;
    public isApprovalModule = false;
    public isDocumentModule = false;
    public idDocumentTree: number;
    public idDocumentType: number;
    public idDocumentContainerScans: number;

    @ViewChild('btnNext') btnNextRef: MatButton;
    @ViewChild('btnSave') btnSaveRef: MatButton;
    @ViewChild('btnDelete') btnDeleteRef: MatButton;
    @ViewChild('btnExpandDocumentForm') btnExpandDocumentForm: MatButton;

    private _selectedSearchResultState$: Observable<SearchResultItemModel>;
    public isSuperAdminRole: boolean;
    constructor(
        protected router: Router,
        private route: ActivatedRoute,
        private cdRef: ChangeDetectorRef,
        private store: Store<AppState>,
        private administrationDocumentSelectors: AdministrationDocumentSelectors,
        private administrationDocumentActions: AdministrationDocumentActions,
        private toastService: ToasterService,
        private globalSettingService: GlobalSettingService,
        private globalSettingConstant: GlobalSettingConstant,
        private appErrorHandler: AppErrorHandler,
        private appStore: Store<AppState>,
        private dispatcher: ReducerManagerDispatcher,
        private userService: UserService,
    ) {
        super(router);
        this._selectedSearchResultState$ = this.appStore.select(
            (state) => processDataReducer.getProcessDataState(state, this.ofModule.moduleNameTrim).selectedSearchResult,
        );
        this.registerSubscriptions();
    }

    ngOnInit(): void {
        this.checkParamUrl();
        const currentUser = this.userService.getCurrentUser();
        this.isSuperAdminRole = currentUser.isSuperAdmin || currentUser.isAdmin;
    }

    ngAfterViewInit(): void {}

    ngOnDestroy(): void {
        super.onDestroy();
    }

    public checkParamUrl() {
        this.route.queryParams.pipe(takeUntil(this.getUnsubscriberNotifier())).subscribe((params) => {
            this.isApprovalModule = this.ofModule.idSettingsGUI === ModuleList.Approval.idSettingsGUI;
            this.isDocumentModule = this.ofModule.idSettingsGUI === ModuleList.Document.idSettingsGUI;
            if (this.isApprovalModule || this.ofModule.idSettingsGUI === ModuleList.ApprovalProcessing.idSettingsGUI) {
                this.isDisplayWidget = true;
            }
            this.isDisplayToggle =
                this.ofModule.idSettingsGUI !== ModuleList.Approval.idSettingsGUI &&
                this.ofModule.idSettingsGUI !== ModuleList.ApprovalProcessing.idSettingsGUI;
        });
    }

    private registerSubscriptions() {
        this.administrationDocumentSelectors.folder$
            .pipe(takeUntil(this.getUnsubscriberNotifier()))
            .subscribe((folderState) => {
                this.idDocumentTree = folderState?.idDocument;
                this.idDocumentType = folderState?.idDocumentType;
                this.isDisplayWidget = !!folderState;
                this._disableBtnExpandDocumentForm(!folderState);
                // Hide mydm-form if select Invoice approval
                if (this.isDisplayWidget && folderState?.idDocumentType === 4) {
                    const payload = {
                        isExpanded: false,
                        acknowledge: (ack: boolean) => {},
                    };
                    this.store.dispatch(new ExpandDocumentFormGlobalAction(payload));
                } else {
                    this.getsaveDmsActionToggleSettings();
                }
            });

        this.administrationDocumentSelectors
            .actionOfType$(AdministrationDocumentActionNames.ENABLE_BUTTON_TOGGLED_CAPTURED_FORM)
            .pipe(takeUntil(this.getUnsubscriberNotifier()))
            .subscribe((action: CustomAction) => {
                const payload = action.payload as { isEnabled: boolean };
                this._disableBtnExpandDocumentForm(!payload?.isEnabled);

                // just update for synchronous data
                // this.isExpanded = payload.isEnabled;
            });

        this.administrationDocumentSelectors
            .actionOfType$(AdministrationDocumentActionNames.WIDGET_MYDM_FORM_INIT_SUCCESS)
            .pipe(takeUntil(this.getUnsubscriberNotifier()))
            .subscribe((action: any) => {
                if (!action && !action.isSuccess) return;

                this.getsaveDmsActionToggleSettings();
            });

        this._selectedSearchResultState$
            .pipe(
                filter((selectedSearchResultState) => !!selectedSearchResultState),
                takeUntil(this.getUnsubscriberNotifier()),
            )
            .subscribe((selectedSearchResultState: SearchResultItemModel) => {
                const data = selectedSearchResultState as any;
                this.idDocumentContainerScans = data?.idDocumentContainerScans;

                if (
                    (data.idMainDocument && this.ofModule.idSettingsGUI === ModuleList.Approval.idSettingsGUI) ||
                    (data.idDocumentContainerScans &&
                        this.ofModule.idSettingsGUI === ModuleList.ApprovalProcessing.idSettingsGUI)
                ) {
                    this.isDisplayWidget = true;
                }
            });

        this.dispatcher
            .pipe(
                filter(
                    (action: CustomAction) => action.type === AdministrationDocumentActionNames.GET_DOCUMENT_BY_ID_SCAN,
                ),
                takeUntil(this.getUnsubscriberNotifier()),
            )
            .subscribe((action) => {
                const data = action?.payload;
                this.idDocumentContainerScans = data?.idDocumentContainerScans;

                if (
                    !data ||
                    !data.idDocumentContainerScans ||
                    this.ofModule.idSettingsGUI !== ModuleList.ApprovalProcessing.idSettingsGUI
                )
                    return;

                this.isDisplayWidget = true;
            });

        this.administrationDocumentSelectors
            .actionOfType$(
                AdministrationDocumentActionNames.SAVE_DOCUMENT_FORM_SUCCESS,
                AdministrationDocumentActionNames.SAVE_DOCUMENT_FORM_FAIL,
            )
            .pipe(takeUntil(this.getUnsubscriberNotifier()))
            .subscribe((action: any) => {
                this.isSaving = false;
            });
    }

    public saveGlobal($event) {
        if (this.isSaving) return;

        this.isSaving = true;
        // it's specific for INVOICE APPROVAL with DOCTYPE = 4
        if (this.idDocumentTree && this.idDocumentContainerScans && this.idDocumentType === 4) {
            this.store.dispatch(
                this.administrationDocumentActions.changeDocumentToOtherTreeAction({
                    IdDocumentTree: this.idDocumentTree,
                    IdDocumentContainerScans: this.idDocumentContainerScans,
                }),
            );
            return;
        }
        this.store.dispatch(new SaveGlobalAction());
    }

    public deleteGlobal($event) {
        this.store.dispatch(new DeleteGlobalAction());
    }

    public expandDocumentFormGlobal($event) {
        if (this.btnExpandDocumentForm.disabled) return;

        this.isExpanded = !this.isExpanded;

        this.saveDmsActionToggleSetting(this.isExpanded);
        const payload = {
            isExpanded: this.isExpanded,
            acknowledge: (ack: boolean) => {},
        };
        this.store.dispatch(new ExpandDocumentFormGlobalAction(payload));
    }

    public _disableBtnExpandDocumentForm(isDisabled: boolean) {
        if (!this.btnExpandDocumentForm) return;
        this.btnExpandDocumentForm.disabled = isDisabled;
    }

    public saveDmsActionToggleSetting(value: boolean): void {
        this.globalSettingService
            .getAllGlobalSettings()
            .pipe(take(1))
            .subscribe((data: any) => {
                this.appErrorHandler.executeAction(() => {
                    let found = data.find((x) => x.globalName === this.globalSettingConstant.dmsActionToggle);
                    if (!found) {
                        found = new GlobalSettingModel({
                            globalName: this.globalSettingConstant.dmsActionToggle,
                            description: 'DMS Action Toggle Show/Hide MyDm Form',
                            globalType: this.globalSettingConstant.dmsActionToggle,
                        });
                    }
                    found.idSettingsGUI = -1;
                    found.jsonSettings = value;
                    found.isActive = true;

                    this.globalSettingService
                        .saveGlobalSetting(found)
                        .subscribe((response) => this.globalSettingService.saveUpdateCache(-1, found, response));
                });
            });
    }

    public getsaveDmsActionToggleSettings() {
        if (this.isDisplayWidget) {
            this.globalSettingService.getAllGlobalSettings().subscribe((data: any) => {
                this.appErrorHandler.executeAction(() => {
                    if (data && data.length) {
                        const found = data.find((x) => x.globalName === this.globalSettingConstant.dmsActionToggle);
                        this.isExpanded = found ? JSON.parse(found.jsonSettings) : true;
                        const payload = {
                            isExpanded: this.isExpanded,
                            acknowledge: (ack: boolean) => {},
                        };
                        this.store.dispatch(new ExpandDocumentFormGlobalAction(payload));
                    }
                });
            });
        } else {
            const payload = {
                isExpanded: this.isDisplayWidget,
                acknowledge: (ack: boolean) => {},
            };
            this.store.dispatch(new ExpandDocumentFormGlobalAction(payload));
        }
    }
}
