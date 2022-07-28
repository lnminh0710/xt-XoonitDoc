import {
    Component,
    OnInit,
    Input,
    OnDestroy,
    ElementRef,
    Output,
    EventEmitter,
    ChangeDetectorRef,
} from '@angular/core';
import { Subscription } from 'rxjs';
import { ReducerManagerDispatcher, Store } from '@ngrx/store';
import 'rxjs/add/observable/forkJoin';
import * as localForage from 'localforage';

import remove from 'lodash-es/remove';
import cloneDeep from 'lodash-es/cloneDeep';
import find from 'lodash-es/find';
import take from 'lodash-es/take';
import uniqBy from 'lodash-es/uniqBy';
import filter from 'lodash-es/filter';
import replace from 'lodash-es/replace';
import findIndex from 'lodash-es/findIndex';
import get from 'lodash-es/get';
import zipObject from 'lodash-es/zipObject';
import map from 'lodash-es/map';
import values from 'lodash-es/values';
import groupBy from 'lodash-es/groupBy';
import isEqual from 'lodash-es/isEqual';

import { ScanningService } from '../../services/scanning.service';
import { NgGridItemConfig } from '@app/shared/components/grid-stack';
import { AppState } from '@app/state-management/store';
import {
    AdministrationDocumentActions,
    CustomAction,
    ScanningActions,
    LayoutInfoActions,
} from '@app/state-management/store/actions';
import { Uti } from '@app/utilities';
import { ImageThumbnailModel, ImageThumbnailType } from '../../../image-control/models/image.model';
import { User } from '@app/models';
import { ToasterService } from 'angular2-toaster';
import {
    GetDocumentFilesByFolderAction,
    DocumentManagementActionNames,
} from '@app/pages/document-management/document-management.statemanagement/document-management.actions';
import { DocumentManagementSelectors } from '@app/pages/document-management/document-management.statemanagement/document-management.selectors';
import { Router } from '@angular/router';
import { BaseComponent } from '@app/pages/private/base';
import { DocumentTreeModel } from '@app/models/administration-document/document-tree.payload.model';
import { DocumentService } from '@app/services';
import { colorDoctype as colorDoctypeResource } from '../../../image-control/components/document-image-ocr/resource';
import { MainDocumentModel } from '@app/models/administration-document/document-form/main-document.model';
import { DocumentTreeMediaModel } from '@app/models/administration-document/document-form/document-tree-media.model';
import { DocumentMyDMType } from '@app/app.constants';
import { InvoiceFormModel } from '@app/models/administration-document/document-form/invoice-form.model';
import { ContractFormModel } from '@app/models/administration-document/document-form/contract-form.model';

import { filter as filterOperator, takeUntil } from 'rxjs/operators';
import { ScanningProcess } from '../../services';
declare var require: any;
const nisPackage = require('../../../../../../../../package.json');

@Component({
    selector: 'scanning-image-list',
    templateUrl: './image-list.component.html',
    styleUrls: ['./image-list.component.scss', '../../../image-control/styles/icon.scss'],
})
export class ScanningImageListComponent extends BaseComponent implements OnInit, OnDestroy {
    @Input() tabID: string;
    @Input() dataSource: any;
    @Input() gridItemConfig: NgGridItemConfig;

    //Output
    @Output() dispatchData: EventEmitter<any> = new EventEmitter();

    // Dialog
    public isShowDialog: boolean;
    public isShowConfirm: boolean;
    public type: 'delete' | 'view' | 'save';
    public isLoadingDialog: boolean;
    //

    public perfectScrollbarConfig: any = {};
    public image: ImageThumbnailModel;
    public imageView: ImageThumbnailModel[];
    public width: number;
    public height: number;
    public ImageThumbnailType = ImageThumbnailType;
    public imageShow: ImageThumbnailModel[] = [];
    public imageSelected: ImageThumbnailModel = { IdDocumentContainerScans: 0 };
    public originalImageList: ImageThumbnailModel[] = [];

