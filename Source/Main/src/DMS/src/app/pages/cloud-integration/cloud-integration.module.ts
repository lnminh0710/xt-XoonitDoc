import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AngularSplitModule } from 'angular-split';
import { PerfectScrollbarModule } from 'ngx-perfect-scrollbar';
import { ModalModule } from 'ngx-bootstrap/modal';
import { RouterModule } from '@angular/router';
import { cloudIntegrationRoutes } from './cloud-integration.routing';
import { EffectsModule } from '@ngrx/effects';
import { StoreModule } from '@ngrx/store';
import { XnSharedModule } from '@app/shared';
import { CloudIntegrationEffects } from './cloud-integration.statemangament/cloud-integration.effects';
import { cloudIntegrationReducer } from './cloud-integration.statemangament/cloud-integration.reducer';
import { CloudIntegrationSelectors } from './cloud-integration.statemangament/cloud-integration.selectors';
import { CloudIntegrationComponent } from './cloud-integration.component';
import { GlobalSearchModule } from '@app/shared/components/global-search/global-search.module';
import { SharedModuleContainerModule } from '../../xoonit-share/components/shared-module-container/shared-module-container.module';

@NgModule({
    declarations: [CloudIntegrationComponent],
    imports: [
        CommonModule,
        AngularSplitModule,
        PerfectScrollbarModule,
        ModalModule,
        RouterModule.forChild(cloudIntegrationRoutes),
        EffectsModule.forFeature([CloudIntegrationEffects]),
        StoreModule.forFeature('cloudIntegrationReducer', cloudIntegrationReducer),
        XnSharedModule,
        GlobalSearchModule,
        SharedModuleContainerModule
    ],
    exports: [],
    providers: [CloudIntegrationSelectors],
})
export class CloudIntegrationModule {}
