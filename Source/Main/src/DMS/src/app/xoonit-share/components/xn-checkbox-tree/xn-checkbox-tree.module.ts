import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MatCheckboxModule } from '@xn-control/light-material-ui/checkbox';
import { MatFormFieldModule } from '@xn-control/light-material-ui/form-field';
import { MatIconModule } from '@xn-control/light-material-ui/icon';
import { MatInputModule } from '@xn-control/light-material-ui/input';
import { MatTreeModule } from '@xn-control/light-material-ui/tree';
import { XnCheckboxTreeComponent } from './xn-checkbox-tree.component';
import { PerfectScrollbarModule } from 'ngx-perfect-scrollbar';

@NgModule({
    declarations: [XnCheckboxTreeComponent],
    imports: [CommonModule, MatTreeModule, MatCheckboxModule, MatFormFieldModule, MatInputModule, MatIconModule, PerfectScrollbarModule],
    exports: [XnCheckboxTreeComponent],
    entryComponents: [XnCheckboxTreeComponent],
    providers: [],
})
export class XnCheckboxTreeModule {}
