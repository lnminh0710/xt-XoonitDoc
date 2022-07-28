import { NgModule } from '@angular/core';
import { XnErrorMessageComponent } from './xn-error-message.component';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@xn-control/light-material-ui/form-field';
import { XnTranslationModule } from '@app/shared/components/translation/xn-translation.module';

@NgModule({
    imports: [CommonModule, MatFormFieldModule, XnTranslationModule],
    declarations: [XnErrorMessageComponent],
    exports: [XnErrorMessageComponent],
    providers: [],
})
export class XnErrorMessageModule {}
