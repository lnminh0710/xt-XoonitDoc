import { Router } from '@angular/router';
import { BaseComponent } from '@app/pages/private/base';
import {
    Component,
    OnInit,
    ChangeDetectorRef,
    OnDestroy,
    Input,
    OnChanges,
    SimpleChanges,
    ViewChild,
    ElementRef,
} from '@angular/core';
import * as Dynamsoft from 'dwt';
import { Store, ReducerManagerDispatcher } from '@ngrx/store';
import {
    ScanningActions,
    AdministrationDocumentActions,
    LayoutInfoActions,
    CustomAction,
} from '@app/state-management/store/actions';
import { AppState } from '@app/state-management/store';
import * as localForage from 'localforage';

import { orderBy, map, get, has, isNil } from 'lodash-es';

import { guid } from '../../../image-control/components/image-ocr/image-ocr.util';
import { Uti } from '@app/utilities';

import { ImageThumbnailModel } from '../../../image-control/models/image.model';
import { ToasterService } from 'angular2-toaster';
import { MessageModal } from '@app/app.constants';
import { imageBase64 } from './base64';
import { DocumentTreeModel } from '@app/models/administration-document/document-tree.payload.model';
import { ScanningService, ScanningProcess } from '../../services';
import { User } from '@app/models';
import { DocumentManagementSelectors } from '@app/pages/document-management/document-management.statemanagement/document-management.selectors';
import {
    DocumentManagementActionNames,
    GetDocumentFilesByFolderAction,
} from '@app/pages/document-management/document-management.statemanagement/document-management.actions';
import { filter, takeUntil } from 'rxjs/operators';
import { XoonitScanToolType } from '@app/models/scanning-configuration.model';
import { DownloadFileService } from '@app/services';
import { TemplateRef } from '@angular/core';
import { PopupService } from '@app/xoonit-share/components/global-popup/services/popup.service';
import { HeaderNoticeRef } from '@app/xoonit-share/components/global-popup/components/header-popup/header-notice-ref';

const ENUM_SCAN_MODE = 'scanMode';

@Component({
    selector: 'scanning-configuration',
    templateUrl: './scanning-configuration.component.html',
    styleUrls: ['../../../image-control/styles/icon.scss', './scanning-configuration.component.scss'],
})
export class ScanningConfigurationComponent extends BaseComponent implements OnInit, OnDestroy, OnChanges {
    @Input() tabID: string;
    @Input() allowDesignEdit: boolean;
    // public
    public printerList: string[] = [];
    public printerIndex: any = 0;

    public configAutoFeeder = true;
    public configPageSide = true;
    public configResolution = 200;
    public EnumPixelType = EnumDWT_PixelType;
    public configColorMode: EnumDWT_PixelType.TWPT_GRAY | EnumDWT_PixelType.TWPT_BW | EnumDWT_PixelType.TWPT_RGB =
        EnumDWT_PixelType.TWPT_RGB;
    private idSetting: any = null;

    public isReadyScan = false;
    private xoonitScanWS: any;
    private scanTotal = 0;
    private scanStorageTotal = 0;

    public isLoadingScan = false;
    public isLoadingPrinterList = true;
    private typeScan: 0 | 1 | 2 = 0;
    public previewButtonDisabled = true;
    public switchToAnotherLib = false;
    private preventWarningDialog = false;
    private _popupWarning: any;

    // dialog doctype
    public doctypeSelected: DocumentTreeModel;

    private DWObject: any;
    private keywordStorage = 'imageListScan_';

    @ViewChild('scanConfigurationScanSetting') scanConfigurationScanSetting: TemplateRef<any>;
    @ViewChild('scanConfigurationAppRequired') scanConfigurationAppRequired: TemplateRef<any>;

    constructor(
        protected router: Router,
        private scanningAction: ScanningActions,
        private ref: ChangeDetectorRef,
        private toasterService: ToasterService,
        private scanningService: ScanningService,
        private scanningProcess: ScanningProcess,
        private uti: Uti,
        private documentManagementSelectors: DocumentManagementSelectors,
        private dispatcher: ReducerManagerDispatcher,
        private element: ElementRef,
        private store: Store<AppState>,
        private popupService: PopupService,
        private layoutInfoAction: LayoutInfoActions,
        private downloadFile: DownloadFileService,
    ) {
        super(router);
        const user: User = this.uti.getUserInfo();
        if (user.email) {
            this.keywordStorage += user.email;
        }
    }

