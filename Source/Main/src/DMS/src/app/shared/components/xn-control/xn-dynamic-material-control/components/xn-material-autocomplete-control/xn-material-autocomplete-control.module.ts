import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { XnTranslationModule } from '@app/shared/components/translation/xn-translation.module';
import { MatAutocompleteModule } from '@xn-control/light-material-ui/autocomplete';
import { MatButtonModule } from '@xn-control/light-material-ui/button';
import { MatFormFieldModule } from '@xn-control/light-material-ui/form-field';
import { MatIconModule } from '@xn-control/light-material-ui/icon';
import { MatInputModule } from '@xn-control/light-material-ui/input';

import { XnMaterialAutocompleteControlComponent } from './xn-material-autocomplete-control.component';
import { XnMaterialEnterNextFocusModule } from '../../directives/xn-material-enter-next-focus/xn-material-enter-next-focus.module';

@NgModule({
    imports: [
        CommonModule,
        XnTranslationModule,
        ReactiveFormsModule,
        MatFormFieldModule,
        MatInputModule,
        MatAutocompleteModule,
        MatButtonModule,
        MatIconModule,
        XnMaterialEnterNextFocusModule
    ],
    exports: [
        XnMaterialAutocompleteControlComponent,
    ],
    declarations: [XnMaterialAutocompleteControlComponent],
    providers: [],
})
export class XnMaterialAutocompleteControlModule { }
