
import {
    Component,
    OnInit,
    Input,
    Output,
    OnDestroy,
    EventEmitter,
    HostListener
} from '@angular/core';
import {
    Router
} from '@angular/router';
import { BaseComponent } from '@app/pages/private/base';
@Component({
    selector: 'notification-archive-popup',
    styleUrls: ['./notification-archive-popup.component.scss'],
    templateUrl: './notification-archive-popup.component.html'
})
export class NotificationArchivePopupComponent extends BaseComponent implements OnInit, OnDestroy {
    @Input() isShow: boolean = false;
    @Input() typeArchive: string = '';
    @Input() showingDetail: boolean = false;

    @Output() showDetailAction = new EventEmitter<any>();
    @Output() closeArchivePopupAction = new EventEmitter<any>();
    constructor(protected router: Router) {
        super(router);
    }
    public ngOnInit() {
    }
    public ngOnDestroy() {
    }
    public close(event: Event) {
        event.stopPropagation();
        this.closeArchivePopupAction.emit();
    }
    public showDetailActionHandler($event: any) {
        this.showDetailAction.emit($event);
    }

    @HostListener('document:keydown', ['$event'])
    handleKeyboardEvent(event: KeyboardEvent) {
        if (event.key === 'Escape' && !this.showingDetail) {
            this.close(event);
        }
    }
    /*************************************************************************************************/
    /***************************************PRIVATE METHOD********************************************/
}
