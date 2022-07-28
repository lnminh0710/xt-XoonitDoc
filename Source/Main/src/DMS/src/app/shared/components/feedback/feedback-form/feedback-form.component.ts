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
import {
    Validators,
    FormGroup,
    FormBuilder
} from '@angular/forms';
import {
    Subscription
} from 'rxjs/Subscription';
import cloneDeep from 'lodash-es/cloneDeep';
import { BaseComponent } from '@app/pages/private/base';
import { ComboBoxTypeConstant, Configuration, MessageModal } from '@app/app.constants';
import { AppErrorHandler, CommonService, ModalService } from '@app/services';
import { CustomValidators, Uti } from '@app/utilities';
import { ApiResultResponse, MessageModel } from '@app/models';

@Component({
    selector: 'feedback-form',
    styleUrls: ['./feedback-form.component.scss'],
    templateUrl: './feedback-form.component.html'
})
export class FeedbackFormComponent extends BaseComponent implements OnInit, OnDestroy {
    private defaultTypes: Array<any> = [
        {
            textValue: 'Bug',
            idValue: 1
        },
        {
            textValue: 'Improvement',
            idValue: 2
        }
    ];
    private formValuesChangeSubscription: Subscription;
    private _browserInfo: any = {};
    private _keepImageSendToAdmin: any;
    private _imageFromSendToAdminId: string = 'imageFromSendToAdmin';

    public feedbackData: any;
    public formGroup: FormGroup;
    public perfectScrollbarConfig: any;
    public types = this.defaultTypes;

    @ViewChild('typeCtrl') typeCtrl: any;

    @Input() dataUrl: string;
    @Input() imageTemps: any;
    @Input() set feedbackStoreData(data: any) {
        this.feedbackData = data;
        this.initDropdownlistData();
    }

    @Input() set browserInfo(data: any) {
        this._browserInfo = data;
        if (!this.formGroup || !this.formGroup.controls) return;
        this.setDataForComment();
    }

    @Output() outputData: EventEmitter<any> = new EventEmitter();
    @Output() removeItem: EventEmitter<any> = new EventEmitter();
    @Output() callResizePopup: EventEmitter<any> = new EventEmitter();
    @Output() showImageReview: EventEmitter<any> = new EventEmitter();

    constructor(
        private consts: Configuration,
        private commonService: CommonService,
        private formBuilder: FormBuilder,
        private ref: ChangeDetectorRef,
        private modalService: ModalService,
        private appErrorHandler: AppErrorHandler,
        protected router: Router
    ) {
        super(router);
    }

    public ngOnInit() {
        this.initFormData();
        this.perfectScrollbarConfig = {
            suppressScrollX: false,
            suppressScrollY: false
        };
    }

    public makeWholeCapture() {
        const newItem = {
            id: Uti.getTempId2(),
            image: this.dataUrl,
            text: '',
            canRemove: true
        };
        this.imageTemps.push(newItem);
        this.updateSendToAdminImageToCaptureList();
        this.ref.detectChanges();
        this.makeBlinkCapture(newItem, true);
    }

    public ngOnDestroy() {
        Uti.unsubscribe(this);
    }

    public submit() {
        this.formGroup['submitted'] = true;
        this.formGroup.updateValueAndValidity();
        this.setOutputData(true);
    }

    public resetForm() {
        Uti.resetValueForForm(this.formGroup);
        this.formGroup.updateValueAndValidity();
    }

    public removeCapture(captureItem: any) {
        this.modalService.confirmMessageHtmlContent(new MessageModel({
            headerText: 'Delete Item',
            messageType: MessageModal.MessageType.error,
            message: [{ key: '<p>' }, { key: 'Modal_Message__Do_You_Want_To_Delete_This_Items' },
            { key: '</p>' }],
            buttonType1: MessageModal.ButtonType.danger,
            callBack1: () => {
                Uti.removeItemInArray(this.imageTemps, captureItem, 'id');
                this.removeItem.emit(captureItem);
                this.ref.detectChanges();
            },
            isOnTop: true
        }));
    }

    public showImageReviewClicked(image: any) {
        this.showImageReview.emit(image);
    }

    public makeBlinkCapture(captureItem: any, isFocus?: boolean) {
        const allCaptureElement = $('.image-captured--child');
        if (allCaptureElement && allCaptureElement.length) {
            allCaptureElement.each((index, x) => {
                $(x).removeClass('blinking-new-item');
            });
        }
        setTimeout(() => {
            const captureElement = $('#capture-image-' + captureItem.id);
            if (!captureElement || !captureElement.length) return;
            captureElement.addClass('blinking-new-item');
            setTimeout(() => {
                captureElement.removeClass('blinking-new-item');
            }, 3000);
            const scrollWrap = document.querySelector('#feed-back-image-capture-wrapper');
            this.setScroll(captureItem, scrollWrap);
            if (!isFocus) return;
            scrollWrap.scrollTop = 0;
            $('#capture-notes-' + captureItem.id).focus();
        }, 100);
    }

