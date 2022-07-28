import {
    Component,
    OnInit,
    OnDestroy,
    ViewChild,
    ChangeDetectorRef,
    ViewChildren,
    QueryList,
    ElementRef,
} from '@angular/core';
import { ModalDirective } from 'ngx-bootstrap/modal';
import * as message from '@app/models/common/message-modal';
import { MessageModal } from '@app/app.constants';
import isNil from 'lodash-es/isNil';
import isEmpty from 'lodash-es/isEmpty';
import cloneDeep from 'lodash-es/cloneDeep';
import { Store } from '@ngrx/store';
import { AppState } from '@app/state-management/store';
import { Observable } from 'rxjs/Observable';
import { Subscription } from 'rxjs/Subscription';
import { ModalActions } from '@app/state-management/store/actions';
import { MessageModalModel } from '@app/models';
import { Uti } from '@app/utilities';
import { AppErrorHandler, ResourceTranslationService } from '@app/services';
import { defaultLanguage } from '@app/app.resource';
import { TranslateService } from '@ngx-translate/core';

@Component({
    selector: 'xn-message-modal',
    styleUrls: ['./xn-message-modal.component.scss'],
    templateUrl: './xn-message-modal.component.html',
})
export class XnMessageModalComponent implements OnInit, OnDestroy {
    public isRenderMessage = false;
    public messageOption: message.MessageModalModel;
    public hasTranslatePopup = false;
    public messageBody: string = '';
    public isRender = true;

    private currentZIndex = 1090;
    private showCloseButton = true;
    private callBackWhenClose: any;
    private xnModalStateModalData: Observable<MessageModalModel>;
    private xnModalStateModalDataSubcription: Subscription;
    private xnModalStateModalShow: Observable<any>;
    private xnModalStateModalShowSubcription: Subscription;
    private xnModalStateModalClose: Observable<any>;
    private xnModalStateModalCloseSubcription: Subscription;
    private xnModalHasTranslatePopup: Observable<any>;
    private xnModalHasTranslatePopupSubcription: Subscription;
    private successSavedSubscription: Subscription;

    @ViewChild('xnMessageModal') public xnMessageModal: ModalDirective;
    @ViewChildren('buttonfooter') buttonfooters: QueryList<ElementRef>;

    constructor(
        private store: Store<AppState>,
        private ref: ChangeDetectorRef,
        private modalActions: ModalActions,
        private appErrorHandler: AppErrorHandler,
        private resourceTranslationService: ResourceTranslationService,
        public translateService: TranslateService,
    ) {
        this.xnModalStateModalData = this.store.select((state) => state.modalState.modalData);
        this.xnModalStateModalShow = this.store.select((state) => state.modalState.modalShowMessage);
        this.xnModalStateModalClose = this.store.select((state) => state.modalState.modalCloseMessage);
        this.xnModalHasTranslatePopup = this.store.select((state) => state.modalState.hasTranslatePopup);
    }

    public ngOnInit() {
        this.createEmptyMessage();
        this.registerWindowResize();
        this.subscibeData();
        this.successSavedSubscription = this.resourceTranslationService.successSaved$.subscribe((status) => {
            this.isRender = false;
            this.buildMessageBody();
            setTimeout(() => {
                this.isRender = true;
                this.ref.detectChanges();
            }, 200);
        });
    }
    public ngOnDestroy() {
        $(window).unbind('resize');
        Uti.unsubscribe(this);
    }

    private createEmptyMessage() {
        const header = new message.MessageModalHeaderModel({});
        const body = new message.MessageModalBodyModel({});
        const buttonList = [new message.ButtonList({})];
        const footer = new message.MessageModalFooterModel({
            buttonList: buttonList,
        });
        this.messageOption = new message.MessageModalModel({
            header: header,
            body: body,
            footer: footer,
        });
        this.appendDefaultValueToTranslateResource();
    }