    public listLoading = {};
    public listChecked = {};
    public totalChecked = 0;
    private colorDoctype = {};
    public isViewAllPage = false;
    public isSendToCapture = true;
    public isSaving = false;

    // action
    // public isSelectAll: boolean;

    private originalFullImageList: ImageThumbnailModel[] = [];

    private keywordStorage = 'imageListScan_';
    private totalImage: number = 0;
    private firstInit = true;

    private subscribeAddImage: Subscription;
    private subscribeUpdateImage: Subscription;
    private subscribeViewAllPage: Subscription;
    private subscribeToggleIsSendCapture: Subscription;
    private subscribeWidthChange: Subscription;
    private subscribeTogglePage: Subscription;

    nisVersion = nisPackage.dependencies['ngx-infinite-scroll'];
    constructor(
        protected router: Router,
        private dispatcher: ReducerManagerDispatcher,
        private store: Store<AppState>,
        private element: ElementRef,
        private scanningService: ScanningService,
        private scanningProcess: ScanningProcess,
        private scanningAction: ScanningActions,
        private administrationDocumentActions: AdministrationDocumentActions,
        private documentManagementSelectors: DocumentManagementSelectors,
        private documentService: DocumentService,
        private layoutInfoAction: LayoutInfoActions,

        private ref: ChangeDetectorRef,
        private uti: Uti,
        private toasterService: ToasterService,
    ) {
        super(router);
        const user: User = this.uti.getUserInfo();
        if (user.email) {
            this.keywordStorage += user.email;
        }
    }

    ngOnInit() {
        this.scanningProcess.TabIDScanningImageList = this.tabID;
        this.subscription();
        this.parseConfigToWidthHeight();
        this.getThumbnails();
        this.ref.reattach();
    }

    ngOnDestroy() {
        Uti.unsubscribe(this);
        this.store.dispatch(this.scanningAction.resetDoctype());
    }

    public viewImageDetail(image: ImageThumbnailModel) {
        this.isShowDialog = true;
        this.image = image;
        this.imageView = filter(this.originalFullImageList, [
            'IdDocumentContainerScans',
            image.IdDocumentContainerScans,
        ]);
    }

    public onClickSelectAll() {
        if (this.totalChecked === this.originalFullImageList.length) {
            this.listChecked = {};
            this.updateDoctypeSelectedInTree({});
        } else {
            const listChecked = zipObject(
                map(this.originalImageList, 'IdDocumentContainerScans'),
                Array(this.originalImageList.length).fill(true),
            );
            this.updateDoctypeSelectedInTree(listChecked);
            this.listChecked = listChecked;
        }
        this.totalChecked = Object.keys(this.listChecked).length;
        // this.isSelectAll = !this.isSelectAll;
    }

    public deleteAllScanImages() {
        const listDocuments: ImageThumbnailModel[] = filter(
            cloneDeep(this.originalImageList),
            (_image: ImageThumbnailModel) => this.listChecked[_image.IdDocumentContainerScans],
        );
        let isSelected = false;
        for (const key in listDocuments) {
            if (listDocuments.hasOwnProperty(key)) {
                const document: ImageThumbnailModel = listDocuments[key];
                if (!isSelected) {
                    isSelected = this.imageSelected.IdDocumentContainerScans === document.IdDocumentContainerScans;
                }
                this.removeItem({
                    item: document,
                    isDelete: true,
                    isSelected: false,
                });
            }
        }

        if (isSelected) {
            setTimeout(() => {
                this.dispatchDocument(this.originalFullImageList[0]);
            }, 100);
        }

        this.isShowConfirm = false;
        this.ref.detectChanges();
        // this.imageShow = [];
        // this.originalImageList = [];
        // this.originalFullImageList = [];
        // this.setTotalImage(true);
        // this.store.dispatch(this.scanningAction.deleteAllImage());
        // this.store.dispatch(this.scanningAction.toggleScanningMode(true));
    }

