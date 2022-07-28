import { Component, OnInit, ElementRef, Input, ChangeDetectorRef, ViewChild } from '@angular/core';
import { ScanningActions, CustomAction, LayoutInfoActions } from '@app/state-management/store/actions';
import { WidgetDetail } from '@app/models';
import { Subscription } from 'rxjs';
import { ReducerManagerDispatcher, Store } from '@ngrx/store';
import { AppState } from '@app/state-management/store';

import * as localForage from 'localforage';
import * as printJS from 'print-js';

import cloneDeep from 'lodash-es/cloneDeep';
import pick from 'lodash-es/pick';
import filter from 'lodash-es/filter';
import orderBy from 'lodash-es/orderBy';
import findIndex from 'lodash-es/findIndex';
import find from 'lodash-es/find';
import uniqBy from 'lodash-es/uniqBy';
import remove from 'lodash-es/remove';
import map from 'lodash-es/map';

import { ImageThumbnailModel } from '../../../image-control/models/image.model';
import { ImageViewerCanvasComponent } from '../../../image-control/components/image-viewer';
import { guid } from '../../../image-control/components/image-ocr/image-ocr.util';
import { ToolbarConfigModel } from '../../../image-control/models/toolbar.model';
import { BaseComponent } from '@app/pages/private/base';
import { Router } from '@angular/router';
import { ScanningProcess } from '../../services';
import { AppSelectors } from '@app/state-management/store/reducer/app';
import { takeUntil } from 'rxjs/operators';
import { DocumentTreeModel } from '@app/models/administration-document/document-tree.payload.model';
import { DocumentTypeEnum } from '@app/app.constants';

const headerToolbar = 45;
let timeoutNote;

const ENUM_SCAN_MODE = 'scanMode';

@Component({
    selector: 'scanning-image-preview',
    templateUrl: './image-preview.component.html',
    styleUrls: ['./image-preview.component.scss'],
})
export class ScanningImagePreviewComponent extends BaseComponent implements OnInit {
    @ViewChild(ImageViewerCanvasComponent) imageViewer: ImageViewerCanvasComponent;
    @Input() tabID: string;
    @Input() dataSource: WidgetDetail;
    // public
    public readonly DocumentTypeEnum = DocumentTypeEnum;
    public pages: ImageThumbnailModel[] = [];
    public imageSrc: any = '';
    public pageIndex = 0;
    public totalPage = 0;
    public isLoading: boolean;
    public viewAllPage: boolean;
    public isRotation: boolean;
    public isSendToCapture = true;
    public toolbarConfig: ToolbarConfigModel = {
        isShowPrinter: false,
    };

    public widgetId: any;
    public idData: any;
    public IdDocumentContainerScans: any;

    public width: number = 0;
    public height: number = 0;
    public imageNote = '';
    public isShowPreview: boolean;
    public selectedFolder: DocumentTreeModel;

    // private
    private imageSelected: ImageThumbnailModel;

    private imageSelectSubscription: Subscription;
    private subscribeDeleteAllImage: Subscription;
    private subscribeToggleScan: Subscription;
    private subscribeWidthChange: Subscription;

    constructor(
        protected router: Router,
        private dispatcher: ReducerManagerDispatcher,
        private store: Store<AppState>,
        private element: ElementRef,
        private scanningAction: ScanningActions,
        private ref: ChangeDetectorRef,
        private layoutInfoAction: LayoutInfoActions,
        private scanningProcess: ScanningProcess,
        private appSelectors: AppSelectors
    ) {
        super(router);
        this.registerSubscriptions();
    }

    ngOnInit() {
        this.parseConfigToWidthHeight();
        this.scanningProcess.TabIDScanningImagePreview = this.tabID;
        this.widgetId = this.dataSource.id;
    }

