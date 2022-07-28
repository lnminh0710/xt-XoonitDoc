import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { XnTranslationModule } from '@app/shared/components/translation/xn-translation.module';
import { MatButtonModule } from '@xn-control/light-material-ui/button';
import { MatDialogModule } from '@xn-control/light-material-ui/dialog';
import { MatIconModule } from '@xn-control/light-material-ui/icon';
import { XnDynamicMaterialControlModule } from '@xn-control/xn-dynamic-material-control';
import { XnMaterialAutocompleteControlComponent } from '@xn-control/xn-dynamic-material-control/components/xn-material-autocomplete-control/xn-material-autocomplete-control.component';
import { XnMaterialInputControlComponent } from '@xn-control/xn-dynamic-material-control/components/xn-material-input-control/xn-material-input-control.component';

import { DynamicFieldDialogComponent } from './dynamic-field-dialog.component';

@NgModule({
    imports: [
        CommonModule,
        MatDialogModule,
        MatButtonModule,
        MatIconModule,
        XnDynamicMaterialControlModule.withComponents([
            XnMaterialInputControlComponent,
            XnMaterialAutocompleteControlComponent,
        ]),
        XnTranslationModule,

    ],
    exports: [DynamicFieldDialogComponent],
    declarations: [DynamicFieldDialogComponent],
    providers: [],
})
export class DynamicFieldDialogModule {}
