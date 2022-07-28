import {
    AfterViewInit,
    Component,
    Input,
    OnDestroy,
    OnInit,
    ViewContainerRef,
    Injector,
    ViewChild,
} from '@angular/core';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { ModuleList } from '@app/pages/private/base';
import { AppState } from '@app/state-management/store';
import { CustomAction, DocumentThumbnailActions } from '@app/state-management/store/actions';
import { ReducerManagerDispatcher, Store } from '@ngrx/store';
import { MonoTypeOperatorFunction } from 'rxjs';
import { filter, takeUntil } from 'rxjs/operators';

import { InvoiceDateChange } from '@app/state-management/store/actions/app/app.actions';
import { BaseWidgetDynamicFormCommonAction } from '@widget/components/base-widget-common-action';
import { CommonFormComponent } from '../widget-dynamic-form/components/common-form/common-form.component';
import { Subject } from 'rxjs';
import { WidgetDynamicFormComponent } from '../widget-dynamic-form/widget-dynamic-form.component';
import { InvoiceApprovalProcessingSelectors } from '@app/pages/invoice-approval-processing/invoice-approval-processing.statemanagement/invoice-approval-processing.selectors';
import { InvoiceApprovalProcessingActionNames } from '@app/pages/invoice-approval-processing/invoice-approval-processing.statemanagement/invoice-approval-processing.actions';
import { Uti } from '@app/utilities';
import { MasterExtractedData } from '@app/models/approval/master-extracted.model';

const headerToolbar = 50;
@Component({
    selector: 'widget-invoice-info-approval',
    templateUrl: './widget-invoice-info-approval.component.html',
    styleUrls: ['./widget-invoice-info-approval.component.scss'],
})
export class WidgetInvoiceInfoApprovalComponent
    extends BaseWidgetDynamicFormCommonAction
    implements OnInit, AfterViewInit, OnDestroy {
    @Input() tabID: string;

    isApprovalModule: boolean = false;

    // Form
    public formMethodName = '';
    public formObjectName = '';
    public idMainDocument;
    public isEmpty = false;
    private needDisableForm: Subject<boolean> = new Subject<boolean>();

    @Input() globalProperties: any;
    @ViewChild('supplierForm') supplierForm: WidgetDynamicFormComponent;

    constructor(
        protected router: Router,
        private dispatcher: ReducerManagerDispatcher,
        private activatedRoute: ActivatedRoute,
        private appStore: Store<AppState>,
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
            this.formObjectName = 'InvoiceInformation';
            if (!idMainDocument) {
                this.supplierForm.enableForm();
                this.widgetDynamicFormComponent?.reset();
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
                this.needDisableForm.next(this.isEmpty);
            });

        this.needDisableForm
            .pipe(
                filter((isDisabled: boolean) => isDisabled),
                takeUntil(this.getUnsubscriberNotifier()),
            )
            .subscribe(() => {
                this.supplierForm.disableForm();
            });
    }

    ngOnInit() {
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
        this.formObjectName = 'InvoiceInformation';
        if (idMainDocument) {
            this.isEmpty = false;
        }

        this.invoiceApprovalProcessingSelectors.invoiceInfoAndPaymentOverviewExtractedData$
            .pipe(
                filter(
                    (invoiceInfoAndPaymentOverviewExtractedData) =>
                        !!invoiceInfoAndPaymentOverviewExtractedData && !this.idMainDocument,
                ),
                takeUntil(this.getUnsubscriberNotifier()),
            )
            .subscribe((invoiceInfo: MasterExtractedData) => {
                if (!invoiceInfo) return;

                const formGroupDef = this.supplierForm?.formGroupDef?.formDefinitions[0]['columnDefinitions'];
                if (!formGroupDef?.length) return;
                for (let index = 0; index < formGroupDef.length; index++) {
                    const element = formGroupDef[index];
                    if (!element) continue;

                    let value = invoiceInfo.data.find((x) => x.name === element['columnName'])?.value;
                    if (!value) continue;

                    if (element['columnName'] === 'InvoiceDate') {
                        value = new Date(Uti.parseDateToString(value));
                        // it's invalid date
                        if (isNaN(value.getTime())) {
                            value = '';
                        }
                    }

                    this.supplierForm.setFormValue(element['columnName'], value, 0);
                }
            });
    }

    dataChanged(form: any) {
        this.appStore.dispatch(new InvoiceDateChange({ InvoiceDate: form.InvoiceDate }));
    }

    public dynamicFormInitialized(form: CommonFormComponent) {
        this.needDisableForm.next(this.ofModule?.moduleNameTrim == 'Approval');
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
