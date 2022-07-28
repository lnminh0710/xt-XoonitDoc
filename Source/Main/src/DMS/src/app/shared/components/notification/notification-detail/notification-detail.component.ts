
import {
    Component,
    OnInit,
    Input,
    OnDestroy,
} from '@angular/core';
import { Router } from '@angular/router';
import { BaseComponent } from '@app/pages/private/base';
import { DownloadFileService, ModalService } from '@app/services';

@Component({
    selector: 'notification-detail',
    styleUrls: ['./notification-detail.component.scss'],
    templateUrl: './notification-detail.component.html'
})
export class NotificationDetailComponent extends BaseComponent implements OnInit, OnDestroy {
    public perfectScrollbarConfig: any;

    @Input() data: any = {};

    constructor(
        private _downloadFileService: DownloadFileService,
        private _modalService: ModalService,
        protected router: Router
    ) {
        super(router);
    }
    public ngOnInit() {
        this.perfectScrollbarConfig = {
            suppressScrollX: false,
            suppressScrollY: false
        };
    }
    public ngOnDestroy() {
    }

    public downloadPDFClicked() {
        this._downloadFileService.makeDownloadFile(this.data.PicturePath, this.data.PicturePath.split(/[\\ ]+/).pop(), this._modalService);
    }
    /*************************************************************************************************/
    /***************************************PRIVATE METHOD********************************************/
}
