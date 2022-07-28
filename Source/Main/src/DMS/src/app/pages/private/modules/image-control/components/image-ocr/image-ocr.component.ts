import {
    Component,
    OnInit,
    Input,
    Output,
    EventEmitter,
    OnDestroy,
    OnChanges,
    ChangeDetectorRef,
    AfterViewInit,
} from '@angular/core';
import 'fabric';
import {
    parseOcrData,
    getWidthHeightAfterRotate,
    getTextFromRect,
    getTextByPoint,
    guid,
    getWordsInline,
    createRect,
    getPositionOfWord,
} from './image-ocr.util';

import cloneDeep from 'lodash-es/cloneDeep';
import pick from 'lodash-es/pick';
import { CoordinateColorEnum } from '../../models/image.model';
import { FieldFormOnFocusModel } from '@app/state-management/store/models/administration-document/field-form-on-focus.model.payload';
import { ToolbarConfigModel } from '../../models/toolbar.model';
import { LocalStorageKey, UploadFileMode } from '@app/app.constants';
import { DocumentImageOcrService } from '../../services';
import { Uti } from '../../../../../../utilities';

// import { Uti } from '@app/utilities';

declare const fabric: any;

@Component({
    selector: 'image-ocr',
    styleUrls: ['./image-ocr.component.scss'],
    templateUrl: './image-ocr.component.html',
})
export class ImageOcrComponent implements OnInit, OnDestroy, OnChanges, AfterViewInit {
    canvas: any;
    optionCanvas: Object = {
        hoverCursor: 'pointer',
        selection: false,
        backgroundColor: 'transparent',
        fireRightClick: true, // <-- enable firing of right click events
        stopContextMenu: true, // <--  prevent context menu from showing
    };

    perfectScrollbarConfig: any = {};

    /////////////////

    @Input() hiddenToolbar: boolean;
    @Input() noDrawing: boolean;
    @Input() readonly: boolean;
    @Input() width: number;
    @Input() height: number;
    @Input() widgetId: string;
    @Input() imageSrc: string;
    @Input() idData: string;
    @Input() OCRJson: string;
    @Input() fieldFocus: FieldFormOnFocusModel;
    @Input() totalPage: number;
    @Input() currentPage: number;
    @Input() viewAllPage: boolean;
    @Input() IdDocumentContainerScans: any;
    @Input() IdDocument: any;
    @Input() words: Array<any>;
    @Input() documentProps: any;
    @Input() isShowTodo: boolean;
    @Input() isSelectDocType: boolean;
    @Input() JsonQRCode: any;

    private _toolbarConfig: ToolbarConfigModel;
    @Input() set toolbarConfig(data: ToolbarConfigModel) {
        this._toolbarConfig = {
            isShowDownload: true,
            isShowKeyword: true,
            isShowMoveMode: true,
            isShowPrinter: true,
            isShowSendMail: false,
            isShowShare: true,
            isShowTodo: false,
            isShowClean: true,

            isShowOCRManually: true,
            ...data,
        };
    }

    get toolbarConfig() {
        return this._toolbarConfig;
    }

    // Output
    @Output() captureData: EventEmitter<any> = new EventEmitter();

    @Output() deleteRect: EventEmitter<any> = new EventEmitter();
    @Output() changePageNumber: EventEmitter<any> = new EventEmitter();
    @Output() toggleViewImageInfo: EventEmitter<any> = new EventEmitter();
    @Output() toggleRotationMode: EventEmitter<any> = new EventEmitter();
    @Output() openDialogEmail: EventEmitter<any> = new EventEmitter();
    @Output() toggleKeyword: EventEmitter<any> = new EventEmitter();
    @Output() toggleTodo: EventEmitter<any> = new EventEmitter();
    @Output() runOCR: EventEmitter<any> = new EventEmitter();
    @Output() fullscreen: EventEmitter<any> = new EventEmitter();

    // Variable
    private ocrData: any;
    public angle: number;

    //toolbar
    public viewAllRect: boolean;
    // public isMoveImage: boolean;
    public isRotateMode: boolean;
    //end
    public drawRect: boolean;

    private KeyCode_Delete = 46;
    public actionType = 0;
    public isLoading = false;
    public isEmpty = false;
    public imageWidth = 0;
    public imageHeight = 0;
    public zoomNumber = 1;

    // move
    private dragOffset;
    private isMouseDown;
    public dialogBoxDiv;
    private initZoom = 1;
    //
    private _currentImageSrc: any;

    constructor(private ref: ChangeDetectorRef, private documentService: DocumentImageOcrService) {}

