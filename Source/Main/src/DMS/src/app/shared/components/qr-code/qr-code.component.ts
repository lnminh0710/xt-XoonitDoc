import { Component, OnInit, OnDestroy, Input, ChangeDetectorRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

import { BaseComponent } from '@app/pages/private/base';
import { Router } from '@angular/router';
import { BranchService } from '@app/services';
import { ControlGridColumnModel, ControlGridModel } from '@app/models';
import * as printJS from 'print-js';

import get from 'lodash-es/get';
import _filter from 'lodash-es/filter';

import { HeaderNoticeRef } from '@app/xoonit-share/components/global-popup/components/header-popup/header-notice-ref';
import { PopupService } from '@app/xoonit-share/components/global-popup/services/popup.service';

enum TypeToastPopupEnum {
    InvalidFileType = 1,
    InvalidFileLength = 2,
}

@Component({
    selector: 'widget-qr-code',
    templateUrl: './qr-code.component.html',
    styleUrls: ['./qr-code.component.scss'],
})
export class QRCodeComponent {
    @Input() value: any;
    @Input() size: any = 150;

    public print() {
        printJS('qr-code-printable', 'html');
    }

    // upload
}
