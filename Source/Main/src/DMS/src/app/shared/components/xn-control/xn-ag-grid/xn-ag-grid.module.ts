import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { WjCoreModule } from 'wijmo/wijmo.angular2.core';
import { WjInputModule } from 'wijmo/wijmo.angular2.input';
import { XnAgGridComponent } from './pages/ag-grid-container/xn-ag-grid.component';
import { AgGridModule } from 'ag-grid-angular';
import { XnDragDropModule } from '../../../directives/xn-dragable';
import { TooltipModule } from 'ngx-bootstrap/tooltip';

import {
    CheckboxReadOnlyCellRenderer,
    CheckboxEditableCellRenderer,
    ControlCheckboxCellRenderer,
    DropdownCellRenderer,
    PriorityDropdownCellRenderer,
    CheckboxHeaderCellRenderer,
    DeleteCheckboxHeaderCellRenderer,
    NumericEditableCellRenderer,
    TemplateButtonCellRenderer,
    CountryFlagCellRenderer,
    IconCellRenderer,
    IconTextCellRenderer,
    DateCellRenderer,
    CustomPinnedRowRenderer,
    CustomHeaderCellRenderer,
    TranslationToolPanelRenderer,
    CreditCardCellRenderer,
    SelectAllCheckboxHeaderCellRenderer,
    XnAgGridHeaderComponent,
    TemplateHeaderCellRenderer,
    TemplateCellRenderer,
    TemplateEditCellRenderer,
    BaseHeaderCellRenderer,
    RefTextboxCellRenderer,
    MasterUnmergeCheckboxCellRenderer,
    LabelFormatCellRenderer,
    ImageTextCellRenderer,
    DownloadColCellRenderer,
    TagLabelsCellRenderer,
    DetailCellRenderer,
    ArticleSearchInlineCellRenderer,
    HistorySyncStatusRenderer,
    AutoCompleteCellRenderer,
    TableDropdownCellRenderer,
    FileCellRenderer,
    FileSizeCellRenderer,
} from './components';
import { XnDatePickerModule } from '../xn-date-picker';
import { XnInputDebounceModule } from '../xn-input-debounce/xn-input-debounce.module';
import { XnPagerModule } from '@app/shared/components/xn-pager';
import { MatCheckboxModule } from '../light-material-ui/checkbox';
import { MatButtonModule } from '../light-material-ui/button';
import { XnImageLoaderModule } from '@app/shared/directives/xn-image-loader';
import { MatFormFieldModule } from '@xn-control/light-material-ui/form-field';
import { MatAutocompleteModule } from '@xn-control/light-material-ui/autocomplete';
import { MatInputModule } from '@xn-control/light-material-ui/input';
import { MatIconModule } from '@xn-control/light-material-ui/icon';
import { ClickOutsideDirective, TableDropdownComponent, TableDropdownDirective } from '@xn-control/table-dropdown';
import { XnTranslationModule } from '../../translation/xn-translation.module';
import { LicenseManager } from 'ag-grid-enterprise';

// 'Evaluation_License_Not_For_Production_Valid_Until26_January_2019__MTU0ODQ2MDgwMDAwMA==21a7453ae27248a2d469f10e8f54b791',
LicenseManager.setLicenseKey(
    'Evaluation_License_Not_For_Production_Valid_Until26_January_2019__MTU0ODQ2MDgwMDAwMA==21a7453ae27248a2d469f10e18f54b791',
);

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        XnInputDebounceModule,
        AgGridModule.withComponents([
            CheckboxReadOnlyCellRenderer,
            CheckboxEditableCellRenderer,
            ControlCheckboxCellRenderer,
            DropdownCellRenderer,
            PriorityDropdownCellRenderer,
            CheckboxHeaderCellRenderer,
            DeleteCheckboxHeaderCellRenderer,
            SelectAllCheckboxHeaderCellRenderer,
            NumericEditableCellRenderer,
            TemplateButtonCellRenderer,
            CountryFlagCellRenderer,
            IconCellRenderer,
            IconTextCellRenderer,
            DateCellRenderer,
            CustomPinnedRowRenderer,
            CustomHeaderCellRenderer,
            TranslationToolPanelRenderer,
            CreditCardCellRenderer,
            TemplateHeaderCellRenderer,
            TemplateCellRenderer,
            TemplateEditCellRenderer,
            RefTextboxCellRenderer,
            MasterUnmergeCheckboxCellRenderer,
            LabelFormatCellRenderer,
            ImageTextCellRenderer,
            DownloadColCellRenderer,
            TagLabelsCellRenderer,
            DetailCellRenderer,
            ArticleSearchInlineCellRenderer,
            HistorySyncStatusRenderer,
            AutoCompleteCellRenderer,
            TableDropdownCellRenderer,
            FileCellRenderer,
            FileSizeCellRenderer,
        ]),
        WjCoreModule,
        WjInputModule,
        MatCheckboxModule,
        MatButtonModule,
        MatFormFieldModule,
        MatAutocompleteModule,
        MatInputModule,
        MatIconModule,
        XnDatePickerModule,
        XnDragDropModule,
        XnPagerModule,
        TooltipModule,
        XnImageLoaderModule,
        XnTranslationModule,
    ],
    declarations: [
        XnAgGridComponent,
        CheckboxReadOnlyCellRenderer,
        CheckboxEditableCellRenderer,
        ControlCheckboxCellRenderer,
        DropdownCellRenderer,
        PriorityDropdownCellRenderer,
        CheckboxHeaderCellRenderer,
        DeleteCheckboxHeaderCellRenderer,
        SelectAllCheckboxHeaderCellRenderer,
        NumericEditableCellRenderer,
        TemplateButtonCellRenderer,
        CountryFlagCellRenderer,
        IconCellRenderer,
        IconTextCellRenderer,
        DateCellRenderer,
        CustomPinnedRowRenderer,
        CustomHeaderCellRenderer,
        TranslationToolPanelRenderer,
        CreditCardCellRenderer,
        XnAgGridHeaderComponent,
        TemplateHeaderCellRenderer,
        TemplateCellRenderer,
        TemplateEditCellRenderer,
        BaseHeaderCellRenderer,
        RefTextboxCellRenderer,
        MasterUnmergeCheckboxCellRenderer,
        LabelFormatCellRenderer,
        ImageTextCellRenderer,
        DownloadColCellRenderer,
        TagLabelsCellRenderer,
        DetailCellRenderer,
        ArticleSearchInlineCellRenderer,
        HistorySyncStatusRenderer,
        AutoCompleteCellRenderer,
        TableDropdownCellRenderer,
        TableDropdownComponent,
        TableDropdownDirective,
        ClickOutsideDirective,
        FileCellRenderer,
        FileSizeCellRenderer,
    ],
    exports: [XnAgGridComponent, TableDropdownComponent, TableDropdownDirective, ClickOutsideDirective],
})
export class XnAgGridModule {}