    ngOnInit() {
        this.scanningProcess.TabIDScanningConfiguration = this.tabID;
        this.initXoonitScan();
        this.getThumbnails();
        this.subscriptions();
    }

    ngOnChanges(changes: SimpleChanges) {
        if (changes['allowDesignEdit'] && !changes['allowDesignEdit'].firstChange) {
            if (this.allowDesignEdit) {
                this.store.dispatch(this.layoutInfoAction.toggleScanSplitArea(true, true, this.ofModule));
            } else {
                this.getThumbnails();
            }
        }
    }

    ngOnDestroy() {
        Uti.unsubscribe(this);
        super.onDestroy();
    }

    public changeLib() {
        this.printerList = [];
        this.switchToAnotherLib = !this.switchToAnotherLib;
        if (this.switchToAnotherLib) {
            this.initDynamsoft();
        } else {
            if (!this.DWObject) Dynamsoft.WebTwainEnv.CloseDialog();
            this.initXoonitScan();
        }
    }

    public downloadScanFile() {
        const url = Uti.getFileUrl('XoonitScan.zip', null, 'XoonitScan.zip', 'Programs');
        this.downloadFile.downloadFileWithIframe(url);
    }

    public openScanSettings() {
        this.popupService.open({
            content: this.scanConfigurationScanSetting,
            hasBackdrop: true,
            header: new HeaderNoticeRef({
                iconClose: true,
                title: 'POPUP_title__Scan_Setting',
                icon: { content: '', type: 'resource' },
                withTranslate: true,
            }),
            disableCloseOutside: true,
        });
    }

    public scan(IfShowUI: boolean) {
        if (this.switchToAnotherLib) {
            this.sendMessageToWS(XoonitScanToolType.CloseApp);
            this.scanWithDynamsoft(IfShowUI);
        } else {
            this.scanWithXoonitScanningTool(IfShowUI);
        }
    }

    public previewScanImageMode() {
        this.previewButtonDisabled = false;
        if (this._popupWarning) {
            this._popupWarning.close();
            this._popupWarning = null;
        } else {
            this.preventWarningDialog = true;
        }

        this.scanningProcess.TabIDScanningConfiguration_IsFullScreen = $(this.element.nativeElement)
            .closest('widget-module-info')
            .parent()
            .hasClass('maximize-widget-mode');

        this.store.dispatch(this.layoutInfoAction.toggleScanSplitArea(true, false, this.ofModule));
        if (this.scanningProcess.TabIDScanningConfiguration_IsFullScreen) {
            //minimize the current (Configuration)
            this.requestToggleFullScreen(this.tabID, false);
        }

        if (this.scanningProcess.TabIDScanningImagePreview_IsFullScreen) {
            //maximize ImagePreview
            this.requestToggleFullScreen(this.scanningProcess.TabIDScanningImagePreview, true);
        }
    }

    private requestToggleFullScreen(tabID, isMaximized) {
        this.store.dispatch(
            this.layoutInfoAction.requestToggleFullScreen(this.ofModule, { tabID: tabID, isMaximized: isMaximized }),
        );
    }

    // Dynamsoft
    private initDynamsoft() {
        ///
        if (this.DWObject) {
            this.getPrinter();
            return;
        }

        Dynamsoft.WebTwainEnv.Containers = [{ ContainerId: 'dwtcontrolContainer', Width: '0', Height: '0' }];

        Dynamsoft.WebTwainEnv.RegisterEvent('OnWebTwainReady', () => {
            this.Dynamsoft_OnReady();
        });
        // window.onclick = (event: any) => {
        //     if (event.target.id === 'dwt-btn-install') {
        //         console.log('dwt-btn-install', event.target.id);
        //     }
        // };
        Dynamsoft.WebTwainEnv.Load();
    }

