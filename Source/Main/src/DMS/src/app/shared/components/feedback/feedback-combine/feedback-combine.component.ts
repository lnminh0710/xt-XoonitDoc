import {
    Component,
    OnInit,
    Input,
    Output,
    EventEmitter,
    ViewChild,
    OnDestroy,
    ChangeDetectorRef
} from '@angular/core';
import {
    Router
} from '@angular/router';
import html2canvas from "html2canvas";
import {
    ToasterService
} from 'angular2-toaster/angular2-toaster';
import {
    Observable
} from 'rxjs/Observable';
import {
    Store
} from '@ngrx/store';
import * as tabSummaryReducer from '@app/state-management/store/reducer/tab-summary';
// import * as dataEntryReducer from '@app/state-management/store/reducer/data-entry';
import * as parkedItemReducer from '@app/state-management/store/reducer/parked-item';
import { ApiResultResponse, BrowserInfoModel, EmailModel, Module, SendOrderToAdministatorModel, SimpleTabModel, TabSummaryModel } from '@app/models';
import { Subscription } from 'rxjs';
import { BaseComponent } from '@app/pages/private/base';
import { XnCommonActions } from '@app/state-management/store/actions';
import { AppErrorHandler, CommonService } from '@app/services';
import { AppState } from '@app/state-management/store';
import { FeedbackPopupComponent } from '../feedback-popup';
import { Uti } from '@app/utilities';
import { Configuration } from '@app/app.constants';

@Component({
    selector: 'feedback-combine',
    styleUrls: ['./feedback-combine.component.scss'],
    templateUrl: './feedback-combine.component.html'
})
export class FeedbackCombineComponent extends BaseComponent implements OnInit, OnDestroy {
    public isShowFeedBack: boolean = false;
    public isShowCapture: boolean = false;
    public feedbackData: any = {};
    public isSending: boolean = false;
    public isCreate: boolean = true;
    public captureItems: any = [];
    public imageTemps: Array<any> = [];
    public showImageReview: boolean = false;
    public imageViewerConfig: any = {
        style: '',
        styleClass: '',
        panelWidth: 0,
        panelHeight: 0,
        frameWidth: null,
        frameHeight: null,
        activeIndex: 0,
        showFilmstrip: false,
        autoPlay: false,
        transitionInterval: null,
        showCaption: false,
        item: {},
    }
    public feedbackStoreData: any = {};
    public scanningStatusData: any = {};

    private idScansContainerItems: number;
    private dataUrl: string = '';
    private img = new Image();
    private canvas: any;
    private fileAttachedUrl: string = '';
    private activeModuleState: Observable<Module>;
    private activeSubModuleState: Observable<Module>;
    private selectedTabState: Observable<TabSummaryModel>;
    private selectedSimpleTabState: Observable<SimpleTabModel>;
    private selectedODETabState: Observable<SimpleTabModel>;
    private selectedSubTabState: Observable<SimpleTabModel>;
    private selectedParkedItemState: Observable<any>;
    private orderDataMediaCodeState: Observable<string>;
    private selectedCampaignNumberState: Observable<string>;
    private dataEntryCustomerDataState: Observable<number>;
    private scanningStatusState: Observable<any>;

    private activeModuleStateSubscription: Subscription;
    private activeSubModuleStateSubscription: Subscription;
    private selectedTabStateSubscription: Subscription;
    private selectedSimpleTabStateSubscription: Subscription;
    private selectedODETabStateSubscription: Subscription;
    private selectedSubTabStateSubscription: Subscription;
    private selectedParkedItemStateSubscription: Subscription;
    private orderDataMediaCodeStateSubscription: Subscription;
    private selectedCampaignNumberStateSubcription: Subscription;
    private dataEntryCustomerDataStateSubcription: Subscription;
    private scanningStatusStateSubscription: Subscription;

    private browserInfo: BrowserInfoModel = new BrowserInfoModel();
    @Output() outputData: EventEmitter<any> = new EventEmitter();
    @ViewChild('feedbackPopup') feedbackPopup: FeedbackPopupComponent;

    constructor(private commonService: CommonService,
        private store: Store<AppState>,
        private appErrorHandler: AppErrorHandler,
        private xnCommonActions: XnCommonActions,
        private ref: ChangeDetectorRef,
        // private dataEntryAction: DataEntryActions,
        // private dataEntryService: DataEntryService,
        // private dataEntryProcess: DataEntryProcess,
        private toasterService: ToasterService,
        protected router: Router
    ) {
        super(router);
        this.registerSubscribeData(store);
        this.registerSubscribeDataGlobal(store);
    }
    public ngOnInit() {
        this.buidlConfigForImageReview();
        this.subscribeModuleData();
        this.subscribeTabData();
        this.subscribeEntityIdData();
        // this.initDomToImage();
    }

