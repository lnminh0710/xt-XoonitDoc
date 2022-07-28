import { Injectable } from '@angular/core';
import { UserFilterModel, UserInfo, UserProfile, UserSignUp } from '@app/models';
import { CustomAction } from '@app/state-management/store/actions';

export enum UserV2ActionNames {
    USER_MANAGEMENT_SUCCESS_ACTION = '[USER MANAGEMENT V2] Success Action',
    USER_MANAGEMENT_FAILED_ACTION = '[USER MANAGEMENT V2] Failed Action',
    USER_NEW_ACCOUNT = '[USER MANAGEMENT V2] Create New User',
    USER_RESENT_EMAIL_CONFIRM = '[USER MANAGEMENT V2] Resent email confirm for user',
    USER_GET_LIST = '[USER MANAGEMENT V2] Get list user',
    USER_CHANGE_STATUS = '[USER MANAGEMENT V2] Change Statsus User',
    USER_UPDATE_INFO = '[USER MANAGEMENT V2] Update user info',
    USER_UPDATE_PROFILE = '[USER MANAGEMENT V2] Update user profile',
    USER_GET_BY_IDLOGIN = '[USER MANAGEMENT V2] Get user by IdLogin',
    USER_GROUP_GET_LIST = '[USER MANAGEMENT V2] Get user group',
    USER_GROUP_DETAIL_GET_BY_ID = '[USER MANAGEMENT V2] Get user group by Id',
    USER_GROUP_UPDATE_BY_ID = '[USER MANAGEMENT V2] Update user group',
    USER_UPDATE_PERMISSION_ASSIGN = '[USER MANAGEMENT V2] Update user permission assign',
}

@Injectable()
export class UserV2Actions {
    /**
     * ACTION USER CUSTOM
     */
    public createNewUserAction(user: UserSignUp): any {
        return {
            type: UserV2ActionNames.USER_NEW_ACCOUNT,
            payload: user,
        };
    }

    public resentEmailConfirmToUserAction(idLogin: string): any {
        return {
            type: UserV2ActionNames.USER_RESENT_EMAIL_CONFIRM,
            payload: idLogin,
        };
    }

    public changeStatusUserAction(user: UserInfo): any {
        return {
            type: UserV2ActionNames.USER_CHANGE_STATUS,
            payload: user,
        };
    }

    public getListUserAction(filters: UserFilterModel): any {
        return {
            type: UserV2ActionNames.USER_GET_LIST,
            payload: filters,
        };
    }

    public updateUserAction(user: any): any {
        return {
            type: UserV2ActionNames.USER_UPDATE_INFO,
            payload: user,
        };
    }

    public updateUserProfileAction(user: UserProfile): any {
        return {
            type: UserV2ActionNames.USER_UPDATE_PROFILE,
            payload: user,
        };
    }

    public getUserByIdLoginAction(payload: any): any {
        return {
            type: UserV2ActionNames.USER_GET_BY_IDLOGIN,
            payload,
        };
    }

    public getAllUserGroupAction(): any {
        return {
            type: UserV2ActionNames.USER_GROUP_GET_LIST,
        };
    }

    public getUserGroupByIdAction(idGroup: string): any {
        return {
            type: UserV2ActionNames.USER_GROUP_DETAIL_GET_BY_ID,
            payload: idGroup,
        };
    }

    public updateUserGroupByIdAction(payload: any): any {
        return {
            type: UserV2ActionNames.USER_GROUP_UPDATE_BY_ID,
            payload,
        };
    }

    public updateUserPermissionAssignAction(payload: any): any {
        return {
            type: UserV2ActionNames.USER_UPDATE_PERMISSION_ASSIGN,
            payload,
        };
    }

    /**
     * ACTION DEFAULT
     */
    public userManagementSuccessAction(actionType: string, payload: any): UserManagementSuccessAction {
        return {
            type: UserV2ActionNames.USER_MANAGEMENT_SUCCESS_ACTION,
            subType: actionType,
            payload: payload,
        };
    }

    public userManagementFailedAction(actionType: string, payload: any): UserManagementFailedAction {
        return {
            type: UserV2ActionNames.USER_MANAGEMENT_FAILED_ACTION,
            subType: actionType,
            payload: payload,
        };
    }
}

export class UserManagementSuccessAction implements CustomAction {
    public type = UserV2ActionNames.USER_MANAGEMENT_SUCCESS_ACTION;

    constructor(public subType: string, public payload?: any) {}
}

export class UserManagementFailedAction implements CustomAction {
    public type = UserV2ActionNames.USER_MANAGEMENT_FAILED_ACTION;

    constructor(public subType: string, public payload?: any) {}
}
