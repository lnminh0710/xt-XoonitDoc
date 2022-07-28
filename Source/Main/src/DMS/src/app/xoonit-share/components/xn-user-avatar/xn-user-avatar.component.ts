import {
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    ElementRef,
    Input,
    OnDestroy,
    OnInit,
    ViewChild,
} from '@angular/core';
import { Router } from '@angular/router';
import { MessageModal } from '@app/app.constants';
import { User } from '@app/models';
import { BaseComponent } from '@app/pages/private/base';
import { AppErrorHandler, AuthenticationService, UserProfileService, UserService } from '@app/services';
import { AppState } from '@app/state-management/store';
import { UpdateUserProfileAction } from '@app/state-management/store/actions/app/app.actions';
import { Store } from '@ngrx/store';
import { ToasterService } from 'angular2-toaster';
import { takeUntil } from 'rxjs/operators';
import { Uti } from '../../../utilities';

@Component({
    selector: 'xn-user-avatar',
    templateUrl: './xn-user-avatar.component.html',
    styleUrls: ['./xn-user-avatar.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class XnUserAvatarComponent extends BaseComponent implements OnInit, OnDestroy {
    @ViewChild('uploadAvatar') inputUploadAvatar: ElementRef;

    public isLoading = false;
    @Input() profileImageUrl: string = '';
    public currentUser: User = new User();
    public isDefaultImage: boolean;

    constructor(
        protected router: Router,
        private toasterService: ToasterService,
        private userProfileService: UserProfileService,
        private cdRef: ChangeDetectorRef,
        private userService: UserService,
        private appErrorHandler: AppErrorHandler,
        private store: Store<AppState>,
        private authenticationService: AuthenticationService,
    ) {
        super(router);
    }

    ngOnInit(): void {
        this.currentUser = this.userService.getCurrentUser();
        if (this.currentUser) this.setAvatar(this.currentUser.loginPicture);
    }
    ngOnDestroy(): void {
        super.onDestroy();
    }

    private setAvatar(avatarUrl) {
        if (avatarUrl.includes('mode=Profile')) {
            this.authenticationService.checkAvatarUrlValid(avatarUrl).subscribe(
                (res: any) => {
                    if (!res) {
                        this.profileImageUrl = this.currentUser.avatarDefault;
                        this.isDefaultImage = true;
                        this.cdRef.detectChanges();
                    }

                    this.isDefaultImage = false;
                    this.profileImageUrl = avatarUrl;
                    this.cdRef.detectChanges();
                },
                (err: any) => {
                    this.profileImageUrl = this.currentUser.avatarDefault;
                    this.isDefaultImage = true;
                    this.cdRef.detectChanges();
                },
            );
        } else {
            this.profileImageUrl = avatarUrl;
        }
    }
    public onFileChanged(event) {
        const file = event.target.files[0];
        if (!file || !file.name) return;

        if (!'image/png, image/jpeg, image/jpg'.includes(file.type.toLocaleLowerCase())) {
            this.toasterService.pop('error', 'Error', 'File upload must be PNG, JPEG/JPG.');
            return;
        }
        if (file.size > 5 * 1024 * 1024) {
            this.toasterService.pop('error', 'Error', 'File upload has size larger 5MB.');
            return;
        }

        this.isLoading = true;
        const formData: FormData = new FormData();
        formData.append('file', file, file.name);

        this.userProfileService
            .uploadAvatar(formData)
            .pipe(takeUntil(this.getUnsubscriberNotifier()))
            .subscribe(
                (res) => {
                    this.appErrorHandler.executeAction(() => {
                        this.inputUploadAvatar.nativeElement.value = '';
                        this.isLoading = false;
                        this.cdRef.detectChanges();
                        if (!res || res.statusCode !== 1 || !res.item) {
                            return null;
                        }

                        if (res.item.returnID == 0) {
                            this.toasterService.pop(
                                MessageModal.MessageType.error,
                                'Failed',
                                res.item.userErrorMessage,
                            );
                            return null;
                        }

                        this.currentUser.loginPicture = res.item.loginPicture;
                        this.profileImageUrl = res.item.loginPicture;
                        this.userService.setCurrentUser(this.currentUser);
                        this.store.dispatch(new UpdateUserProfileAction(this.currentUser));
                        this.isDefaultImage = false;
                        this.cdRef.detectChanges();
                        this.toasterService.pop(
                            MessageModal.MessageType.success,
                            'Success',
                            'Upload avatar successfully',
                        );
                    });
                },
                (error) => {
                    this.inputUploadAvatar.nativeElement.value = '';
                    this.isLoading = false;
                    this.cdRef.detectChanges();
                    this.toasterService.pop(MessageModal.MessageType.success, 'Failed', 'Upload avatar fail');
                },
            );
    }

    public removeAvatar(event: MouseEvent) {
        this.preventClose(event);
        this.isLoading = true;

        this.userProfileService
            .removeAvatar()
            .pipe(takeUntil(this.getUnsubscriberNotifier()))
            .subscribe(
                (res) => {
                    this.appErrorHandler.executeAction(() => {
                        this.isLoading = false;
                        this.cdRef.detectChanges();
                        if (!res || res.statusCode !== 1 || !res.item) {
                            this.toasterService.pop(MessageModal.MessageType.error, 'Failed', 'Remove avatar fail.');
                            return null;
                        }

                        this.currentUser.loginPicture = '';
                        this.profileImageUrl = res.item.loginPicture;
                        this.userService.setCurrentUser(this.currentUser);
                        this.store.dispatch(new UpdateUserProfileAction(this.currentUser));
                        this.isDefaultImage = true;
                        this.cdRef.detectChanges();
                        this.toasterService.pop(
                            MessageModal.MessageType.success,
                            'Success',
                            'Remove avatar successfully',
                        );
                    });
                },
                (error) => {
                    this.isLoading = false;
                    this.cdRef.detectChanges();
                    this.toasterService.pop(MessageModal.MessageType.success, 'Failed', 'Remove avatar fail');
                },
            );
    }

    public preventClose(event: MouseEvent) {
        event.stopImmediatePropagation();
    }
}
