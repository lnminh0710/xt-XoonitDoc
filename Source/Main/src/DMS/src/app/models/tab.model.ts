import { Module } from '@app/models';
import { GlobalSearchFilterModel } from './global-search-filter.model';

export class TabModel {
  public id?: string = '';
  public title: string = '';
  public active: boolean = false;
  public removable: boolean = false;
  public textSearch?: string = '';
  public filter?: GlobalSearchFilterModel = null;
  public module?: Module = null;
  public searchIndex?: string = '';
  public isLoading?: boolean = false;
  public moduleID?: string = null;
  public isWithStar: boolean = false;
  public searchWithStarPattern: string = null;
  public payload?: any;
  public histories: Array<any> = [];
  public activeAdvanceSearchStatus?: boolean;

  public titleSecondary?: string = '';
  public tabClass?: string;

  public constructor(init?: Partial<TabModel>) {
    Object.assign(this, init);
  }
}
