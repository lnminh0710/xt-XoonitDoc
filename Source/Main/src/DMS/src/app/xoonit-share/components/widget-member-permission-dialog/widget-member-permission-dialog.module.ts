import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { XnTranslationModule } from '@app/shared/components/translation/xn-translation.module';
import { MatCheckboxModule } from '@xn-control/light-material-ui/checkbox';
import { XnAgGridModule } from '@xn-control/xn-ag-grid';
import { TooltipModule } from 'ngx-bootstrap/tooltip';
import { WidgetMemberPermissionConfigModule } from '../widget-member-permission-config/widget-member-permission-config.module';
import { WidgetUserSelectionModule } from '../widget-user-selection/widget-user-selection.module';
import { WidgetMemberPermissionDialogComponent } from './widget-member-permission-dialog.component';

@NgModule({
    declarations: [WidgetMemberPermissionDialogComponent],
    imports: [
        CommonModule,
        XnTranslationModule,
        XnAgGridModule,
        TooltipModule,
        WidgetUserSelectionModule,
        WidgetMemberPermissionConfigModule,
        MatCheckboxModule,
    ],
    exports: [WidgetMemberPermissionDialogComponent],
    providers: [],
    entryComponents: [WidgetMemberPermissionDialogComponent],
})
export class WidgetMemberPermissionDialogModule {}
