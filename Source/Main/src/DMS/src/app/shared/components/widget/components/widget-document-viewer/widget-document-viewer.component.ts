import {
    AfterViewInit,
    ChangeDetectionStrategy,
    Component,
    ElementRef,
    EventEmitter,
    OnInit,
    Output,
    ViewChild,
} from '@angular/core';
import { Router } from '@angular/router';
import { BaseComponent } from '@app/pages/private/base';
import {
    AdministrationDocumentActionNames,
    CustomAction,
    LayoutInfoActions,
} from '@app/state-management/store/actions';
import { ReducerManagerDispatcher } from '@ngrx/store';
import { debounceTime, distinctUntilChanged, filter, map, takeUntil } from 'rxjs/operators';
import { Configuration, LocalStorageKey, MenuModuleId, UploadFileMode } from '@app/app.constants';
import { Uti } from '@app/utilities';
import { Subject } from 'rxjs';
import { AttachmentToolbarComponent } from '../widget-attachment-viewer/attachment-toolbar';
import { ImageAttachmentViewerComponent } from '../widget-attachment-viewer/image-attachment-viewer';
import { PdfAttachmentViewerComponent } from '../widget-attachment-viewer/pdf-attachment-viewer';
import { AttachmentType, AttachmentViewer } from '../widget-attachment-viewer/models';
import { get, replace } from 'lodash-es';
import { DocumentImageOcrService } from '@app/pages/private/modules/image-control/services';
import { ImageOcrComponent } from '@app/pages/private/modules/image-control/components/image-ocr';
import { DownloadFileService } from '@app/services';

const headerToolbar = 50;

@Component({
    selector: 'widget-document-viewer',
    templateUrl: 'widget-document-viewer.component.html',
    styleUrls: ['widget-document-viewer.component.scss'],
})
export class WidgetDocumentViewer extends BaseComponent implements OnInit, AfterViewInit {
    readonly AttachmentType = AttachmentType;

    width: number = 0;
    height: number = 0;
    type: AttachmentType;
    extension: string;
    name: string;
    src: string;
    documentPath: string;
    isShowEmailBox: boolean;
    destroy$: Subject<void> = new Subject<void>();
    switchXoonitMode = true;

    @Output() onMaximizeWidget = new EventEmitter<any>();

    @ViewChild('inputSearchBar') inputSearchBar: ElementRef;
    @ViewChild('toolbar') toolbar: AttachmentToolbarComponent;
    @ViewChild('image') image: ImageOcrComponent;
    @ViewChild('pdf') pdf: PdfAttachmentViewerComponent;
    imageInfo: any;
    openSearchBar: any;
    searchValue: any;
    private _imgSearchChanged = new Subject<string>();
    htmlSrc: string;
    showXoonitMode = 0;
    hiddenSwitchMode: boolean;
    constructor(
        protected router: Router,
        private element: ElementRef,
        private dispatcher: ReducerManagerDispatcher,

        private _downloadFileService: DownloadFileService,
        private documentService: DocumentImageOcrService,
    ) {
        super(router);
        this._imgSearchChanged
            .pipe(debounceTime(400), distinctUntilChanged(), takeUntil(this.getUnsubscriberNotifier()))
            .subscribe((val) => {
                if (!this.image) return;
                this.image.canvas?.getObjects('rect').forEach((rect: any) => {
                    this.image.canvas.remove(rect);
                });
                this.searchValue = val;
                this.image.initHighlight(this.image.canvas, val);
            });
    }

    public changeSearchValue(value: any) {
        this._imgSearchChanged.next(value);
    }

    ngOnInit() {
        this.parseConfigToWidthHeight();
    }

    ngOnDestroy() {
        this.destroy$.next();
    }

