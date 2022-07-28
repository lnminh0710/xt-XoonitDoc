import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable()
export class DocumentManagementHandlerService {

    private _documentContainerOcrComponentCreated$ = new BehaviorSubject<boolean>(null);
    private _mydmFolderTreeComponentCreated$ = new BehaviorSubject<boolean>(null);

    public get onDocumentContainerOcrComponentCreated$() {
        return this._documentContainerOcrComponentCreated$.asObservable();
    }

    public get onMydmFolderTreeComponentCreated$() {
        return this._mydmFolderTreeComponentCreated$.asObservable();
    }

    constructor() {}

    public didDocumentContainerOcrComponentCreate(isCreated: boolean) {
        this._documentContainerOcrComponentCreated$.next(isCreated);
    }

    public didMydmFolderTreeComponentCreate(isCreated: boolean) {
        if (isCreated) {
            this._mydmFolderTreeComponentCreated$.next(true);
        }
    }
}
