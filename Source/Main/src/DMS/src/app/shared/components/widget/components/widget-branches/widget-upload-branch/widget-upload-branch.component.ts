import {
    Component,
    OnInit,
    OnDestroy,
    ChangeDetectorRef,
    ViewChild,
    TemplateRef,
    ElementRef,
    NgZone,
    EventEmitter,
    Output,
    AfterViewInit,
} from '@angular/core';
import { FormGroup } from '@angular/forms';

import { BaseComponent } from '@app/pages/private/base';
import { Router } from '@angular/router';
import { ControlGridModel } from '@app/models';

import _filter from 'lodash-es/filter';

import { MessageModal, MimeFileType, ServiceUrl } from '@app/app.constants';
import { FileUploadXoonit } from '@app/models/import-upload/file-upload-xoonit.model';
import { FileUploadProgress, FileUploadStatusEnum } from '@app/models/import-upload/file-upload-progress.model';
import { MatCheckbox, MatCheckboxChange } from '@xn-control/light-material-ui/checkbox';
import { Toast, ToasterService } from 'angular2-toaster';
import { from, Observable, of, Subject } from 'rxjs';
import { catchError, finalize, mergeMap, takeUntil, tap } from 'rxjs/operators';
import { Uti } from '@app/utilities';
import { PopupService } from '@app/xoonit-share/components/global-popup/services/popup.service';
import { HeaderNoticeRef } from '@app/xoonit-share/components/global-popup/components/header-popup/header-notice-ref';

enum TypeToastPopupEnum {
    InvalidFileType = 1,
    InvalidFileLength = 2,
}

@Component({
    selector: 'widget-upload-branches',
    templateUrl: './widget-upload-branch.component.html',
    styleUrls: ['./widget-upload-branch.component.scss'],
})
export class WidgetUploadBranchesComponent extends BaseComponent implements AfterViewInit, OnDestroy {
    @Output() onClose: EventEmitter<any> = new EventEmitter();

    public dataSource = <ControlGridModel>{
        columns: [],
        data: [],
        totalResults: 0,
    };
    @ViewChild('uploadBranch') uploadBranch: TemplateRef<any>;
    private _toastsPopupMap: Map<TypeToastPopupEnum, Toast> = new Map();
    public FILE_UPLOAD_STATUS_ENUM = FileUploadStatusEnum;

    public acceptFileTypes = `${MimeFileType.PDF},${MimeFileType.TIFF},${MimeFileType.PNG},${MimeFileType.JPEG}`;
    public formGroup: FormGroup;
    public filesMap: Map<string, FileUploadXoonit> = new Map<string, FileUploadXoonit>();
    private _popup: any;
    public getMapFiles(): FileUploadXoonit[] {
        const array = [];
        this.filesMap.forEach((fileUploadProgress) => {
            array.push(fileUploadProgress);
        });

        return array;
    }
    public files: any;
    public fileContentType: any;
    public disabledButton = false;
    public hasDataNotComplete = false;
    @ViewChild('form') formElemRef: ElementRef;
    @ViewChild('ckboxAll') ckboxAll: MatCheckbox;

    constructor(
        protected router: Router,
        private ref: ChangeDetectorRef,
        private serUrl: ServiceUrl,
        private toastrService: ToasterService,
        private popupService: PopupService,

        private zone: NgZone,
    ) {
        super(router);
    }

    ngAfterViewInit(): void {
        const popup = this.popupService.open({
            content: this.uploadBranch,
            hasBackdrop: true,
            header: new HeaderNoticeRef({ iconClose: true, title: 'Upload branch' }),
            disableCloseOutside: true,
        });
        popup.afterClosed$.subscribe(() => {
            this.close();
        });
        this._popup = popup;
    }

    ngOnDestroy() {
        super.onDestroy();
    }

    public close() {
        this._popup?.close();
        this.onClose.emit();
    }

    public openFilesDialog($event: MouseEvent) {
        $event.stopPropagation();
        $event.preventDefault();
        const input = this.formElemRef.nativeElement.querySelector('input[type=file]') as HTMLInputElement;

        // clear previous file even though it's the same one
        // if remove this line so that you can't import the same previous one
        input.value = '';
        input.click();
    }
    public formatByte(byte: number) {
        return Uti.formatBytes(byte);
    }

