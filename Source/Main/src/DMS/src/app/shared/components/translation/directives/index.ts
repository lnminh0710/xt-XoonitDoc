import { NgModule } from '@angular/core';
import { ResourceTranslationDirective } from './resource-translation.directive';
import { DialogResourceTranslationComponent } from '../components/dialog-resource-translation';
import { ResourceTranslationFormComponent } from '../components/resource-translation-form';
import { XnAgGridModule } from '../../xn-control/xn-ag-grid/xn-ag-grid.module';
import { XnTranslationModule } from '../xn-translation.module';

@NgModule({
    imports: [XnTranslationModule,XnAgGridModule],
    declarations: [DialogResourceTranslationComponent, ResourceTranslationFormComponent, ResourceTranslationDirective],
    exports: [DialogResourceTranslationComponent, ResourceTranslationFormComponent, ResourceTranslationDirective],
    providers: [],
    entryComponents: [
        DialogResourceTranslationComponent,
        ResourceTranslationFormComponent
    ],
})
export class ResourceTranslationDirectiveModule { }
