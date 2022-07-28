import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { EmailComponent } from './email.component';
import { emailRoutes } from './email.routing';
import { SharedModuleContainerModule } from '../../xoonit-share/components/shared-module-container/shared-module-container.module';

@NgModule({
    imports: [
        RouterModule.forChild(emailRoutes),
        SharedModuleContainerModule
    ],
    exports: [],
    declarations: [EmailComponent],
    providers: [
    ],
})
export class EmailModule {}
