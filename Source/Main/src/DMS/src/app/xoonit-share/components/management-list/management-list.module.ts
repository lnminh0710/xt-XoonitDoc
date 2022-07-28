import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { PipesModule } from '@app/pipes/pipes.module';
import { ModalService } from '@app/services';
import { XnTranslationModule } from '@app/shared/components/translation/xn-translation.module';
import { MatButtonModule } from '@xn-control/light-material-ui/button';
import { MatCheckboxModule } from '@xn-control/light-material-ui/checkbox';
import { MatIconModule } from '@xn-control/light-material-ui/icon';
import { TooltipModule } from 'ngx-bootstrap/tooltip';
import { CheckboxListComponent, IconListComponent } from './components';
import { ManagementListComponent } from './management-list.component';

@NgModule({
    declarations: [ManagementListComponent, CheckboxListComponent, IconListComponent],
    imports: [
        CommonModule,
        TooltipModule,
        XnTranslationModule,
        MatCheckboxModule,
        MatButtonModule,
        MatIconModule,
        PipesModule
    ],
    exports: [
        ManagementListComponent
    ],
    providers: [ModalService],
})
export class ManagementListModule { }