    private subscibeData() {
        this.xnModalStateModalDataSubcription = this.xnModalStateModalData.subscribe((data: MessageModalModel) => {
            this.appErrorHandler.executeAction(() => {
                if (isEmpty(data) || !data.messageType) {
                    return;
                }
                this.makeMessageOption(data);
                this.ref.detectChanges();
            });
        });

        this.xnModalStateModalShowSubcription = this.xnModalStateModalShow.subscribe((data: any) => {
            this.appErrorHandler.executeAction(() => {
                if (!data) {
                    return;
                }
                this.showModal();
                this.store.dispatch(this.modalActions.modalShowMessage(false));
            });
        });

        this.xnModalStateModalCloseSubcription = this.xnModalStateModalClose.subscribe((data: any) => {
            this.appErrorHandler.executeAction(() => {
                if (!data) {
                    return;
                }
                this.hideModal();
                this.store.dispatch(this.modalActions.modalCloseMessage(false));
            });
        });

        this.xnModalHasTranslatePopupSubcription = this.xnModalHasTranslatePopup.subscribe((data: any) => {
            this.appErrorHandler.executeAction(() => {
                this.hasTranslatePopup = data;
                if (!data) {
                    this.currentZIndex = 1090;
                    this.setIndexForMessageModal();
                    return;
                }
                this.currentZIndex = 2000;
                this.setIndexForMessageModal();
            });
        });
    }

    public closeClicked() {
        if (this.callBackWhenClose) {
            this.callBackWhenClose();
        }
        this.hideModal();
    }

    private registerWindowResize() {
        $(window).resize(() => {
            const modal = $('#xn-bs-modal');
            if (modal.length > 0) {
                this.setModalPosition();
            }
        });
    }

    public modalSizeCssClass: any = {
        large: 'modal-lg',
        middle: 'modal-md',
        small: 'modal-sm',
    };

    private headerCssClass: any = {
        error: 'modal-header--error',
        warning: 'modal-header--warning',
        success: 'modal-header--success',
        confirm: 'modal-header--confirm',
        information: 'modal-header--information',
    };

    private headerIconClass: any = {
        error: 'fa-ban',
        warning: 'fa-warning',
        success: 'fa-check-circle',
        confirm: 'fa-question-circle',
        information: 'fa-info-circle',
    };

    public buttonClass: any = {
        default: '',
        primary: 'mat-btn-blue',
        success: 'mat-btn-green',
        info: 'btn-info',
        warning: 'mat-btn-orange',
        danger: 'mat-btn-red',
        link: '',
    };

    private makeMessageOption(option: message.MessageModalModel) {
        if (option.bodyText) {
            this.makeInforOption(option);
            return;
        }
        this.messageOption = option;
        this.makeDefaultForModal(option);
        this.makeMessageHeader(option);
        this.makeMessageFooter(option);
        this.isRenderMessage = true;
        this.messageOption = cloneDeep(option);
        this.callBackWhenClose = option.callBackFunc;
        this.showCloseButton = isNil(option.showCloseButton) ? this.showCloseButton : option.showCloseButton;
        this.appendDefaultValueToTranslateResource();
        this.buildMessageBody();
    }

    private makeInforOption(option: message.MessageModalModel) {
        this.messageOption = new message.MessageModalModel({
            messageType: option.messageType,
            modalSize: MessageModal.ModalSize.small,
            header: new message.MessageModalHeaderModel({
                text: option.headerText || 'Message Information',
            }),
            body: new message.MessageModalBodyModel({
                content: option.bodyText,
            }),
            footer: new message.MessageModalFooterModel({
                buttonList: [
                    new message.ButtonList({
                        buttonType: MessageModal.ButtonType.default,
                        text: option.buttonText || 'Ok',
                        callBackFunc: () => {
                            if (option.callBackFunc) option.callBackFunc();
                        },
                    }),
                ],
            }),
        });
        this.makeMessageHeader(this.messageOption);
        this.isRenderMessage = true;
        this.appendDefaultValueToTranslateResource();
    }

    private makeDefaultForModal(option: message.MessageModalModel) {
        option.messageType = option.messageType || MessageModal.MessageType.information;
    }

    private makeMessageHeader(option: message.MessageModalModel) {
        if (!option || !option.messageType || !option.header) return null;
        option.header.styleClass = option.header.styleClass
            ? option.header.styleClass
            : this.headerCssClass[option.messageType];
        option.header.iconClass = option.header.iconClass
            ? option.header.iconClass
            : this.headerIconClass[option.messageType];
    }

    private makeMessageFooter(option: message.MessageModalModel) {
        if (!option || !option.footer || !option.footer.buttonList || option.footer.buttonList.length <= 0) return null;
        for (const item of option.footer.buttonList) {
            item.buttonType = item.buttonType || MessageModal.ButtonType.primary;
            item.callBackFunc =
                item.callBackFunc ||
                (() => {
                    // do nothing for skip error when message don't have call back function
                });
        }
    }