    public scanMore() {
        this.scanningProcess.TabIDScanningImagePreview_IsFullScreen = $(this.element.nativeElement).closest('widget-module-info').parent().hasClass('maximize-widget-mode');

        this.store.dispatch(this.layoutInfoAction.toggleScanSplitArea(false, true, this.ofModule));
        if (this.scanningProcess.TabIDScanningImagePreview_IsFullScreen) {
            //minimize the current (ImagePreview)
            this.store.dispatch(this.layoutInfoAction.requestToggleFullScreen(this.ofModule, { tabID: this.tabID, isMaximized: false }));
            this.requestToggleFullScreen(this.tabID, false);
        }

        if (this.scanningProcess.TabIDScanningConfiguration_IsFullScreen) {
            //maximize Configuration
            this.requestToggleFullScreen(this.scanningProcess.TabIDScanningConfiguration, true);
        }
    }

    private requestToggleFullScreen(tabID, isMaximized) {
        this.store.dispatch(this.layoutInfoAction.requestToggleFullScreen(this.ofModule, { tabID: tabID, isMaximized: isMaximized }));
    }

    public print() {
        printJS({ base64: true, printable: map(this.pages, 'Base64'), type: 'image' });
    }

    public onChangeIsSendToCapture() {
        this.store.dispatch(this.scanningAction.toggleIsSendToCapture(!this.isSendToCapture));
        this.isSendToCapture = !this.isSendToCapture;
    }

    public changeImageNote(value: string) {
        this.imageNote = value;

        if (timeoutNote) clearTimeout(timeoutNote);
        timeoutNote = setTimeout(() => {
            this.updateImageNoteForPages(value);
        }, 500);
    }

    public changePageNumber(event: any) {
        let pageNum = this.pageIndex;
        if (typeof event === 'number') {
            pageNum += event;
        } else {
            pageNum = parseInt(event.target.value, 10);
        }
        pageNum = Math.min(Math.max(pageNum, 0), this.totalPage - 1);
        this.getImageByPage(pageNum);
    }

    public selectPage(pageNum: number) {
        this.pageIndex = pageNum - 1;
        this.getImageByPage(pageNum - 1);
    }

    public getImageByPage(pageNumber: number) {
        const imageSelected: ImageThumbnailModel = this.pages[pageNumber];
        if (!imageSelected) return;
        this.imageSelected = imageSelected;
        this.imageSrc = imageSelected.Base64;
        this.idData = imageSelected.IdDocumentContainerOcr;
        this.IdDocumentContainerScans = imageSelected.IdDocumentContainerScans;

        this.pageIndex = pageNumber;
        this.ref.detectChanges();
    }

    public onOrderPage(pageList: any) {
        // const indexSelected = findIndex(pageList, 'isSelected');
        this.pages = pageList;
        // this.pageNumber = indexSelected + 1;
    }

    public unGroup() {
        if (this.totalPage === 1) return;

        const pages = cloneDeep(this.pages);
        pages[0].NumberOfImages = 1;
        const rq = [];
        for (let index = 0; index < pages.length; index++) {
            if (index === 0) {
                continue;
            }
            const element: ImageThumbnailModel = pages[index];
            element.IdDocumentContainerScans = guid();
            element.PageNr = 1;
            element.isSelected = false;
            element.NumberOfImages = 1;
            rq.push(element);
        }

        this.pages = [pages[0]];
        this.totalPage = 1;
        this.store.dispatch(this.scanningAction.addImage(rq));
        setTimeout(() => {
            this.store.dispatch(this.scanningAction.updateImage({ images: pages }));
        }, 100);
        if (this.pageIndex !== 0) {
            this.pageIndex = 0;
            this.getImageByPage(0);
        }
        this.store.dispatch(this.scanningAction.toggleViewAllPage(false));
        this.viewAllPage = false;
    }

    public onRemovePage(event: any) {
        remove(this.pages, ['IdDocumentContainerScans', event.item.IdDocumentContainerScans]);
        event.item.IsOriginal = true;
        event.item.PageNr = 1;
        this.totalPage = this.pages.length;
        // this.store.dispatch(this.scanningAction.updateImage({ images: [event.item] }));
        this.store.dispatch(this.scanningAction.addImage([event.item]));

        this.ref.detectChanges();
    }

