import {
    AfterViewInit,
    ChangeDetectorRef,
    Component,
    ElementRef,
    EventEmitter,
    HostListener,
    Input,
    OnDestroy,
    OnInit,
    Output,
    ViewChild,
} from '@angular/core';
import { Router } from '@angular/router';
import { Module, User } from '@app/models';
import { NextDocument } from '@app/models/next-document.model';
import { ModuleList } from '@app/pages/private/base/base-component';
import {
    NotificationService, PropertyPanelService
} from '@app/services';
import { AppSelectors } from '@app/state-management/store/reducer/app';
import { Uti } from '@app/utilities';
import { MatDialog } from '@xn-control/light-material-ui/dialog';
import { forkJoin, Observable, Subject } from 'rxjs';
import { filter, switchMap, takeUntil, tap } from 'rxjs/operators';
import orderBy from 'lodash-es/orderBy';
import uniqBy from 'lodash-es/uniqBy';
import { AppState } from '@app/state-management/store';
import { ReducerManagerDispatcher, Store } from '@ngrx/store';
import * as propertyPanelReducer from '@app/state-management/store/reducer/property-panel';
import { MainNotificationTypeEnum, NotificationStatusEnum } from '@app/app.constants';
import { ToasterService } from 'angular2-toaster';
import { CustomAction, XnCommonActions } from '@app/state-management/store/actions';
import { NotificationListViewChildComponent } from './notification-list-view-child';

@Component({
    selector: '.notificationBox',
    styleUrls: ['./notification.component.scss'],
    templateUrl: './notification.component.html',
})
export class NotificationComponent implements OnInit, OnDestroy, AfterViewInit {
    private destroy$: Subject<void> = new Subject<void>();
    public isExpanded: boolean = true;
    public notificationList: any = [];
    public feedbackRawList: Array<any> = [];
    public feedbackList: Array<any> = [];
    public countNoti: number = 0;
    public isShow = false;
    public typeArchive: string = '';
    public isShowDetailPopup: boolean = false;
    public detailData: any = {};
    public isDataArchived: boolean = false;
    public isShowArchivePopup: boolean = false;

    private globalPropertiesState: Observable<any>;
    private globalDateFormat: string = null;
    private userData: User = new User();

    @Input() notiListener;
    @Output() onSelectedModule = new EventEmitter<Module>();

    @ViewChild('feedbackListComponent') feedbackListComponent: NotificationListViewChildComponent;

    constructor(
        protected router: Router,
        public dialog: MatDialog,
        private notificationService: NotificationService,
        private changeDetectorRef: ChangeDetectorRef,
        private appSelectors: AppSelectors,
        private store: Store<AppState>,
        private propertyPanelService: PropertyPanelService,
        private toasterService: ToasterService,
        private uti: Uti,
        private dispatcher: ReducerManagerDispatcher,
        private elementRef: ElementRef
    ) {
        this.userData = (new Uti()).getUserInfo();
        this.globalPropertiesState = this.store.select(state => propertyPanelReducer.getPropertyPanelState(state, ModuleList.Base.moduleNameTrim).globalProperties);
    }

    public ngOnInit() {
        this.notiListener && this.notiListener.pipe(takeUntil(this.destroy$)).subscribe(numberNotifi => {
            this.countNoti = (this.countNoti < 0 ? 0 : this.countNoti) + numberNotifi;
            this.changeDetectorRef.markForCheck();
        });
    }

    ngAfterViewInit() {
        this.globalPropertiesState.subscribe((globalProperties: any) => {
            if (globalProperties && globalProperties.length) {
                const globalDateFormat = this.propertyPanelService.buildGlobalDateFormatFromProperties(globalProperties);
                if (globalDateFormat != this.globalDateFormat) {
                    if (this.globalDateFormat) {
                        this.globalDateFormat = globalDateFormat;
                        this.formatList(this.feedbackList);
                    }
                    else {
                        this.globalDateFormat = globalDateFormat;
                        // this.getNotificationData();
                    }
                }
            }
        });

        let currentId = null;
        this.appSelectors.nextDocument$
            .pipe(
                filter((nextDocument: NextDocument) => nextDocument?.needNext),
                switchMap((nextDocument: NextDocument) => {
                    currentId = nextDocument.currentId;
                    return this.notificationService.getApproveInvoices({});
                }),
                tap((data) => {
                    if (data) {
                        for (let i = 0, length = data.length; i < length; i++) {
                            if (String(data[i].IdMainDocument) !== String(currentId)) {
                                this.goToApproval(data[i]);
                                break;
                            }
                        }
                        this.prepareDataNoti(data);
                    }
                }),
                takeUntil(this.destroy$)
            )
            .subscribe();

        this.dispatcher
            .pipe(
                filter((action: CustomAction) => {
                    return action.type === XnCommonActions.RELOAD_FEEDBACK_DATA
                }),
                takeUntil(this.destroy$)
            )
            .subscribe(() => {
                this.countNoti += 1;
                this.getNotifications(this.isShow);
            });
    }

