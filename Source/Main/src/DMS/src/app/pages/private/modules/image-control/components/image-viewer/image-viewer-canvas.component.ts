import {
    Component,
    Input,
    Output,
    EventEmitter,
    OnChanges,
    SimpleChanges,
    OnInit,
    ChangeDetectorRef,
    ElementRef,
} from '@angular/core';
import 'fabric';
import { ToolbarConfigModel } from '../../models/toolbar.model';
import { Uti } from '../../../../../../utilities';
import { UploadFileMode } from '../../../../../../app.constants';
declare const fabric: any;

@Component({
    selector: 'image-viewer-canvas',
    templateUrl: './image-viewer-canvas.component.html',
    styleUrls: ['./image-viewer-canvas.component.scss'],
})
export class ImageViewerCanvasComponent implements OnInit, OnChanges {
    //Input
    @Input() isRotation: boolean;
    @Input() isShowRotateMode: boolean;
    @Input() hideToolbar: boolean;

    @Input() imageSrc: string;
    @Input() isBase64: boolean;
    @Input() width: number;
    @Input() height: number;

    @Input() widgetId: string;
    @Input() idData: string;
    @Input() IdDocumentContainerScans: string;

    @Input() viewAllPage: boolean;
    @Input() toolbarConfig: ToolbarConfigModel = {};
    @Input() isSelectDocType: boolean;

    //Output
    @Output() toggleViewImageInfo: EventEmitter<any> = new EventEmitter();
    @Output() toggleRotationMode: EventEmitter<any> = new EventEmitter();
    @Output() unGroup: EventEmitter<any> = new EventEmitter();
    @Output() openDialogEmail: EventEmitter<any> = new EventEmitter();

    public pages: any = [];
    public pageIndex = 0;
    public isLoading: boolean;
    public isEmpty: boolean;

    public canvas: any;
    public angle = 0;
    public zoomNumber = 1;
    private angleChanged = 0;

    constructor(private ref: ChangeDetectorRef, private element: ElementRef) {}

    ngOnInit() {
        setTimeout(() => {
            this.initCanvas();
        }, 1);
    }

    ngOnChanges(changes: SimpleChanges) {
        if (changes['IdDocumentContainerScans']) {
            this.zoomNumber = 1;
        }
        if (changes['imageSrc']) {
            this.isEmpty = false;
            if (!this.imageSrc && this.canvas) {
                this.canvas.getObjects().forEach((element) => {
                    this.canvas.remove(element);
                });
                this.canvas.renderAll();
                return;
            }
            this.ref.reattach();
            setTimeout(() => {
                this.initImage();
            }, 100);
        }

        if (changes['width'] || changes['height']) {
            if (this.canvas) {
                this.canvas.setWidth(this.width);
                this.canvas.setHeight(this.height);
            }
        }
    }

    public viewActualSize() {
        const canvas = this.canvas;
        if (!canvas) return;
        // this.canvas.view
        const imageCanvas = canvas.getObjects('image')[0];
        if (imageCanvas) canvas.centerObject(imageCanvas);
        canvas.setViewportTransform([1, 0, 0, 1, 0, 0]);
        canvas.renderAll();
    }

    public onToggleViewImageInfo(event: any) {
        this.toggleViewImageInfo.emit(event);
    }

    public rotateImage = (degrees: number) => {
        if (this.isShowRotateMode && !this.isRotation) {
            this.saveRotation({});
            return;
        }
        this.canvas.getObjects().forEach((obj: any) => {
            // const { left, top } = this.parseLocationByAngle(this.canvas, obj.left, obj.top, degrees);
            // obj.top = top;
            // obj.left = left;
            obj.angle += degrees; //rotate each object buy the same angle
            this.angleChanged = (this.angleChanged + degrees) % 360;
            this.angle = obj.angle % 360;
            this.canvas.centerObject(obj);
            obj.setCoords();
        });

        this.canvas.renderAll();
    };

    public exportImage() {
        const image = this.canvas.getObjects()[0];
        if (!image) return '';
        this.angle = 0;
        return image.toDataURL();
    }

    public unGroupImage() {
        this.unGroup.emit();
    }

