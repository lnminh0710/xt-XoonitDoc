import {
    Component,
    OnInit,
    Input,
    Output,
    EventEmitter,
    ViewChild,
    OnDestroy
} from '@angular/core';
import {
    BaseComponent
} from '@app/pages/private/base';
import {
    Router
} from '@angular/router';
import {
    ModalService
} from '@app/services';
import {
    MessageModel
} from '@app/models';
import {
    MessageModal
} from '@app/app.constants';
@Component({
    selector: 'xn-capture-item',
    styleUrls: ['./xn-capture-item.component.scss'],
    templateUrl: './xn-capture-item.component.html'
})
export class CaptureItem extends BaseComponent implements OnInit, OnDestroy {
    public inbound = true;
    public translate: any = {
        top: 0,
        left: 0
    };
    private isResizing: boolean = false;
    private isCloseButtonMouseDown: boolean = false;
    private isDragging: boolean = false;
    private isOuting: boolean = false;
    private currentPosition: any = {
        top: 0,
        left: 0
    };
    private currentTranslate: any = {
        top: 0,
        left: 0
    };
    @Input() indexItem: any;
    @Input() captureItem: any;
    @Input() isShowCapture: boolean;
    @Output() actionRemove = new EventEmitter < any > ();
    @Output() actionUpdateComment = new EventEmitter < any > ();
    constructor(private modalService: ModalService, router ? : Router) {
        super(router);
    }
    public ngOnInit() {
        this.registerMouseEvent();
    }
    public ngOnDestroy() {
        $(document).unbind('mousemove');
        const divFeedback = $('#-' + this.indexItem);
        this.unbindElement('feedback-image');
        this.unbindElement('feedback-resize-right');
        this.unbindElement('feedback-resize-bottom');
        this.unbindElement('feedback-close-button');
        this.unbindElement('feedback-commnent');
    }
    public removeItemClicked() {
        this.modalService.confirmMessageHtmlContent(new MessageModel({
            headerText: 'Delete Item',
            messageType: MessageModal.MessageType.error,
            message: [{ key: '<p>'}, { key: 'Modal_Message___DoYouWantToDeleteThisItem' }, { key: '<p>' }],
            buttonType1: MessageModal.ButtonType.danger,
            callBack1: () => {
                this.actionRemove.emit(this.captureItem);
            },
            isOnTop: true
        }));
    }
    public registerMouseEvent() {
        setTimeout(() => {
            const divFeedback = $('#feedback-image-' + this.indexItem);
            if (!divFeedback.length) return;
            this.registerMousedown(divFeedback);
            this.registerResizeEvent();
        }, 300);
    }
    public onResizeStop(e) {
        if (e.edges && e.edges.hasOwnProperty('left')) {
            this.captureItem.left += e.edges.left;
            this.captureItem.width += e.edges.left;
        } else if (e.edges && e.edges.hasOwnProperty('right')) {
            this.captureItem.width += e.edges.right;
        } else if (e.edges && e.edges.hasOwnProperty('top')) {
            this.captureItem.top += e.edges.top;
            this.captureItem.height += e.edges.top;
        } else if (e.edges && e.edges.hasOwnProperty('bottom')) {
            this.captureItem.height += e.edges.bottom;
        }
        if (this.captureItem.width <= 48) {
            this.captureItem.width = 48;
        }
        if (this.captureItem.height <= 48) {
            this.captureItem.height = 48;
        }
        this.actionUpdateComment.emit(this.captureItem);
        this.resetFlagResizing();
    }
    /*************************************************************************************************/
    /***************************************PRIVATE METHOD********************************************/
    private unbindElement(id: string) {
        const resizeBottom = $('#' + id + '-' + this.indexItem);
        if (resizeBottom.length) {
            resizeBottom.unbind('mousedown');
            resizeBottom.unbind('mouseup');
        }
    }
    private registerMousedown(divFeedback: any) {
        divFeedback.mousedown((e) => {
            if (this.isResizing || this.isCloseButtonMouseDown || this.isShowCapture) return;
            let that = this;
            this.registerMousemove(divFeedback);
            this.isDragging = true;
            this.currentPosition = {
                top: e.clientY,
                left: e.clientX,
            };
            const transform = divFeedback.css('transform').split(',');
            this.currentTranslate = {
                top: parseInt(transform[5] || '0'),
                left: parseInt(transform[4] || '0')
            };
        });
    }
    private registerMousemove(divFeedback: any) {
        const that = this;
        $(document).mousemove((e) => {
            if (that.isResizing || !that.isDragging || that.isCloseButtonMouseDown || this.isShowCapture) return;
            const newPosition = {
                top: e.clientY - that.currentPosition.top,
                left: e.clientX - that.currentPosition.left
            };
            const newTop = newPosition.top + that.currentTranslate.top;
            const newLeft = newPosition.left + that.currentTranslate.left;
            divFeedback.css({
                'transform': 'translate(' + newLeft + 'px, ' + newTop + 'px)'
            });​
            this.registerMouseup();
        });
    }
    private registerMouseup() {
        $(document).mouseup((e) => {
            this.setNewPositionForItem();
            $(document).unbind('mousemove');
            this.isDragging = false;
            this.isOuting = false;
            this.currentPosition = {
                top: 0,
                left: 0
            };
            this.currentTranslate = {
                top: 0,
                left: 0
            };
            this.isCloseButtonMouseDown = false;
            this.isResizing = false;
            $(document).unbind('mouseup');
        });
    }
    private registerResizeEvent() {
        $('#feedback-resize-right-' + this.indexItem).mousedown((e) => {
            this.isResizing = true;
        });
        $('#feedback-resize-right-' + this.indexItem).mouseup((e) => {
            this.isResizing = false;
        });
        $('#feedback-resize-bottom-' + this.indexItem).mousedown((e) => {
            this.isResizing = true;
        });
        $('#feedback-resize-bottom-' + this.indexItem).mouseup((e) => {
            this.isResizing = false;
        });
        $('#feedback-close-button-' + this.indexItem).mousedown((e) => {
            this.isCloseButtonMouseDown = true;
        });
        $('#feedback-close-button-' + this.indexItem).mouseup((e) => {
            this.isCloseButtonMouseDown = false;
        });
        $('#feedback-commnent-' + this.indexItem).mousedown((e) => {
            this.isCloseButtonMouseDown = true;
        });
        $('#feedback-commnent-' + this.indexItem).mouseup((e) => {
            this.isCloseButtonMouseDown = false;
        });
    }
    private setNewPositionForItem() {
        setTimeout(() => {
            const elm = $('#feedback-image-' + this.indexItem);
            if (!elm || !elm.length) return;
            const calc = elm.offset();
            const transform = elm.css('transform').split(',');
            this.translate.left = transform[4];
            this.translate.top = transform[5];
            this.captureItem.left = calc.left;
            this.captureItem.top = calc.top;
            this.actionUpdateComment.emit(this.captureItem);
        }, 100);
    }
    private resetFlagResizing() {
        setTimeout(() => {
            this.isResizing = false;
        }, 500);
    }
}