    public toggleViewImageInfo(event: any) {
        this.store.dispatch(this.scanningAction.toggleViewAllPage(!this.viewAllPage));
        if (!this.viewAllPage) {
            this.viewAllPage = true;
            return;
        }
        let pageList = cloneDeep(this.pages);
        const originalItem = find(pageList, 'IsOriginal');
        if (event.isSave) {
            const images = [];
            for (const index in pageList) {
                if (pageList.hasOwnProperty(index)) {
                    const page = pageList[index];
                    page.IsOriginal = true;
                    page.IdDocumentContainerScans = this.IdDocumentContainerScans;
                    page.ImageNote = this.imageNote;
                    page.NumberOfImages = pageList.length;
                    if (originalItem) {
                        page.DoctypeSelected = originalItem.DoctypeSelected;
                        page.Color = originalItem.Color;
                    }
                    pageList[index] = page;
                    images.push(
                        pick(page, [
                            'IdDocumentContainerScans',
                            'Base64',
                            'IdDocumentContainerOcr',
                            'PageNr',
                            'IsOriginal',
                            'ImageNote',
                            'NumberOfImages',
                            'Color',
                            'DoctypeSelected',
                        ]),
                    );
                }
            }
            images[0].isSelected = true;
            this.store.dispatch(this.scanningAction.updateImage({ images }));
        } else {
            const imageReturn = filter(pageList, ['IsOriginal', false]);
            pageList = filter(pageList, 'IsOriginal');
            pageList = orderBy(pageList, ['PageNr'], ['asc']);
            for (const key in imageReturn) {
                if (imageReturn.hasOwnProperty(key)) {
                    const element = imageReturn[key];
                    element.PageNr = 1;
                    element.IsOriginal = true;
                    element.isSelected = false;
                    imageReturn[key] = element;
                }
            }
            this.store.dispatch(this.scanningAction.addImage(uniqBy(imageReturn, 'IdDocumentContainerScans')));
        }
        let indexSelected = findIndex(pageList, 'isSelected');
        if (indexSelected === -1) {
            indexSelected = 0;
        }
        this.pages = pageList;
        this.totalPage = pageList.length;
        this.viewAllPage = false;
    }

    public toggleRotationMode(event: any) {
        if (!this.isRotation) {
            this.isRotation = true;
            return;
        }
        if (event.isSave) {
            var img = new Image();
            img.src = this.imageSrc;
            this.imageSrc = null;
            this.isLoading = true;
            this.ref.detectChanges();
            var canvas = document.createElement('canvas');
            var ctx = canvas.getContext('2d');
            img.onload = function () {
                const width = img.width;
                const height = img.height;

                const angle = event.angle;
                let totalRotate = angle % 360;
                if (totalRotate < 0) {
                    totalRotate = 360 + totalRotate;
                }
                if (totalRotate === 90) {
                    canvas.width = height;
                    canvas.height = width;
                    ctx.translate(canvas.width, canvas.height);
                    ctx.rotate((Math.PI / 180) * angle);
                    ctx.drawImage(img, -width, 0, width, height);
                } else if (totalRotate === 180) {
                    canvas.width = width; //width
                    canvas.height = height; //Any height
                    ctx.translate(canvas.width, canvas.height); //let's translate
                    ctx.rotate((Math.PI / 180) * angle); //increment the angle and rotate the image
                    ctx.drawImage(img, 0, 0, width, height); //draw the image ;)
                } else if (totalRotate === 270) {
                    canvas.width = height; //width
                    canvas.height = width; //Any height
                    ctx.translate(width, height); //let's translate
                    ctx.rotate((Math.PI / 180) * angle); //increment the angle and rotate the image
                    ctx.drawImage(img, height - width, -width, width, height); //draw the image ;)
                }

                const imageBase64 = canvas.toDataURL('image/jpeg', 1.0);
                this.imageSelected.Base64 = imageBase64;
                this.imageSrc = imageBase64;
                this.isLoading = false;
                this.store.dispatch(this.scanningAction.updateImage({ images: [this.imageSelected] }));
                if (event.callback) event.callback();
            }.bind(this);
            img.onerror = function () {
                this.isLoading = false;
            };
        } else {
            this.imageViewer.initImage();
            if (event.callback) event.callback();
        }
        this.isRotation = false;
    }

