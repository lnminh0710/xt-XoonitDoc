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
import { MonoTypeOperatorFunction, Observable } from 'rxjs';
import { auditTime, filter, takeUntil } from 'rxjs/operators';
import { get } from 'lodash-es';

import { InvoiceDateChange } from '@app/state-management/store/actions/app/app.actions';
import { MessageModal } from '@app/app.constants';
import { ToasterService } from 'angular2-toaster';
import {
    FormStatus,
    IWidgetIsAbleToSave,
} from '@app/state-management/store/models/app-global/widget-is-able-to-save.payload.model';
import { AppInjectWigetInstanceIsAbleToSaveAction } from '@app/state-management/store/actions/app-global/app-global.actions';
import { defaultLanguage } from '@app/app.resource';
import { InvoiceApprovalProcessingActionNames } from '@app/pages/invoice-approval-processing/invoice-approval-processing.statemanagement/invoice-approval-processing.actions';
import { BaseWidgetDynamicFormCommonAction } from '../base-widget-common-action';
import { XnSearchTableComponent } from '@app/xoonit-share/components/xn-search-table/xn-search-table.component';

const headerToolbar = 50;
@Component({
    selector: 'widget-invoice-supplier-information',
    templateUrl: './widget-invoice-supplier-information.component.html',
    styleUrls: ['./widget-invoice-supplier-information.component.scss'],
})
export class WidgetInvoiceSupplierInformationComponent
    extends BaseWidgetDynamicFormCommonAction
    implements OnInit, AfterViewInit, OnDestroy, IWidgetIsAbleToSave {
    width: number = 0;
    height: number = 0;
    dataSource: ControlGridModel;
    isShowAddNew: boolean;
    hightlightKeywords: string = '';
    isApprovalModule: boolean = false;
    private selectedItem: { key: string; value: any }[] = [];

    private _rowSelected: number;
    IdPersonUpdate: any;
    public set rowSelected(index: number) {
        if (index < 0 || index >= this.dataSource?.data.length) {
            return;
        } else {
            this._rowSelected = index;
        }
    }

    public get rowSelected(): number {
        return this._rowSelected;
    }

    // Form
    public formMethodName = '';
    public formObjectName = '';
    public idMainDocument;
    public isEmpty = false;

    // add new
    public addNewMethodName = 'SpAppWg001InvoiceApproval';
    public addNewObjectName = 'GetSupplierDynForm';

    @Input() globalProperties: any;
    @ViewChild('addNewPopup') addNewPopup: TemplateRef<any>;
    @ViewChild('searchTemp') searchControl: XnSearchTableComponent;
    @ViewChild('supplierForm') supplierForm: WidgetDynamicFormComponent;
    @ViewChild('addUpdateSupplierForm') addUpdateSupplierForm: WidgetDynamicFormComponent;

    // private subscribe
    public IdPerson: any;
    dynamicFormGroupDef: any;

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
    ) {
        super(injector, containerRef, router);
        this._subscribe();
    }

    private _subscribe() {
        this._registerRouterEvent(takeUntil(this.getUnsubscriberNotifier()), () => {
            const idMainDocument = this.activatedRoute.snapshot.queryParams['idDocument'];
            this.idMainDocument = idMainDocument;
            this.formMethodName = 'SpAppWg001InvoiceApproval';
            this.formObjectName = 'InvoiceSupplierInformation';
            if (!idMainDocument) {
                this.reset();
                return;
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
            });

        this.dispatcher
            .pipe(
                filter(
                    (action: CustomAction) =>
                        action.type === InvoiceApprovalProcessingActionNames.APPLY_EXTRACT_AI_DATA,
                ),
                takeUntil(this.getUnsubscriberNotifier()),
            )
            .subscribe((action: CustomAction) => {
                const data = get(action, ['payload', 'data', 'item', 1]) || [];
                for (const key in data) {
                    if (Object.prototype.hasOwnProperty.call(data, key)) {
                        const element = data[key];
                        if (element.Value) this.supplierForm.setFormValue(element.OriginalColumnName, element.Value, 1);
                    }
                }
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
        this.formObjectName = 'InvoiceSupplierInformation';
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
            .searchSupplier({ SearchString: searchKey, IdPerson: idPerson })
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
                    hasBackdrop: true,
                    header: new HeaderNoticeRef({
                        iconClose: true,
                        title: 'Create Supplier',
                        icon: { content: '', type: 'resource' },
                    }),
                    disableCloseOutside: true,
                });
                popup.afterClosed$.subscribe(
                    (() => {
                        this.IdPersonUpdate = null;
                    }).bind(this),
                );
            });
    }

    public updateSupplier() {
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
                    hasBackdrop: true,
                    header: new HeaderNoticeRef({
                        iconClose: true,
                        title: 'Update Supplier',
                        icon: { content: '', type: 'resource' },
                    }),
                    disableCloseOutside: true,
                });
                popup.afterClosed$.subscribe(
                    (() => {
                        this.IdPersonUpdate = null;
                    }).bind(this),
                );
                for (const key in values) {
                    if (Object.prototype.hasOwnProperty.call(values, key)) {
                        const element = values[key];
                        this.addUpdateSupplierForm.setFormValue(element.originalColumnName, element.value, 0);
                    }
                }
            });
    }

    public createUpdateSupplier(close = () => {}) {
        const dataSave = this.addUpdateSupplierForm.getDataSave(true);
        this.invoiceApprovalService.saveDynamicForm(dataSave).subscribe((response) => {
            const item = response.item || {};
            if (item.isSuccess) {
                if (!this.IdPersonUpdate) {
                    this.IdPersonUpdate = item.returnID;
                    this.IdPerson = item.returnID;
                }
                this.invoiceApprovalService
                    .searchSupplier({ IdPerson: this.IdPersonUpdate })
                    .subscribe((responseSearch: ApiResultResponse) => {
                        const data = get(responseSearch, ['item', 1, 0]);
                        for (const key in data) {
                            if (Object.prototype.hasOwnProperty.call(data, key)) {
                                const value = data[key];
                                this.supplierForm.setFormValue(key, value, 0);
                            }
                        }
                        this.IdPersonUpdate = null;
                        close();
                    });
            } else {
                this.toasterService.pop(MessageModal.MessageType.error, 'System', item.sqlStoredMessage || '');
            }
        });
    }

    select(event) {
        // this.searchControl.toggleSearch(false);
        for (const key in event) {
            if (Object.prototype.hasOwnProperty.call(event, key)) {
                const element = event[key];
                if (element.key === 'IdPerson') {
                    this.IdPerson = element.value;
                }
                this.supplierForm.setFormValue(element.key, element.value, 0);
            }
        }
    }

    dataChanged(form: any) {
        this.appStore.dispatch(new InvoiceDateChange({ InvoiceDate: form.InvoiceDate }));
    }

    selectRow(event) {
        this.selectedItem = event;
    }

    choose(event?) {
        this.hideSearchBox();
        this.rowSelected = null;
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
        return this.supplierForm.getDataSave();
    }

    public validateForm(): FormStatus {
        let formStatus = this.supplierForm.validateForm();

        // [Remove the logic that Mandant and Supplier are mandatory to save
        // if ((!formStatus || !formStatus.isValid || !this.IdPerson) && !this.isApprovalModule) {
        if ((!formStatus || !formStatus.isValid) && !this.isApprovalModule) {
            formStatus = {
                isValid: false,
                formTitle: 'Supplier information',
                errorMessages: [defaultLanguage.COMMON_LABEL__There_are_some_fields_are_invalid],
            };
        }
        return formStatus;
    }

    public validateBeforeSave() {
        // [Remove the logic that Mandant and Supplier are mandatory to save
        // return !!this.IdPerson || !!this.idMainDocument;
        return this.supplierForm.validateBeforeSave();
    }

    public reset() {
        this.supplierForm?.reset();
        this.IdPerson = null;
    }

    public onControlClick(event: any) {
        if (get(event, ['config', 'setting', 'DisplayField', 'ReadOnly']) == '1' && !this.idMainDocument) {
            this.searchControl.toggleSearch(true);
        }
    }
}
