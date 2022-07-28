import {
    Component,
    Injector,
    OnDestroy,
    OnInit,
    Type,
    ViewChild,
    ViewContainerRef,
} from '@angular/core'
import { Router } from '@angular/router';
import { DocumentMyDMType } from '@app/app.constants';
import { DocumentService } from '@app/services';
import { AppInjectWigetInstanceIsAbleToSaveAction } from '@app/state-management/store/actions/app-global/app-global.actions';
import { IWidgetIsAbleToSave } from '@app/state-management/store/models/app-global/widget-is-able-to-save.payload.model';
import { CommonWidgetProcessingFormContainer } from '@app/xoonit-share/processing-form/common-widget-processing-form-container.component';
import { IMyDMForm, IToolbarForm } from '@app/xoonit-share/processing-form/interfaces/mydm-form.interface';
import { InvoiceAddonComponent } from '../widget-mydm-form/components/invoice-addon/invoice-addon.component';

@Component({
    selector: 'widget-invoice-addon',
    templateUrl: './widget-invoice-addon.component.html',
    styleUrls: ['./widget-invoice-addon.component.scss'],
})
export class WidgetInoviceAddonComponent extends CommonWidgetProcessingFormContainer implements IWidgetIsAbleToSave, OnInit, OnDestroy {
    @ViewChild('formContainer', { read: ViewContainerRef }) formContainer: ViewContainerRef;

    constructor(
        protected router: Router,
        protected injector: Injector,
        private documentService: DocumentService
    ) {
        super(router, injector);
    }

    ngOnInit() {
        this.store.dispatch(new AppInjectWigetInstanceIsAbleToSaveAction(this));
    }

    ngOnDestroy() {
        super.onDestroy();
    }

    validateBeforeSave() {
        return this.componentRef?.instance.validateBeforeSave?.();
    }

    validateForm() {
        return this.componentRef?.instance.validateForm?.();
    }

    getDataSave() {
        return this.componentRef?.instance.getDataSave?.();
    }

    reset() {
        return this.componentRef?.instance.reset();
    }
    
    protected setViewContainerRef(): ViewContainerRef {
        return this.formContainer;
    }

    protected setSupportedDocumentTypeForm(): Map<DocumentMyDMType, Type<IMyDMForm<IToolbarForm>>> {
        return new Map<DocumentMyDMType, Type<IMyDMForm<IToolbarForm>>>()
            .set(DocumentMyDMType.Invoice, InvoiceAddonComponent)
            .set(DocumentMyDMType.Contract, InvoiceAddonComponent)
            .set(DocumentMyDMType.OtherDocuments, InvoiceAddonComponent);
    }

}
