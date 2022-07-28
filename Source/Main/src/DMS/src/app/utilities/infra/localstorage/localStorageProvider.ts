import { ILocalStorage } from '../interface';

export class LocalStorageProvider implements ILocalStorage {
    
  /**
   * setItem
   * @param key
   * @param item
   */
  public setItem(key: string, item: any): void {
    localStorage.setItem(key, JSON.stringify(item));
  }

  /**
   * getItem
   * @param key
   * @param defaultValue
   */
  public getItem(key: string, defaultValue?: any): any {
    const itemJson: string = localStorage.getItem(key);
    let output: any = defaultValue;
    try {
      if(itemJson) {
          const item = JSON.parse(itemJson);
          output = Object.assign(defaultValue || {}, item);
      }
    } catch (ex) {
    } finally {
      return output;
    }
  }
}
