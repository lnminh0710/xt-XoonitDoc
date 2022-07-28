import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { XnSearchTableComponent } from './xn-search-table.component';
import { MatIconModule } from '@xn-control/light-material-ui/icon';
import { XnInputDebounceModule } from '@xn-control/xn-input-debounce/xn-input-debounce.module';
import { XnAgGridModule } from '@xn-control/xn-ag-grid';
import { TooltipModule } from 'ngx-bootstrap/tooltip';

@NgModule({
    declarations: [XnSearchTableComponent],
    imports: [CommonModule, MatIconModule, XnInputDebounceModule, XnAgGridModule, TooltipModule],
    exports: [XnSearchTableComponent],
    providers: [],
    entryComponents: [],
})
export class XnSearchTableModule {}
