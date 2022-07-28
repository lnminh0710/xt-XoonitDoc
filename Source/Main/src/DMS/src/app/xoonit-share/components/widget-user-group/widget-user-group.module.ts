import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { XnTranslationModule } from '@app/shared/components/translation/xn-translation.module';
import { AngularSplitModule } from 'angular-split';
import { TooltipModule } from 'ngx-bootstrap/tooltip';
import { ManagementListModule } from '../management-list/management-list.module';
import { UserManagementPopupModule } from '../popup-add-user-management/user-management-popup.module';
import { WidgetUserSelectionModule } from '../widget-user-selection/widget-user-selection.module';
import { WidgetUserGroupComponent } from './widget-user-group.component';

@NgModule({
    declarations: [WidgetUserGroupComponent],
    imports: [
        CommonModule,
        TooltipModule,
        XnTranslationModule,
        ManagementListModule,
        UserManagementPopupModule,
        WidgetUserSelectionModule,
        AngularSplitModule,
    ],
    exports: [WidgetUserGroupComponent],
    providers: [],
})
export class WidgetUserGroupModule {}
