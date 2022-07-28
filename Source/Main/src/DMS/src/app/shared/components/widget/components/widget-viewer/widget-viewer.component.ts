import {
    Component,
    OnInit,
    ViewChild,
    ViewContainerRef,
    Input,
    ComponentRef,
    ComponentFactoryResolver,
    ComponentFactory,
    SimpleChanges,
    OnChanges,
    EmbeddedViewRef,
    OnDestroy,
} from '@angular/core';
import { FileViewerType } from '@app/app.constants';
import { SpreadsheetViewerComponent } from './components/spreadsheet-viewer/spreadsheet-viewer.component';
import { TextViewerComponent } from './components/text-viewer/text-viewer.component';
import { BaseViewer } from './components/base-viewer';
import { toSafeInteger } from 'lodash';
import { PerfectScrollbarConfigInterface } from 'ngx-perfect-scrollbar';
import { WidgetPdfViewerComponent } from './components/pdf-viewer/pdf-viewer.component';
import { WidgetDetail } from '@app/models';
import { ImageViewerComponent } from './components/image-viewer/image-viewer.component';
import { AudioViewerComponent } from './components/audio-viewer/audio-viewer.component';
import { VideoViewerComponent } from './components/video-viewer/video-viewer.component';
import { ZipViewerComponent } from './components/compressed-file-viewer/zip-viewer/zip-viewer.component';
import { ToasterService } from 'angular2-toaster';
import { Uti } from '@app/utilities';
import { Subscription } from 'rxjs';
import { ReducerManagerDispatcher } from '@ngrx/store';
import { CustomAction } from '@app/state-management/store/actions/base/custom-action';
import { FileManagerActionNames } from '@app/state-management/store/actions/file-manager/file-manager.action';
import { ItemModel } from '@app/pages/private/modules/file-manager/models';
import { RarViewerComponent } from './components/compressed-file-viewer/rar-viewer/rar-viewer.component';
import { BaseComponent } from '@app/pages/private/base';
import { Router } from '@angular/router';
import {
    DocumentManagementActionNames,
    OpenFileIntoViewerAction,
} from '@app/pages/document-management/document-management.statemanagement/document-management.actions';
import { DocumentTreeModel } from '@app/models/administration-document/document-tree.payload.model';
import { filter } from 'rxjs/operators';

@Component({
    selector: 'widget-viewer',
    templateUrl: './widget-viewer.component.html',
    styleUrls: ['./widget-viewer.component.scss'],
})
export class WidgetViewerComponent extends BaseComponent implements OnInit, OnChanges, OnDestroy {
    public FileViewerType = FileViewerType;
    private _fileType: FileViewerType;
    private extension: string;
    private onDraggingZone: boolean;
    private dragEnterCount: number;
    private fileName: string;

    private _componentRef: ComponentRef<BaseViewer> = null;
    private componentRefMap: Map<string[], ComponentRef<BaseViewer>> = null;
    private perfectScrollbarConfig: PerfectScrollbarConfigInterface;
    private _widgetDetail: WidgetDetail;
    private _file: any;
    private _folder: DocumentTreeModel;

    private openItemSubscription: Subscription;

    @ViewChild('containerViewer', { read: ViewContainerRef }) viewContainerRef: ViewContainerRef;

    @Input('widget-detail') set widgetDetail(data: WidgetDetail) {
        this._widgetDetail = data;
    }

    @Input('file-type') set fileType(data: FileViewerType | number) {
        this._fileType = data;
    }

    get fileType() {
        return this._fileType;
    }

    constructor(
        protected router: Router,
        private componentFactoryResolver: ComponentFactoryResolver,
        private toastService: ToasterService,
        private dispatcher: ReducerManagerDispatcher,
    ) {
        super(router);
    }

    public ngOnChanges(changes: SimpleChanges): void {}

    public ngOnInit() {
        this.componentRefMap = new Map<string[], ComponentRef<BaseViewer>>();
        this.perfectScrollbarConfig = {
            suppressScrollX: true,
            suppressScrollY: false,
        };
        this.onDraggingZone = false;
        this.dragEnterCount = 0;

        this.openItemSubscription = this.dispatcher
            .pipe(
                filter(
                    (action: OpenFileIntoViewerAction) =>
                        action.type === DocumentManagementActionNames.OPEN_FILE_INTO_VIEWER &&
                        this._widgetDetail.widgetDataType.parentWidgetIds.findIndex(
                            (parentId) => parentId === action.payload.idWidget,
                        ) !== -1,
                ),
            )
            .subscribe((action: OpenFileIntoViewerAction) => {
                // const file = action.payload.path as ItemModel;
                // this.readFile(file);
                // this.loadComponentViewer(file.path)
                this._file = action.payload.file;
                this._folder = action.payload.folder;
                const path = action.payload.file.localFileName + '.pdf';

                this.fileName = path.substring(path.lastIndexOf('\\') + 1);
                this.extension = path.substring(path.lastIndexOf('.') + 1);
                // this.fileType = toSafeInteger(FileViewerType[this.extension.toUpperCase()]);
                this.fileType = toSafeInteger(FileViewerType.PDF);
                this.loadComponentViewer(`${this._file.localPath}\\${this.fileName}`);
            });
    }

