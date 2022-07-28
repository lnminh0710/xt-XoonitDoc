import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { XnMaterialEnterNextFocusModule } from '@xn-control/xn-dynamic-material-control/directives/xn-material-enter-next-focus/xn-material-enter-next-focus.module';
import { XnMaterialSelectSearchControlComponent } from './xn-material-select-search-control.component';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { XnTranslationModule } from '@app/shared/components/translation/xn-translation.module';
import { MatFormFieldModule } from '@xn-control/light-material-ui/form-field';
import { MatIconModule } from '@xn-control/light-material-ui/icon';
import { MatSelectModule } from '@xn-control/light-material-ui/select';
import { TranslateModule } from '@ngx-translate/core';
import { MatButtonModule } from '@xn-control/light-material-ui/button';
import { ScrollingModule } from '@angular/cdk/scrolling';
import { MatAutocompleteModule } from '@xn-control/light-material-ui/autocomplete';
import { MatInputModule } from '@xn-control/light-material-ui/input';

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        XnMaterialEnterNextFocusModule,
        XnTranslationModule,
        TranslateModule,
        ReactiveFormsModule,
        MatFormFieldModule,
        MatSelectModule,
        MatButtonModule,
        MatIconModule,
        ScrollingModule,
        MatAutocompleteModule,
        MatInputModule,
    ],
    exports: [XnMaterialSelectSearchControlComponent],
    declarations: [XnMaterialSelectSearchControlComponent],
    providers: [],
})
export class XnMaterialSelectSearchControlModule {}
