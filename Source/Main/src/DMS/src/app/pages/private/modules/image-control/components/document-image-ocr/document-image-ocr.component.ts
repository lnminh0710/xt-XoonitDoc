import {
    Component,
    EventEmitter,
    Output,
    Input,
    OnChanges,
    SimpleChanges,
    OnInit,
    ElementRef,
    ViewChild,
    OnDestroy,
    ChangeDetectorRef,
    HostListener,
    Optional,
    Host,
    SkipSelf,
    AfterViewInit,
} from '@angular/core';

import { WidgetDetail } from '@app/models';
import { NgGridItemConfig } from '@app/shared/components/grid-stack';
import { Store, ReducerManagerDispatcher } from '@ngrx/store';
import { AppState } from '@app/state-management/store';
import {
    ProcessDataActions,
    DocumentThumbnailActions,
    CustomAction,
    GlobalSearchActions,
    DocumentImageOCRActions,
} from '@app/state-management/store/actions';
import { ImageThumbnailModel, CoordinateColorEnum } from '../../models/image.model';

import remove from 'lodash-es/remove';
import map from 'lodash-es/map';
import replace from 'lodash-es/replace';
import cloneDeep from 'lodash-es/cloneDeep';
import findIndex from 'lodash-es/findIndex';
import find from 'lodash-es/find';
import filter from 'lodash-es/filter';
import orderBy from 'lodash-es/orderBy';
import intersectionBy from 'lodash-es/intersectionBy';
import omit from 'lodash-es/omit';
import get from 'lodash-es/get';
import shuffle from 'lodash-es/shuffle';
import includes from 'lodash-es/includes';

import { AdministrationDocumentSelectors } from '@app/state-management/store/reducer';
import {
    AdministrationDocumentActions,
    AdministrationDocumentActionNames,
} from '@app/state-management/store/actions/administration-document';
import { Subscription, Observable } from 'rxjs';
import { ImageOcrComponent } from '../image-ocr';
import { FieldFormOnFocusModel } from '@app/state-management/store/models/administration-document/field-form-on-focus.model.payload';

import { Uti, DocumentHelper } from '@app/utilities';
import { ExtractedDataFormModel } from '@app/models/administration-document/document-form/extracted-data-form.model';
import { createRect, guid, parseLocaleFromOCRData, convertDataOCR } from '../image-ocr/image-ocr.util';
import { DocumentImageOcrService } from '../../services';
import { ToasterService } from 'angular2-toaster';
import { MessageModal, LocalStorageKey, UploadFileMode } from '@app/app.constants';
import { BaseComponent, ModuleList } from '@app/pages/private/base';
import { Router } from '@angular/router';
import { ToolbarConfigModel } from '../../models/toolbar.model';
import { DocumentTreeModel } from '@app/models/administration-document/document-tree.payload.model';
import { colorCode } from './resource';
import { takeUntil, filter as filterObservable } from 'rxjs/operators';
import { DocumentManagementHandlerService } from '@app/pages/document-management/services/document-management-handler.service';
import { Actions, ofType } from '@ngrx/effects';
import { DataState } from '@app/state-management/store/models/administration-document/state/extracted-data-ocr.state.model';
import { DmsDashboardHandlerService } from '../../../mydm/services/dms-dashboard-handler.service';
import { DocumentContainerScanStateModel } from '@app/state-management/store/models/administration-document/state/document-container-scan.state.model';
import * as localForage from 'localforage';
import { InvoiceApprovalProcessingActions } from '@app/pages/invoice-approval-processing/invoice-approval-processing.statemanagement/invoice-approval-processing.actions';

import * as imageOCRReducer from '@app/state-management/store/reducer/image-ocr';

const headerToolbar = 90;
const KEYCODE_ARROW_LEFT = 37;
const KEYCODE_ARROW_UP = 38;
const KEYCODE_ARROW_RIGHT = 39;
const KEYCODE_ARROW_DOWN = 40;

const KEYCODE_PAGE_UP = 33;
const KEYCODE_PAGE_DOWN = 34;
const KEYWORD_IMAGE_VIEWER_STORAGE = 'imageViewerOCR_';
const KEYWORD_DATA_OCR_STORAGE = 'imageViewerOCRJson_';

