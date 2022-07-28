import { Injectable } from '@angular/core';
import { ILocalStorage } from '@app/utilities/infra';

@Injectable()
export class LocalStorageHelper {
    static toInstance<T extends ILocalStorage>(type: ({ new(): T; })): ILocalStorage {
        const _provider: T = new type();

        // Public API Function
        return {
            setItem: _provider.setItem,
            getItem: _provider.getItem
        };
    }
}




