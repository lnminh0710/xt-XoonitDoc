import * as shape from 'd3-shape';

export interface ChartOption {
    pieChart: PieChartOption,
    barChart: BarChartOption,
    areaLineChart: AreaLineChart
}

export interface PieChartOption {
    gradients: boolean,
    showLegend: boolean,
    showDataLabel: boolean,
    disableTooltip: boolean,
    explodeSlices: boolean,
    legendTitle: string
}

export interface BarChartOption {
    showXAxis: boolean,
    showYAxis: boolean,
    showGirdLines: boolean,
    gradients: boolean,
    showLegend: boolean,
    legendTitle: string,
    showDataLabel: boolean,
    showXAxisLabel: boolean,
    xAxisLabel: string,
    disableTooltipBarChart: boolean,
    showYAxisLabel: boolean,
    yAxisLabel: string,
    paddingBetweenBars: string,
}

export interface AreaLineChart {
    showXAxisAreaLineChart: boolean,
    showYAxisAreaLineChart: boolean,
    showGirdLinesAreaLineChart: boolean,
    gradientsAreaLineChart: boolean,
    showLegendAreaLineChart: boolean,
    legendTitleAreaLineChart: string,
    showXAxisLabelAreaLineChart: boolean,
    xAxisLabelAreaLineChart: string,
    disableTooltipAreaLineChart: boolean,
    showYAxisLabelAreaLineChart: boolean,
    yAxisLabelAreaLineChart: string,
    autoScale: boolean,
    timeline: boolean,
    lineInterpolation: string,
}

export enum ChartTypeNgx {
    VerticalBarChart = 'Vertical Bar Chart',
    HorizontalBarChart = 'Horizontal Bar Chart',
    GroupedVerticalBarChart = 'Grouped Vertical Bar Chart',
    GroupedHorizontalBarChart = 'Grouped Horizontal Bar Chart',
    StackedVerticalBarChart = 'Stacked Vertical Bar Chart',
    StackedHorizontalBarChart = 'Stacked Horizontal Bar Chart',
    NormalizedVerticalBarChart = 'Normalized Vertical Bar Chart',
    NormalizedHorizontalBarChart = 'Normalized Horizontal Bar Chart',
    PieChart = 'Pie Chart',
    AdvancedPieChart = 'Advanced Pie Chart',
    PieGrid = 'Pie Grid',
    ComboChart = 'Combo Chart',
    LineChart = 'Line Chart',
    AreaChart = 'Area Chart',
    StackedAreaChart = 'Stacked Area Chart',
    NormalizedAreaChart = 'Normalized Area Chart'
}

export enum ColorChartType {
    Vivid = 'vivid',
    Natural = 'natural',
    Cool = 'cool',
    Fire = 'fire',
    Solar = 'solar',
    Air = 'air',
    Aqua = 'aqua',
    Flame = 'flame',
    Ocean = 'ocean',
    Forest = 'forest',
    Horizon = 'horizon',
    Neons = 'neons',
    Picnic = 'picnic',
    Night = 'night',
    NightLights = 'nightLights',
}

export const curves = {
    Basis: shape.curveBasis,
    'Basis Closed': shape.curveBasisClosed,
    Bundle: shape.curveBundle.beta(1),
    Cardinal: shape.curveCardinal,
    'Cardinal Closed': shape.curveCardinalClosed,
    'Catmull Rom': shape.curveCatmullRom,
    'Catmull Rom Closed': shape.curveCatmullRomClosed,
    Linear: shape.curveLinear,
    'Linear Closed': shape.curveLinearClosed,
    'Monotone X': shape.curveMonotoneX,
    'Monotone Y': shape.curveMonotoneY,
    Natural: shape.curveNatural,
    Step: shape.curveStep,
    'Step After': shape.curveStepAfter,
    'Step Before': shape.curveStepBefore,
    default: shape.curveLinear
};