    private Dynamsoft_OnReady() {
        this.DWObject = Dynamsoft.WebTwainEnv.GetWebTwain('dwtcontrolContainer');
        if (!this.DWObject) return;
        this.DWObject.LogLevel = 0;
        this.DWObject.IfAllowLocalCache = true;
        this.DWObject.ImageCaptureDriverType = 3;

        this.getPrinter();

        this.store.dispatch(this.scanningAction.loadConfigurationScanSettingDone());
    }

    private getPrinter() {
        this.isLoadingPrinterList = true;
        const totalPrinter: number = this.DWObject.SourceCount;
        if (this.switchToAnotherLib) {
            for (let index = 0; index < totalPrinter; index++) {
                const printer = this.DWObject.GetSourceNameItems(index);
                if (printer) this.printerList.push(printer);
            }
        }
        this.printerIndex = 0;
        this.isLoadingPrinterList = false;
    }

    private subscriptions() {
        this.documentManagementSelectors
            .actionOfType$(DocumentManagementActionNames.GET_DOCUMENT_FILES_BY_FOLDER)
            .filter((action: GetDocumentFilesByFolderAction) => !!action.payload)
            .takeUntil(this.getUnsubscriberNotifier())
            .subscribe((action: GetDocumentFilesByFolderAction) => {
                const folder = action.payload;
                this.doctypeSelected = folder;
            });

        this.dispatcher
            .pipe(
                filter((action: CustomAction) => {
                    return action.type === ScanningActions.SCANNING_ACTION_DELETE_IMAGE;
                }),
                takeUntil(this.getUnsubscriberNotifier()),
            )
            .subscribe((action: CustomAction) => {
                this.getThumbnails();
            });
    }

    private scanWithDynamsoft(IfShowUI: boolean) {
        if (IfShowUI) {
            this.ref.reattach();
            this.ref.detectChanges();
        }
        if (this.isLoadingScan) return;

        this.typeScan = 0;

        this.isLoadingScan = true;
        this.ref.reattach();
        this.ref.detectChanges();
        setTimeout(() => {
            if (this.DWObject.SourceCount > 0 && this.DWObject.SelectSourceByIndex(this.printerIndex)) {
                const onAcquireImageSuccess = (p) => {
                    this.isLoadingScan = false;

                    this.SaveWithFileDialog();
                    this.DWObject.CloseSource();
                    this.ref.detectChanges();
                };
                const onAcquireImageFailure = (errorCode, errorString) => {
                    this.DWObject.CloseSource();
                    this.isLoadingScan = false;
                    this.ref.detectChanges();
                    this.toasterService.pop(MessageModal.MessageType.error, 'Scan', errorString);
                };
                this.DWObject.CloseSource();
                this.DWObject.OpenSource();
                this.DWObject.AcquireImage(
                    {
                        IfFeederEnabled: this.configAutoFeeder,
                        Resolution: this.configResolution,
                        PixelType: this.configColorMode,
                        IfShowUI: IfShowUI,
                        IfDuplexEnabled: this.configPageSide,
                        IfAutoDiscardBlankpages: true,
                    },
                    onAcquireImageSuccess.bind(this),
                    onAcquireImageFailure.bind(this),
                );
            } else {
                this.isLoadingScan = false;
                this.ref.detectChanges();
                alert('No Source Available!');
            }
        }, 100);
    }

