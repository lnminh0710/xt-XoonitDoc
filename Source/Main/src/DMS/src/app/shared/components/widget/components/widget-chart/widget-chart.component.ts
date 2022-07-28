import {Component, Input, OnInit, ViewEncapsulation} from '@angular/core';
import {BaseWidget} from '@app/pages/private/base';
import {ChartTypeNgx} from './chart.model';
import {WidgetChartService} from './widget-chart.service';
import {WidgetDetail, LayoutPageInfoModel} from '@app/models';
import cloneDeep from 'lodash-es/cloneDeep';

@Component({
    selector: 'chart-widget',
    styleUrls: ['./widget-chart.component.scss'],
    templateUrl: './widget-chart.component.html',
    encapsulation: ViewEncapsulation.None,
})

export class WidgetChartComponent extends BaseWidget implements OnInit {
    public _chartType: string;
    public _colorType: string;
    public _legendTitle: string;
    public _isGradient: boolean;
    public _showLegend: boolean;
    public _isTooltip: boolean;
    public _isLabel: boolean;
    public _isExplodeSlices: boolean;
    public _chartSeries: any;
    public proChartType: typeof ChartTypeNgx = ChartTypeNgx;
    public view: any[];
    public animations = true;
    public arcWidth = 0.25;
    public doughnut = false;
    private cachedData: any[];

    @Input() set chartType(chartType: string) {
        this._chartType = chartType;
    };

    @Input() set chartSeries(chartSeries: any) {
        this._chartSeries = chartSeries;

        this.buildChartData(this.widgetDetail, this.layoutInfo, this.chartObjData);
    };

    @Input() set scheme(colorType: string) {
        this._colorType = colorType;
    }

    @Input() set gradient(isGradient: boolean) {
        this._isGradient = isGradient;
    }

    @Input() set legend(showLegend: boolean) {
        this._showLegend = showLegend;
    }

    @Input() set legendTitle(legendTitle: string) {
        this._legendTitle = legendTitle;
    }

    @Input() set tooltipDisabled(isTooltip: boolean) {
        this._isTooltip = isTooltip;
    }

    @Input() set labels(isLabel: boolean) {
        this._isLabel = isLabel;
    }

    @Input() set explodeSlices(explodeSlices: boolean) {
        this._isExplodeSlices = explodeSlices;
    }

    // Bar Chart
    public _gradientsBarChart: boolean;
    public _showXAxis: boolean;
    public _showYAxis: boolean;
    public _showGirdLinesBarChart: boolean;
    public _showLegendBarChart: boolean;
    public _disableTooltip: boolean;
    public _showXAxisLabel: boolean;
    public _showYAxisLabel: boolean;
    public _xAxisLabel: string;
    public _yAxisLabel: string;
    public _paddingBetweenBars: string;
    public _legendTitleBarChart: string;

    @Input() set gradientsBarChart(gradientsBarChart: boolean) {
        this._gradientsBarChart = gradientsBarChart;
    }

    @Input() set showXAxis(showXAxis: boolean) {
        this._showXAxis = showXAxis;
    }

    @Input() set showYAxis(showYAxis: boolean) {
        this._showYAxis = showYAxis;
    }

    @Input() set showGirdLinesBarChart(showGirdLinesBarChart: boolean) {
        this._showGirdLinesBarChart = showGirdLinesBarChart;
    }

    @Input() set showLegendBarChart(showLegendBarChart: boolean) {
        this._showLegendBarChart = showLegendBarChart;
    }

    @Input() set disableTooltipBarChart(disableTooltip: boolean) {
        this._disableTooltip = disableTooltip;
    }

    @Input() set showXAxisLabel(showXAxisLabel: boolean) {
        this._showXAxisLabel = showXAxisLabel;
    }

    @Input() set xAxisLabel(xAxisLabel: string) {
        this._xAxisLabel = xAxisLabel;
    }

    @Input() set showYAxisLabel(showYAxisLabel: boolean) {
        this._showYAxisLabel = showYAxisLabel;
    }

    @Input() set yAxisLabel(yAxisLabel: string) {
        this._yAxisLabel = yAxisLabel;
    }

    @Input() set paddingBetweenBars(paddingBetweenBars: string) {
        this._paddingBetweenBars = paddingBetweenBars;
    }

    @Input() set legendTitleBarChart(legendTitleBarChart: string) {
        this._legendTitleBarChart = legendTitleBarChart;
    }

