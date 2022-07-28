import {
    Component,
    OnInit,
    ViewChild,
    ElementRef,
    AfterViewInit,
    ChangeDetectorRef,
    OnDestroy,
    NgZone,
    TemplateRef,
} from '@angular/core';
import { Router } from '@angular/router';
import { BaseComponent } from '@app/pages/private/base';
import { Module, User } from '@app/models';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import {
    MimeFileType,
    MessageModal,
    ServiceUrl,
    RepScanDeviceType,
    DocumentMyDMType,
    Configuration,
    DocumentTypeEnum,
} from '@app/app.constants';
import { ToasterService, Toast } from 'angular2-toaster';
import { AppState } from '@app/state-management/store';
import { Store } from '@ngrx/store';
import { ImportUploadSelectors } from '@app/pages/import-upload/import-upload.statemanagement/import-upload.selectors';
import { FileUploadProgress, FileUploadStatusEnum } from '@app/models/import-upload/file-upload-progress.model';
import { FileUploadXoonit } from '@app/models/import-upload/file-upload-xoonit.model';
import { Uti } from '@app/utilities';
import * as FileType from 'file-type';

import { takeUntil, finalize, catchError, tap, mergeMap, filter, take } from 'rxjs/operators';
import { of, from } from 'rxjs';
import { Observable, Subject } from 'rxjs';
import { AdministrationDocumentActions } from '@app/state-management/store/actions';
import { DocumentManagementSelectors } from '@app/pages/document-management/document-management.statemanagement/document-management.selectors';
import {
    GetDocumentFilesByFolderAction,
    DocumentManagementActionNames,
} from '@app/pages/document-management/document-management.statemanagement/document-management.actions';
import {
    ImportUploadDoneAction,
    ClearSelectedFolderAction,
} from '@app/pages/import-upload/import-upload.statemanagement/import-upload.actions';
import { MatSlideToggleChange, MatSlideToggle } from '@app/shared/components/xn-control/light-material-ui/slide-toggle';
import { DocumentTreeModel } from '@app/models/administration-document/document-tree.payload.model';
import { MatIconRegistry } from '@xn-control/light-material-ui/icon';
import { IconNames } from '@app/app-icon-registry.service';
import { MatCheckboxChange, MatCheckbox } from '@xn-control/light-material-ui/checkbox';
import { MatButton } from '@xn-control/light-material-ui/button';
import { AppErrorHandler, ModalService, UserService } from '@app/services';
import { TranslateService } from '@ngx-translate/core';
import { MainDocumentModel } from '@app/models/administration-document/document-form/main-document.model';
import { DocumentTreeMediaModel } from '@app/models/administration-document/document-form/document-tree-media.model';
import { InvoiceFormModel } from '@app/models/administration-document/document-form/invoice-form.model';
import { ContractFormModel } from '@app/models/administration-document/document-form/contract-form.model';
import { PopupService } from '@app/xoonit-share/components/global-popup/services/popup.service';
import { defaultLanguage } from '@app/app.resource';
import { HeaderNoticeRef } from '@app/xoonit-share/components/global-popup/components/header-popup/header-notice-ref';

@Component({
    selector: 'widget-import-upload-file',
    templateUrl: './widget-import-upload-file.component.html',
    styleUrls: ['./widget-import-upload-file.component.scss'],
})
export class WidgetImportUploadFileComponent extends BaseComponent implements OnInit, AfterViewInit, OnDestroy {
    public readonly DocumentTypeEnum = DocumentTypeEnum;
    private _selectedFolder: DocumentTreeModel;

    public moduleFromRoute: Module;
    public columns: any[];
    public keyword: string;
    public formGroup: FormGroup;
    public acceptFileTypes = `*`;

    public filesMap: Map<string, FileUploadXoonit> = new Map<string, FileUploadXoonit>();
    currentUser: User;
    public getMapFiles(): FileUploadXoonit[] {
        const array = [];
        this.filesMap.forEach((fileUploadProgress) => {
            array.push(fileUploadProgress);
        });

        return array;
    }
    public isSendToCapture = true;

    public FILE_UPLOAD_STATUS_ENUM = FileUploadStatusEnum;
    public svgVisibility = IconNames.WIDGET_IMPORT_UPLOAD_FILE_Visibility;
    public svgRemove = IconNames.WIDGET_IMPORT_UPLOAD_FILE_Remove;
    public svgRefresh = IconNames.WIDGET_IMPORT_UPLOAD_FILE_Refresh;
    public svgInvalid = IconNames.APP_FAILED_CIRCLE;
    public svgChecked = IconNames.APP_CHECKED_CIRCLE;
    public svgAttachment = IconNames.WIDGET_IMPORT_UPLOAD_ATTACHMENT;

