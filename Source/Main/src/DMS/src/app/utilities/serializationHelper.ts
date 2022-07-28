import { Injectable } from '@angular/core';

@Injectable()
export class SerializationHelper {
    static toInstance<T>(obj: T, json: string): T {
        try {
            const jsonObj = JSON.parse(json);

            if (typeof obj['fromJSON'] === 'function') {
                obj['fromJSON'](jsonObj);
            } else {
                for (const propName in jsonObj) {
                    if (jsonObj.hasOwnProperty(propName)) {
                        obj[propName] = jsonObj[propName];
                    }
                }
            }
        }
        catch {
        }
        finally {
            return obj;
        }
    }
}