    ngOnInit() {
        this.perfectScrollbarConfig = {
            suppressScrollX: false,
            suppressScrollY: false,
        };

        this.isMouseDown = false;
        this.dragOffset = [0, 0];
        this.ref.reattach();
    }

    ngAfterViewInit() {
        this.dialogBoxDiv = document.getElementById(this.widgetId + '_image-ocr__wrapper');
    }

    ngOnDestroy() {
        this.resetState();
    }

    ngOnChanges(changes) {
        if (changes['imageSrc']) {
            this.initImageCanvas(!!changes['IdDocumentContainerScans'] && !!this.IdDocumentContainerScans);
        }
        if (changes['OCRJson'] && !changes['imageSrc']) {
            if (this.OCRJson && this.canvas) {
                this._initDrawRectangle();
            } else {
                this.drawRect = false;
            }
            this.changeSelectable(this.canvas, 'crosshair', true, 'pointer');
        }
    }

    public initImageCanvas = (isChangeDoc?: boolean) => {
        this.angle = 0;
        this.drawRect = false;
        this.initZoom = 1;
        if (isChangeDoc) {
            this.zoomNumber = 1;
        }
        this.ocrData = [];
        this.isEmpty = false;
        if (this.OCRJson) {
            this.ocrData = parseOcrData(this.OCRJson || '');
            this.drawRect = true;
        }
        setTimeout(() => {
            this.removeChildren();
        }, 1);
    };

    public removeRect = (id: string) => {
        const canvasObject = this.canvas.getObjects().filter((item) => {
            return item.id === id;
        });
        this.canvas.remove(canvasObject[0]);
    };

    private _initDrawRectangle(count?: number) {
        if (count >= 5) return;
        if (!this.canvas) {
            setTimeout(() => {
                this._initDrawRectangle(count || 0 + 1);
            }, 2000);
            return;
        }
        this.ocrData = parseOcrData(this.OCRJson || '');
        this.drawRect = true;
        this.drawRectangle(this);
    }

    public addData(data: any) {
        this.captureData.emit({ ...data });
    }

    public removeAllObject(callback?: any) {
        if (this.canvas) {
            const objectsCanvas = this.canvas.getObjects();
            for (const key in objectsCanvas) {
                if (objectsCanvas.hasOwnProperty(key)) {
                    const element = objectsCanvas[key];
                    this.canvas.remove(element);
                }
            }
            this.canvas.renderAll();
        }
        if (callback) {
            callback();
        }
    }

    public viewActualSize(isSkipZoom?: boolean) {
        const canvas = this.canvas;
        if (!canvas) return;
        const zoomNumber = canvas.getZoom();
        const zoom = this.initZoom / zoomNumber;
        if (!isSkipZoom) {
            this.zoomImage(zoom);
        }
        this.dialogBoxDiv.style.left = 0;
        this.dialogBoxDiv.style.top = 0;
        this.dialogBoxDiv.style.transform = '';
        this.dragOffset = [0, 0];
    }

    public runOCRManually() {
        this.runOCR.emit();
        // this.documentService
        //     .changeAngle([
        //         {
        //             ...this.documentProps,
        //             OcrId: this.idData,
        //             Rotate: 0,
        //             IdDocumentContainerScans: this.IdDocumentContainerScans,
        //         },
        //     ])
        //     .subscribe(
        //         (response: any) => {
        //             this.initImageCanvas();
        //         },
        //         error => {},
        //     );
    }

    public onToggleKeyword() {
        this.toggleKeyword.emit();
    }

    public onToggleTodo() {
        this.toggleTodo.emit();
    }

    public toggleViewRect() {
        // this.changeViewRect.emit(!this.viewAllRect);
    }

    public onToggleViewImageInfo(event: any) {
        this.toggleViewImageInfo.emit(event);
    }

    public rotateImage = (rotateNumber: number) => {
        this.toggleRotationMode.emit();
        return;
    };

    public rotateCanvas = (rotateNumber: number) => {
        const canvas = this.canvas;
        if (!canvas.backgroundImage) return;
        // this.rotateAllObject(rotateNumber);

        // canvas.backgroundImage.rotate(this.angle + rotateNumber);
        this.angle = Math.abs(360 + this.angle + rotateNumber) % 360;
        this.dialogBoxDiv.style.transform = `rotate(${this.angle}deg)`;
        this.canvas.renderAll();
    };

