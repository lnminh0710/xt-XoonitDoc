import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { XnInputDebounceModule } from '../xn-control/xn-input-debounce/xn-input-debounce.module';
import { GlobalSearchMainComponent } from './container';
import {
  GlobalSeachModuleItemComponent,
  GlobalSeachModuleItemListComponent,
  GlobalSearchTabComponent,
  GlobalSearchResultComponent,
  GlobalSearchHistoryComponent,
} from './components';
import { ResizableModule } from 'angular-resizable-element';
import { TabsModule } from 'ngx-bootstrap/tabs';
import { PerfectScrollbarModule } from 'ngx-perfect-scrollbar';
import { XnAgGridModule } from '../xn-control/xn-ag-grid';
import { XnPagerModule } from '../xn-pager';
import { AgGridModule } from 'ag-grid-angular';
import { TemplateHeaderCellRenderer, TemplateCellRenderer } from '../xn-control/xn-ag-grid/components';
import { MatIconModule } from '@xn-control/light-material-ui/icon';
import { TooltipModule } from 'ngx-bootstrap/tooltip';
import { XnTranslationModule } from '../translation/xn-translation.module';
import { ItemHasCountPipe } from './pipes';
import { AdvanceSearchBuilderModule } from '../advance-search-builder/advance-search-builder.module';
// import { MaterialModule } from '../xn-control/light-material-ui/material.module';
@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    XnInputDebounceModule,
    ResizableModule,
    TabsModule,
    PerfectScrollbarModule,
    XnAgGridModule,
    XnPagerModule,
    AgGridModule.withComponents([TemplateHeaderCellRenderer, TemplateCellRenderer]),
    MatIconModule,
    TooltipModule,
    XnTranslationModule,
    AdvanceSearchBuilderModule,
    // MaterialModule,
  ],
  declarations: [
    GlobalSearchMainComponent,
    GlobalSeachModuleItemComponent,
    GlobalSeachModuleItemListComponent,
        GlobalSearchTabComponent,
        GlobalSearchResultComponent,
        GlobalSearchHistoryComponent,
        ItemHasCountPipe
    ],
    exports: [
        GlobalSearchMainComponent,
    GlobalSeachModuleItemComponent,
    GlobalSeachModuleItemListComponent,
    GlobalSearchTabComponent,
    GlobalSearchResultComponent,
    GlobalSearchHistoryComponent,
  ],
})
export class GlobalSearchModule {}
