import {
    Component,
    Input,
    Output,
    EventEmitter,
    ViewChild
} from '@angular/core';
import { Router } from '@angular/router';
import { ToasterService } from 'angular2-toaster/angular2-toaster';
import { BaseComponent } from '@app/pages/private/base';
import { ModalService } from '@app/services';
import { FeedbackFormComponent } from '../feedback-form';
import { HostListener } from '@angular/core';

@Component({
    selector: 'feedback-popup',
    styleUrls: ['./feedback-popup.component.scss'],
    templateUrl: './feedback-popup.component.html'
})
export class FeedbackPopupComponent extends BaseComponent {

    private POPUP_WIDTH_SMAIL: number = 500;
    private POPUP_WIDTH_LARGE: number = 800;
    private POPUP_HEIGHT_SMAIL: number = 470;
    private POPUP_HEIGHT_LARGE: number = 700;
    private popupPosition: any;
    private feedbackData: any = {};
    public isShowDialog: boolean = false;
    public popupWidth: number = this.POPUP_WIDTH_SMAIL;
    public popupHeight: number = this.POPUP_HEIGHT_SMAIL;
    @Input() dataUrl: string;
    @Input() imageTemps: any;
    @Input() feedbackStoreData: any = {};
    @Input() browserInfo: any = {};

    @Output() outputData: EventEmitter < any > = new EventEmitter();
    @Output() makeCaptureArea: EventEmitter < any > = new EventEmitter();
    @Output() closePopup: EventEmitter < any > = new EventEmitter();
    @Output() sendMail: EventEmitter < any > = new EventEmitter();
    @Output() removeItem: EventEmitter < any > = new EventEmitter();
    @Output() showImageReview: EventEmitter < any > = new EventEmitter();
    @ViewChild('feedbackForm') feedbackForm: FeedbackFormComponent;

    constructor(
        protected router: Router,
        private toasterService: ToasterService,
        private modalService: ModalService,
    ) {
        super(router);
    }

    public showDialog() {
        this.isShowDialog = true;
        this.setPopupPosition();
        this.removeOverlay();
    }

    public closeDialogWithoutEmit() {
        this.isShowDialog = false;
        this.savePopupPosition();
    }

    public closeDialogInside() {
        if ((this.imageTemps && this.imageTemps.length) || this.feedbackData.isDirty) {
            this.modalService.unsavedWarningMessage({
                headerText: 'Saving Changes',
                message: [{key: '<p>'}, {key: 'Modal_Message__Do_You_Want_To_Send_Data'},
                    {key: '</p>'}],
                onModalSaveAndExit: () => {
                    this.sendToAdmin();
                },
                onModalExit: () => {
                    this.closeDialog();
                },
                isOnTop: true
            });
        } else {
            this.closeDialog();
        }
    }

    public closeDialog() {
        this.isShowDialog = false;
        this.savePopupPosition();
        this.closePopup.emit();
    }

    public feedbackFormOutputData(data: any) {
        this.feedbackData = data;
    }

    public sendToAdmin() {
        if (!this.feedbackForm) return;
        this.feedbackForm.submit();
        setTimeout(() => {
            if (!this.feedbackData.isValid) {
                this.toasterService.pop('warning', 'Validation Fail', 'There are some fields do not pass validation.');
                return;
            }
            this.outputData.emit(this.feedbackData);
            this.sendMail.emit();
        });
    }

    public makeCaptureWholeClicked() {
        this.feedbackForm.makeWholeCapture();
        this.makePopupSize();
    }

    public makeCaptureAreaClicked() {
        this.isShowDialog = false;
        this.makeCaptureArea.emit();
    }

    public resetForm() {
        if (!this.feedbackForm) return;
        this.feedbackForm.resetForm()
    }

    public makePopupSize() {
        setTimeout(() => {
            if ((this.imageTemps && this.imageTemps.length)) {
                this.popupWidth = this.POPUP_WIDTH_LARGE;
                this.popupHeight = this.POPUP_HEIGHT_LARGE;
            } else {
                this.popupWidth = this.POPUP_WIDTH_SMAIL;
                this.popupHeight = this.POPUP_HEIGHT_SMAIL;
            }
            let popup = $('.prime-dialog-feedback');
            if (!popup || !popup.length) return;
            popup.css('width', this.popupWidth);
            popup.css('height', this.popupHeight);
            if (this.popupWidth === this.POPUP_WIDTH_LARGE) {
                popup.css('top', 15);
            } else {
                popup.css('top', 150);
            }
        }, 150);
    }

    public removeItemHandle($event) {
        this.removeItem.emit($event);
        this.makePopupSize();
    }

    public showImageReviewHandle($event) {
        this.showImageReview.emit($event);
    }

    public makeBlinkCapture(captureItem: any, isFocus?: boolean) {
        this.feedbackForm.makeBlinkCapture(captureItem, isFocus);
    }

    public updateSendToAdminImageToCaptureList() {
        this.feedbackForm.updateSendToAdminImageToCaptureList();
    }

    public callResizePopup() {
        this.makePopupSize();
    }

    public addImageOfSendToAdmin() {
        this.feedbackForm.addImageOfSendToAdmin();
    }

    /*************************************************************************************************/
    /***************************************PRIVATE METHOD********************************************/
    private setPopupPosition() {
        if (!this.popupPosition) return;
        const dialog = $('.prime-dialog-feedback');
        if (!dialog.length) return;
        dialog.addClass('hide-hard');
        setTimeout(() => {
            dialog.css({
                display: 'block',
                top: (this.popupPosition.top || 0) + 'px',
                left: (this.popupPosition.left || 0) + 'px'
            });
            dialog.removeClass('hide-hard');
        }, 100);
    }

    private savePopupPosition() {
        const dialog = $('.prime-dialog-feedback');
        if (!dialog.length) return;
        this.popupPosition = Object.assign({}, dialog.offset());
    }

    private removeOverlay() {
        setTimeout(() => {
            let overlay = $('.ui-widget-overlay');
            if (!overlay || !overlay.length) return;
            $(overlay[overlay.length - 1]).css({
                opacity: 0
            });
        }, 200);
    }

    @HostListener('document:keydown', ['$event'])
    handleKeyboardEvent(event: KeyboardEvent) {
        if (event.key === 'Escape') {
            this.closeDialogInside();
            event.stopPropagation();
        }
    }
}