    public removeItem(event: any) {
        if (!event || !event.item) return;
        remove(
            this.imageShow,
            (_i: ImageThumbnailModel) => _i.IdDocumentContainerScans === event.item.IdDocumentContainerScans,
        );
        remove(
            this.originalImageList,
            (_i: ImageThumbnailModel) => _i.IdDocumentContainerScans === event.item.IdDocumentContainerScans,
        );

        if (event.isDelete) {
            this.originalFullImageList = filter(
                this.originalFullImageList,
                (_i: ImageThumbnailModel) => _i.IdDocumentContainerScans !== event.item.IdDocumentContainerScans,
            );

            if (event.isSelected) {
                if (this.originalFullImageList.length > 0) {
                    this.dispatchDocument(this.originalFullImageList[0]);
                }
            }
        }
        delete this.listChecked[event.item.IdDocumentContainerScans];
        this.setListChecked(this.listChecked);

        this.setTotalImage(event.isDelete);
        if (this.imageShow.length <= 3) {
            this.onScroll();
        }

        if (!this.originalImageList.length) {
            setTimeout(() => {
                this.store.dispatch(this.scanningAction.deleteAllImage());
            }, 100);
            // this.store.dispatch(this.layoutInfoAction.toggleScanSplitArea(false, true, this.ofModule));
        }
    }

    public deleteThumbnail(event: any) {
        if (event && event.item && event.item.IdDocumentContainerScans) {
            this.image = event.item;
            this.confirmDeleteDoc(true);
        }
    }

    public confirmDeleteDoc(isDelete: boolean) {
        if (!isDelete) {
            this.isShowConfirm = false;
            this.image = null;
            this.type = 'view';
            return;
        }

        this.removeItem({
            item: this.image,
            isDelete: true,
            isSelected: this.imageSelected.IdDocumentContainerScans === this.image.IdDocumentContainerScans,
        });
        this.isLoadingDialog = false;
        this.isShowConfirm = false;
        this.image = null;
        this.type = 'view';
        this.ref.detectChanges();
    }

    public onDblClickItem(event: any) {
        this.image = event.item;
        this.type = 'view';
        this.isShowConfirm = true;
    }

    public openDocument(event: any) {
        if (event.item.IdDocumentContainerScans === this.imageSelected.IdDocumentContainerScans || this.isViewAllPage)
            return;
        this.dispatchDocument(event.item);
    }

    public addImage(images: ImageThumbnailModel[]) {
        if (!images.length) {
            return;
        }
        const request = {};
        for (const key in images) {
            if (images.hasOwnProperty(key)) {
                const element = images[key];
                const idDocument = get(element, ['DoctypeSelected', 'idDocument']);

                const newQAdd = get(request, [idDocument, 'quantity']) || 0;
                request[idDocument] = {
                    ...get(element, ['DoctypeSelected']),
                    quantity: newQAdd + 1,
                };
            }
        }
        // this.isSelectAll = false;

        this.imageShow.push(...images);
        this.originalImageList.push(...images);
        this.updateImage({ images, onlyOriginal: true });

        this.setTotalImage(true);

        this.dispatchDocument(images[0]);
        this.ref.detectChanges();
    }

