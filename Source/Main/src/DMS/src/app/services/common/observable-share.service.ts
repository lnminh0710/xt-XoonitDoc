import { Injectable } from '@angular/core';
import { Observable, Scheduler } from 'rxjs';
import { async } from 'rxjs/internal/scheduler/async';
import { publishReplay, refCount } from 'rxjs/operators';

class ObservableShareModel {
    public key: string;
    public observable: Observable<any>;

    public constructor(init: Partial<ObservableShareModel>) {
        Object.assign(this, init);
    }
}

@Injectable()
export class ObservableShareService {

    public observables: Array<ObservableShareModel> = [];
    private scheduler: any;
    private expirationMs: number = 5000;//in milliseconds

    constructor() {
        this.scheduler = this.scheduler || async;
    }

    /**
     * setObservable
     * @param key
     * @param observable
     */
    public setObservable(key: string, observable: Observable<any>, expirationMs?: number, isExecuteImmediately?: boolean) {
        let obs = this.observables.find(p => p.key == key);
        if (!obs) {
            /*
            - refCount: returns an observable that maintains a reference count of subscribers.
            */
            this.observables.push(new ObservableShareModel({
                key: key,
                observable: observable.pipe(
                    publishReplay(1),
                    refCount(),
                )
            }));

            //Execute Immediately
            if (isExecuteImmediately) {
                if (key.indexOf('getCustomerData') !== -1)
                    console.log('subscribe to get: ', key);

                observable.subscribe();
            }

            this.scheduler.schedule(() => {
                if (key.indexOf('getCustomerData') !== -1)
                    console.log('deleteObservable: ', key);

                this.deleteObservable(key);
            }, expirationMs || this.expirationMs);
        }
    }

    /**
     * deleteObservable
     * @param key
     */
    public deleteObservable(key: string) {
        if (this.observables && this.observables.length) {
            this.observables = this.observables.filter(p => p.key != key);

            //// add currency if not existed
            //for (let i = 0, length = this.observables.length; i < length; i++) {
            //    const item = this.observables[i];
            //    if (item.key == key) {
            //        this.observables.splice(i, 1);
            //        break;
            //    }
            //}
        }
    }

    /**
     * getObservable
     * @param key
     */
    public getObservable(key: string) {
        let observable = null;
        let obs = this.observables.find(p => p.key == key);
        if (obs) {
            observable = obs.observable;
        }
        return observable;
    }
}
