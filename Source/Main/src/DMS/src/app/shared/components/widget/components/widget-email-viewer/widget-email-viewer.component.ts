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
import { EmailContentModel } from '../../../../../models/email';
import { DownloadFileService } from '../../../../../services';
import { Uti } from '../../../../../utilities';
import { UploadFileMode } from '../../../../../app.constants';
import { AdministrationDocumentSelectors } from '@app/state-management/store/reducer';
import { AdministrationDocumentActionNames, CustomAction } from '@app/state-management/store/actions';

@Component({
    selector: 'widget-email-viewer',
    templateUrl: './widget-email-viewer.component.html',
    styleUrls: ['./widget-email-viewer.component.scss'],
})
export class WidgetEmailViewerComponent extends BaseComponent implements OnInit, OnDestroy, AfterViewInit {
    public IconNamesEnum = IconNames;
    public svgPrint = IconNames.APP_PRINT;
    public svgDownload = IconNames.APP_DOWNLOAD;
    public emailContent: EmailContentModel;
    private currentIdDocumentContainerScans: string;

    // private _selectedSearchResultState$: Observable<SearchResultItemModel>;

    @Output()
    public onPrintWidget: EventEmitter<any> = new EventEmitter();

    public isFullScreen = false;
    @Output() onMaximizeWidget = new EventEmitter<any>();

    constructor(
        private _eref: ElementRef,
        private store: Store<AppState>,
        protected router: Router,
        private documentService: DocumentImageOcrService,
        private downloadFileService: DownloadFileService,
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
        //     });
        this.administrationDocumentSelectors
            .actionOfType$(AdministrationDocumentActionNames.SELECT_EMAIL_ITEM)
            .pipe(takeUntil(this.getUnsubscriberNotifier()))
            .subscribe((action: CustomAction) => {
                const res = action.payload;
                this.updateEmailContent(res);
            });
    }

    private updateEmailContent(data) {
        this.emailContent = data
            ? new EmailContentModel({
                  body: data.Body,
                  createDate: data.CreateDate,
                  recipientsBcc: data.RecipientsBcc,
                  recipientsCc: data.RecipientsCc,
                  recipientsTo: data.RecipientsTo,
                  sender: data.Sender,
                  sentDate: data.SentDate,
                  subject: data.Subject,
                  scannedPath: data.ScannedPath,
                  scannedFilename: data.ScannedFilename,
              })
            : null;
    }
    // private onChangedSelectedSearchResult(searchResult?: any) {
    //     if (searchResult) this.currentIdDocumentContainerScans = searchResult.idDocumentContainerScans;
    //     this.documentService
    //         .getEmailData(this.currentIdDocumentContainerScans)
    //         .pipe(take(1))
    //         .subscribe((response) => {
    //             this.updateEmailContent(response);
    //         });
    // }

    public downloadEmail() {
        let fileName = this.emailContent.scannedPath + '\\' + this.emailContent.scannedFilename;
        const url = Uti.getFileUrl(fileName, UploadFileMode.Path, this.emailContent.scannedFilename);
        this.downloadFileService.downloadFileWithIframe(url);
    }

    public print() {
        this.onPrintWidget.emit(true);
    }

    public expandWidget() {
        this.isFullScreen = !this.isFullScreen;
        this.onMaximizeWidget.emit({
            isMaximized: this.isFullScreen,
        });
    }
}
