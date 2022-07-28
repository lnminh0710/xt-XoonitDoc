import {
    Component,
    OnDestroy,
    ChangeDetectorRef,
    ViewChild,
    TemplateRef,
    ElementRef,
    NgZone,
    EventEmitter,
    Output,
    AfterViewInit,
    Input,
    OnInit,
} from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

import { BaseComponent, ModuleList } from '@app/pages/private/base';
import { Router } from '@angular/router';
import { ControlGridModel } from '@app/models';

import _filter from 'lodash-es/filter';

import {
    IdDocumentTreeConstant,
    MenuModuleId,
    MessageModal,
    MimeFileType,
    RepScanDeviceType,
    ServiceUrl,
} from '@app/app.constants';
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
    selector: 'widget-upload',
    templateUrl: './widget-upload.component.html',
    styleUrls: ['./widget-upload.component.scss'],
})
export class WidgetUploadComponent extends BaseComponent implements OnInit, AfterViewInit, OnDestroy {
    @Output() onClose: EventEmitter<any> = new EventEmitter();
    @Output() onUploadFinished: EventEmitter<any> = new EventEmitter();
    @Input() selectedFolder: any;
    @Input() fileUploaded: any;
    @Input() idRepDocumentGuiType = '5';

    public dataSource = <ControlGridModel>{
        columns: [],
        data: [],
        totalResults: 0,
    };
    @ViewChild('uploadBranch') uploadBranch: TemplateRef<any>;
    private _toastsPopupMap: Map<TypeToastPopupEnum, Toast> = new Map();
    public FILE_UPLOAD_STATUS_ENUM = FileUploadStatusEnum;

    @Input() acceptFileTypes? = `*`;
    public filesMap: Map<string, FileUploadXoonit> = new Map<string, FileUploadXoonit>();
    @Input() idPriceTag: any;
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
    public formGroup: FormGroup;
    public hasDataNotComplete = false;

    @ViewChild('ckboxSelectAll') ckboxSelectAll: MatCheckbox;

    constructor(
        protected router: Router,
        private ref: ChangeDetectorRef,
        private serUrl: ServiceUrl,
        private toastrService: ToasterService,
        private popupService: PopupService,
        private formBuilder: FormBuilder,

        private zone: NgZone,
    ) {
        super(router);
    }

    ngOnInit(): void {
        this.buildForm();
    }

    ngAfterViewInit(): void {
        let title = 'Upload';
        const popup = this.popupService.open({
            content: this.uploadBranch,
            containerClass: 'popup-upload',
            hasBackdrop: true,
            header: new HeaderNoticeRef({
                icon: {
                    type: 'resource',
                    content: '',
                },
                iconClose: true,
                title,
            }),
            disableCloseOutside: true,
        });
        popup.afterClosed$.subscribe(() => {
            this.onClose.emit();
        });

        popup.afterPopupOpened$.subscribe(() => {
            this.dropFiles(this.fileUploaded);
            const formElem = document.getElementById('form-upload-zone');
            if (!formElem) return;

            'drag dragstart'.split(' ').forEach((eventName) => {
                formElem.addEventListener(eventName, (e: DragEvent) => {
                    e.preventDefault();
                    e.stopPropagation();
                });
            });

            'dragenter dragover'.split(' ').forEach((eventName) => {
                formElem.addEventListener(eventName, (e: DragEvent) => {
                    e.preventDefault();
                    e.stopPropagation();

                    formElem.classList.add('is-dragging-over');
                });
            });

            'dragleave dragend'.split(' ').forEach((eventName) => {
                formElem.addEventListener(eventName, (e: DragEvent) => {
                    e.preventDefault();
                    e.stopPropagation();

                    formElem.classList.remove('is-dragging-over');
                });
            });

            formElem.addEventListener('drop', (e: DragEvent) => {
                const droppedFiles = e.dataTransfer.files;
                formElem.classList.remove('is-dragging-over');

                this.dropFiles(droppedFiles);
            });
        });
    }

    ngOnDestroy() {
        super.onDestroy();
    }

    private buildForm() {
        this.formGroup = this.formBuilder.group({
            files: [null, Validators.required],
        });
    }

