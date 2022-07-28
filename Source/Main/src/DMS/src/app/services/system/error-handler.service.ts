import { Injectable, ErrorHandler, Injector } from '@angular/core';
import * as Raven from 'raven-js';

import { ModalService, CommonService } from '@app/services';
import { MessageModal, } from '@app/app.constants';
import { MessageModel, EmailModel } from '@app/models';
import { Uti } from '@app/utilities';

@Injectable()
export class AppErrorHandler implements ErrorHandler {
    private isShowDialog: boolean = false;
    private modalService: ModalService = undefined;
    private commonService: CommonService = undefined;

    constructor(protected injector: Injector) {
        this.commonService = this.injector.get(CommonService);
        this.modalService = this.injector.get(ModalService);
    }

    handleError(error) {
        // Log to the console.
        try {
            Raven.captureException(error);

            //this.showErrorDialog(error);

            console.group('ErrorHandler');
            if (error.message || error.stack) {
                if (error.message)
                    console.error(error.message);
                if (error.stack)
                    console.error(error.stack);
            } else {
                console.log('handleError:', error);
            }
            console.groupEnd();

        } catch (handlingError) {
            console.group('ErrorHandler');
            console.warn('Error when trying to output error.');
            console.error(handlingError);
            console.groupEnd();
        }
    }

    executeAction(func, funcError?): any {
        try {
            return func();
        } catch (e) {
            if (funcError)
                funcError();
            this.handleError(e);
        }
    }

    private sendEmailToAdmin(error: any) {
        //after sendmail successfully -> reload page
        let email = new EmailModel({
            ToEmail: '',
            Subject: 'System error',
            Body: error.stack || error.message,
            BrowserInfo: Uti.getBrowserInfo()
        });

        this.commonService.SendEmailWithImageAttached(email).subscribe(
            (response: any) => {
                location.reload();
            });
    }
    private showErrorDialog(error: any) {
        if (this.isShowDialog) return;

        this.isShowDialog = true;
        this.modalService.alertMessage(new MessageModel({
            headerText: 'System error',
            messageType: MessageModal.MessageType.error,
            modalSize: MessageModal.ModalSize.small,
            message: [{ key: 'Modal_Message__SystemErrorPleaseContactAdmin' }],
            okText: 'Send error to admin',
            callBack: () => {
                this.isShowDialog = false;
                this.sendEmailToAdmin(error);
            }
        }));
    }
}
