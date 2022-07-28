import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { LayoutContainerComponent } from '@app/pages/form-layout-builder/components/layout-container/layout-container.component';
import { XnSharedModule } from '@app/shared';
import { ControlPropertyPanelModule } from './components/control-property-panel/control-property-panel.module';
import { ControlTemplatesModule } from './components/control-templates/control-templates.module';
import { FormDesignerModule } from './components/form-designer/form-designer.module';
import { FormLayoutBuilderComponent } from './form-layout-builder.component';
import { formBuilderRoutes } from './form-layout-builder.routing';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { EffectsModule } from '@ngrx/effects';
import { StoreModule } from '@ngrx/store';
import { FormLayoutBuilderEffects } from './form-layout-builder.statemanagement/form-layout-builder.effects';
import { formLayoutBuilderReducer } from './form-layout-builder.statemanagement/form-layout-builder.reducer';
import { FormLayoutBuilderSelectors } from './form-layout-builder.statemanagement/form-layout-builder.selectors';

@NgModule({
    imports: [
        FormDesignerModule,
        ControlTemplatesModule,
        ControlPropertyPanelModule,
        RouterModule.forChild(formBuilderRoutes),
        EffectsModule.forFeature([FormLayoutBuilderEffects]),
        StoreModule.forFeature('formLayoutBuilderReducer', formLayoutBuilderReducer),
        DragDropModule,
        XnSharedModule,
    ],
    exports: [],
    declarations: [LayoutContainerComponent, FormLayoutBuilderComponent],
    providers: [
        FormLayoutBuilderSelectors,
    ],
})
export class FormLayoutBuilderModule {}
