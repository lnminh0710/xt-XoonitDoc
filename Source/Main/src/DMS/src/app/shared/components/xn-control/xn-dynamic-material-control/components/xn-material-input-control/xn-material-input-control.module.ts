import { CommonModule } from '@angular/common';
import { XnMaterialInputControlComponent } from './xn-material-input-control.component';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { XnTranslationModule } from '@app/shared/components/translation/xn-translation.module';
import { MatButtonModule } from '@xn-control/light-material-ui/button';
import { MatFormFieldModule } from '@xn-control/light-material-ui/form-field';
import { MatIconModule } from '@xn-control/light-material-ui/icon';
import { MatInputModule } from '@xn-control/light-material-ui/input';
import { XnMaterialEnterNextFocusModule } from '../../directives/xn-material-enter-next-focus/xn-material-enter-next-focus.module';
import { HotKeySettingModule } from '../../../../hotkey-setting/hotkey-setting.module';

@NgModule({
    imports: [
        CommonModule,
        XnTranslationModule,
        ReactiveFormsModule,
        MatFormFieldModule,
        MatButtonModule,
        MatInputModule,
        MatIconModule,
        XnMaterialEnterNextFocusModule,
        HotKeySettingModule
    ],
    exports: [XnMaterialInputControlComponent],
    declarations: [XnMaterialInputControlComponent],
    providers: [],
})
export class XnMaterialInputControlModule {}