    public updateImage({ images, onlyOriginal }) {
        const originalFullImageList = this.originalFullImageList;
        const originalImageList = this.originalImageList;
        const imageShow = this.imageShow;

        for (let index = 0; index < images.length; index++) {
            const image: ImageThumbnailModel = images[index];
            const imageScan = find(originalImageList, ['IdDocumentContainerScans', image.IdDocumentContainerScans]);
            const imageFull = find(originalFullImageList, ['IdDocumentContainerOcr', image.IdDocumentContainerOcr]);
            const imageShowIndex = findIndex(imageShow, ['IdDocumentContainerScans', image.IdDocumentContainerScans]);
            const Color = this.getColorByDoctype(get(image, 'DoctypeSelected.idDocument'));
            image.Color = Color;
            if (imageFull) {
                imageFull.Base64 = image.Base64;
                imageFull.ImageNote = image.ImageNote;
                imageFull.IdDocumentContainerScans = image.IdDocumentContainerScans;
                imageFull.NumberOfImages = image.NumberOfImages;
                imageFull.DoctypeSelected = image.DoctypeSelected || imageFull.DoctypeSelected;
                imageFull.Color = Color;
            } else {
                originalFullImageList.push(image);
            }

            if (onlyOriginal || image.PageNr !== 1) continue;

            if (imageShowIndex > -1) {
                const imageShowItem = cloneDeep(imageShow[imageShowIndex]);

                if (!isEqual(imageShowItem.Base64, image.Base64)) {
                    imageShowItem.Base64 = image.Base64;
                    imageShowItem.ImageNote = image.ImageNote;
                    imageShowItem.NumberOfImages = image.NumberOfImages;
                    imageShowItem.DoctypeSelected = image.DoctypeSelected || imageShowItem.DoctypeSelected;
                    imageShowItem.Color = Color;
                    imageShow[imageShowIndex] = imageShowItem;
                } else {
                    imageShow[imageShowIndex].Base64 = image.Base64;
                    imageShow[imageShowIndex].ImageNote = image.ImageNote;
                    imageShow[imageShowIndex].NumberOfImages = image.NumberOfImages;
                    imageShow[imageShowIndex].DoctypeSelected =
                        image.DoctypeSelected || imageShow[imageShowIndex].DoctypeSelected;
                    imageShow[imageShowIndex].Color = Color;
                }
            } else if (this.imageShow.length === this.originalImageList.length) {
                imageShow.push(image);
            }

            if (imageScan) {
                imageScan.Base64 = image.Base64;
                imageScan.ImageNote = image.ImageNote;
                imageScan.NumberOfImages = image.NumberOfImages;
                imageScan.DoctypeSelected = image.DoctypeSelected || imageScan.DoctypeSelected;
                imageScan.Color = Color;
            } else {
                originalImageList.push(image);
            }
        }

        this.originalFullImageList = originalFullImageList;
        this.ref.detectChanges();
        if (onlyOriginal) return;

        this.originalImageList = originalImageList;
        this.imageShow = imageShow;

        this.setTotalImage(true);
    }

    public onScroll() {
        const currentImage = this.imageShow.length;
        this.imageShow = take(this.originalImageList, currentImage + this.totalImage);
    }

    public getAllPage(image: ImageThumbnailModel) {
        if (!image) return;
        return filter(this.originalFullImageList, ['IdDocumentContainerScans', image.IdDocumentContainerScans]);
    }

    public onSelectImage(image: ImageThumbnailModel) {
        const listChecked = cloneDeep(this.listChecked);
        if (this.listChecked[image.IdDocumentContainerScans]) {
            delete listChecked[image.IdDocumentContainerScans];
        } else {
            listChecked[image.IdDocumentContainerScans] = true;
        }
        this.setListChecked(listChecked);
    }

