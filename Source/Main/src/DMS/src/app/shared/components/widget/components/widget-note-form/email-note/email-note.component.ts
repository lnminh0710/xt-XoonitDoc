import { Component, Input, Output, EventEmitter, OnChanges, SimpleChanges } from '@angular/core';

import includes from 'lodash-es/includes';
import remove from 'lodash-es/remove';
import cloneDeep from 'lodash-es/cloneDeep';
import { ToasterService } from 'angular2-toaster';
import { MessageModal, UploadFileMode } from '@app/app.constants';
import { DocumentService } from '@app/services';
import { finalize } from 'rxjs/operators';
import { Uti } from '../../../../../../utilities';

@Component({
    selector: 'email-note',
    templateUrl: './email-note.component.html',
    styleUrls: ['./email-note.component.scss'],
})
export class EmailNoteComponent implements OnChanges {

    @Input() isDialog: boolean;
    @Input() idMainDocument: string;
    @Input() pages = [];

    @Output() onClose: EventEmitter<any> = new EventEmitter();

    public emailTo: string[] = [];
    public emailToInput = '';
    public emailSubject = '';
    public emailContent = `Send from Xoonit`;
    public emailAttachment: any = [];
    public emailErrorText = '';
    public isLoading = false;
    public isShowDialog = true;
    public dialogWidth = 1300;
    public dialogHeight = 1000;
    public isMaximizable = false;
    public dialogClass = 'prime-dialog ui-dialog-flat';

    constructor(
        private toastrService: ToasterService,
        private documentService: DocumentService,
    ) { }

    ngOnChanges(changes: SimpleChanges) {
        if (changes['pages']) {
            for (const key in this.pages) {
                if (this.pages.hasOwnProperty(key)) {
                    const page = this.pages[key];
                    page.FileName = page.FileName || page.DocumentName;
                }
            }
        }
    }

    public onChangeSize() {
        if (this.isMaximizable) {
            this.dialogWidth = 1300;
            this.dialogHeight = 1000;
            this.dialogClass = this.dialogClass.replace(' fullscreen', '');
        } else {
            // const
            const ele = document.getElementsByClassName('ui-widget-overlay ui-dialog-mask')[0];
            if (!ele) return;
            const { width, height } = ele.getBoundingClientRect();
            this.dialogWidth = width;
            this.dialogHeight = height - 60;
            this.dialogClass += ' fullscreen';
        }

        this.isMaximizable = !this.isMaximizable;
    };

    public close() {
        if (this.isLoading) return;
        this.onClose.emit();
    }

    public add() {
        const email = this.emailToInput;
        if (!email) return;
        const isValid = this.checkValidateEmail(email);
        if (isValid) {
            if (includes(this.emailTo, email)) {
                this.emailErrorText = 'Email dupplicate';
            } else {
                this.emailTo.push(email);
                this.emailErrorText = '';
                this.emailToInput = '';
            }
        } else {
            this.emailErrorText = 'Email invalid';
        }
    }

    public remove(email: string) {
        const emails = cloneDeep(this.emailTo);
        remove(emails, (_e) => _e === email);
        this.emailTo = emails;
    }

    public onChangeEmailContent(event: any) {
        this.emailContent = event.target.value;
    }

    public onChangeEmailSubject(event: any) {
        this.emailSubject = event.target.value;
    }

    public sendMail() {
        if (!this.emailTo.length || this.isLoading) return;
        this.isLoading = true;
        this.documentService
            .sendEmailNotes({
                ToEmail: this.emailTo.join(','),
                Subject: this.emailSubject,
                Body: this.emailContent,
                IdMainDocument: this.idMainDocument,
            })
            .pipe(
                finalize(() => this.isLoading = false)
            )
            .subscribe(
                (response: any) => {
                    this.onClose.emit();
                },
                (err) => {
                    this.toastrService.pop(MessageModal.MessageType.error, 'System', err);
                },
            );
    }

    public getImageSrc(image) {
        const name = `${image.ScannedPath}\\${image.FileName || image.DocumentName}`;
        return Uti.getFileUrl(name, UploadFileMode.Path);
        //return `/api/FileManager/GetFile?name=${image.ScannedPath}\\${image.FileName || image.DocumentName}&mode=6`;
    }

    private checkValidateEmail(mail: string) {
        const regex = new RegExp('^[a-z][a-z0-9_.]{3,32}@[a-z0-9]{2,}(.[a-z0-9]{2,4}){1,2}$');
        return regex.test(mail);
    }
}
