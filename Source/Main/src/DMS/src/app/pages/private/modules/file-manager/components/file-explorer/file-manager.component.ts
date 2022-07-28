import {
    Component,
    OnInit,
    ViewChildren,
    QueryList,
    Output,
    EventEmitter,
    Input,
    OnDestroy,
    ViewChild,
} from '@angular/core';
import { Store, ReducerManagerDispatcher } from '@ngrx/store';
import { Subscription, Subject, Observable, forkJoin } from 'rxjs';
import 'rxjs/add/observable/forkJoin';

import { BaseWidget } from '@app/pages/private/base';
import { ItemModel } from '../../models';

import { FileManagerService } from '../../services';

import find from 'lodash-es/find';
import every from 'lodash-es/every';
import map from 'lodash-es/map';
import findIndex from 'lodash-es/findIndex';
import cloneDeep from 'lodash-es/cloneDeep';

// import { saveAs } from 'file-saver';

import { FileItemComponent } from '../file-item';
import { AppState } from '@app/state-management/store';
import { ProcessDataActions, FileManagerActions, CustomAction } from '@app/state-management/store/actions';
import { FileUploader } from '@app/shared/components/xn-file';
import { Configuration, UploadFileMode } from '@app/app.constants';
import { WidgetDetail } from '@app/models';
import { Uti } from '@app/utilities';
import { FileDetailComponent } from '../file-detail';
import { filter } from 'rxjs/operators';

const FILE_SERVER = '';
const ACTION_TOGGLE_TREE_VIEW = 0;
const ACTION_LIST_VIEW = 1;
const ACTION_THUMBNAIL_VIEW = 2;
const ACTION_DELETE = 3;
const ACTION_RENAME = 4;
const ACTION_DOWNLOAD = 5;
const ACTION_MOVE = 6;
const ACTION_ADD_NEW = 7;

@Component({
    selector: 'file-manager',
    styleUrls: ['./file-manager.component.scss'],
    templateUrl: './file-manager.component.html',
    host: {
        '(contextmenu)': 'rightClicked($event)',
        '(mouseenter)': 'mouseenter($event)',
        '(mouseleave)': 'mouseenter($event)',
    },
})
export class FileManagerComponent extends BaseWidget implements OnInit, OnDestroy {
    @ViewChild(FileDetailComponent) fileDetail: FileDetailComponent;
    //Input
    @Input() dataSource: WidgetDetail;

    // Output
    @Output() dispatchData: EventEmitter<any> = new EventEmitter();

    // Variable
    public breadcrumb: string;
    public contents: Array<ItemModel> = [];
    public perfectScrollbarConfig: any = {};
    public settings: any = {
        rootIsVisible: false,
    };
    public const = new Configuration();

    public tree: any;
    public isLoading: boolean;
    public numberDup: any = '';
    // toolbar
    public isShowTree = true;
    public isShowThumbnails = true;

    //file drop
    public widgetId: any;
    public uploader: FileUploader = null;
    public isFileOver: boolean = false;
    public showDialog: boolean = false;
    public dropFiles: File[] = [];
    public UploadFileModeView = UploadFileMode;
    public uploadFileMode = this.UploadFileModeView.FileExplorer;

    //
    public openMoveTo: boolean;

    // private
    private subscribeToolbar: Subscription;
    private itemSelected: Array<ItemModel> = [];

    @ViewChildren(FileItemComponent)
    private contentItemComponents: QueryList<FileItemComponent>;

    constructor(
        private fileManagerService: FileManagerService,
        private dispatcher: ReducerManagerDispatcher,
        private store: Store<AppState>,
        private processDataActions: ProcessDataActions,
        private fileManagerActions: FileManagerActions,
    ) {
        super();
    }

    ngOnInit() {
        this.perfectScrollbarConfig = {
            suppressScrollX: false,
            suppressScrollY: false,
        };

        // setInterval(() => {
        //   this.isFileOver = !this.isFileOver;
        // }, 5000);
        this.getTreeInit();
        this.getcontentsByPath('');
        this.subscribeActionToolbar();
        this.widgetId = this.dataSource.id;
    }

    ngOnDestroy() {
        Uti.unsubscribe(this);
    }

    mouseenter(event) {
        event.preventDefault();
    }

    public rightClicked($event: MouseEvent) {
        this.store.dispatch(this.processDataActions.dontWantToShowContextMenu());
    }

    public openItem(item: ItemModel) {
        if (item.isFile) {
            return this.dispatchFileDetail(item);
        }
        this.getcontentsByPath(item.path);
        if (this.breadcrumb) {
            this.breadcrumb += item.value + '\\';
        } else {
            this.breadcrumb = '\\' + item.value + '\\';
        }
    }

    public goBack() {
        const breadcrumb = this.breadcrumb.split('\\');
        let path = FILE_SERVER;
        breadcrumb.splice(breadcrumb.length - 2, 1);
        if (breadcrumb.length <= 2) {
            this.breadcrumb = '';
        } else {
            this.breadcrumb = breadcrumb.join('\\');
            path += breadcrumb.join('\\');
        }
        this.getcontentsByPath('');
    }