    public saveRotation(event: any) {
        if (!event.isSave && this.isRotation) {
            this.rotateImage(-this.angle);
        }
        this.setRotateControlForImage(!this.isRotation && !this.isBase64);
        this.angleChanged = 0;
        this.toggleRotationMode.emit({ ...event, angle: this.angle });
    }

    private parseLocationByAngle = (canvasV: any, left: number, top: number, degrees: number) => {
        if (!canvasV) return { left, top, degrees };
        const canvasCenter = new fabric.Point(canvasV.getWidth() / 2, canvasV.getHeight() / 2);
        const radians = fabric.util.degreesToRadians(degrees);
        const objectOrigin = new fabric.Point(left, top);
        const new_loc = fabric.util.rotatePoint(objectOrigin, canvasCenter, radians);
        return { left: new_loc.x, top: new_loc.y, degrees };
    };

    public zoomImage(zoomNumber: number) {
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
    }

    public share() {
        this.openDialogEmail.emit();
    }

    private removeAllObject() {
        if (!this.canvas) return;
        this.canvas.setViewportTransform([1, 0, 0, 1, 0, 0]);
        this.canvas.getObjects().forEach((element) => {
            this.canvas.remove(element);
        });
        this.canvas.renderAll();
    }

    public initImage() {
        if (!this.imageSrc || !this.canvas) {
            return;
        }
        const imgElement = new Image();
        // imgElement.style = 'box-shadow: 0 2px 10px 0 rgba(6,255,254,0.5)';
        this.isLoading = true;
        this.ref.detectChanges();
        const src = this.imageSrc;
        imgElement.onload = function () {
            if (src !== this.imageSrc) {
                return;
            }
            const canvasWidth = this.width - 50;
            const canvasHeight = this.height - 50;
            const scaleW = canvasWidth / imgElement.width;
            const scaleH = canvasHeight / imgElement.height;
            const isVerticalImage = imgElement.width < imgElement.height; // chieu doc
            const currentScale = isVerticalImage ? scaleH : scaleW;
            const imageCanvas = new fabric.Image(imgElement, {
                centeredScaling: true,
                hasBorders: false,
                scaleX: currentScale,
                scaleY: currentScale,
                transparentCorners: false,
                shadow: new fabric.Shadow({
                    color: 'rgba(16, 27, 79, 0.1)',
                    offsetX: 0,
                    offsetY: 4,
                    blur: 10,
                }),
            });
            // '0 4px 10px 0 '
            imageCanvas.setControlsVisibility({
                bl: false,
                br: false,
                mb: false,
                ml: false,
                mr: false,
                mt: false,
                tl: false,
                tr: false,
                mtr: !this.isShowRotateMode,
            });
            this.removeAllObject();
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
        if (this.isBase64) {
            imgElement.src = this.imageSrc;
        } else {
            //imgElement.src = `/api/FileManager/GetFile?name=${this.imageSrc}&mode=6&t=${new Date().getTime()}`;
            imgElement.src = Uti.getFileUrl(this.imageSrc, UploadFileMode.Path) + `&t=${new Date().getTime()}`;
        }
    }

    private initCanvas() {
        const id = this.widgetId + this.idData + 'viewer';
        const element = document.getElementById(id);
        if (!element) return;
        if (!this.width) {
            try {
                this.width = $(this.element.nativeElement).parent().width();
                this.height = $(this.element.nativeElement).parent().height();
            } catch (error) {
                this.width = 0;
                this.height = 0;
            }
        }
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

        canvas.on(
            'object:rotated',
            function rotate(e: any) {
                this.angle = e.target.angle;
            }.bind(this),
        );

        this.canvas = canvas;
    }

    private setRotateControlForImage(isShow?: boolean) {
        this.canvas.getObjects('image').forEach((imageCanvas) => {
            imageCanvas.setControlsVisibility({
                bl: false,
                br: false,
                mb: false,
                ml: false,
                mr: false,
                mt: false,
                tl: false,
                tr: false,
                mtr: !this.isShowRotateMode || isShow,
            });
            imageCanvas.setCoords();
            this.canvas.centerObject(imageCanvas);
            this.canvas.renderAll();
        });
    }
}
