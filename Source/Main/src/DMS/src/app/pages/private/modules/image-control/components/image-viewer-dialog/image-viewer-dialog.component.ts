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

import orderBy from 'lodash-es/orderBy';
import filter from 'lodash-es/filter';

import { DocumentImageOcrService } from '../../services';

import { ImageThumbnailModel } from '../../models/image.model';
import { ToasterService } from 'angular2-toaster';
import { MessageModal, UploadFileMode } from '@app/app.constants';
import { Uti } from '../../../../../../utilities';

declare const fabric: any;

@Component({
    selector: 'image-viewer-dialog',
    templateUrl: './image-viewer-dialog.component.html',
    styleUrls: ['./image-viewer-dialog.component.scss'],
})
export class ImageViewerDialogComponent implements OnInit, OnChanges {
    //Input
    @Input() isShowDialog: boolean;
    @Input() isUnCallAPI: boolean;

    @Input() image: ImageThumbnailModel;
    @Input() pages: ImageThumbnailModel[] = [];
    @Input() isRotation: boolean;
    @Input() isBase64: boolean;
    @Input() isScanning: boolean;

    @Output() onClose: EventEmitter<any> = new EventEmitter();

    public imageSrc: any = '';
    public pageIndex = 0;
    public isLoading: boolean;
    public isEmpty: boolean;
    public imageSelected: any = {};
    public dialogWidth = 1300;
    public dialogHeight = 1000;
    public isMaximizable = false;
    public dialogClass = 'prime-dialog ui-dialog-flat';
    public isShowSendMail = false;

    private canvas: any;
    private angle = 0;
    private zoomNumber = 1;
    private width = 1252;
    private height = 900;

    constructor(
        private documentService: DocumentImageOcrService,
        private ref: ChangeDetectorRef,
        private toastrService: ToasterService,
    ) { }

    ngOnInit() {
        this.initCanvas();
    }

    ngOnChanges(changes: SimpleChanges) {
        if (changes['image'] && this.isShowDialog) {
            this.isEmpty = false;
            this.ref.reattach();
            // this.parseConfigToWidthHeight();
            setTimeout(() => {
                this.getDocumentById();
            }, 1);
        }
    }

    close() {
        this.onClose.emit();
    }

    public downloadDocument() {
        if (!this.image.IdDocumentContainerScans) return;

        var a = document.createElement('a');
        a.href = '/api/DocumentContainer/GetFile?IdDocumentContainerScans=' + this.image.IdDocumentContainerScans;
        a.download = 'result';
        document.body.appendChild(a);
        a.click();
        setTimeout(() => {
            a.remove();
        }, 1000);
    }

    public share() {
        // this.openSharing.emit();
    }

    public print() {
        if (!this.image.IdDocumentContainerScans) return;
        this.isLoading = true;
        this.documentService.getPdfFile(this.image.IdDocumentContainerScans).subscribe(
            (response: any) => {
                const blobUrl = URL.createObjectURL(response);
                const iframe = document.createElement('iframe');
                iframe.style.display = 'none';
                iframe.src = blobUrl;
                document.body.appendChild(iframe);
                this.isLoading = false;
                this.ref.detectChanges();
                iframe.contentWindow.print();
            },
            (err) => {
                this.isLoading = false;
                this.ref.detectChanges();
            },
        );
    }

    public sendMail() {
        if (!this.image.IdDocumentContainerScans) return;
        this.isLoading = true;
        this.documentService
            .sendMailDocument({
                IdDocumentContainerScans: this.image.IdDocumentContainerScans,
            })
            .subscribe(
                (response: any) => {
                    this.isLoading = false;
                    this.toastrService.pop(MessageModal.MessageType.success, 'System', 'Mail sent');
                    this.ref.detectChanges();
                },
                (err) => {
                    this.isLoading = false;
                    this.toastrService.pop(MessageModal.MessageType.error, 'System', err);
                    this.ref.detectChanges();
                },
            );
    }

    public onChangeSize = () => {
        if (this.isMaximizable) {
            this.dialogWidth = 1300;
            this.dialogHeight = 1000;
            this.dialogClass = this.dialogClass.replace(' fullscreen', '');
        } else {
            // const
            const ele = document.getElementsByClassName('ui-widget-overlay ui-dialog-mask')[0];
            if (!ele) return;
            const { width, height } = ele.getBoundingClientRect();
            this.dialogWidth = width;
            this.dialogHeight = height - 60;
            this.dialogClass += ' fullscreen';
        }
        const canvasWidth = this.dialogWidth - 50;
        const canvasHeight = this.dialogHeight - 100;
        this.canvas.setWidth(canvasWidth);
        this.canvas.setHeight(canvasHeight);
        const imageElement = this.canvas.getObjects()[0];
        if (imageElement) {
            const scaleW = (canvasWidth - 20) / imageElement.width;
            const scaleH = (canvasHeight - 20) / imageElement.height;
            const isVerticalImage = imageElement.width < imageElement.height; // chieu doc
            const currentscale = isVerticalImage ? scaleH : scaleW;
            imageElement.scaleX = currentscale;
            imageElement.scaleY = currentscale;
            this.canvas.renderAll();
        }
        this.canvas.centerObject(imageElement);
        this.viewActualSize();
        this.isMaximizable = !this.isMaximizable;
    };

    public viewActualSize() {
        this.canvas.setViewportTransform([1, 0, 0, 1, 0, 0]);
        const imageCanvas = this.canvas.getObjects('image')[0];
        if (imageCanvas) this.canvas.centerObject(imageCanvas);
    }

