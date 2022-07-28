import { Injectable } from '@angular/core';
import { CommonService } from '@app/services';
import { Observable } from 'rxjs';
import { MessageModal } from '@app/app.constants';
import * as message from '@app/models/common/message-modal';
import { String, Uti } from '@app/utilities';
import isNil from 'lodash-es/isNil';

@Injectable()
export class DownloadFileService {
    constructor(
        private commonService: CommonService) {
    }

    existedFiles: Array<string> = [];
    unexistedFiles: Array<string> = [];
    dowloadingQueuFiles: Array<string> = [];
    messageWarnFileUnExistedOption: message.MessageModalModel;

    public checkFileExisted(fileName: string): Observable<boolean> {
        if (!this.dowloadingQueuFiles.includes(fileName) && !this.unexistedFiles.includes(fileName)) {
            this.dowloadingQueuFiles.push(fileName);
            return this.commonService.checkFileExisted(fileName);
        }
        return null;
    }
    private rebuildRealFileName(fileName: any, mode?: any, idFolder?: any): string {
        if (!isNil(mode)) {
            fileName += '&mode=' + mode;
        }
        if (!isNil(idFolder)) {
            fileName += '&subFolder=' + idFolder;
        }
        return fileName;
    }

    public makeDownloadFile(fileName: string, returnFileName: string, modalService: any, mode?: any, idFolder?: any): void {
        let realFileName = this.rebuildRealFileName(fileName, mode, idFolder);
        if (this.existedFiles.includes(fileName)) {
            this.downloadFile(realFileName, returnFileName);
        } else {
            const _existedFile = this.checkFileExisted(realFileName);
            if (_existedFile)
                _existedFile.subscribe((response) => {
                    if (response) {
                        this.existedFiles.push(fileName);
                        this.downloadFile(realFileName, returnFileName);
                    } else if (modalService) {
                        if (this.dowloadingQueuFiles.length && this.dowloadingQueuFiles.includes(fileName))
                            this.dowloadingQueuFiles.splice(this.dowloadingQueuFiles.indexOf(fileName), 1);
                        this.unexistedFiles.push(fileName);
                        this.showModal(MessageModal.MessageType.warning, fileName, modalService);
                    }
                });
            else {
                if (this.unexistedFiles.includes(fileName)) {
                    this.showModal(MessageModal.MessageType.warning, fileName, modalService);
                }
            }
        }
    }

    public downloadFile(fileName: string, returnFileName: string): void {
        if (this.dowloadingQueuFiles.length && this.dowloadingQueuFiles.includes(fileName))
            this.dowloadingQueuFiles.splice(this.dowloadingQueuFiles.indexOf(fileName), 1);

        if (!returnFileName)
            returnFileName = fileName;

        const url = Uti.getFileUrl(fileName, null, returnFileName);
        this.downloadFileWithIframe(url);
    }

    public downloadZipFile(folderPath: string): void {
        let url = Uti._serviceUrl.getDocumentZipFile + '?' + 'path=' + folderPath;
        this.downloadFileWithIframe(url);
    }

    public downloadFileWithIframe(url: string) {
        try {
            const frame = document.createElement('iframe');
            frame.src = url;
            frame.style.display = "none";
            document.body.appendChild(frame);
            //setTimeout(() => {
            //    try {
            //        frame.remove();
            //    } catch (ex) { console.log(ex); }
            //}, 1000);
        } catch (ex) { console.log(ex); }
    }

    showModal(messageType: any, fileName: string, modalService: any) {
        this.messageWarnFileUnExistedOption = new message.MessageModalModel({
            // type: MessageModal.MessageType.success,
            messageType: messageType,
            modalSize: MessageModal.ModalSize.small,
            header: new message.MessageModalHeaderModel({
                text: 'Warning'
            }),
            body: new message.MessageModalBodyModel({
                isHtmlContent: true,
                content: String.Format(`
                            <p>
                                The download file: "{0}" does not exist any more.
                            </p>
                         `, fileName)
            }),
            footer: new message.MessageModalFooterModel({
                buttonList: [
                    new message.ButtonList({
                        buttonType: MessageModal.ButtonType.primary,
                        text: 'Ok',
                        customClass: 'btn-sm',
                        callBackFunc: () => {
                            modalService.hideModal();
                        }
                    })]
            })
        });
        modalService.createModal(this.messageWarnFileUnExistedOption);
        modalService.showModal();
    }
}
