export interface ILocalStorage {
  setItem(key: string, item: any): void;
  getItem(key: string, defaultValue?: any): any;
}
