import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { scanningInputRoutes } from './scanning-input.routing';
import { StoreModule } from '@ngrx/store';
import { scanningInputReducer } from './scanning-input.statemanagement/scanning-input.reducer';
import { ScanningInputComponent } from './scanning-input.component';
import { EffectsModule } from '@ngrx/effects';
import { ScanningInputEffects } from './scanning-input.statemanagement/scanning-input.effects';
import { ScanningInputSelectors } from './scanning-input.statemanagement/scanning-input.selectors';
import { SharedModuleContainerModule } from '@app/xoonit-share/components/shared-module-container/shared-module-container.module';

@NgModule({
    declarations: [ScanningInputComponent],
    imports: [
        SharedModuleContainerModule,
        RouterModule.forChild(scanningInputRoutes),
        EffectsModule.forFeature([ScanningInputEffects]),
        StoreModule.forFeature('scanningInputReducer', scanningInputReducer),
    ],
    exports: [],
    providers: [ScanningInputSelectors],
})
export class ScanningInputModule {}