@Component({
    selector: 'document-image-ocr',
    templateUrl: './document-image-ocr.component.html',
    styleUrls: ['./document-image-ocr.component.scss'],
    host: { '(contextmenu)': 'rightClicked($event)' },
    // changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DocumentImageOcrComponent extends BaseComponent implements OnInit, OnDestroy, AfterViewInit {
    @ViewChild(ImageOcrComponent) imageCanvas: ImageOcrComponent;

    @Input() dataSource: WidgetDetail;
    @Input() Id: any;
    @Input() readonly: any;

    @Input() gridItemConfig: NgGridItemConfig;
    @Input() showInDialog: boolean;

    @Output()
    dispatchData: EventEmitter<any> = new EventEmitter();
    private _destroy: boolean;

    @Output() onMaximizeWidget = new EventEmitter<any>();

    @HostListener('window:beforeunload') resetStore() {
        localStorage.setItem(LocalStorageKey.LocalStorageGSCaptureSearchText, '');
    }

    // Variable
    public pageNumber = 1;
    public totalPage = -1;
    public disabledPage: boolean;
    public documentImage: Array<any> = [];
    public pageList: Array<ImageThumbnailModel> = [];
    public viewAllPage: boolean;
    public words: Array<any> = [];
    public viewOnly: boolean;
    public rotationMode: boolean;

    public widgetId: string;
    public width: number;
    public height: number;
    public imageSrc: string;
    public documentType: string;
    public idData: string;
    public fieldFocus: FieldFormOnFocusModel = new FieldFormOnFocusModel();
    public isLoadImageDropping = false;
    public isInvoiceApproval: boolean;

    public imageInfo: any;

    public isShowSendMail: boolean;
    public isShowKeyword: boolean;
    public isShowTodo: boolean;

    public isModuleCapture: boolean;
    public toolbarConfig: ToolbarConfigModel = {
        isShowDownload: true,
        isShowPrinter: true,
        isShowSendMail: false,
        isShowShare: true,
        isShowEditMode: true,
    };
    public toolbarOCRConfig: ToolbarConfigModel = {
        isShowTodo: false,
        isShowKeyword: false,
    };
    private isChanged: boolean;
    private selectedDocumentFolderType: string;
    private colorDoc = [];
    private tempDataFromOCR: ExtractedDataFormModel[] = [];
    private _imageOCRLocale = 'en';

    private _imageLoading: any = [];

    private _ocrJSONMapping: any = {};
    private imageOCRState: Observable<any>;
    private imageOCRStateSubscription: Subscription;

    public documentProps = {
        IdMainDocument: null,
        IndexName: '',
    };

    public isDetailPage = false;

    public isSelectDocType = true;
    // subcription

    documentFieldFocusSubscription: Subscription;
    documentTodoSubscription: Subscription;
    documentDataSubscription: Subscription;
    subscribeDbData: Subscription;
    subscribeNoItem: Subscription;
    documentFolderSubscription: Subscription;

    constructor(
        protected router: Router,
        private dispatcher: ReducerManagerDispatcher,
        private store: Store<AppState>,
        private action$: Actions,
        private processDataActions: ProcessDataActions,
        private documentService: DocumentImageOcrService,
        private element: ElementRef,
        private thumbnailAction: DocumentThumbnailActions,
        private toasterService: ToasterService,
        private administrationDocumentSelectors: AdministrationDocumentSelectors,
        private administrationDocumentActions: AdministrationDocumentActions,
        private documentOCRActions: DocumentImageOCRActions,
        private ref: ChangeDetectorRef,
        private documentManagementHandlerService: DocumentManagementHandlerService,
        private dmsDashboardHandlerService: DmsDashboardHandlerService,
        private invoiceApprovalProcessingActions: InvoiceApprovalProcessingActions,
    ) {
        super(router);
        this.colorDoc = shuffle(colorCode);
    }

    ngOnInit() {
        const actions = JSON.parse(
            window.localStorage.getItem(
                LocalStorageKey.buildKey(LocalStorageKey.LocalStorageGSStepKey, Uti.defineBrowserTabId()),
            ),
        ) as CustomAction[];
        if (actions) {
            this.loadAttachmentFile(actions[0]);
        }

        this.registerSubscriptions();
        this.parseConfigToWidthHeight();

        document.addEventListener('keydown', this.eventKeyDown.bind(this));
        this.widgetId = Uti.guid();
        if (this.ofModule) {
            this.imageOCRState = this.store.select((state) =>
                imageOCRReducer.getImageOcrState(state, this.ofModule.moduleNameTrim),
            );
        }
        this.imageOCRStateSubscription = this.imageOCRState.subscribe((data: any) => {
            this._ocrJSONMapping = data.ocrJson;
            const currentData = get(this, ['_ocrJSONMapping', this.imageInfo?.IdDocumentContainerFiles, 'data']);
            if (currentData) {
                this.imageInfo.OCRJson = get(currentData, [0, 'OCRJson']);
                this.imageInfo.OCRText = get(currentData, [0, 'OCRText']);
                this.ref.detectChanges();
            }
        });

        if (!this.showInDialog) {
            this._removeDataInStorage();
            this.documentManagementHandlerService?.didDocumentContainerOcrComponentCreate(true);
            this.dmsDashboardHandlerService?.didDocumentContainerOcrComponentCreate(true);
        }
        if (this.readonly) {
            this.totalPage = 0;
            return;
        }
        setTimeout(() => {
            if (this.totalPage < 0) this.totalPage = 0;
        }, 5000);
    }

    ngAfterViewInit() {
        this.parseConfigToWidthHeight();
    }

    // ngOnChanges(changes: SimpleChanges) {
    //     if (changes && this.dataSource) {
    //         if (this.dataSource.contentDetail) {
    //             if (this.dataSource.contentDetail.data && this.dataSource.contentDetail.data.length > 0) {
    //                 this.isDetailPage = false;
    //                 this.initData(this.dataSource.contentDetail.data[0]);
    //             } else {
    //                 this.resetState();
    //             }
    //         }
    //     }
    // }

    ngOnDestroy() {
        this._destroy = true;
        this._cancelAllImageRequest();
        Uti.unsubscribe(this);
        this.resetState();
        document.removeEventListener('keydown', this.eventKeyDown.bind(this));
        super.onDestroy();
        this.documentManagementHandlerService?.didDocumentContainerOcrComponentCreate(false);
        this.dmsDashboardHandlerService?.didDocumentContainerOcrComponentCreate(false);
        if (this.showInDialog) return;
        this.store.dispatch(this.administrationDocumentActions.clearDocumentContainerOcr());
    }

    //PUBLIC
    public changePageNumber(event: any) {
        if (this.rotationMode) return;
        let pageNum = this.pageNumber;
        if (typeof event === 'number') {
            pageNum += event;
        } else {
            pageNum = parseInt(event.target.value, 10);
        }
        if (pageNum <= 0 || pageNum > this.totalPage) {
            return;
        }
        this.pageNumber = Math.min(Math.max(pageNum, 1), this.totalPage);
        this.isChanged = true;
        this.initImagePage();
    }

    public selectPage(pageNum: number) {
        this.pageNumber = pageNum;
        this.initImagePage();
    }

    public onCapture(event: any) {
        const rects = event.WordsCoordinates;
        if (!get(this.fieldFocus, 'fieldOnFocus')) {
            this.removeRects(rects);
            return;
        }

        // update to store here
        const item: any = {};

        item.Value = event.Value;
        item.WordsCoordinates = this.parseWordCoordinate(item.WordsCoordinates);
        item.WordsCoordinates.push(...rects);
        const wordSelection = get(Uti.getSelectionText(), 'text');
        this.setFormsToStore({
            Value: convertDataOCR(this.fieldFocus.fieldConfig, item.Value, this._imageOCRLocale),
            WordsCoordinates: item.WordsCoordinates,
            DataState: DataState.REPLACE,
            isDblClick: event.isDblClick,
            OriginalColumnName: this.fieldFocus.fieldOnFocus,
        });
        if (!wordSelection) {
            const removedRect = filter(this.words, ['Value', wordSelection]);
            remove(this.words, ['Value', wordSelection]);
            this.removeRects(removedRect);
        }
        this.words.push(...rects);
    }

    public onDeleteRect(event: any) {
        if (!event || !event.rect) return;
        if (event.rect.callback) {
            event.rect.callback({
                Value: event.rect.Value,
                WordsCoordinates: event.rect.WordsCoordinates,
                OriginalColumnName: event.rect.fieldOnFocus,
                DataState: DataState.DELETE,
            });
        } else {
            this.setFormsToStore({
                Value: event.rect.Value,
                WordsCoordinates: event.rect.WordsCoordinates,
                OriginalColumnName: event.rect.fieldOnFocus,
                DataState: DataState.DELETE,
            });
        }

        // remove rect
        if (event.callback) event.callback();
    }

    public onDropImageThumbnails($event) {
        const { data, callback } = $event.dragData;
        if (!data) return;
        const pageList: ImageThumbnailModel[] = this.pageList;
        if (findIndex(pageList, ['IdDocumentContainerScans', data.IdDocumentContainerScans]) > -1) {
            callback({ item: data });
            return;
        }
        this.isLoadImageDropping = true;
        this.ref.detectChanges();
        let currentLength = this.pageList.length;
        this.documentService
            .getDocumentById(data.IdDocumentContainerScans)
            .pipe(takeUntil(this.getUnsubscriberNotifier()))
            .subscribe((response) => {
                const color = this.colorDoc[0];

                for (const key in response) {
                    if (response.hasOwnProperty(key)) {
                        const element = response[key];
                        currentLength += 1;
                        this.documentImage.push(element);
                        pageList.push(
                            new ImageThumbnailModel({
                                ...element,
                                NumberOfImages: data.NumberOfImages,
                                DocumentType: data.DocumentType,
                                PageNr: currentLength,
                                IsOriginal: false,
                                Color: color,
                            }),
                        );
                        this.totalPage += 1;
                    }
                }
                remove(this.colorDoc, (_d) => _d === color);
                if (callback) callback({ item: data });
                this.isChanged = true;
                this.pageList = pageList;
                this.isLoadImageDropping = false;
                this.ref.detectChanges();
            });
    }

    public onOrderPage(pageList: any) {
        const indexSelected = findIndex(pageList, ['IdDocumentContainerOcr', this.imageInfo?.IdDocumentContainerOcr]);
        const documentImage = [];
        pageList.forEach((element) => {
            const image = find(this.documentImage, ['IdDocumentContainerOcr', element.IdDocumentContainerOcr]);
            documentImage.push(image);
        });
        this.isChanged = true;
        this.pageList = pageList;
        this.documentImage = documentImage;
        this.pageNumber = indexSelected + 1;
    }

    public onRemovePage({ item }) {
        this.pageList = filter(this.pageList, (_d) => _d.IdDocumentContainerScans !== item.IdDocumentContainerScans);
        this.totalPage = this.pageList.length;

        if (item.Color) delete item.Color;
        this.store.dispatch(this.thumbnailAction.addDocument(item));
    }

    public toggleViewImageInfo(event: any) {
        this.store.dispatch(this.thumbnailAction.pauseRefreshList(!this.viewAllPage));
        if (!this.viewAllPage) {
            if (!this.imageInfo?.IdDocumentContainerOcr) {
                this.toasterService.pop(
                    MessageModal.MessageType.warning,
                    'Warning',
                    'You document is processing, please try again later',
                );
                return;
            }
            this.viewAllPage = true;
            return;
        }
        let pageList = cloneDeep(this.pageList);
        let documentImage = cloneDeep(this.documentImage);
        if (event.isSave) {
            const request = [];
            this.isLoadImageDropping = true;
            this.ref.detectChanges();

            for (let index = 0; index < pageList.length; index++) {
                const element = pageList[index];
                const image = documentImage[index];
                element.IsOriginal = true;
                element.PageNr = index + 1;
                element.Color = '';
                request.push({
                    ...this.documentProps,
                    PageNr: element.PageNr,
                    IdDocumentContainerOcr: element.IdDocumentContainerOcr,
                    OldIdDocumentContainerScans: element.IdDocumentContainerScans,
                    IdDocumentContainerScans: this.imageInfo?.IdDocumentContainerScans,
                    OldScannedPath: element.ScannedPath,
                    OldFileName: element.FileName,
                    ScannedPath: this.imageInfo?.ScannedPath,
                });
                image.PageNr = element.PageNr;
                documentImage[index] = image;
                pageList[index] = element;
            }
            // console.log(JSON.stringify(request))
            if (this.isChanged) {
                this.documentService
                    .savePageOrder(request)
                    .pipe(takeUntil(this.getUnsubscriberNotifier()))
                    .subscribe(
                        (response: any) => {
                            this.isLoadImageDropping = false;
                            if (!response.isSuccess) {
                                this.toasterService.pop(MessageModal.MessageType.error, 'System', 'Update fail');
                                return;
                            }
                            this.isChanged = false;

                            let indexSelected = findIndex(pageList, [
                                'IdDocumentContainerOcr',
                                this.imageInfo?.IdDocumentContainerOcr,
                            ]);
                            if (indexSelected === -1) {
                                indexSelected = 0;
                            }
                            this.pageList = cloneDeep(pageList);
                            this.documentImage = documentImage;
                            this.pageNumber = indexSelected + 1;
                            this.viewAllPage = event.viewAllPage;
                            this.ref.detectChanges();
                        },
                        (error) => {
                            this.isLoadImageDropping = false;
                            this.ref.detectChanges();
                        },
                    );
                return;
            }
            // save document
        } else {
            pageList = filter(pageList, 'IsOriginal');
            pageList = orderBy(pageList, ['PageNr'], ['asc']);

            let returnPage = filter(cloneDeep(this.pageList), ['IsOriginal', false]);
            returnPage = orderBy(returnPage, ['PageNr'], ['asc']);
            this.documentImage = orderBy(
                intersectionBy(this.documentImage, pageList, 'IdDocumentContainerOcr'),
                ['PageNr'],
                ['asc'],
            );
            this.totalPage = pageList.length;
            for (const key in returnPage) {
                if (returnPage.hasOwnProperty(key)) {
                    const element = returnPage[key];
                    this.store.dispatch(this.thumbnailAction.addDocument(omit(element, ['PageNr', 'IsOriginal'])));
                }
            }
            this.isChanged = false;
        }
        let indexSelected = findIndex(pageList, ['IdDocumentContainerOcr', this.imageInfo?.IdDocumentContainerOcr]);
        if (indexSelected === -1) {
            indexSelected = 0;
        }
        this.pageList = pageList;
        this.pageNumber = indexSelected + 1;
        this.viewAllPage = event.viewAllPage;
    }

    public toggleRotationMode(event: any) {
        if (!this.rotationMode) {
            this.rotationMode = true;
            return;
        }
        if (event.isSave && event.angle) {
            this.documentService
                .changeAngle([
                    {
                        ...this.documentProps,
                        OcrId: this.imageInfo?.IdDocumentContainerOcr,
                        Rotate: event.angle,
                        IdDocumentContainerScans: this.imageInfo?.IdDocumentContainerScans,
                    },
                ])
                .pipe(takeUntil(this.getUnsubscriberNotifier()))
                .subscribe(
                    (response: any) => {
                        this.rotationMode = false;
                        this._getImageSrcAndUpdateToStorage(this.imageInfo, true);
                        if (event.callback) event.callback();
                    },
                    (error) => {
                        this.toasterService.pop(MessageModal.MessageType.error, 'System', error);
                        if (event.callback) event.callback();
                    },
                );
        } else {
            this.rotationMode = false;
            if (event.callback) event.callback();
        }
    }

    public runOCR() {
        this.documentService
            .changeAngle([
                {
                    ...this.documentProps,
                    OcrId: this.imageInfo?.IdDocumentContainerOcr,
                    Rotate: 0,
                    IdDocumentContainerScans: this.imageInfo?.IdDocumentContainerScans,
                },
            ])
            .subscribe(
                (response: any) => {
                    this._getOCRJsonOfImage(this.imageInfo?.IdDocumentContainerFiles, true);
                    // this.getDataToInitById(this.imageInfo?.IdDocumentContainerScans);
                },
                (error) => {},
            );
    }

    public onMouseWheel(event: any) {
        if (!this.imageCanvas || !this.imageCanvas.dialogBoxDiv || this.viewAllPage) return;
        if (event.preventDefault) event.preventDefault();
        const delta = Math.max(-1, Math.min(1, event.wheelDelta || -event.detail));
        const top = parseInt(this.imageCanvas.dialogBoxDiv.style.top || 0, 10);
        let imageHeight = get(this, 'imageCanvas.imageHeight') || 0;
        imageHeight = imageHeight > this.height ? imageHeight : this.height;
        const newPos = imageHeight / 2;
        const maxTop = Math.max(top - 100, -newPos);
        const minTop = Math.min(100 + top, newPos);

        if (delta < 0) {
            if (event.ctrlKey) {
                this.imageCanvas.zoomImage(0.8);
            } else {
                if (maxTop === -newPos) {
                    if (this.pageNumber >= this.totalPage) return;
                    this.changePageNumber(1);
                    if (this.pageNumber < this.totalPage) {
                        this.imageCanvas.dialogBoxDiv.style.top = minTop + 'px';
                    }
                } else {
                    this.imageCanvas.dialogBoxDiv.style.top = maxTop + 'px';
                }
            }
        } else {
            if (event.ctrlKey) {
                this.imageCanvas.zoomImage(1.2);
            } else {
                if (minTop === newPos) {
                    if (this.pageNumber <= 1) return;
                    this.changePageNumber(-1);
                    if (this.pageNumber > 1) {
                        this.imageCanvas.dialogBoxDiv.style.top = maxTop + 'px';
                    }
                } else {
                    this.imageCanvas.dialogBoxDiv.style.top = minTop + 'px';
                }
            }
        }
    }

    public onToggleIsTodo() {
        this.store.dispatch(this.administrationDocumentActions.setDocumentIsTodo(!this.isShowTodo));
    }

    public expandWidget(event) {
        this.onMaximizeWidget.emit({
            isMaximized: event,
        });
    }

    // PRIVATE

    private removeRects(rects: Array<any>) {
        for (const key in rects) {
            if (rects.hasOwnProperty(key)) {
                const element = rects[key];
                this.imageCanvas.removeRect(element.id);
            }
        }
        this.imageCanvas.canvas.renderAll();
    }

    private setFormsToStore(data: any) {
        if (this.fieldFocus?.callback) {
            this.fieldFocus.callback(data);
        } else {
            this.store.dispatch(this.administrationDocumentActions.scanOcrText(data));
        }
    }

    private parseWordCoordinate(WordsCoordinates: any) {
        if (typeof WordsCoordinates === 'string') {
            return JSON.parse(WordsCoordinates || '[]');
        }

        return WordsCoordinates || [];
    }

    private getDataToInitById(IdDocumentContainerScans: any, isDispatch?: boolean) {
        this.documentService
            .getDocumentById(IdDocumentContainerScans)
            .pipe(takeUntil(this.getUnsubscriberNotifier()))
            .subscribe(
                (response) => {
                    this.initData(response, isDispatch);
                },
                (err) => {
                    this.totalPage = 0;
                },
            );
    }

    private registerSubscriptions() {
        this.documentFieldFocusSubscription = this.administrationDocumentSelectors.fieldFormOnFocus$
            .pipe(
                filterObservable((data) => data !== null),
                takeUntil(this.getUnsubscriberNotifier()),
            )
            .subscribe((data: FieldFormOnFocusModel) => {
                try {
                    this.fieldFocus = data;
                    this.changeColorOfRect();
                } catch (error) {}
            });

        this.documentDataSubscription = this.administrationDocumentSelectors.extractedDataFromOcr$
            .pipe(
                filterObservable((data) => data !== null),
                takeUntil(this.getUnsubscriberNotifier()),
            )
            .subscribe((data: any) => {
                this.getWordCoordinate(data);
            });

        this.administrationDocumentSelectors.documentContainerScan$
            .pipe(
                filterObservable((documentContainerScan) => !!documentContainerScan),
                takeUntil(this.getUnsubscriberNotifier()),
            )
            .subscribe((documentContainerScan: DocumentContainerScanStateModel) => {
                const {
                    IdDocumentContainerScans,
                    idMainDocument,
                    indexName,
                    isProcessingPage,
                    isInvoiceApproval,
                    images,
                } = documentContainerScan;
                if (!IdDocumentContainerScans || IdDocumentContainerScans == this.imageInfo?.IdDocumentContainerScans)
                    return;
                this.isDetailPage = !isProcessingPage;
                this.isSelectDocType = !isProcessingPage || !!get(images, [0, 'IdDocumentTree']); // if init capture, not yet select doctype
                this.isInvoiceApproval = isInvoiceApproval;
                this.documentProps = { IdMainDocument: idMainDocument, IndexName: indexName };

                this.toolbarOCRConfig.isShowApplyAIData = isInvoiceApproval && !idMainDocument && !this.showInDialog;
                this.toolbarOCRConfig.isShowApplyQRData = isInvoiceApproval && !idMainDocument && !this.showInDialog;
                this.toolbarOCRConfig.isHideGroupIcon = this.showInDialog;

                this.initData(images, true);
            });

        this.administrationDocumentSelectors
            .actionOfType$(AdministrationDocumentActionNames.EXPAND_CAPTURED_FORM)
            .pipe(takeUntil(this.getUnsubscriberNotifier()))
            .subscribe((action: CustomAction) => {
                if (this.ofModule && this.ofModule.moduleNameTrim === ModuleList.Processing.moduleNameTrim) {
                    this.isSelectDocType = false;
                }
                this.parseConfigToWidthHeight();
            });

        this.subscribeNoItem = this.dispatcher
            .pipe(
                filterObservable((action: CustomAction) => {
                    return action.type === DocumentThumbnailActions.DOCUMENT_THUMBNAIL_NO_ITEM;
                }),
                takeUntil(this.getUnsubscriberNotifier()),
            )
            .subscribe((action: CustomAction) => {
                this.resetState();
            });

        this.documentFolderSubscription = this.administrationDocumentSelectors
            .actionOfType$(AdministrationDocumentActionNames.SAVE_DOCUMENT_INTO_FOLDER)
            .subscribe((action: CustomAction) => {
                const payload = action.payload as DocumentTreeModel;
                this.selectedDocumentFolderType = DocumentHelper.parseDocumentTypeToDocumentProcessingTypeEnum(
                    payload.idDocumentType,
                );
                // console.log(
                //     'Author:minh.lam , file: document-image-ocr.component.ts , line 740 , DocumentImageOcrComponent , .subscribe , this.tempDataFromOCR',
                //     this.tempDataFromOCR,
                // );
                // this.getWordCoordinate(this.tempDataFromOCR);
                // this.tempDataFromOCR = [];
                // subscribe action select docType
                this.isSelectDocType = true;
            });

        this.action$
            .pipe(
                ofType(GlobalSearchActions.ROW_DOUBLE_CLICK),
                filterObservable(this._isValidPayloadDocumentImageOCR),
                takeUntil(super.getUnsubscriberNotifier()),
            )
            .subscribe((action: CustomAction) => {
                const idDocumentContainerScans = get(action, 'payload.data.idDocumentContainerScans');
                if (!idDocumentContainerScans) return;
                // Click GS (1. Contact)
                this.isSelectDocType = true;

                this.getDataToInitById(idDocumentContainerScans);
            });

        this.action$.subscribe((action: CustomAction) => {
            if (
                action.type !== GlobalSearchActions.ROW_DOUBLE_CLICK ||
                !action.payload ||
                !action.payload.selectedModule ||
                action.payload.selectedModule.idSettingsGUI !== ModuleList.Contact.idSettingsGUI
            )
                return;

            this.resetState();
        });
    }

    private loadAttachmentFile(action: CustomAction) {
        if (
            action.type !== GlobalSearchActions.ROW_DOUBLE_CLICK ||
            !action.payload ||
            !action.payload.selectedModule ||
            action.payload.selectedModule.idSettingsGUI !== ModuleList.AttachmentGlobalSearch.idSettingsGUI ||
            action.payload.selectedModule.subModuleName !== ModuleList.AttachmentGlobalSearch.moduleName ||
            this.ofModule.moduleName !== ModuleList.Contact.moduleName
        )
            return;
        const result = action.payload.data;

        if (!result.idMainDocument || !result.idRepDocumentGuiType) return;

        this.getDataToInitById(result.idDocumentContainerScans);
    }

    private eventKeyDown(event: any) {
        if (get(event, 'target.tagName') !== 'BODY') return;
        const left = parseInt(get(this, 'imageCanvas.dialogBoxDiv.style.left') || 0, 10);
        let imageWidth = get(this, 'imageCanvas.imageWidth') || 0;
        imageWidth = imageWidth > this.width ? imageWidth : this.width;
        switch (event.keyCode) {
            case KEYCODE_ARROW_LEFT:
                if (this.totalPage > 1) {
                    this.changePageNumber(-1);
                } else if (this.imageCanvas) {
                    this.imageCanvas.dialogBoxDiv.style.left = Math.max(left - 100, -imageWidth / 2) + 'px';
                }
                break;

            case KEYCODE_PAGE_UP:
                this.changePageNumber(-1);
                break;

            case KEYCODE_PAGE_DOWN:
                this.changePageNumber(1);
                break;

            case KEYCODE_ARROW_RIGHT:
                if (this.totalPage > 1) {
                    this.changePageNumber(1);
                } else if (this.imageCanvas) {
                    this.imageCanvas.dialogBoxDiv.style.left = Math.min(left + 100, imageWidth / 2) + 'px';
                }
                break;

            case KEYCODE_ARROW_UP:
                this.onMouseWheel({ ...event, wheelDelta: -1, ctrlKey: false });
                break;

            case KEYCODE_ARROW_DOWN:
                this.onMouseWheel({ ...event, wheelDelta: 1, ctrlKey: false });
                break;
            default:
                break;
        }
    }

    private getWordCoordinate(data: ExtractedDataFormModel[], countNumber?: number) {
        const dataWords: ExtractedDataFormModel[] = filter(data, this.conditionWordCoordinate);

        if (!dataWords.length || countNumber === 5) return;
        if (!this.imageCanvas || !this.imageCanvas.canvas) {
            setTimeout(() => {
                this.getWordCoordinate(data, (countNumber || 0) + 1);
            }, 1000);
            return;
        }
        dataWords.forEach((_d: ExtractedDataFormModel) => {
            let WordsCoordinates = _d.WordsCoordinates;
            if (typeof WordsCoordinates === 'string') {
                WordsCoordinates = JSON.parse(WordsCoordinates);
            }
            _d.WordsCoordinates = WordsCoordinates;
            for (const key in WordsCoordinates) {
                if (WordsCoordinates.hasOwnProperty(key)) {
                    const element = cloneDeep(WordsCoordinates[key]);
                    element.id = guid();
                    element.fieldOnFocus = _d.OriginalColumnName || '';

                    const rect = createRect(this.imageCanvas.canvas, element, this.imageCanvas);
                    this.words.push(rect);
                }
            }
        });

        this.imageCanvas.canvas.renderAll();
    }

    private conditionWordCoordinate(data: ExtractedDataFormModel) {
        let WordsCoordinates = data.WordsCoordinates;
        if (typeof WordsCoordinates === 'string') {
            WordsCoordinates = JSON.parse(WordsCoordinates);
        }

        if (Array.isArray(WordsCoordinates) && WordsCoordinates.length) {
            return true;
        }
        return false;
    }

    private changeColorOfRect() {
        if (!this.imageCanvas || !this.imageCanvas.canvas || !this.imageCanvas.canvas.getObjects()) return;
        const canvasObject = this.imageCanvas.canvas.getObjects();
        for (let index = 0; index < canvasObject.length; index++) {
            const element = canvasObject[index];
            if (element.fieldOnFocus === this.fieldFocus.fieldOnFocus) {
                element.stroke = CoordinateColorEnum.selected;
            } else {
                element.stroke = CoordinateColorEnum.drawing;
            }
            element.dirty = true;
            canvasObject[index] = element;
        }
        this.imageCanvas.canvas.renderAll();
    }

    private rightClicked($event) {
        this.store.dispatch(this.processDataActions.dontWantToShowContextMenu());
    }

    private parseConfigToWidthHeight() {
        try {
            this.width = $(this.element.nativeElement).parent().width();
            this.height = $(this.element.nativeElement).parent().height() - headerToolbar;
            // if (this.showInDialog) {
            //     this.height = Math.max();
            // }
        } catch (error) {
            this.width = 0;
            this.height = 0;
        }
    }

    private initData(document: any, isDispatch?: boolean) {
        this.disabledPage = false;
        this.fieldFocus = null;
        this.documentImage = document;
        this.words = [];

        this.pageList = this.parsePageList(document);
        this.pageNumber = 1;
        this.totalPage = document.length;
        this.initImagePage(true);
        this._getAllImageSrc();
    }

    private initImagePage(firstInit?: boolean) {
        const data = this.documentImage[this.pageNumber - 1];
        if (!data) return;
        if (this.imageCanvas) {
            this.imageCanvas.isLoading = true;
            this.imageCanvas.removeChildren(true);
        }
        this.imageInfo = data;
        this._imageOCRLocale = parseLocaleFromOCRData(data.OCRJson);
        this.viewOnly = !data.OCRJson;
        this.imageSrc = '';
        this._getImageSrcAndUpdateToStorage(data, false, firstInit);
        this.words = [];
    }

    private parsePageList(document: Array<any>) {
        const result: Array<ImageThumbnailModel> = [];
        for (const key in document) {
            if (document.hasOwnProperty(key)) {
                const element = document[key];
                result.push(
                    new ImageThumbnailModel({
                        FileName: element.FileName,
                        DocumentName: element.FileName,
                        IdDocumentContainerScans: element.IdDocumentContainerScans,
                        IdDocumentContainerOcr: element.IdDocumentContainerOcr,
                        ScannedPath: element.ScannedPath,
                        PageNr: element.PageNr,
                        OCRText: element.OCRText,

                        IsOriginal: true,
                    }),
                );
            }
        }
        return result;
    }

    private resetState() {
        this.pageNumber = 1;
        this.documentImage = [];
        this.imageInfo = null;
        this.imageSrc = '';
        this.disabledPage = true;
        this.totalPage = 0;
    }

    // private getRectInsideRect(rect: any, ocrData: any) {
    //     const result = filter(
    //         ocrData,
    //         (_d) =>
    //             rect.left <= _d.left &&
    //             rect.top <= _d.top &&
    //             rect.left + rect.width >= _d.left + _d.width &&
    //             rect.top + rect.height >= _d.top + _d.height,
    //     );

    //     return result;
    // }

    private _isValidPayloadDocumentImageOCR(action: CustomAction) {
        const idSettingsGUI = get(action, 'payload.selectedModule.idSettingsGUI');
        const subModuleName = get(action, 'payload.selectedModule.subModuleName');

        return (
            idSettingsGUI === ModuleList.AttachmentGlobalSearch.idSettingsGUI &&
            subModuleName === ModuleList.AttachmentGlobalSearch.moduleName
        );
    }

    private _getOCRJsonOfImage(idDocumentContainerFile, isForce?: boolean) {
        if (
            this._ocrJSONMapping[idDocumentContainerFile] &&
            this._ocrJSONMapping[idDocumentContainerFile].data &&
            !isForce
        ) {
            this.imageInfo.OCRJson = get(this._ocrJSONMapping, [idDocumentContainerFile, 'data', 0, 'OCRJson']);
            this.imageInfo.OCRText = get(this._ocrJSONMapping, [idDocumentContainerFile, 'data', 0, 'OCRText']);
            this.ref.detectChanges();

            return;
        }
        if (get(this, ['_ocrJSONMapping', idDocumentContainerFile, 'isLoading'])) {
            return;
        }
        this.store.dispatch(
            this.documentOCRActions.updateOCRJson({ [idDocumentContainerFile]: { isLoading: true } }, this.ofModule),
        );
        this.documentService.getOCRJsonOfImage(idDocumentContainerFile).subscribe((response) => {
            if (!this._ocrJSONMapping[idDocumentContainerFile]) {
                return;
            }
            this.store.dispatch(
                this.documentOCRActions.updateOCRJson(
                    {
                        [idDocumentContainerFile]: { isLoading: false, data: response },
                    },
                    this.ofModule,
                ),
            );
        });
    }

    private _removeDataInStorage() {
        localForage.keys().then((response) => {
            for (const key in response) {
                if (Object.prototype.hasOwnProperty.call(response, key)) {
                    const element = response[key];
                    if (
                        includes(element, KEYWORD_IMAGE_VIEWER_STORAGE) ||
                        includes(element, KEYWORD_DATA_OCR_STORAGE)
                    ) {
                        localForage.removeItem(element);
                    }
                }
            }
        });
    }

    private _getAllImageSrc() {
        for (const key in this.documentImage) {
            if (Object.prototype.hasOwnProperty.call(this.documentImage, key)) {
                if (key == '0') continue;
                const data = this.documentImage[key];
                this._getImageSrcAndUpdateToStorage(data);
            }
        }
    }

    private _getImageSrcAndUpdateToStorage(data: any, isDisableCache?: boolean, isFirstPage?: boolean) {
        if (this._destroy) return;
        localForage.getItem(KEYWORD_IMAGE_VIEWER_STORAGE + data.IdDocumentContainerFiles).then(
            ((response: string) => {
                if (this._destroy) return;

                if (!response || isDisableCache) {
                    let imageSrc = Uti.getFileUrl(data.ScannedPath + '\\' + data.FileName, UploadFileMode.Path);
                    if (isDisableCache) {
                        imageSrc += '&t=' + new Date().getTime();
                    }
                    const imageEle = new Image();
                    imageEle.onload = function () {
                        if (this._destroy) return;
                        const canvas = document.createElement('canvas');
                        const ctx = canvas.getContext('2d');
                        let dataURL;
                        canvas.height = imageEle.naturalHeight;
                        canvas.width = imageEle.naturalWidth;
                        ctx.drawImage(imageEle, 0, 0);
                        dataURL = canvas.toDataURL('img/jpg', 1.0);
                        canvas.remove();
                        remove(this._imageLoading, imageEle);
                        this._storageData(data.IdDocumentContainerFiles, dataURL, isFirstPage);
                    }.bind(this);
                    imageEle.onerror = function () {
                        remove(this._imageLoading, imageEle);
                        const imageSrcErr: any = data.IdDocumentContainerFiles;
                        this._storageData(data.IdDocumentContainerFiles, imageSrcErr, isFirstPage);
                    }.bind(this);
                    imageEle.src = imageSrc;
                    this._imageLoading.push(imageEle);
                } else {
                    this._storageData(data.IdDocumentContainerFiles, response, isFirstPage);
                    if (isFirstPage) {
                        this._dispatchExtractData();
                    }
                    if (this.imageCanvas) {
                        this.imageCanvas.isLoading = false;
                    }
                }
            }).bind(this),
        );
    }

    private _storageData(IdDocumentContainerFiles: any, dataURL: any, isDispatchExtractData?: boolean) {
        this._dispatchExtractData(isDispatchExtractData);
        if (this.imageInfo && this.imageInfo.IdDocumentContainerFiles === IdDocumentContainerFiles) {
            this.imageSrc = dataURL;
            this._getOCRJsonOfImage(IdDocumentContainerFiles);
            if (this.imageCanvas) {
                this.imageCanvas.isLoading = false;
            }
        }
        localForage.setItem(KEYWORD_IMAGE_VIEWER_STORAGE + IdDocumentContainerFiles, dataURL);
    }

    private _dispatchExtractData(isDispatchExtractData?: boolean) {
        if (!isDispatchExtractData || !!this.documentProps.IdMainDocument || this.showInDialog) {
            return;
        }
        this.store.dispatch(
            this.invoiceApprovalProcessingActions.getExtractedDataWhenInitAction(
                this.imageInfo.IdDocumentContainerScans,
            ),
        );
    }

    private _cancelAllImageRequest() {
        for (const key in this._imageLoading) {
            if (Object.prototype.hasOwnProperty.call(this._imageLoading, key)) {
                const element = this._imageLoading[key];
                element.onerror = null;
                element.src = '';
            }
        }
    }
}
