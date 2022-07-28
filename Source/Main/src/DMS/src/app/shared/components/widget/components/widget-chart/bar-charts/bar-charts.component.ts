import {Component, Input, OnInit, ViewEncapsulation} from '@angular/core';
import { BaseWidget } from '@app/pages/private/base';
import {ChartTypeNgx} from '../chart.model';

@Component({
    selector: 'xena-bar-chart',
    templateUrl: './bar-charts.component.html',
    encapsulation: ViewEncapsulation.None,
})

export class BarChartsComponent extends BaseWidget implements OnInit {
    public _chartType: string;
    public _colorType: string;
    public _single: string;
    public _multi: string;
    public _view: any[];
    public animations = true;
    public _gradient: boolean;
    public showXAxis: boolean;
    public showYAxis: boolean;
    public _disableTooltip: boolean;
    public _showGirdLines: boolean;
    public _showLegend: boolean;
    public _showXAxisLabel: boolean;
    public _showYAxisLabel: boolean;
    public _legendTitle: string;
    public _xAxisLabel: string;
    public _yAxisLabel: string;
    public _paddingBetweenBars: string;
    public proChartType: typeof ChartTypeNgx = ChartTypeNgx;
    @Input() set chartType(chartType: string) {
        this._chartType = chartType;
    };
    @Input() set scheme(colorType: string) {
        this._colorType = colorType;
    }
    @Input() set single(single: any) {
        this._single = single;
    }
    @Input() set multi(multi: any) {
        this._multi = multi;
    }
    @Input() set view(view: any[]) {
        this._view = view;
    }
    @Input() set gradients(gradient: boolean) {
        this._gradient = gradient;
    }
    @Input() set xAxis(xAxis: boolean) {
        this.showXAxis = xAxis;
    }
    @Input() set yAxis(yAxis: boolean) {
        this.showYAxis = yAxis;
    }
    @Input() set showGirdLines(showGirdLines: boolean) {
        this._showGirdLines = showGirdLines;
    }
    @Input() set showLegend(showLegend: boolean) {
        this._showLegend = showLegend;
    }
    @Input() set showXAxisLabel(showXAxisLabel: boolean) {
        this._showXAxisLabel = showXAxisLabel;
    }
    @Input() set showYAxisLabel(showYAxisLabel: boolean) {
        this._showYAxisLabel = showYAxisLabel;
    }
    @Input() set legendTitle(legendTitle: string) {
        this._legendTitle = legendTitle;
    }
    @Input() set disableTooltip(disableTooltip: boolean) {
        this._disableTooltip = disableTooltip
    }
    @Input() set xAxisLabel(xAxisLabel: string) {
        this._xAxisLabel = xAxisLabel;
    }
    @Input() set yAxisLabel(yAxisLabel: string) {
        this._yAxisLabel = yAxisLabel;
    }
    @Input() set paddingBetweenBars(paddingBetweenBars: string) {
        this._paddingBetweenBars = paddingBetweenBars;
    }
    constructor() {
        super();
    }

    ngOnInit() {
    }
}