    public ngOnDestroy() {
        this.destroy$.next();
        Uti.unsubscribe(this);
    }

    public getNotifications = (isShow: boolean = true) => {
        if (this.isShow) {
            this.closeNotifications();
            return;
        }
        this.notificationList = [];
        forkJoin([
            this.notificationService.getApproveInvoices({}),
            this.notificationService.getNotifications({
                IdLoginNotification: this.userData.id,
                MainNotificationType: MainNotificationTypeEnum.Feedback,
                NotificationStatus: NotificationStatusEnum.New
            })
        ])
        .subscribe(([invoice, feeback]) => {
            if (invoice) {
                this.prepareDataNoti(invoice);
                this.isExpanded = true;
                this.feedbackListComponent.isShow = false;
            }

            if (!Uti.isResquestSuccess(feeback) || !feeback.item.data || feeback.item.data.length < 2) {
                this.feedbackRawList = [];
                this.feedbackList = [];
                this.changeDetectorRef.markForCheck();
                return;
            } else {
                this.buildFeedbackResultData(feeback.item.data[1]);
            }

            this.isShow = isShow;
            this.changeDetectorRef.markForCheck();
        });
    }

    public toggleInvoiceExpand() {
        this.isExpanded = !this.isExpanded;
        if (this.isExpanded) {
            this.feedbackListComponent.isShow = false;
        }
    }

    public toggleFeedbackList(isShow: boolean) {
        if (isShow) {
            this.isExpanded = false;
        }
    }

    public showDetailActionHandler(item: any) {
        this.notificationService.getNotifications({
            IdLoginNotification: this.userData.id,
            MainNotificationType: MainNotificationTypeEnum[Uti.upperCaseFirstLetter(this.typeArchive)],
            NotificationStatus: NotificationStatusEnum.Archive,
            IdNotification: item.id
        }).subscribe((response: any) => {
            if (!Uti.isResquestSuccess(response) || !response.item.data || response.item.data.length < 2) {
                return;
            }
            let dataItem = Object.assign({}, response.item.data[1][0]);
            dataItem.Children = response.item.data[1].filter(x => !Uti.isNullUndefinedEmptyObject(x.PicturePath));
            const createDate = Uti.parseISODateToDate(dataItem.SysCreateDate); //parse(dataItem.CreateDate, 'dd.MM.yyyy', new Date());
            dataItem.CreateDateDisplay = this.uti.formatLocale(createDate, this.globalDateFormat + ' HH:mm:ss');
            this.isDataArchived = true;
            this.isShowDetailPopup = true;
            this.detailData = dataItem;
            this.changeDetectorRef.detectChanges();
                // this.updateAutoClose.emit(false);
        });
    }

    public goToApproval = (item) => {
        const data: any = {
            module: ModuleList.Approval,
            data: {
                idDocumentType: item.IdDocumentType,
                idDocument: item.IdMainDocument,
                idTreeRoot: item.IdTreeRoot,
                idInvoiceMainApproval: item.IdInvoiceMainApproval,
                idDocumentContainerScans: item.IdDocumentContainerScans,
            }
        }
        this.onSelectedModule.emit(data);
        this.closeNotifications();
    }

    public closeNotifications = () => {
        this.isShow = false;
    }

    public archiveItemHandler(typeArchive: any, updateAutoClose: boolean) {

    }

    public archiveItemOkActionHandler(dataArchive: any, typeArchive: string) {
        this.typeArchive = typeArchive;
        this.archivedItem([dataArchive], () => {
            Uti.removeItemInArray(this[this.listName], dataArchive, 'IdNotification');
            this.countNoti -= 1;
            this.changeDetectorRef.detectChanges();
            // this.updateAutoClose.emit(true);
        });
    }

    public archiveAllItemActionHandler() {
    }

    public archiveAllItemOkActionHandler(typeArchive) {
        this.typeArchive = typeArchive;
        this.archivedItem(this[this.listName], () => {
            this.countNoti -= this[this.listName].length;
            this[this.listName].length = 0;
            this.changeDetectorRef.detectChanges();
            // this.updateAutoClose.emit(true);
        });
    }

    public archiveAllItemCancelActionHandler() {
    }

    public showArchiveListActionHandler(typeArchive: string) {
        this.typeArchive = typeArchive;
        this.isShowArchivePopup = true;
        // this.updateAutoClose.emit(false);
    }

