import {
    Component,
    OnInit,
    Input,
    Output,
    OnDestroy,
    EventEmitter,
    ElementRef,
    AfterViewInit,
    ViewChild
} from '@angular/core';
import {
    Router
} from '@angular/router';
import { MessageModel } from '@app/models';
import { BaseComponent } from '@app/pages/private/base';
import { ModalService } from '@app/services';
import { Uti } from '@app/utilities';
import { PerfectScrollbarDirective } from 'ngx-perfect-scrollbar';

@Component({
    selector: 'notification-list-view-child',
    styleUrls: ['./notification-list-view-child.component.scss'],
    templateUrl: './notification-list-view-child.component.html',
    host: {
        '(window:resize)': 'onWindowResize($event)'
    },
})
export class NotificationListViewChildComponent extends BaseComponent implements OnInit, AfterViewInit, OnDestroy {
    public id: number = Uti.getTempId2();
    public isShow: boolean = true;
    public perfectScrollbarConfig: any;

    private navHeight = 54;
    private headerHeight = 36;
    private itemHeight = 80;

    @Input() title: string = "";
    @Input() messageList: Array<any> = [];

    @Output() archiveItemAction = new EventEmitter<any>();
    @Output() archiveItemOkAction = new EventEmitter<any>();
    @Output() archiveItemCancelAction = new EventEmitter<any>();

    @Output() archiveAllItemAction = new EventEmitter<any>();
    @Output() archiveAllItemOkAction = new EventEmitter<any>();
    @Output() archiveAllItemCancelAction = new EventEmitter<any>();

    @Output() showArchiveListAction = new EventEmitter<any>();
    @Output() showDetailItemAction = new EventEmitter<any>();
    @Output() toggleShow: EventEmitter<boolean> = new EventEmitter<boolean>();

    @ViewChild(PerfectScrollbarDirective) directiveScroll: PerfectScrollbarDirective;

    constructor(
        private elmRef: ElementRef,
        private modalService: ModalService,
        protected router: Router
        ) {
        super(router);
        this.onWindowResize = this.onWindowResize.bind(this);
    }

    public ngOnInit() {
        this.perfectScrollbarConfig = {
            suppressScrollX: false,
            suppressScrollY: false
        };
    }

    public ngAfterViewInit() {
        this.onWindowResize();
    }

    public ngOnDestroy() {
        super.onDestroy();
    }

    public toggle() {
        this.isShow = !this.isShow;
        this.toggleShow.emit(this.isShow);
    }

    public archiveAll() {
        this.archiveAllItemAction.emit();
        this.modalService.confirmMessageHtmlContent(new MessageModel({
            headerText: 'Confirmation',
            message: [{key: '<p>'}, {key: 'Modal_Message__Do_You_Want_To_Archive_All_These_Items'},
                {key: '</p>'}],
            callBack1: ($event) => {
                this.archiveAllItemOkAction.emit();
            },
            callBack2: ($event) => {
                this.archiveAllItemCancelAction.emit();
            }
        }), true);
    }

    public showArchive() {
        this.showArchiveListAction.emit();
    }

    public archiveItem(item: any, event: any) {
        event.stopPropagation();
        this.archiveItemAction.emit();
        this.modalService.confirmMessageHtmlContent(new MessageModel({
            headerText: 'Confirmation',
            message: [{key: '<p>'}, {key: 'Modal_Message__Do_You_Want_To_Archive_This_Item'},
                {key: '</p>'}],
            callBack1: ($event) => {
                this.archiveItemOkAction.emit(item);
            },
            callBack2: ($event) => {
                this.archiveItemCancelAction.emit();
            }
        }), true);
    }

    public showDetailItem(item: any) {
        this.showDetailItemAction.emit(item);
        this.setFocusedForItem(item);
    }

    public onWindowResize(e?: any) {
        const notificationChildren = $('.notification-list-view-child', this.elmRef.nativeElement);
        if (!notificationChildren.length) return;
        if ((this.itemHeight*5 + this.headerHeight*2 + this.navHeight) > window.innerHeight) {
            notificationChildren.css('max-height', 'calc(' + this.itemHeight * 5 + 'px - ' + this.headerHeight + 'px)');
        } else {
            notificationChildren.css('max-height', 'calc(50vh - ' + this.navHeight/2 + 'px');
        }

        const notificationItems = $('.nlvc-items', this.elmRef.nativeElement);
        if (!notificationItems.length) return;
        if ((this.itemHeight*5*2 + this.headerHeight*2 + this.navHeight) > window.innerHeight) {
            notificationItems.css('max-height', 'calc(50vh - ' + this.navHeight/2 + 'px - ' + (this.headerHeight + 4) + 'px)');
        } else {
            notificationItems.css('max-height', '400px');
        }
    }

    public refreshScrollBar() {
        this.directiveScroll.scrollTo(this.directiveScroll.elementRef.nativeElement.scrollTop - 80);
    }
    /*************************************************************************************************/
    /***************************************PRIVATE METHOD********************************************/
    private setFocusedForItem(currentItem: any) {
        for (let item of this.messageList) {
            item.isFocused = (currentItem.IdNotification == item.IdNotification);
        }
    }
}
