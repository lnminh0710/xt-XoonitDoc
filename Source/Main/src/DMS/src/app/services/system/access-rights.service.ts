import { Injectable, Injector, Inject, forwardRef } from '@angular/core';
import { Observable, of } from 'rxjs';
import { AccessRightTypeEnum, Configuration } from '@app/app.constants';
import { AccessRightModel, Module } from '@app/models';
import { UserService } from '@app/services';
import { BaseService } from '../base.service';
import { ModuleList } from '@app/pages/private/base';
import { map } from 'rxjs/operators';

@Injectable()
export class AccessRightsService extends BaseService {
    constructor(injector: Injector, @Inject(forwardRef(() => UserService)) private userServ: UserService) {
        super(injector);
    }

    private applyAccessRight: boolean = Configuration.PublicSettings.applyAccessRight; //True: don't check access_right, will return all permissions. False: check access_right
    private isLoadedData: boolean = false;
    public data: any = {}; //list access rights [{key: {read, new, edit, delete, export} }]

    public setData(data: any) {
        this.data = data || {};

        this.isLoadedData = true;
    }

    //return the item: {read, new, edit, delete, export}
    public getAccessRightByKey(key: string): any {
        if (!this.applyAccessRight) return this.createAccessRight(true);

        return this.data[key] || this.createAccessRight(false);
    }

    //Get AccessRight:
    //- type: used to identify type of key
    //- data: used to build key
    //There are two return values:
    //1. if right is not null -> return true or false
    //2. else return object {read, new, edit, delete, export}
    public getAccessRight(type: AccessRightTypeEnum, data: any): AccessRightModel {
        //return all permissions
        if (!this.applyAccessRight) return this.createAccessRight(true);

        let key = data['idSettingsGUIParent']
            ? 'AR__Module_' + data['idSettingsGUIParent'] + '__SubModule_' + data['idSettingsGUI']
            : 'AR__Module_' + data['idSettingsGUI'];

        switch (type) {
            case AccessRightTypeEnum.Module:
            case AccessRightTypeEnum.SubModule:
                break;
            case AccessRightTypeEnum.ParkedItem:
                key += '__ParkedItem';

                if (data['action1']) key += '__' + data['action1'];
                if (data['action2']) key += '__' + data['action2'];

                break;
            case AccessRightTypeEnum.AdditionalInfo:
                key += '__AdditionalInfo';
                break;

            case AccessRightTypeEnum.Tab:
                if (data['idSettingsGUI'] == 1) key = 'AR__Module_1__Tab';
                else key += '__Tab';

                const tabRight = this.data[key];
                if (!tabRight || !tabRight.read) return this.createAccessRight(false);

                if (data['tabID']) key += '_' + data['tabID'];
                break;
            case AccessRightTypeEnum.TabButton:
                key += '__Tab_' + data['tabID'] + '__TabButton';

                if (data['buttonName']) key += '_' + data['buttonName'];
                break;

            case AccessRightTypeEnum.Widget:
                key += '__Widget';

                const widgetRight = this.data[key];
                if (!widgetRight || !widgetRight.read) return this.createAccessRight(false);

                if (data['idRepWidgetApp']) key += '_' + data['idRepWidgetApp'];

                break;
            case AccessRightTypeEnum.WidgetMenuStatus:
                key += '__Widget_' + data['idRepWidgetApp'] + '__' + data['buttonCommand'];
                break;
            case AccessRightTypeEnum.WidgetButton:
                key += '__Widget_' + data['idRepWidgetApp'] + '__WidgetButton';

                if (data['widgetButtonName']) key += '__' + data['widgetButtonName'] + 'Button';
                break;
        }

        return this.data[key] || this.createAccessRight(false);
    }

    public createFullAccessRight() {
        return this.createAccessRight(true);
    }

    private createAccessRight(value: boolean) {
        return { read: value, new: value, edit: value, delete: value, export: value };
    }

    public checkAccessRight(module: Module) {
        if (!this.isLoadedData || !module || module.idSettingsGUI == -1 || module.moduleNameTrim == 'Base') return;

        let accessRight: AccessRightModel;

        //subModule
        if (module.idSettingsGUIParent) {
            accessRight = this.getAccessRight(AccessRightTypeEnum.SubModule, {
                idSettingsGUIParent: module.idSettingsGUIParent,
                idSettingsGUI: module.idSettingsGUI,
            });
        } else {
            //module
            accessRight = this.getAccessRight(AccessRightTypeEnum.Module, { idSettingsGUI: module.idSettingsGUI });
        }

        //if there is no accessRight
        if (!accessRight || !accessRight.read) {
            this.router.navigate([Configuration.rootPrivateUrl]);
        }
    }

    //#region Load data
    public loadUserData(): Observable<any> {
        if (!this.applyAccessRight) {
            //this.loginByUserId().subscribe();
            return of(this.data);
        }

        //if already loaded data or not login -> don't get data
        if (this.isLoadedData || Object.keys(this.data).length || !this.uti.checkLogin()) return of(this.data);

        //get User Function List
        //get default role id from cache
        return this.get<any>(this.serUrl.getUserFunctionList, {
            idLoginRoles: this.uti.getDefaultRole(),
        }).pipe(
            map((result: any) => {
                if (result.statusCode == 1 && result.item) {
                    this.setData(result.item);

                    //get user info and update cache
                    //this.loginByUserId().subscribe();
                }
                return result;
            }),
        );
    }

