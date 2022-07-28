import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable()
export class DmsDashboardHandlerService {
    private _folderTreeCreated$ = new BehaviorSubject<boolean>(null);
    private _documentContainerOcrComponentCreated$ = new BehaviorSubject<boolean>(null);

    public get onFolderTreeCreated$() {
        return this._folderTreeCreated$.asObservable();
    }

    public get onDocumentContainerOcrComponentCreated$() {
        return this._documentContainerOcrComponentCreated$.asObservable();
    }

    constructor() {}

    public createFolderTreeDone(isCreated: boolean) {
        this._folderTreeCreated$.next(isCreated);
    }

    public didDocumentContainerOcrComponentCreate(isCreated: boolean) {
        this._documentContainerOcrComponentCreated$.next(isCreated);
    }
}
