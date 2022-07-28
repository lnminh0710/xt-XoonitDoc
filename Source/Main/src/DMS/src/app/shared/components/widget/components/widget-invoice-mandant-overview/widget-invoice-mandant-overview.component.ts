import {
    AfterViewInit,
    Component,
    ElementRef,
    Input,
    OnDestroy,
    OnInit,
    TemplateRef,
    ViewChild,
    ViewContainerRef,
    Injector,
} from '@angular/core';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { ApiResultResponse, ControlGridModel } from '@app/models';
import { ModuleList } from '@app/pages/private/base';
import { DatatableService, DocumentService, InvoiceAprrovalService } from '@app/services';
import { AppState } from '@app/state-management/store';
import { CustomAction, DocumentThumbnailActions, LayoutInfoActions } from '@app/state-management/store/actions';
import { HeaderNoticeRef } from '@app/xoonit-share/components/global-popup/components/header-popup/header-notice-ref';
import { PopupService } from '@app/xoonit-share/components/global-popup/services/popup.service';
import { WidgetDynamicFormComponent } from '@app/xoonit-share/components/widget-dynamic-form/widget-dynamic-form.component';
import { ReducerManagerDispatcher, Store } from '@ngrx/store';
import { MonoTypeOperatorFunction, Subject } from 'rxjs';
import { auditTime, filter, takeUntil } from 'rxjs/operators';
import { get, find } from 'lodash-es';

import { ToasterService } from 'angular2-toaster';
import { MessageModal, TypeDataSet } from '@app/app.constants';
import {
    FormStatus,
    IWidgetIsAbleToSave,
} from '@app/state-management/store/models/app-global/widget-is-able-to-save.payload.model';
import { AppInjectWigetInstanceIsAbleToSaveAction } from '@app/state-management/store/actions/app-global/app-global.actions';
import { defaultLanguage } from '@app/app.resource';
import { BaseWidgetDynamicFormCommonAction } from '../base-widget-common-action';
import { XnSearchTableComponent } from '@app/xoonit-share/components/xn-search-table/xn-search-table.component';
import { InvoiceApprovalProcessingSelectors } from '@app/pages/invoice-approval-processing/invoice-approval-processing.statemanagement/invoice-approval-processing.selectors';
import { MasterExtractedData } from '@app/models/approval/master-extracted.model';

const headerToolbar = 50;

