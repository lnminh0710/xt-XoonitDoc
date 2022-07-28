import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { StoreModule } from '@ngrx/store';
import { EffectsModule } from '@ngrx/effects';
import { ImportUploadComponent } from './import-upload.component';
import { importUploadRoutes } from './import-upload.routing';
import { ImportUploadEffects } from './import-upload.statemanagement/import-upload.effects';
import { importUploadReducer } from './import-upload.statemanagement/import-upload.reducer';
import { ImportUploadSelectors } from './import-upload.statemanagement/import-upload.selectors';
import { GlobalSearchModule } from '@app/shared/components/global-search/global-search.module';
import { SharedModuleContainerModule } from '@app/xoonit-share/components/shared-module-container/shared-module-container.module';

@NgModule({
    declarations: [ImportUploadComponent],
    imports: [
        RouterModule.forChild(importUploadRoutes),
        EffectsModule.forFeature([ImportUploadEffects]),
        StoreModule.forFeature('importUploadReducer', importUploadReducer),
        SharedModuleContainerModule,
        GlobalSearchModule,
    ],
    exports: [],
    providers: [ImportUploadSelectors],
})
export class ImportUploadModule {}