    // Area/Line Chart
    public _showXAxisAreaLineChart: boolean;
    public _showYAxisAreaLineChart: boolean;
    public _showGirdLinesAreaLineChart: boolean;
    public _gradientsAreaLineChart: boolean;
    public _showLegendAreaLineChart: boolean;
    public _disableTooltipAreaLineChart: boolean;
    public _showXAxisLabelAreaLineChart: boolean;
    public _xAxisLabelAreaLineChart: string;
    public _showYAxisLabelAreaLineChart: boolean;
    public _yAxisLabelAreaLineChart: string;
    public _legendTitleAreaLineChart: string;
    public _autoScale: boolean;
    public _timeline: boolean;
    public _lineInterpolation: string;

    @Input() set showXAxisAreaLineChart(showXAxisAreaLineChart: boolean) {
        this._showXAxisAreaLineChart = showXAxisAreaLineChart;
    }

    @Input() set showYAxisAreaLineChart(showYAxisAreaLineChart: boolean) {
        this._showYAxisAreaLineChart = showYAxisAreaLineChart;
    }

    @Input() set showGirdLinesAreaLineChart(showGirdLinesAreaLineChart: boolean) {
        this._showGirdLinesAreaLineChart = showGirdLinesAreaLineChart;
    }

    @Input() set gradientsAreaLineChart(gradientsAreaLineChart: boolean) {
        this._gradientsAreaLineChart = gradientsAreaLineChart;
    }

    @Input() set showLegendAreaLineChart(showLegendAreaLineChart: boolean) {
        this._showLegendAreaLineChart = showLegendAreaLineChart;
    }

    @Input() set disableTooltipAreaLineChart(disableTooltipAreaLineChart: boolean) {
        this._disableTooltipAreaLineChart = disableTooltipAreaLineChart;
    }

    @Input() set showXAxisLabelAreaLineChart(showXAxisLabelAreaLineChart: boolean) {
        this._showXAxisLabelAreaLineChart = showXAxisLabelAreaLineChart;
    }

    @Input() set xAxisLabelAreaLineChart(xAxisLabelAreaLineChart: string) {
        this._xAxisLabelAreaLineChart = xAxisLabelAreaLineChart;
    }

    @Input() set showYAxisLabelAreaLineChart(showYAxisLabelAreaLineChart: boolean) {
        this._showYAxisLabelAreaLineChart = showYAxisLabelAreaLineChart;
    }

    @Input() set yAxisLabelAreaLineChart(yAxisLabelAreaLineChart: string) {
        this._yAxisLabelAreaLineChart = yAxisLabelAreaLineChart;
    }

    @Input() set legendTitleAreaLineChart(legendTitleAreaLineChart: string) {
        this._legendTitleAreaLineChart = legendTitleAreaLineChart;
    }

    @Input() set autoScale(autoScale: boolean) {
        this._autoScale = autoScale;
    }

    @Input() set timeline(timeline: boolean) {
        this._timeline = timeline;
    }

    @Input() set lineInterpolation(lineInterpolation: string) {
        this._lineInterpolation = lineInterpolation;
    }

    @Input() set data(data: any) {
        this.widgetDetail = data;
    }

    @Input() set chartData(data: any[]) {
        this.chartObjData = data;

        this.buildChartData(this.widgetDetail, this.layoutInfo, this.chartObjData);
    }

    @Input() set layoutPageInfo(layoutPageInfo: LayoutPageInfoModel[]) {
        this.layoutInfo = layoutPageInfo;

        this.buildChartData(this.widgetDetail, this.layoutInfo, this.chartObjData);
    }

    private widgetDetail: WidgetDetail;
    private chartObjData: any[];
    private layoutInfo: LayoutPageInfoModel[] = [];
    public single: any[] = [];
    public multi: any[] = [];
    public dateData: any[];
    public dataPrint: any[];
    public columnPrint: any[];

    constructor(
        private widgetChartService: WidgetChartService
    ) {
        super();
    }

    ngOnInit() {
        this.view = undefined;
    }

