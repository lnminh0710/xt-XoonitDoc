import {
    ChangeDetectorRef,
    Component,
    ElementRef,
    Input,
    OnChanges,
    SimpleChanges,
    TemplateRef,
    ViewChild,
} from '@angular/core';
import { Router } from '@angular/router';
import { IconNames } from '@app/app-icon-registry.service';
import { LocalStorageKey } from '@app/app.constants';
import { BaseComponent } from '@app/pages/private/base';
import { PdfViewerComponent } from 'ng2-pdf-viewer';
import { Subject } from 'rxjs';
import { takeUntil, filter, debounceTime, distinctUntilChanged } from 'rxjs/operators';

@Component({
    selector: 'pdf-attachment-viewer',
    templateUrl: './pdf-attachment-viewer.component.html',
    styleUrls: ['./pdf-attachment-viewer.component.scss'],
})
export class PdfAttachmentViewerComponent extends BaseComponent implements OnChanges {
    zoom: number = 1;
    rotate: number = 0;
    totalPage: number = 1;
    openSearchBar = false;
    svgPrev = IconNames.PREV_ARROW;
    @ViewChild('pdf') pdfComponent: PdfViewerComponent;
    @ViewChild('inputSearchBar') inputSearchBar: ElementRef;

    searchPdfValue: any;
    private _pdfSearchChanged = new Subject<string>();
    private _src: string;
    totalFound: number;
    currentFound: number = 1;
    @Input() set src(sc: string) {
        this._src = sc;
        this.currentPage = 1;
    }
    get src(): string {
        return this._src;
    }
    @Input() currentPage: number = 1;
    @Input() initialZoom;

    constructor(protected router: Router, private cdRef: ChangeDetectorRef) {
        super(router);
        this._pdfSearchChanged
            .pipe(debounceTime(400), distinctUntilChanged(), takeUntil(this.getUnsubscriberNotifier()))
            .subscribe((val) => {
                this.searchPdfValue = val;
                this.totalFound = 0;
                this.setLoading(true);
                if (this.pdfComponent)
                    this.pdfComponent.pdfFindController.executeCommand('find', {
                        caseSensitive: false,
                        phraseSearch: true,
                        highlightAll: true,
                        findPrevious: undefined,
                        findCurrentPage: true,
                        query: val,
                    });
            });
    }

    ngOnChanges(changes: SimpleChanges): void {
        if (changes['src']) this.setLoading(true);
    }

    public loadPdfComplete(event: any) {
        this.totalPage = event.numPages;
        this.cdRef.detectChanges();
    }

    public pageRendered() {
        this.setLoading(false);
    }

    public changeSearchPdf(value: any) {
        this._pdfSearchChanged.next(value);
    }

    public onOpenSearchBar(open: boolean) {
        this.openSearchBar = open;
        if (open) {
            setTimeout(() => {
                this.inputSearchBar?.nativeElement?.focus();
            });
        }
    }

    public afterLoadComplete(pdf: any) {
        if (this.initialZoom) this.zoom = this.initialZoom;
        this.pdfComponent.pdfViewer.eventBus.on('updatefindmatchescount', (data) => {
            this.setLoading(false);
            this.currentFound = data.matchesCount.current;
            this.totalFound = data.matchesCount.total;
        });
        this.pdfComponent.pdfViewer.eventBus.on('updatefindcontrolstate', (data) => {
            if (data.state === 1 || data.state === 0) this.setLoading(false);
        });
        const highlight = localStorage.getItem(LocalStorageKey.LocalStorageGSCaptureSearchText);
        this.openSearchBar = false;

        if (highlight && highlight !== '*') {
            this.searchPdfValue = highlight;
            this.onOpenSearchBar(true);
            this._pdfSearchChanged.next(highlight);
            this.currentFound = 1;
            this.totalFound = 0;
            if (this.searchPdfValue === highlight) {
                this.setLoading(true);
                setTimeout(() => {
                    this.pdfComponent.pdfFindController.executeCommand('find', {
                        caseSensitive: false,
                        phraseSearch: true,
                        highlightAll: true,
                        findPrevious: undefined,
                        findCurrentPage: true,
                        query: highlight,
                    });
                }, 1000);
            }
        }
    }

    public findNext(): void {
        if (this.currentFound === this.totalFound) {
            this.currentFound = 1;
        } else this.currentFound += 1;
        this.pdfComponent.pdfFindController.executeCommand('findagain', {
            caseSensitive: false,
            phraseSearch: true,
            highlightAll: true,
            findPrevious: undefined,
            query: this.searchPdfValue,
        });
    }

    public findPrevious(): void {
        if (this.currentFound === 1) {
            this.currentFound = this.totalFound;
        } else this.currentFound -= 1;
        this.pdfComponent.pdfFindController.executeCommand('findagain', {
            caseSensitive: false,
            phraseSearch: true,
            highlightAll: true,
            findPrevious: true,
            query: this.searchPdfValue,
        });
    }

    public setLoading(loading) {
        const ele = document.getElementById('document-viewer-loading');
        if (ele) {
            if (loading) ele.style.display = 'unset';
            else ele.style.display = 'none';
        }
    }
}