    private subscription() {
        this.subscribeAddImage = this.dispatcher
            .pipe(
                filterOperator((action: CustomAction) => {
                    return action.type === ScanningActions.SCANNING_ADD_IMAGE;
                }),
            )
            .subscribe((action: CustomAction) => {
                this.addImage(action.payload);
            });

        this.subscribeTogglePage = this.dispatcher
            .pipe(
                filterOperator((action: CustomAction) => {
                    return (
                        action.type === LayoutInfoActions.TOGGLE_SCAN_SPLIT_AREA &&
                        action.module.idSettingsGUI == this.ofModule.idSettingsGUI
                    );
                }),
            )
            .subscribe((action: CustomAction) => {
                if (this.firstInit) {
                    this.firstInit = false;
                    return;
                }
                const payload = action.payload as { isShowPreview: boolean };
                if (payload.isShowPreview) {
                    this.getThumbnails();
                    this.parseConfigToWidthHeight();
                }
            });

        this.subscribeWidthChange = this.dispatcher
            .pipe(
                filterOperator((action: CustomAction) => {
                    return action.type === LayoutInfoActions.RESIZE_SPLITTER;
                }),
            )
            .subscribe((action: CustomAction) => {
                setTimeout(() => {
                    this.parseConfigToWidthHeight();
                }, 10);
            });

        this.subscribeUpdateImage = this.dispatcher
            .pipe(
                filterOperator((action: CustomAction) => {
                    return action.type === ScanningActions.SCANNING_UPDATE_IMAGE;
                }),
            )
            .subscribe((action: CustomAction) => {
                this.updateImage(action.payload);
            });

        this.subscribeViewAllPage = this.dispatcher
            .pipe(
                filterOperator((action: CustomAction) => {
                    return action.type === ScanningActions.SCANNING_TOGGLE_VIEW_ALL_PAGE;
                }),
            )
            .subscribe((action: CustomAction) => {
                this.isViewAllPage = action.payload;
            });

        this.subscribeToggleIsSendCapture = this.dispatcher
            .pipe(
                filterOperator((action: CustomAction) => {
                    return action.type === ScanningActions.SCANNING_TOGGLE_SEND_TO_CAPTURE;
                }),
            )
            .subscribe((action: CustomAction) => {
                this.isSendToCapture = action.payload;
            });

        this.documentManagementSelectors
            .actionOfType$(DocumentManagementActionNames.GET_DOCUMENT_FILES_BY_FOLDER)
            .filter((action: GetDocumentFilesByFolderAction) => !!action.payload)
            .takeUntil(this.getUnsubscriberNotifier())
            .subscribe((action: GetDocumentFilesByFolderAction) => {
                console.log('documentManagementSelectors');
                if (this.isViewAllPage || !Object.keys(this.listChecked).length) {
                    this.store.dispatch(this.scanningAction.setDoctypeSelectedInTree(null));
                    return;
                }
                const folder = action.payload;
                this.setDoctypeSelected(folder);
            });
    }

    public saveImages() {
        if (this.isSaving) {
            return;
        }
        this.isSaving = true;
        const listDocuments: ImageThumbnailModel[] = filter(
            cloneDeep(this.originalImageList),
            (_image: ImageThumbnailModel) =>
                this.listChecked[_image.IdDocumentContainerScans] &&
                (this.isSendToCapture || get(_image, 'DoctypeSelected.idDocument') > 1),
        );
        if (!listDocuments.length) {
            if (!this.isSendToCapture) {
                this.toasterService.pop('warning', 'Document must have doctype when not send to capture');
            }
        }
        this.listLoading = zipObject(
            map(listDocuments, 'IdDocumentContainerScans'),
            Array(listDocuments.length).fill(true),
        );
        const totalFileUpload: number = Object.keys(this.listLoading).length;
        this.saveImageAndDocument(listDocuments, 0, totalFileUpload);
    }

    private saveImageAndDocument = (listDocuments, key, totalFileUpload) => {
        const document: ImageThumbnailModel = listDocuments[key];
        if (!document) {
            this.isSaving = false;
            return;
        }
        const GroupUuid = Uti.guid();

        const data = this.generateDataToSave(document, GroupUuid);
        const mediaName = data.MediaName;
        delete data.MediaName;

        this.scanningService.uploadImageScan(data).subscribe(
            (response) => {
                delete this.listLoading[document.IdDocumentContainerScans];

                if (get(response, 'item.result.isSuccess')) {
                    this.removeItem({
                        item: document,
                        isDelete: true,
                        isSelected: document.IdDocumentContainerScans === this.imageSelected.IdDocumentContainerScans,
                    });

                    if (key < listDocuments.length - 1) {
                        this.saveImageAndDocument(listDocuments, key + 1, totalFileUpload);
                    } else {
                        this.toasterService.pop('success', 'Upload success ' + totalFileUpload + ' documents');
                        this.isSaving = false;
                    }
                } else {
                    this.toasterService.pop('error', 'Upload error');
                    totalFileUpload -= 1;
                    if (!Object.keys(this.listLoading).length) {
                        this.toasterService.pop('success', 'Upload success ' + totalFileUpload + ' documents');
                    }
                }
            },
            (error: Error) => {
                delete this.listLoading[document.IdDocumentContainerScans];
                this.toasterService.pop('error', 'Upload error', error.message);
                this.isSaving = false;

                if (!Object.keys(this.listLoading).length) {
                    this.toasterService.pop('success', 'Upload success ' + totalFileUpload + ' documents');
                }
            },
        );
    };