    public onRouteChanged() {
        this.buildModuleFromRoute();
        this.resetBrowserInfo();
        this.registerSubscribeData(this.store);
        this.subscribeTabData();
    }
    public ngOnDestroy() { }
    public actionRemoveHandler(captureItem: any) {
        const datas = [...this.captureItems];
        Uti.removeItemInArray(datas, captureItem, 'id');
        this.captureItems = [];
        setTimeout(() => {
            this.captureItems = datas;
        });

        const imageTemps = [...this.imageTemps];
        Uti.removeItemInArray(imageTemps, captureItem, 'id');
        this.imageTemps = [];
        setTimeout(() => {
            this.imageTemps = imageTemps;
            this.feedbackPopup.makePopupSize();
        });
    }
    public actionUpdateCommentHandler(captureItem: any) {
        const captureItems = [...this.captureItems];
        for (let item of this.imageTemps) {
            if (captureItem.id === item.id) {
                item.image = this.createImageWithData(captureItem)
                break;
            }
        }
        this.ref.detectChanges();
        this.feedbackPopup.makeBlinkCapture(captureItem, false);
    }
    private createTempImage(captureItem: any) {
        const newItem = {
            id: captureItem.id,
            image: this.createImageWithData(captureItem),
            text: '',
            canRemove: true
        }
        this.imageTemps.push(newItem);
        this.feedbackPopup.makePopupSize();
        this.feedbackPopup.updateSendToAdminImageToCaptureList();
        this.ref.detectChanges();
        this.feedbackPopup.makeBlinkCapture(captureItem, true);
    }
    public hideFeedback() {
        this.feedbackPopup.closeDialog();
        this.resetData();
    }
    public resetData() {
        this.feedbackPopup.resetForm();
        this.isShowFeedBack = this.isShowCapture = this.isSending = false;
        this.feedbackData = {};
        this.isCreate = true;
        this.captureItems = this.imageTemps = [];
        this.img = this.canvas = null;
        this.feedbackPopup.makePopupSize();
        this.dataUrl = '';
        this.store.dispatch(this.xnCommonActions.showFeedbackClicked(false));
    }
    public showFeedback() {
        this.isShowFeedBack = true;
        html2canvas(document.body).then(result => {
            this.img = new Image();
            this.canvas = document.createElement("canvas");
            this.img.src = result.toDataURL();
            this.dataUrl = this.img.src;
            this.feedbackPopup.showDialog();
            this.store.dispatch(this.xnCommonActions.showFeedbackComplete());
        });
        this.showImageForSendToAdmin();

        //toPng(document.body)
        //.then(dataUrl => {
        //    // var img = new Image();
        //    // img.src = dataUrl;
        //    // document.body.appendChild(img);

        //    this.img = new Image();
        //    this.canvas = document.createElement("canvas");
        //    this.img.src = dataUrl;
        //    this.dataUrl = this.img.src;
        //    this.feedbackPopup.showDialog();
        //    this.store.dispatch(this.xnCommonActions.showFeedbackComplete());
        //})
        //.catch(function (error) {
        //    console.error('oops, something went wrong!', error);
        //    });

        //domtoimage.toPng(document.body)
        //    .then(function (dataUrl) {
        //        var img = new Image();
        //        img.src = dataUrl;
        //        document.body.appendChild(img);
        //    })
        //    .catch(function (error) {
        //        console.error('oops, something went wrong!', error);
        //    });
    }
    private showImageForSendToAdmin() {
        setTimeout(() => {
            if (this.feedbackStoreData.isSendToAdmin) {
                if (this.scanningStatusStateSubscription) {
                    this.scanningStatusStateSubscription.unsubscribe();
                }
                // this.scanningStatusState = this.store.select(state => dataEntryReducer.getDataEntryState(state, this.feedbackStoreData.tabID).scanningStatusData);
                this.subscribeScansContainerItems();
            }
        }, 200);
    }
    private initDomToImage() {
        //domtoimage.installJS("public/assets/lib/dom-to-image.zip", ["dom-to-image.js"], () => {
        //    console.log('load xlsx completed');
        //});
    }
    public hideCapture() {
        this.isShowCapture = false;
        this.feedbackPopup.showDialog();
    }
    public showCapture() {
        this.isShowCapture = true;
        this.feedbackPopup.closeDialogWithoutEmit();
    }
    public addImageHandler(data) {
        this.isShowCapture = false;
        data.id = Uti.getTempId2();
        this.captureItems = [...this.captureItems, data];
        this.feedbackPopup.showDialog();
        this.createTempImage(data);
    }
    public outputFeedbackData(data: any) {
        this.feedbackData = data;
    }
    public sendMailHandler() {
        if (!this.checkDataBeforeSendEmail()) return;
        this.isSending = true;
        this.makeMoreBrowserInfo();
        let feedBackModel = this.createFeedBackModel();
        if (Configuration.PublicSettings && Configuration.PublicSettings.systemInfo) {
            feedBackModel.DatabaseName = Configuration.PublicSettings.systemInfo.CurrentDatabase;
            feedBackModel.Subject = '[' + feedBackModel.DatabaseName + ']-' + feedBackModel.Subject;
        }
        this.sendEmail(feedBackModel);
    }
    public removeItemHandle($event) {
        Uti.removeItemInArray(this.captureItems, $event, 'id');
    }
    public showImageReviewHandle($event) {
        this.showImageReview = true;
        this.imageViewerConfig.item = $event;
        setTimeout(() => {
            let overlay = $(".ui-widget-overlay.ui-dialog-mask");
            if (!overlay || !overlay.length || overlay.length !== 2) return;
            $(overlay[1]).addClass('ui-widget-overlay-second');
        }, 300);
    }
    public closeImageReviewHandle() {
        this.showImageReview = false;
    }
    /*************************************************************************************************/
    /***************************************PRIVATE METHOD********************************************/
    private buildEmailAttached(): Array<any> {
        return this.getCroppedImg();
    }
    private resetBrowserInfo() {
        this.browserInfo.EntityId = null;
        this.browserInfo.CampaignNumber = null;
        this.browserInfo.CustomerNumber = null;
        this.browserInfo.Mediacode = null;
    }
    private checkDataBeforeSendEmail(): boolean {
        if (!this.feedbackStoreData) {
            this.toasterService.pop('warning', 'Warning', 'Has no data to send!');
            return false;
        }
        if (!this.feedbackStoreData.isSendToAdmin) {
            return true;
        }
        if (this.idScansContainerItems) {
            return true;
        }
        this.toasterService.pop('warning', 'Warning', 'Please select a document to send to admin!');
        return false;
    }
    private createFeedBackModel() {
        return new EmailModel({
            ToEmail: '',
            Subject: '[' + this.feedbackData.formValue.priority + ']-' + '[' + this.feedbackData.formValue.typeText + ']: ' + this.feedbackData.formValue.subject,
            Body: this.feedbackData.formValue.content,
            ImageAttached: this.buildEmailAttached(),
            Priority: this.feedbackData.formValue.priority,
            BrowserInfo: Uti.getBrowserInfo(this.browserInfo),
            IdRepNotificationType: this.feedbackData.formValue.type,
            Type: ((this.feedbackStoreData && this.feedbackStoreData.isSendToAdmin) ? 'SendToAdmin' : 'FeedBack'),
            FileAttachedUrl: this.fileAttachedUrl
        });
    }
    private sendEmail(email: any) {
        this.commonService.SendEmailWithImageAttached(email).subscribe(
            (response: ApiResultResponse) => {
                this.appErrorHandler.executeAction(() => {
                    this.isSending = false;
                    if (!Uti.isResquestSuccess(response) || !response.item) {
                        this.toasterService.pop('error', 'Failed', 'Email sending is failed');
                        return;
                    }
                    this.sendEmailOnSuccess();
                });
            },
            error => {
                //this.toasterService.pop('error', 'Failed', 'Email sending is failed');
                this.sendEmailOnSuccess();
            });
    }
    private sendEmailOnSuccess() {
        this.sendToAdmin();
        this.store.dispatch(this.xnCommonActions.reLoadFeedbacData());
        if (this.feedbackStoreData && !this.feedbackStoreData.isSendToAdmin) {
            this.toasterService.pop('success', 'Success', 'Email sending is successful');
        }
        this.hideFeedback();
    }

