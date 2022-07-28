import { NgModule } from '@angular/core';
import {
    LabelTranslationComponent,
} from './components';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';

@NgModule({
    imports: [
        TranslateModule,
        CommonModule
    ],
    exports: [
        LabelTranslationComponent
    ],
    declarations: [
        LabelTranslationComponent
    ],   
    providers: [],
})
export class XnTranslationModule {}