    public onCheckedFile(value: MatCheckboxChange, fileUploadProgress: FileUploadXoonit) {
        if (fileUploadProgress.invalid) {
            // value.source.checked = false;
            fileUploadProgress.checked = value.checked;
            this._checkAndTickCheckedMatCheckAll();
            return;
        }

        fileUploadProgress.checked = value.checked;
        this._checkAndTickCheckedMatCheckAll();

        this._checkAndEnableUploadAllButton();
    }

    public onFileChange($event: Event) {
        const inputElem = $event.target as HTMLInputElement;
        this.dropFiles(inputElem.files);
    }

    public updateFiles(closePopup: (data?: any) => void, isUpdate?: boolean) {
        closePopup();
        if (!isUpdate) {
            this.files = null;
            return;
        }
        const files = this.files;
        if (!files || !files.length) return;

        for (let i = 0; i < files.length; i++) {
            const file = files[i];
            const fileUploadProgress = new FileUploadXoonit({
                setRequestHeader: () => {
                    return {
                        Accept: 'application/json',
                        'Cache-Control': 'no-cache',
                        Pragma: 'no-cache',
                    };
                },
                withCredentials: true,
                url: file.isServerFile ? this.serUrl.importFileFromServer : this.serUrl.importFileFromLocal,
            });
            //&IdRepDocumentContainerFilesContentType=${this.fileContentType.idValue}
            if (this._isFileNameDuplicate(this.filesMap, file)) continue;

            fileUploadProgress.file = file;
            fileUploadProgress.resetStatus();
            if (this.fileContentType) {
                fileUploadProgress.documentId = this.fileContentType.idValue;
                fileUploadProgress.documentPath = this.fileContentType.textValue;
            }
            this.filesMap.set(file.name, fileUploadProgress);
            this._validateFileDropped(file).then(
                ((isValid) => {
                    fileUploadProgress.invalid = !isValid;
                    fileUploadProgress.checked = isValid;

                    if (fileUploadProgress.invalid) {
                        this.removeItem(fileUploadProgress);
                    }
                }).bind(this),
            );
        }
        this.ref.detectChanges();
        setTimeout(() => {
            this._checkAndTickCheckedMatCheckAll();
            this.ckboxAll?.registerOnChange(this._onChangeCheckboxAll.bind(this));
            this._disableUploadAllButton(false);
        }, 200);
    }

    public confirmUploadAll() {
        this.toastrService.pop(MessageModal.MessageType.warning, 'System', 'Feature not implemented yet!');
        return;
        // const validation = this._validateFilesBeforeUploadingAll();
        // const files = _filter(validation.files, (_file) => _file.status !== FileUploadStatusEnum.UPLOADED);
        // if (!files.length && !!validation.files.length) {
        //     return;
        // }
        // files.forEach((file) => {
        //     file.resetStatus();
        // });

        // this._disableUploadAllButton(true);

        // const uploadingDoneSubject = new Subject<boolean>();
        // const observables = from(files).pipe(
        //     mergeMap((file: FileUploadXoonit) => {
        //         if (file.status === FileUploadStatusEnum.CANCELLED || file.status === FileUploadStatusEnum.FAILED) {
        //             file.resetStatus();
        //         }
        //         return this.startUploadingAsync(file);
        //     }),
        //     takeUntil(this.getUnsubscriberNotifier()),
        //     finalize(() => {
        //         this._checkAndEnableUploadAllButton();
        //         uploadingDoneSubject.next(true);
        //     }),
        // );

        // observables.pipe(takeUntil(uploadingDoneSubject.asObservable())).subscribe(() => {});
    }

    public removeAll() {
        for (const file of this.getMapFiles()) {
            if (!file.checked) continue;

            this.removeItem(file);
        }
        this._disableUploadAllButton(true);
    }

    public showButtonRetryToUpload(fileUploadProgress: FileUploadXoonit) {
        switch (fileUploadProgress.status) {
            case FileUploadStatusEnum.FAILED:
            case FileUploadStatusEnum.CANCELLED:
                return true;

            default:
                return false;
        }
    }

