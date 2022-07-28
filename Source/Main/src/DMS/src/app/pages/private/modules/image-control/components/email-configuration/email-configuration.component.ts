import { Component, Input, Output, EventEmitter, OnChanges, SimpleChanges, OnInit } from '@angular/core';

import includes from 'lodash-es/includes';
import remove from 'lodash-es/remove';
import cloneDeep from 'lodash-es/cloneDeep';
import { ImageThumbnailModel } from '../../models/image.model';
import { DocumentImageOcrService } from '../../services';
import { ToasterService } from 'angular2-toaster';
import { MessageModal, UploadFileMode } from '@app/app.constants';
import { Uti } from '../../../../../../utilities';
import { TranslateService } from '@ngx-translate/core';
import { takeUntil } from 'rxjs/internal/operators/takeUntil';
import { Subject } from 'rxjs/internal/Subject';

@Component({
    selector: 'email-configuration',
    templateUrl: './email-configuration.component.html',
    styleUrls: ['./email-configuration.component.scss'],
})
export class EmailConfigurationComponent implements OnInit, OnChanges {
    constructor(
        private documentService: DocumentImageOcrService,
        private toastrService: ToasterService,
        private translateService: TranslateService,
    ) {}
    //Input
    @Input() isDialog: boolean;
    @Input() IdDocumentContainerScans: string;
    @Input() pages: ImageThumbnailModel[] = [];

    // Output
    @Output() onClose: EventEmitter<any> = new EventEmitter();

    // Variable
    // public
    public emailTo: string[] = [];
    public emailToInput = '';

    public emailSubject = '';
    public emailContent = `
Send from Xoonit
  `;
    public emailAttachment: any = [];

    public emailErrorText = '';

    public isLoading = false;
    // material-chip

    // dialog
    public isShowDialog = true;
    public dialogWidth = 1300;
    public dialogHeight = 1000;
    public isMaximizable = false;
    public dialogClass = 'prime-dialog ui-dialog-flat';
    public placeholder: { [key: string]: string } = { recipients: '', subject: '' };
    private destroy$: Subject<void> = new Subject<void>();

    // private

    ngOnInit(): void {
        this.setPlaceholder();
    }

    ngAfterViewInit() {
        this.translateService.onLangChange
            .pipe(
                takeUntil(this.destroy$)
            )
            .subscribe(() => {
                this.setPlaceholder();
            });
    }

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

    ngOnDestroy() {
        this.destroy$.next();
    }

    private setPlaceholder() {
        this.placeholder = {
            recipients: this.translateService.instant('EMAIL_CONFIGURATION__Recipients'),
            subject: this.translateService.instant('EMAIL_CONFIGURATION__Subject'),
        }
    }

    public onChangeSize = () => {
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
                this.emailErrorText = this.translateService.instant('EMAIL_VALIDATE__Duplicate');
            } else {
                this.emailTo.push(email);
                this.emailErrorText = '';
                this.emailToInput = '';
            }
        } else {
            this.emailErrorText = this.translateService.instant('EMAIL_VALIDATE__Invalid');
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
            .sendMailDocument({
                ToEmail: this.emailTo.join(','),
                Subject: this.emailSubject,
                Body: this.emailContent,
                IdDocumentContainerScans: this.IdDocumentContainerScans,
            })
            .subscribe(
                (response: any) => {
                    this.isLoading = false;
                    this.onClose.emit();
                },
                (err) => {
                    this.isLoading = false;
                    this.toastrService.pop(MessageModal.MessageType.error, 'System', err);
                },
            );
    }

    public getImageSrc(image: ImageThumbnailModel) {
        //console.log('image', image);
        const name = `${image.ScannedPath}\\${image.FileName || image.DocumentName}`;
        return Uti.getFileUrl(name, UploadFileMode.Path);
        //return `/api/FileManager/GetFile?name=${image.ScannedPath}\\${image.FileName || image.DocumentName}&mode=6`;
    }

    private checkValidateEmail(mail: string) {
        const regex = new RegExp('^[a-z][a-z0-9_.]{3,32}@[a-z0-9]{2,}(.[a-z0-9]{2,4}){1,2}$');
        return regex.test(mail);
    }
}
