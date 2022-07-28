import { Component, OnInit, ElementRef, OnDestroy, OnChanges, ViewChild, ChangeDetectorRef, SimpleChanges, ChangeDetectionStrategy } from '@angular/core';
import * as JSZip from 'jszip';
import { FileViewerType } from '@app/app.constants';
import { FileManagerActions, FileManagerActionNames } from '@app/state-management/store/actions/file-manager/file-manager.action';
import { Subscription } from 'rxjs';
import { Router } from '@angular/router';
import { FileManagerSelectors } from '@app/state-management/store/reducer/file-manager/file-manager.selectors';
import { AppState } from '@app/state-management/store';
import { Store } from '@ngrx/store';
import { ItemModel } from '@app/pages/private/modules/file-manager/models';
import { CustomAction } from '@app/state-management/store/actions';
import { BaseCompressedFileViewer } from '../base-compressed-file-viewer.component';
import { DocumentManagementSelectors } from '@app/pages/document-management/document-management.statemanagement/document-management.selectors';
import { GetFileByUrlForWidgetViewerIdAction, DocumentManagementActionNames } from '@app/pages/document-management/document-management.statemanagement/document-management.actions';
import { filter } from 'rxjs/operators';


@Component({
    selector: 'zip-viewer',
    templateUrl: './zip-viewer.component.html',
    styleUrls: ['./zip-viewer.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ZipViewerComponent extends BaseCompressedFileViewer implements OnInit, OnDestroy, OnChanges {

    private zipSubscription: Subscription;
    private jsZip: JSZip;

    constructor(
        protected router: Router,
        protected store: Store<AppState>,
        protected documentManagementSelectors: DocumentManagementSelectors,
        protected cdRef: ChangeDetectorRef,
    ) {
        super(router, store, documentManagementSelectors, cdRef);
        this.subscribeOnAttachViewRef();
    }

    ngOnChanges(changes: SimpleChanges): void {
    }

    ngOnInit() {
        this.cdRef.detach();
    }

    ngOnDestroy(): void {
        this.unsubscribeOnDetachViewRef();
    }

    public subscribeOnAttachViewRef() {
        this.zipSubscription = this.documentManagementSelectors.actionSuccessOfSubtype$(DocumentManagementActionNames.GET_FILE_BY_URL_FOR_WIDGET_VIEWER_ID)
            .pipe(
                filter((action: GetFileByUrlForWidgetViewerIdAction) => action.payload.idWidget === this.uniqueViewerId)
            )
            .subscribe((action: CustomAction) => {
                this.rootFiles = [];

                const blob = this.blob = action.payload.file as Blob;
                this.jsZip = new JSZip();
                this.jsZip.loadAsync(blob).then(zip => {
                    this.parseZip(zip);
                    this.sort(this.rootFiles);
                    this.currentRootFiles = this.rootFiles;
                    this.fileName = this.path.substring(this.path.lastIndexOf(this.BACKWARD_SLASH) + 1, this.path.length);
                    this.breadcrumb = this.BACKWARD_SLASH;
                    this.cdRef.detectChanges();
                });
            });
    }

    public setSupportedFileTypesAsKey() {
        return [
            FileViewerType[FileViewerType.ZIP],
        ];
    }

    public isExtensionTheSameGroupType(fileType: FileViewerType) {
        switch (fileType) {
            case FileViewerType.ZIP:
                return true;
            default:
                return false;
        }
    }

    public disposeContentOnDetach() {
        super.disposeContentOnDetach();
        this.currentRootFiles = null;
        this.fileName = null;
        this.breadcrumb = null;
        this.jsZip = null;
        this.showMessageEmptyFolder = false;
    }

    openItem(itemModel: ItemModel) {
        if (itemModel.isFile) {
            return;
        }

        this.openFolder(itemModel);
    }

    openFolder(itemModel: ItemModel) {
        const folder = this.findPathFolder(this.rootFiles, itemModel.path);
        if (!folder) return;

        if (folder.children && !folder.children.length) {
            this.showMessageEmptyFolder = true;
            this.cdRef.detectChanges();
            return;
        }

        this.showMessageEmptyFolder = false;

        this.breadcrumb = folder.path;
        if (!folder['isSorted']) {
            this.sort(folder.children);
            folder['isSorted'] = true;
        }
        this.currentRootFiles = folder.children;

        // update new view when open a folder
        this.cdRef.detectChanges();
    }

    public goBack($event) {
        this.showMessageEmptyFolder = false;
        if (this.breadcrumb === this.BACKWARD_SLASH) return;

        let hierarchicalFolderArray = this.breadcrumb.split(this.BACKWARD_SLASH);
        let path = hierarchicalFolderArray[hierarchicalFolderArray.length - 2];

        if (path === '') {
            this.breadcrumb = this.BACKWARD_SLASH;
            this.currentRootFiles = this.rootFiles;
            this.cdRef.detectChanges();
            return;
        }

        hierarchicalFolderArray.splice(hierarchicalFolderArray.length - 1, 1);
        path = hierarchicalFolderArray.join(this.BACKWARD_SLASH);

        const folder = this.findPathFolder(this.rootFiles, path);
        if (!folder || !folder.children || !folder.children.length) return;

        this.breadcrumb = folder.path;
        this.currentRootFiles = folder.children;
        this.cdRef.detectChanges();
    }

    private parseZip(zip: JSZip) {
        this.rootFiles = [];
        for (const extractFile in zip.files) {
            const zipObject = zip.files[extractFile];

            // zipObject.async('arraybuffer').then(data => {
            //     console.log(data);
            // })

            const itemModel = zipObject.dir ? this.createDirectory(zipObject) : this.createFile(zipObject);
            if (!itemModel) continue;

            this.rootFiles.push(itemModel);
        }
    }

    private createDirectory(zipObject: any) {
        if (!zipObject.dir) return;

        const itemModel = this.newDirectory(zipObject.name);

        return this.addFile(itemModel);
    }

    private createFile(zipObject: any) {
        if (zipObject.dir) return;

        let itemModel = super.newFileItemModel(zipObject.name)

        return this.addFile(itemModel);
    }
}
