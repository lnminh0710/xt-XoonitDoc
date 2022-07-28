import {Component, Input, OnInit, ViewEncapsulation} from '@angular/core';
import { BaseWidget } from '@app/pages/private/base';
import {ChartTypeNgx, curves} from '../chart.model';

@Component({
    selector: 'xena-area-line-chart',
    templateUrl: './area-line-chart.component.html',
    encapsulation: ViewEncapsulation.None,
})

export class AreaLineChartComponent extends BaseWidget implements OnInit {
    public _chartType: string;
    public _colorType: string;
    public _multi: any;
    public _view: any[];
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
    public proChartType: typeof ChartTypeNgx = ChartTypeNgx;
    animations = true;

    @Input() set chartType(chartType: string) {
        this._chartType = chartType;
    };
    @Input() set view(view: any[]) {
        this._view = view;
    };
    @Input() set scheme(colorType: string) {
        this._colorType = colorType;
    }
    @Input() set multi(multi: string) {
        this._multi = multi;
    }

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
        const curveType = this.getInterpolationType(lineInterpolation);
        this._lineInterpolation = curveType;
    }


    getInterpolationType(curveType: string) {
        return curves[curveType]
    }

    constructor() {
        super();
    }

    ngOnInit() {
    }

}