    // file dialog
    public isShowDialog: boolean;
    public fileViewer: File;
    public totalItemUploadSuccess = 0;
    public totalItemUploadFail = 0;

    get selectedFolder(): DocumentTreeModel {
        return this._selectedFolder;
    }

    @ViewChild('form') formElemRef: ElementRef;
    @ViewChild(MatSlideToggle) matSlideToggle: MatSlideToggle;
    @ViewChild('ckboxAll') ckboxAll: MatCheckbox;
    @ViewChild('btnUploadAll') btnUploadAll: MatButton;
    @ViewChild('fileUploadInformation') fileUploadInformation: TemplateRef<any>;

    constructor(
        protected router: Router,
        private zone: NgZone,
        private formBuilder: FormBuilder,
        private toastrService: ToasterService,
        private store: Store<AppState>,
        private importUploadSelectors: ImportUploadSelectors,
        private serUrl: ServiceUrl,
        private cdRef: ChangeDetectorRef,
        private iconRegistry: MatIconRegistry,
        private administrationDocumentActions: AdministrationDocumentActions,
        private documentManagementSelectors: DocumentManagementSelectors,
        private translateService: TranslateService,
        private modalService: ModalService,
        private popupService: PopupService,
        private _userService: UserService,
        private appErrorHandler: AppErrorHandler,
    ) {
        super(router);
        this.moduleFromRoute = this.ofModule;
        this.buildForm();
        this.registerSubscriptions();
    }

    ngOnInit(): void {
        this._userService.currentUser.subscribe((user: User) => {
            this.appErrorHandler.executeAction(() => {
                this.currentUser = user;
            });
        });
    }

