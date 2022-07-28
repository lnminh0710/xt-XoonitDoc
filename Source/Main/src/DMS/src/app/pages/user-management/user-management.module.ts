import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { StoreModule } from '@ngrx/store';
import { AngularSplitModule } from 'angular-split';
import { PerfectScrollbarModule } from 'ngx-perfect-scrollbar';
import { EffectsModule } from '@ngrx/effects';
import { UserManagementComponent } from './user-management.component';
import { UserManagementSelectors } from './user-management.statemanagement/user-management.selectors';
import { ModalModule } from 'ngx-bootstrap/modal';
import { UserManagementEffects } from './user-management.statemanagement/user-management.effects';
import { userManagementReducer } from './user-management.statemanagement/user-management.reducer';
import { XnSharedModule } from '@app/shared';
import { GlobalSearchModule } from '@app/shared/components/global-search/global-search.module';
import { userManagementRoutes } from './user-management.routing';
import { WidgetUserManagementModule } from '@app/xoonit-share/components/widget-user-management/widget-user-management.module';

@NgModule({
    declarations: [UserManagementComponent],
    imports: [
        CommonModule,
        AngularSplitModule,
        PerfectScrollbarModule,
        ModalModule,
        RouterModule.forChild(userManagementRoutes),
        EffectsModule.forFeature([UserManagementEffects]),
        StoreModule.forFeature('userManagementReducer', userManagementReducer),
        XnSharedModule,
        GlobalSearchModule,
        WidgetUserManagementModule,
    ],
    exports: [],
    providers: [UserManagementSelectors],
})
export class UserManagementModule {}
