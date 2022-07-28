import { Injectable } from '@angular/core';
import { UserFilterModel, UserInfo, UserProfile, UserSignUp } from '@app/models';
import { CustomAction } from '@app/state-management/store/actions';

export enum UserManagementActionNames {
    USER_MANAGEMENT_SUCCESS_ACTION = '[USER MANAGEMENT] Success Action',
    USER_MANAGEMENT_FAILED_ACTION = '[USER MANAGEMENT] Failed Action',
    USER_NEW_ACCOUNT = '[USER MANAGEMENT] Create New User',
    USER_RESENT_EMAIL_CONFIRM = '[USER MANAGEMENT] Resent email confirm for user',
    USER_GET_LIST = '[USER MANAGEMENT] Get list user',
    USER_CHANGE_STATUS = '[USER MANAGEMENT] Change Statsus User',
    USER_UPDATE_INFO = '[USER MANAGEMENT] Update user info',
    USER_UPDATE_PROFILE = '[USER MANAGEMENT] Update user profile',
    USER_GET_BY_IDLOGIN = '[USER MANAGEMENT] Get user by IdLogin',
}

@Injectable()
export class UserManagementActions {
    /**
     * ACTION USER CUSTOM
     */
    public createNewUserAction(user: UserSignUp): any {
        return {
            type: UserManagementActionNames.USER_NEW_ACCOUNT,
            payload: user,
        };
    }

    public resentEmailConfirmToUserAction(idLogin: string): any {
        return {
            type: UserManagementActionNames.USER_RESENT_EMAIL_CONFIRM,
            payload: idLogin,
        };
    }

    public changeStatusUserAction(user: UserInfo): any {
        return {
            type: UserManagementActionNames.USER_CHANGE_STATUS,
            payload: user,
        };
    }

    public getListUserAction(filters: UserFilterModel): any {
        return {
            type: UserManagementActionNames.USER_GET_LIST,
            payload: filters,
        };
    }

    public updateUserAction(user: any): any {
        return {
            type: UserManagementActionNames.USER_UPDATE_INFO,
            payload: user,
        };
    }

    public updateUserProfileAction(user: UserProfile): any {
        return {
            type: UserManagementActionNames.USER_UPDATE_PROFILE,
            payload: user,
        };
    }

    public getUserByIdLoginAction(idLogin: string): any {
        return {
            type: UserManagementActionNames.USER_GET_BY_IDLOGIN,
            payload: idLogin,
        };
    }

    /**
     * ACTION DEFAULT
     */
    public userManagementSuccessAction(actionType: string, payload: any): UserManagementSuccessAction {
        return {
            type: UserManagementActionNames.USER_MANAGEMENT_SUCCESS_ACTION,
            subType: actionType,
            payload: payload,
        };
    }

    public userManagementFailedAction(actionType: string, payload: any): UserManagementFailedAction {
        return {
            type: UserManagementActionNames.USER_MANAGEMENT_FAILED_ACTION,
            subType: actionType,
            payload: payload,
        };
    }
}

export class UserManagementSuccessAction implements CustomAction {
    public type = UserManagementActionNames.USER_MANAGEMENT_SUCCESS_ACTION;

    constructor(public subType: string, public payload?: any) {}
}

export class UserManagementFailedAction implements CustomAction {
    public type = UserManagementActionNames.USER_MANAGEMENT_FAILED_ACTION;

    constructor(public subType: string, public payload?: any) {}
}