    public retryToUpload(fileUploadProgress: FileUploadXoonit) {
        fileUploadProgress.resetStatus();
        fileUploadProgress.retryToUpload();
    }

    public removeItem(fileUploadProgress: FileUploadXoonit) {
        const found = this.filesMap.get(fileUploadProgress.file.name);
        if (!found) return;

        fileUploadProgress.abort();
        fileUploadProgress.clear();

        this.filesMap.delete(fileUploadProgress.file.name);
        fileUploadProgress = null;
        this._checkAndTickCheckedMatCheckAll();
    }

    public startUploadingAsync(fileUploadProgress: FileUploadXoonit): Observable<FileUploadProgress> {
        // in case uploading, then a file is cancel or maybe cancel all
        if (
            fileUploadProgress.status === FileUploadStatusEnum.CANCELLED ||
            fileUploadProgress.status === FileUploadStatusEnum.UPLOADED
        )
            return of(fileUploadProgress);
        const formData = this._getDataFormatToUpload(fileUploadProgress);

        return this.zone.runOutsideAngular(() => {
            return fileUploadProgress.uploadAsync(formData).pipe(
                tap(() => {
                    // this.importUploadDone(fileUploadProgressData as FileUploadXoonit);
                }),
                catchError(() => of(fileUploadProgress)),
            );
        });
    }

    private _getFileNameFormatUpload(fileUploadProgress: FileUploadXoonit) {
        if (!fileUploadProgress || !fileUploadProgress.file) throw new Error('The file is empty');

        const file = fileUploadProgress.file;
        const fileNameWithoutExt = file.name.substring(0, file.name.lastIndexOf('.'));
        switch (file.type) {
            case MimeFileType.PDF:
                return `${fileNameWithoutExt}.tiff.pdf`;

            case MimeFileType.PNG:
                return `${fileNameWithoutExt}.tiff.1.png`;

            case MimeFileType.JPEG:
                return `${fileNameWithoutExt}.tiff.1.jpg`;

            case MimeFileType.TIFF:
                return `${fileNameWithoutExt}.tiff`;

            default:
                this.toastrService.pop(MessageModal.MessageType.error, 'System', `Not supported ${file.type}`);
            // throw new Error(`Not supported ${file.type}`);
        }
    }

    private _getDataFormatToUpload(fileUploadProgress: FileUploadXoonit): FormData | any {
        const formData = new FormData();

        const fileName = this._getFileNameFormatUpload(fileUploadProgress);
        formData.append('file', fileUploadProgress.file, fileName);
        return formData;
    }

    private _validateFilesBeforeUploadingAll(): { files: FileUploadXoonit[]; valid: boolean } {
        const files = this.getMapFiles().filter((file) => {
            if (file.status === FileUploadStatusEnum.UPLOADED) return true;
            if (file.invalid) return false;
            if (!file.checked) return false;
            if (!this._isValidFileToUpload(file)) return false;
            if (!this._canUpload(file)) return false;
            return true;
        });

        if (files.length === 0) {
            this._disableUploadAllButton(true);
            return {
                files: [],
                valid: false,
            };
        }

        return {
            files,
            valid: true,
        };
    }

    private _handleInvalidFileLength() {
        let toast = this._toastsPopupMap.get(TypeToastPopupEnum.InvalidFileLength);
        if (toast) {
            this.toastrService.clear(toast.toastId, toast.toastContainerId);
        }

        toast = this.toastrService.pop(
            MessageModal.MessageType.warning,
            'System',
            'Please upload file size less than 100MB.',
        );
        this._toastsPopupMap.set(TypeToastPopupEnum.InvalidFileLength, toast);
    }

    private _isValidContentLengthFile(
        size: number,
        onValidCallback?: () => boolean,
        onInvalidCallback?: () => boolean,
    ) {
        // size is falsy
        if (!size) return onInvalidCallback ? onInvalidCallback() : false;

        // if size > 100 MB
        if (size / 1024 / 1024 > 100) return onInvalidCallback ? onInvalidCallback() : false;

        return onValidCallback ? onValidCallback() : true;
    }

