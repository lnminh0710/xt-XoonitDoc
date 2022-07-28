import { NgModule } from '@angular/core';
import { AdvanceSearchProfileComponent } from './advance-search-profile.component';
import { ConfirmNewProfileComponent } from './confirm-new-profile';
import { CommonModule } from '@angular/common';
import { PerfectScrollbarModule } from 'ngx-perfect-scrollbar';
import { FormsModule } from '@angular/forms';
import * as primengModule from 'primeng/primeng';
import { XnAgGridModule } from '@app/shared/components/xn-control/xn-ag-grid';
import { DatatableService, AccessRightsService, PropertyPanelService, ModalService } from '@app/services';
import { TooltipModule } from 'ngx-bootstrap/tooltip';
import { XnTranslationModule } from '../translation/xn-translation.module';
import { MatCheckboxModule } from '@xn-control/light-material-ui/checkbox';
import { MatButtonModule } from '@xn-control/light-material-ui/button';

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        TooltipModule.forRoot(),
        PerfectScrollbarModule,
        primengModule.DialogModule,
        XnAgGridModule,
        XnTranslationModule,
        MatCheckboxModule,
        MatButtonModule,
    ],
    declarations: [AdvanceSearchProfileComponent, ConfirmNewProfileComponent],
    exports: [AdvanceSearchProfileComponent],
    providers: [DatatableService, AccessRightsService, PropertyPanelService, ModalService],
})
export class AdvanceSearchProfileModule {}