    private SaveWithFileDialog() {
        const DWObject = this.DWObject;
        if (DWObject) {
            const totalPage: number = DWObject.HowManyImagesInBuffer;
            let validPage = totalPage;
            if (totalPage) {
                let result = [];
                const asyncSuccessFunc = (base64, newIndices) => {
                    const length: number = base64.getLength();
                    this.resizeImageToFullHD(
                        'data:image/jpeg;base64,' + base64.getData(0, length),
                        ((base64Converted: string) => {
                            if (!base64Converted) {
                                console.error('Error when resize image');
                                validPage -= 1;
                                return;
                            }
                            const requestQ = {
                                image: new ImageThumbnailModel({
                                    Base64: base64Converted,
                                    IdDocumentContainerOcr: guid(),
                                    IdDocumentContainerScans: guid(),
                                    PageNr: 1,
                                    NumberOfImages: '1',
                                    IsOriginal: true,
                                    DoctypeSelected: this.doctypeSelected,
                                }),
                                newIndices: newIndices[0],
                            };
                            result.push(requestQ);
                            if (result.length === validPage) {
                                result = orderBy(result, ['newIndices'], ['asc']);
                                result = map(result, 'image');
                                localForage.getItem(this.keywordStorage).then((response: any) => {
                                    let list: ImageThumbnailModel[] = <ImageThumbnailModel[]>JSON.parse(response) || [];
                                    list = list.concat(result);
                                    localForage.setItem(this.keywordStorage, JSON.stringify(list));
                                    this.toasterService.pop(
                                        MessageModal.MessageType.success,
                                        'Scan success',
                                        result.length + ' items',
                                    );
                                    if (list.length > 0) {
                                        setTimeout(() => {
                                            this.previewScanImageMode();
                                        }, 300);
                                    }
                                });

                                setTimeout(() => {
                                    // this.store.dispatch(
                                    //     this.administrationDocumentActions.changeModeSelectableFolder(100000),
                                    // );
                                    this.DWObject.RemoveAllImages();
                                }, 100);
                            }
                        }).bind(this),
                    );
                };
                for (let index = 0; index < totalPage; index++) {
                    if (!DWObject.IsBlankImageExpress(index)) {
                        DWObject.ConvertToBase64([index], 3, asyncSuccessFunc.bind(this), () => undefined);
                    } else {
                        validPage -= 1;
                    }
                }
            }
        }
    }

    public scanBase64() {
        // console.log('this.doctypeSelected', this.doctypeSelected);
        // if (!this.doctypeSelected) {
        //     return;
        // }
        this.resizeImageToFullHD(imageBase64, (base64converted: string) => {
            const result = [
                {
                    Base64: imageBase64,
                    IdDocumentContainerOcr: guid(),
                    IdDocumentContainerScans: guid(),
                    PageNr: 1,
                    NumberOfImages: 1,
                    IsOriginal: true,
                    DoctypeSelected: this.doctypeSelected,
                },
                {
                    Base64: base64converted,
                    IdDocumentContainerOcr: guid(),
                    IdDocumentContainerScans: guid(),
                    PageNr: 1,
                    NumberOfImages: 1,
                    IsOriginal: true,
                    DoctypeSelected: this.doctypeSelected,
                },
            ];
            localForage.getItem(this.keywordStorage).then((response: any) => {
                let list: ImageThumbnailModel[] = <ImageThumbnailModel[]>JSON.parse(response) || [];
                list = list.concat(result);
                localForage.setItem(this.keywordStorage, JSON.stringify(list));
                if (list.length > 0) {
                    setTimeout(() => {
                        this.previewScanImageMode();
                    }, 300);
                }
            });
        });
    }

    // End dynamsoft

    // New scan
    public initXoonitScan() {
        this.isLoadingPrinterList = true;
        this.printerList = [];
        if (this.xoonitScanWS) {
            this.sendMessageToWS(XoonitScanToolType.GetScanner);
            return;
        }
        const wsImpl = window.WebSocket || window['MozWebSocket'];
        const ws = new wsImpl('ws://localhost:6969/');
        ws.onmessage = function (e) {
            if (!e.data) return;
            if (e.data instanceof Blob) {
                console.log('XoonitScan: Receive message send image');
                this.parseImageFromBlob(e.data);
                this.scanTotal += 1;
            } else {
                console.log('XoonitScan: Receive message : ', e.data);
                const data = JSON.parse(e.data);

                switch (data.type) {
                    case XoonitScanToolType.GetScanner:
                        if (!this.switchToAnotherLib) {
                            this.printerList = data.data;
                            this.printerIndex = 0;
                        }
                        this.isLoadingPrinterList = false;
                        this.ref.detectChanges();

                        break;
                    case XoonitScanToolType.CompleteScan:
                        this.isLoadingScan = false;
                        if (this.scanTotal) {
                            this.toasterService.pop(
                                MessageModal.MessageType.success,
                                'Scan success',
                                this.scanTotal + ' items',
                            );
                            this.handleCompleteScanAndPreview();
                        } else {
                            this.toasterService.pop(MessageModal.MessageType.warning, 'Scan fail', data.data);
                        }
                        break;
                    default:
                        break;
                }
            }
        }.bind(this);
        ws.onclose = function () {
            this.xoonitScanWS = null;
        }.bind(this);
        ws.onopen = function () {
            if (ws.readyState == 1) {
                this.closeWarningDialog();
                this.xoonitScanWS = ws;
                this.sendMessageToWS(XoonitScanToolType.GetScanner);
                this.isReadyScan = true;
                this.ref.detectChanges();
            } else {
                if (this.preventWarningDialog) {
                    this.preventWarningDialog = false;
                    return;
                }
                this.sendMessageToWS(XoonitScanToolType.CloseApp);
                this._openWarningAppRequiredDialog();
            }
        }.bind(this);
        ws.onerror = function (e) {
            this.isLoadingPrinterList = false;
            this.isReadyScan = false;
            this.xoonitScanWS = null;
            if (this.preventWarningDialog) {
                this.preventWarningDialog = false;
                return;
            }
            this._openWarningAppRequiredDialog();
            this.ref.detectChanges();
        }.bind(this);
    }

