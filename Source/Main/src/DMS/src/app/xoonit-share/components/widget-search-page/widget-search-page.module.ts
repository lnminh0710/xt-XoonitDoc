import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { WidgetSearchPageComponent } from './widget-search-page.component';
import { MatFormFieldModule } from '@xn-control/light-material-ui/form-field';
import { MatIconModule } from '@xn-control/light-material-ui/icon';
import { MatInputModule } from '@xn-control/light-material-ui/input';
import { MatButtonModule } from '@xn-control/light-material-ui/button';

@NgModule({
    declarations: [WidgetSearchPageComponent],
    imports: [CommonModule, MatFormFieldModule, MatIconModule, MatInputModule, MatButtonModule],
    exports: [WidgetSearchPageComponent],
    providers: [],
})
export class WidgetSearchPageModule {}
