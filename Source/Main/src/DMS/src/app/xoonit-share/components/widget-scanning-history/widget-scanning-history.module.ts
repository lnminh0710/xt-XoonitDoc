import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { WidgetScanningHistoryComponent } from './widget-scanning-history.component';
import { XnInputTypeaheadModule } from '../xn-input-typeahead/xn-input-typehead.module';
import { XnBsDatepickerModule } from '../xn-bs-datepicker/xn-bs-datepicker.module';
import { XnNgxDropdownModule } from '../xn-ngx-dropdown/xn-ngx-dropdown.module';
import { XnPaginationGridModule } from '../xn-pagination-grid';
import { XnAgGridModule } from '@xn-control/xn-ag-grid';
import { EffectsModule } from '@ngrx/effects';
import { HistoryEffects } from '@app/pages/history/history.statemanagement/history.effects';
import { StoreModule } from '@ngrx/store';
import { historyReducer } from '@app/pages/history/history.statemanagement/history.reducer';
import { AppSelectors } from '@app/state-management/store/reducer/app';

@NgModule({
    declarations: [WidgetScanningHistoryComponent],
    imports: [
        CommonModule,
        XnInputTypeaheadModule,
        XnBsDatepickerModule,
        XnNgxDropdownModule,
        XnPaginationGridModule,
        XnAgGridModule,
        // EffectsModule.forFeature([HistoryEffects]),
        // StoreModule.forFeature('historyPageReducer', historyReducer),
    ],
    exports: [WidgetScanningHistoryComponent],
    providers: [],
})
export class WidgetScanningHistoryModule {}
