import { NgModule } from '@angular/core';
import { MatSlideToggleModule } from '@xn-control/light-material-ui/slide-toggle';
import { CommonModule } from '@angular/common';
import { XnDocumentTreeModule } from '@xn-control/xn-document-tree/xn-document-tree.module';
import { XnTranslationModule } from '@app/shared/components/translation/xn-translation.module';
import { FormsModule } from '@angular/forms';
import { TooltipModule } from 'ngx-bootstrap/tooltip';
import { MatRadioModule } from '@xn-control/light-material-ui/radio';
import { InvoiceApprovalConfirmHistoryComponent } from './history';
import { InvoiceApprovalConfirmUserComponent } from './user';
import { MatCheckboxModule } from '@xn-control/light-material-ui/checkbox';
import { MatInputModule } from '@xn-control/light-material-ui/input';
import { MatFormFieldModule } from '@xn-control/light-material-ui/form-field';
import { XnAgGridModule } from '@xn-control/xn-ag-grid';
import { ToasterModule } from 'angular2-toaster';
import { MatIconModule } from '@xn-control/light-material-ui/icon';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { MatMenuModule } from '@xn-control/light-material-ui/menu';
import { MatAutocompleteModule } from '@xn-control/light-material-ui/autocomplete';
import { AngularSplitModule } from 'angular-split';
import { XnEnterFormModule } from '@app/shared/directives/xn-enter-form';

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        MatSlideToggleModule,
        XnDocumentTreeModule,
        XnTranslationModule,
        TooltipModule.forRoot(),
        MatRadioModule,
        MatCheckboxModule,
        MatInputModule,
        MatFormFieldModule,
        XnAgGridModule,
        ToasterModule,
        MatIconModule,
        DragDropModule,
        MatMenuModule,
        MatAutocompleteModule,
        AngularSplitModule,
        XnEnterFormModule,
    ],
    exports: [InvoiceApprovalConfirmHistoryComponent, InvoiceApprovalConfirmUserComponent],
    declarations: [InvoiceApprovalConfirmHistoryComponent, InvoiceApprovalConfirmUserComponent],
    providers: [],
})
export class WidgetInvoiceApprovalConfirmModule {}
