import { Component, ChangeDetectorRef, OnInit, OnDestroy } from '@angular/core';
import { CustomAction, FileProcessPopUpActions } from '@app/state-management/store/actions';
import { Uti } from '@app/utilities';
import { Router } from '@angular/router';
import { IconNames } from '@app/app-icon-registry.service';
import { FileUploadXoonit, DocumentProcessEnum } from '@app/models/import-upload/file-upload-status.model';
import { BaseComponent } from '@app/pages/private/base';
import { ReducerManagerDispatcher } from '@ngrx/store';
import { SignalRNotifyModel, ApiResultResponse, User } from '@app/models';
import { ToasterService } from 'angular2-toaster/angular2-toaster';
import {
    SignalRActionEnum,
    SignalRJobEnum,
    Configuration
} from '@app/app.constants';
import { filter, takeUntil } from 'rxjs/operators';
import {
    CommonService,
    AppErrorHandler,
    SignalRService
} from '@app/services';

@Component({
    selector: 'file-process-popup',
    templateUrl: './file-process-popup.component.html',
    styleUrls: ['./file-process-popup.component.scss'],
})
export class FileProcessPopupComponent extends BaseComponent implements OnInit, OnDestroy {
    constructor(
        protected router: Router,
        private cdRef: ChangeDetectorRef,
        private dispatcher: ReducerManagerDispatcher,
        protected uti: Uti,
        private _toasterService: ToasterService,
        private _signalRService: SignalRService,
        private _appErrorHandler: AppErrorHandler,
        private _commonService: CommonService,
    ) {
        super(router);
    }
    public title = 'Test';
    public isCollapsed = false;
    public width = 500;
    public docPositionLeft = 10;
    public docPositionTop = -1000;
    public iconChevronDownCicle = IconNames.APP_CHEVRON_DOWN_CIRCLE;
    public filesMap: Map<string, FileUploadXoonit> = new Map<string, FileUploadXoonit>();
    public fileProcessList: FileUploadXoonit[] = [];

    public DOCUMENT_PROCESS_STATUS_ENUM = DocumentProcessEnum;
    public svgVisibility = IconNames.WIDGET_IMPORT_UPLOAD_FILE_Visibility;
    public svgRemove = IconNames.WIDGET_IMPORT_UPLOAD_FILE_Remove;
    public svgRefresh = IconNames.WIDGET_IMPORT_UPLOAD_FILE_Refresh;
    public svgDocumentProcessFail = IconNames.FILE_PROCESS_FAIL_CIRCLE;
    public svgDocumentProcessing = IconNames.DOCUMENT_PROCESSING_CIRCLE;
    public svgDocumentChecked = IconNames.APP_CHECKED_CIRCLE;
    public svgIconClear = IconNames.WIDGET_MYDM_FORM_Reset;

    private userLogin: User;

    ngOnInit(): void {
        if (!Configuration.PublicSettings.enableSignalR) return;

        this.userLogin = this.uti.getUserInfo();
        this.getDocumentProcessing();
        this.subscription();
    }

    ngOnDestroy() {
        super.onDestroy();
    }

    public getDocumentProcessing() {
        this.fileProcessList = [];
        this._commonService.getDocumentProcessingQueues().subscribe((response: ApiResultResponse) => {
            this._appErrorHandler.executeAction(() => {
                if (!Uti.isResquestSuccess(response) || !response.item || response.item.length == 0) {
                    return;
                }
                response.item.forEach((element) => {
                    let row = this.fileProcessList.find(
                        (x) =>
                            x.documentName == element.FileName ||
                            (element.ScannedFilename && x.documentName == element.ScannedFilename),
                    );
                    if (!row)
                        this.fileProcessList.push({
                            documentName: element.FileName,
                            status: DocumentProcessEnum.PROCESSING,
                        });
                    else {
                        row.status = DocumentProcessEnum.PROCESSING;
                    }
                });
            });
        });
    }

    public toggle($event) {
        this.isCollapsed = !this.isCollapsed;
    }
    private subscription() {
        this.dispatcher
            .pipe(
                filter((action: CustomAction) => {
                    return action.type === FileProcessPopUpActions.FILE_PROCESS_RECEIVE_DATA;
                }),
                takeUntil(this.getUnsubscriberNotifier()),
            )
            .subscribe((action: CustomAction) => {
                //console.log(action);
                this.listenSignalRMessage(action.payload);
            });
    }
    private findRow(element: any) {
        return this.fileProcessList.find((x) => {
            if (x.documentName == element.FileName) {
                return x;
            }
            if (element.ScannedFilename) {
                if (element.ScannedFilename.split('.tiff')[0] == x.documentName.split('.tiff')[0]) {
                    return x;
                }
            }
            // x.documentName == element.FileName ||
            // (element.ScannedFilename && x.documentName == element.ScannedFilename)
        });
    }
    private updateSuccessItems(message: SignalRNotifyModel) {
        message.Data.forEach((element) => {
            let row = this.findRow(element);
            // let row = this.fileProcessList.find(
            //     (x) =>
            //         x.documentName == element.FileName ||
            //         (element.ScannedFilename && x.documentName == element.ScannedFilename),
            // );
            if (row) {
                row.status = DocumentProcessEnum.SUCCESSED;
                setTimeout(() => {
                    this.fileProcessList = this.fileProcessList.filter((obj) => obj !== row);
                }, 2000);
            }
        });
    }
    private updateFailItems(message: SignalRNotifyModel) {
        message.Data.forEach((element) => {
            let row = this.findRow(element);
            // let row = this.fileProcessList.find(
            //     (x) =>
            //         x.documentName == element.FileName ||
            //         (element.ScannedFilename && x.documentName == element.ScannedFilename),
            // );
            if (row) {
                row.status = DocumentProcessEnum.FAILED;
                // setTimeout(() => {
                //     this.fileProcessList = this.fileProcessList.filter((obj) => obj !== row);
                // }, 2000);
            }
        });
    }

    private updateProcessingItems(message: SignalRNotifyModel) {
        message.Data.forEach((element) => {
            let row = this.findRow(element);
            // let row = this.fileProcessList.find(
            //     (x) =>
            //         x.documentName == element.FileName ||
            //         (element.ScannedFilename && x.documentName == element.ScannedFilename),
            // );
            if (!row)
                this.fileProcessList.push({
                    documentName: element.FileName,
                    status: DocumentProcessEnum.PROCESSING,
                });
            else {
                row.status = DocumentProcessEnum.PROCESSING;
            }
        });
    }

    private listenSignalRMessage(message: any) {
        try {
            message = JSON.parse(message);
        } catch (e) { }


        if (message.IdLogin && message.IdLogin !== this.userLogin.id) {
            console.log(`message.IdLogin: ${message.IdLogin}, IdLogin: ${this.userLogin.id}`);
            return;
        }

        switch (message.Action) {
            case SignalRActionEnum.DocumentProcessing_ProcesssingItem:
                this.updateProcessingItems(message);
                break;
            case SignalRActionEnum.DocumentProcessing_FailItem:
                this.updateFailItems(message);
                break;
            case SignalRActionEnum.DocumentProcessing_SuccessItem:
                this.updateSuccessItems(message);
                break;

            default:
                break;
        }
    }
}
