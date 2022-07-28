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
import { debounceTime, filter, map, takeUntil } from 'rxjs/operators';
import { PdfAttachmentViewerComponent } from './pdf-attachment-viewer';
import { ImageAttachmentViewerComponent } from './image-attachment-viewer';
import { AttachmentToolbarComponent } from './attachment-toolbar';
import { Configuration, UploadFileMode } from '@app/app.constants';
import { Uti } from '@app/utilities';
import { AttachmentType, AttachmentViewer } from './models';
import { Subject } from 'rxjs';
import { get, replace } from 'lodash-es';

const headerToolbar = 50;

@Component({
    selector: 'widget-attachment-viewer',
    templateUrl: 'widget-attachment-viewer.component.html',
    styleUrls: ['widget-attachment-viewer.component.scss'],
})
export class WidgetAttachmentViewer extends BaseComponent implements OnInit, AfterViewInit {
    readonly AttachmentType = AttachmentType;

    width: number = 0;
    height: number = 0;
    type: AttachmentType;
    extension: string;
    name: string;
    src: string;
    attachmentPath: string;
    isShowEmailBox: boolean;
    destroy$: Subject<void> = new Subject<void>();

    @Output() onMaximizeWidget = new EventEmitter<any>();

    @ViewChild('toolbar') toolbar: AttachmentToolbarComponent;
    @ViewChild('image') image: ImageAttachmentViewerComponent;
    @ViewChild('pdf') pdf: PdfAttachmentViewerComponent;
    showXoonitMode = 0;
    switchXoonitMode = false;
    htmlSrc: string;

    constructor(protected router: Router, private element: ElementRef, private dispatcher: ReducerManagerDispatcher) {
        super(router);
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
                if (!payload) {
                    this.src = '';
                    this.type = null;
                    return;
                }
                this.name = payload.fileName;
                this.extension = Uti.getFileExtension(payload.fileName);
                this.type = AttachmentViewer.getAttachmentType(this.extension);
                // if (this.type === AttachmentType.OFFICE || this.type === AttachmentType.HTML) {
                //     let scannedPath = replace(
                //         payload.scannedPath,
                //         '\\\\file.xena.local\\MyDMS\\' + Configuration.PublicSettings.publicFolder,
                //         '',
                //     );
                //     scannedPath = `${scannedPath}/${payload.fileName}`;
                //     this.attachmentPath = scannedPath.replace(/\\/g, '/');
                //     this.src = window.location.origin + '/files' + this.attachmentPath;
                //     // this.src = 'https://xoonit.xoontec.vn/files' + this.attachmentPath;
                //     if (this.extension.match(/(doc|docx)/) || this.extension.match(/(ppt|pptx)/)) {
                //         this.showXoonitMode = 1;
                //         const attachmentPath = `${payload.scannedPath}\\${payload.fileName}`;
                //         this.htmlSrc =
                //             window.location.origin + Uti.getFileUrl(`${attachmentPath}`, UploadFileMode.Path);
                //         this.htmlSrc = this.htmlSrc.replace(this.extension, 'pdf');
                //     } else if (this.extension.match(/(xls|xlsx)/)) {
                //         this.htmlSrc = this.src.replace(this.extension, 'html');
                //         this.showXoonitMode = 2;
                //     } else {
                //         this.showXoonitMode = 0;
                //     }
                // } else {
                //     this.attachmentPath = `${payload.scannedPath}\\${payload.fileName}`;
                //     this.src = location.origin + Uti.getFileUrl(`${this.attachmentPath}`, UploadFileMode.Path);
                // }
                if (this.type === AttachmentType.OFFICE || this.type === AttachmentType.HTML) {
                    this.attachmentPath = `${payload.scannedPath.replace(
                        Configuration.PublicSettings.importEmailFolder + '\\',
                        '',
                    )}/${payload.fileName}`;
                    this.src = Configuration.PublicSettings.importEmailFileUrl + '/' + this.attachmentPath;
                } else {
                    this.attachmentPath = `${payload.scannedPath}\\${payload.fileName}`;
                    this.src = location.origin + Uti.getFileUrl(`${this.attachmentPath}`, UploadFileMode.Path);
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
            loading.download = true;
            const a = document.createElement('a');
            a.href = location.origin + Uti.getFileUrl(`${this.attachmentPath}`, UploadFileMode.Path);
            a.download = this.name;
            document.body.appendChild(a);
            a.click();
            setTimeout(() => {
                loading.download = false;
                a.remove();
            }, 200);
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
            this.image.viewer.zoom(0.2, true);
        } else if (this.pdf) {
            this.pdf.zoom += 0.2;
        }
    }

    zoomOut($event) {
        if (this.image) {
            this.image.viewer.zoom(-0.2, true);
        } else if (this.pdf?.zoom > 0.25) {
            this.pdf.zoom += -0.2;
        }
    }

    rotate($event) {
        if (this.image) {
            this.image.viewer.rotate($event);
        } else if (this.pdf) {
            this.pdf.rotate += $event;
        }
    }

    viewActualSize() {
        if (this.image) {
            this.image.viewer.reset();
        } else if (this.pdf) {
            this.pdf.rotate = 0;
            this.pdf.zoom = 1;
        }
    }

    openSearch() {
        this.pdf.onOpenSearchBar(!this.pdf.openSearchBar);
    }

    public expandWidget(event) {
        this.onMaximizeWidget.emit({
            isMaximized: event,
        });
    }
}
