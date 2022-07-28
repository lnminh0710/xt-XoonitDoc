export class ItemModel {
  public path: string;
  public value: string;
  public hasChild: boolean;
  public isFile: boolean;
  public isEmpty: boolean;
  public children: ItemModel[];
  public extension: string;

  public constructor(init?: Partial<ItemModel>) {
    Object.assign(this, init);
  }
}
