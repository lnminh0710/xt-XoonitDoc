import { ViewChild } from '@angular/core';
import { ElementRef } from '@angular/core';
import {
    Component,
    Input,
    Output,
    EventEmitter,
    OnChanges,
    SimpleChanges,
    OnInit,
    ChangeDetectorRef,
} from '@angular/core';
import 'fabric';

import get from 'lodash-es/get';

import { FileGroupType } from '@app/app.constants';
import { ToasterService } from 'angular2-toaster';
import { ImageViewerCanvasComponent } from '../../../image-control/components/image-viewer';

declare const fabric: any;

@Component({
    selector: 'file-viewer-dialog',
    templateUrl: './file-viewer-dialog.component.html',
    styleUrls: ['../../../image-control/styles/icon.scss', './file-viewer-dialog.component.scss'],
})
export class FileViewerDialogComponent implements OnChanges {
    @ViewChild('imageViewer') imageViewer: ImageViewerCanvasComponent;

    // Input
    @Input() isShowDialog: boolean;

    @Input() file: File;

    @Output() onClose: EventEmitter<any> = new EventEmitter();

    public FileGroupType = FileGroupType;
    public fileType: FileGroupType;
    public isNoSupport: boolean;

    public imageSrc: any = '';
    public isLoading: boolean;
    public dialogClass = 'xoonit-crystal-dialog ';

    // pdf
    public pageVariable = 1;
    public zoomVariable = 1;
    public rotateVariable = 0;
    public totalPage = 1;

    constructor(private ref: ChangeDetectorRef, private toasterService: ToasterService) {}

    ngOnChanges(changes: SimpleChanges) {
        if (changes['isShowDialog']) {
            if (this.isShowDialog) {
                this.isLoading = true;
                const reader = new FileReader();
                const fileType = this.file.type;

                if (fileType.includes('text')) {
                    reader.readAsText(this.file);
                } else if (fileType.includes('image') || fileType.includes('pdf')) {
                    reader.readAsDataURL(this.file);
                } else {
                    this.noSupport();
                    return;
                }

                reader.onload = function () {
                    this.imageSrc = reader.result;
                    this.viewFile();
                }.bind(this);

                reader.onerror = function (error) {
                    this.isLoading = false;
                    this.toasterService.pop('error', 'File viewer', 'Cant open file.' + error);
                    this.close();
                    this.ref.reattach();
                    this.ref.detectChanges();
                }.bind(this);
            } else {
                this.resetState();

                if (get(this, 'imageViewer.canvas')) {
                    this.removeAllObject();
                }
            }
        }
    }

    close() {
        this.onClose.emit();
    }

    public loadPdfComplete(event: any) {
        this.totalPage = event.numPages;
    }

    public viewActualSize() {
        if (this.fileType === FileGroupType.PDF) {
            this.zoomVariable = 1;
            this.rotateVariable = 0;
            return;
        }
        this.imageViewer.canvas.setViewportTransform([1, 0, 0, 1, 0, 0]);
    }

    public onZoomImage(zoomNumber: number) {
        if (this.fileType === FileGroupType.PDF) {
            let zoomValue: number = this.zoomVariable;
            if (zoomNumber > 1) {
                zoomValue += 0.2;
            } else {
                zoomValue -= 0.2;
            }
            this.zoomVariable = Math.max(Math.min(zoomValue, 2), 0.5);

            return;
        }
        const canvas = this.imageViewer.canvas;
        let zoom;
        zoom = canvas.getZoom() * zoomNumber;

        if (zoom >= 2.5) {
            zoom = 2.5;
        }
        if (zoom <= 0.2) {
            zoom = 0.2;
        }

        canvas.zoomToPoint(new fabric.Point(canvas.getWidth() / 2, canvas.getHeight() / 2), zoom);
    }

    public onRotateImage(rotateNumber: number) {
        if (this.fileType === FileGroupType.PDF) {
            this.rotateVariable += rotateNumber;
            return;
        }
        this.imageViewer.canvas.getObjects().forEach((obj: any) => {
            obj.angle += rotateNumber; // rotate each object buy the same angle
            obj.setCoords();
            this.imageViewer.canvas.centerObject(obj);
        });
        this.imageViewer.canvas.renderAll();
    }

    private viewFile() {
        const file = this.file;
        if (!file) return;
        if (file.type.includes('pdf')) {
            this.fileType = FileGroupType.PDF;
        } else if (file.type.includes('image')) {
            this.fileType = FileGroupType.IMAGE;
        } else if (file.type.includes('text')) {
            this.fileType = FileGroupType.TEXT;
        } else {
            this.noSupport();
        }

        this.isLoading = false;
        this.ref.detectChanges();
    }

    private resetState() {
        this.pageVariable = 1;
        this.totalPage = 1;
        this.zoomVariable = 1;
        this.rotateVariable = 0;
        this.imageSrc = '';
    }

    private noSupport() {
        this.toasterService.pop('warning', 'File viewer', 'No support this type.');
        this.close();
    }

    private removeAllObject() {
        this.imageViewer.canvas.setViewportTransform([1, 0, 0, 1, 0, 0]);
        this.imageViewer.canvas.clear();
        this.imageViewer.canvas.renderAll();
    }
}
