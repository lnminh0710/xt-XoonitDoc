import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { SharedModuleContainerModule } from '@app/xoonit-share/components/shared-module-container/shared-module-container.module';
import { WidgetUserSelectionModule } from '@app/xoonit-share/components/widget-user-selection/widget-user-selection.module';
import { EffectsModule } from '@ngrx/effects';
import { StoreModule } from '@ngrx/store';
import { UserV2Component } from './user-v2.component';
import { userV2Routes } from './user-v2.routing';
import { UserV2Effects } from './user-v2.statemanagement/user-v2.effects';
import { userV2Reducer } from './user-v2.statemanagement/user-v2.reducer';
import { UserV2Selectors } from './user-v2.statemanagement/user-v2.selectors';

@NgModule({
    declarations: [UserV2Component],
    imports: [
        RouterModule.forChild(userV2Routes),
        SharedModuleContainerModule,
        WidgetUserSelectionModule,
        EffectsModule.forFeature([UserV2Effects]),
        StoreModule.forFeature('userV2Reducer', userV2Reducer),
    ],
    exports: [],
    providers: [UserV2Selectors],
})
export class UserV2Module {}