    public zoomImage = (zoomNumber: number) => {
        const canvas = this.canvas;
        let zoom = canvas.getZoom() * zoomNumber;
        if (zoom * 2 <= this.initZoom) {
            zoom = this.initZoom / 2;
            zoomNumber = zoom / canvas.getZoom();
        } else if (zoom / 3 >= this.initZoom) {
            zoom = this.initZoom * 3;
            zoomNumber = zoom / canvas.getZoom();
        }
        const canvasHeight = canvas.getHeight() * zoomNumber;
        const canvasWidth = canvas.getWidth() * zoomNumber;

        this.imageHeight = canvasHeight;
        this.imageWidth = canvasWidth;
        this.zoomNumber = zoom;
        canvas.setWidth(canvasWidth);
        canvas.setHeight(canvasHeight);
        canvas.setZoom(zoom);
        canvas.renderAll();
    };

    public onChangePageNumber(event) {
        this.changePageNumber.emit(event);
    }

    public openSharing() {
        this.openDialogEmail.emit();
    }

    public fullscreenAction(event) {
        this.fullscreen.emit(event);
    }

    // PRIVATE

    private resetState() {
        this.angle = 0;
        this.initZoom = 1;
        this.ocrData = [];
        this.imageSrc = '';
        this.removeChildren(true);
    }

    public removeChildren(reset?: boolean) {
        if (this.canvas) {
            this.canvas.getObjects('rect').forEach((rect: any) => {
                this.canvas.remove(rect);
            });
            this.canvas.renderAll();
        }
        this.canvas = null;
        const element = document.getElementById(this.widgetId);
        if (!element) {
            return;
        }
        element.innerHTML = `<canvas id='${this.widgetId + this.idData}__canvas' ></canvas>`;
        if (reset) {
            this._currentImageSrc = '';
            return;
        }
        this.dialogBoxDiv.style.left = 0;
        this.dialogBoxDiv.style.top = 0;
        this.dragOffset = [0, 0];
        setTimeout(() => {
            this.initImage();
        }, 10);
    }

    private setLoading(loading) {
        const ele = document.getElementById('document-viewer-loading');
        if (!ele) return;
        if (loading) ele.style.display = 'unset';
        else ele.style.display = 'none';
    }

    private initImage() {
        if (!this.imageSrc) {
            this.isEmpty = true;
            return;
        }
        if (!!this._currentImageSrc && this._currentImageSrc === this.imageSrc) return;
        this._currentImageSrc = this.imageSrc;
        this.setLoading(true);

        const imgElement = new Image();
        const idCanvas = this.widgetId + this.idData + '__canvas';
        imgElement.onload = function () {
            const canvasWidth = this.width;
            const canvasHeight = this.height;
            const scaleW = canvasWidth / imgElement.width;
            const scaleH = canvasHeight / imgElement.height;
            const isVerticalImage = imgElement.width < imgElement.height; // chieu doc
            this.initCanvas(
                document.getElementById(idCanvas),
                imgElement,
                {
                    width: canvasWidth,
                    height: canvasHeight,
                },
                { scaleW, scaleH, isVerticalImage },
            );
            this.setLoading(false);
            this.ref.detectChanges();
        }.bind(this);
        imgElement.onerror = function (err) {
            console.log('imgElement err', err, this.imageSrc);
            this.isLoading = false;
            this.isEmpty = true;
            this.ref.detectChanges();
            this.setLoading(false);
        }.bind(this);
        imgElement.src = this.imageSrc;
    }

    private initCanvas(element: any, imgElement: any, options: Object, scale?: any) {
        const _option: Object = { ...this.optionCanvas, ...options };
        const canvas = new fabric.Canvas(element, _option);
        if (imgElement) {
            this.initBackground(canvas, imgElement);
        }

        this.canvas = canvas;
        if (!this.readonly && this.drawRect) {
            this.drawRectangle(this);
        }
        if (scale) {
            this.initScale(scale);
        }
        this.initHighlight(canvas);
        this.viewActualSize(this.zoomNumber !== 1);
    }

    public initHighlight(canvas, searchValue?: any) {
        const searchText = searchValue || localStorage.getItem(LocalStorageKey.LocalStorageGSCaptureSearchText);
        if (!searchText || !this.ocrData) return;
        const searchList = searchText.split('+');
        for (const index in searchList) {
            if (searchList.hasOwnProperty(index)) {
                const word = searchList[index];
                if (!word) continue;
                const position = getPositionOfWord(this.ocrData, word);
                for (const key in position) {
                    if (position.hasOwnProperty(key)) {
                        const element = position[key];
                        const left = element.position.p1.x;
                        const top = element.position.p1.y;
                        const width = element.position.p2.x - left;
                        const height = element.position.p4.y - top;

                        createRect(
                            canvas,
                            {
                                left,
                                top,
                                width,
                                height,
                                name: 'highlight',
                                strokeWidth: 0,
                                selectable: false,
                                fill: 'yellow',
                                hoverCursor: 'default',
                                opacity: 0.5,
                            },
                            canvas,
                        );
                    }
                }
            }
        }
    }

