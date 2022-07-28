import { NgModule } from '@angular/core';
import { XnSharedModule } from '@app/shared';
import { RouterModule } from '@angular/router';
import { StoreModule } from '@ngrx/store';
import { AngularSplitModule } from 'angular-split';
import { PerfectScrollbarModule } from 'ngx-perfect-scrollbar';
import { ModalModule } from 'ngx-bootstrap/modal';
import { EffectsModule } from '@ngrx/effects';
import { HistoryComponent } from './history.component';
import { HistoryEffects } from './history.statemanagement/history.effects';
import { HistorySelectors } from './history.statemanagement/history.selectors';
import { historyReducer } from './history.statemanagement/history.reducer';
import { historyRoutes } from './history.routing';
import { GlobalSearchModule } from '@app/shared/components/global-search/global-search.module';
import { BsDatepickerModule } from 'ngx-bootstrap/datepicker';
import { TypeaheadModule } from 'ngx-bootstrap/typeahead';
import { XnBsDatepickerModule } from '@app/xoonit-share/components/xn-bs-datepicker/xn-bs-datepicker.module';
import { WidgetScanningHistoryModule } from '@app/xoonit-share/components/widget-scanning-history/widget-scanning-history.module';

@NgModule({
    declarations: [HistoryComponent],
    imports: [
        AngularSplitModule,
        BsDatepickerModule,
        XnBsDatepickerModule,
        TypeaheadModule,
        PerfectScrollbarModule,
        ModalModule,
        RouterModule.forChild(historyRoutes),
        EffectsModule.forFeature([HistoryEffects]),
        StoreModule.forFeature('historyPageReducer', historyReducer),
        XnSharedModule,
        GlobalSearchModule,
        WidgetScanningHistoryModule,
    ],
    exports: [],
    providers: [HistorySelectors],
})
export class HistoryModule {}
