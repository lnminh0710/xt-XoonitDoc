import {
    WidgetDetail,
    WidgetPropertyModel,
    StyleFormatFieldEntity,
    Module,
    WidgetState
} from '@app/models';
import {
    PropertyPanelService
} from '@app/services';
import isNil from 'lodash-es/isNil';
import isEmpty from 'lodash-es/isEmpty';
import cloneDeep from 'lodash-es/cloneDeep';
import { Store } from '@ngrx/store';
import { AppState } from '@app/state-management/store';
import { PropertyPanelActions } from '@app/state-management/store/actions';
import { Constructor } from './constructor';
import { WidgetDetailInfo } from './widget-base-mixin';
import { ReportBehavior, TemplateColor } from './report-model/report.model';
import { ChartOption, ChartTypeNgx } from "../../widget-chart";

export interface PropertyServiceInjector {
    store: Store<AppState>,
    propertyPanelService: PropertyPanelService,
    propertyPanelActions: PropertyPanelActions
}

export function MixinWidgetProperty<T extends Constructor<PropertyServiceInjector>>(base: T) {
    abstract class AbstracPropertytBase extends base implements WidgetDetailInfo {
        public properties: WidgetPropertyModel[] = [];
        public propertiesForSaving: {
            version: string,
            properties: any[]
        } = {
                version: '',
                properties: []
            };

        public globalProperties: WidgetPropertyModel[];

        public title: any = {};
        public fieldFormatStyle: any = {};
        public dataFormatStyle: any = {};
        public templateColor: TemplateColor = {
            titles: null,
            lines: null,
            text: null
        };
        public reportFonts: any = {};
        public reportBehavior: ReportBehavior = {
            showAddress: false,
            showLogo: false,
            showLines: false,
            showPageNumbers: false
        };

        public chartTypes: any = {};
        public chartSeries: { xSeries: any[], ySeries: any[], zSeries: any[], kSeries: any[] } = { xSeries: [], ySeries: [], zSeries: [], kSeries: [] };
        public chartColorScheme: any = {};
        public optionChart: ChartOption = {
            pieChart: {
                disableTooltip: false,
                explodeSlices: false,
                gradients: false,
                legendTitle: null,
                showDataLabel: false,
                showLegend: false
            },
            barChart: {
                disableTooltipBarChart: false,
                gradients: false,
                legendTitle: null,
                paddingBetweenBars: null,
                showDataLabel: false,
                showGirdLines: false,
                showLegend: false,
                showXAxis: false,
                showYAxis: false,
                showXAxisLabel: false,
                xAxisLabel: null,
                showYAxisLabel: false,
                yAxisLabel: null
            },
            areaLineChart: {
                disableTooltipAreaLineChart: false,
                gradientsAreaLineChart: false,
                legendTitleAreaLineChart: null,
                showGirdLinesAreaLineChart: false,
                showLegendAreaLineChart: false,
                showXAxisAreaLineChart: false,
                showYAxisAreaLineChart: false,
                showXAxisLabelAreaLineChart: false,
                xAxisLabelAreaLineChart: null,
                showYAxisLabelAreaLineChart: false,
                yAxisLabelAreaLineChart: null,
                autoScale: false,
                timeline: false,
                lineInterpolation: null
            }
        }

        public widgetStyle: any = {
            border: null,
            borderColor: null,
            backgroundColor: null,
            globalBorder: null,
            globalBorderColor: null,
            globalBackgroundColor: null,
            showScrollBar: false,
            fieldStyle: {}
        }

        public customWidgetMenuStatusStyle: any = {
            backgroundColor: null,
            iconColor: null
        }

        public formStyle: any = {
            labelStyle: {},
            dataStyle: {}
        };

        public inlineLabelStyle: any = {};

        public importantFormStyle: any = {
            labelStyle: {},
            dataStyle: {},
            fields: {}
        };

        public gridStyle: any = {
            headerStyle: {},
            rowStyle: {}
        };

        // Display Date base on Country Code
        public supportDOBCountryFormat: boolean;

        constructor(...args: any[]) {
            super(...args);
        }

        // Implement interface WidgetDetailInfo Widget
        abstract get widgetStatesInfo(): Array<WidgetState>;
        abstract get dataInfo(): WidgetDetail;
        abstract get moduleInfo(): Module;
        abstract get showInDialogStatus(): boolean;
        abstract get widgetEditedStatus(): boolean;
        abstract get propertiesInfo(): WidgetPropertyModel[];

        /**
         * updateConnectedWidgetStatusProperty
         */
        protected updateConnectedWidgetStatusProperty(data: WidgetDetail) {
            // Get property info
            const withParkedItemProp = this.propertyPanelService.getItemRecursive(this.properties, 'WithParkedItem');
            const withWidgetProp = this.propertyPanelService.getItemRecursive(this.properties, 'WithWidget');
            const widgetNameProp = this.propertyPanelService.getItemRecursive(this.properties, 'WidgetName');

            // Connect to main: parked item
            if (data && data.widgetDataType
                && data.widgetDataType.listenKey.main
                && data.widgetDataType.listenKey.main.length) {
                if (withParkedItemProp) {
                    withParkedItemProp.value = true;
                }
                if (withWidgetProp) {
                    withWidgetProp.value = false;
                }
                if (widgetNameProp) {
                    widgetNameProp.value = '';
                }
            }
            // Connect to other widget
            else if (data && data.widgetDataType && data.widgetDataType.listenKey.sub) {
                if (withParkedItemProp) {
                    withParkedItemProp.value = false;
                }
                if (withWidgetProp) {
                    withWidgetProp.value = true;
                }
                if (widgetNameProp && data.widgetDataType.parentWidgetIds) {
                    widgetNameProp.value = data.widgetDataType.parentWidgetIds[0];
                }
            }
            else {
                if (withParkedItemProp) {
                    withParkedItemProp.value = false;
                }
                if (withWidgetProp) {
                    withWidgetProp.value = false;
                }
                if (widgetNameProp) {
                    widgetNameProp.value = '';
                }
            }
        }


        protected updateChartType() {
            const propChartType = this.propertyPanelService.getItemRecursive(this.properties, 'ChartType');
            if (propChartType && propChartType.value) {
                this.chartTypes = propChartType.value;
            }
        }

        protected updateSeries() {
            let chartType = this.propertyPanelService.getItemRecursive(this.properties, 'ChartType');

            let singleXSerie = this.propertyPanelService.getItemRecursive(this.properties, 'SingleXSerie');
            let singleYSerie = this.propertyPanelService.getItemRecursive(this.properties, 'SingleYSerie');
            let multiXSerie = this.propertyPanelService.getItemRecursive(this.properties, 'MultiXSerie');
            let multiYSeries = this.propertyPanelService.getItemRecursive(this.properties, 'MultiYSeries');
            let comboSingleXSerie = this.propertyPanelService.getItemRecursive(this.properties, 'ComboSingleXSerie');
            let comboSingleYSerie = this.propertyPanelService.getItemRecursive(this.properties, 'ComboSingleYSerie');
            let comboMultiXSerie = this.propertyPanelService.getItemRecursive(this.properties, 'ComboMultiXSerie');
            let comboMultiYSeries = this.propertyPanelService.getItemRecursive(this.properties, 'ComboMultiYSeries');
            let xValue: any[] = [],
                yValue: any[] = [];

            let willRefresh = false;

            if (chartType && chartType.dirty) {
                willRefresh = true;
                chartType.dirty = false;

                switch (chartType.value) {
                    case ChartTypeNgx.VerticalBarChart:
                    case ChartTypeNgx.HorizontalBarChart:
                    case ChartTypeNgx.PieChart:
                    case ChartTypeNgx.AdvancedPieChart:
                    case ChartTypeNgx.PieGrid:
                        singleXSerie.visible = true;
                        singleYSerie.visible = true;

                        multiXSerie.visible = false;
                        multiXSerie.value = null;
                        multiYSeries.visible = false;
                        multiYSeries.value.forEach(x => x.$checked = false);

                        comboSingleXSerie.visible = false;
                        comboSingleXSerie.value = null;
                        comboSingleYSerie.visible = false;
                        comboSingleYSerie.value = null;
                        comboMultiXSerie.visible = false;
                        comboMultiXSerie.value = null;
                        comboMultiYSeries.visible = false;
                        comboMultiYSeries.value.forEach(x => x.$checked = false);

                        break;

                    case ChartTypeNgx.GroupedVerticalBarChart:
                    case ChartTypeNgx.GroupedHorizontalBarChart:
                    case ChartTypeNgx.StackedVerticalBarChart:
                    case ChartTypeNgx.StackedHorizontalBarChart:
                    case ChartTypeNgx.NormalizedVerticalBarChart:
                    case ChartTypeNgx.NormalizedHorizontalBarChart:
                    case ChartTypeNgx.LineChart:
                        singleXSerie.visible = false;
                        singleXSerie.value = null;
                        singleYSerie.visible = false;
                        singleYSerie.value = null;

                        multiXSerie.visible = true;
                        multiYSeries.visible = true;

                        comboSingleXSerie.visible = false;
                        comboSingleXSerie.value = null;
                        comboSingleYSerie.visible = false;
                        comboSingleYSerie.value = null;
                        comboMultiXSerie.visible = false;
                        comboMultiXSerie.value = null;
                        comboMultiYSeries.visible = false;
                        comboMultiYSeries.value.forEach(x => x.$checked = false);

                        break;

                    case ChartTypeNgx.ComboChart:
                        singleXSerie.visible = false;
                        singleXSerie.value = null;
                        singleYSerie.visible = false;
                        singleYSerie.value = null;

                        multiXSerie.visible = false;
                        multiXSerie.value = null;
                        multiYSeries.visible = false;
                        multiYSeries.value.forEach(x => x.$checked = false);

                        comboSingleXSerie.visible = true;
                        comboSingleYSerie.visible = true;
                        comboMultiXSerie.visible = true;
                        comboMultiYSeries.visible = true;
                        break;
                }
            }


            switch (chartType.value) {
                case ChartTypeNgx.VerticalBarChart:
                case ChartTypeNgx.HorizontalBarChart:
                case ChartTypeNgx.PieChart:
                case ChartTypeNgx.AdvancedPieChart:
                case ChartTypeNgx.PieGrid:
                    xValue = singleXSerie.value ? [singleXSerie.value] : [];
                    yValue = singleYSerie.value ? [singleYSerie.value] : [];
                    this.chartSeries.xSeries = xValue;
                    this.chartSeries.ySeries = yValue;
                    break;

                case ChartTypeNgx.GroupedVerticalBarChart:
                case ChartTypeNgx.GroupedHorizontalBarChart:
                case ChartTypeNgx.StackedVerticalBarChart:
                case ChartTypeNgx.StackedHorizontalBarChart:
                case ChartTypeNgx.NormalizedVerticalBarChart:
                case ChartTypeNgx.NormalizedHorizontalBarChart:
                case ChartTypeNgx.LineChart:
                    xValue = multiXSerie.value ? [multiXSerie.value] : [];
                    yValue = multiYSeries.value;
                    this.chartSeries.xSeries = xValue;
                    this.chartSeries.ySeries = yValue.map(x => x.value);
                    break;

                case ChartTypeNgx.ComboChart:
                    xValue = comboSingleXSerie.value ? [comboSingleXSerie.value] : [];
                    yValue = comboSingleYSerie.value ? [comboSingleYSerie.value] : [];
                    let zValue = comboMultiXSerie.value ? [comboMultiXSerie.value] : [];
                    let kValue = comboMultiYSeries.value;
                    this.chartSeries.xSeries = xValue;
                    this.chartSeries.ySeries = yValue;
                    this.chartSeries.zSeries = zValue;
                    this.chartSeries.kSeries = kValue.map(x => x.value);
                    break;
            }

            this.chartSeries = cloneDeep(this.chartSeries);

            if (willRefresh) {
                setTimeout(() => {
                    this.store.dispatch(this.propertyPanelActions.clearProperties(this.moduleInfo));
                    this.store.dispatch(this.propertyPanelActions.togglePanel(this.moduleInfo, true, this.dataInfo, this.properties, false));
                });
            }
        }

        protected updateChartColorScheme() {
            const propChartColor = this.propertyPanelService.getItemRecursive(this.properties, 'ColorChart');
            if (propChartColor && propChartColor.value) {
                this.chartColorScheme = propChartColor.value;
            }
        }

        protected updateOptionsAreaLineChart() {
            const propShowXAxis = this.propertyPanelService.getItemRecursive(this.properties, 'ShowXAreaLine');
            const propShowYAxis = this.propertyPanelService.getItemRecursive(this.properties, 'ShowYAreaLine');
            const propShowGridLines = this.propertyPanelService.getItemRecursive(this.properties, 'ShowGridLinesAreaLine');
            const propGradients = this.propertyPanelService.getItemRecursive(this.properties, 'GradientsAreaLine');
            const propShowLegend = this.propertyPanelService.getItemRecursive(this.properties, 'ShowLegendAreaLine');
            const propDisableTooltip = this.propertyPanelService.getItemRecursive(this.properties, 'DisableTooltipAreaLine');
            const propLegendTitle = this.propertyPanelService.getItemRecursive(this.properties, 'LegendTitleAreaLine');
            const propShowXAxisLabel = this.propertyPanelService.getItemRecursive(this.properties, 'ShowXAxisLabelAreaLine');
            const propXAxisLabel = this.propertyPanelService.getItemRecursive(this.properties, 'XAxisLabelAreaLine');
            const propShowYAxisLabel = this.propertyPanelService.getItemRecursive(this.properties, 'ShowYAxisLabelAreaLine');
            const propYAxisLabel = this.propertyPanelService.getItemRecursive(this.properties, 'YAxisLabelAreaLine');
            const propAutoScale = this.propertyPanelService.getItemRecursive(this.properties, 'AutoScale');
            const propTimeline = this.propertyPanelService.getItemRecursive(this.properties, 'Timeline');
            const propLineInterpolation = this.propertyPanelService.getItemRecursive(this.properties, 'LineInterpolation');

            if (propShowXAxis) {
                this.optionChart.areaLineChart.showXAxisAreaLineChart = propShowXAxis.value;
            }
            if (propShowYAxis) {
                this.optionChart.areaLineChart.showYAxisAreaLineChart = propShowYAxis.value;
            }
            if (propShowGridLines) {
                this.optionChart.areaLineChart.showGirdLinesAreaLineChart = propShowGridLines.value;
            }
            if (propGradients) {
                this.optionChart.areaLineChart.gradientsAreaLineChart = propGradients.value;
            }
            if (propShowLegend) {
                this.optionChart.areaLineChart.showLegendAreaLineChart = propShowLegend.value;
            }
            if (propDisableTooltip) {
                this.optionChart.areaLineChart.disableTooltipAreaLineChart = propDisableTooltip.value;
            }
            if (propShowXAxisLabel) {
                this.optionChart.areaLineChart.showXAxisLabelAreaLineChart = propShowXAxisLabel.value;
            }
            if (propXAxisLabel) {
                this.optionChart.areaLineChart.xAxisLabelAreaLineChart = propXAxisLabel.value;
            }
            if (propShowYAxisLabel) {
                this.optionChart.areaLineChart.showYAxisLabelAreaLineChart = propShowYAxisLabel.value;
            }
            if (propYAxisLabel) {
                this.optionChart.areaLineChart.yAxisLabelAreaLineChart = propYAxisLabel.value;
            }
            if (propLegendTitle) {
                this.optionChart.areaLineChart.legendTitleAreaLineChart = propLegendTitle.value;
            }
            if (propAutoScale) {
                this.optionChart.areaLineChart.autoScale = propAutoScale.value;
            }
            if (propTimeline) {
                this.optionChart.areaLineChart.timeline = propTimeline.value;
            }
            if (propLineInterpolation) {
                this.optionChart.areaLineChart.lineInterpolation = propLineInterpolation.value;
            }
        }

        protected updateOptionsBarChart() {
            const propShowXAxis = this.propertyPanelService.getItemRecursive(this.properties, 'ShowX');
            const propShowYAxis = this.propertyPanelService.getItemRecursive(this.properties, 'ShowY');
            const propShowGridLines = this.propertyPanelService.getItemRecursive(this.properties, 'ShowGridLines');
            const propGradients = this.propertyPanelService.getItemRecursive(this.properties, 'Gradients');
            const propShowLegend = this.propertyPanelService.getItemRecursive(this.properties, 'ShowLegend');
            const propDisableTooltip = this.propertyPanelService.getItemRecursive(this.properties, 'DisableTooltip');
            const propLegendTitle = this.propertyPanelService.getItemRecursive(this.properties, 'LegendTitle');
            const propShowXAxisLabel = this.propertyPanelService.getItemRecursive(this.properties, 'ShowXAxisLabel');
            const propXAxisLabel = this.propertyPanelService.getItemRecursive(this.properties, 'XAxisLabel');
            const propShowYAxisLabel = this.propertyPanelService.getItemRecursive(this.properties, 'ShowYAxisLabel');
            const propYAxisLabel = this.propertyPanelService.getItemRecursive(this.properties, 'YAxisLabel');
            const propPaddingBetweenBars = this.propertyPanelService.getItemRecursive(this.properties, 'PaddingBetweenBars');

            if (propShowXAxis) {
                this.optionChart.barChart.showXAxis = propShowXAxis.value;
            }
            if (propShowYAxis) {
                this.optionChart.barChart.showYAxis = propShowYAxis.value;
            }
            if (propShowGridLines) {
                this.optionChart.barChart.showGirdLines = propShowGridLines.value;
            }
            if (propGradients) {
                this.optionChart.barChart.gradients = propGradients.value;
            }
            if (propShowLegend) {
                this.optionChart.barChart.showLegend = propShowLegend.value;
            }
            if (propDisableTooltip) {
                this.optionChart.barChart.disableTooltipBarChart = propDisableTooltip.value;
            }
            if (propShowXAxisLabel) {
                this.optionChart.barChart.showXAxisLabel = propShowXAxisLabel.value;
            }
            if (propXAxisLabel) {
                this.optionChart.barChart.xAxisLabel = propXAxisLabel.value;
            }
            if (propShowYAxisLabel) {
                this.optionChart.barChart.showYAxisLabel = propShowYAxisLabel.value;
            }
            if (propYAxisLabel) {
                this.optionChart.barChart.yAxisLabel = propYAxisLabel.value;
            }
            if (propPaddingBetweenBars) {
                this.optionChart.barChart.paddingBetweenBars = propPaddingBetweenBars.value;
            }
            if (propLegendTitle) {
                this.optionChart.barChart.legendTitle = propLegendTitle.value;
            }
        }

        protected updateOptionsPieChart() {
            const propGradients = this.propertyPanelService.getItemRecursive(this.properties, 'GradientsPie');
            const propShowLegend = this.propertyPanelService.getItemRecursive(this.properties, 'ShowLegendPie');
            const propShowDataLabel = this.propertyPanelService.getItemRecursive(this.properties, 'ShowLabelPie');
            const propDisableTooltip = this.propertyPanelService.getItemRecursive(this.properties, 'DisableTooltipPie');
            const propExplodeSlices = this.propertyPanelService.getItemRecursive(this.properties, 'ExplodeSlices');
            const propLegendTitle = this.propertyPanelService.getItemRecursive(this.properties, 'LegendTitlePie');
            if (propGradients) {
                this.optionChart.pieChart.gradients = propGradients.value;
            }
            if (propShowLegend) {
                this.optionChart.pieChart.showLegend = propShowLegend.value;
            }
            if (propShowDataLabel) {
                this.optionChart.pieChart.showDataLabel = propShowDataLabel.value;
            }
            if (propDisableTooltip) {
                this.optionChart.pieChart.disableTooltip = propDisableTooltip.value;
            }
            if (propExplodeSlices) {
                this.optionChart.pieChart.explodeSlices = propExplodeSlices.value;
            }
            if (propLegendTitle) {
                this.optionChart.pieChart.legendTitle = propLegendTitle.value;
            }
        }

        /**
         * updateWidgetTitle
         * @param title
         */
        protected updateWidgetTitle(title?: any) {
            const propTitleText = this.propertyPanelService.getItemRecursive(this.properties, 'TitleText');
            if (propTitleText && !isNil(propTitleText.value)) {
                if (title && !isNil(title.value)) {
                    propTitleText.value = title.value;
                    propTitleText.translatedValue = title.value;
                }

                this.title.value = propTitleText.translatedValue;
            }
        }

        /**
         * updateForEachFieldStyle
         */
        protected updateForEachFieldStyle() {
            const labelDisplayProp = this.propertyPanelService.getItemRecursive(this.properties, 'LabelDisplay');
            if (labelDisplayProp) {
                const fieldsEntity: Array<StyleFormatFieldEntity> = labelDisplayProp.value;
                if (fieldsEntity && fieldsEntity.length) {
                    fieldsEntity.forEach((item: StyleFormatFieldEntity) => {
                        let fieldStyle = {
                            labelStyle: {}
                        };
                        fieldStyle = this.propertyPanelService.updateWidgetFormStyle(item.stylePoperties, fieldStyle, 'labelStyle', 'DataLabelStyle');
                        this.fieldFormatStyle[item.originalColumnName] = fieldStyle;
                    });
                }
            }

            const dataDisplayProp = this.propertyPanelService.getItemRecursive(this.properties, 'DataDisplay');
            if (dataDisplayProp) {
                const dataFormatEntity: Array<StyleFormatFieldEntity> = dataDisplayProp.value;
                if (dataFormatEntity && dataFormatEntity.length) {
                    dataFormatEntity.forEach((item: StyleFormatFieldEntity) => {
                        let style = {
                            dataStyle: {}
                        };
                        style = this.propertyPanelService.updateWidgetFormStyle(item.stylePoperties, style, 'dataStyle', 'DataLabelStyle');
                        this.dataFormatStyle[item.originalColumnName] = style;
                    });
                }
            }
        }
        protected updateReportFont() {
            this.reportFonts = this.propertyPanelService.updateWidgetReportFont(this.properties, this.reportFonts);
        }
        /**
         * updateWidgetFormLabelStyle
         */
        protected updateWidgetFormLabelStyle() {
            this.formStyle = this.propertyPanelService.updateWidgetFormStyle(this.properties, this.formStyle, 'labelStyle', 'LabelStyle');
            this.inlineLabelStyle = this.propertyPanelService.updateInlineLabelStyle(this.properties, this.inlineLabelStyle);
        }

        /**
         * updateWidgetFormDataStyle
         * @param title
         */
        protected updateWidgetFormDataStyle(title?: any) {
            this.formStyle = this.propertyPanelService.updateWidgetFormStyle(this.properties, this.formStyle, 'dataStyle', 'DataStyle');
        }

        /**
         * updateWidgetFormImportantLabelStyle
         */
        protected updateWidgetFormImportantLabelStyle() {
            this.importantFormStyle = this.propertyPanelService.updateWidgetFormStyle(this.properties, this.importantFormStyle, 'labelStyle', 'ImportantLabelStyle');
        }

        /**
         * updateWidgetFormImportantDataStyle
         */
        protected updateWidgetFormImportantDataStyle() {
            this.importantFormStyle = this.propertyPanelService.updateWidgetFormStyle(this.properties, this.importantFormStyle, 'dataStyle', 'ImportantDataStyle');
        }

        /**
         * updateWidgetGridHeaderStyle
         */
        protected updateWidgetGridHeaderStyle() {
            this.gridStyle = this.propertyPanelService.updateWidgetFormStyle(this.properties, this.gridStyle, 'headerStyle', 'HeaderStyle');
        }

        /**
         * updateWidgetGridRowStyle
         * @param title
         */
        protected updateWidgetGridRowStyle(title?: any) {
            this.gridStyle = this.propertyPanelService.updateWidgetFormStyle(this.properties, this.gridStyle, 'rowStyle', 'RowStyle');
        }

        /**
         * updateImportantDisplayFields
         */
        protected updateImportantDisplayFields() {
            const _fieldFilters: any = {};
            const propDisplayFields: WidgetPropertyModel = this.propertyPanelService.getItemRecursive(this.properties, 'ImportantDisplayFields');
            if (propDisplayFields && propDisplayFields.options && propDisplayFields.options.length) {
                propDisplayFields.options.forEach((item) => {
                    if (item.selected) {
                        _fieldFilters[item.key] = true;
                    }
                });
                this.importantFormStyle.fields = _fieldFilters;
            }
        }

        /**
         * update behavior for Report
         */
        protected updateReportBehavior() {
            const reportShowAddress = this.propertyPanelService.getItemRecursive(this.properties, 'ShowAddress');
            const reportShowLogo = this.propertyPanelService.getItemRecursive(this.properties, 'ShowLogo');
            const reportLines = this.propertyPanelService.getItemRecursive(this.properties, 'ShowLines');
            const reportPageNumbers = this.propertyPanelService.getItemRecursive(this.properties, 'ShowPageNumbers');
            if (reportShowAddress) {
                this.reportBehavior.showAddress = reportShowAddress.value;
            }
            if (reportShowLogo) {
                this.reportBehavior.showLogo = reportShowLogo.value;
            }

            if (reportLines) {
                this.reportBehavior.showLines = reportLines.value;
            }
            if (reportPageNumbers) {
                this.reportBehavior.showPageNumbers = reportPageNumbers.value;
            }
        }

        /**
         * update templateColor for Report
         */
        protected updateTemplateColor() {
            const reportColorTitles = this.propertyPanelService.getItemRecursive(this.properties, 'ReportColorTitles');
            const reportColorLines = this.propertyPanelService.getItemRecursive(this.properties, 'ReportColorLines');
            const reportColorText = this.propertyPanelService.getItemRecursive(this.properties, 'ReportColorText');
            if (reportColorTitles && reportColorTitles.value !== this.templateColor.titles) {
                this.templateColor = Object.assign({}, this.templateColor, { titles: reportColorTitles.value })
            }
            if (reportColorLines && reportColorLines.value !== this.templateColor.lines) {
                this.templateColor = Object.assign({}, this.templateColor, { lines: reportColorLines.value })
            }
            if (reportColorText && reportColorText.value !== this.templateColor.text) {
                this.templateColor = Object.assign({}, this.templateColor, { text: reportColorText.value })
            }
        }

        /**
         * updateWidgetStyle
         */
        protected updateWidgetStyle() {
            const widgetStyleBorder = this.propertyPanelService.getItemRecursive(this.properties, 'WidgetStyleBorder');
            if (widgetStyleBorder) {
                if (widgetStyleBorder.value !== this.widgetStyle.border) {
                    this.widgetStyle.border = widgetStyleBorder.value;

                    if (this.widgetStyle.border !== null) {
                        this.widgetStyle.globalBorder = this.widgetStyle.border;
                    }
                }
            }

            const widgetStyleBorderColor = this.propertyPanelService.getItemRecursive(this.properties, 'WidgetStyleBorderColor');
            if (widgetStyleBorderColor) {
                if (widgetStyleBorderColor.value !== this.widgetStyle.borderColor) {
                    this.widgetStyle.borderColor = widgetStyleBorderColor.value;

                    if (!isEmpty(this.widgetStyle.borderColor)) {
                        this.widgetStyle.globalBorderColor = this.widgetStyle.borderColor;
                    }
                }
            }

            const widgetStyleBackgroundColor = this.propertyPanelService.getItemRecursive(this.properties, 'WidgetStyleBackgroundColor');
            if (widgetStyleBackgroundColor) {
                if (widgetStyleBackgroundColor.value !== this.widgetStyle.backgroundColor) {
                    this.widgetStyle.backgroundColor = widgetStyleBackgroundColor.value;

                    if (!isEmpty(this.widgetStyle.backgroundColor)) {
                        this.widgetStyle.globalBackgroundColor = this.widgetStyle.backgroundColor;
                    }
                }
            }

            const widgetStyleFieldStyle = this.propertyPanelService.getItemRecursive(this.properties, 'WidgetStyleFieldStyle');
            if (widgetStyleFieldStyle && widgetStyleFieldStyle.value && widgetStyleFieldStyle.value.length) {
                const fieldsEntity: Array<StyleFormatFieldEntity> = widgetStyleFieldStyle.value;
                let fieldStyle = {};
                fieldsEntity.forEach((item: StyleFormatFieldEntity) => {
                    let style = {
                        fieldStyle: {}
                    };
                    style = this.propertyPanelService.updateWidgetFormStyle(item.stylePoperties, style, 'fieldStyle', 'DataLabelStyle');
                    fieldStyle[item.originalColumnName] = style;
                });//for
                this.widgetStyle.fieldStyle = fieldStyle;
            }
        }

        /**
         * updateWidgetToolbarStyle
         */
        protected updateWidgetToolbarStyle() {
            const widgetToolbarBackgroundColor = this.propertyPanelService.getItemRecursive(this.properties, 'WidgetToolbarBackgroundColor');
            if (widgetToolbarBackgroundColor) {
                if (widgetToolbarBackgroundColor.value !== this.customWidgetMenuStatusStyle.backgroundColor) {
                    this.customWidgetMenuStatusStyle.backgroundColor = widgetToolbarBackgroundColor.value;

                    if (!isEmpty(this.customWidgetMenuStatusStyle.backgroundColor)) {
                        this.customWidgetMenuStatusStyle.globalBackgroundColor = this.customWidgetMenuStatusStyle.backgroundColor;
                    }
                }
            }

            const widgetToolbarIconColor = this.propertyPanelService.getItemRecursive(this.properties, 'WidgetToolbarIconColor');
            if (widgetToolbarIconColor) {
                if (widgetToolbarIconColor.value !== this.customWidgetMenuStatusStyle.iconColor) {
                    this.customWidgetMenuStatusStyle.iconColor = widgetToolbarIconColor.value;

                    if (!isEmpty(this.customWidgetMenuStatusStyle.iconColor)) {
                        this.customWidgetMenuStatusStyle.globalIconColor = this.customWidgetMenuStatusStyle.iconColor;
                    }
                }
            }
        }

        /**
         * updateDOBFormat
         */
        protected updateDOBFormat() {
            let propDOBFormatByCountry: WidgetPropertyModel = this.propertyPanelService.getItemRecursive(this.globalProperties, "DOBFormatByCountry");
            if (propDOBFormatByCountry) {
                this.supportDOBCountryFormat = propDOBFormatByCountry.value;
            }
            propDOBFormatByCountry = this.propertyPanelService.getItemRecursive(this.properties, "DOBFormatByCountry");
            if (propDOBFormatByCountry) {
                this.supportDOBCountryFormat = propDOBFormatByCountry.value;
            }
        }

        /**
         * checkForReadonlyGridDisplayMode
         */
        protected checkForReadonlyGridAutoSwitchToDetail() {
            let autoSwitchToDetail = this.propertyPanelService.getItemRecursive(this.properties, 'AutoSwitchToDetail');
            if (autoSwitchToDetail) {
                return autoSwitchToDetail.value;
            }
            return false;
        }

        /**
         * checkForReadonlyGridDisplayMode
         */
        protected checkForReadonlyGridMultipleRowDisplay() {
            let multipleRowDisplay = this.propertyPanelService.getItemRecursive(this.properties, 'MultipleRowDisplay');
            if (multipleRowDisplay) {
                return multipleRowDisplay.value;
            }

            return false;
        }

        /**
         * updatePropertiesFromGlobalProperties
         * @param globalProperties
         */
        protected updatePropertiesFromGlobalProperties(globalProperties) {
            this.widgetStyle = cloneDeep(this.widgetStyle);

            let globalBorder = this.propertyPanelService.getItemRecursive(globalProperties, 'Border');
            this.widgetStyle.globalBorder = globalBorder ? globalBorder.value : null;

            let globalBordreColor = this.propertyPanelService.getItemRecursive(globalProperties, 'BorderColor');
            this.widgetStyle.globalBorderColor = globalBordreColor ? globalBordreColor.value : null;

            let globalBackgroundColor = this.propertyPanelService.getItemRecursive(globalProperties, 'BackgroundColor');
            this.widgetStyle.globalBackgroundColor = globalBackgroundColor ? globalBackgroundColor.value : null;

            //let globalIsDisplay = this.propertyPanelService.getItemRecursive(globalProperties, 'IsDisplay');
            //this.title.globalIsDisplay = globalIsDisplay ? globalIsDisplay.value : null;

            //let globalColor = this.propertyPanelService.getItemRecursive(globalProperties, 'TitleStyleColor');
            //this.title.globalColor = globalColor ? globalColor.value : null;

            //let globalFontSize = this.propertyPanelService.getItemRecursive(globalProperties, 'TitleStyleFontSize');
            //this.title.globalFontSize = globalFontSize ? globalFontSize.value : null;

            //let globalFontName = this.propertyPanelService.getItemRecursive(globalProperties, 'TitleStyleFontName');
            //this.title.globalFontName = globalFontName ? globalFontName.value : null;

            //let globalWidgetToolbarBackgroundColor = this.propertyPanelService.getItemRecursive(globalProperties, 'WidgetToolbarBackgroundColor');
            //this.customWidgetMenuStatusStyle.globalBackgroundColor = globalWidgetToolbarBackgroundColor ? globalWidgetToolbarBackgroundColor.value : null;

            //let globalWidgetToolbarIconColor = this.propertyPanelService.getItemRecursive(globalProperties, 'WidgetToolbarIconColor');
            //this.customWidgetMenuStatusStyle.globalIconColor = globalWidgetToolbarIconColor ? globalWidgetToolbarIconColor.value : null;

            //const globalWidgetToolbarIconSize = this.propertyPanelService.getItemRecursive(globalProperties, 'WidgetToolbarIconSize');
            //this.customWidgetMenuStatusStyle.globalIconSize = globalWidgetToolbarIconSize ? globalWidgetToolbarIconSize.value : null;

            const showScrollBar = this.propertyPanelService.getItemRecursive(globalProperties, 'ShowScrollBar');
            this.widgetStyle.showScrollBar = showScrollBar ? showScrollBar.value : false;
        }
    };
    return AbstracPropertytBase;
}
