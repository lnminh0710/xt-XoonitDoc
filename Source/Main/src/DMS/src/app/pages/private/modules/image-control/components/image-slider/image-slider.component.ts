import {
    Component,
    OnInit,
    Input,
    OnDestroy,
    ElementRef,
    Output,
    EventEmitter,
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    AfterViewInit,
} from '@angular/core';
import { ImageThumbnailModel, ImageThumbnailType } from '../../models/image.model';
import { NgGridItemConfig } from '@app/shared/components/grid-stack';
import { Subscription, Subject } from 'rxjs';
import { ReducerManagerDispatcher, Store } from '@ngrx/store';
import {
    CustomAction,
    DocumentThumbnailActions,
    AdditionalInformationActions,
    LayoutInfoActions,
    ModuleActions,
} from '@app/state-management/store/actions';
import { Uti } from '@app/utilities';

import { remove, cloneDeep, find, take, uniqBy, findIndex, differenceBy } from 'lodash-es';

import { DocumentImageOcrService } from '../../services/document-image-ocr.service';
import { SearchService } from '@app/services';
import { AppState } from '@app/state-management/store';
import {
    AdministrationDocumentActions,
    AdministrationDocumentActionNames,
} from '@app/state-management/store/actions/administration-document';
import { AdministrationDocumentSelectors } from '@app/state-management/store/reducer';
import { FormState } from '@app/state-management/store/models/administration-document/state/document-forms.state.model';
import { BaseComponent, ModuleList } from '@app/pages/private/base';
import { ActivatedRoute, Router } from '@angular/router';
import { LocalStorageKey } from '@app/app.constants';
import { filter, takeUntil, debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { DocumentContainerScanStateModel } from '@app/state-management/store/models/administration-document/state/document-container-scan.state.model';
// import nisPackage from '../../../../../../../../package.json';
declare var require: any;
const nisPackage = require('../../../../../../../../package.json');
var timeoutFirstDispatch;
@Component({
    selector: 'image-slider',
    templateUrl: './image-slider.component.html',
    styleUrls: ['./image-slider.component.scss', '../image-viewer-dialog/image-viewer-dialog.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ImageSliderComponent extends BaseComponent implements OnInit, OnDestroy, AfterViewInit {
    @Input() dataSource: any;

    @Input() gridItemConfig: NgGridItemConfig;

    //Output
    @Output() dispatchData: EventEmitter<any> = new EventEmitter();

    // Variable
    // Dialog
    public isShowDialog: boolean;
    public isShowConfirm: boolean;
    public isConfirmDelete: boolean;
    public isLoadingDialog: boolean;
    //

    public searchText: string = '';
    public isSearching: boolean;

    public perfectScrollbarConfig: any = {};
    public image: ImageThumbnailModel;
    public width: number;
    public height: number;
    public ImageThumbnailType = ImageThumbnailType;
    public imageShow: ImageThumbnailModel[] = [];
    public totalImage: number = 0;

    private originalImageList: ImageThumbnailModel[] = [];
    private pageSize = 10;
    private pageIndex = 1;
    private formState: FormState;
    private _didManipulateCaptureFile: boolean;
    // private isSkipReset = false;

    private subscribeWidthChange: Subscription;
    private subscribeSaveSuccess: Subscription;
    private subscribeAddImage: Subscription;
    private subscribeSelectImage: Subscription;
    private subscribePauseInterval: Subscription;
    private isPauseReload = false;
    private isCallReloadWhenPause = false;
    private idScanSelected: any;

    nisVersion = nisPackage.dependencies['ngx-infinite-scroll'];
    private _activeModuleState$: any;
    private _activeModule: any;
    public listId = Uti.guid();

    constructor(
        protected router: Router,
        private dispatcher: ReducerManagerDispatcher,
        private store: Store<AppState>,
        private element: ElementRef,
        private documentService: DocumentImageOcrService,
        private documentAction: DocumentThumbnailActions,
        private administrationDocumentActions: AdministrationDocumentActions,
        private layoutInfoAction: LayoutInfoActions,
        private administrationDocumentSelectors: AdministrationDocumentSelectors,
        private ref: ChangeDetectorRef,
        private searchService: SearchService,
        private activatedRoute: ActivatedRoute,
    ) {
        super(router);

        this._activeModuleState$ = store.select((state) => state.mainModule.activeModule);
    }

    ngOnInit() {
        this.subscription();
        this.parseConfigToWidthHeight();

        this.ref.reattach();
    }

    ngAfterViewInit() {
        this.getThumbnails(this.handleSuccess.bind(this), {
            pageIndex: this.pageIndex,
            pageSize: this.pageSize,
            searchText: '*',
        });
    }

    ngOnDestroy() {
        Uti.unsubscribe(this);
        super.onDestroy();
    }

    public changeSearchText(value) {
        this.pageIndex = 2;
        this.getThumbnails(this.handleReloadSuccess.bind(this), {
            pageIndex: 1,
            pageSize: this.pageSize,
            searchText: value,
        });
    }

    public clearInput() {
        this.searchText = '';
        const inputElement = document.getElementById('image-slider__header-input');
        if (inputElement) {
            inputElement.focus();
        }
        this.changeSearchText(this.searchText);
    }

    public viewImageDetail(image: ImageThumbnailModel) {
        this.isShowDialog = true;
        this.image = image;
    }

    public removeItem(event: any) {
        if (!event || !event.item) return;

        remove(this.imageShow, ['IdDocumentContainerScans', event.item.IdDocumentContainerScans]);
        remove(this.originalImageList, ['IdDocumentContainerScans', event.item.IdDocumentContainerScans]);
        this.totalImage = Math.max(this.totalImage - 1, 0);
        this.setTotalImage();
        if (!!this.imageShow.length && this.imageShow.length <= 9) {
            this.onScroll();
        }

        if (!this.originalImageList.length && !this.isPauseReload) {
            this.store.dispatch(this.documentAction.noItem());
        }

        if (event.callback) event.callback();

        this.ref.detectChanges();
    }

    public deleteThumbnail(event: any) {
        if (event && event.item && event.item.IdDocumentContainerScans) {
            this.image = event.item;
            this.isShowConfirm = true;
            this.isConfirmDelete = true;
            this.ref.detectChanges();
        }
    }

    public confirmDeleteDoc(isDelete: boolean) {
        if (!isDelete) {
            this.isShowConfirm = false;
            this.image = null;
            this.isConfirmDelete = false;
            return;
        }
        this.isLoadingDialog = true;
        this.documentService.deleteImage(this.image.IdDocumentContainerScans).subscribe(
            (response) => {
                this.removeItem({ item: this.image });
                this.isLoadingDialog = false;
                this.isShowConfirm = false;
                if (this.image.isSelected) {
                    this.totalImage += 1;
                    this.dispatchDocument(this.imageShow[0]);
                }

                this.image = null;
                this.isConfirmDelete = false;
                this.ref.detectChanges();
            },
            (error) => {
                this.isShowConfirm = false;
                this.isLoadingDialog = false;
                this.ref.detectChanges();
            },
        );
    }

    public onDblClickItem(event: any) {
        this.image = event.item;
        this.isConfirmDelete = false;
        if (!this._didManipulateCaptureFile) {
            this.openDocument(false);
            return;
        }
        this.isShowConfirm = true;
        this.ref.detectChanges();
    }

    public openDocument(saveDoc?: boolean, isRemoveSelectedDoc?: boolean) {
        this.isShowConfirm = false;
        if (saveDoc) {
            try {
                document.getElementById('DokumentErfassen-save-button').click();
            } catch (error) {}
            return;
        } else {
            const originalImageList = this.originalImageList;
            const selectedItem = find(this.originalImageList, 'isSelected');
            if (selectedItem) {
                if (isRemoveSelectedDoc) {
                    remove(originalImageList, ['IdDocumentContainerScans', selectedItem.IdDocumentContainerScans]);
                } else {
                    selectedItem.isSelected = false;
                    this.totalImage += 1;
                    this.imageShow.push(cloneDeep(selectedItem));
                }
                this.originalImageList = originalImageList;
            }
            if (!this.originalImageList.length) {
                this.store.dispatch(this.documentAction.noItem());
            }
            localStorage.setItem(LocalStorageKey.LocalStorageGSCaptureSearchText, '');
            this.dispatchDocument(this.image || this.imageShow[0]);
            this.image = null;
        }
    }

    public addImage(image: ImageThumbnailModel) {
        if (findIndex(this.originalImageList, ['IdDocumentContainerScans', image.IdDocumentContainerScans]) > -1) {
            return;
        }
        this.imageShow.unshift(cloneDeep(image));
        this.originalImageList.unshift(cloneDeep(image));
        this.totalImage = this.totalImage + 1;
        this.setTotalImage();
    }

    public onScroll() {
        const currentImage = this.originalImageList.length;
        if (currentImage > this.totalImage) {
            return;
        }
        // call api get
        this.getThumbnails(this.handleLazyLoad.bind(this), {
            pageIndex: this.pageIndex,
            pageSize: this.pageSize,
            searchText: this.searchText,
        });
    }

    public reloadDocument() {
        this.pageIndex = 2;
        this.getThumbnails(this.handleReloadSuccess.bind(this), {
            pageIndex: 1,
            pageSize: this.pageSize,
            searchText: this.searchText,
        });
    }

    private subscription() {
        this._activeModuleState$.pipe(takeUntil(this.getUnsubscriberNotifier())).subscribe((activeModuleState) => {
            this._activeModule = activeModuleState;
        });
        this.subscribeWidthChange = this.dispatcher
            .pipe(
                filter((action: CustomAction) => {
                    return action.type === AdditionalInformationActions.REQUEST_RESIZE;
                }),
                takeUntil(this.getUnsubscriberNotifier()),
            )
            .subscribe((action: CustomAction) => {
                setTimeout(() => {
                    this.parseConfigToWidthHeight(parseInt(action.payload, 10));
                }, 10);
            });

        this.dispatcher
            .pipe(
                filter(
                    (action: CustomAction) =>
                        action.type === AdditionalInformationActions.REQUEST_TOGGLE_AI_TAB && action.payload,
                ),
                takeUntil(this.getUnsubscriberNotifier()),
            )
            .subscribe((action: CustomAction) => {
                setTimeout(() => {
                    this.parseConfigToWidthHeight();
                }, 10);
                this.changeSearchText(this.searchText);
            });

        this.subscribeSaveSuccess = this.administrationDocumentSelectors
            .actionSuccessOfSubtype$(
                AdministrationDocumentActionNames.SAVE_DOCUMENT_INVOICE_FORMS,
                AdministrationDocumentActionNames.SAVE_DOCUMENT_CONTRACT_FORMS,
                AdministrationDocumentActionNames.SAVE_OTHER_DOCUMENT_FORMS,
            )
            .pipe(takeUntil(this.getUnsubscriberNotifier()))
            .subscribe((action) => {
                this.saveSuccess();
            });

        this.subscribeAddImage = this.dispatcher
            .pipe(
                filter((action: CustomAction) => {
                    return action.type === DocumentThumbnailActions.DOCUMENT_THUMBNAIL_ADD_ITEM;
                }),
                takeUntil(this.getUnsubscriberNotifier()),
            )
            .subscribe((action: CustomAction) => {
                this.addImage(action.payload);
            });

        this.subscribePauseInterval = this.dispatcher
            .pipe(
                filter((action: CustomAction) => {
                    return action.type === DocumentThumbnailActions.DOCUMENT_THUMBNAIL_PAUSE_REFRESH;
                }),
                takeUntil(this.getUnsubscriberNotifier()),
            )
            .subscribe((action: CustomAction) => {
                this.isPauseReload = action.payload;
                if (!action.payload && this.isCallReloadWhenPause) {
                    this.isCallReloadWhenPause = false;
                    this.reloadDocument();
                }
            });

        this.subscribePauseInterval = this.dispatcher
            .pipe(
                filter((action: CustomAction) => {
                    return action.type === DocumentThumbnailActions.DOCUMENT_THUMBNAIL_REFRESH;
                }),
                takeUntil(this.getUnsubscriberNotifier()),
            )
            .subscribe((action: CustomAction) => {
                if (!this.isPauseReload) {
                    this.reloadDocument();
                } else {
                    this.isCallReloadWhenPause = true;
                }
            });

        this.subscribeAddImage = this.dispatcher
            .pipe(
                filter((action: CustomAction) => {
                    return action.type === AdministrationDocumentActionNames.NEXT_DOCUMENT_TO_CLASSIFY;
                }),
                takeUntil(this.getUnsubscriberNotifier()),
            )
            .subscribe((action: CustomAction) => {
                this.openDocument(false, action.payload);
                return;
                // if (!this._didManipulateCaptureFile) {
                // } else {
                //     this.isShowConfirm = true;
                //     this.ref.detectChanges();
                // }
            });

        this.administrationDocumentSelectors.documentContainerScan$
            .pipe(
                filter((documentContainerOcr) => !!documentContainerOcr),
                takeUntil(this.getUnsubscriberNotifier()),
            )
            .subscribe((documentContainerOcr: DocumentContainerScanStateModel) => {
                const { IdDocumentContainerScans } = documentContainerOcr;

                if (!IdDocumentContainerScans || this.idScanSelected == IdDocumentContainerScans) return;
                const selectedItem = find(this.originalImageList, 'isSelected');
                if (selectedItem) {
                    if (selectedItem.IdDocumentContainerScans == IdDocumentContainerScans) {
                        return;
                    }
                    selectedItem.isSelected = false;
                    this.imageShow.push(cloneDeep(selectedItem));
                    this.totalImage += 1;
                }
                this.idScanSelected = IdDocumentContainerScans;
                this._setSelectedForDocument(IdDocumentContainerScans);
                this.setTotalImage();
                this.ref.detectChanges();
            });

        this.administrationDocumentSelectors.didManipulateCaptureFile$
            .pipe(takeUntil(this.getUnsubscriberNotifier()))
            .subscribe((didManipulateCaptureFile: boolean) => {
                this._didManipulateCaptureFile = didManipulateCaptureFile;
            });

        this.administrationDocumentSelectors
            .actionOfType$(AdministrationDocumentActionNames.DELETE_IMAGE_SCAN_DOCUMENT_ON_THUMBNAIL)
            .pipe(takeUntil(this.getUnsubscriberNotifier()))
            .subscribe((action: CustomAction) => {
                const idDocumentContainerScans = action.payload as string;
                const item = find(
                    this.originalImageList,
                    (_image) => _image.IdDocumentContainerScans == idDocumentContainerScans,
                );
                if (item) {
                    this.deleteThumbnail({ item });
                } else if (this.idScanSelected) {
                    this.deleteThumbnail({
                        item: { IdDocumentContainerScans: this.idScanSelected, isSelected: true },
                    });
                }
            });

        this.dispatcher
            .pipe(
                filter((action: CustomAction) => {
                    return action.type === ModuleActions.SEARCH_KEYWORD_MODULE;
                }),
                takeUntil(this.getUnsubscriberNotifier()),
            )
            .subscribe((action: CustomAction) => {
                const data = action?.payload;
                this.searchText = data?.searchKeyword;
                this.changeSearchText(this.searchText);
            });
    }

    private saveSuccess() {
        remove(this.originalImageList, (_d) => _d.isSelected);
        // this.totalImage = Math.max(this.totalImage - 1, 0);
        localStorage.setItem(LocalStorageKey.LocalStorageGSCaptureSearchText, '');
        if (!this.imageShow.length) {
            //     // this.dispatchDocument(this.image || this.imageShow[0]);
            //     setTimeout(() => {
            //         this.image = null;
            //     }, 100);
            // } else {
            this.idScanSelected = '';
            this.setTotalImage();
            this.store.dispatch(this.documentAction.noItem());
        }
    }

    private dispatchDocument(item: ImageThumbnailModel, firstInit?: boolean) {
        if (!item) return;
        this.idScanSelected = item.IdDocumentContainerScans;
        this._setSelectedForDocument(item.IdDocumentContainerScans);
        this.store.dispatch(this.administrationDocumentActions.setDocumentIsTodo(false));
        // this.dispatchData.emit([
        //     {
        //         key: 'IdDocumentContainerScans',
        //         value: item.IdDocumentContainerScans,
        //     },
        // ]);
        this.store.dispatch(
            this.administrationDocumentActions.getDocumentByIdScan({
                firstInit,
                idDocumentContainerScans: item.IdDocumentContainerScans,
                idDocumentType: item.IdDocumentType,
                idDocument: item.IdDocument,
                idTreeRoot: item.IdTreeRoot,
                idInvoiceMainApproval: item.IdInvoiceMainApproval,
            }),
        );
        // this.store.dispatch(this.documentAction.selectDocument(item.IdDocumentContainerScans));
        this.setTotalImage();
        if (item.DocumentType === 'Unknow') {
            this.store.dispatch(this.documentAction.selectUnknownDocument(item.IdDocumentContainerScans));
        }
        if (this.imageShow.length && this.imageShow.length <= 9) {
            this.onScroll();
        }
        this.store.dispatch(this.layoutInfoAction.requestToggleFullScreen(this.ofModule, { isMaximized: false }));
    }

    private _setSelectedForDocument(IdDocumentContainerScans) {
        const itemSelected = find(
            this.originalImageList,
            (_image) => _image['IdDocumentContainerScans'] == IdDocumentContainerScans,
        );
        if (itemSelected) {
            itemSelected.isSelected = true;
            remove(this.imageShow, (_image) => _image['IdDocumentContainerScans'] == IdDocumentContainerScans);
            this.totalImage = Math.max(0, this.totalImage - 1);
        }
    }

    private setTotalImage() {
        this.store.dispatch(this.administrationDocumentActions.setTotalImage(this.totalImage));
        this.ref.reattach();
        this.ref.detectChanges();
    }

    private getThumbnails(callbackSuccess: any, params: { pageIndex: number; pageSize: number; searchText: string }) {
        this.isSearching = true;
        this.searchText = params.searchText;
        this.searchService
            .search(
                this._activeModule.searchIndexKey || ModuleList.Processing.searchIndexKey,
                this.searchText || '*',
                this._activeModule.idSettingsGUI || ModuleList.Processing.idSettingsGUI,
                params.pageIndex,
                params.pageSize,
                null,
                null,
                null,
                true,
                'Both_*X*',
            )
            .subscribe(
                (response: any) => {
                    this.isSearching = false;
                    callbackSuccess({
                        Data: this.mappingKeywordFromGS(response.item.results),
                        TotalRecords: response.item.total,
                    });
                    this.ref.detectChanges();
                },
                (err) => {
                    this.isSearching = false;
                    this.ref.detectChanges();
                },
            );
        // this.documentService.getThumbnails(params).subscribe(callbackSuccess, (err: any) => console.log('error ', err));
    }

    private checkValidResponse(response: any) {
        if (!response || !Array.isArray(response.Data) || response.Data.length === 0) return false;
        return true;
    }

    private handleSuccess(response: any) {
        if (!this.checkValidResponse(response)) {
            this.store.dispatch(this.documentAction.noItem());
            this.totalImage = 0;
            this.setTotalImage();
            this.ref.detectChanges();
            return;
        }
        let data = uniqBy(response.Data, 'IdDocumentContainerScans');
        const firstItem = cloneDeep(data[0]);
        this.imageShow = cloneDeep(data);
        this.totalImage = response.TotalRecords;
        this.originalImageList = data;
        this.pageIndex = this.pageIndex + 1;
        const idMainDocument = this.activatedRoute.snapshot.queryParams['idDocument'];
        const idDocumentContainerScans = this.activatedRoute.snapshot.queryParams['idDocumentContainerScans'];
        if (!idMainDocument && !idDocumentContainerScans) {
            this.dispatchDocument(firstItem, true);
        }
        setTimeout(() => {
            this.store.dispatch(this.administrationDocumentActions.getDocumentsThumbnailDone());
        }, 500);
    }

    private handleLazyLoad(response: any) {
        if (!this.checkValidResponse(response)) return;
        let data = uniqBy(response.Data, 'IdDocumentContainerScans');
        data = differenceBy(data, this.originalImageList, 'IdDocumentContainerScans');
        this.imageShow = this.imageShow.concat(cloneDeep(data));
        const itemSelected = find(data, (_image) => _image['IdDocumentContainerScans'] == this.idScanSelected);
        if (itemSelected) {
            itemSelected.isSelected = true;
            remove(this.imageShow, (_image) => _image['IdDocumentContainerScans'] == this.idScanSelected);
        }
        this.originalImageList = this.originalImageList.concat(cloneDeep(data));
        this.pageIndex = this.pageIndex + 1;
        this.setTotalImage();
    }

    private handleReloadSuccess(response: any) {
        if (!this.checkValidResponse(response)) {
            this.imageShow = [];
            this.originalImageList = [];
            this.totalImage = 0;
            this.ref.detectChanges();
            return;
        }

        const data = uniqBy(response.Data, 'IdDocumentContainerScans');
        this.totalImage = response.TotalRecords;
        this.originalImageList = cloneDeep(data);
        this.imageShow = cloneDeep(data);
        this._setSelectedForDocument(this.idScanSelected);

        const element = document.getElementById(this.listId);
        if (element) {
            element.scrollTop = 0;
        }
        this.setTotalImage();
        this.ref.detectChanges();
    }

    private parseConfigToWidthHeight(width?: number) {
        try {
            width = $(this.element.nativeElement).parent().width();
            if (!width) return;
            this.width = width - 20;
            this.width = parseInt(this.width.toFixed(), 10);
            this.height = this.width * 1.3 - 36;
            this.ref.detectChanges();
        } catch (error) {
            this.width = 0;
            this.height = 0;
        }
    }

    private mappingKeywordFromGS(data: any) {
        let result: ImageThumbnailModel[] = [];

        for (const key in data) {
            if (Object.prototype.hasOwnProperty.call(data, key)) {
                const element = data[key];
                result.push({
                    IdDocumentContainerScans: element.idDocumentContainerScans,
                    DocumentName: element.documentName,
                    DocumentType: element.documentType,
                    NumberOfImages: element.numberOfImages,
                    ScannedPath: element.scannedPath,

                    IdDocumentType: element.idRepDocumentGuiType || '',
                    IdDocument: element.idMainDocument || '',
                    IdTreeRoot: element.idDocumentTree || '',
                    IdInvoiceMainApproval: element.idInvoiceMainApproval || '',
                });
            }
        }

        return result;
    }
}
