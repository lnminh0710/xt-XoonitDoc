import {
    Component,
    Output,
    EventEmitter,
    Input,
    ChangeDetectorRef,
    OnChanges,
    SimpleChanges,
    OnInit,
} from '@angular/core';
import { DocumentImageOcrService } from '../../services';
import { ToasterService } from 'angular2-toaster';
import { MessageModal, Configuration } from '@app/app.constants';
import { ToolbarConfigModel } from '../../models/toolbar.model';
import { Router } from '@angular/router';
import { DocumentFileInfoModel } from '@app/state-management/store/models/administration-document/state/document-file-info.state.model';
import { AdministrationDocumentSelectors } from '@app/state-management/store/reducer';
import { BaseComponent, ModuleList } from '@app/pages/private/base';
import { AppState } from '@app/state-management/store';
import { Store } from '@ngrx/store';
import { ModuleActions, AdministrationDocumentActions } from '@app/state-management/store/actions';
import { takeUntil } from 'rxjs/operators';
import { InvoiceApprovalProcessingActions } from '@app/pages/invoice-approval-processing/invoice-approval-processing.statemanagement/invoice-approval-processing.actions';
import { InvoiceAprrovalService } from '@app/services';

@Component({
    selector: 'app-image-toolbar',
    templateUrl: './image-toolbar.component.html',
    styleUrls: ['./image-toolbar.component.scss', '../../styles/icon.scss'],
})
export class ImageToolbarComponent extends BaseComponent {
    // Input

    constructor(
        private documentService: DocumentImageOcrService,
        private ref: ChangeDetectorRef,
        private toastrService: ToasterService,
        private store: Store<AppState>,
        private moduleActions: ModuleActions,
        protected router: Router,
        protected administrationSelectors: AdministrationDocumentSelectors,
        private administrationActions: AdministrationDocumentActions,
        private invoiceApprovalProcessingAction: InvoiceApprovalProcessingActions,
        private invoiceApprovalService: InvoiceAprrovalService,
    ) {
        super(router);

        this.administrationSelectors.docFileInfo$
            .pipe(takeUntil(this.getUnsubscriberNotifier()))
            .subscribe((data: DocumentFileInfoModel) => {
                this.documentInfo = data;
            });
    }

    @Input() viewAllPage: boolean;
    // @Input() isMove: boolean;
    @Input() isRotation: boolean;
    @Input() isShowRotateMode: boolean;
    @Input() IdDocumentContainerScans: any;
    @Input() IdDocument: any;
    @Input() isViewOnly: boolean;
    @Input() isBase64: boolean;
    @Input() toolbarConfig: ToolbarConfigModel = {};
    @Input() isShowTodo: boolean;
    @Input() isSelectDocType: boolean;
    @Input() JsonQRCode: any;

    //Output

    @Output() onUngroup: EventEmitter<any> = new EventEmitter();
    @Output() viewActualSize: EventEmitter<any> = new EventEmitter();
    @Output() rotateImage: EventEmitter<any> = new EventEmitter();
    @Output() zoomImage: EventEmitter<any> = new EventEmitter();
    @Output() toggleViewImageInfo: EventEmitter<any> = new EventEmitter();
    @Output() toggleMove: EventEmitter<any> = new EventEmitter();
    @Output() toggleRotation: EventEmitter<any> = new EventEmitter();
    @Output() downloadBase64: EventEmitter<any> = new EventEmitter();
    @Output() openSharing: EventEmitter<any> = new EventEmitter();
    @Output() toggleKeyword: EventEmitter<any> = new EventEmitter();
    @Output() toggleTodo: EventEmitter<any> = new EventEmitter();
    @Output() runOCRManually: EventEmitter<any> = new EventEmitter();
    @Output() clean: EventEmitter<any> = new EventEmitter();
    @Output() fullscreen: EventEmitter<any> = new EventEmitter();

    //
    public isFullScreen = false;
    public isLoading: boolean;
    public documentInfo: DocumentFileInfoModel = {
        idMainDocument: '',
        idRepDocumentGuiType: '',
    };

    public unGroup() {
        this.onUngroup.emit();
    }

    public downloadDocument() {
        if (!this.IdDocumentContainerScans || !this.isSelectDocType) return;

        var a = document.createElement('a');
        if (this.isBase64) {
            this.downloadBase64.emit();
            return;
        }
        a.href = '/api/DocumentContainer/GetFile?IdDocumentContainerScans=' + this.IdDocumentContainerScans;
        a.download = 'result';
        document.body.appendChild(a);
        a.click();
        // this.documentService.getScanFile(this.IdDocumentContainerScans).subscribe((response: any) => {
        //   console.log('getScanFile', response);
        // });
        setTimeout(() => {
            a.remove();
        }, 1000);
    }

    public share() {
        if (!this.isSelectDocType) return;
        this.openSharing.emit();
    }

