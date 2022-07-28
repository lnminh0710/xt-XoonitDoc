import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { XnMaterialRadiosControlComponent } from './xn-material-radios-control.component';
import { ReactiveFormsModule } from '@angular/forms';
import { XnTranslationModule } from '@app/shared/components/translation/xn-translation.module';
import { MatFormFieldModule } from '@xn-control/light-material-ui/form-field';
import { MatIconModule } from '@xn-control/light-material-ui/icon';
import { MatRadioModule } from '@xn-control/light-material-ui/radio';

@NgModule({
    imports: [
        CommonModule,
        XnTranslationModule,
        ReactiveFormsModule,
        MatFormFieldModule,
        MatRadioModule,
        MatIconModule,
    ],
    exports: [
        XnMaterialRadiosControlComponent
    ],
    declarations: [XnMaterialRadiosControlComponent],
    providers: [],
})
export class XnMaterialRadiosControlModule { }
