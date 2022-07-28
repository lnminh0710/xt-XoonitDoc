import { Injectable, Injector } from '@angular/core';
import { Observable } from 'rxjs';
import { TabSummaryModel, ModuleSettingModel, SimpleTabModel, Module } from '@app/models';
import { BaseService } from '../base.service';
import isNil from 'lodash-es/isNil';
import { map } from 'rxjs/operators';

@Injectable()
export class ModuleSettingService extends BaseService {
  constructor(injector: Injector) {
    super(injector);
  }

  public getModuleSetting(
    objectParam?: string,
    idSettingsModule?: string,
    objectNr?: string,
    moduleType?: string,
    idLogin?: string,
  ): Observable<any> {
    const param = {
      objectParam: objectParam,
      idSettingsModule: idSettingsModule,
      objectNr: objectNr,
      moduleType: moduleType,
      idLogin: idLogin,
    };

    return this.get<any>(this.serUrl.getSettingModule, param, null, null);
  }

  public isJson(str) {
    try {
      return JSON.parse(str);
    } catch (e) {
      return false;
    }
  }

  public getValidJsonSetting(moduleSetting: ModuleSettingModel[]) {
    for (const setting of moduleSetting) {
      if (this.isJson(setting.jsonSettings)) {
        return setting;
      }
    }
    return null;
  }

  public parseJsonSettings(moduleSetting: ModuleSettingModel[]) {
    for (const setting of moduleSetting) {
      const jsonSettings = this.isJson(setting.jsonSettings);
      if (jsonSettings) {
        return jsonSettings;
      }
    }
    return null;
  }

  insertNewJsonSetting(moduleSetting: ModuleSettingModel[], newJsonSetting: any) {
    for (const setting of moduleSetting) {
      if (this.isJson(setting.jsonSettings)) {
        setting.jsonSettings = JSON.stringify(newJsonSetting);
      }
    }

    return moduleSetting;
  }

  insertNewOtherTabSetting(newJsonSettings, selectedTab: TabSummaryModel) {
    if (newJsonSettings.AdditionalInfo) {
      delete newJsonSettings.AdditionalInfo;
    }

    for (const customTab of newJsonSettings.Content.CustomTabs) {
      if (customTab.TabID === selectedTab.tabSummaryInfor.tabID) {
        if (customTab.Split) {
          delete customTab.Split;
        }

        customTab.Page = {};
      }
    }

    return newJsonSettings;
  }

  insertNewSimpleTabSetting(newJsonSettings, selectedTab: TabSummaryModel, selectedSimpleTab: SimpleTabModel) {
    if (newJsonSettings.AdditionalInfo) {
      delete newJsonSettings.AdditionalInfo;
    }

    for (const customTab of newJsonSettings.Content.CustomTabs) {
      if (customTab.TabID === selectedTab.tabSummaryInfor.tabID) {
        let simpleTabs: SimpleTabModel[] = [];
        if (customTab.Split && customTab.Split.Items) {
          for (const item of customTab.Split.Items) {
            if (!isNil(item.SimpleTabs)) {
              simpleTabs = item.SimpleTabs;
              break;
            }
          }
          delete customTab.Split;
        } else if (customTab.SimpleTabs) {
          simpleTabs = customTab.SimpleTabs;
        }

        for (const simpleTab of simpleTabs) {
          simpleTab.Active = simpleTab.TabID === selectedSimpleTab.TabID;
          simpleTab.Disabled = simpleTab.TabID !== selectedSimpleTab.TabID;
          simpleTab.Page = {};
        }

        delete customTab.Page;
        delete customTab.Toolbar;

        customTab.SimpleTabs = simpleTabs;
      }
    }

    return newJsonSettings;
  }

  updateSettingsModule(data): Observable<any> {
    return this.post<any>(this.serUrl.serviceUpdateSettingsModuleUrl, JSON.stringify(data)).pipe(
      map((result: any) => {
        return result.item;
      }),
    );
  }
}
