import { Injectable } from '@angular/core';
import { AuthenticationService, UserProfileService } from '@app/services';
import { Actions, Effect, ofType } from '@ngrx/effects';
import { Observable } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';
import { UserManagementActionNames, UserManagementActions } from './user-management.actions';

@Injectable()
export class UserManagementEffects {
    constructor(
        private actions$: Actions,
        private userManagementActions: UserManagementActions,
        private userProfileService: UserProfileService,
        private authenticationService: AuthenticationService,
    ) {}

    @Effect()
    createNewUser = this.actions$.pipe(
        ofType(UserManagementActionNames.USER_NEW_ACCOUNT),
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
        ofType(UserManagementActionNames.USER_RESENT_EMAIL_CONFIRM),
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
        ofType(UserManagementActionNames.USER_CHANGE_STATUS),
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
        ofType(UserManagementActionNames.USER_GET_LIST),
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
        ofType(UserManagementActionNames.USER_UPDATE_INFO),
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
        ofType(UserManagementActionNames.USER_UPDATE_PROFILE),
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
        ofType(UserManagementActionNames.USER_GET_BY_IDLOGIN),
        switchMap((action: any) => {
            return this.userProfileService.getUserById(action.payload).pipe(
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
