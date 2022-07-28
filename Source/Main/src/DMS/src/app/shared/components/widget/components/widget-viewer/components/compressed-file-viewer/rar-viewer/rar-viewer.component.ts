import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import * as NodeUnrarJS from 'node-unrar-js';
import { Router } from '@angular/router';
import { FileManagerActions, FileManagerActionNames } from '@app/state-management/store/actions/file-manager/file-manager.action';
import { FileManagerSelectors } from '@app/state-management/store/reducer/file-manager/file-manager.selectors';
import { AppState } from '@app/state-management/store';
import { PerfectScrollbarConfigInterface } from 'ngx-perfect-scrollbar';
import { Subscription } from 'rxjs';
import { ItemModel } from '@app/pages/private/modules/file-manager/models';
import { Store } from '@ngrx/store';
import { FileViewerType } from '@app/app.constants';
import { CustomAction } from '@app/state-management/store/actions';
import { ArcList, FileHeader } from 'node-unrar-js/dist/js/extractor';
import { BaseCompressedFileViewer } from '../base-compressed-file-viewer.component';
import { DocumentManagementSelectors } from '@app/pages/document-management/document-management.statemanagement/document-management.selectors';
import { GetFileByUrlForWidgetViewerIdAction, DocumentManagementActionNames } from '@app/pages/document-management/document-management.statemanagement/document-management.actions';
import { filter } from 'rxjs/operators';

@Component({
    selector: 'rar-viewer',
    templateUrl: './rar-viewer.component.html',
    styleUrls: ['./rar-viewer.component.scss']
})
export class RarViewerComponent extends BaseCompressedFileViewer implements OnInit {

    public perfectScrollbarConfig: PerfectScrollbarConfigInterface;
    public breadcrumb: string;
    public fileName: string;
    public showMessageEmptyFolder: boolean;
    public currentRootFiles: Array<ItemModel>;

    private rarSubscription: Subscription;

    constructor(
        protected router: Router,
        protected store: Store<AppState>,
        protected documentManagementSelectors: DocumentManagementSelectors,
        protected cdRef: ChangeDetectorRef,
    ) {
        super(router, store, documentManagementSelectors, cdRef);
        this.subscribeOnAttachViewRef();
    }

    ngOnInit(): void { }

    public subscribeOnAttachViewRef(): void {
        this.rarSubscription = this.documentManagementSelectors.actionSuccessOfSubtype$(DocumentManagementActionNames.GET_FILE_BY_URL_FOR_WIDGET_VIEWER_ID)
                                    .pipe(
                                        filter((action: GetFileByUrlForWidgetViewerIdAction) => action.payload.idWidget === this.uniqueViewerId)
                                    )
                                    .subscribe((action: CustomAction) => {
                                        this.rootFiles = [];

                                        const blob = this.blob = action.payload.file as Blob;
                                        const fileReader = new FileReader();

                                        fileReader.onload = (event: any) => {
                                            const data = event.target.result as ArrayBuffer;
                                            let extractor = NodeUnrarJS.createExtractorFromData(data);

                                            let [state, files] = extractor.getFileList();

                                            this.parseRar(files);

                                            files = null;
                                            extractor = null;

                                            this.currentRootFiles = this.rootFiles;
                                            this.fileName = this.path.substring(this.path.lastIndexOf(this.BACKWARD_SLASH) + 1, this.path.length);
                                            this.breadcrumb = this.BACKWARD_SLASH;
                                            this.cdRef.detectChanges();
                                        };

                                        fileReader.readAsArrayBuffer(blob);
                                    });
    }

    public setSupportedFileTypesAsKey(): string[] {
        return [
            FileViewerType[FileViewerType.RAR]
        ];
    }
    public isExtensionTheSameGroupType(fileType: FileViewerType): boolean {
        switch (fileType) {
            case FileViewerType.RAR:
                return true;
            default:
                return false;
        }
    }
    public disposeContentOnDetach() {
        super.disposeContentOnDetach();
    }

    private parseRar(arcList: ArcList) {
        this.rootFiles = [];

        for (const file of arcList.fileHeaders) {

            const itemModel = file.flags.directory ? this.createDirectory(file) : this.createFile(file);
            if (!itemModel) continue;

            this.rootFiles.push(itemModel);
        }

        // free up unrar files from memory
        arcList.fileHeaders = null;
        arcList.arcHeader.flags = null;
        arcList.arcHeader = null;
    }

    private createDirectory(file: FileHeader) {
        if (!file.flags.directory) return;

        const itemModel = this.newDirectory(file.name);

        this.freeUpFileFromMemory(file);

        // there is a case unrar that appears files first, then folders item. Therefore, we have to check this folder have created at the time creating a file
        if (this.findPathFolder(this.rootFiles, itemModel.path)) return null;

        return this.addFile(itemModel);
    }

    private createFile(file: FileHeader) {
        if (file.flags.directory) return;

        const itemModel = this.newFileItemModel(file.name);

        this.freeUpFileFromMemory(file);

        return this.addFile(itemModel);
    }

    private freeUpFileFromMemory(file: FileHeader) {
        file.flags = null;
        file = null;
    }
}
