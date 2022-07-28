import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { AdvanceSearchBuilderComponent } from './advance-search-builder.component';
import { AdvanceSearchIconComponent, AdvanceSearchConditionComponent } from './components';
import { WjInputModule } from 'wijmo/wijmo.angular2.input';
import { CommonModule } from '@angular/common';
import { SearchService } from '../../../services';
import { AngularMultiSelectModule } from '../xn-control/xn-dropdown';
import { XnDatePickerModule } from '@app/shared/components/xn-control';
import { XnInputNumericModule } from '@app/shared/directives/xn-input-numeric/xn-input-numeric.module';
import { ResourceTranslationService } from '@app/services/common';
import { XnTranslationModule } from '../translation/xn-translation.module';
import { MatCheckboxModule } from '@xn-control/light-material-ui/checkbox';
import { MatButtonModule } from '@xn-control/light-material-ui/button';

@NgModule({
    imports: [
        CommonModule,
        WjInputModule,
        AngularMultiSelectModule,
        ReactiveFormsModule,
        XnDatePickerModule,
        XnInputNumericModule,
        XnTranslationModule,
        MatCheckboxModule,
        MatButtonModule,
    ],
    declarations: [AdvanceSearchBuilderComponent, AdvanceSearchIconComponent, AdvanceSearchConditionComponent],
    exports: [AdvanceSearchBuilderComponent, AdvanceSearchIconComponent, AdvanceSearchConditionComponent],
    providers: [SearchService, ResourceTranslationService],
})
export class AdvanceSearchBuilderModule {}
