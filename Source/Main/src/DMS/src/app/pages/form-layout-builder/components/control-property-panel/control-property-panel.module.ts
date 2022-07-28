import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ControlPropertyPanelComponent } from '@app/pages/form-layout-builder/components/control-property-panel/control-property-panel.component';
import { PropertyControlPanelComponent, PropertyControlPanelGridComponent, PropertyControlPanelGridValueComponent, DropdownTemplateComponent } from './property-panel';
import { PerfectScrollbarModule } from 'ngx-perfect-scrollbar';
import { CollapseModule } from 'ngx-bootstrap/collapse';
import { WjInputModule } from 'wijmo/wijmo.angular2.input';
import { WjCoreModule } from 'wijmo/wijmo.angular2.core';
import { MatCheckboxModule } from '../../../../shared/components/xn-control/light-material-ui/checkbox';
import { MatButtonModule } from '../../../../shared/components/xn-control/light-material-ui/button';

@NgModule({
    imports: [
        FormsModule,
        CommonModule,
        PerfectScrollbarModule,
        CollapseModule.forRoot(),
        WjInputModule,
        WjCoreModule,
        MatCheckboxModule,
        MatButtonModule],
    exports: [ControlPropertyPanelComponent],
    declarations: [
        ControlPropertyPanelComponent,
        PropertyControlPanelComponent,
        PropertyControlPanelGridComponent,
        PropertyControlPanelGridValueComponent,
        DropdownTemplateComponent],
    providers: [],
})
export class ControlPropertyPanelModule { }