    private initScale(scale: any) {
        const currentScale = scale.isVerticalImage ? scale.scaleH : scale.scaleW;
        this.initZoom = currentScale;
        if (this.zoomNumber === 1) {
            this.zoomImage(currentScale);
        } else {
            this.zoomImage(this.zoomNumber);
        }
    }

    private initBackground(canvas: any, imgElement: any) {
        const f_img = new fabric.Image(imgElement);

        canvas.setBackgroundImage(f_img, canvas.renderAll.bind(canvas));
        canvas.setDimensions(
            {
                width: imgElement.width,
                height: imgElement.height,
            },
            {
                backstoreOnly: true,
            },
        );
    }

    private drawRectangle(_: any) {
        if (this.noDrawing) return;
        let rect, isDown, origX, origY;
        // isCtrl
        const canvas = this.removeEvents();

        canvas.on('mouse:down', function (o: any) {
            if (o.target) {
                return;
            }
            const pointer = canvas.getPointer(o.e);
            isDown = true;
            // isCtrl = o.e.ctrlKey;
            origX = pointer.x;
            origY = pointer.y;
            const randomId: string = guid();
            rect = createRect(
                canvas,
                {
                    ..._.fieldFocus,
                    left: origX,
                    top: origY,
                    id: randomId,
                    width: pointer.x - origX,
                    height: pointer.y - origY,
                },
                _,
                true,
            );
        });

        canvas.on('mouse:dblclick', (option: any) => {
            const pointer = canvas.getPointer(option.e);
            if (option.e.ctrlKey) {
                _.captureByLine(pointer, false);
                return;
            }
            _.captureByPoint(pointer, rect);
        });

        canvas.on('mouse:move', function (o) {
            if (!isDown) {
                return;
            }
            const pointer = canvas.getPointer(o.e);
            const pointX = Math.max(pointer.x);
            const pointY = Math.max(pointer.y);
            // isCtrl = isCtrl ? o.e.ctrlKey : false;
            if (origX > pointer.x) {
                rect.set({
                    left: pointX,
                });
            }
            if (origY > pointer.y) {
                rect.set({
                    top: pointY,
                });
            }

            rect.set({
                width: Math.abs(origX - pointX),
            });
            rect.set({
                height: Math.abs(origY - pointY),
            });

            canvas.renderAll();
        });

        canvas.on('mouse:up', function (o) {
            isDown = false;
            // isCtrl = isCtrl ? o.e.ctrlKey : false;

            if (!rect) {
                return;
            }
            if (!_.fieldFocus) {
                canvas.remove(rect);
                return;
            }
            if (_.validateRect(rect)) {
                // const cloneRect: any = getWidthHeightAfterRotate(cloneDeep(rect), Math.abs(_.angle));
                // const newPoint = _.parseLocationByAngle(canvas, cloneRect.left, cloneRect.top, -_.angle);
                // cloneRect.left = newPoint.left;
                // cloneRect.top = newPoint.top;

                const data = getTextFromRect(rect, _.ocrData);
                if (data.Value) {
                    rect.Value = data.Value;
                    rect.isDrawing = true;
                    _.addData({ ...data, isInsert: false, isDrawing: true });
                } else {
                    canvas.remove(rect);
                }
                // } else if (isCtrl) {
                //     const pointer = canvas.getPointer(o.e);
                //     _.captureByLine(pointer, false);
            }
            rect.done = true;
            rect.stroke = _.viewAllRect ? CoordinateColorEnum.selected : CoordinateColorEnum.drawing;
            rect.dirty = true;
            rect.setCoords();
            // isCtrl = false;
            _.canvas.renderAll();
        });

        this.changeSelectable(canvas, 'crosshair', false);
    }

    private validateRect = (rect: any) => {
        if (!rect) {
            return false;
        }
        if (!rect.done && rect.height && rect.width) {
            return true;
        }
        return false;
    };

    private parseLocationByAngle = (canvasV: any, left: number, top: number, degrees: number) => {
        if (!canvasV) return { left, top, degrees };
        const canvasCenter = new fabric.Point(canvasV.getWidth() / 2, canvasV.getHeight() / 2);
        const radians = fabric.util.degreesToRadians(degrees);
        const objectOrigin = new fabric.Point(left, top);
        const new_loc = fabric.util.rotatePoint(objectOrigin, canvasCenter, radians);
        return { left: new_loc.x, top: new_loc.y, degrees };
    };

