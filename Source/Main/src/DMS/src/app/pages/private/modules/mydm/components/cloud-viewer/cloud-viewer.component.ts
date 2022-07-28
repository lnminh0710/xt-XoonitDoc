import { Component, OnInit, ChangeDetectorRef, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { CustomAction, CloudActions } from '@app/state-management/store/actions';
import { ReducerManagerDispatcher } from '@ngrx/store';

import { CloudConfigurationService } from '../../services';

import get from 'lodash-es/get';
import { Uti } from '@app/utilities';

import { ToolbarConfigModel } from '../../../image-control/models/toolbar.model';
import { ImageThumbnailModel } from '../../../image-control/models/image.model';
import { DocumentImageOcrService } from '../../../image-control/services';
import { filter } from 'rxjs/operators';
@Component({
    selector: 'cloud-viewer',
    templateUrl: './cloud-viewer.component.html',
    styleUrls: ['./cloud-viewer.component.scss'],
})
export class CloudViewerComponent implements OnInit, OnDestroy {
    constructor(
        private cloudService: CloudConfigurationService,
        private ref: ChangeDetectorRef,
        private dispatcher: ReducerManagerDispatcher,
        private documentService: DocumentImageOcrService,
    ) {}

    public pdfSrc: any;
    public isLoading: boolean;
    public isEmpty: boolean;
    public IdDocumentContainerScans: any;
    public pages: ImageThumbnailModel[];

    public pageVariable = 1;
    public zoomVariable = 1;
    public rotateVariable = 0;
    public isShowSendMail = false;

    public toolbarConfig: ToolbarConfigModel = {
        isShowDownload: true,
        isShowPrinter: true,
        isShowSendMail: false,
        isShowShare: true,

        isHideGroupIcon: true,
    };

    private subscribeViewPdf: Subscription;

    ngOnInit() {
        this.subscribeViewPdf = this.dispatcher
            .pipe(
                filter((action: CustomAction) => {
                    return action.type === CloudActions.VIEW_PDF;
                }),
            )
            .subscribe((action: CustomAction) => {
                this.getCloudFile(action.payload);
            });
    }

    ngOnDestroy() {
        Uti.unsubscribe(this);
    }

    public viewActualSize() {
        this.zoomVariable = 1;
        this.rotateVariable = 0;
    }

    public openSharing() {
        console.log('openSharing');
        this.isShowSendMail = true;
    }

    public rotateImage(rotateNumber: number) {
        this.rotateVariable += rotateNumber;
    }

    public zoomImage(zoomNumber: number) {
        let zoomValue: number = this.zoomVariable;
        if (zoomNumber > 1) {
            zoomValue += 0.2;
        } else {
            zoomValue -= 0.2;
        }

        this.zoomVariable = Math.max(Math.min(zoomValue, 2), 0.5);
    }

    public onMouseWhell(event: any) {
        if (!event.ctrlKey) return;
        if (event.preventDefault) event.preventDefault();
        const delta = Math.max(-1, Math.min(1, event.wheelDelta || -event.detail));
        if (delta < 0) {
            this.zoomImage(0.8);
        } else {
            this.zoomImage(1.2);
        }
    }

    private getCloudFile(data: any) {
        this.isEmpty = false;
        this.pdfSrc = '';
        const CloudFilePath = get(data, 'cloudFilePath');
        const CloudmediaPath = get(data, 'cloudMediaPath');
        const CloudMediaName = get(data, 'mediaName');
        if (!CloudFilePath || !CloudmediaPath) {
            this.isEmpty = true;
            return;
        }

        this.IdDocumentContainerScans = get(data, 'idDocumentContainerScans');
        this.isLoading = true;
        this.ref.detectChanges();
        const options: any = {
            CloudFilePath: CloudFilePath,
            CloudmediaPath: CloudmediaPath,
            CloudmediaName: CloudMediaName,
        };
        this.cloudService.getFileFromCloud(options).subscribe(
            (response: any) => {
                const base64 = response.json();
                this.convertStringToBuffer(base64);
                this.getPagesById();
            },
            (error) => {
                this.isEmpty = true;
                this.isLoading = false;
                this.ref.detectChanges();
            },
        );
    }

    private getPagesById() {
        if (!this.IdDocumentContainerScans) {
            this.pages = [];
            return;
        }
        this.documentService.getDocumentById(this.IdDocumentContainerScans).subscribe((response) => {
            this.pages = response;
        });
    }

    private convertStringToBuffer(base64) {
        if (!base64) {
            this.isLoading = false;
            this.ref.detectChanges();

            return;
        }
        const binary_string = window.atob(base64);
        const len = binary_string.length;
        const bytes = new Uint8Array(len);
        for (let i = 0; i < len; i++) {
            bytes[i] = binary_string.charCodeAt(i);
        }

        this.pdfSrc = bytes.buffer;
        this.isLoading = false;
        this.ref.detectChanges();
    }
}
