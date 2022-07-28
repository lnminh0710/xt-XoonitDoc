import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { PreissChildComponent } from './preisschild.component';
import { preisschildRoutes } from './preisschild.routing';
import { SharedModuleContainerModule } from '../../xoonit-share/components/shared-module-container/shared-module-container.module';

@NgModule({
    imports: [RouterModule.forChild(preisschildRoutes), SharedModuleContainerModule],
    exports: [],
    declarations: [PreissChildComponent],
    providers: [],
})
export class PreissChildModule {}