    private saveDocumentByTree(payload, callback) {
        switch (payload.folder.idDocumentType) {
            case DocumentMyDMType.Invoice:
                return this.documentService
                    .saveDocumentInvoice({
                        mainDocument: payload.mainDocumentData,
                        documentTreeMedia: payload.documentTreeMediaData,
                        invoice: new InvoiceFormModel(),
                        personBank: null,
                        personBeneficiary: null,
                        personBeneficiaryComm: null,
                        personRemitter: null,
                        dynamicFields: null,
                        folderChange: null,
                    })
                    .subscribe(
                        (response) => callback && callback(),
                        (error) => callback && callback(),
                    );
            case DocumentMyDMType.Contract:
                return this.documentService
                    .saveDocumentContract({
                        mainDocument: payload.mainDocumentData,
                        documentTreeMedia: payload.documentTreeMediaData,
                        contract: new ContractFormModel(),
                        personContractor: null,
                        personContractingParty: null,
                        dynamicFields: null,
                        folderChange: null,
                    })
                    .subscribe(
                        (response) => callback && callback(),
                        (error) => callback && callback(),
                    );

            case DocumentMyDMType.OtherDocuments:
                return this.documentService
                    .saveOtherDocument({
                        mainDocument: payload.mainDocumentData,
                        documentTreeMedia: payload.documentTreeMediaData,
                        otherDocuments: {
                            idDocumentTree: payload.folder.idDocument.toString(),
                            idDocumentContainerScans: payload.mainDocumentData.idDocumentContainerScans,
                        },
                        personContact: null,
                        personPrivat: null,
                        dynamicFields: null,
                        folderChange: null,
                    })
                    .subscribe(
                        (response) => callback && callback(),
                        (error) => callback && callback(),
                    );

            default:
                callback && callback();
                throw new Error(`Not supported this document type ${payload.folder.idDocumentType}`);
        }
    }

    private setDoctypeSelected(folder: DocumentTreeModel) {
        let result: ImageThumbnailModel[] = [];
        let doctypeQuantity: any = {};
        const originalFullImageList = cloneDeep(this.originalFullImageList);
        const originalScanList = cloneDeep(this.originalImageList);

        for (const key in originalFullImageList) {
            if (originalFullImageList.hasOwnProperty(key)) {
                const item: ImageThumbnailModel = cloneDeep(originalFullImageList[key]);
                if (this.listChecked[item.IdDocumentContainerScans]) {
                    item.DoctypeSelected = folder;
                    result.push(item);
                }
            }
        }
        for (const keyScan in originalScanList) {
            if (originalScanList.hasOwnProperty(keyScan)) {
                const element: ImageThumbnailModel = originalScanList[keyScan];
                if (this.listChecked[element.IdDocumentContainerScans]) {
                    const idDocument = get(element, 'DoctypeSelected.idDocument');
                    const oldQRemove = get(doctypeQuantity, [idDocument, 'quantity']) || 0;
                    doctypeQuantity[idDocument] = {
                        ...element.DoctypeSelected,
                        quantity: oldQRemove - 1,
                    };
                    const newQAdd = get(doctypeQuantity, [folder.idDocument, 'quantity']) || 0;
                    doctypeQuantity[folder.idDocument] = {
                        ...folder,
                        quantity: newQAdd + 1,
                    };
                }
            }
        }

        this.updateImage({ images: result, onlyOriginal: false });
    }

    private dispatchDocument(item: ImageThumbnailModel, forceUpdate?: boolean) {
        if (!item) return;
        const documentPage = filter(this.originalFullImageList, [
            'IdDocumentContainerScans',
            item.IdDocumentContainerScans,
        ]);
        const callbackFunc = (isError?: boolean) => {
            if (isError) return;
            this.imageSelected = item;
            this.setTotalImage();
            if (this.imageShow.length <= 3) {
                this.onScroll();
            }
            this.ref.detectChanges();
        };
        this.store.dispatch(
            this.scanningAction.selectImage({
                forceUpdate: forceUpdate,
                images: documentPage,
                callback: callbackFunc.bind(this),
            }),
        );
    }

