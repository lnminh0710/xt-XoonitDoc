import { Injectable} from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable()
export class ResourceTranslationService {
    public translationStatus: boolean;

    private bindEventSource = new BehaviorSubject(false);
    public bindEventMessage$ = this.bindEventSource.asObservable();

    private translationStatusSource = new BehaviorSubject(false);
    public translationStatus$ = this.translationStatusSource.asObservable();

    private contextMenuSource = new BehaviorSubject(false);
    public contextMenu$ = this.contextMenuSource.asObservable();

    private successSavedSource = new BehaviorSubject(false);
    public successSaved$ = this.successSavedSource.asObservable();

    constructor() {

    }

    public rebindEvent() {
        this.bindEventSource.next(true);
    }

    public updateStatus(status) {
        this.translationStatus = status;
        this.translationStatusSource.next(status);
    }

    public saveSuccess() {
        this.successSavedSource.next(true);
    }

}
