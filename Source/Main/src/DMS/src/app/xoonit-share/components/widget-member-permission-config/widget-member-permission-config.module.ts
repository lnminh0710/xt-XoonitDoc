import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { XnTranslationModule } from '@app/shared/components/translation/xn-translation.module';
import { MatIconModule } from '@xn-control/light-material-ui/icon';
import { XnAgGridModule } from '@xn-control/xn-ag-grid';
import { TooltipModule } from 'ngx-bootstrap/tooltip';
import { WidgetMemberPermissionConfigComponent } from './widget-member-permission-config.component';

@NgModule({
    declarations: [WidgetMemberPermissionConfigComponent],
    imports: [CommonModule, XnTranslationModule, XnAgGridModule, TooltipModule, MatIconModule],
    exports: [WidgetMemberPermissionConfigComponent],
    providers: [],
    entryComponents: [WidgetMemberPermissionConfigComponent],
})
export class WidgetMemberPermissionConfigModule {}