    public stopScan() {
        this.sendMessageToWS(XoonitScanToolType.StopScan);
        this.isLoadingScan = false;
        if (this.scanTotal) {
            this.handleCompleteScanAndPreview();
        }
    }

    private sendMessageToWS(message: string, value?: any) {
        if (!this.xoonitScanWS || this.xoonitScanWS.readyState != 1) {
            return;
        }
        const request: any = { type: message };
        if (!isNil(value)) {
            request.data = value;
        }
        console.log('XoonitScan: Send message', request);
        this.xoonitScanWS.send(JSON.stringify(request));
    }

    private handleCompleteScanAndPreview() {
        if (this.scanStorageTotal === this.scanTotal) {
            this.previewScanImageMode();
            this.scanTotal = 0;
        } else {
            setTimeout(() => {
                this.handleCompleteScanAndPreview();
            }, 500);
        }
    }

    private scanWithXoonitScanningTool(IfShowUI: boolean) {
        if (!this.xoonitScanWS || this.xoonitScanWS.readyState != 1) {
            this.initXoonitScan();
            return;
        }
        if (IfShowUI) {
            this.sendMessageToWS(XoonitScanToolType.OpenScanAdvance);
            return;
        }
        this.isLoadingScan = true;

        this.sendMessageToWS(XoonitScanToolType.Scan);
    }

    private parseImageFromBlob(file) {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onloadend = function () {
            let base64data = reader.result;
            if (typeof base64data === 'string') {
                base64data = base64data.split(',')[1];
            }

            this.resizeImageToFullHD('data:image/jpeg;base64,' + base64data, (base64Converted: string) => {
                if (!base64Converted) {
                    this.totalPage -= 1;
                    console.error('Error when resize image');
                    return;
                }
                const requestQ = new ImageThumbnailModel({
                    Base64: base64Converted,
                    IdDocumentContainerOcr: guid(),
                    IdDocumentContainerScans: guid(),
                    PageNr: 1,
                    NumberOfImages: '1',
                    IsOriginal: true,
                    DoctypeSelected: this.doctypeSelected,
                });
                localForage.getItem(this.keywordStorage).then((response: any) => {
                    let list: ImageThumbnailModel[] = <ImageThumbnailModel[]>JSON.parse(response) || [];
                    list = list.concat([requestQ]);
                    localForage.setItem(this.keywordStorage, JSON.stringify(list)).then(() => {
                        this.scanStorageTotal += 1;
                    });
                });
            });
        }.bind(this);
    }

    // End

    private getThumbnails() {
        if (this.allowDesignEdit) return;
        localForage
            .getItem(this.keywordStorage)
            .then((response: any) => {
                const list: ImageThumbnailModel[] = <ImageThumbnailModel[]>JSON.parse(response) || [];
                if (list.length > 0) {
                    this.previewScanImageMode();
                } else {
                    this.store.dispatch(this.layoutInfoAction.toggleScanSplitArea(false, true, this.ofModule));
                    this.previewButtonDisabled = true;
                }
                this.getScanSetting();
            })
            .catch((error: any) => {
                this.getScanSetting();
            });
    }