    public closeArchivePopupActionHandler() {
        this.isShowArchivePopup = false;
        this.typeArchive = '';
        setTimeout(() => {
            // this.updateAutoClose.emit(true);
        }, 200);
    }

    public closeDetailPopupActionHandler() {
        this.isShowDetailPopup = false;
        this.detailData = {};
        if (this.isDataArchived) return;
        setTimeout(() => {
            // this.updateAutoClose.emit(true);
        }, 200);
        this.removeActiveItem();
    }

    public showDetailItemHandler(item: any, typeArchive) {
        this.typeArchive = typeArchive;
        this.showDetailItemActionHandler(item, this[this.rawName]);
    }

    public archiveItemFromPopupActionHandler() {
        this.archivedItem([this.detailData], () => {
            Uti.removeItemInArray(this[this.typeArchive + 'List'], this.detailData, 'IdNotification');
            this.closeDetailPopupActionHandler();
            this.isShowDetailPopup = false;
            this.changeDetectorRef.detectChanges();
        });
    }

    private removeActiveItem() {
        for (let item of this[this.typeArchive + 'List']) {
            item.isFocused = false;
        }
    }

    private showDetailItemActionHandler(item: any, rawData: Array<any>) {
        this.isDataArchived = false;
        this.isShowDetailPopup = true;
        item.Children = rawData.filter(x => x.IdNotification === item.IdNotification && !Uti.isNullUndefinedEmptyObject(item.PicturePath));
        this.detailData = item;
        // this.updateAutoClose.emit(false);
    }

    private getDataAfterSplice(data, deleteCount) {
        data.splice(0, deleteCount);
        return data;
    }

    private archivedItem(items: Array<any>, callBack?: Function) {
        this.notificationService.setArchivedNotifications(this.buildArchivedData(items))
            .subscribe((responseData: any) => {
                if (!Uti.isResquestSuccess(responseData) || !responseData.item.returnID) return;
                if (callBack) {
                    callBack();
                }
                this.archiveItemSuccess();
            });
    }

    private archiveItemSuccess() {
        this.toasterService.pop('success', 'Success', 'Notification is archived');
        this[this.typeArchive + 'ListComponent'].refreshScrollBar();
    }

    private prepareDataNoti(data) {
        this.notificationList = [];
        let deleteCount: number = 0;
        for (let i = 0; i < this.getDataAfterSplice(data, deleteCount).length; i = 0) {
            const serverity: any = this.getServerity(data[0].Serverity);
            const dataInfoGroup: any = data.filter(item => item.Serverity === data[0].Serverity);
            this.notificationList.push({
                serverity: serverity.title,
                classColorServerity: serverity.class,
                infoGroup: dataInfoGroup
            });
            deleteCount = dataInfoGroup.length;
        }
    }

    private get listName(): string {
        return this.typeArchive + 'List';
    }

    private get rawName(): string {
        return this.typeArchive + 'RawList';
    }

    private buildArchivedData(items: Array<any>): Array<any> {
        return items.map(x => {
            return {
                IdNotification: x.IdNotification,
                IsActive: '0'
            };
        });
    }

    private getServerity(serverity) {
        switch (Number(serverity)) {
            case 3:
                return {
                    title: 'Urgent', class: 'urgent-title'
                };
            case 2:
                return {
                    title: 'High Priority', class: 'high-priority-title'
                };
            case 1:
                return {
                    title: 'Medium Priority', class: 'medium-priority-title'
                };
            case 0:
                return {
                    title: 'Standard Priority', class: 'standard-priority-title'
                };

            default:
                break;
        }
    }

    private buildFeedbackResultData(responseData: Array<any>) {
        this.feedbackRawList = responseData;
        this.feedbackList = this.buildResultData(responseData);
        this.formatList(this.feedbackList);
    }

    private buildResultData(responseData: Array<any>): Array<any> {
        return orderBy(uniqBy(responseData, 'IdNotification'), 'IdNotification', 'desc');
    }

    private formatList(listItems: Array<any>) {
        if (!listItems || !listItems.length || !this.globalDateFormat) return;

        for (let item of listItems) {
            const createDate = Uti.parseISODateToDate(item.SysCreateDate);
            item.CreateDateDisplay = this.uti.formatLocale(createDate, this.globalDateFormat + ' HH:mm:ss');
        }
    }

    @HostListener('document:click', ['$event.target'])
    public onClick(target) {
      const clickedInside = this.elementRef.nativeElement.contains(target);
      if (!clickedInside && !this.isShowDetailPopup && !this.isShowArchivePopup) {
        this.closeNotifications();
      }
    }
}
