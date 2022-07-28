import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { XnTranslationModule } from '@app/shared/components/translation/xn-translation.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TooltipModule } from 'ngx-bootstrap/tooltip';
import { MatInputModule } from '@xn-control/light-material-ui/input';
import { MatFormFieldModule } from '@xn-control/light-material-ui/form-field';
import { UserSelectionComponent } from './widget-user-selection.component';
import { MatAutocompleteModule } from '@xn-control/light-material-ui/autocomplete';
import { MatChipsModule } from '@xn-control/light-material-ui/chips';
import { MatOptionModule } from '@xn-control/light-material-ui/core';
import { MatIconModule } from '@xn-control/light-material-ui/icon';

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        XnTranslationModule,
        TooltipModule.forRoot(),
        MatInputModule,
        MatFormFieldModule,
        MatAutocompleteModule,
        MatChipsModule,
        MatOptionModule,
    ],
    exports: [UserSelectionComponent],
    declarations: [UserSelectionComponent],
    providers: [],
})
export class WidgetUserSelectionModule {}
