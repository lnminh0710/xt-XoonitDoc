import { AfterViewInit, Component, ElementRef, OnDestroy, OnInit, ViewContainerRef, Injector, ViewChild } from '@angular/core';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { CommonFormComponent } from '../../../../../xoonit-share/components/widget-dynamic-form/components/common-form/common-form.component';
import { ReducerManagerDispatcher, Store } from '@ngrx/store';
import { filter, takeUntil } from 'rxjs/operators';
import { CustomAction, DocumentThumbnailActions } from '@app/state-management/store/actions';
import { AppState } from '@app/state-management/store';
import { InvoiceApprovalProcessingActionNames } from '@app/pages/invoice-approval-processing/invoice-approval-processing.statemanagement/invoice-approval-processing.actions';

import { get } from 'lodash-es';
import { BaseWidgetDynamicFormCommonAction } from '../base-widget-common-action';
import { Subject } from 'rxjs';
import { WidgetDynamicFormComponent } from '@app/xoonit-share/components/widget-dynamic-form/widget-dynamic-form.component';

@Component({
    selector: 'widget-payment-information',
    templateUrl: './widget-payment-information.component.html',
    styleUrls: ['./widget-payment-information.component.scss'],
})
export class WidgetPayementInformationComponent extends BaseWidgetDynamicFormCommonAction implements OnInit, AfterViewInit, OnDestroy {
    public objectName: string = '';
    public methodName: string = '';
    public idMainDocument: string;

    @ViewChild('paymentInfoForm') paymentInfoForm: WidgetDynamicFormComponent;
    public isEmpty = false;
    private needDisableForm: Subject<boolean> = new Subject<boolean>();
    

    constructor(protected router: Router, protected elementRef: ElementRef, protected activatedRoute: ActivatedRoute, protected dispatcher: ReducerManagerDispatcher, protected appStore: Store<AppState>, protected containerRef: ViewContainerRef, protected injector: Injector) {
        super(injector, containerRef, router);
    }

    ngOnInit() {
        this.dispatcher
            .pipe(
                filter((action: CustomAction) => action.type === InvoiceApprovalProcessingActionNames.APPLY_EXTRACT_AI_DATA),
                takeUntil(this.getUnsubscriberNotifier()),
            )
            .subscribe((action: CustomAction) => {
                const data = get(action, ['payload', 'data', 'item', 1]) || [];
                for (const key in data) {
                    if (Object.prototype.hasOwnProperty.call(data, key)) {
                        const element = data[key];
                        if (element.Value) {
                            let originColumnName: string = element.OriginalColumnName;
                            if (['ContoNr', 'IBAN', 'SWIFTBIC'].includes(originColumnName.split('_').pop())) {
                                originColumnName = originColumnName.split('_').pop();
                            }
                            this.widgetDynamicFormComponent.setFormValue(originColumnName, element.Value, 0);
                        }
                    }
                }
            });
    }

    ngOnDestroy() {
        super.onDestroy();
    }

    ngAfterViewInit() {
        super.ngAfterViewInit();
        this.idMainDocument = this.activatedRoute.snapshot.queryParams['idDocument'];
        this.objectName = 'PaymentInformation';
        this.methodName = 'SpAppWg001InvoiceApproval';

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
                this.paymentInfoForm.disableForm();
            });
    }

    onRouteChanged(event?: NavigationEnd) {
        this.idMainDocument = this.activatedRoute.snapshot.queryParams['idDocument'];
        this.objectName = 'PaymentInformation';
        this.methodName = 'SpAppWg001InvoiceApproval';
        if (!this.idMainDocument) {
            this.paymentInfoForm.enableForm();
            this.widgetDynamicFormComponent?.reset();
            return;
        }
    }

    public dynamicFormInitialized(form: CommonFormComponent) {
        this.needDisableForm.next(this.ofModule?.moduleNameTrim == 'Approval');
    }

    //public reset() {
    //    this.widgetDynamicFormComponent?.reset();
    //}

    //public filterDisplayFields(displayFields: Array<FieldFilter>) {
    //    throw new Error("Method not implemented.");
    //}
}
