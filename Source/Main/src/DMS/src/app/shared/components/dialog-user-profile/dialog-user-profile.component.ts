import { Component, OnInit, OnDestroy, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { AuthenticationService, UserService } from '@app/services';
import { ToasterService } from 'angular2-toaster/angular2-toaster';
import { ReducerManagerDispatcher, Store } from '@ngrx/store';
import { AppState } from '@app/state-management/store';
import { BaseComponent, ModuleList } from '@app/pages/private/base';
import { Router } from '@angular/router';

import { MatDialogRef } from '@xn-control/light-material-ui/dialog';
import { filter, takeUntil } from 'rxjs/operators';
import { CustomAction, ModuleActions } from '@app/state-management/store/actions';
import { AppActionNames, UpdateUserProfileAction } from '@app/state-management/store/actions/app/app.actions';
import { User, UserProfile } from '@app/models';
import { ControlData } from '@app/models/control-model/control-data';
import { AbstractControl, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Uti, XnErrorMessageHelper } from '@app/utilities';
import { ErrorMessageTypeEnum, MessageModal } from '@app/app.constants';
import {
    UserManagementActionNames,
    UserManagementActions,
} from '@app/pages/user-management/user-management.statemanagement/user-management.actions';
import { UserManagementSelectors } from '@app/pages/user-management/user-management.statemanagement/user-management.selectors';
@Component({
    selector: 'dialog-user-profile',
    templateUrl: './dialog-user-profile.component.html',
    styleUrls: ['./dialog-user-profile.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DialogUserProfileComponent extends BaseComponent implements OnInit, OnDestroy {
    public currentUserEmail = '';
    public profileImageUrl: string = '';

    public dataFields = {
        FIRST_NAME: <ControlData>{ controlName: 'firstName', displayName: 'First Name', order: 1 },
        LAST_NAME: <ControlData>{ controlName: 'lastName', displayName: 'Last Name', order: 2 },
        EMAIL: <ControlData>{ controlName: 'email', displayName: 'Email', order: 3 },
        PHONE_NUMBER: <ControlData>{ controlName: 'phoneNr', displayName: 'Phone', order: 4 },
        BIRTHDAY: <ControlData>{ controlName: 'dateOfBirth', displayName: 'Birthday', order: 5 },
    };

    public controlDataList: ControlData[] = [
        this.dataFields.FIRST_NAME,
        this.dataFields.LAST_NAME,
        this.dataFields.PHONE_NUMBER,
        this.dataFields.BIRTHDAY,
    ];

    public userForm: FormGroup;
    public isView = true;

    public ERR_MES_TYPE_ENUM = ErrorMessageTypeEnum;
    public isLoading = false;
    constructor(
        protected router: Router,
        private store: Store<AppState>,
        private reducerMgrDispatcher: ReducerManagerDispatcher,
        private fb: FormBuilder,
        public xnErrorMessageHelper: XnErrorMessageHelper,
        private moduleActions: ModuleActions,
        private userService: UserService,
        private cdRef: ChangeDetectorRef,
        private dialogRef: MatDialogRef<DialogUserProfileComponent>,
        protected userManagementActions: UserManagementActions,
        protected userManagementSelectors: UserManagementSelectors,
        private toastrService: ToasterService,
        private authenticationService: AuthenticationService,
    ) {
        super(router);
        dialogRef.disableClose = true;
    }

    public ngOnInit() {
        this.initForm();
        this.onSubscrition();
    }

    ngOnDestroy(): void {
        super.onDestroy();
    }

    private onSubscrition() {
        this.reducerMgrDispatcher
            .pipe(
                filter((action: CustomAction) => action.type === AppActionNames.APP_UPDATE_USER_PROFILE),
                takeUntil(this.getUnsubscriberNotifier()),
            )
            .subscribe((action: CustomAction) => {
                const payload = <User>action.payload;
                this.setAvatar(payload.loginPicture);
                this.cdRef.detectChanges();
            });

        this.userManagementSelectors
            .actionSuccessOfSubtype$(UserManagementActionNames.USER_UPDATE_PROFILE)
            .takeUntil(this.getUnsubscriberNotifier())
            .subscribe(
                (action: CustomAction) => {
                    this.isLoading = false;
                    this.cdRef.detectChanges();

                    if (!action || (action && !action.payload)) return;

                    const data = action.payload.item;
                    if (!data) {
                        this.toastrService.pop(MessageModal.MessageType.error, 'System', `Update fail!`);
                        return;
                    }

                    if (data.returnID == -1) {
                        this.toastrService.pop(MessageModal.MessageType.error, 'System', data.userErrorMessage);
                        return;
                    }

                    const userInfoNew = this.userForm.value as UserProfile;
                    const currentUser = this.userService.getCurrentUser();
                    currentUser.firstname = userInfoNew.firstName;
                    currentUser.lastname = userInfoNew.lastName;
                    currentUser.phoneNr = userInfoNew.phoneNr;
                    currentUser.dateOfBirth = Uti.parseDateToString(userInfoNew.dateOfBirth);

                    this.userService.setCurrentUser(currentUser);
                    this.store.dispatch(new UpdateUserProfileAction(currentUser));

                    this.toastrService.pop(MessageModal.MessageType.success, 'System', data.userErrorMessage);
                    this.close();
                },
                (error) => {
                    this.toastrService.pop(MessageModal.MessageType.error, 'System', `System Error!`);
                },
            );
    }
    private setAvatar(avatarUrl) {
        const currentUser = this.userService.getCurrentUser();
        if (avatarUrl.includes('mode=Profile')) {
            this.authenticationService.checkAvatarUrlValid(avatarUrl).subscribe(
                (res: any) => {
                    if (!res) {
                        this.profileImageUrl = currentUser.avatarDefault;
                        this.cdRef.detectChanges();
                    }

                    this.profileImageUrl = avatarUrl;
                    this.cdRef.detectChanges();
                },
                (err: any) => {
                    this.profileImageUrl = currentUser.avatarDefault;
                    this.cdRef.detectChanges();
                },
            );
        } else {
            this.profileImageUrl = avatarUrl;
        }
    }

    private initForm() {
        const currentUser = this.userService.getCurrentUser();
        const birthDate = currentUser.dateOfBirth ? Uti.convertUTCTime(currentUser.dateOfBirth, 'dd.MM.yyyy') : '';

        this.userForm = this.fb.group({
            [this.dataFields.FIRST_NAME.controlName]: [
                { value: currentUser.firstname || '', disabled: this.isView },
                [Validators.required],
            ],
            [this.dataFields.LAST_NAME.controlName]: [
                { value: currentUser.lastname || '', disabled: this.isView },
                [Validators.required],
            ],
            [this.dataFields.PHONE_NUMBER.controlName]: [
                { value: currentUser.phoneNr || '', disabled: this.isView },
                [],
            ],
            [this.dataFields.BIRTHDAY.controlName]: [{ value: birthDate, disabled: this.isView }, []],
        });

        this.currentUserEmail = currentUser.email;
        this.cdRef.detectChanges();
    }

    public changePassword() {
        this.close();
        this.store.dispatch(this.moduleActions.requestChangeModule(ModuleList.ChangePassword));
        this.store.dispatch(
            this.moduleActions.requestToChangeActiveModuleName({
                activeModule: ModuleList.ChangePassword,
                moduleName: 'change password',
            }),
        );
    }

    public onEdit() {
        (this.userForm.controls[this.dataFields.FIRST_NAME.controlName] as AbstractControl).enable();
        (this.userForm.controls[this.dataFields.LAST_NAME.controlName] as AbstractControl).enable();
        (this.userForm.controls[this.dataFields.PHONE_NUMBER.controlName] as AbstractControl).enable();
        (this.userForm.controls[this.dataFields.BIRTHDAY.controlName] as AbstractControl).enable();
        this.isView = false;
        this.cdRef.detectChanges();
    }

    public submit() {
        if (!this.userForm.valid) return;
        const user = this.userForm.value as UserProfile;
        user.dateOfBirth = Uti.parseDateToString(user.dateOfBirth, true);
        this.store.dispatch(this.userManagementActions.updateUserProfileAction(user));
    }

    public close() {
        this.dialogRef.close();
    }
}
