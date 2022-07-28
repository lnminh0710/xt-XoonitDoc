import {
    Component,
    OnInit,
    AfterViewInit,
    Input,
    Output,
    OnChanges,
    OnDestroy,
    ViewChild,
    SimpleChanges,
    EventEmitter,
    TemplateRef,
} from '@angular/core';
import { BaseComponent } from '@app/pages/private/base';
import { Router } from '@angular/router';
import { ScheduleEvent, MessageModel } from '@app/models';
import { MessageModal, DateConfiguration } from '@app/app.constants';
import { ModalService, AppErrorHandler } from '@app/services';
import * as wjcCore from 'wijmo/wijmo';
import * as wjcGrid from 'wijmo/wijmo.grid';
import find from 'lodash-es/find';
import reject from 'lodash-es/reject';
import cloneDeep from 'lodash-es/cloneDeep';
import sortBy from 'lodash-es/sortBy';
import filter from 'lodash-es/filter';
import uniqBy from 'lodash-es/uniqBy';
import groupBy from 'lodash-es/groupBy';
import isNil from 'lodash-es/isNil';
import { format } from 'date-fns/esm';
import { Uti } from '@app/utilities/uti';
import { TemplateCellRenderer } from '@app/shared/components/xn-control/xn-ag-grid/components/template-cell-renderer/template-cell-renderer.component';
import { ColDef, GridApi, GridOptions, ITooltipParams } from 'ag-grid-community';

@Component({
    selector: 'schedule-setting-grid',
    styleUrls: ['./schedule-setting-grid.component.scss'],
    templateUrl: './schedule-setting-grid.component.html',
})
export class ScheduleSettingGridComponent extends BaseComponent implements OnInit, AfterViewInit, OnChanges, OnDestroy {
    public SCHEDULE_TYPE = DateConfiguration.SCHEDULE_TYPE;
    public allowMerging = wjcGrid.AllowMerging.All;
    public nextScheduleEvent: ScheduleEvent = new ScheduleEvent();
    public dayOfWeekEnum: Array<string> = DateConfiguration.WEEK_DAY;
    public gridColumns: Array<any> = [];
    public defaultColDef: any = {
        sortable: true,
        resizable: true,
        filter: true,
    };
    public gridOptions: GridOptions;
    public popupParent;

    private _api: GridApi;

    @ViewChild('scheduleEventGrid') scheduleEventGrid: wjcGrid.FlexGrid;
    @ViewChild('deleteButton') deleteButton: TemplateRef<any>;

    @Input() scheduleType: any;
    @Input() globalDateFormat: string = 'MM/dd/yyyy';
    @Input() scheduleEventGridData: Array<ScheduleEvent>;

    @Output() onDeleteAction: EventEmitter<any> = new EventEmitter();

