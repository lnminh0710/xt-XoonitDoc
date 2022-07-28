import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { XnInputTypeaheadModule } from '../xn-input-typeahead/xn-input-typehead.module';
import { XnBsDatepickerModule } from '../xn-bs-datepicker/xn-bs-datepicker.module';
import { XnNgxDropdownModule } from '../xn-ngx-dropdown/xn-ngx-dropdown.module';
import { XnPaginationGridModule } from '../xn-pagination-grid';
import { XnAgGridModule } from '@xn-control/xn-ag-grid';
import { WidgetUserManagementComponent } from './widget-user-management.component';
import { XnErrorMessageModule } from '../xn-error-message/xn-error-message.module';
import { MatFormFieldModule } from '@xn-control/light-material-ui/form-field';
import { MatInputModule } from '@xn-control/light-material-ui/input';
import { MatAutocompleteModule } from '@xn-control/light-material-ui/autocomplete';
import * as primengModule from 'primeng/primeng';
import { MatSlideToggleModule } from '@xn-control/light-material-ui/slide-toggle';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { XnEnterBreakDownDirectiveModule } from '@app/xoonit-share/directives/xn-enter-break-down/xn-enter-break-down.module';
import { MatSelectModule } from '@xn-control/light-material-ui/select';
import { TooltipModule } from 'ngx-bootstrap/tooltip';
import { WidgetUserUpdationComponent } from './components/widget-user-updation/widget-user-updation.component';
import { XnTranslationModule } from '@app/shared/components/translation/xn-translation.module';

@NgModule({
    declarations: [WidgetUserManagementComponent, WidgetUserUpdationComponent],
    imports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        XnInputTypeaheadModule,
        XnBsDatepickerModule,
        XnNgxDropdownModule,
        XnPaginationGridModule,
        XnAgGridModule,
        XnErrorMessageModule,
        MatFormFieldModule,
        MatInputModule,
        MatAutocompleteModule,
        MatSelectModule,
        MatSlideToggleModule,
        primengModule.DialogModule,
        XnEnterBreakDownDirectiveModule,
        TooltipModule.forRoot(),
        XnTranslationModule
    ],
    exports: [WidgetUserManagementComponent],
    providers: [],
    entryComponents: [WidgetUserUpdationComponent],
})
export class WidgetUserManagementModule {}