    public showModal(): void {
        this.xnMessageModal.show();
        this.setIndexForMessageModal();
        setTimeout(() => {
            this.setModalPosition();
        }, 200);
    }

    public hideModal(): void {
        this.xnMessageModal.hide();
        setTimeout(() => {
            if (this.xnMessageModal.isShown) return;
            this.createEmptyMessage();
        }, 500);
        this.setIndexForMessageModal();
    }

    private setModalPosition() {
        let modal = $('#xn-bs-modal');
        if (!modal.is(':visible')) {
            return;
        }
        if (!modal.height()) {
            setTimeout(() => {
                this.setModalPosition();
            }, 500);
            return;
        }

        const modalContent = $('#xn-bs-modal-content');
        const modalBody = $('#xn-bs-modal-body');
        modalContent.css({
            height: modalBody.height() > 380 ? '500px' : '',
        });
        setTimeout(() => {
            modal = $('#xn-bs-modal');
            modal.css({
                'margin-top': 'calc((100vh - ' + modal.outerHeight() + 'px)/2)',
            });
        });
    }

    public onFocusModal() {
        this.focusOnPrimaryButton();
    }

    //#region Focus on Buttons
    private focusOnPrimaryButton() {
        if (!this.buttonfooters || !this.buttonfooters.length) return;

        // get first primary button
        let button = this.buttonfooters.find((item, i) => {
            return (
                item.nativeElement &&
                item.nativeElement.className &&
                item.nativeElement.className.indexOf('mat-btn-blue') !== -1
            );
        });

        // if cannot find the button -> will get first button
        button = button || this.buttonfooters.first;

        this.focusOnButton(button); //100
    }

    private focusOnButton(button: any, timeout?: number) {
        if (!button) return;

        //focus
        const elementRef: ElementRef = button['_elementRef'];
        if (elementRef && elementRef.nativeElement) {
            if (timeout) {
                setTimeout(() => {
                    elementRef.nativeElement.focus();
                }, timeout);
            } else {
                elementRef.nativeElement.focus();
            }
        }
    }

    private findAndFocusOnButton(index: number) {
        const control = this.buttonfooters.find((item, i) => i == index);

        this.focusOnButton(control);
    }

    public onKeyLeft($event: any, index: number) {
        index--;
        index = index < 0 ? 0 : index;

        this.findAndFocusOnButton(index);
    }
    public onKeyRight($event: any, index: number) {
        index++;
        index = index >= this.buttonfooters.length ? this.buttonfooters.length - 1 : index;

        this.findAndFocusOnButton(index);
    }

    private appendDefaultValueToTranslateResource() {
        for (let item of this.messageOption.footer.buttonList) {
            defaultLanguage['Message_Modal__btn_' + item.text] = item.text;
        }
        defaultLanguage['Message_Modal__btn_' + this.messageOption.header.text] = this.messageOption.header.text;
    }

    private setIndexForMessageModal() {
        const modal: HTMLElement = document.getElementById('xn-modal-message-main');
        modal.style.setProperty('z-index', this.currentZIndex + '', 'important');
        setTimeout(() => {
            const modalBackdrops: HTMLCollectionOf<Element> = document.getElementsByClassName('modal-backdrop');
            if (!modalBackdrops || !modalBackdrops.length) return;
            const modalBackdrop: HTMLElement = <HTMLElement>modalBackdrops[0];
            modalBackdrop.style.setProperty('z-index', this.currentZIndex - 1 + '', 'important');
        }, 200);
    }

    private buildMessageBody() {
        if (
            !this.messageOption ||
            !this.messageOption.body ||
            !this.messageOption.body.content ||
            !this.messageOption.body.content.length
        )
            return;
        let result = '';
        if (typeof this.messageOption.body.content === 'string') {
            result = this.messageOption.body.content;
        } else {
            for (let message of this.messageOption.body.content) {
                if (!message || !message.key) continue;
                if (message.key.indexOf('Modal_Message__') > -1) {
                    result +=
                        '<label-translation keyword="' +
                        message.key +
                        '">' +
                        this.translateService.instant(message.key) +
                        '</label-translation>';
                } else {
                    result += message.key;
                }
            }
        }
        this.messageBody = result;
    }

    //#endregion
}