    public createNewFolder(folderName?: string, parentPath?: string, callback?: Function) {
        const name = folderName || 'New folder ' + this.numberDup;
        const path = parentPath || FILE_SERVER + this.replacePath(this.breadcrumb);
        this.fileManagerService.createFolder(path, name).subscribe(
            (response: any) => {
                if (response === 'Success') {
                    const newItem: ItemModel = {
                        value: name,
                        isEmpty: true,
                        path: FILE_SERVER + this.breadcrumb + name,
                        hasChild: false,
                        isFile: false,
                        children: null,
                        extension: null,
                    };

                    const contents = cloneDeep(this.contents);
                    contents.unshift(newItem);
                    this.contents = contents;
                    if (!folderName) {
                        setTimeout(() => {
                            this.editingNewFolder(name);
                        }, 100);
                    }
                    this.getTreeInit();
                    if (callback) callback();
                }
            },
            error => {
                if (!this.numberDup) {
                    this.numberDup = 1;
                } else {
                    this.numberDup += 1;
                }
                this.createNewFolder(folderName, parentPath, callback);
            },
        );
    }

    public handleSelected(event: any) {
        try {
            const path = event.node.node.path;
            this.getcontentsByPath(path);
            this.breadcrumb = path.replace(FILE_SERVER, '') + '\\';
        } catch (error) {
            console.log(error);
        }
    }

    public handleSelectedMoveTo(event: any) {
        const path = event.node.node.path;
        const itemSelected = this.itemSelected;
        const methods = [];
        for (const key in itemSelected) {
            if (itemSelected.hasOwnProperty(key)) {
                const item = itemSelected[key];
                const itemValue = item.value;
                const newPath = path + '\\' + itemValue;
                if (item.isFile) {
                    methods.push(
                        this.fileManagerService.renameFile(this.replacePath(item.path), this.replacePath(newPath)),
                    );
                } else {
                    methods.push(
                        this.fileManagerService.renameFolder(this.replacePath(item.path), this.replacePath(newPath)),
                    );
                }
            }
        }
        this.openMoveTo = false;
        forkJoin(...methods).subscribe((response: any) => {
            this.onSelect(null);
            this.getcontentsByPath('');
            this.getTreeInit();
        });
    }

    public handleMoved(event: any) {
        console.log('handleMoved ', event);
    }

    public handleRenamed(event: any) {
        try {
            this.updateFolderName(event.node.node, event.newValue);
        } catch (error) {
            console.log('err', error);
        }
    }

    public handleCreated(event: any) {
        try {
            this.createNewFolder(event.node.value, this.replacePath(event.node.parent.node.path || ''));
        } catch (error) {}
    }

    public updateItemValue({ item, value, callback }) {
        if (item.isFile) {
            this.updateFileName(item, value, callback);
        } else {
            this.updateFolderName(item, value, callback);
        }
    }

    public onSelect(event) {
        if (event) {
            if (event.ctrlKey) {
                this.itemSelected.push(event.item);
            } else if (event.item) {
                this.itemSelected = [event.item];
            }
            if (event.items) {
                this.itemSelected = event.items;
            }
        } else {
            this.itemSelected = [];
        }
        const isSelectFolder = every(this.itemSelected, ['isFile', false]);
        this.store.dispatch(
            this.fileManagerActions.selectItem({ item: this.itemSelected, isSelectFolder, id: this.widgetId }),
        );
    }

    public onFileDrop(event) {
        this.showDialog = true;
        this.dropFiles = event;
        if (this.callFileOver) clearInterval(this.callFileOver);

        setTimeout(() => {
            this.isFileOver = false;
        }, 15);
    }

    public onCloseDialog() {
        this.showDialog = false;
        this.dropFiles = [];
        this.getcontentsByPath('', true);
    }

    public dontAllowFileExtensionHander() {
        setTimeout(() => {
            this.isFileOver = false;
        }, 300);
    }

    private callFileOver;
    public fileOver(event: boolean) {
        if (this.callFileOver && this.isFileOver) clearInterval(this.callFileOver);
        if (this.isFileOver === event) return;
        this.callFileOver = setTimeout(() => {
            this.isFileOver = event;
        }, 10);
    }

    private dispatchFileDetail(item: ItemModel) {
        this.store.dispatch(this.fileManagerActions.openItem({ file: item, id: this.dataSource.id }));
    }