    private buildChartData(widgetDetail: WidgetDetail, layoutPageInfo: LayoutPageInfoModel[], chartObjData) {
        if (layoutPageInfo && widgetDetail) {
            this.single = [];
            let widgetDetailData;
            if (widgetDetail.syncWidgetIds && widgetDetail.syncWidgetIds.length) {
                const parentWidgetId = widgetDetail.syncWidgetIds[0];
                let parentWidgetDetail: WidgetDetail;

                for (let i = 0; i < layoutPageInfo.length; i++) {
                    const parentWidget = layoutPageInfo[i].widgetboxesTitle.find(x => x.id == parentWidgetId);
                    if (parentWidget) {
                        parentWidgetDetail = parentWidget.widgetDetail;
                        break;
                    }
                }

                if (parentWidgetDetail) {
                    widgetDetailData = parentWidgetDetail.contentDetail.collectionData;
                    const columnSettings = parentWidgetDetail.contentDetail.columnSettings;
                    if (columnSettings) {
                        this.columnPrint = Object.keys(columnSettings).map(i => columnSettings[i].ColumnName);
                        this.dataPrint = widgetDetailData;
                    }
                }
                if (parentWidgetDetail && parentWidgetDetail['dataChanged'] &&
                    this._chartSeries.xSeries && this._chartSeries.xSeries.length > 0
                    && this._chartSeries.ySeries && this._chartSeries.ySeries.length > 0) {
                    delete parentWidgetDetail['dataChanged'][0].DT_RowId;
                    const xValue = this._chartSeries.xSeries;
                    const dataEdited = parentWidgetDetail['dataChanged'];
                    if (this.cachedData && this.cachedData.length > 0) {
                        const updateCached = this.cachedData.map((value) => {
                            dataEdited.forEach((valueEdit) => {
                                if (valueEdit[xValue] == value[xValue]) {
                                    value = {...valueEdit}
                                }
                            });
                            return value;
                        });
                        this.cachedData = [...updateCached];
                        this.dataPrint = this.cachedData;
                        // When connect chart with table in the first time that edit value of table
                        // Set value of table into chart
                    } else {
                        const data = widgetDetailData.map((value) => {
                            dataEdited.forEach((valueEdit) => {
                                if (valueEdit[xValue] == value[xValue]) {
                                    value = {...valueEdit}
                                }
                            });
                            return value;
                        });
                        this.cachedData = [...data];
                        this.dataPrint = this.cachedData;
                    }
                }
            } else if (chartObjData) {
                widgetDetailData = chartObjData.collectionData;
            }
            if (widgetDetailData) {
                switch (this._chartType) {
                    case ChartTypeNgx.PieChart:
                    case ChartTypeNgx.AdvancedPieChart:
                    case ChartTypeNgx.PieGrid:
                    case ChartTypeNgx.VerticalBarChart:
                    case ChartTypeNgx.HorizontalBarChart:
                        if (this.cachedData && this.cachedData.length > 0) {
                            return this.single = this.widgetChartService.buildSingleData(this.cachedData, this._chartSeries);
                        }
                        this.single = this.widgetChartService.buildSingleData(widgetDetailData, this._chartSeries);
                        break;
                    case ChartTypeNgx.GroupedVerticalBarChart:
                    case ChartTypeNgx.GroupedHorizontalBarChart:
                    case ChartTypeNgx.StackedVerticalBarChart:
                    case ChartTypeNgx.StackedHorizontalBarChart:
                    case ChartTypeNgx.NormalizedVerticalBarChart:
                    case ChartTypeNgx.NormalizedHorizontalBarChart:
                    case ChartTypeNgx.LineChart:
                    case ChartTypeNgx.StackedAreaChart:
                    case ChartTypeNgx.AreaChart:
                    case ChartTypeNgx.NormalizedAreaChart:
                        if (this.cachedData && this.cachedData.length > 0) {
                            return this.multi = this.widgetChartService.buildMultiData(this.cachedData, this._chartSeries);
                        }
                        this.multi = this.widgetChartService.buildMultiData(widgetDetailData, this._chartSeries);
                        break;

                    case ChartTypeNgx.ComboChart:
                        if (this.cachedData && this.cachedData.length > 0) {
                            this.single = this.widgetChartService.buildSingleData(this.cachedData, this._chartSeries);
                            this.multi = this.widgetChartService.buildMultiData(this.cachedData, {
                                xSeries: this._chartSeries.zSeries,
                                ySeries: this._chartSeries.kSeries
                            });
                            return;
                        }
                        this.single = this.widgetChartService.buildSingleData(widgetDetailData, this._chartSeries);
                        this.multi = this.widgetChartService.buildMultiData(widgetDetailData, {
                            xSeries: this._chartSeries.zSeries,
                            ySeries: this._chartSeries.kSeries
                        });
                        break;
                    default:
                        break;
                }
            }
        }
    }

    public refresh() {
        this.single = cloneDeep(this.single);
        this.multi = cloneDeep(this.multi);
    }
}
