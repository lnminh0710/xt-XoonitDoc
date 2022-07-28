import {
    Component, Input, Output, EventEmitter,
    OnInit, OnDestroy, AfterViewInit, ElementRef, ChangeDetectionStrategy
} from "@angular/core";
import { ModalService } from '@app/services';
import { MessageModel, WidgetDetail, Module } from '@app/models';
import { MessageModal } from '@app/app.constants';
import { PropertyPanelActions, LayoutInfoActions } from '@app/state-management/store/actions';
import { AppState } from '@app/state-management/store';
import { Store } from '@ngrx/store';

@Component({
    selector: 'widget-blank',
    templateUrl: './widget-blank.component.html',
    styleUrls: ['./widget-blank.component.scss']
})
export class WidgetBlankComponent implements OnInit, OnDestroy, AfterViewInit {

    @Input() data: WidgetDetail;
    @Input() currentModule: Module;
    @Input() allowDesignEdit: boolean;

    /*
    private _allowDesignEdit: boolean;
    @Input() set allowDesignEdit(data: boolean) {
        this._allowDesignEdit = data;       
    };

    get allowDesignEdit() {
        return this._allowDesignEdit;
    }
    */

    @Output() onRemoveWidget = new EventEmitter<WidgetDetail>();

    constructor(private _eref: ElementRef,
        public modalService: ModalService,
        private store: Store<AppState>,
        private propertyPanelActions: PropertyPanelActions,
        private layoutInfoActions: LayoutInfoActions) {

    }

    /**
     * ngOnInit
     */
    public ngOnInit() {
    }

    /**
     * ngOnDestroy
     */
    public ngOnDestroy() {
    }

    /**
     * ngAfterViewInit
     */
    public ngAfterViewInit() {
    }

    /**
     *removeWidget
     * */
    public removeWidget(): void {
        this.modalService.confirmMessageHtmlContent(new MessageModel({
            messageType: MessageModal.MessageType.error,
            headerText: 'Remove Widget',
            message: [ { key: '<p>' }, { key: 'Modal_Message__RemoveThisWidget' }, { key: '</p>' }],
            buttonType1: MessageModal.ButtonType.danger,
            callBack1: () => {
                this.onRemoveWidget.emit(this.data);

                this.store.dispatch(this.propertyPanelActions.clearProperties(this.currentModule));
                this.store.dispatch(this.layoutInfoActions.setRightPropertyPanelWidth('0', this.currentModule));
            }
        }));
    }
}