    private subscribeActionToolbar() {
        this.subscribeToolbar = this.dispatcher
            .pipe(
                filter((action: CustomAction) => {
                    return action.type === FileManagerActions.CLICK_BUTTON && action.payload.id === this.dataSource.id;
                }),
            )
            .subscribe((action: CustomAction) => {
                switch (action.payload.actionType) {
                    case ACTION_TOGGLE_TREE_VIEW:
                        this.isShowTree = !this.isShowTree;
                        break;
                    case ACTION_LIST_VIEW:
                        if (!this.isShowThumbnails) return;
                        this.onSelect(null);
                        this.isShowThumbnails = false;
                        break;
                    case ACTION_THUMBNAIL_VIEW:
                        if (this.isShowThumbnails) return;
                        this.onSelect(null);
                        this.isShowThumbnails = true;
                        break;
                    case ACTION_DELETE:
                        this.deleteFiles();
                        break;
                    case ACTION_RENAME:
                        if (this.isShowThumbnails) this.editingNewFolder(this.itemSelected[0].value);
                        else this.editTableRow();
                        break;
                    case ACTION_DOWNLOAD:
                        for (const key in this.itemSelected) {
                            if (this.itemSelected.hasOwnProperty(key)) {
                                const element = this.itemSelected[key];
                                var a = document.createElement('a');
                                //a.href = '/api/FileManager/GetFile?mode=13&name=' + element.path + '';
                                a.href = Uti.getFileUrl(element.path, UploadFileMode.FileExplorer);
                                a.download = 'result';
                                document.body.appendChild(a);
                                a.click();
                                // this.documentService.getScanFile(this.IdDocumentContainerScans).subscribe((response: any) => {
                                //   console.log('getScanFile', response);
                                // });
                                setTimeout(() => {
                                    a.remove();
                                }, 1000);
                                // this.fileManagerService.getFileByUrl(element.path).subscribe((response: any) => {
                                //   saveAs(response, element.value);
                                // });
                            }
                        }
                        break;
                    case ACTION_MOVE:
                        this.openMoveTo = true;
                        break;
                    case ACTION_ADD_NEW:
                        this.createNewFolder('', '', () => {
                            if (!this.isShowThumbnails)
                                setTimeout(() => {
                                    this.editTableRow(true);
                                }, 100);
                        });

                        break;
                    default:
                        break;
                }
            });
    }

    private editTableRow(firstRow?: boolean) {
        const rowIndex = firstRow ? 0 : findIndex(this.contents, this.itemSelected[0]);
        this.fileDetail.gridApi.startEditingCell({
            rowIndex: rowIndex,
            colKey: 'value',
        });
    }

    private deleteFiles() {
        this.isLoading = true;
        const filePath = map(this.itemSelected, _i => this.replacePath(_i.path));
        this.fileManagerService.deleteFileByPath(filePath).subscribe(
            (response: any) => {
                this.getcontentsByPath('');
                this.onSelect(null);
            },
            err => {
                this.isLoading = false;
            },
        );
    }

    private getTreeInit() {
        if (this.tree) this.tree.children = [];
        this.fileManagerService.getTree().subscribe((response: any) => {
            this.tree = {
                value: 'root',
                children: response,
            };
        });
    }
    private replacePath(path: string = '') {
        return path.replace(/^\\/g, '');
    }

    private editingNewFolder(folderName) {
        const inlineEditComponents: Array<FileItemComponent> = this.contentItemComponents.toArray();
        inlineEditComponents.forEach(contentItemComponent => {
            if (contentItemComponent.item.value === folderName) {
                contentItemComponent.renameItem();
            }
        });
    }

    private getcontentsByPath(path: string, hideLoading?: boolean) {
        if (!path) path = this.replacePath(this.breadcrumb);
        if (!hideLoading) this.isLoading = true;
        this.fileManagerService.getChildren(this.replacePath(path)).subscribe(
            (response: any) => {
                this.isLoading = false;
                this.contents = response;
            },
            (error: any) => {
                this.isLoading = false;
            },
        );
    }

    private updateFolderName(item: ItemModel, value: string, callback?: any) {
        const path = item.path.split('\\');
        path[path.length - 1] = value;
        const newPath = path.join('\\');

        this.fileManagerService.renameFolder(this.replacePath(item.path), this.replacePath(newPath)).subscribe(
            (response: any) => {
                if (response === 'Success') {
                    this.reRenderContent(item.path, newPath, value);
                    this.getTreeInit();
                    if (callback) callback();
                }
            },
            err => {
                const body = err._body || '';
                if (body) {
                    const resErr = JSON.parse(body);
                    if (callback) callback(resErr.ResultDescription);
                }
            },
        );
    }

    private updateFileName(item: ItemModel, value: string, callback?: any) {
        const path = item.path.split('\\');
        path[path.length - 1] = value;
        const newPath = path.join('\\');

        this.fileManagerService.renameFile(this.replacePath(item.path), newPath).subscribe(
            (response: any) => {
                if (response === 'Success') {
                    this.reRenderContent(item.path, newPath, value);
                    path[path.length - 1] = '';
                    this.getcontentsByPath(path.join('\\'), true);
                    if (callback) callback();
                }
            },
            err => {
                const body = err._body || '';
                if (body) {
                    const resErr = JSON.parse(body);
                    if (callback) callback(resErr.ResultDescription);
                }
            },
        );
    }

    private reRenderContent(oldPath: string, newPath: string, value: string) {
        const contents = this.contents;
        const item = find(contents, ['path', oldPath]);
        if (!item) return;
        item.path = newPath;
        item.value = value;
        this.contents = contents;
    }
}
