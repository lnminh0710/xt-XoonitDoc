import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { XnTranslationModule } from '@app/shared/components/translation/xn-translation.module';
import { AngularSplitModule } from 'angular-split';
import { TooltipModule } from 'ngx-bootstrap/tooltip';
import { GlobalPopupModule } from '../global-popup/global-popup.module';
import { ManagementListModule } from '../management-list/management-list.module';
import { UserManagementPopupModule } from '../popup-add-user-management/user-management-popup.module';
import { XnCheckboxTreeModule } from '../xn-checkbox-tree/xn-checkbox-tree.module';
import { WidgetRoleGroupComponent } from './widget-role-group.component';

@NgModule({
    declarations: [WidgetRoleGroupComponent],
    imports: [
        CommonModule,
        TooltipModule,
        XnTranslationModule,
        ManagementListModule,
        UserManagementPopupModule,
        XnCheckboxTreeModule,
        GlobalPopupModule.forRoot(),
        AngularSplitModule,
    ],
    exports: [WidgetRoleGroupComponent],
    providers: [],
})
export class WidgetRoleGroupModule {}
