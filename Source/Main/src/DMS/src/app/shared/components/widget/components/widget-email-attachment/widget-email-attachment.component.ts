import { Component, Output, EventEmitter, OnInit, OnDestroy, AfterViewInit, ElementRef } from '@angular/core';
import { IconNames } from '../../../../../app-icon-registry.service';
import { Store } from '@ngrx/store';
import { AppState } from '../../../../../state-management/store';
import { BaseComponent } from '../../../../../pages/private/base';
import { Router } from '@angular/router';
import * as processDataReducer from '@app/state-management/store/reducer/process-data';
import { Observable } from 'rxjs';
import { SearchResultItemModel } from '../../../../../models';
import { filter, takeUntil, take } from 'rxjs/operators';
import { DocumentImageOcrService } from '../../../../../pages/private/modules/image-control/services';
import { DownloadFileService } from '../../../../../services';
import { Uti } from '../../../../../utilities';
import {
    AdministrationDocumentActionNames,
    AdministrationDocumentActions,
    CustomAction,
} from '../../../../../state-management/store/actions';
import { AttachDocument } from '../../../../../models/email';
import { UploadFileMode } from '../../../../../app.constants';
import { AdministrationDocumentSelectors } from '@app/state-management/store/reducer';

@Component({
    selector: 'widget-email-attachment',
    templateUrl: './widget-email-attachment.component.html',
    styleUrls: ['./widget-email-attachment.component.scss'],
})
export class WidgetEmailAttachmentComponent extends BaseComponent implements OnInit, OnDestroy, AfterViewInit {
    public IconNamesEnum = IconNames;
    // private _selectedSearchResultState$: Observable<SearchResultItemModel>;

    public svgPrint = IconNames.APP_PRINT;
    public svgDownload = IconNames.APP_DOWNLOAD;
    public documents: Array<AttachDocument> = [];
    private currentIdDocumentContainerScans: string;

    public isFullScreen = false;
    @Output() onMaximizeWidget = new EventEmitter<any>();

    constructor(
        private _eref: ElementRef,
        private store: Store<AppState>,
        protected router: Router,
        private documentService: DocumentImageOcrService,
        private downloadFileService: DownloadFileService,
        private administrationDocumentActions: AdministrationDocumentActions,
        private administrationDocumentSelectors: AdministrationDocumentSelectors,
    ) {
        super(router);
        // this._selectedSearchResultState$ = store.select(
        //     (state) => processDataReducer.getProcessDataState(state, this.ofModule.moduleNameTrim).selectedSearchResult,
        // );
    }

    /**
     * ngOnInit
     */
    public ngOnInit() {
        this.subscribe();
    }

    /**
     * ngOnDestroy
     */
    public ngOnDestroy() {
        super.onDestroy();
    }

    /**
     * ngAfterViewInit
     */
    public ngAfterViewInit() {}

    private subscribe() {
        // this._selectedSearchResultState$
        //     .pipe(
        //         filter((selectedSearchResultState) => !!selectedSearchResultState),
        //         takeUntil(this.getUnsubscriberNotifier()),
        //     )
        //     .subscribe((selectedSearchResultState: SearchResultItemModel) => {
        //         const data = selectedSearchResultState as any;
        //         this.onChangedSelectedSearchResult(data);
        //         this.store.dispatch(this.administrationDocumentActions.setSelectedDocument(null));
        //     });

        this.administrationDocumentSelectors
            .actionOfType$(AdministrationDocumentActionNames.SELECT_EMAIL_ITEM)
            .pipe(takeUntil(this.getUnsubscriberNotifier()))
            .subscribe((action: CustomAction) => {
                this.store.dispatch(this.administrationDocumentActions.setSelectedDocument(null));
                const res = action.payload;
                this.documents = [];

                if (!res) return;
                this.onChangedSelectedSearchResult({ idDocumentContainerScans: res.IdDocumentContainerScans });
            });
    }

    private onChangedSelectedSearchResult(searchResult?: any) {
        if (searchResult) this.currentIdDocumentContainerScans = searchResult.idDocumentContainerScans;
        this.documentService
            .getEmailAttachements(this.currentIdDocumentContainerScans)
            .pipe(take(1))
            .subscribe((response) => {
                this.documents = [];
                if (response?.length) {
                    (response as Array<any>).forEach((item) => {
                        this.documents.push(
                            new AttachDocument({
                                fileName: item.FileName,
                                scannedPath: item.ScannedPath,
                                idDocumentContainerOcr: item.IdDocumentContainerOcr,
                                idDocumentContainerScans: item.IdDocumentContainerScans,
                                idDocumentContainerFiles: item.IdDocumentContainerFiles,
                                docType: this.getDocumentType(item.FileName),
                            }),
                        );
                    });
                }
            });
    }

    private getDocumentType(fileName: string) {
        let isImage = fileName.match(/.(jpg|jpeg|png|gif|tiff)$/i);
        if (isImage) {
            return 'image';
        }
        let isDoc = fileName.match(/.(doc|docx)$/i);
        if (isDoc) {
            return 'doc';
        }
        let isExcel = fileName.match(/.(xls|xlsx|xlsm|csv)$/i);
        if (isExcel) {
            return 'excel';
        }
        let isPDF = fileName.match(/.(pdf|ppt)$/i);
        if (isPDF) {
            return 'pdf';
        }
        let isZip = fileName.match(/.(zip)$/i);
        if (isZip) {
            return 'zip';
        }
        let isMedia = fileName.match(/.(mp3|mp4)$/i);
        if (isMedia) {
            return 'media';
        }
        return 'image';
    }

    public viewDocument(document: AttachDocument) {
        this.documents.forEach((item) => {
            item.isSelected = false;
        });
        document.isSelected = true;
        this.store.dispatch(this.administrationDocumentActions.setSelectedDocument(document));
    }

    public download(document: AttachDocument) {
        let fileName = document.scannedPath + '\\' + document.fileName;
        const url = Uti.getFileUrl(fileName, UploadFileMode.Path, document.fileName);
        this.downloadFileService.downloadFileWithIframe(url);
    }

    public downloadAll() {
        if (this.documents?.length) {
            this.downloadFileService.downloadZipFile(this.documents[0].scannedPath);
        }
    }

    public expandWidget() {
        this.isFullScreen = !this.isFullScreen;
        this.onMaximizeWidget.emit({
            isMaximized: this.isFullScreen,
        });
    }
}
