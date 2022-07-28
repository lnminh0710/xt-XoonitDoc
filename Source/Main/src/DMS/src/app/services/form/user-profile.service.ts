import { Injectable, Injector, Inject, forwardRef } from '@angular/core';
import { Observable, of } from 'rxjs';
import { BaseService } from '../base.service';
import { Uti } from '@app/utilities';
import { UserFilterModel, UserInfo, UserProfile, WidgetDetail } from '@app/models';
import { LoadingService, ModalService, WidgetTemplateSettingService } from '@app/services';
import { map } from 'rxjs/operators';
import { HttpHeaders } from '@angular/common/http';

@Injectable()
export class UserProfileService extends BaseService {
    constructor(
        injector: Injector,
        @Inject(forwardRef(() => WidgetTemplateSettingService))
        private widgetTemplateSettingService: WidgetTemplateSettingService,
        @Inject(forwardRef(() => LoadingService)) protected loadingService: LoadingService,
        @Inject(forwardRef(() => ModalService)) protected modalService: ModalService,
    ) {
        super(injector);
    }

    public getUserById(idPerson?: number): Observable<any> {
        return this.get<any>(this.serUrl.getUserById, {
            idPerson: idPerson,
        });
    }

    public getAllUserRole(): Observable<any> {
        return this.get<any>(this.serUrl.getAllUserRole);
    }

    public listUserRoleByUserId(userId?): Observable<any> {
        return this.get<any>(this.serUrl.listUserRoleByUserId, {
            userId: userId,
        });
    }

    public listUserRoleInclueUserId(idPerson?: number): Observable<any> {
        return this.get<any>(this.serUrl.listUserRoleInclueUserId, {
            idPerson: idPerson,
        });
    }

    public checkExistUserByField(fieldName: string, fieldValue: string): Observable<any> {
        fieldValue = fieldValue ? fieldValue.trim() : '';
        if (fieldValue) {
            return this.get<any>(this.serUrl.checkExistUserByField, {
                fieldName: fieldName,
                fieldValue: fieldValue,
            }).pipe(
                map((res: any) => {
                    return res.item.data.length > 1 ? { exists: true } : null;
                }),
            );
        } else {
            return of(null);
        }
    }

    public checkExistUserByFieldInEdit(fieldName: string, fieldValue: string): Observable<any> {
        fieldValue = fieldValue ? fieldValue.trim() : '';
        if (fieldValue) {
            return this.get<any>(this.serUrl.checkExistUserByField, {
                fieldName: fieldName,
                fieldValue: fieldValue,
            }).pipe(
                map((res: any) => {
                    if (res.item.data.length <= 1) {
                        return null;
                    }
                    let item = Uti.getItemFromArrayByProperty(res.item.data[1], fieldName, fieldValue);
                    return item && item.Value === fieldValue ? null : { exists: true };
                }),
            );
        } else {
            return of(null);
        }
    }

    public saveUserProfile(data: any): Observable<any> {
        return this.post<any>(this.serUrl.saveUserProfile, JSON.stringify(data));
    }

    public saveRolesForUser(roles, isSetDefaultRole?: any): Observable<any> {
        let rolesObject = [];
        if (roles.length) {
            rolesObject = roles.map((role) => {
                return {
                    IdLoginRolesLoginGw: role.IdLoginRolesLoginGw,
                    IdLoginRoles: role.IdLoginRoles,
                    IsDefault: role.IsDefault,
                    IdLogin: role.IdLogin,
                };
            });
        }
        const data = {
            Roles: rolesObject,
            IsSetDefaultRole: isSetDefaultRole,
        };
        return this.post<any>(this.serUrl.saveRoleForUser, JSON.stringify(data));
    }

    public getUserList(): Observable<any> {
        const requestData = {
            MethodName: 'SpAppWg002UserList',
            CrudType: 'Read',
            Object: 'GetUserList',
            Mode: null,
            WidgetTitle: 'Begin new World...',
            IsDisplayHiddenFieldWithMsg: '1',
            LoginInformation: '',
            InputParameter: '',
        };
        const request = {
            Request: {
                ModuleName: 'GlobalModule',
                ServiceName: 'GlobalService',
                Data: JSON.stringify(requestData),
            },
        };

        let widgetDetail: any = {
            id: Uti.guid(), //'201ea1c5-a7d7-a9f3-7889-90b2b29a1f58'
            idRepWidgetApp: 104,
            idRepWidgetType: 3,
            moduleName: 'System Management',
            request: JSON.stringify(request),
            title: 'User List',
        };

        return this.widgetTemplateSettingService.getWidgetDetailByRequestString(widgetDetail, null);
    }

