import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { XnPaginatorComponent } from './components/xn-paginator.component';
import { TooltipModule } from 'ngx-bootstrap/tooltip';
import { XnTranslationModule } from '@app/shared/components/translation/xn-translation.module';

@NgModule({
    declarations: [XnPaginatorComponent],
    imports: [CommonModule, TooltipModule, XnTranslationModule],
    exports: [XnPaginatorComponent],
    providers: [],
})
export class XnPaginationGridModule {}