    private setTotalImage(updateStore?: boolean) {
        if (updateStore) {
            try {
                localForage.setItem(this.keywordStorage, JSON.stringify(this.originalFullImageList));
            } catch (error) {
                console.log(error);
            }
        }
        this.store.dispatch(this.administrationDocumentActions.setTotalImage(this.originalImageList.length));
        this.ref.detectChanges();
    }

    private getThumbnails() {
        this.originalImageList = [];
        localForage.getItem(this.keywordStorage).then((response: any) => {
            const list: ImageThumbnailModel[] = <ImageThumbnailModel[]>JSON.parse(response) || [];
            this.handleSuccess(list);
        });
    }

    private handleSuccess(response: ImageThumbnailModel[]) {
        if (!response || response.length === 0) return;
        response.forEach((element) => {
            element.Color = this.getColorByDoctype(get(element, 'DoctypeSelected.idDocument'));
            return element;
        });
        this.originalFullImageList = cloneDeep(response);
        response = uniqBy(response, 'IdDocumentContainerScans');
        const firstItem = cloneDeep(response[0]);
        this.setImageShowing(cloneDeep(response));
        this.originalImageList = cloneDeep(response);
        setTimeout(() => {
            this.dispatchDocument(firstItem);
        }, 300);
    }

    private setImageShowing(response: ImageThumbnailModel[]) {
        if (response.length === 0) return;
        const parentHeight = $(this.element.nativeElement).parent().height();
        const totalImage = parseInt((parentHeight / this.height).toFixed(), 10) || 1;
        this.totalImage = totalImage;
        this.imageShow = take(response, totalImage + 5);
        this.ref.detectChanges();
    }

    private setListChecked(listChecked: any) {
        const totalChecked = Object.keys(listChecked).length;
        this.totalChecked = totalChecked;
        // this.isSelectAll = totalChecked === this.originalImageList.length;
        this.listChecked = listChecked;

        this.updateDoctypeSelectedInTree(listChecked);
    }

    private updateDoctypeSelectedInTree(listChecked) {
        let listDoctypeChecked = uniqBy(
            map(
                filter(
                    this.originalImageList,
                    (_img: ImageThumbnailModel) => listChecked[_img.IdDocumentContainerScans],
                ),
                'DoctypeSelected',
            ),
            'idDocument',
        );
        if (listDoctypeChecked.length > 1) {
            this.store.dispatch(this.scanningAction.setDoctypeSelectedInTree(null));
        } else {
            this.store.dispatch(this.scanningAction.setDoctypeSelectedInTree(listDoctypeChecked[0]));
        }
    }

    private parseConfigToWidthHeight(width?: number) {
        try {
            width = $(this.element.nativeElement).parent().width();
            if (!width) return;
            this.width = width - 40;
            this.width = parseInt(this.width.toFixed(), 10);
            this.height = this.width * 1.3 - 36;
            this.ref.detectChanges();
        } catch (error) {
            this.width = 0;
            this.height = 0;
        }
    }

    private getColorByDoctype(idDocument: any) {
        return '';
        // if (idDocument === 1) {
        //     return '#FFE18E';
        // }
        // let color = this.colorDoctype[idDocument];
        // if (!color) {
        //     color = colorDoctypeResource[Object.keys(this.colorDoctype).length];
        //     this.colorDoctype[idDocument] = color;
        // }
        // return color;
    }