    public saveUserWidgetLayout(userId: any, idSettingsGUI: any, isResetDefault?: string): Observable<any> {
        let saveData = {
            IdMember: userId,
            ObjectNr: idSettingsGUI,
            IsResetDefault: isResetDefault,
        };

        return this.post<any>(this.serUrl.saveUserWidgetLayout, JSON.stringify(saveData));
    }

    public getUserFunctionList(idLoginRoles): Observable<any> {
        return this.get<any>(this.serUrl.getUserFunctionList, {
            idLoginRoles: idLoginRoles,
        });
    }

    public assignRoleToMultipleUser(idLogins, idLoginRoles): Observable<any> {
        return this.post<any>(this.serUrl.assignRoleToMultipleUser, null, {
            idLogins: idLogins,
            idLoginRoles: idLoginRoles,
        });
    }

    public uploadAvatar(formData: FormData): Observable<any> {
        const _options = {
            headers: new HttpHeaders({
                Accept: 'application/json',
            }),
            observe: 'response',
            responseType: 'json',
        };
        return this.upload<any>(this.serUrl.uploadAvatar, formData, null, _options);
    }

    public removeAvatar(): Observable<any> {
        return this.post<any>(this.serUrl.removeAvatar);
    }

    public getFilterOptionsUser(): Observable<any> {
        return this.get<any>(this.serUrl.getFilterOptionsUser).map((result: any) => {
            return result.item;
        });
    }

    public resendActivateEmail(idLogin: string): Observable<any> {
        return this.post<any>(
            this.serUrl.resendActivateEmailUrl,
            JSON.stringify({ idLogin, currentDateTime: new Date().toLocaleString() }),
        ).map((result: any) => {
            return result.item;
        });
    }

    public changeStatusUser(user: UserInfo): Observable<any> {
        user.currentDateTime = new Date().toLocaleString();
        return this.post<any>(this.serUrl.changeStatusUserUrl, JSON.stringify(user)).map((result: any) => {
            return result.item;
        });
    }

    public listAllUserByCurrentUser(userFilter: UserFilterModel): Observable<any> {
        return this.get<any>(this.serUrl.getUsersByIdLogin, userFilter).map((result: any) => {
            return result.item;
        });
    }

    public updateUserInfo(user: any): Observable<any> {
        return this.post<any>(this.serUrl.changeProfileOtherUser, user);
    }

    public updateUserProfile(user: UserProfile): Observable<any> {
        return this.post<any>(this.serUrl.editUserProfile, user);
    }

    public getAllUsers(): Observable<any> {
        return this.get<any>(this.serUrl.getAllUsers);
    }

    public getAllRoleGroups(): Observable<any> {
        return this.get<any>(this.serUrl.getAllRoleGroups);
    }
    public getAllPermissions(): Observable<any> {
        return this.get<any>(this.serUrl.getAllPermissions);
    }

    public getAllRoles(): Observable<any> {
        return this.get<any>(this.serUrl.getAllRoles);
    }

    public getRoleGroupDetail(idRoleGroup: string | number) {
        return this.get<any>(this.serUrl.getRoleGroupsDetail, {
            IdLoginGroupRole: idRoleGroup,
        });
    }

    public getAllUserGroup(): Observable<any> {
        return this.get<any>(this.serUrl.getAllUserGroup);
    }

    public getUserGroupById(idGroup: string): Observable<any> {
        return this.get<any>(this.serUrl.getUserGroupById, { IdLoginGroup: idGroup });
    }

    public updateUserGroup(data: string): Observable<any> {
        return this.post<any>(this.serUrl.getAllUserGroup, data);
    }

    public getRoleById(idRole: string): Observable<any> {
        return this.get<any>(this.serUrl.getRoleById, { IdLoginRoles: idRole });
    }

    public getPermissionByListRole(RoleList: string): Observable<any> {
        return this.get<any>(this.serUrl.getPermissionByListRole, { RoleList });
    }

    public updateRole(data): Observable<any> {
        return this.post<any>(this.serUrl.getAllRoles, data);
    }

    public updateRoleGroup(data): Observable<any> {
        return this.post<any>(this.serUrl.getAllRoleGroups, data);
    }

    public getAllUserAndGroups(): Observable<any> {
        return this.get<any>(this.serUrl.getAllUserAndGroups);
    }

    public getUserPermissionById(data): Observable<any> {
        return this.get<any>(this.serUrl.getUserPermissions, data);
    }

    public updateUserPermission(data): Observable<any> {
        return this.post<any>(this.serUrl.getUserPermissions, data);
    }

    public updateForceActive(id): Observable<any> {
        return this.post<any>(this.serUrl.forceActiveUser + id);
    }

    public resetPassUser(data: any): Observable<any> {
        return this.post<any>(this.serUrl.resetPassUser, JSON.stringify(data));
    }
}
