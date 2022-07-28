import { Injectable } from '@angular/core';
import { AuthenticationService, UserProfileService } from '@app/services';
import { Actions, Effect, ofType } from '@ngrx/effects';
import { Observable } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';
import { UserV2ActionNames, UserV2Actions } from './user-v2.actions';

@Injectable()
export class UserV2Effects {
    constructor(
        private actions$: Actions,
        private userManagementActions: UserV2Actions,
        private userProfileService: UserProfileService,
        private authenticationService: AuthenticationService,
    ) {}

    @Effect()
    createNewUser = this.actions$.pipe(
        ofType(UserV2ActionNames.USER_NEW_ACCOUNT),
        switchMap((action: any) => {
            return this.authenticationService.newUser(action.payload).pipe(
                map((data: any[]) => {
                    return this.userManagementActions.userManagementSuccessAction(action.type, data);
                }),
                catchError((err) =>
                    Observable.of(this.userManagementActions.userManagementFailedAction(action.type, err)),
                ),
            );
        }),
    );

    @Effect()
    resentEmailConfirm = this.actions$.pipe(
        ofType(UserV2ActionNames.USER_RESENT_EMAIL_CONFIRM),
        switchMap((action: any) => {
            return this.userProfileService.resendActivateEmail(action.payload).pipe(
                map((data: any[]) => {
                    return this.userManagementActions.userManagementSuccessAction(action.type, data);
                }),
                catchError((err) =>
                    Observable.of(this.userManagementActions.userManagementFailedAction(action.type, err)),
                ),
            );
        }),
    );

    @Effect()
    changeStatusUser = this.actions$.pipe(
        ofType(UserV2ActionNames.USER_CHANGE_STATUS),
        switchMap((action: any) => {
            return this.userProfileService.changeStatusUser(action.payload).pipe(
                map((data: any[]) => {
                    return this.userManagementActions.userManagementSuccessAction(action.type, data);
                }),
                catchError((err) =>
                    Observable.of(this.userManagementActions.userManagementFailedAction(action.type, err)),
                ),
            );
        }),
    );

    @Effect()
    getListUserManagement = this.actions$.pipe(
        ofType(UserV2ActionNames.USER_GET_LIST),
        switchMap((action: any) => {
            return this.userProfileService.listAllUserByCurrentUser(action.payload).pipe(
                map((data: any[]) => {
                    return this.userManagementActions.userManagementSuccessAction(action.type, data);
                }),
                catchError((err) =>
                    Observable.of(this.userManagementActions.userManagementFailedAction(action.type, err)),
                ),
            );
        }),
    );

    @Effect()
    updateUserInfo = this.actions$.pipe(
        ofType(UserV2ActionNames.USER_UPDATE_INFO),
        switchMap((action: any) => {
            return this.userProfileService.updateUserInfo(action.payload).pipe(
                map((data: any[]) => {
                    return this.userManagementActions.userManagementSuccessAction(action.type, data);
                }),
                catchError((err) =>
                    Observable.of(this.userManagementActions.userManagementFailedAction(action.type, err)),
                ),
            );
        }),
    );

    @Effect()
    updateUserProfile = this.actions$.pipe(
        ofType(UserV2ActionNames.USER_UPDATE_PROFILE),
        switchMap((action: any) => {
            return this.userProfileService.updateUserProfile(action.payload).pipe(
                map((data: any[]) => {
                    return this.userManagementActions.userManagementSuccessAction(action.type, data);
                }),
                catchError((err) =>
                    Observable.of(this.userManagementActions.userManagementFailedAction(action.type, err)),
                ),
            );
        }),
    );

    @Effect()
    getUserByIdLogin = this.actions$.pipe(
        ofType(UserV2ActionNames.USER_GET_BY_IDLOGIN),
        switchMap((action: any) => {
            return this.userProfileService.getUserPermissionById(action.payload).pipe(
                map((data: any[]) => {
                    return this.userManagementActions.userManagementSuccessAction(action.type, data);
                }),
                catchError((err) =>
                    Observable.of(this.userManagementActions.userManagementFailedAction(action.type, err)),
                ),
            );
        }),
    );

    @Effect()
    getUserGroup = this.actions$.pipe(
        ofType(UserV2ActionNames.USER_GROUP_GET_LIST),
        switchMap((action: any) => {
            return this.userProfileService.getAllUserGroup().pipe(
                map((data: any[]) => {
                    return this.userManagementActions.userManagementSuccessAction(action.type, data);
                }),
                catchError((err) =>
                    Observable.of(this.userManagementActions.userManagementFailedAction(action.type, err)),
                ),
            );
        }),
    );

    @Effect()
    getUserGroupDetailById = this.actions$.pipe(
        ofType(UserV2ActionNames.USER_GROUP_DETAIL_GET_BY_ID),
        switchMap((action: any) => {
            return this.userProfileService.getUserGroupById(action.payload).pipe(
                map((data: any[]) => {
                    return this.userManagementActions.userManagementSuccessAction(action.type, data);
                }),
                catchError((err) =>
                    Observable.of(this.userManagementActions.userManagementFailedAction(action.type, err)),
                ),
            );
        }),
    );

    @Effect()
    updateUserGroupById = this.actions$.pipe(
        ofType(UserV2ActionNames.USER_GROUP_UPDATE_BY_ID),
        switchMap((action: any) => {
            return this.userProfileService.updateUserGroup(action.payload).pipe(
                map((data: any[]) => {
                    return this.userManagementActions.userManagementSuccessAction(action.type, data);
                }),
                catchError((err) =>
                    Observable.of(this.userManagementActions.userManagementFailedAction(action.type, err)),
                ),
            );
        }),
    );

    @Effect()
    updateUserPermission = this.actions$.pipe(
        ofType(UserV2ActionNames.USER_UPDATE_PERMISSION_ASSIGN),
        switchMap((action: any) => {
            return this.userProfileService.updateUserPermission(action.payload).pipe(
                map((data: any[]) => {
                    return this.userManagementActions.userManagementSuccessAction(action.type, data);
                }),
                catchError((err) =>
                    Observable.of(this.userManagementActions.userManagementFailedAction(action.type, err)),
                ),
            );
        }),
    );
}
