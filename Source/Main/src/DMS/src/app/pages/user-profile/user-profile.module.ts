import { NgModule } from '@angular/core';
import { UserProfileComponent } from './user-profile.component';
import { AngularSplitModule } from 'angular-split';
import { PerfectScrollbarModule } from 'ngx-perfect-scrollbar';
import { RouterModule } from '@angular/router';
import { userProfileRoutes } from './user-profile.routing';
import { ChangePasswordManagementComponent } from './components/change-password-management/change-password-management.component';
import { ModalModule } from 'ngx-bootstrap/modal';
import { XnSharedModule } from '@app/shared';
import { GlobalSearchModule } from '@app/shared/components/global-search/global-search.module';
import { MatFormFieldModule } from '@xn-control/light-material-ui/form-field';
import { XnErrorMessageModule } from '@app/xoonit-share/components/xn-error-message/xn-error-message.module';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import * as primengModule from 'primeng/primeng';
import { MatInput, MatInputModule } from '@xn-control/light-material-ui/input';

@NgModule({
    declarations: [UserProfileComponent, ChangePasswordManagementComponent],
    imports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        AngularSplitModule,
        PerfectScrollbarModule,
        ModalModule,
        RouterModule.forChild(userProfileRoutes),
        XnSharedModule,
        GlobalSearchModule,
        MatFormFieldModule,
        MatInputModule,
        XnErrorMessageModule,
        primengModule.DialogModule,
    ],
    exports: [],
    providers: [],
})
export class UserProfileModule {}