    private rotateAllObject = (degrees: number) => {
        this.canvas.getObjects('rect').forEach((obj: any) => {
            const { left, top } = this.parseLocationByAngle(this.canvas, obj.left, obj.top, degrees);
            obj.top = top;
            obj.left = left;
            obj.angle += degrees; //rotate each object buy the same angle

            obj.setCoords();
        });

        this.canvas.renderAll();
    };

    private captureByPoint(pointer: any, rect: any) {
        const { left, top } = this.parseLocationByAngle(this.canvas, pointer.x, pointer.y, 360 - this.angle);
        pointer.x = left;
        pointer.y = top;
        const data = getTextByPoint(pointer, this.ocrData);
        if (data && data.Value) {
            const randomId: string = guid();

            const leftX = data.Position.p1.x;
            const topY = data.Position.p1.y;
            const width = data.Position.p2.x - leftX;
            const height = data.Position.p4.y - topY;
            rect = createRect(
                this.canvas,
                {
                    // ...this.optionRect,
                    ...this.fieldFocus,
                    left: leftX,
                    top: topY,
                    id: randomId,
                    width,
                    height,
                    Value: data.Value,
                },
                this,
            );

            this.addData({
                ...data,
                WordsCoordinates: [pick(rect, ['left', 'top', 'width', 'height', 'Value', 'fieldOnFocus', 'id'])],
                isInsert: true,
                isDblClick: true,
            });
        } else this.canvas.remove(rect);
    }

    private changeSelectable(canvas: any, defaultCursor: string, value: boolean, objCursor?: string) {
        if (!canvas) return;
        canvas.forEachObject(function (obj: any) {
            obj.selectable = value;
            obj.hoverCursor = objCursor || defaultCursor;
        });

        canvas.defaultCursor = defaultCursor;

        canvas.renderAll();
    }

    private captureByLine(pointer, isCtrlClick) {
        const { left, top } = this.parseLocationByAngle(this.canvas, pointer.x, pointer.y, 360 - this.angle);
        pointer.x = left;
        pointer.y = top;
        const response = getWordsInline(this, pointer);
        if (response) this.captureData.emit({ ...response, isInsert: isCtrlClick });
    }

    // MOVE

    mousedown($event) {
        if ($event.button !== 2) return;
        // if (!this.isMoveImage) return;

        this.changeSelectable(this.canvas, 'grabbing', false);
        this.isMouseDown = true;
        this.dragOffset = [this.dialogBoxDiv.offsetLeft - $event.clientX, this.dialogBoxDiv.offsetTop - $event.clientY];
    }

    mouseup($event) {
        if ($event.button !== 2) return;
        // if (!this.isMoveImage) return;

        this.isMouseDown = false;
        this.changeCanvasForDrawRectangle();
    }

    mousemove($event) {
        if ($event.buttons !== 2) return;
        if (!this.isMouseDown) return;
        // !this.isMoveImage ||

        $event.preventDefault();
        const mousePosition = {
            x: $event.clientX,
            y: $event.clientY,
        };

        this.dialogBoxDiv.style.left = mousePosition.x + this.dragOffset[0] + 'px';
        this.dialogBoxDiv.style.top = mousePosition.y + this.dragOffset[1] + 'px';
    }

    mouseleave($event) {
        if ($event.buttons !== 2) return;
        if (!this.isMouseDown) return;
        // !this.isMoveImage ||

        this.isMouseDown = false;
        this.changeSelectable(this.canvas, 'grab', false);

        this.changeCanvasForDrawRectangle();
    }

    private removeEvents() {
        const canvas = this.canvas;
        canvas.off('mouse:down');
        canvas.off('mouse:up');
        canvas.off('mouse:move');
        canvas.off('mouse:dblclick');

        canvas.isDrawingMode = false;
        canvas.selection = false;

        this.changeSelectable(this.canvas, 'grab', false);

        return canvas;
    }

    private changeCanvasForDrawRectangle() {
        if (!this.readonly && this.drawRect) {
            this.drawRectangle(this);
            this.changeSelectable(this.canvas, 'crosshair', true, 'pointer');
        } else {
            this.changeSelectable(this.canvas, 'default', true);
        }
    }
    // public onToggleMove(event) {
    //     this.isMoveImage = event;
    //     if (event) {
    //         this.removeEvents();
    //         this.changeSelectable(this.canvas, 'grab', false);
    //     } else {
    //         if (!this.readonly && this.drawRect) {
    //             this.drawRectangle(this);
    //             this.changeSelectable(this.canvas, 'crosshair', true, 'pointer');
    //         } else {
    //             this.changeSelectable(this.canvas, 'default', true);
    //         }
    //     }
    // }
}
