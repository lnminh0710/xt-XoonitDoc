import { ModuleWithProviders, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PopupService } from './services/popup.service';
import { OverlayModule } from '@angular/cdk/overlay';
import { SimplePopupComponent } from './components/simple-popup/simple-popup.component';
import { ComponentTemplatePopupComponent } from './components/component-template-popup/component-template-popup.component';
import { MatIconModule } from '@xn-control/light-material-ui/icon';
import { MatButtonModule } from '@xn-control/light-material-ui/button';
import { HeaderPopupComponent } from './components/header-popup/header-popup.component';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { XnTranslationModule } from '@app/shared/components/translation/xn-translation.module';
@NgModule({
    declarations: [HeaderPopupComponent, SimplePopupComponent, ComponentTemplatePopupComponent],
    imports: [CommonModule, OverlayModule, MatButtonModule, MatIconModule, DragDropModule, XnTranslationModule],
    exports: [],
    entryComponents: [SimplePopupComponent, ComponentTemplatePopupComponent],
})
export class GlobalPopupModule {
    static forRoot(): ModuleWithProviders {
        return {
            ngModule: GlobalPopupModule,
            providers: [PopupService],
        };
    }
}