    public onZoomImage(zoomNumber: number) {
        const canvas = this.canvas;
        let zoom;
        zoom = canvas.getZoom() * zoomNumber;

        if (zoom >= 2.5) {
            zoom = 2.5;
        }
        if (zoom <= 0.2) {
            zoom = 0.2;
        }

        canvas.zoomToPoint(new fabric.Point(canvas.getWidth() / 2, canvas.getHeight() / 2), zoom);
        this.zoomNumber = zoom;
    }

    public onRotateImage(rotateNumber: number) {
        const canvas = this.canvas;
        canvas.getObjects().forEach((obj: any) => {
            obj.angle += rotateNumber; //rotate each object buy the same angle
            obj.setCoords();
            canvas.centerObject(obj);
        });
        canvas.renderAll();
    }

    public getImageByPage(pageNumber: number) {
        const imageSelected = this.pages[pageNumber];
        if (!imageSelected) return;
        this.imageSelected = imageSelected;
        if (this.isBase64) {
            this.imageSrc = imageSelected.Base64;
        } else {
            //this.imageSrc = `/api/FileManager/GetFile?name=${imageSelected.ScannedPath}/${imageSelected.FileName || imageSelected.DocumentName}&mode=6`;
            const name = `${imageSelected.ScannedPath}/${imageSelected.FileName || imageSelected.DocumentName}`;
            this.imageSrc = Uti.getFileUrl(name, UploadFileMode.Path);
        }
        this.pageIndex = pageNumber;
        this.removeAllObject();
        this.initImage();
        this.ref.reattach();
        this.ref.detectChanges();
    }

    private removeAllObject() {
        if (!this.canvas) return;
        this.canvas.setViewportTransform([1, 0, 0, 1, 0, 0]);
        this.canvas.getObjects().forEach((element) => {
            this.canvas.remove(element);
        });
        this.canvas.renderAll();
    }

    private initImage() {
        if (!this.imageSrc || !this.canvas) {
            return;
        }
        const imgElement = new Image();
        // imgElement.style = 'box-shadow: 0 2px 10px 0 rgba(6,255,254,0.5)';
        this.isLoading = true;
        this.ref.detectChanges();
        imgElement.onload = function () {
            const canvasWidth = this.width - 20;
            const canvasHeight = this.height - 20;
            const scaleW = canvasWidth / imgElement.width;
            const scaleH = canvasHeight / imgElement.height;
            const isVerticalImage = imgElement.width < imgElement.height; // chieu doc
            const currentscale = isVerticalImage ? scaleH : scaleW;
            const imageCanvas = new fabric.Image(imgElement, {
                centeredScaling: true,
                hasBorders: false,
                scaleX: currentscale,
                scaleY: currentscale,
                transparentCorners: false,
                cornerStyle: 'box-shadow: 0 2px 10px 0 rgba(6,255,254,0.5);',
                stroke: '0 2px 10px 0 rgba(6,255,254,0.5)',
                shadow: new fabric.Shadow({
                    color: 'rgba(16, 27, 79, 0.1)',
                    offsetX: 0,
                    offsetY: 4,
                    blur: 10,
                }),
            });
            imageCanvas.setControlsVisibility({
                bl: false,
                br: false,
                mb: false,
                ml: false,
                mr: false,
                mt: false,
                tl: false,
                tr: false,
            });
            this.canvas.add(imageCanvas);
            this.canvas.centerObject(imageCanvas);
            this.canvas.setActiveObject(imageCanvas);
            this.canvas.zoomToPoint(new fabric.Point(this.width / 2, this.height / 2), this.zoomNumber);
            this.canvas.renderAll();
            this.isLoading = false;
            this.ref.detectChanges();
        }.bind(this);
        imgElement.onerror = function (err) {
            this.isEmpty = true;
            this.isLoading = false;
            this.ref.detectChanges();
        }.bind(this);
        imgElement.src = this.imageSrc;
    }

    private initCanvas() {
        const element = document.getElementById('image-viewer-dialog__canvas');
        if (!element) return;
        const canvas = new fabric.Canvas(element, {
            width: this.width,
            height: this.height,
        });

        canvas.on(
            'mouse:wheel',
            function (opt) {
                if (!opt.e.ctrlKey) return;

                const delta = opt.e.deltaY;
                let zoom;
                if (delta < 0) {
                    zoom = canvas.getZoom() * 1.2;
                } else {
                    zoom = canvas.getZoom() / 1.2;
                }

                if (zoom >= 2.5) {
                    zoom = 2.5;
                }
                if (zoom <= 0.2) {
                    zoom = 0.2;
                }

                canvas.zoomToPoint(new fabric.Point(opt.pointer.x, opt.pointer.y), zoom);
                this.zoomNumber = zoom;
                opt.e.preventDefault();
                opt.e.stopPropagation();
            }.bind(this),
        );

        canvas.on('object:rotated', (e) => {
            console.log('object:rotated', e.target.angle);
        });

        this.canvas = canvas;
    }

    private getDocumentById() {
        if (this.isScanning) {
            this.getImageByPage(0);
            return;
        }
        this.documentService.getDocumentById(this.image.IdDocumentContainerScans).subscribe((response) => {
            if (!response.length) {
                this.isShowDialog = false;
                return;
            }
            this.pages = orderBy(response, ['PageNr'], ['asc']);
            if (this.isUnCallAPI) {
                this.pages = filter(this.pages, (_p) => _p.IdDocumentContainerOcr == this.image.IdDocumentContainerOcr);
            }
            this.getImageByPage(0);
        });
    }
}