    private sendToAdmin() {
        if (this.feedbackStoreData && this.feedbackStoreData.isSendToAdmin) {
            // this.dataEntryService.sendOrderToAdministrator(this.createSendToAdminModel()).subscribe((response: any) => {
            //     this.appErrorHandler.executeAction(() => {
            //         if (!response || !response.returnID) {
            //             this.toasterService.pop('error', 'Failed', 'Can not send to Admin!');
            //             return;
            //         }
            //         this.toasterService.pop('success', 'Success', 'The message has sent to Admin');
            //         // Skip this item
            //         this.store.dispatch(this.dataEntryAction.dataEntryScanningStatusCallSkip(true, this.feedbackStoreData.tabID));
            //     });
            // });
        }
    }
    private createSendToAdminModel() {
        let user = (new Uti()).getUserInfo();
        return new SendOrderToAdministatorModel({
            idLoginToAdmin: parseFloat(user.id),
            idRepNotificationType: this.feedbackData.formValue.type,
            idScansContainerItems: this.idScansContainerItems || null,
            notes: this.feedbackData.formValue.content
        });
    }
    private getCroppedImg(): Array<any> {
        const result = this.imageTemps.map(x => {
            return {
                Source: x.image,
                Text: x.text
            }
        });
        return result;
    }
    private createImageWithData(captureItem: any): string {
        this.canvas.width = captureItem.width;
        this.canvas.height = captureItem.height;
        var ctx = this.canvas.getContext("2d");
        ctx.drawImage(this.img, captureItem.left, captureItem.top, captureItem.width, captureItem.height, 0, 0, captureItem.width, captureItem.height);
        const dataURL = ctx.canvas.toDataURL();
        return dataURL;
    }
    private buidlConfigForImageReview() {
        let document = $(window);
        this.imageViewerConfig.panelWidth = document.width() - 500;
        this.imageViewerConfig.panelHeight = document.height() - 300;
    }
    private registerSubscribeDataGlobal(store: Store<AppState>) {
        this.activeModuleState = store.select(state => state.mainModule.activeModule);
        this.activeSubModuleState = store.select(state => state.mainModule.activeSubModule);

        // this.orderDataMediaCodeState = store.select(state => dataEntryReducer.getDataEntryState(state, this.browserInfo.SelectedODETab).orderDataWidgetMediaCode);
        // this.selectedCampaignNumberState = this.store.select(state => dataEntryReducer.getDataEntryState(state, this.browserInfo.SelectedODETab).selectedCampaignNumberData);
        // this.dataEntryCustomerDataState = this.store.select(state => dataEntryReducer.getDataEntryState(state, this.browserInfo.SelectedODETab).customerId);
    }
    private registerSubscribeData(store: Store<AppState>) {
        this.selectedTabState = store.select(state => tabSummaryReducer.getTabSummaryState(state, this.ofModule.moduleNameTrim).selectedTab);
        this.selectedSimpleTabState = store.select(state => tabSummaryReducer.getTabSummaryState(state, this.ofModule.moduleNameTrim).selectedSimpleTab);
        this.selectedODETabState = store.select(state => tabSummaryReducer.getTabSummaryState(state, this.ofModule.moduleNameTrim).selectedODETab);
        this.selectedSubTabState = store.select(state => tabSummaryReducer.getTabSummaryState(state, this.ofModule.moduleNameTrim).selectedSubTab);
        this.selectedParkedItemState = store.select(state => parkedItemReducer.getParkedItemState(state, this.ofModule.moduleNameTrim).selectedParkedItem);
    }

