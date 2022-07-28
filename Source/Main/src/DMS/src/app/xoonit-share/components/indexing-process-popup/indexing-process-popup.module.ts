import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MatIconModule } from '@xn-control/light-material-ui/icon';
import { TooltipModule } from 'ngx-bootstrap/tooltip';
import { PerfectScrollbarModule } from 'ngx-perfect-scrollbar';
import { IndexingProcessPopupComponent } from './indexing-process-popup.component';

@NgModule({
    declarations: [IndexingProcessPopupComponent],
    imports: [CommonModule, MatIconModule, TooltipModule, PerfectScrollbarModule],
    exports: [IndexingProcessPopupComponent],
    providers: [],
})
export class IndexingProcessPopupModule {}
