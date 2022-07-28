
import {
    Component,
    OnInit,
    Input,
    Output,
    OnDestroy,
    EventEmitter
} from '@angular/core';
import {
    BaseComponent
} from '@app/pages/private/base';
import {
    Router
} from '@angular/router';
import {
    SignalRNotifyModel
} from '@app/models';

@Component({
    selector: 'widget-reload-message',
    styleUrls: ['./widget-reload-message.component.scss'],
    templateUrl: './widget-reload-message.component.html',
    host: {
        '(mouseleave)': 'mouseout($event)',
        '(mouseenter)': 'mouseenter($event)',
    }
})
export class WidgetReloadMessageComponent extends BaseComponent implements OnInit, OnDestroy {
    @Input() userJustSaved: SignalRNotifyModel = new SignalRNotifyModel();
    @Input() isBlockUI: boolean = true;
    @Input() isShowReloadButton: boolean = true;

    @Output() cancel = new EventEmitter<any>();
    @Output() reload = new EventEmitter<any>();
    @Output() whenMouseIn = new EventEmitter<any>();
    @Output() whenMouseOut = new EventEmitter<any>();

    public isBlur: boolean = false;

    constructor(router ? : Router) {
        super(router);
    }
    public ngOnInit() {
        this.mouseout = this.mouseout.bind(this);
        this.isBlur = !this.isShowReloadButton;
    }
    public ngOnDestroy() {
    }

    public reloadClicked() {
        this.reload.emit();
    }

    public cancelClicked() {
        this.cancel.emit();
    }

    public mouseenter($event) {
        this.isBlur = false;
        this.whenMouseIn.emit();
    }

    public mouseout($event) {
        this.isBlur = true;
        this.whenMouseOut.emit();
    }
    /*************************************************************************************************/
    /***************************************PRIVATE METHOD********************************************/
}