    ngAfterViewInit() {
        this.dispatcher
            .pipe(
                filter((action: CustomAction) => {
                    return action.type === LayoutInfoActions.RESIZE_SPLITTER;
                }),
                takeUntil(this.destroy$),
            )
            .subscribe((action: CustomAction) => {
                setTimeout(() => {
                    this.parseConfigToWidthHeight();
                }, 10);
            });
        this.dispatcher
            .pipe(
                filter((action: CustomAction) => {
                    return action.type === AdministrationDocumentActionNames.GET_SELECTED_DOCUMENT;
                }),
                map((action: CustomAction) => action.payload),
                takeUntil(this.destroy$),
            )
            .subscribe((payload: any) => {
                // idDocumentContainerOcr, idDocumentContainerScans
                const highlight = localStorage.getItem(LocalStorageKey.LocalStorageGSCaptureSearchText);

                this.openSearchBar = !!highlight;
                this.switchXoonitMode = true;
                this.showXoonitMode = 0;
                this.hiddenSwitchMode = this.ofModule.idSettingsGUI === MenuModuleId.preissChild;
                if (!payload) {
                    this.src = '';
                    this.type = null;
                    return;
                }
                this.name = payload.fileName;
                this.extension = Uti.getFileExtension(payload.fileName);
                const type = AttachmentViewer.getAttachmentType(this.extension);
                this.documentPath = `${payload.scannedPath}\\${payload.fileName}`;

                if (type === AttachmentType.OFFICE || type === AttachmentType.HTML) {
                    const reg = new RegExp(`(.*?)${Configuration.PublicSettings.publicFolder}`, 'ig');
                    let scannedPath = payload.scannedPath.replace(reg, '');
                    scannedPath = `${scannedPath}\\${payload.fileName}`;
                    scannedPath = scannedPath.replace(/\\/g, '/');
                    this.src = Configuration.PublicSettings.publicFileURL + scannedPath;
                    // this.src = 'https://xoonit.xoontec.vn/files' + scannedPath;
                    if (this.extension.match(/(doc|docx)/i) || this.extension.match(/(ppt|pptx)/i)) {
                        this.showXoonitMode = 1;
                        this.htmlSrc =
                            window.location.origin + Uti.getFileUrl(`${this.documentPath}`, UploadFileMode.Path);
                        this.htmlSrc = this.htmlSrc.replace(this.extension, 'pdf');
                    } else if (this.extension.match(/(xls|xlsx|xlsm)/i)) {
                        this.htmlSrc = this.src.replace(this.extension, 'html');
                        this.showXoonitMode = 2;
                    } else {
                        this.showXoonitMode = 0;
                    }
                    this.type = type;
                } else {
                    if (type === AttachmentType.IMAGE) {
                        this.documentService
                            ?.getOCRJsonOfImage(payload.idDocumentContainerFiles)
                            .subscribe((response) => {
                                this.imageInfo = {
                                    OCRJson: get(response, [0, 'OCRJson']),
                                    IdDocumentContainerScans: payload.idDocumentContainerScans,
                                };
                                this.documentPath = `${payload.scannedPath}\\${payload.fileName}`;
                                this.src =
                                    location.origin + Uti.getFileUrl(`${this.documentPath}`, UploadFileMode.Path);
                                const searchText = localStorage.getItem(
                                    LocalStorageKey.LocalStorageGSCaptureSearchText,
                                );
                                this.type = type;
                                if (!!searchText && searchText !== '*') {
                                    this.changeSearchValue(searchText);
                                    this.openSearchBar = true;

                                    setTimeout(() => {
                                        this.inputSearchBar?.nativeElement?.focus();
                                    });
                                }
                            });
                        return;
                    }
                    this.src = location.origin + Uti.getFileUrl(`${this.documentPath}`, UploadFileMode.Path);
                    this.type = type;
                }
            });
    }

    private parseConfigToWidthHeight() {
        try {
            this.width = $(this.element.nativeElement).parent().width();
            this.height = $(this.element.nativeElement).parent().height() - headerToolbar;
        } catch (error) {
            this.width = 0;
            this.height = 0;
        }
    }

    share() {
        if (this.src) {
            this.isShowEmailBox = true;
        }
    }

    download({ loading }) {
        if (this.src) {
            const url = Uti.getFileUrl(this.documentPath, UploadFileMode.Path, this.name);
            this._downloadFileService.downloadFileWithIframe(url);
        }
    }

    print() {
        if (this.src) {
            this.toolbar.loading.print = true;
            const iframe = document.createElement('iframe');
            iframe.style.display = 'none';
            iframe.src = this.src;
            iframe.onload = () => {
                this.toolbar.loading.print = false;
            };
            document.body.appendChild(iframe);
            iframe.contentWindow.print();
        }
    }

    zoomIn($event) {
        if (this.image) {
            this.image.zoomImage(1.2);
        } else if (this.pdf) {
            this.pdf.zoom += 0.2;
        }
    }

    zoomOut($event) {
        if (this.image) {
            this.image.zoomImage(0.8);
        } else if (this.pdf?.zoom > 0.25) {
            this.pdf.zoom += -0.2;
        }
    }

    rotate($event) {
        if (this.image) {
            this.image.rotateCanvas($event);
        } else if (this.pdf) {
            this.pdf.rotate += $event;
        }
    }

    viewActualSize() {
        if (this.image) {
            this.image.viewActualSize();
        } else if (this.pdf) {
            this.pdf.rotate = 0;
            this.pdf.zoom = 1;
        }
    }

    openSearch() {
        if (this.image) {
            this.openSearchBar = !this.openSearchBar;

            setTimeout(() => {
                this.inputSearchBar?.nativeElement?.focus();
            });
        } else this.pdf.onOpenSearchBar(!this.pdf.openSearchBar);
    }

    public expandWidget(event) {
        this.onMaximizeWidget.emit({
            isMaximized: event,
        });
    }
}