    private async _validateFileDropped(file: File): Promise<boolean> {
        if (!file) return false;

        const _isValidContentLengthFile = this._isValidContentLengthFile(file.size, null, () => {
            this._handleInvalidFileLength();
            return false;
        });

        if (!_isValidContentLengthFile) return false;

        return true;
    }

    private _updateDataForFilesMap(
        updatedData: any,
        isValidFile: (fileUploadProgress: FileUploadXoonit) => boolean,
        beforeUpdate?: (fileUploadProgress: FileUploadXoonit) => void,
        afterUpdate?: (fileUploadProgress: FileUploadXoonit) => void,
    ) {
        this.filesMap.forEach((fileUploadProgress) => {
            if (isValidFile(fileUploadProgress) === false) return;

            beforeUpdate && beforeUpdate(fileUploadProgress);

            fileUploadProgress.updateWith(updatedData);

            afterUpdate && afterUpdate(fileUploadProgress);
        });
    }

    private _isValidFileToUpload(fileUploadProgress: FileUploadXoonit): boolean {
        if (!fileUploadProgress) return false;

        if (
            fileUploadProgress.status === FileUploadStatusEnum.UPLOADING ||
            fileUploadProgress.status === FileUploadStatusEnum.UPLOADED ||
            fileUploadProgress.status === FileUploadStatusEnum.INVALID
        ) {
            return false;
        }

        return true;
    }

    private _canUpload(file: FileUploadXoonit): boolean {
        // has not checked
        if (!file.checked) {
            return false;
        }

        return true;
    }

    private _hasAtLeastValidFileToUpload() {
        let atLeastValidFile = false;

        const arrFilesMap = this.getMapFiles();
        for (let i = 0; i < arrFilesMap.length; i++) {
            const file = arrFilesMap[i];
            if (file.invalid) continue;

            if (this._isValidFileToUpload(file)) {
                if (this._canUpload(file)) {
                    atLeastValidFile = true;
                    break;
                }
            }
        }

        return atLeastValidFile;
    }
    private _checkAndEnableUploadAllButton() {
        const atLeastValidFile = this._hasAtLeastValidFileToUpload();
        this._disableUploadAllButton(!atLeastValidFile);
    }

    private _onChangeCheckboxAll(value: boolean) {
        this._updateDataForFilesMap(
            <FileUploadXoonit>{ checked: value }, // data to update
            (fileUploadProgress) => {
                // satisfied item to update
                // if (fileUploadProgress.invalid) return false;

                // if this file can upload must be checked
                return fileUploadProgress.status !== FileUploadStatusEnum.UPLOADED;
            },
            null, // before update item
            null, // after update item
        );
        this._checkAndEnableUploadAllButton();
    }

    private _checkAndTickCheckedMatCheckAll() {
        const obj = { checkAll: true, isIndeterminate: false };

        const arrFilesMap = this.getMapFiles();
        for (let i = 0; i < arrFilesMap.length; i++) {
            const file = arrFilesMap[i];
            // if (this.isInvalidFile(file) === false && !file.checked) {
            //     this.ckboxAll.checked = false;
            //     return;
            // }

            if (!file.checked) {
                obj.checkAll = false;
            } else {
                obj.isIndeterminate = true;
            }
        }
        if (!this.ckboxAll) return;
        this.ckboxAll.checked = obj.checkAll;
        // if checkAll = true, then indeterminate always false and vice versa
        this.ckboxAll.indeterminate = !obj.checkAll && obj.isIndeterminate;
    }

    private dropFiles(files: any) {
        if (!files || !files.length) return;
        this.files = files;
        this.updateFiles(() => undefined, true);
    }

    private _isFileNameDuplicate(filesMap: Map<string, FileUploadXoonit>, file: File): boolean {
        if (!filesMap || !filesMap.size) return false;

        const keys = Object.keys(filesMap);
        return keys.indexOf(file.name) !== -1;
    }

    private _disableUploadAllButton(isDisabled = true) {
        this.disabledButton = isDisabled;
    }
}
