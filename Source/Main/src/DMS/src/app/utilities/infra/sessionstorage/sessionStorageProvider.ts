import { ILocalStorage } from '../interface';

export class SessionStorageProvider implements ILocalStorage {

  /**
   * setItem
   * @param key
   * @param item
   */
    setItem(key: string, item: any): void {
        sessionStorage.setItem(key, JSON.stringify(item));
    }

  /**
   * 
   * @param key
   * @param defaultValue
   */
    getItem(key: string, defaultValue?: any): any {
        const itemJson: string = sessionStorage.getItem(key);
        let output: any = defaultValue;
        try {
            if (itemJson) {
                const item = JSON.parse(itemJson);
                output = Object.assign(defaultValue || {}, item);
            }
        } catch (ex) {
        } finally {
            return output;
        }
    }

}
