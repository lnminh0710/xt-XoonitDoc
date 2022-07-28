import { Component, TemplateRef, NgZone, ChangeDetectorRef, ViewChild, ElementRef, HostListener } from '@angular/core';
import { ICellEditorAngularComp } from 'ag-grid-angular';
import { BaseAgGridCellComponent } from '../../shared/base-ag-grid-cell-component';
import { Subscription } from 'rxjs';
import { Observable } from 'rxjs';
import { GridApi, ColumnApi, GridOptions } from 'ag-grid-community';
import { TemplateCellRenderer } from '../template-cell-renderer/template-cell-renderer.component';
import { Uti } from '@app/utilities';
import { DatatableService, SearchService, PropertyPanelService } from '@app/services';
import { AgGridService, IAgGridData } from '../../shared/ag-grid.service';
import { SearchInlineCellRenderer } from './search-inline-cell-renderer.component';
import { SearchType } from '../../shared/ag-grid-constant';

@Component({
    selector: 'search-inline-cell-renderer',
    templateUrl: './search-inline-cell-renderer.html',
    styleUrls: ['./search-inline-cell-renderer.scss'],
})
export class ArticleSearchInlineCellRenderer extends SearchInlineCellRenderer {
    //@HostListener('window:keyup', ['$event'])
    //keyEvent(event: KeyboardEvent) {
    //    console.log(event);
    //    if (event.keyCode === 13) {

    //    }
    //}

    constructor(
        protected ngzone: NgZone,
        protected cdref: ChangeDetectorRef,
        protected datatableService: DatatableService,
        private searchService: SearchService,
        private propertyPanelService: PropertyPanelService,
    ) {
        super(ngzone, cdref, datatableService);
    }

    getData(): Observable<any> {
        const searchWithStarProp = this.propertyPanelService.getItemRecursive(
            this.componentParent.globalProperties,
            'SearchWithStar',
        );
        const manualArticleProp = this.propertyPanelService.getItemRecursive(
            this.componentParent.globalProperties,
            'ManualArticle',
        );
        let isGetManualArticleNr;
        let keyword;
        if (manualArticleProp) {
            isGetManualArticleNr = manualArticleProp.value;
        }
        if (searchWithStarProp) {
            switch (searchWithStarProp.value) {
                case SearchType.Begin:
                    keyword = '*' + this.value;
                    break;
                case SearchType.End:
                    keyword = this.value + '*';
                    break;
                case SearchType.Both:
                    keyword = '*' + this.value + '*';
                    break;
            }
        }
        return this.searchService.searchArticle(keyword, 0, 100, isGetManualArticleNr);
    }

    processDataResponse(response) {
        if (!response.results || !response.results.length) {
            let item = this.params.node.data;
            const rs = this.componentParent.itemsAdded.indexOf(item);
            if (rs >= 0) {
                item['ArticleNr'] = response.payload;
                this.params.api.updateRowData({ update: [item] });
            }
            // this.params.api.stopEditing();
        }
    }

    selectItem(data) {
        if (this.componentParent) {
            let node = this.componentParent.getSelectedNode();
            if (node) {
                this.componentParent.startEditingCell(node.rowIndex, 'Quantity');
            }
        }
    }
}