    public onDropImageThumbnails($event) {
        const { data, getAllPage, callback } = $event.dragData;
        if (!data) return;
        const pageList: ImageThumbnailModel[] = this.pages;
        let currentLength = this.pages.length;
        const pages = getAllPage(data);
        for (const key in pages) {
            if (pages.hasOwnProperty(key)) {
                const element = pages[key];
                currentLength += 1;
                pageList.push({
                    Base64: element.Base64,
                    IdDocumentContainerScans: element.IdDocumentContainerScans,
                    IdDocumentContainerOcr: element.IdDocumentContainerOcr,
                    Color: element.Color,
                    DoctypeSelected: element.DoctypeSelected,
                    NumberOfImages: element.NumberOfImages,
                    PageNr: currentLength,
                    IsOriginal: false,
                });
                this.totalPage += 1;
            }
        }
        if (callback) callback({ item: data });
        this.pages = pageList;
    }

    private updateImageNoteForPages(note: string) {
        const pages = cloneDeep(this.pages);
        for (const key in pages) {
            if (pages.hasOwnProperty(key)) {
                const page = pages[key];
                page.ImageNote = note;
            }
        }
        this.pages = pages;
        this.store.dispatch(this.scanningAction.updateImage({ images: pages }));
        // this.update
    }

    private registerSubscriptions() {
        this.imageSelectSubscription = this.dispatcher
            .filter((action: CustomAction) => {
                return action.type === ScanningActions.SCANNING_SELECT_DOCUMENT;
            })
            .subscribe((action: CustomAction) => {
                const callback = action.payload.callback;
                const forceUpdate = action.payload.forceUpdate;

                if (this.viewAllPage && !forceUpdate) {
                    if (callback) callback(true);
                    return;
                }

                this.pages = cloneDeep(<ImageThumbnailModel[]>action.payload.images);
                this.totalPage = this.pages.length;
                if (forceUpdate) {
                    this.viewAllPage = false;
                }
                this.imageNote = this.pages[0].ImageNote || '';
                setTimeout(() => {
                    this.getImageByPage(0);
                    if (callback) callback();
                }, 100);
            });

        this.subscribeDeleteAllImage = this.dispatcher
            .filter((action: CustomAction) => {
                return action.type === ScanningActions.SCANNING_ACTION_DELETE_IMAGE;
            })
            .subscribe((action: CustomAction) => {
                this.resetState();
            });

        this.subscribeToggleScan = this.dispatcher
            .filter((action: CustomAction) => {
                return (
                    action.type === LayoutInfoActions.TOGGLE_SCAN_SPLIT_AREA &&
                    action.module.idSettingsGUI == this.ofModule.idSettingsGUI
                );
            })
            .subscribe((action: CustomAction) => {
                const payload = action.payload as { isShowPreview: boolean; isShowConfiguration: boolean };
                this.isShowPreview = payload.isShowPreview;
                if (!this.isShowPreview) return;
                setTimeout(() => {
                    this.parseConfigToWidthHeight(true);
                }, 10);
            });

        this.subscribeWidthChange = this.dispatcher
            .filter((action: CustomAction) => {
                return action.type === LayoutInfoActions.RESIZE_SPLITTER;
            })
            .subscribe((action: CustomAction) => {
                if (!this.isShowPreview) return;
                setTimeout(() => {
                    this.parseConfigToWidthHeight();
                }, 10);
            });

        this.appSelectors.folder$
            .pipe(
                takeUntil(this.getUnsubscriberNotifier())
            )
            .subscribe((selectedFolder: DocumentTreeModel) => {
                this.selectedFolder = selectedFolder;
                this.isSendToCapture = this.selectedFolder?.idDocumentType === DocumentTypeEnum.INVOICE_APPROVAL || this.isSendToCapture;
            });
    }

    private parseConfigToWidthHeight(reset?: boolean) {
        try {
            const width = $(this.element.nativeElement).parent().width();
            this.width = width;
            this.height = $(this.element.nativeElement).parent().height();
            if (reset) {
                this.imageViewer.initImage();
            }
        } catch (error) {
            this.width = 0;
            this.height = 0;
        }
    }

    private resetState() {
        this.imageSrc = '';
        this.totalPage = 0;
        this.pageIndex = 0;
        this.pages = [];
    }
}
