
import {
    Component,
    OnInit,
    Input,
    Output,
    OnDestroy,
    EventEmitter,
    HostListener
} from '@angular/core';
import { Router } from '@angular/router';
import { MessageModel } from '@app/models';
import { BaseComponent } from '@app/pages/private/base';
import { ModalService } from '@app/services';

@Component({
    selector: 'notification-detail-popup',
    styleUrls: ['./notification-detail-popup.component.scss'],
    templateUrl: './notification-detail-popup.component.html'
})
export class NotificationDetailPopupComponent extends BaseComponent implements OnInit, OnDestroy {
    public typeOfArchive: string = '';
    public detailTitle: string = '';

    @Input() isShow: boolean = false;
    @Input() data: any = {};
    @Input() isArchived: boolean = true;

    @Output() archiveItemFromPopupAction = new EventEmitter<any>();
    @Output() closeDetailPopupAction = new EventEmitter<any>();

    constructor(
        private modalService: ModalService,
        protected router: Router
    ) {
        super(router);
    }
    public ngOnInit() {
    }
    public ngOnDestroy() {
    }
    public archiveItem() {
        this.modalService.confirmMessageHtmlContent(new MessageModel({
            headerText: 'Confirmation',
            message: [{key: '<p>'}, {key: 'Modal_Message__Do_You_Want_To_Archive_This_Item'},
                {key: '</p>'}],
            callBack1: ($event) => {
                this.archiveItemFromPopupAction.emit();
            }
        }), true);
    }
    public close(event?: Event) {
        event?.stopPropagation();
        this.closeDetailPopupAction.emit();
    }

    @HostListener('document:keydown', ['$event'])
    handleKeyboardEvent(event: KeyboardEvent) {
        if (event.key === 'Escape') {
            this.close(event);
        }
    }
    /*************************************************************************************************/
    /***************************************PRIVATE METHOD********************************************/
}

