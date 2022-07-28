import { Injectable, Injector } from '@angular/core';
import { BaseService } from '../base.service';
import { Observable, of } from 'rxjs';
import { ApiResultResponse } from '@app/models';

@Injectable()
export class SearchService extends BaseService {

    constructor(injector: Injector) {
        super(injector);
    }

    public search(
        searchIndex: string,
        keyword: string,
        moduleId: number,
        pageIndex: number,
        pageSize: number,
        searchField?: any,
        fieldName?: Array<string>,
        fieldValue?: Array<string>,
        isWithStar?: boolean,
        searchWithStarPattern?: string,
        fieldsJson?: string,
    ): Observable<ApiResultResponse> {
        isWithStar = true;//2019-01-02: Rocco always wants to search by isWithStar = true

        // TODO: Refactor later
        if (moduleId >= 11 && moduleId <= 23) {
            moduleId = 1;
        }
        //if (keyword && keyword != '*') {
        //    let arr = keyword.split(' ');
        //    keyword = '';
        //    for (let item of arr) {
        //        keyword += '"' + item + '" ';
        //    }
        //}

        let url = this.serUrl.elasticSearchSearchDetail;
        const params: any = {
            searchIndex: searchIndex,
            keyword: keyword ? encodeURIComponent(keyword) : '',
            moduleId: moduleId,
            pageIndex: pageIndex,
            pageSize: pageSize,
            isWithStar: isWithStar,
            searchWithStarPattern: searchWithStarPattern,
            fieldsJson: fieldsJson,
        };
        if (searchField) {
            url = this.serUrl.elasticSearchSearchByField;
            params.field = searchField;
        }
        if (fieldName && fieldName.length && fieldValue && fieldValue.length && fieldName.length === fieldValue.length) {
            url += '?';
            for (let i = 0; i < fieldName.length; i++) {
                url += 'fieldName=' + fieldName[i] + '&fieldValue=' + fieldValue[i];
                if (i === fieldName.length - 1) break;
                url += '&';
            }
        }
        return this.get<any>(url, params);
    }

    public searchArticle(
        keyword: string,
        pageIndex: number,
        pageSize: number,
        isGetManualArticleNr: boolean
    ): Observable<ApiResultResponse> {
        let url = this.serUrl.elasticSearchSearchArticle;
        const params: any = {
            keyword: encodeURIComponent(keyword),
            pageIndex: pageIndex,
            pageSize: pageSize,
            isGetManualArticleNr
        };
        return this.get<any>(url, params);
    }

    public searchField(
        field: string,
        index: string,
        keyword: string,
        moduleId: number,
        pageIndex: number,
        pageSize: number,
        fieldNames: string[],
        fieldValues: string[]
    ): Observable<any> {
        if (!field || !keyword || !index) return of(null);

        const url = this.serUrl.elasticSearchSearchByField;
        const params: any = {
            field: field,
            searchIndex: index,
            keyword: encodeURIComponent(keyword),
            moduleId: moduleId,
      pageIndex: pageIndex,
      pageSize: pageSize,
      fieldNames: fieldNames,
      fieldValues: fieldValues,
    };
    return this.get<any>(url, params);
  }

  public getColumnSetting(moduleId): Observable<any> {
    return this.get<any>(this.serUrl.elasticGetColumnSetting, { moduleId: moduleId }).map((result: any) => {
      return result.item;
    });
  }

  public searchAdvance(
    searchIndex: string,
    moduleId: number,
    pageIndex: number,
    pageSize: number,
    conditions: any,
  ): Observable<ApiResultResponse> {
    // TODO: Refactor later
    if (moduleId >= 11 && moduleId <= 23) {
      moduleId = 1;
    }

    let url = this.serUrl.elasticSearchDetailAdvance;
    const params: any = {
      searchIndex: searchIndex,
      moduleId: moduleId,
      pageIndex: pageIndex,
      pageSize: pageSize,
      conditions: conditions,
    };
    return this.post<any>(url, params, null, null, null, true);
  }

  public searchCustomerFoot(matchingGroup: string, keyword: string): Observable<ApiResultResponse> {
    const fieldName: Array<string> = ['matchingGroup'];
    const fieldValue: Array<string> = [matchingGroup];

    const searchIndex = 'customerfoot';
    return this.search(searchIndex, keyword, 2, 1, 100, null, fieldName, fieldValue, true);
  }
}
