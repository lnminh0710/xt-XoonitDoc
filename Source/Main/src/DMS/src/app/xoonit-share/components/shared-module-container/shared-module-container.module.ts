import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { XnSharedModule } from '@app/shared/shared.module';
import { SharedModuleContainerComponent } from './shared-module-container.component';
import { XnHotKeyProcessingDirectiveModule } from '../../../shared/directives/xn-hot-key-processing';

@NgModule({
    declarations: [SharedModuleContainerComponent],
    imports: [
        CommonModule,
        XnSharedModule,
        XnHotKeyProcessingDirectiveModule],
    exports: [SharedModuleContainerComponent],
    providers: [],
})
export class SharedModuleContainerModule { }
