import { BaseComponent } from '@app/pages/private/base';
import { Router } from '@angular/router';
import { FileManagerSelectors } from '@app/state-management/store/reducer/file-manager/file-manager.selectors';
import { AppState } from '@app/state-management/store';
import { Store } from '@ngrx/store';
import { FileManagerActions } from '@app/state-management/store/actions/file-manager/file-manager.action';
import { Uti } from '@app/utilities';
import { FileViewerType, DocumentProcessingTypeEnum, DocumentMyDMType } from '@app/app.constants';
import { GuidHelper } from '@app/utilities/guild.helper';
import { GetFileByUrlForWidgetViewerIdAction, DblClickOnWidgetViewerAction } from '@app/pages/document-management/document-management.statemanagement/document-management.actions';


export abstract class BaseViewer extends BaseComponent {
    private _path: string;
    protected uniqueKey: string[];
    protected uniqueViewerId: string;
    protected blob: Blob;

    public file: any;
    public documentType: DocumentMyDMType;

    /**
     * Set path to a viewer and dispatch an action then firing http request to get file
     * @param path path to a file server
     */
    public set path(filePath: string) {
        this._path = filePath;
    }

    public get path() {
        return this._path;
    }

    constructor(
        protected router: Router,
        protected store: Store<AppState>
    ) {
        super(router);
        this.uniqueKey = this.setSupportedFileTypesAsKey();
        this.uniqueViewerId = GuidHelper.generateGUID();
    }

    public abstract subscribeOnAttachViewRef(): void;
    public abstract setSupportedFileTypesAsKey(): string[];
    public abstract isExtensionTheSameGroupType(fileType: FileViewerType): boolean;
    public abstract updatePath(path: string): void;
    public disposeContentOnDetach() {
        this.blob = null;
    }

    public getSupportedFileTypesAsKey(): string[] {
        return this.uniqueKey;
    }

    public unsubscribeOnDetachViewRef() {
        Uti.unsubscribe(this);
    }

    public dispatchDoubleClickEventOnViewer() {
        this.store.dispatch(new DblClickOnWidgetViewerAction(this.documentType, this.file.idMainDocument));
    }
}
