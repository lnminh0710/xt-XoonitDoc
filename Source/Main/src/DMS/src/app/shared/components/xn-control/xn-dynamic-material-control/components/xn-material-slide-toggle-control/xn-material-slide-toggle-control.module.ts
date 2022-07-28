import { NgModule } from '@angular/core';
import { XnMaterialSlideToggleControlComponent } from './xn-material-slide-toggle-control.component';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { XnTranslationModule } from '@app/shared/components/translation/xn-translation.module';
import { MatFormFieldModule } from '@xn-control/light-material-ui/form-field';
import { MatIconModule } from '@xn-control/light-material-ui/icon';
import { MatSlideToggleModule } from '@xn-control/light-material-ui/slide-toggle';
import { XnMaterialEnterNextFocusModule } from '../../directives/xn-material-enter-next-focus/xn-material-enter-next-focus.module';

@NgModule({
    imports: [
        CommonModule,
        XnTranslationModule,
        ReactiveFormsModule,
        MatFormFieldModule,
        MatSlideToggleModule,
        MatIconModule,
        XnMaterialEnterNextFocusModule
    ],
    exports: [
        XnMaterialSlideToggleControlComponent
    ],
    declarations: [XnMaterialSlideToggleControlComponent],
    providers: [],
})
export class XnMaterialSlideToggleControlModule { }