    public getScanSetting() {
        this.scanningService.getScanSetting().subscribe((response: any) => {
            let setting: any = get(response, ['item', 0, 'JsonSettings']);
            this.idSetting = get(response, ['item', 0, 'IdSettingsScans']) || null;
            if (setting) {
                setting = JSON.parse(setting);
                this.configAutoFeeder = this.getConfigByKeyword(setting, 'configAutoFeeder', true);
                this.configPageSide = this.getConfigByKeyword(setting, 'configPageSide', true);
                this.configResolution = this.getConfigByKeyword(setting, 'configResolution', 200);
                this.configColorMode = this.getConfigByKeyword(setting, 'configColorMode', EnumDWT_PixelType.TWPT_RGB);
                this.setConfigXoonitScanTool();
            }
        });
    }

    private setConfigXoonitScanTool() {
        if (this.xoonitScanWS && this.xoonitScanWS.readyState == 1) {
            this.sendMessageToWS(XoonitScanToolType.SelectScanner, this.printerList[this.printerIndex]);
            this.sendMessageToWS(XoonitScanToolType.SetDPI, this.configResolution);
            this.sendMessageToWS(XoonitScanToolType.SetColor, this.configColorMode);
        } else {
            if (!this.xoonitScanWS) {
                setTimeout(() => {
                    this.setConfigXoonitScanTool();
                }, 1000);
            }
        }
    }

    private getConfigByKeyword(setting: any, keyword: string, defaultValue: any) {
        if (has(setting, keyword)) {
            return get(setting, keyword);
        }
        return defaultValue;
    }

    public saveScanSetting() {
        const data = {
            configAutoFeeder: this.configAutoFeeder,
            configPageSide: this.configPageSide,
            configResolution: this.configResolution,
            configColorMode: this.configColorMode,
        };
        const params = {
            IsActive: true,
            JSONScanSettings: JSON.stringify(data),
            IdSettingsScans: this.idSetting,
        };
        this.scanningService.setScanSetting(params).subscribe(
            (response: any) => {
                this.setConfigXoonitScanTool();
            },
            (err) => {},
        );
    }

    public selectedScanner(scannerIndex: number) {
        this.printerIndex = scannerIndex;
        if (!this.switchToAnotherLib && this.xoonitScanWS && this.xoonitScanWS.readyState == 1) {
            this.sendMessageToWS(XoonitScanToolType.SelectScanner, this.printerList[this.printerIndex]);
        }
    }

    private resizeImageToFullHD(imgSrc: string, callback: any) {
        const canvas = document.createElement('canvas');

        const ctx = canvas.getContext('2d');
        const img = new Image();
        img.onload = function () {
            const isVerticalImg = img.width < img.height;
            let maxW = 1900;
            let maxH = 1028;
            if (isVerticalImg) {
                maxW = 1028;
                maxH = 1900;
            }
            const width = img.width;
            const height = img.height;
            const scale = Math.min(maxW / width, maxH / height);
            const widthScaled = width * scale;
            const heightScaled = height * scale;
            canvas.width = widthScaled;
            canvas.height = heightScaled;
            ctx.drawImage(img, 0, 0, widthScaled, heightScaled);
            //
            callback(canvas.toDataURL('image/jpeg', 1.0));
        };
        img.onerror = function () {
            callback('');
        };
        img.src = imgSrc;
    }

    private _openWarningAppRequiredDialog() {
        if (this._popupWarning) return;
        this._popupWarning = this.popupService.open({
            content: this.scanConfigurationAppRequired,
            header: new HeaderNoticeRef({ iconClose: true, title: 'POPUP_title__App_Require', withTranslate: true }),
            hasBackdrop: true,
        });
        this._popupWarning.afterClosed$.subscribe((res) => {
            this._popupWarning = null;
        });
    }

    public closeWarningDialog() {
        if (this._popupWarning) {
            this._popupWarning.close();
        }
    }
}