@Component({
    selector: 'widget-invoice-mandant-overview',
    templateUrl: './widget-invoice-mandant-overview.component.html',
    styleUrls: ['./widget-invoice-mandant-overview.component.scss'],
})
export class WidgetInvoiceMandanOverviewComponent
    extends BaseWidgetDynamicFormCommonAction
    implements OnInit, AfterViewInit, OnDestroy, IWidgetIsAbleToSave {
    width: number = 0;
    height: number = 0;
    dataSource: ControlGridModel;
    isShowAddNew: boolean;
    hightlightKeywords: string = '';
    isApprovalModule: boolean = false;
    private selectedItem: { key: string; value: any }[] = [];
    private needDisableForm: Subject<boolean> = new Subject<boolean>();
    title: string = 'Search Mandant';

    // Form
    public formMethodName = '';
    public formObjectName = '';
    public idMainDocument;
    public isEmpty = false;

    // add new
    public addNewMethodName = 'SpAppWg001InvoiceApproval';
    public addNewObjectName = 'GetMandantDynForm';
    public dynamicFormGroupDef: any;

    @Input() globalProperties: any;

    @ViewChild('addNewPopup') addNewPopup: TemplateRef<any>;
    @ViewChild('mandantOverviewForm') mandantOverviewForm: WidgetDynamicFormComponent;
    @ViewChild('addMandantForm') addMandantForm: WidgetDynamicFormComponent;
    @ViewChild('searchTemp') searchControl: XnSearchTableComponent;

    // private subscribe
    public IdPerson: any;
    public IdPersonUpdate: any;

    constructor(
        protected router: Router,
        private element: ElementRef,
        private dispatcher: ReducerManagerDispatcher,
        private invoiceApprovalService: InvoiceAprrovalService,
        private datatableService: DatatableService,
        private popupService: PopupService,
        private documentService: DocumentService,
        private activatedRoute: ActivatedRoute,
        private appStore: Store<AppState>,
        private toasterService: ToasterService,
        protected containerRef: ViewContainerRef,
        protected injector: Injector,
        protected invoiceApprovalProcessingSelectors: InvoiceApprovalProcessingSelectors,
    ) {
        super(injector, containerRef, router);

        this._subscribe();
    }

    private _subscribe() {
        this._registerRouterEvent(takeUntil(this.getUnsubscriberNotifier()), () => {
            const idMainDocument = this.activatedRoute.snapshot.queryParams['idDocument'];
            this.idMainDocument = idMainDocument;
            this.formMethodName = 'SpAppWg001InvoiceApproval';
            this.formObjectName = 'MandantOverview';
            if (!idMainDocument) {
                this.reset();
            }
        });

        this.dispatcher
            .pipe(
                filter((action: CustomAction) => {
                    return action.type === DocumentThumbnailActions.DOCUMENT_THUMBNAIL_NO_ITEM;
                }),
                takeUntil(this.getUnsubscriberNotifier()),
            )
            .subscribe((action: CustomAction) => {
                this.isEmpty = true;
                this.needDisableForm.next(this.isEmpty);
            });

        this.needDisableForm
            .pipe(
                filter((isDisabled: boolean) => isDisabled),
                takeUntil(this.getUnsubscriberNotifier()),
            )
            .subscribe(() => {
                this.mandantOverviewForm.disableForm();
            });

        this.invoiceApprovalProcessingSelectors.mandantOverviewExtractedMasterData$
            .pipe(
                filter(
                    (mandantOverviewExtractedMasterData) =>
                        !!mandantOverviewExtractedMasterData && !this.idMainDocument,
                ),
                takeUntil(this.getUnsubscriberNotifier()),
            )
            .subscribe((data: MasterExtractedData) => {
                this.setMandantFormFromExtractedData(data);
            });
    }

    ngOnInit() {
        this.parseConfigToWidthHeight();
        this.appStore.dispatch(new AppInjectWigetInstanceIsAbleToSaveAction(this));
        this.isApprovalModule = this.ofModule.idSettingsGUI === ModuleList.Approval.idSettingsGUI;
    }

    ngOnDestroy() {
        super.onDestroy();
    }

    ngAfterViewInit() {
        super.ngAfterViewInit();
        const idMainDocument = this.activatedRoute.snapshot.queryParams['idDocument'];
        this.idMainDocument = idMainDocument;
        this.formMethodName = 'SpAppWg001InvoiceApproval';
        this.formObjectName = 'MandantOverview';
        if (idMainDocument) {
            this.isEmpty = false;
        }
        this.dispatcher
            .pipe(
                filter((action: CustomAction) => {
                    return action.type === LayoutInfoActions.RESIZE_SPLITTER;
                }),
                auditTime(100),
                takeUntil(this.getUnsubscriberNotifier()),
            )
            .subscribe((action: CustomAction) => {
                this.parseConfigToWidthHeight();
            });
    }

    search({ searchKey, idPerson }) {
        this.hightlightKeywords = searchKey;
        this.invoiceApprovalService
            .searchMandant({ SearchString: searchKey, IdPerson: idPerson })
            .pipe()
            .subscribe((response) => {
                this.isShowAddNew = false;
                this.dataSource = this.datatableService.buildEditableDataSource(response.item);
                this.searchControl.firstLoadDialog = idPerson === '-1';
                if (!response.item?.[1]?.length) {
                    this.isShowAddNew = true;
                }
            });
    }

    hideSearchBox(event?: any) {
        this.dataSource = null;
        this.isShowAddNew = false;
    }

    addNew() {
        this.IdPersonUpdate = null;
        this.documentService
            .getFormGroupSettings({ methodName: this.addNewMethodName, object: this.addNewObjectName, idPerson: 0 })
            .subscribe((response) => {
                this.dynamicFormGroupDef = response;
                const popup = this.popupService.open({
                    content: this.addNewPopup,
                    hasBackdrop: false,
                    header: new HeaderNoticeRef({
                        iconClose: true,
                        title: 'Create Mandant',
                        icon: { content: '', type: 'resource' },
                    }),
                    disableCloseOutside: true,
                    optionDrapDrop: true,
                });
                popup.afterClosed$.subscribe(
                    (() => {
                        this.IdPersonUpdate = null;
                    }).bind(this),
                );
            });
    }

    public updateMandant() {
        this.IdPersonUpdate = this.IdPerson;
        this.documentService
            .getFormGroupSettings({
                methodName: this.addNewMethodName,
                object: this.addNewObjectName,
                idPerson: this.IdPerson,
            })
            .subscribe((response) => {
                this.dynamicFormGroupDef = response;
                const values = get(response, ['item', 'formDefinitions', 0, 'columnDefinitions']) || [];

                const popup = this.popupService.open({
                    content: this.addNewPopup,
                    hasBackdrop: false,
                    header: new HeaderNoticeRef({
                        iconClose: true,
                        title: 'Update Mandant',
                        icon: { content: '', type: 'resource' },
                    }),
                    disableCloseOutside: true,
                    optionDrapDrop: true,
                });
                popup.afterClosed$.subscribe(
                    (() => {
                        this.IdPersonUpdate = null;
                    }).bind(this),
                );

                for (const key in values) {
                    if (Object.prototype.hasOwnProperty.call(values, key)) {
                        const element = values[key];
                        this.addMandantForm.setFormValue(element.originalColumnName, element.value, 0);
                    }
                }
            });
    }

    public createUpdateMandant(close = () => {}) {
        const dataSave = this.addMandantForm.getDataSave(true);
        this.createUpdateMandantService(dataSave, close);
    }
    private createUpdateMandantService(dataSave: any, closeFunc: any) {
        this.invoiceApprovalService.saveDynamicForm(dataSave).subscribe((response) => {
            const item = response.item || {};
            if (item.isSuccess) {
                if (!this.IdPersonUpdate) {
                    this.IdPersonUpdate = item.returnID;
                    this.IdPerson = item.returnID;
                }
                this.setMandantByIdPerson(this.IdPersonUpdate, closeFunc);
            } else {
                this.toasterService.pop(MessageModal.MessageType.error, 'System', item.sqlStoredMessage || '');
            }
        });
    }

    private setMandantByIdPerson(idPerson: string, closeFunc: any) {
        this.invoiceApprovalService
            .searchMandant({ IdPerson: idPerson })
            .subscribe((responseSearch: ApiResultResponse) => {
                this.mandantOverviewForm.setFormValue('Mandant', get(responseSearch, ['item', 1, 0, 'Mandant']), 0);
                this.mandantOverviewForm.setFormValue('IdPerson', idPerson, 0);

                if (closeFunc) closeFunc();
                this.IdPersonUpdate = null;
            });
    }

    select(event) {
        if (!this.mandantOverviewForm || !event) return;
        // this.searchControl.toggleSearch(false);
        for (const key in event) {
            if (Object.prototype.hasOwnProperty.call(event, key)) {
                const element = event[key];
                if (element.key === 'IdPerson') {
                    this.IdPerson = element.value;
                }
                this.mandantOverviewForm?.setFormValue(element.key, element.value, 0);
            }
        }
    }

    selectRow(event) {
        this.selectedItem = event;
    }

    choose(event?) {
        this.hideSearchBox();
        this.select(event || this.selectedItem);
    }

    private parseConfigToWidthHeight() {
        try {
            this.width = $(this.element.nativeElement).parent().width();
            this.height = $(this.element.nativeElement).parent().height() - headerToolbar;
        } catch (error) {
            this.width = 0;
            this.height = 0;
        }
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

    public getDataSave() {
        return this.mandantOverviewForm.getDataSave();
    }

    public validateForm(): FormStatus {
        let formStatus = this.mandantOverviewForm.validateForm();

        if ((!formStatus || !formStatus.isValid) && !this.isApprovalModule) {
            formStatus = {
                isValid: false,
                formTitle: 'Mandant overview',
                errorMessages: [defaultLanguage.COMMON_LABEL__There_are_some_fields_are_invalid],
            };
        }
        return formStatus;
    }

    public validateBeforeSave() {
        return this.mandantOverviewForm.validateBeforeSave();
    }

    public reset() {
        this.IdPerson = null;
        this.mandantOverviewForm?.setFormValue('Mandant', '', 0);
        this.mandantOverviewForm.enableForm();
        this.mandantOverviewForm?.reset();
    }

    public onControlClick(event: any) {
        if (get(event, ['config', 'formControlName']) == 'Mandant' && !this.isApprovalModule) {
            this.searchControl.toggleSearch(true);
        }
    }
    public onInitialized(event) {
        const dataForm = get(event.formGroupConfigDef, ['formConfigDefs', 0, 'columnDefinitions']) || [];
        const data = find(dataForm, ['originalColumnName', 'IdPerson']);
        this.IdPerson = data.value;
        this.needDisableForm.next(this.ofModule?.moduleNameTrim == 'Approval');
    }

    private setMandantFormFromExtractedData(mandant: MasterExtractedData) {
        if (!mandant) {
            return;
        }

        // for table
        if (mandant.typeDataSet === TypeDataSet.DATA_TABLE) {
            this.select(mandant.data);
            return;
        }

        // for form
        if (mandant.idPerson) {
            this.setMandantByIdPerson(mandant.idPerson, null);
            this.IdPerson = mandant.idPerson;
        } else {
            this.createUpdateMandantService(mandant.data, null);
        }
    }
}