    private _generateSaveData(payload, request) {
        if (!this.isSendToCapture && payload.folder.idDocumentType) {
            switch (payload.folder.idDocumentType) {
                case DocumentMyDMType.Invoice:
                    request.InvoiceData = {
                        mainDocument: payload.mainDocumentData,
                        documentTreeMedia: payload.documentTreeMediaData,
                        invoice: new InvoiceFormModel(),
                        personBank: null,
                        personBeneficiary: null,
                        personBeneficiaryComm: null,
                        personRemitter: null,
                        dynamicFields: null,
                        folderChange: null,
                    };
                    break;
                case DocumentMyDMType.Contract:
                    request.ContractData = {
                        mainDocument: payload.mainDocumentData,
                        documentTreeMedia: payload.documentTreeMediaData,
                        contract: new ContractFormModel(),
                        personContractor: null,
                        personContractingParty: null,
                        dynamicFields: null,
                        folderChange: null,
                    };
                    break;
                case DocumentMyDMType.OtherDocuments:
                    request.OtherDocumentData = {
                        mainDocument: payload.mainDocumentData,
                        documentTreeMedia: payload.documentTreeMediaData,
                        otherDocuments: {
                            idDocumentTree: payload.folder.idDocument.toString(),
                            idDocumentContainerScans: payload.mainDocumentData.idDocumentContainerScans,
                        },
                        personContact: null,
                        personPrivat: null,
                        dynamicFields: null,
                        folderChange: null,
                    };
                    break;
            }
        }
        return request;
    }

    private generateDataToSave(document: ImageThumbnailModel, GroupUuid: any) {
        const currentDate = new Date();
        const fileName = currentDate.getTime() + '_Scan.tiff';
        const pages: ImageThumbnailModel[] = filter(this.originalFullImageList, [
            'IdDocumentContainerScans',
            document.IdDocumentContainerScans,
        ]);
        const images = [];
        let pageNr = 1;
        let Notes = '';
        for (const key in pages) {
            if (pages.hasOwnProperty(key)) {
                const page: ImageThumbnailModel = pages[key];
                Notes = page.ImageNote;
                images.push({
                    base64_string: page.Base64.replace('data:image/jpeg;base64,', ''),
                    FileName: fileName + '.' + pageNr + '.jpg',
                    PageNr: pageNr,
                });
                pageNr += 1;
            }
        }
        const idDocument = get(document, 'DoctypeSelected.idDocument') || '';
        const mainDocumentData = <MainDocumentModel>{
            idDocumentContainerScans: null,
            idMainDocument: null,
            mainDocumentTree: {
                idDocumentTree: idDocument.toString(),
                oldFolder: null,
                newFolder: null,
            },
            searchKeyWords: null,
            toDoNotes: null,
        };

        const documentTreeMediaData = <DocumentTreeMediaModel>{
            mediaName: fileName,
            idDocumentTree: idDocument.toString(),
            cloudMediaPath: get(document, 'DoctypeSelected.path'),
            idDocumentTreeMedia: null,
            idRepTreeMediaType: '1',
        };

        const res = {
            mainDocumentData,
            documentTreeMediaData,
            folder: get(document, 'DoctypeSelected'),
        };

        return this._generateSaveData(res, {
            Images: images,
            MediaName: fileName,
            ScanningLotItemData: {
                GroupUuid,
                LotItemId: null,
                IsSendToCapture: this.isSendToCapture ? '1' : '0',
                IdDocumentTree: get(document, 'DoctypeSelected.idDocument') || '',
                IdRepScansContainerType: 1,
                IdRepScanDeviceType: 1,
                ScannerTwainDllVersion: null,
                ScannerDevice: null,
                CustomerNr: '1',
                MediaCode: '1',
                ScannedPath: null,
                ScannedFilename: null,
                ScannedDateUTC: replace(replace(currentDate.toISOString(), 'T', ' '), 'Z', ''),
                CoordinateX: null,
                CoordinateY: null,
                CoordinatePageNr: 0,
                IsWhiteMail: null,
                IsCheque: null,
                NumberOfImages: 1,
                SourceScanGUID: Uti.guid(),
                IsMediaCodeValid: null,
                IsCustomerNrValid: null,
                IsCustomerNrEnteredManually: null,
                IsMediaCodeEnteredManually: null,
                IsSynced: true,
                IsActive: '1',
                IsUserClicked: true,
                ElapsedTime: null,
                IsLocalDeleted: null,
                IsOnlyGamer: null,
                IdRepScansDocumentType: 1,
                Notes: Notes,
            },
        });
    }
}