    public openFilesDialog($event: MouseEvent) {
        $event.stopPropagation();
        $event.preventDefault();
        const input = document.querySelector('input[type=file]#files') as HTMLInputElement;

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
                url:
                    this.ofModule.idSettingsGUI === MenuModuleId.preissChild
                        ? this.serUrl.priceTagAttachment
                        : this.serUrl.uploadFileImagesScan,
            });
            if (this._isFileNameDuplicate(this.filesMap, file)) continue;

            fileUploadProgress.file = file;
            fileUploadProgress.documentType = this.getIdDocumentTree();
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
            this.ckboxSelectAll?.registerOnChange(this._onChangeCheckboxSelectAll.bind(this));
            this._disableUploadAllButton(false);
        }, 500);
    }

    public confirmUploadAll() {
        const validation = this._validateFilesBeforeUploadingAll();
        const files = _filter(validation.files, (_file) => _file.status !== FileUploadStatusEnum.UPLOADED);
        if (!files.length && !!validation.files.length) {
            return;
        }
        files.forEach((file) => {
            file.resetStatus();
        });

        this._disableUploadAllButton(true);

        const uploadingDoneSubject = new Subject<boolean>();
        const observables = from(files).pipe(
            mergeMap((file: FileUploadXoonit) => {
                if (file.status === FileUploadStatusEnum.CANCELLED || file.status === FileUploadStatusEnum.FAILED) {
                    file.resetStatus();
                }
                return this.startUploadingAsync(file);
            }),
            takeUntil(this.getUnsubscriberNotifier()),
            finalize(() => {
                this.toastrService.pop(MessageModal.MessageType.success, 'System', `Upload success`);
                this.onUploadFinished.emit();
                this._checkAndEnableUploadAllButton();
                uploadingDoneSubject.next(true);
                // this.removeAll();
            }),
        );

        observables.pipe(takeUntil(uploadingDoneSubject.asObservable())).subscribe(() => {});
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

    private _getDataFormatToUpload(fileUploadProgress: FileUploadXoonit): FormData | any {
        const formData = new FormData();
        const currentDate = new Date();
        const json = {
            LotItemId: null,
            IdRepScansContainerType: 1,
            IdRepScanDeviceType: RepScanDeviceType.Upload,
            IsSendToCapture: '0',
            IdDocumentTree: this.getIdDocumentTree(),
            IdRepDocumentGuiType: this.idRepDocumentGuiType,
            ScannerTwainDllVersion: null,
            ScannerDevice: null,
            IdLogin: this.selectedFolder?.idLogin,
            CustomerNr: '1',
            MediaCode: '1',
            ScannedPath: null,
            ScannedFilename: null,
            ScannedDateUTC: currentDate.toISOString().replace('T', ' ').replace('Z', ''),
            CoordinateX: null,
            CoordinateY: null,
            CoordinatePageNr: 0,
            IsWhiteMail: null,
            IsCheque: null,
            NumberOfImages: 1,
            SourceScanGUID: Uti.guid(),
            IsMediaCodeValid: null,
            IsCustomerNrValid: null,
            IsCustomerNrEnteredManually: null,
            IsMediaCodeEnteredManually: null,
            IsSynced: true,
            IsActive: '1',
            IsUserClicked: true,
            ElapsedTime: null,
            IsLocalDeleted: null,
            IsOnlyGamer: null,
            IdRepScansDocumentType: null,
            Notes: null,
        };
        formData.append('file', fileUploadProgress.file, fileUploadProgress.file?.name);
        if (this.ofModule.idSettingsGUI === MenuModuleId.preissChild && !!this.idPriceTag) {
            formData.append('IdPriceTag', this.idPriceTag);
            return formData;
        }
        formData.append('OrderScanning', JSON.stringify(json));

        return formData;
    }

    private _validateFilesBeforeUploadingAll(): { files: FileUploadXoonit[]; valid: boolean } {
        const files = this.getMapFiles().filter((file) => {
            if (file.status === FileUploadStatusEnum.UPLOADED) return true;
            if (file.invalid) return false;
            if (!file.checked) return false;
            if (!file.documentType) return false;
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

        const nameSplit = file?.name.split('.');
        const type = file?.type ? file.type : nameSplit[nameSplit.length - 1];
        if (this.acceptFileTypes !== '*' && !this.acceptFileTypes.includes(type)) {
            let toast = this._toastsPopupMap.get(TypeToastPopupEnum.InvalidFileType);
            if (toast) {
                this.toastrService.clear(toast.toastId, toast.toastContainerId);
            }

            toast = this.toastrService.pop(
                MessageModal.MessageType.warning,
                'System',
                'Please upload file correct type.',
            );
            this._toastsPopupMap.set(TypeToastPopupEnum.InvalidFileType, toast);
            return false;
        }

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

    private _onChangeCheckboxSelectAll(value: boolean) {
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
            //     this.ckboxSelectAll.checked = false;
            //     return;
            // }

            if (!file.checked) {
                obj.checkAll = false;
            } else {
                obj.isIndeterminate = true;
            }
        }
        if (!this.ckboxSelectAll) return;
        this.ckboxSelectAll.checked = obj.checkAll;
        // if checkAll = true, then indeterminate always false and vice versa
        this.ckboxSelectAll.indeterminate = !obj.checkAll && obj.isIndeterminate;
    }

    private dropFiles(files: any) {
        if (!files || !files.length) return;
        this.files = Array.from(files).filter((_f: any) => !Uti.getFileExtension(_f.name).match(/(exe|bat)$/i));
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

    public changeDocumentType(value, fileUploadProgress: FileUploadXoonit) {
        fileUploadProgress.documentType = value;
    }
    private getIdDocumentTree() {
        return this.ofModule.idSettingsGUI === ModuleList.Email.idSettingsGUI && this.selectedFolder?.isUser
            ? IdDocumentTreeConstant.EMAIL
            : this.selectedFolder?.idDocument;
    }
}