    public onClickOCRManually() {
        if (!this.isSelectDocType) return;

        this.runOCRManually.emit();
    }

    public print() {
        if (!this.IdDocumentContainerScans || !this.isSelectDocType) return;
        this.isLoading = true;
        this.documentService.getPdfFile(this.IdDocumentContainerScans).subscribe(
            (response: any) => {
                const blobUrl = URL.createObjectURL(response);
                const iframe = document.createElement('iframe');
                iframe.style.display = 'none';
                iframe.src = blobUrl;
                document.body.appendChild(iframe);
                this.isLoading = false;
                this.ref.detectChanges();
                iframe.contentWindow.print();
            },
            (err) => {
                this.isLoading = false;
                this.ref.detectChanges();
            },
        );
    }

    public sendMail() {
        if (!this.IdDocumentContainerScans || !this.isSelectDocType) return;

        this.isLoading = true;
        this.documentService
            .sendMailDocument({
                IdDocumentContainerScans: this.IdDocumentContainerScans,
            })
            .subscribe(
                (response: any) => {
                    this.isLoading = false;
                    this.toastrService.pop(MessageModal.MessageType.success, 'System', 'Mail sent');
                    this.ref.detectChanges();
                },
                (err) => {
                    this.isLoading = false;
                    this.toastrService.pop(MessageModal.MessageType.error, 'System', err);
                    this.ref.detectChanges();
                },
            );
    }

    public expandWidget() {
        this.isFullScreen = !this.isFullScreen;
        this.fullscreen.emit(this.isFullScreen);
    }
    public onClean() {
        if (!this.isSelectDocType) return;

        this.clean.emit();
    }

    public onClickViewActualSize() {
        if (!this.isSelectDocType) return;

        this.viewActualSize.emit();
    }
    public onClickRotate(rotateNumber: number) {
        if (!this.isSelectDocType) return;

        this.rotateImage.emit(rotateNumber);
    }
    public onClickZoom(zoom: number) {
        if (!this.isSelectDocType) return;

        this.zoomImage.emit(zoom);
    }

    public onToggleViewImageInfo(isSave: boolean) {
        if (!this.isSelectDocType) return;

        this.toggleViewImageInfo.emit({ viewAllPage: !this.viewAllPage, isSave });
    }
    public onToggleRotationMode(isSave: boolean) {
        if (!this.isSelectDocType) return;

        this.isLoading = true;

        this.toggleRotation.emit({
            isSave,
            callback: (() => {
                this.isLoading = false;
                this.ref.detectChanges();
            }).bind(this),
        });
    }

    public onClickKeyword() {
        if (!this.isSelectDocType) return;

        this.toggleKeyword.emit();
    }

    public onClickTodo() {
        if (!this.isSelectDocType) return;

        this.toggleTodo.emit();
    }

    // public onToggleMove() {
    //     this.toggleMove.emit(!this.isMove);
    // }

    public editDocument() {
        if (!this.documentInfo || !this.documentInfo.idRepDocumentGuiType) {
            this.toastrService.pop(MessageModal.MessageType.error, 'Document', 'IdRepDocumentGuiType not found');
            return;
        } else if (!this.documentInfo || !this.documentInfo.idMainDocument) {
            this.toastrService.pop(MessageModal.MessageType.error, 'Document', 'IdMainDocument not found');
            return;
        }
        this.store.dispatch(this.administrationActions.clearDocumentContainerOcr());
        this.store.dispatch(this.moduleActions.activeModule(ModuleList.Processing));
        //this.router.navigate([`${Configuration.rootPrivateUrl}/${ModuleList.Processing.moduleName}/detail`], {
        //    queryParams: {
        //        idDocumentType: this.documentInfo.idRepDocumentGuiType,
        //        idDocument: this.documentInfo.idMainDocument,
        //    },
        //});
        this.router.navigate([`/${ModuleList.Processing.moduleName}/detail`], {
            queryParams: {
                idDocumentType: this.documentInfo.idRepDocumentGuiType,
                idDocument: this.documentInfo.idMainDocument,
            },
        });
    }

    public applyDataAI() {
        if (!this.isSelectDocType) return;

        this.invoiceApprovalService.getExtractAIData(this.IdDocumentContainerScans).subscribe((response) => {
            this.store.dispatch(this.invoiceApprovalProcessingAction.applyExtractAIData({ data: response }));
        });
    }

    public openExtractedMasterData() {
        if (
            !this.isSelectDocType ||
            this.ofModule.moduleNameTrim !== ModuleList.ApprovalProcessing.moduleNameTrim ||
            this.IdDocument
        )
            return;

        this.store.dispatch(
            this.invoiceApprovalProcessingAction.getExtractedDataWhenInitAction(this.IdDocumentContainerScans),
        );
    }

    public applyDataQRCode() {
        if (!this.isSelectDocType) return;

        this.store.dispatch(this.invoiceApprovalProcessingAction.applyQRCodeData(this.JsonQRCode));
    }
}
