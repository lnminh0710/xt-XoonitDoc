import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { StoreModule } from '@ngrx/store';
import { EffectsModule } from '@ngrx/effects';
import { ExportComponent } from './export.component';
import { ExportEffects } from './export.statemanagement/export.effects';
import { ExportSelectors } from './export.statemanagement/export.selectors';
import { exportReducer } from './export.statemanagement/export.reducer';
import { exportRoutes } from './export.routing';
import { SharedModuleContainerModule } from '@app/xoonit-share/components/shared-module-container/shared-module-container.module';

@NgModule({
    declarations: [ExportComponent],
    imports: [
        RouterModule.forChild(exportRoutes),
        EffectsModule.forFeature([ExportEffects]),
        StoreModule.forFeature('exportReducer', exportReducer),
        SharedModuleContainerModule,
    ],
    exports: [],
    providers: [ExportSelectors],
})
export class ExportModule {}
