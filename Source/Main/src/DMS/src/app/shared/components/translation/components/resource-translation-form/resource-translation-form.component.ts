import { Component, OnInit, OnDestroy, EventEmitter, Input,
    Output, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import {
    GlobalSettingService, AppErrorHandler, DatatableService
} from '@app/services';
import { Uti } from '@app/utilities/uti';
import {XnAgGridComponent} from '@app/shared/components/xn-control/xn-ag-grid/pages/ag-grid-container/xn-ag-grid.component';

@Component({
    selector: 'resource-translation-form',
    styleUrls: ['./resource-translation-form.component.scss'],
    templateUrl: './resource-translation-form.component.html'
})
export class ResourceTranslationFormComponent implements OnInit, OnDestroy, AfterViewInit {
    public keyWordLocal: string = '';
    public translateData: any = {
        columns: [],
        data: []
    };

    @Input() defaultValue: string;
    @Input() set keyword(data: any) {
        this.keyWordLocal = data;
        this.execKeyword(data);
    }

    @Output() outputDataAction = new EventEmitter<any>();

    @ViewChild('xnAgGridComponent') public xnAgGridComponent: XnAgGridComponent;

    constructor(private globalSettingService: GlobalSettingService,
        private appErrorHandler: AppErrorHandler,
        private datatableService: DatatableService
        ) {
    }

    public ngOnInit() {

    }

    public ngOnDestroy() {

    }

    public ngAfterViewInit() {
      
    }

    public cellEdittingHandler(rowData: any) {
        setTimeout(() => {
            this.outputDataAction.emit(this.translateData.data);
        });
    }

    public stopEditing() {
        if (this.xnAgGridComponent) {
            this.xnAgGridComponent.stopEditing();
        }
        setTimeout(() => {
            this.outputDataAction.emit(this.translateData.data);
        }, 100);
    }

    /*************************************************************************************************/
    /***************************************PRIVATE METHOD********************************************/

    private execKeyword(keyword: string) {
        this.getTranslation(keyword);
    }

    private getTranslation(keyword: string) {
        this.globalSettingService.getTranslateLabelText(keyword, '', '', '5', '', '', '')
        .subscribe((response) => {
            this.appErrorHandler.executeAction(() => {
                if (!response || !response.data || !response.data.length) {
                    this.translateData = {
                        columns: this.translateData.columns,
                        data: []
                    };
                    return;
                }
                let rawData = this.datatableService.formatDataTableFromRawData(response.data);                    
                let dataSource = this.datatableService.buildDataSource(rawData);
                this.translateData = dataSource;
            });
        });
    }
}
