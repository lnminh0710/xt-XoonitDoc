import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { XnPaginationComponent } from './xn-pagination.component';
import { WjCoreModule } from 'wijmo/wijmo.angular2.core';
import { WjInputModule } from 'wijmo/wijmo.angular2.input';
import { MatButtonModule } from '../xn-control/light-material-ui/button';
import { TooltipModule } from 'ngx-bootstrap/tooltip';
import { XnTranslationModule } from '../translation/xn-translation.module';

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        WjCoreModule,
        WjInputModule,
        MatButtonModule,
        TooltipModule,
        XnTranslationModule
    ],
    declarations: [XnPaginationComponent],
    exports: [XnPaginationComponent],
})
export class XnPagerModule {}
