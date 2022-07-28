import { Injectable, Injector, Inject, forwardRef } from '@angular/core';
import { Observable } from 'rxjs';
import { GlobalSearchModuleModel, IndexSearchSummary, TabModel, ApiResultResponse } from '@app/models';
import { BaseService } from '../base.service';
import { AccessRightsService } from '@app/services';
import { map } from 'rxjs/operators';
import { GlobalSearchFilterModel } from '@app/models/global-search-filter.model';

@Injectable()
export class GlobalSearchService extends BaseService {
    constructor(
        injector: Injector,
        @Inject(forwardRef(() => AccessRightsService)) private accessRightsService: AccessRightsService,
    ) {
        super(injector);
    }

    public getAllSearchModules(): Observable<ApiResultResponse> {
        return BaseService.cacheService
            .get(this.serUrl.getAllSearchModules, this.get<ApiResultResponse>(this.serUrl.getAllSearchModules))
            .pipe(
                map((result: any) => {
                    //Set accessRight for Module
                    this.accessRightsService.SetAccessRightsForModule(result.item);

                    return result;
                }),
            );
    }

    //public getAllModules(): Observable<GlobalSearchModuleModel[]> {
    //    return this.get(this.serUrl.globalSearchGetAllModules).map((result: any) => {
    //        return result.item;
    //    });
    //}

    public getSearchSummary(
        keyWord: string,
        searchIndex: string,
        isWithStar?: boolean,
        searchWithStarPattern?: string,
        idsDocTree?: string,
    ): Observable<ApiResultResponse> {
        //if (keyWord && keyWord != '*') {
        //    let arr = keyWord.split(' ');
        //    keyWord = '';
        //    for (let item of arr) {
        //        keyWord += '"' + item + '" ';
        //    }
        //}
        isWithStar = true; //2019-01-02: Rocco always wants to search by isWithStar = true
        return this.get<any>(this.serUrl.elasticSearchSearchSummary, {
            keyword: encodeURIComponent(keyWord),
            indexes: searchIndex,
            isWithStar: isWithStar,
            searchWithStarPattern: searchWithStarPattern,
            idsDocTree,
        });
    }

    public setTabActive(
        tabName: string,
        active: boolean,
        tabList: TabModel[],
        textSearch: string,
        filter?: GlobalSearchFilterModel,
        sencondaryTitle?: string,
        isForceMainDocument?: boolean
    ) {
        for (let tab of tabList) {
            if (tab.title === tabName) {
                tab.active = true;
                if (textSearch) {
                    tab.textSearch = textSearch;
                    tab.filter = filter;
                    tab.titleSecondary = sencondaryTitle;
                }
                if (isForceMainDocument) {
                    const tabClass = tab.tabClass || '';
                    tab.tabClass = `${tabClass} gs-doc-tree`;
                }
                return;
            }
        }
    }

    public setAllTabActive(active: boolean, tabList: TabModel[]) {
        for (let tab of tabList) {
            tab.active = active;
        }
    }

    public checkTabExists(title: string, tabList: TabModel[]): boolean {
        for (let tab of tabList) {
            if (tab.title === title) {
                return true;
            }
        }
        return false;
    }

    public getModuleByName(modules: GlobalSearchModuleModel[], name: string): GlobalSearchModuleModel {
        for (let mod of modules) {
            if (mod.moduleName === name) return mod;
        }
        return new GlobalSearchModuleModel();
    }

    public getCurrentModule(globalSearchModuleModels, globalSearchModuleModelsAdminChildren, currentTab): any {
        let allModules = globalSearchModuleModels;
        let childModules = [];
        allModules.forEach((element) => {
            if (element.children && element.children.length > 0) {
                childModules = childModules.concat(element.children);
            }
        });
        allModules = allModules.concat(globalSearchModuleModelsAdminChildren);
        allModules = allModules.concat(childModules);
        for (let item of allModules) {
            let moduleId = currentTab.moduleID;
            if (!moduleId && currentTab.module) {
                moduleId = currentTab.module.idSettingsGUI;
            }

            if (moduleId) {
                if (item.idSettingsGUI == moduleId) {
                    return item;
                }
            } else if (item.moduleName === currentTab.title) {
                return item;
            }
        }
        return null;
    }

    public setSearchResultForModule(
        globalSearchModuleModels: GlobalSearchModuleModel[],
        searchResult: number,
        className: string,
    ) {
        if (!globalSearchModuleModels.length) return;

        for (let item of globalSearchModuleModels) {
            item.isLoading = false;
            item.searchResult = null;
            item.isSearchEmpty = false;
            item.controlClassName = className;
        }
    }

    public getCurrentTabModelItem(tabList: TabModel[]): TabModel {
        for (let item of tabList) {
            if (item.active) {
                return item;
            }
        }
        return null;
    }

    public isChildOfModule(parentModule, childModule) {
        if (parentModule.children.length) {
            for (let child of parentModule.children) {
                if (child.idSettingsGUI == childModule.idSettingsGUI) {
                    return true;
                }
            }
        }

        return false;
    }
}