    ngAfterViewInit(): void {
        const formElem = this.formElemRef.nativeElement as HTMLFormElement;
        //const isSendToCaptureElem = this.formElemRef.nativeElement as HTMLFormElement;

        'drag dragstart'.split(' ').forEach((eventName) => {
            formElem.addEventListener(eventName, (e: DragEvent) => {
                e.preventDefault();
                e.stopPropagation();
            });
        });

        'dragenter dragover'.split(' ').forEach((eventName) => {
            formElem.addEventListener(eventName, (e: DragEvent) => {
                if (!Configuration.PublicSettings.importEmail_DeleteWhenDragFromOutlook) {
                    //Prevent deleting the email when draging it from Outlook to my upload file zone (my web)
                    e.dataTransfer.dropEffect = 'copy';
                }
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
    }

    public ngOnDestroy(): void {
        this.store.dispatch(new ClearSelectedFolderAction());
        super.onDestroy();
    }

    private registerSubscriptions() {
        // this.documentManagementSelectors
        //     .actionOfType$(DocumentManagementActionNames.GET_DOCUMENT_FILES_BY_FOLDER)
        //     .pipe(
        //         filter((action: GetDocumentFilesByFolderAction) => !!action.payload),
        //         takeUntil(this.getUnsubscriberNotifier()),
        //     )
        //     .subscribe((action: GetDocumentFilesByFolderAction) => {
        //         const folder = action.payload;
        //     });

        this.importUploadSelectors.selectedFolder$
            .pipe(takeUntil(this.getUnsubscriberNotifier()))
            .subscribe((selectedFolder) => {
                this._selectedFolder = selectedFolder;
                this.isSendToCapture =
                    this._selectedFolder?.idDocumentType === DocumentTypeEnum.INVOICE_APPROVAL || this.isSendToCapture;

                if (!this._selectedFolder) return;

                this.updateDataForFilesMap(
                    <FileUploadXoonit>{
                        documentPath: selectedFolder.path,
                        documentId: selectedFolder.idDocument,
                        documentType: selectedFolder.idDocumentType,
                        documentTypeParent: selectedFolder.idDocumentParent,
                    },
                    (fileUploadProgress) => {
                        if (
                            !fileUploadProgress.checked ||
                            this.isUploadingFile(fileUploadProgress) ||
                            this.isUploadedFile(fileUploadProgress)
                        )
                            return false;

                        return true;
                    },
                    null,
                    () => this.checkAndEnableUploadAllButton(),
                );

                this.cdRef.detectChanges();
            });
    }

    // public isReadyToUpload(fileUploadProgress: FileUploadXoonit) {
    //     return fileUploadProgress.isReadyToUpload;
    // }

    // public didUploadFailed(fileUploadProgress: FileUploadXoonit) {
    //     return !this.onUploading(fileUploadProgress) && fileUploadProgress.isFailedUpload;
    // }

    // public didCancelledUploading(fileUploadProgress: FileUploadXoonit) {
    //     return !this.onUploading(fileUploadProgress) && fileUploadProgress.isCancelled;
    // }

    // public didUploadDone(fileUploadProgress: FileUploadXoonit) {
    //     return !this.onUploading(fileUploadProgress) && fileUploadProgress.isUploadedDone;
    // }

    // public onUploading(fileUploadProgress: FileUploadXoonit) {
    //     return fileUploadProgress.isUploading;
    // }

    public formatByte(byte: number) {
        return Uti.formatBytes(byte);
    }

    public removeItem(fileUploadProgress: FileUploadXoonit) {
        const found = this.filesMap.get(fileUploadProgress.file.name);
        if (!found) return;

        fileUploadProgress.abort();
        fileUploadProgress.clear();

        this.filesMap.delete(fileUploadProgress.file.name);
        fileUploadProgress = null;
    }

    public retryToUpload(fileUploadProgress: FileUploadXoonit) {
        fileUploadProgress.resetStatus();
        fileUploadProgress.retryToUpload();
    }

    public rowClicked($event) {}

    public rowDoubleClicked($event) {}

    public onSearchCompleted($event: any) {
        if (!$event) return;

        this.columns = $event.columns;
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

    public onFileChange($event: Event) {
        const inputElem = $event.target as HTMLInputElement;
        this.dropFiles(inputElem.files);
    }

    public startUploading(fileUploadProgress: FileUploadXoonit) {
        switch (fileUploadProgress.status) {
            case FileUploadStatusEnum.UPLOADING:
            case FileUploadStatusEnum.UPLOADED:
                return;
            default:
                break;
        }

        const observable = this.startUploadingAsync(fileUploadProgress);
        observable.pipe(take(1)).subscribe((_) => {});
    }

    public startUploadingAsync(fileUploadProgress: FileUploadXoonit): Observable<FileUploadProgress> {
        // in case uploading, then a file is cancel or maybe cancel all
        if (fileUploadProgress.status === FileUploadStatusEnum.CANCELLED) return of(fileUploadProgress);
        const formData = this.getDataFormatToUpload(fileUploadProgress);

        return this.zone.runOutsideAngular(() => {
            return fileUploadProgress.uploadAsync(formData).pipe(
                tap((fileUploadProgressData) => {
                    // this.importUploadDone(fileUploadProgressData as FileUploadXoonit);
                }),
                catchError(() => of(fileUploadProgress)),
            );
        });
    }

    public startUploadingAll() {
        const validateForMsgFile = this.validateForMsgFile();
        if (!validateForMsgFile) return;

        const validation = this.validateFilesBeforeUploadingAll();
        if (!validation.valid) {
            return;
        }
        this._showPopupMessageBeforeUpload();
    }

    public confirmUploadAll() {
        const validation = this.validateFilesBeforeUploadingAll();
        const files = validation.files;

        files.forEach((file) => {
            file.resetStatus();
            file.isSentToCapture = this.matSlideToggle.checked;
        });

        this.disableUploadAllButton(true);

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
                this.showNoticeSummaryWhenUploadDone();
                this.checkAndEnableUploadAllButton();
                uploadingDoneSubject.next(true);
            }),
        );

        observables.pipe(takeUntil(uploadingDoneSubject.asObservable())).subscribe((val) => {});
    }

    public removeAll() {
        for (const file of this.getMapFiles()) {
            if (!file.checked) continue;

            this.removeItem(file);
        }

        this.disableUploadAllButton(true);
    }

    private validateChangeSendToCaptureForMsgFile() {
        if (!this.isSendToCapture && this.hasAnyMsgFile()) {
            this.isSendToCapture = false;

            this.toastrService.clear();
            this.toastrService.pop(
                MessageModal.MessageType.warning,
                'System',
                'You can not change the [Send to capture] option when import an email file',
            );
            return false;
        }
        return true;
    }

    public isSendToCaptureChanged($event: MatSlideToggleChange) {
        if (!this.validateChangeSendToCaptureForMsgFile()) {
            return;
        }

        if (this.canToggleOffSendToCapture() === false) {
            this.showMessageCannotSaveDocumentAfterUpload();
            this.isSendToCapture = true;
            return;
        }
        this.isSendToCapture = !this.isSendToCapture;
    }

    public isSendToCaptureClicked($event) {
        if (!this.validateChangeSendToCaptureForMsgFile()) {
            $event.preventDefault();
            $event.stopPropagation();
            return;
        }

        if (this.canToggleOffSendToCapture() === false) {
            this.showMessageCannotSaveDocumentAfterUpload();
            this.isSendToCapture = true;
            $event.preventDefault();
            $event.stopPropagation();
            return;
        }
    }

    public isSendToCaptureKeyPressed($event: KeyboardEvent) {
        if ($event.keyCode === 32 && this.canToggleOffSendToCapture() === false) {
            this.showMessageCannotSaveDocumentAfterUpload();
            this.isSendToCapture = true;
            setTimeout(() => {
                this.matSlideToggle._elementRef.nativeElement.classList.add('mat-checked');
            }, 200);

            return false;
        }
        return true;
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

    public onCheckedFile(value: MatCheckboxChange, fileUploadProgress: FileUploadXoonit) {
        if (fileUploadProgress.invalid) {
            // value.source.checked = false;
            fileUploadProgress.checked = value.checked;
            this.checkAndTickCheckedMatCheckAll();
            return;
        }

        // if checked this file
        // and want to save document after upload file
        // but document type has not assigned
        if (value.checked && this._isSavedAfterUpload() && fileUploadProgress.documentId <= 0) {
            value.source.checked = false;
            this.showMessageCannotSaveDocumentAfterUpload();
            return;
        }

        fileUploadProgress.checked = value.checked;
        this.checkAndTickCheckedMatCheckAll();

        this.checkAndEnableUploadAllButton();

        // const documentNodeQuantityChangedList: DocumentNodeQuantityChanged[] = [];
        // if (this.isValidFileToUpload(fileUploadProgress)) {
        //     this.pushItemDocumentNodeQuantityChanged(documentNodeQuantityChangedList, {
        //         documentTreeName: fileUploadProgress.documentType,
        //         idDocument: fileUploadProgress.documentId,
        //         quantityIncrement: 1,
        //     });
        // } else {
        //     this.pushItemDocumentNodeQuantityChanged(documentNodeQuantityChangedList, {
        //         documentTreeName: fileUploadProgress.documentType,
        //         idDocument: fileUploadProgress.documentId,
        //         quantityIncrement: -1,
        //     });
        // }

        // this.xnDocumentTreeOptions.notifyDocumentQuantityChanged(documentNodeQuantityChangedList);
    }

    private checkAndTickCheckedMatCheckAll() {
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

        this.ckboxAll.checked = obj.checkAll;
        // if checkAll = true, then indeterminate always false and vice versa
        this.ckboxAll.indeterminate = !obj.checkAll && obj.isIndeterminate;
    }

    private checkAndEnableUploadAllButton() {
        const atLeastValidFile = this.hasAtLeastValidFileToUpload();
        this.disableUploadAllButton(!atLeastValidFile);
    }

    private hasAtLeastValidFileToUpload() {
        let atLeastValidFile = false;

        const arrFilesMap = this.getMapFiles();
        for (let i = 0; i < arrFilesMap.length; i++) {
            const file = arrFilesMap[i];
            if (file.invalid) continue;

            if (this.isValidFileToUpload(file)) {
                if (this.canUpload(file, this.matSlideToggle.checked)) {
                    atLeastValidFile = true;
                    break;
                }
            }
        }

        return atLeastValidFile;
    }

    private disableUploadAllButton(isDisabled = true) {
        this.btnUploadAll.disabled = isDisabled;
    }

    private isValidFileToUpload(fileUploadProgress: FileUploadXoonit): boolean {
        if (!fileUploadProgress) return false;

        if (
            this.isUploadingFile(fileUploadProgress) ||
            this.isUploadedFile(fileUploadProgress) ||
            this.isInvalidFile(fileUploadProgress)
        ) {
            return false;
        }

        return true;
    }

    private canUpload(file: FileUploadXoonit, isSentToCapture: boolean = true): boolean {
        // has not checked
        if (!file.checked) {
            return false;
        }

        // if isSentToCapture = false then whether document can save after uploading this file or not
        if (!this.canSaveAfterUpload(file, isSentToCapture)) {
            return false;
        }

        return true;
    }

    private canSaveAfterUpload(file: FileUploadXoonit, isSentToCapture: boolean = true) {
        // if user want to save after uploading done
        // and has not assigned file to a document type
        if (!isSentToCapture && file.documentId <= 0) {
            return false;
        }

        return true;
    }

    private validateFilesBeforeUploadingAll(): { files: FileUploadXoonit[]; valid: boolean } {
        // if (!this.hasAtLeastValidFileToUpload()) {
        //     return {
        //         files: [],
        //         valid: false,
        //     };
        // }

        const files = this.getMapFiles().filter((file) => {
            if (file.invalid) return false;
            if (!file.checked) return false;
            if (!this.isValidFileToUpload(file)) return false;
            if (!this.canUpload(file, this.matSlideToggle.checked)) return false;
            return true;
        });

        if (files.length === 0) {
            this.disableUploadAllButton(true);
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

    private canToggleOffSendToCapture(): boolean {
        const currentStateToggle = this.isSendToCapture;

        if (currentStateToggle) {
            for (const file of this.getMapFiles()) {
                if (file.checked && file.documentId <= 0) {
                    return false;
                }
            }
        }

        return true;
    }

    private hasAnyMsgFile(): boolean {
        for (const file of this.getMapFiles()) {
            if (this.isMsgFile(file.file.name)) {
                return true;
            }
        }
        return false;
    }

    private validateForMsgFile(): boolean {
        var valid = true;
        for (const file of this.getMapFiles()) {
            if (this.isMsgFile(file.file.name) && !file.documentId) {
                valid = false;
                break;
            }
        }
        if (!valid) {
            this.showMessageCannotSaveDocumentAfterUpload();
        }
        return valid;
    }

    private isChooseDocumentTree(): boolean {
        for (const file of this.getMapFiles()) {
            if (!file.documentId) {
                return false;
            }
        }

        return true;
    }

    private showMessageCannotSaveDocumentAfterUpload() {
        this.toastrService.clear();
        this.toastrService.pop(
            MessageModal.MessageType.warning,
            'System',
            'Please assign a folder for a file to save document after upload done',
        );
    }

    private dropFiles(files: FileList) {
        if (!files || !files.length) return;

        for (let i = 0; i < files.length; i++) {
            const file = files[i];
            if (Uti.getFileExtension(file.name).match(/(exe|bat)$/i)) continue;
            const fileUploadProgress = new FileUploadXoonit({
                setRequestHeader: () => {
                    return {
                        Accept: 'application/json',
                        'Cache-Control': 'no-cache',
                        Pragma: 'no-cache',
                    };
                },
                withCredentials: true,
                url: `${this.serUrl.uploadFileImagesScan}`,
            });

            if (this.isFileNameDuplicate(this.filesMap, file)) continue;

            fileUploadProgress.file = file;
            fileUploadProgress.resetStatus();
            this.filesMap.set(file.name, fileUploadProgress);
            this.validateFileDropped(file).then((isValid) => {
                fileUploadProgress.invalid = !isValid;
                fileUploadProgress.originValid = isValid;
                fileUploadProgress.checked = isValid;

                if (fileUploadProgress.invalid) {
                    fileUploadProgress.documentPath = '';
                    fileUploadProgress.documentId = 0;
                    fileUploadProgress.documentType = 0;
                }

                if (this._selectedFolder?.idDocumentType == 5 && !this._selectedFolder?.idDocumentParent)
                    fileUploadProgress.invalid = true;
                else if (
                    !this.detectFileTypeBasedOnBytes(file.type, file.name) &&
                    this._selectedFolder?.idDocumentType != 5 &&
                    isValid
                ) {
                    fileUploadProgress.invalid = true;
                }
            });

            if (this._selectedFolder) {
                fileUploadProgress.documentPath = this._selectedFolder.path;
                fileUploadProgress.documentId = this._selectedFolder.idDocument;
                fileUploadProgress.documentType = this._selectedFolder.idDocumentType;
                fileUploadProgress.documentTypeParent = this._selectedFolder.idDocumentParent;
            }

            if (!this.isMsgFile(file.name)) {
                // default all dropped files are sent to capture
                fileUploadProgress.isSentToCapture = true;
            }
        }
        if (!this._selectedFolder) {
            this.store.dispatch(this.administrationDocumentActions.changeModeSelectableFolder(100000));
        }

        this.cdRef.detectChanges();

        setTimeout(() => {
            this.checkAndTickCheckedMatCheckAll();
            this.ckboxAll.registerOnChange(this.onChangeCheckboxAll.bind(this));
            this.disableUploadAllButton(false);
        }, 200);
    }

    private async validateFileDropped(file: File): Promise<boolean> {
        if (!file) return false;

        let isValidMimiFileType = false;

        if (this.isMsgFile(file.name)) {
            isValidMimiFileType = true;
            this.isSendToCapture = false;
            if ((!this._selectedFolder || !this._selectedFolder.idDocument) && !this.isChooseDocumentTree()) {
                this.showMessageCannotSaveDocumentAfterUpload();
            }
        }

        // if (!isValidMimiFileType) {
        //     isValidMimiFileType = await this.isValidMimeFileType(file, null, () => {
        //         this.handleInvalidFileType();
        //         return false;
        //     });

        //     if (!isValidMimiFileType) return false;
        // }

        const isValidContentLengthFile = this.isValidContentLengthFile(file.size, null, () => {
            this.handleInvalidFileLength();
            return false;
        });

        if (!isValidContentLengthFile) return false;

        return true;
    }

    private getExtension(name) {
        return name.split('.').pop().toLowerCase();
    }

    private isMsgFile(name) {
        const extension = this.getExtension(name);
        return extension === 'msg' || extension === 'eml';
    }

    private isValidMimeFileType(
        file: File,
        onValidCallback?: () => boolean,
        onInvalidCallback?: () => boolean,
    ): Promise<boolean> {
        return new Promise((resolve, reject) => {
            if (!file || !file.type) {
                onInvalidCallback && onInvalidCallback();
                resolve(false);
            }

            const fileReader = new FileReader();
            fileReader.onload = async (e: any) => {
                const fileType = await FileType.fromBuffer(e.target.result);
                const mime = fileType?.mime || file.type;
                const isValidType = this.detectFileTypeBasedOnBytes(mime, file.name);

                if (isValidType) {
                    onValidCallback && onValidCallback();
                } else {
                    onInvalidCallback && onInvalidCallback();
                }

                resolve(isValidType);
            };

            fileReader.readAsArrayBuffer(file.slice(0, 1024));
        });
    }

    private isValidContentLengthFile(size: number, onValidCallback?: () => boolean, onInvalidCallback?: () => boolean) {
        // size is falsy
        if (!size) return onInvalidCallback ? onInvalidCallback() : false;

        // if size > 100 MB
        if (size / 1024 / 1024 > 100) return onInvalidCallback ? onInvalidCallback() : false;

        return onValidCallback ? onValidCallback() : true;
    }

    private detectFileTypeBasedOnBytes(type: string, name: string): boolean {
        const extension = Uti.getFileExtension(name || '');
        switch (type) {
            case MimeFileType.PDF:
            case MimeFileType.PNG:
            case MimeFileType.TIFF:
            case MimeFileType.ZIP:
            case MimeFileType.JPEG:
            case MimeFileType.MSG:
            case MimeFileType.EML:
                return true;

            case MimeFileType.Empty:
                return !!extension.match(/(msg|eml)$/i);

            default:
                return false;
        }
    }

    // private checkValidExtension(fileName: string): boolean {
    //     const extension = Uti.getFileExtension(fileName);

    //     return !!extension.match(/(png|jpeg|jpg|svg|ico|mp4|mp3|pdf|tiff|zip|rar|msg|eml)/i);
    // }

    private isFileNameDuplicate(filesMap: Map<string, FileUploadXoonit>, file: File): boolean {
        if (!filesMap || !filesMap.size) return false;

        const keys = Object.keys(filesMap);
        return keys.indexOf(file.name) !== -1;
    }

    private isInvalidFile(fileUploadProgress: FileUploadXoonit) {
        return fileUploadProgress.invalid || fileUploadProgress.status === FileUploadStatusEnum.INVALID;
    }

    private isUploadingFile(fileUploadProgress: FileUploadXoonit) {
        return fileUploadProgress.status === FileUploadStatusEnum.UPLOADING;
    }

    private isUploadedFile(fileUploadProgress: FileUploadXoonit) {
        return fileUploadProgress.status === FileUploadStatusEnum.UPLOADED;
    }

    private _isSentToCapture() {
        return this.matSlideToggle.checked;
    }

    private _isSavedAfterUpload() {
        return !this._isSentToCapture();
    }

    private buildForm() {
        this.formGroup = this.formBuilder.group({
            files: [null, Validators.required],
        });
    }

    private _generateDataToSave(fileUploadProgress, formData: any, fileName: string) {
        if (!this.isSendToCapture && fileUploadProgress.documentType) {
            const treeId = fileUploadProgress.documentId;
            const mainDocumentData = <MainDocumentModel>{
                idDocumentContainerScans: null,
                idMainDocument: null,
                mainDocumentTree: {
                    idDocumentTree: treeId.toString(),
                    oldFolder: null,
                    newFolder: null,
                },
                searchKeyWords: null,
                toDoNotes: null,
            };

            const documentTreeMediaData = <DocumentTreeMediaModel>{
                mediaName: fileName,
                idDocumentTree: treeId.toString(),
                cloudMediaPath: fileUploadProgress.documentPath,
                idDocumentTreeMedia: null,
                idRepTreeMediaType: '1',
            };

            switch (fileUploadProgress.documentType) {
                case DocumentMyDMType.Invoice:
                    formData.append(
                        'InvoiceData',
                        JSON.stringify({
                            mainDocument: mainDocumentData,
                            documentTreeMedia: documentTreeMediaData,
                            invoice: new InvoiceFormModel(),
                            personBank: null,
                            personBeneficiary: null,
                            personBeneficiaryComm: null,
                            personRemitter: null,
                            dynamicFields: null,
                            folderChange: null,
                        }),
                    );
                    break;
                case DocumentMyDMType.Contract:
                    formData.append(
                        'ContractData',
                        JSON.stringify({
                            mainDocument: mainDocumentData,
                            documentTreeMedia: documentTreeMediaData,
                            contract: new ContractFormModel(),
                            personContractor: null,
                            personContractingParty: null,
                            dynamicFields: null,
                            folderChange: null,
                        }),
                    );
                    break;
                case DocumentMyDMType.OtherDocuments:
                    formData.append(
                        'OtherDocumentData',
                        JSON.stringify({
                            mainDocument: mainDocumentData,
                            documentTreeMedia: documentTreeMediaData,
                            otherDocuments: {
                                idDocumentTree: treeId.toString(),
                                idDocumentContainerScans: null,
                            },
                            personContact: null,
                            personPrivat: null,
                            dynamicFields: null,
                            folderChange: null,
                        }),
                    );
                    break;
            }
        }
        return formData;
    }

    private getDataFormatToUpload(fileUploadProgress: FileUploadXoonit): FormData {
        const currentDate = new Date();
        const idDocumentTree = fileUploadProgress.documentId !== 0 ? fileUploadProgress.documentId : '';

        const json: any = {
            LotItemId: null,
            IdRepScansContainerType: 1,
            IdRepScanDeviceType: RepScanDeviceType.Upload,
            IsSendToCapture: this.isSendToCapture ? '1' : '0',
            IdDocumentTree: idDocumentTree,
            ScannerTwainDllVersion: null,
            ScannerDevice: null,
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
        let formData = new FormData();
        let fileName = this.getFileNameFormatUpload(fileUploadProgress);
        if (fileUploadProgress.documentType === 5) {
            json.IdRepDocumentGuiType = '5';
            json.IdLogin = this.currentUser?.id;
            fileName = fileUploadProgress.file.name;
        } else if (fileUploadProgress.documentType === 6) {
            json.IdRepDocumentGuiType = '6';
            json.IdLogin = this.currentUser?.id;
            fileName = fileUploadProgress.file.name;
        }
        formData.append('file', fileUploadProgress.file, fileName);
        formData.append('OrderScanning', JSON.stringify(json));
        formData = this._generateDataToSave(fileUploadProgress, formData, fileName);
        return formData;
    }

    private getFileNameFormatUpload(fileUploadProgress: FileUploadXoonit) {
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

            case MimeFileType.MSG:
                return `${fileNameWithoutExt}.msg`;

            case MimeFileType.EML:
                return `${fileNameWithoutExt}.eml`;

            case MimeFileType.Empty:
                {
                    const extension = file.name.split('.').pop().toLowerCase();
                    if (extension === 'msg') {
                        return `${fileNameWithoutExt}.msg`;
                    }
                    if (extension === 'eml') {
                        return `${fileNameWithoutExt}.eml`;
                    }
                }
                return fileUploadProgress.file.name;

            default:
                return fileUploadProgress.file.name;
        }
    }

    private importUploadDone(fileUploadProgress: FileUploadXoonit) {
        if (fileUploadProgress.isSentToCapture || fileUploadProgress.documentId <= 0) return;

        if (!fileUploadProgress.response || fileUploadProgress.response.statusCode !== 1) return;

        const result = fileUploadProgress.response.item.result;
        const idDocumentContainerScans = +result.returnID;

        this.store.dispatch(
            new ImportUploadDoneAction({
                fileUploadProgress: fileUploadProgress,
                idDocumentContainerScans: idDocumentContainerScans,
            }),
        );
    }

    private handleInvalidFileType() {
        this.toastrService.clear();
        this.toastrService.pop(
            MessageModal.MessageType.warning,
            'System',
            'Please upload file types such as PDF, PNG, JPEG, TIFF, MSG, EML.',
        );
    }

    private handleInvalidFileLength() {
        this.toastrService.clear();
        this.toastrService.pop(MessageModal.MessageType.warning, 'System', 'Please upload file size less than 100MB.');
    }

    private updateDataForFilesMap(
        updatedData: any,
        isValidFile: (fileUploadProgress: FileUploadXoonit) => boolean,
        beforeUpdate?: (fileUploadProgress: FileUploadXoonit) => void,
        afterUpdate?: (fileUploadProgress: FileUploadXoonit) => void,
    ) {
        this.filesMap.forEach((fileUploadProgress) => {
            if (isValidFile(fileUploadProgress) === false) return;

            beforeUpdate && beforeUpdate(fileUploadProgress);

            fileUploadProgress.updateWith(updatedData);
            if (fileUploadProgress?.documentType == 5 && !fileUploadProgress?.documentTypeParent)
                fileUploadProgress.invalid = true;
            else if (
                !this.detectFileTypeBasedOnBytes(fileUploadProgress.file.type, fileUploadProgress.file.name) &&
                fileUploadProgress?.documentType != 5
            ) {
                fileUploadProgress.invalid = true;
            } else {
                fileUploadProgress.invalid = !fileUploadProgress.originValid;
            }

            afterUpdate && afterUpdate(fileUploadProgress);
        });
    }

    private onChangeCheckboxAll(value: boolean) {
        this.updateDataForFilesMap(
            <FileUploadXoonit>{ checked: value }, // data to update
            (fileUploadProgress) => {
                // satisfied item to update
                // if (fileUploadProgress.invalid) return false;

                // if this file can upload must be checked
                if (this.canSaveAfterUpload(fileUploadProgress, this.matSlideToggle.checked) === false) {
                    return false;
                }
                return true;
            },
            null, // before update item
            null, // after update item
        );
        this.checkAndEnableUploadAllButton();
    }

    private removeAllItemsDone() {
        this.filesMap.forEach((fileUploadProgress, key, mapArray) => {
            if (fileUploadProgress.status !== FileUploadStatusEnum.UPLOADED) return;

            mapArray.delete(fileUploadProgress.file.name);
        });
    }

    private showNoticeSummaryWhenUploadDone() {
        let failed = 0;
        let uploaded = 0;
        this.filesMap.forEach((fileUploadProgress) => {
            switch (fileUploadProgress.status) {
                case FileUploadStatusEnum.FAILED:
                    failed++;
                    break;

                case FileUploadStatusEnum.UPLOADED:
                    uploaded++;
                    break;

                default:
                    break;
            }
        });
        this.totalItemUploadFail = failed;
        this.totalItemUploadSuccess = uploaded;

        this._showPopupMessageAfterSave(uploaded, failed);
    }

    private _showPopupMessageBeforeUpload() {
        let messages: string;
        let uploadTextBtn: string;
        let cancelTextBtn: string;

        this.translateService
            .get(defaultLanguage.WIDGET_IMPORT_UPLOAD_FILE__SHOW_CONFIRMATION_BEFORE_UPLOAD)
            .subscribe((val) => (messages = val));
        this.translateService.get('COMMON_LABEL__Upload').subscribe((val) => (uploadTextBtn = val));
        this.translateService.get('COMMON_LABEL__Cancel').subscribe((val) => (cancelTextBtn = val));

        if (!messages) return;

        const popoverRef = this.popupService.open({
            content: messages,
            hasBackdrop: true,
            header: new HeaderNoticeRef({ iconClose: true }),
            footer: {
                justifyContent: 'wrap',
                buttons: [
                    { color: '', text: cancelTextBtn, buttonType: 'stroked', onClick: () => popoverRef.close() },
                    {
                        color: 'primary',
                        text: uploadTextBtn,
                        buttonType: 'flat',
                        onClick: (data?: any) => {
                            this.confirmUploadAll();
                            popoverRef.close();
                        },
                    },
                ],
            },
            disableCloseOutside: true,
        });
    }

    private _showPopupMessageAfterSave(uploaded: number, failed: number) {
        if (uploaded <= 0 && failed <= 0) return;
        let okTxtMsg: string;

        this.translateService.get('COMMON_LABEL__Ok').subscribe((val) => (okTxtMsg = val));

        const popoverRef = this.popupService.open({
            content: this.fileUploadInformation,
            hasBackdrop: true,
            data: {
                uploaded,
                failed,
            },
            header: new HeaderNoticeRef({ iconClose: true }),
            footer: {
                justifyContent: 'full',
                buttons: [
                    {
                        color: 'primary',
                        text: okTxtMsg,
                        buttonType: 'flat',
                        onClick: (data?: any) => {
                            // this.removeAllItemsDone();
                            popoverRef.close();
                        },
                    },
                ],
            },
        });
    }
}