    private getImageToBase64(fileName: string) {
        // Uti.toDataURL('/api/FileManager/GetFile?&name=20190110-144232.723_Order.tiff.1.png&mode=1', (result) => {
        Uti.toDataURL('/api/FileManager/GetScanFile?&name='+fileName, (result) => {
            if (!result) return;
            this.browserInfo.SendToAdminImage = result;
            this.feedbackPopup.addImageOfSendToAdmin();
        });
    }

    private subscribeModuleData() {
        this.activeModuleStateSubscription = this.activeModuleState.subscribe((module: Module) => {
            this.appErrorHandler.executeAction(() => {
                if (!module) {
                    this.browserInfo.Module = null;
                    return;
                }
                this.browserInfo.Module = module.moduleName;
            });
        });
        this.activeSubModuleStateSubscription = this.activeSubModuleState.subscribe((module: Module) => {
            this.appErrorHandler.executeAction(() => {
                if (!module) {
                    this.browserInfo.SubModule = null;
                    return;
                }
                this.browserInfo.SubModule = module.moduleName;
            });
        });
    }
    private subscribeTabData() {
        if (this.selectedTabStateSubscription) this.selectedTabStateSubscription.unsubscribe();
        this.selectedTabStateSubscription = this.selectedTabState.subscribe((selectedTab: any) => {
            this.appErrorHandler.executeAction(() => {
                if (!selectedTab || !selectedTab.tabSummaryInfor) {
                    this.browserInfo.SelectedTab = null;
                    return;
                }
                this.browserInfo.SelectedTab = selectedTab.tabSummaryInfor.tabName;
            });
        });
        if (this.selectedSimpleTabStateSubscription) this.selectedSimpleTabStateSubscription.unsubscribe();
        this.selectedSimpleTabStateSubscription = this.selectedSimpleTabState.subscribe((selectedSimpleTab: SimpleTabModel) => {
            this.appErrorHandler.executeAction(() => {
                if (!selectedSimpleTab) {
                    this.browserInfo.SelectedSubTab = null;
                    return;
                }
                this.browserInfo.SelectedSubTab = selectedSimpleTab.TabName;
            });
        });
        if (this.selectedODETabStateSubscription) this.selectedODETabStateSubscription.unsubscribe();
        this.selectedODETabStateSubscription = this.selectedODETabState.subscribe((selectedODETab: SimpleTabModel) => {
            this.appErrorHandler.executeAction(() => {
                if (!selectedODETab) {
                    this.browserInfo.SelectedODETab = null;
                    return;
                }
                this.browserInfo.SelectedODETab = selectedODETab.TabName;
            });
        });
        if (this.selectedSubTabStateSubscription) this.selectedSubTabStateSubscription.unsubscribe();
        this.selectedSubTabStateSubscription = this.selectedSubTabState.subscribe((selectedSubTab: any) => {
            this.appErrorHandler.executeAction(() => {
                if (!selectedSubTab) {
                    this.browserInfo.SelectedSubTab = null;
                    return;
                }
                this.browserInfo.SelectedSubTab = selectedSubTab.title;
            });
        });
        if (this.selectedParkedItemStateSubscription) this.selectedParkedItemStateSubscription.unsubscribe();
        this.selectedParkedItemStateSubscription = this.selectedParkedItemState.subscribe((selectedParkedItem: any) => {
            this.appErrorHandler.executeAction(() => {
                if (!selectedParkedItem || !selectedParkedItem.id) {
                    this.browserInfo.EntityId = null;
                    return;
                }
                this.browserInfo.EntityId = selectedParkedItem.id.value;
            });
        });
    }
    private subscribeEntityIdData() {
        // this.orderDataMediaCodeStateSubscription = this.orderDataMediaCodeState.subscribe((orderDataMediaCode: string) => {
        //     this.appErrorHandler.executeAction(() => {
        //         this.browserInfo.Mediacode = orderDataMediaCode || null;
        //     });
        // });
        // this.selectedCampaignNumberStateSubcription = this.selectedCampaignNumberState.subscribe((campaignNumber: string) => {
        //     this.appErrorHandler.executeAction(() => {
        //         this.browserInfo.CampaignNumber = campaignNumber || null;
        //     });
        // });
        // this.dataEntryCustomerDataStateSubcription = this.dataEntryCustomerDataState.subscribe((customerData: number) => {
        //     this.appErrorHandler.executeAction(() => {
        //         this.browserInfo.CustomerNumber = customerData ? customerData.toString() : '';
        //     });
        // });
    }

    private subscribeScansContainerItems(): void {
        this.scanningStatusStateSubscription = this.scanningStatusState.subscribe((scanningStatusState: any) => {
            this.appErrorHandler.executeAction(() => {
                if (scanningStatusState.length) {
                    if (!scanningStatusState || !scanningStatusState.length) {
                        this.fileAttachedUrl = '';
                        this.browserInfo.IdScansContainerItems = null;
                        this.browserInfo.SendToAdminImage = null;
                        this.scanningStatusData = [];
                        return;
                    }
                    this.idScansContainerItems = scanningStatusState[0].idScansContainerItems;
                    // this.fileAttachedUrl = this.dataEntryService.buildImageFullPath(scanningStatusState, 'pdf');
                    // this.getImageToBase64(this.dataEntryService.buildImageFullPath(scanningStatusState));
                    this.scanningStatusData = scanningStatusState;
                    this.browserInfo.IdScansContainerItems = scanningStatusState[0].idScansContainerItems;
                }
            });
        });
    }
    private makeMoreBrowserInfo() {
        this.browserInfo.Url = window.location.href;
        this.browserInfo.CaptureTime = (new Date()).toString();
    }
}