    public onChangeType($event: any) {
        if (!this.typeCtrl || !this.typeCtrl.selectedItem) return;
        this.formGroup.controls['typeText'].setValue(this.typeCtrl.selectedItem.textValue);
    }

    public updateSendToAdminImageToCaptureList() {
        const cloneImageList = cloneDeep(this.imageTemps);
        this.removeSendToAdminImageFromCaptureList(cloneImageList);
        this.addSendToAdminImageFromCaptureList(cloneImageList);
        this.imageTemps.length = 0;
        this.imageTemps.push(...cloneImageList);
    }

    public addImageOfSendToAdmin() {
        this.pushSendToAdminImageFromCaptureList(this.imageTemps, '');
        this.callResizePopup.emit();
    }

    /*************************************************************************************************/
    /***************************************PRIVATE METHOD********************************************/
    private initDropdownlistData() {
        if (this.feedbackData && this.feedbackData.isSendToAdmin) {
            this.commonService.getListComboBox(ComboBoxTypeConstant.sendToAdminReason)
                .subscribe((response: ApiResultResponse) => {
                    this.appErrorHandler.executeAction(() => {
                        if (!Uti.isResquestSuccess(response)) {
                            return;
                        }
                        this.types = response.item.sendToAdminReason;
                    });
                });
        } else {
            this.types = this.defaultTypes;
        }
    }

    private setDataForComment() {
        setTimeout(() => {
            if (!this._browserInfo || !this.feedbackData.isSendToAdmin) return;
            let comment = '';
            comment += (this._browserInfo.EntityId) ? 'Entity Id: ' + this._browserInfo.EntityId + '\n' : '';
            comment += (this._browserInfo.CampaignNumber) ? 'Campaign Number: ' + this._browserInfo.CampaignNumber + '\n' : '';
            comment += (this._browserInfo.CustomerNumber) ? 'Customer Number: ' + this._browserInfo.CustomerNumber + '\n' : '';
            comment += (this._browserInfo.Mediacode) ? 'Media Code: ' + this._browserInfo.Mediacode + '\n' : '';
            comment += (this._browserInfo.IdScansContainerItems) ? 'IdScansContainerItems: ' + this._browserInfo.IdScansContainerItems + '\n' : '';
            this.formGroup.controls['content'].setValue(comment);
        }, 500);
    }

    private initFormData() {
        this.formGroup = this.formBuilder.group({
            priority: 'Normal',
            type: ['', Validators.required],
            typeText: '',
            subject: ['', CustomValidators.required],
            content: ''
        });
        this.subscribleValueChange();
        this.setDataForComment();
    }

    private subscribleValueChange() {
        if (this.formValuesChangeSubscription) this.formValuesChangeSubscription.unsubscribe();
        this.formValuesChangeSubscription = this.formGroup.valueChanges
            .debounceTime(this.consts.valueChangeDeboundTimeDefault)
            .subscribe((data) => {
                this.appErrorHandler.executeAction(() => {
                    if (!this.formGroup.pristine) {
                        this.setOutputData(false);
                    }
                });
            });
    }

    private setOutputData(submitResult: boolean) {
        this.outputData.emit({
            submitResult: submitResult,
            formValue: this.formGroup.value,
            isValid: this.formGroup.valid,
            isDirty: this.formGroup.dirty
        });
    }

    private setScroll(captureItem: any, scrollWrap: any) {
        let currentIndex = 0;
        const reverseArr = this.imageTemps.slice().reverse();
        for (let i = 0; i < reverseArr.length; i++) {
            if (captureItem.id === reverseArr[i].id) {
                currentIndex = i;
                break;
            }
        }
        if (currentIndex === 0) {
            scrollWrap.scrollTop = 0;
            return;
        }
        if (currentIndex === 1) {
            scrollWrap.scrollTop = 50;
            return
        }
        scrollWrap.scrollTop = 50 + ((currentIndex - 1) * 100);
    }

    private removeSendToAdminImageFromCaptureList(cloneImageList: any) {
        this._keepImageSendToAdmin = this.imageTemps.find(x => x.id === this._imageFromSendToAdminId);
        Uti.removeItemInArray(cloneImageList, { id: this._imageFromSendToAdminId }, 'id');
    }

    private addSendToAdminImageFromCaptureList(cloneImageList: any) {
        if (!this._keepImageSendToAdmin || !this._keepImageSendToAdmin.id) {
            return;
        }
        this.pushSendToAdminImageFromCaptureList(cloneImageList, this._keepImageSendToAdmin.text);
    }

    private pushSendToAdminImageFromCaptureList(imageList: any, text: string) {
        imageList.push({
            id: this._imageFromSendToAdminId,
            image: this._browserInfo.SendToAdminImage,
            text: text,
            canRemove: false
        });
    }
}