    constructor(private _modalService: ModalService, router?: Router) {
        super(router);
    }
    public ngOnInit() {
        this.initGrid();
        this.buildContextMenuItems = this.buildContextMenuItems.bind(this);
        this.popupParent = document.querySelector('body');
    }
    public ngOnDestroy() {}
    public ngAfterViewInit() {
        this.gridColumns = this.createColumns();
    }
    public ngOnChanges(changes: SimpleChanges) {
        if (changes.hasOwnProperty('scheduleEventGridData')) {
            this.makeScheduleGridData();
        }
    }
    public scheduleEventGridDeleteRow($event): void {
        const item = this.scheduleEventGridData.find((x) => x.id == $event);
        this._modalService.confirmMessageHtmlContent(
            new MessageModel({
                headerText: 'Delete Event',
                messageType: MessageModal.MessageType.error,
                message: [
                    { key: '<p>' },
                    { key: 'Modal_Message___DoYouWantToDeleteEvent' },
                    { key: ' ' + item.on },
                    { key: ' - ' },
                    { key: item.at },
                    { key: '?</p>' },
                ],
                buttonType1: MessageModal.ButtonType.danger,
                callBack1: () => {
                    this.scheduleEventGridData = reject(this.scheduleEventGridData, {
                        id: $event,
                    });
                    this.onDeleteAction.emit($event);
                    this.scheduleEventGridData = sortBy(this.scheduleEventGridData, ['sort', 'at']);
                    this.callExpandNodeByData([item.on]);
                },
            }),
        );
    }
    public makeScheduleGridData() {
        if (!this.gridColumns || !this.gridColumns.length) return;
        this.scheduleEventGridData = sortBy(this.scheduleEventGridData, ['sort', 'at']);
        if (this._api) {
            this._api.sizeColumnsToFit();
        }
    }
    public onReady(params) {
        this._api = params.api;
        this._api.sizeColumnsToFit();
    }
    public callExpandNodeByData(ons: Array<any>, isAll?: boolean) {
        setTimeout(() => {
            this._api.forEachNode(function (node) {
                if (isAll) {
                    node.setExpanded(true);
                } else {
                    for (let on of ons) {
                        if (on instanceof Date) {
                            if (
                                Uti.joinDateToNumber(on, 'yyyyMMdd') ===
                                Uti.joinDateToNumber(new Date(node.key), 'yyyyMMdd')
                            ) {
                                node.setExpanded(true);
                                break;
                            }
                        } else if (on == node.key) {
                            node.setExpanded(true);
                            break;
                        }
                    }
                }
            });
        }, 300);
    }
    public buildContextMenuItems() {
        return [
            'copy',
            // 'copyWithHeaders',
            {
                name: 'Copy row',
                action: (event) => {
                    this._api.copySelectedRowsToClipboard();
                },
                cssClasses: [''],
                icon: `<i class="fa  fa-clipboard  blue-color  ag-context-icon"/>`,
            },
            // { // TamTV with new version copySelectedRowsToClipboard don't have function copy with header
            //     name: 'Copy row with Headers',
            //     action: (event) => {
            //         this._api.copySelectedRowsToClipboard(true);
            //     },
            //     cssClasses: [''],
            //     icon: `<i class="fa  fa-clipboard  blue-color  ag-context-icon"/>`,
            // },
            'paste',
            'separator',
            'export',
        ];
    }
    /*************************************************************************************************/
    /***************************************PRIVATE METHOD********************************************/

    /**
     * initGrid
     * */
    private initGrid() {
        if (this.gridOptions) {
            this.gridOptions = null;
        }
        this.gridOptions = <GridOptions>{
            onFirstDataRendered: (params) => {
                params.api.sizeColumnsToFit();
            },
            context: {
                componentParent: this,
            },
        };
    }

    private buildTooltip(params: ITooltipParams) {
        if (!params || !params.context || !params.data || !params.context.componentParent) return null;
        if (params.context.componentParent.customTooltip) {
            return (
                params.context.componentParent.customTooltip.preText +
                params.data[params.context.componentParent.customTooltip.fieldName]
            );
        }

        if (typeof params.data[(params.colDef as any).field] !== 'object') {
            return params.data[(params.colDef as any).field];
        } else if (
            params.data[(params.colDef as any).field] &&
            params.data[(params.colDef as any).field].hasOwnProperty('key')
        ) {
            return params.data[(params.colDef as any).field].value;
        }

        return null;
    }
    private createColumns(): Array<any> {
        return [
            {
                headerName: 'On',
                showRowGroup: 'on',
                cellRenderer: 'agGroupCellRenderer',
                filterValueGetter: function (params) {
                    return params.data ? params.data.on : null;
                },
            },
            {
                field: 'on',
                rowGroup: true,
                hide: true,
                valueFormatter: this.dateFormatter.bind(this),
            },
            {
                headerName: 'At',
                field: 'at',
            },
            {
                headerName: 'Email',
                field: 'email',
                tooltip: this.buildTooltip.bind(this),
            },
            {
                headerName: 'Parameter',
                field: 'parameter',
                tooltip: this.buildTooltip.bind(this),
                hide: true,
            },
            {
                headerName: 'Delete',
                field: 'delete',
                cellRendererFramework: TemplateCellRenderer,
                editable: false,
                cellRendererParams: {
                    ngTemplate: this.deleteButton,
                },
                width: 50,
                maxWidth: 50,
                minWidth: 50,
            },
        ];
    }

    private dateFormatter(params) {
        try {
            const result = params.value instanceof Date ? format(params.value, this.globalDateFormat) : params.value;
            return result;
        } catch {}
        return params.value;
    }
}
