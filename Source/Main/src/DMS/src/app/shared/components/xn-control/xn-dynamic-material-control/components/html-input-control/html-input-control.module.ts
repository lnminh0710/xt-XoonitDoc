import { CommonModule } from '@angular/common';
import { HTMLInputControlComponent } from './html-input-control.component';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { XnTranslationModule } from '@app/shared/components/translation/xn-translation.module';
import { MatButtonModule } from '@xn-control/light-material-ui/button';
import { MatFormFieldModule } from '@xn-control/light-material-ui/form-field';
import { MatIconModule } from '@xn-control/light-material-ui/icon';
import { MatInputModule } from '@xn-control/light-material-ui/input';
import { PipesModule } from '@app/pipes/pipes.module';
import { XnMaterialEnterNextFocusModule } from '../../directives/xn-material-enter-next-focus/xn-material-enter-next-focus.module';

@NgModule({
    imports: [
        CommonModule,
        XnTranslationModule,
        ReactiveFormsModule,
        MatFormFieldModule,
        MatButtonModule,
        MatInputModule,
        MatIconModule,
        PipesModule,
        XnMaterialEnterNextFocusModule
    ],
    exports: [HTMLInputControlComponent],
    declarations: [HTMLInputControlComponent],
    providers: [],
})
export class HTMLInputControlModule {}
