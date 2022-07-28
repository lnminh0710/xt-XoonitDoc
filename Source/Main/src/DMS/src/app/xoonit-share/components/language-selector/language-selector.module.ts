import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TooltipModule } from 'ngx-bootstrap/tooltip';
import { LanguageSelectorComponent } from './language-selector.component';
import { MatMenuModule } from '@xn-control/light-material-ui/menu';

@NgModule({
    declarations: [LanguageSelectorComponent],
    imports: [CommonModule, FormsModule, TooltipModule, MatMenuModule],
    exports: [LanguageSelectorComponent],
    providers: [],
    entryComponents: [],
})
export class LanguageSelectorModule {}
