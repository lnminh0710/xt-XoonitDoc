import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { XnTranslationModule } from '@app/shared/components/translation/xn-translation.module';
import { MatIconModule } from '@xn-control/light-material-ui/icon';
import { XnMaterialEnterNextFocusModule } from '../../directives/xn-material-enter-next-focus/xn-material-enter-next-focus.module';
import { XnMaterialCheckboxControlComponent } from './xn-material-checkbox-control.component';
import { MatCheckboxModule } from '@xn-control/light-material-ui/checkbox';

@NgModule({
    imports: [
        CommonModule,
        XnTranslationModule,
        ReactiveFormsModule,
        MatIconModule,
        XnMaterialEnterNextFocusModule,
        MatCheckboxModule
    ],
    exports: [
        XnMaterialCheckboxControlComponent
    ],
    declarations: [XnMaterialCheckboxControlComponent],
    providers: [],
})
export class XnMaterialCheckboxControlModule { }
