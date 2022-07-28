import { NgModule } from '@angular/core';
import { XnHotKeyProcessingDirective } from './xn-hot-key-processing.directive';
import { HotKeySettingModule } from '../../components/hotkey-setting/hotkey-setting.module';

@NgModule({
    imports: [HotKeySettingModule],
    declarations: [XnHotKeyProcessingDirective],
    exports: [XnHotKeyProcessingDirective],
    providers: []
})
export class XnHotKeyProcessingDirectiveModule { }
