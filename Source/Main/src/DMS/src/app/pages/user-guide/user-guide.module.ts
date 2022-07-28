import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { XnSharedModule } from '@app/shared';
import { RouterModule } from '@angular/router';
import { StoreModule } from '@ngrx/store';
import { AngularSplitModule } from 'angular-split';
import { PerfectScrollbarModule } from 'ngx-perfect-scrollbar';
import { ModalModule } from 'ngx-bootstrap/modal';
import { EffectsModule } from '@ngrx/effects';
import { UserGuideComponent } from './user-guide.component';
import { UserGuideHomeComponent } from './components/user-guide-home/user-guide-home.component';
import { UserGuideEffects } from './user-guide.statemanagement/user-guide.effects';
import { UserGuideSelectors } from './user-guide.statemanagement/user-guide.selectors';
import { userGuideReducer } from './user-guide.statemanagement/user-guide.reducer';
import { userGuideRoutes } from './user-guide.routing';
import { GlobalSearchModule } from '@app/shared/components/global-search/global-search.module';



@NgModule({
    declarations: [
        UserGuideComponent,
        UserGuideHomeComponent,
    ],
    imports: [
        CommonModule,
        AngularSplitModule,
        PerfectScrollbarModule,
        ModalModule,
        RouterModule.forChild(userGuideRoutes),
        EffectsModule.forFeature([UserGuideEffects]),
        StoreModule.forFeature('userGuideReducer', userGuideReducer),
        XnSharedModule,
    GlobalSearchModule,
    ],
    exports: [],
    providers: [
        UserGuideSelectors,
    ],
})
export class UserGuideModule {}
