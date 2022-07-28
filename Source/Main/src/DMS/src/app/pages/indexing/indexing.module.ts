import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { IndexingComponent } from './indexing.component';
import { indexingRoutes } from './indexing.routing';
import { SharedModuleContainerModule } from '../../xoonit-share/components/shared-module-container/shared-module-container.module';

@NgModule({
    imports: [RouterModule.forChild(indexingRoutes), SharedModuleContainerModule],
    exports: [],
    declarations: [IndexingComponent],
    providers: [],
})
export class IndexingModule {}
