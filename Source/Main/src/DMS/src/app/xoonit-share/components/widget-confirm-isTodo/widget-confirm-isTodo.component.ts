import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { DocumentTypeEnum } from '@app/app.constants';
import { BaseComponent } from '@app/pages/private/base';
import { PopupRef } from '../global-popup/popup-ref';

@Component({
    selector: 'widget-confirm-isTodo.',
    templateUrl: './widget-confirm-isTodo.component.html',
    styleUrls: ['./widget-confirm-isTodo.component.scss'],
})
export class WidgetConfirmIsTodoComponent extends BaseComponent implements OnInit, OnDestroy {
    constructor(protected router: Router, public popupRef: PopupRef) {
        super(router);
    }

    ngOnInit(): void {}

    ngOnDestroy() {
        super.onDestroy();
    }

    public closeDialog(isSuccess: boolean = false) {
        this.popupRef.close({ isSuccess });
    }

    public saveApproval() {
        this.popupRef.close({ isSuccess: true, docType: DocumentTypeEnum.INVOICE_APPROVAL });
    }

    public saveApprovalProcessing() {
        this.popupRef.close({ isSuccess: true, docType: DocumentTypeEnum.INVOICE_APPROVAL_PROCESSING });
    }
}
