import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { WidgetRoleComponent } from './widget-role.component';
import { ManagementListModule } from '../management-list/management-list.module';
import { TooltipModule } from 'ngx-bootstrap/tooltip';
import { XnTranslationModule } from '@app/shared/components/translation/xn-translation.module';
import { UserManagementPopupModule } from '../popup-add-user-management/user-management-popup.module';
import { XnCheckboxTreeModule } from '../xn-checkbox-tree/xn-checkbox-tree.module';
import { AngularSplitModule } from 'angular-split';

@NgModule({
    declarations: [WidgetRoleComponent],
    imports: [
        CommonModule,
        ManagementListModule,
        TooltipModule,
        XnTranslationModule,
        UserManagementPopupModule,
        XnCheckboxTreeModule,
        AngularSplitModule,
    ],
    exports: [WidgetRoleComponent],
})
export class WidgetRoleModule {}