    public ngOnDestroy(): void {
        if (!this._componentRef) return;
        this._componentRef.destroy();
        Uti.unsubscribe(this);
    }

    /**
     * Load component viewer based on file type was dropped in
     * @param path to file server
     */
    private loadComponentViewer(path: string) {
        let factory: ComponentFactory<any> = null;

        if (this.loadComponentViewerIfExists(path)) {
            return;
        }

        switch (this.fileType) {
            case FileViewerType.PDF:
                factory = this.componentFactoryResolver.resolveComponentFactory(WidgetPdfViewerComponent);
                break;

            case FileViewerType.XLSX:
            case FileViewerType.XLS:
                factory = this.componentFactoryResolver.resolveComponentFactory(SpreadsheetViewerComponent);
                break;

            case FileViewerType.TXT:
                factory = this.componentFactoryResolver.resolveComponentFactory(TextViewerComponent);
                break;

            case FileViewerType.JPG:
            case FileViewerType.PNG:
            case FileViewerType.TIFF:
                factory = this.componentFactoryResolver.resolveComponentFactory(ImageViewerComponent);
                break;

            case FileViewerType.MP3:
            case FileViewerType.WAV:
                factory = this.componentFactoryResolver.resolveComponentFactory(AudioViewerComponent);
                break;

            case FileViewerType.MP4:
                factory = this.componentFactoryResolver.resolveComponentFactory(VideoViewerComponent);
                break;

            case FileViewerType.ZIP:
                factory = this.componentFactoryResolver.resolveComponentFactory(ZipViewerComponent);
                break;

            case FileViewerType.RAR:
                factory = this.componentFactoryResolver.resolveComponentFactory(RarViewerComponent);
                break;

            default:
                this.toastService.pop('warning', `This '${this.extension}' extension is not supported yet`);
                return;
        }

        this.resolveComponent(factory, path);
    }

    /**
     * Resolve component from factory to view container
     * @param factory factory of a component
     * @param path to a file server
     */
    private resolveComponent(factory: ComponentFactory<any>, path: string) {
        if (!factory) return;

        this.detachAndUnsubscribeOnCurrentComponentRef();

        this._componentRef = this.viewContainerRef.createComponent(factory) as ComponentRef<BaseViewer>;
        this._componentRef.instance.path = path;
        this._componentRef.instance.file = this._file;
        this._componentRef.instance.documentType = this._folder.idDocumentType;
        ((this._componentRef.hostView as EmbeddedViewRef<BaseViewer>).rootNodes[0] as HTMLElement).addEventListener(
            'dblclick',
            this._componentRef.instance.dispatchDoubleClickEventOnViewer.bind(this._componentRef.instance),
        );

        this.componentRefMap.set(this._componentRef.instance.getSupportedFileTypesAsKey(), this._componentRef);
    }

    /**
     * Check regarding to a fileType was dropped in whether respective the component viewer have loaded before
     * @param path to a file server
     */
    private loadComponentViewerIfExists(path: string): boolean {
        if (!this._componentRef) return;

        const componentRef = this.getCacheComponentViewer();
        if (!componentRef) return false;

        const currentEmbeddedViewRef = this.viewContainerRef.get(0) as EmbeddedViewRef<any>;
        const embeddedViewRef = componentRef.hostView as EmbeddedViewRef<any>;

        // set new path in current widget viewer
        if (currentEmbeddedViewRef.rootNodes[0] === embeddedViewRef.rootNodes[0]) {
            componentRef.instance.updatePath(path);
            return true;
        }

        // detach temporarily current widget viewer
        this.detachAndUnsubscribeOnCurrentComponentRef();
        this.viewContainerRef.insert(componentRef.hostView);
        componentRef.instance.subscribeOnAttachViewRef();
        componentRef.instance.path = path;

        this._componentRef = componentRef;
        return true;
    }

    /**
     * Get cache component viewer stored in Map type. To avoid re-create multiple times.
     */
    private getCacheComponentViewer(): ComponentRef<BaseViewer> {
        let cacheComponentRef = null;

        const length = this.componentRefMap.size;
        const entries = this.componentRefMap.entries();
        for (let i = 0; i < length; i++) {
            const iterator = entries.next();
            const keys = iterator.value[0] as string[];
            const found = keys.find((extensionType) => FileViewerType[this._fileType] === extensionType);
            if (found) {
                cacheComponentRef = this.componentRefMap.get(keys);
                break;
            }
        }

        return cacheComponentRef;
    }

    /**
     * Just detach a component out of the view but still preverse it to be re-used in the future. It opposites to remove method
     */
    private detachAndUnsubscribeOnCurrentComponentRef() {
        if (!this._componentRef) return;

        this._componentRef.instance.unsubscribeOnDetachViewRef();
        this._componentRef.instance.disposeContentOnDetach();
        this.viewContainerRef.detach();
    }

    /**
     * Event drop a file to a zone named 'widget-viewer'
     * @param $event
     */
    public onDropFileViewer($event) {
        const dragData = $event.dragData;

        this.readFile(dragData.file);
        this.loadComponentViewer(dragData.file.path);
        this.dragEnterCount = 0;
    }

    public readFile(file: ItemModel) {
        this.fileName = file.value;
        this.extension = file.extension;
        this.fileType = toSafeInteger(FileViewerType[this.extension.toUpperCase()]);
    }
}
