import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { StoreModule } from '@ngrx/store';
import { EffectsModule } from '@ngrx/effects';
import { CustomerComponent } from './customer.component';
import { CustomerEffects } from './customer.statemanagement/customer.effects';
import { CustomerSelectors } from './customer.statemanagement/customer.selectors';
import { customerReducer } from './customer.statemanagement/customer.reducer';
import { customerRoutes } from './customer.routing';
import { SharedModuleContainerModule } from '@app/xoonit-share/components/shared-module-container/shared-module-container.module';

@NgModule({
    declarations: [CustomerComponent],
    imports: [
        RouterModule.forChild(customerRoutes),
        EffectsModule.forFeature([CustomerEffects]),
        StoreModule.forFeature('customerReducer', customerReducer),
        SharedModuleContainerModule,
    ],
    exports: [],
    providers: [CustomerSelectors],
})
export class CustomerPageModule {}
