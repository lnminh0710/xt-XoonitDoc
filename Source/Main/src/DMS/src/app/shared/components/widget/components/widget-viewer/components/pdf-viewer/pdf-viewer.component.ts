import {
    Component,
    OnInit,
    ChangeDetectorRef,
    ChangeDetectionStrategy,
    ViewChild,
    AfterViewInit,
    OnDestroy,
    ElementRef,
    Injector,
    OnChanges,
    SimpleChanges,
    Output,
    EventEmitter,
} from '@angular/core';
import { PerfectScrollbarConfigInterface } from 'ngx-perfect-scrollbar';
import { BaseViewer } from '../base-viewer';
import { Router } from '@angular/router';
import { AppState } from '@app/state-management/store';
import { Store } from '@ngrx/store';
import { Subscription } from 'rxjs';
import { WjPdfViewer } from 'wijmo/wijmo.angular2.viewer';
import { Configuration, FileViewerType } from '@app/app.constants';
import { ViewMode } from 'wijmo/wijmo.viewer';
import {
    DocumentManagementActionNames,
    GetFileByUrlForWidgetViewerIdAction,
    DblClickOnWidgetViewerAction,
} from '@app/pages/document-management/document-management.statemanagement/document-management.actions';
import { DocumentManagementSelectors } from '@app/pages/document-management/document-management.statemanagement/document-management.selectors';
import { Uti } from '@app/utilities';
import { PDFDocumentProxy, PdfViewerComponent } from 'ng2-pdf-viewer';
import { CustomAction } from '@app/state-management/store/actions';
import { takeUntil } from 'rxjs/internal/operators/takeUntil';
import { filter } from 'rxjs/operators';

@Component({
    selector: 'widget-pdf-viewer',
    templateUrl: './pdf-viewer.component.html',
    styleUrls: ['./pdf-viewer.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WidgetPdfViewerComponent extends BaseViewer implements OnInit, AfterViewInit, OnDestroy, OnChanges {
    public totalPages: number;
    public currentPage = 1;
    public perfectScrollbarConfig: PerfectScrollbarConfigInterface;

    // private wjPdfViewer: WjPdfViewer;
    @ViewChild(PdfViewerComponent) pdfComponent: PdfViewerComponent;

    @ViewChild('pdfViewer') pdfViewer: ElementRef;
    private _init: boolean;

    constructor(
        protected router: Router,
        protected documentManagementSelectors: DocumentManagementSelectors,
        protected store: Store<AppState>,
        private cdRef: ChangeDetectorRef,
        private injector: Injector,
        protected uti: Uti,
    ) {
        super(router, store);
        this.subscribeOnAttachViewRef();
        this.perfectScrollbarConfig = {
            suppressScrollX: true,
            suppressScrollY: false,
        };
    }

    ngOnInit() {
        this.store.dispatch(new GetFileByUrlForWidgetViewerIdAction(this.path, this.uniqueViewerId));
    }

    ngOnChanges(changes: SimpleChanges): void {}

    ngAfterViewInit(): void {
        this.newPdfViewer();
    }
    ngOnDestroy(): void {
        this.unsubscribeOnDetachViewRef();
    }

    public updatePath(path: string): void {
        this.path = path;
        this.store.dispatch(new GetFileByUrlForWidgetViewerIdAction(this.path, this.uniqueViewerId));
    }

    public subscribeOnAttachViewRef() {
        this.documentManagementSelectors
            .actionSuccessOfSubtype$(DocumentManagementActionNames.GET_FILE_BY_URL_FOR_WIDGET_VIEWER_ID)
            .pipe(
                filter(
                    (action: GetFileByUrlForWidgetViewerIdAction) => action.payload.idWidget === this.uniqueViewerId,
                ),
                takeUntil(this.getUnsubscriberNotifier()),
            )
            .subscribe((action: CustomAction) => {
                // this.wjPdfViewer.filePath = this.path.replace(/(^[\\\/])/g, '');
                this._init = false;
                this.blob = action.payload.file as Blob;
                const fileReader = new FileReader();

                fileReader.onload = (event: any) => {
                    const data = event.target.result;
                    // const src = new Uint8Array(data, 0, data.byteLength);
                    this.pdfComponent.src = this.path;

                    this.cdRef.detectChanges();
                };
                fileReader.readAsArrayBuffer(this.blob);
                this.cdRef.detectChanges();
            });
    }

    public setSupportedFileTypesAsKey() {
        return [FileViewerType[FileViewerType.PDF]];
    }

    public isExtensionTheSameGroupType(fileType: FileViewerType) {
        switch (fileType) {
            case FileViewerType.PDF:
                return true;
            default:
                return false;
        }
    }

    public disposeContentOnDetach() {
        // if (!this.wjPdfViewer) return;
        WjPdfViewer.invalidateAll(this.pdfViewer.nativeElement);
    }

    public loadCompletely(pdf: PDFDocumentProxy) {
        this.totalPages = pdf.numPages;
    }

    public changeCurrentPage(page: string) {
        // if (page.length === 0) return;
        // const safeInteger = toSafeInteger(page);
        // if (safeInteger === null || typeof safeInteger === undefined) return;
        // console.log(`currentPage: ${this.currentPage}, page: ${page}`);
        // this.currentPage = safeInteger;
        // console.log(`currentPage: ${this.currentPage}, page: ${page}`);
    }

    private newPdfViewer() {
        // if (this.wjPdfViewer) return;
        // const user = this.uti.getUserInfo();
        // this.wjPdfViewer = new WjPdfViewer(this.pdfViewer, this.injector, this);
        // this.wjPdfViewer.serviceUrl = `${Configuration.PublicSettings.pdfApiUrl}${user.loginName}`;
        // this.wjPdfViewer.viewMode = ViewMode.Continuous;
    }

    public pageRendered() {
        if (!this._init) {
            this.pdfComponent.pdfViewer.currentScaleValue = 'page-fit';
            this._init = true;
        }
    }
}