    public loginByUserId(): Observable<any> {
        const userLogin = this.uti.getUserInfo();
        return this.get<any>(this.serUrl.loginByUserIdUrl, { idLogin: userLogin.id })
            .pipe(
                map((result: any) => {
                    this.loginByUserIdSuccess(result.item);
                    return result.item;
                }),
            );
        //.subscribe(
        //    (data) => this.loginByUserIdSuccess(data.item), //sucess
        //    (error) => {
        //        console.log(error);
        //    },
        //);
    }
    private loginByUserIdSuccess(userAuthentication: any) {
        if (userAuthentication && userAuthentication.access_token && userAuthentication.expires_in) {
            this.uti.storeUserAuthentication(userAuthentication);

            const userInfo = this.uti.getUserInfo();
            this.userServ.setCurrentUser(userInfo);
        }
    }
    //#endregion

    //#region Set AccessRights
    public SetAccessRightsForTabSummary(module: Module, data: any) {
        if (!data || !data.length) return;

        for (let item of data) {
            if (item.tabSummaryInfor && item.tabSummaryInfor.tabID) {
                item.accessRight = this.getAccessRight(AccessRightTypeEnum.Tab, {
                    idSettingsGUIParent: module.idSettingsGUIParent,
                    idSettingsGUI: module.idSettingsGUI,
                    tabID: item.tabSummaryInfor.tabID,
                });
            }
        }
    }

    public SetAccessRightsForModule(data: any) {
        if (!data || !data.length) return;

        for (let item of data) {
            if (item.idSettingsGUI != -1) {
                item.accessRight = this.getAccessRight(AccessRightTypeEnum.Module, {
                    idSettingsGUIParent: item.idSettingsGUIParent,
                    idSettingsGUI: item.idSettingsGUI,
                });

                if (item.children && item.children.length) this.SetAccessRightsForSubModule(item.children);
            }
        }
    }

    public SetAccessRightsForSubModule(data: any) {
        if (!data || !data.length) return;

        for (let item of data) {
            if (item.idSettingsGUI != -1)
                item.accessRight = this.getAccessRight(AccessRightTypeEnum.SubModule, {
                    idSettingsGUIParent: item.idSettingsGUIParent,
                    idSettingsGUI: item.idSettingsGUI,
                });
        }
    }

    public SetAccessRightsForWidgetMenuStatus(data: any): any {
        let accessRight: any = {};
        if (!data || !data.length) return accessRight;

        for (let item of data) {
            if (item.idSettingsGUI != -1) {
                item.accessRight = this.getAccessRight(AccessRightTypeEnum.WidgetMenuStatus, item);
                accessRight[item.buttonCommand] = item.accessRight;
            }
        }
        return accessRight;
    }

    public SetAccessRightsForWidget(data: any): any {
        return this.getAccessRight(AccessRightTypeEnum.Widget, data);
    }

    public GetAccessRightsForParkedItem(module: Module): any {
        if (!module) return this.createAccessRight(false);

        //ODE
        if (module.idSettingsGUI == 7) return this.createAccessRight(true);

        return this.getAccessRight(AccessRightTypeEnum.ParkedItem, {
            idSettingsGUIParent: module.idSettingsGUIParent,
            idSettingsGUI: module.idSettingsGUI,
        });
    }

    public GetAccessRightsForModule(module: Module) {
        if (!module) return this.createAccessRight(false);

        return this.getAccessRight(AccessRightTypeEnum.Module, {
            idSettingsGUIParent: module.idSettingsGUIParent,
            idSettingsGUI: module.idSettingsGUI,
        });
    }

    public SetAccessRightsForWidgetSetting(module: Module, widgets: Array<any>) {
        if (!module || !widgets || !widgets.length) return;

        for (let item of widgets) {
            if (module.idSettingsGUI != -1) {
                if (module.idSettingsGUI == 7 || item.ignoreAccessRight)
                    item.accessRight = this.createAccessRight(true);
                else
                    item.accessRight = this.getAccessRight(AccessRightTypeEnum.Widget, {
                        idSettingsGUIParent: module.idSettingsGUIParent,
                        idSettingsGUI: module.idSettingsGUI,
                        idRepWidgetApp: item.IdRepWidgetApp,
                    });
            }
        }
    }

    public getMainTabAccessRight(module: Module) {
        if (!module) {
            return null;
        }

        let mainTabID = '';

        switch (module.idSettingsGUI) {
            case ModuleList.Campaign.idSettingsGUI:
                mainTabID = 'T1';
                break;
            default:
                mainTabID = 'MainInfo';
                break;
        }

        return this.getAccessRight(AccessRightTypeEnum.Tab, {
            idSettingsGUIParent: module.idSettingsGUIParent,
            idSettingsGUI: module.idSettingsGUI,
            tabID: mainTabID,
        });
    }
    //#endregion
}
