import { BaseViewer } from '../base-viewer';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { AppState } from '@app/state-management/store';
import { FileViewerType } from '@app/app.constants';
import { ItemModel } from '@app/pages/private/modules/file-manager/models/file-manager-item.model';
import { PerfectScrollbarConfigInterface } from 'ngx-perfect-scrollbar';
import { ChangeDetectorRef } from '@angular/core';
import { DocumentManagementSelectors } from '@app/pages/document-management/document-management.statemanagement/document-management.selectors';

export abstract class BaseCompressedFileViewer extends BaseViewer {

    protected rootFiles: Array<ItemModel>;
    protected BACKWARD_SLASH = '\\';
    protected THIS_FOLDER_IS_EMPTY = 'This folder is empty';

    public perfectScrollbarConfig: PerfectScrollbarConfigInterface;
    public breadcrumb: string;
    public fileName: string;
    public showMessageEmptyFolder: boolean;
    public currentRootFiles: Array<ItemModel>;

    constructor(
        protected router: Router,
        protected store: Store<AppState>,
        protected documentManagementSelectors: DocumentManagementSelectors,
        protected cdRef: ChangeDetectorRef,
    ) {
        super(router, store)
        this.perfectScrollbarConfig = {
            suppressScrollX: true,
            suppressScrollY: false,
        };
        this.showMessageEmptyFolder = false;
    }

    public abstract subscribeOnAttachViewRef();
    public abstract setSupportedFileTypesAsKey(): string[];
    public abstract isExtensionTheSameGroupType(fileType: FileViewerType): boolean;

    public updatePath(path: string): void {
        
    }
    
    public disposeContentOnDetach() {
        super.disposeContentOnDetach();
        this.rootFiles = null;
    }

    public openItem(itemModel: ItemModel) {
        if (itemModel.isFile) {
            return;
        }

        this.openFolder(itemModel);
    }

    public openFolder(itemModel: ItemModel) {
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

        const hierarchicalFolderArray = this.breadcrumb.split(this.BACKWARD_SLASH);
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

    protected findPathFolder(rootDirectories: ItemModel[], pathFolder: string): ItemModel {
        for (let index = 0; index < rootDirectories.length; index++) {
            const directory = rootDirectories[index];

            // if found
            if (directory.path === pathFolder) {
                return directory;
            }

            // if directory contains any files or folders
            if (directory.children && directory.children.length) {
                // if directory name starts with characters inner pathFolder then go to sub directory to find pathFolder. Otherwise continue
                if (!pathFolder.startsWith(directory.path)) continue;

                const foundDirectory = this.findPathFolder(directory.children.filter(file => file.isFile === false), pathFolder);                
                if (foundDirectory) return foundDirectory;
            }
        }

        return null;
    }

    protected newDirectory(path: string) {
        // remove  '/' character to '' (empty) at tail string and then replace all '/' characters to '\'
        const fullPath = path.replace(/\/$/, '')
                            .replace(/\//g, this.BACKWARD_SLASH);

        return this.newDirectoryItemModel(this.BACKWARD_SLASH + fullPath);
    }

    protected newDirectoryItemModel(directoryPath: string): ItemModel {
        const itemModel = new ItemModel();
        itemModel.path = directoryPath;
        itemModel.value = directoryPath.substring(directoryPath.lastIndexOf(this.BACKWARD_SLASH) + 1, directoryPath.length);
        itemModel.hasChild = true;
        itemModel.isEmpty = false;
        itemModel.isFile = false;
        itemModel.children = [];

        return itemModel;
    }

    protected newFileItemModel(filePath: string): ItemModel {
        // replace all '/' characters to '\'
        const fullPath = filePath.replace(/\//g, this.BACKWARD_SLASH);

        let itemModel = new ItemModel();
        itemModel.path = `${this.BACKWARD_SLASH}${fullPath}`;
        itemModel.value = fullPath.substring(fullPath.lastIndexOf(this.BACKWARD_SLASH) + 1, fullPath.length);
        itemModel.hasChild = false;
        itemModel.isFile = true;
        itemModel.isEmpty = false;
        itemModel.children = null;
        itemModel.extension = itemModel.value.substring(itemModel.value.lastIndexOf('.') + 1, itemModel.value.length);

        return itemModel;
    }

    protected addFile(itemModel: ItemModel) {
        const hierarchicalFolderArray = itemModel.path.split(this.BACKWARD_SLASH);
        // return root folder
        if (hierarchicalFolderArray.length === 1 || (hierarchicalFolderArray.length === 2 && hierarchicalFolderArray[0] === '')) return itemModel;

        // Remove first redundant element is emptry string '' and the last item either is directory name or a file name. 
        hierarchicalFolderArray.splice(0, 1);
        hierarchicalFolderArray.splice(hierarchicalFolderArray.length - 1, 1);

        // Then join each item string with '\' character to be had a path folder to find
        let pathFolder = `${this.BACKWARD_SLASH}${hierarchicalFolderArray.join(this.BACKWARD_SLASH)}`;

        const rootDirectories = this.rootFiles.filter(file => file.isFile === false);

        const parentDirectory = this.findPathFolder(rootDirectories, pathFolder);

        // not exists this directory
        if (!parentDirectory) {
            const directory = this.createNewDirectoryIfNotExists(itemModel, pathFolder);
            directory.push(itemModel);
            return null;
        }

        parentDirectory.children.push(itemModel);
        return null;
    }

    protected createNewDirectoryIfNotExists(itemModel: ItemModel, pathFolder: string) {
        const hierarchicalFolderArray = itemModel.path.split(this.BACKWARD_SLASH);

        // is root folder
        if (hierarchicalFolderArray.length === 1 || (hierarchicalFolderArray.length === 2 && hierarchicalFolderArray[0] === '')) {
            const newDirectory = this.newDirectoryItemModel(pathFolder);
            this.rootFiles.push(newDirectory);
            return null;
        }

        // Remove first redundant element is emptry string '' and the last directory. 
        hierarchicalFolderArray.splice(0, 1);
        let rootFolder = this.rootFiles;
        let directoryPath: string;
        let directory: ItemModel;

        // if itemModel is type of file then iterating until length - 1 cause the last item is a file name, otherwise iterate until end to create directory
        const length = itemModel.isFile ? hierarchicalFolderArray.length - 1 : hierarchicalFolderArray.length;
        for (let index = 0; index < length; index++) {
            directoryPath = !directoryPath ?
                this.BACKWARD_SLASH + hierarchicalFolderArray[index] :
                directory.path + this.BACKWARD_SLASH + hierarchicalFolderArray[index];

            directory = this.findPathFolder(rootFolder, directoryPath);

            if (!directory) {
                directory = this.newDirectoryItemModel(directoryPath);
                rootFolder.push(directory);
            }
            rootFolder = directory.children;
        }
        return rootFolder;
    }

    protected sort(directory: ItemModel[]) {
        directory.sort((fileA, fileB) => {
            if (!fileA.isFile && fileB.isFile) {
                return -1;
            } else if (fileA.isFile && !fileB.isFile) {
                return 1;
            } else {
                return fileA.value.toLowerCase() < fileB.value.toLowerCase() ? -1 : 1;
            }
        })
    }
}