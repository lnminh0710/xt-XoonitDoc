import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { XnMaterialSelectControlComponent } from './xn-material-select-control.component';
import { ReactiveFormsModule } from '@angular/forms';
import { XnTranslationModule } from '@app/shared/components/translation/xn-translation.module';
import { MatFormFieldModule } from '@xn-control/light-material-ui/form-field';
import { MatIconModule } from '@xn-control/light-material-ui/icon';
import { MatSelectModule } from '@xn-control/light-material-ui/select';
import { XnMaterialEnterNextFocusModule } from '../../directives/xn-material-enter-next-focus/xn-material-enter-next-focus.module';

@NgModule({
    imports: [
        CommonModule,
        XnTranslationModule,
        ReactiveFormsModule,
        MatFormFieldModule,
        MatSelectModule,
        MatIconModule,
        XnMaterialEnterNextFocusModule
    ],
    exports: [
        XnMaterialSelectControlComponent,
    ],
    declarations: [XnMaterialSelectControlComponent],
    providers: [],
})
export class XnMaterialSelectControlModule { }
