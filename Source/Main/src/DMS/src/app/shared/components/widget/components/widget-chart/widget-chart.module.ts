import { NgModule } from '@angular/core';
import { BarChartsComponent } from './bar-charts/bar-charts.component';
import { NgxChartsModule } from '@swimlane/ngx-charts';
import { WidgetChartComponent } from './widget-chart.component';
import { CommonModule } from '@angular/common';
import { AreaLineChartComponent } from './area-line-charts/area-line-chart.component';
import { OtherChartsComponent } from './other-charts/other-charts.component';
import { ComboChartComponent } from './other-charts/combo-chart/combo-chart.component';
import { ComboSeriesVerticalComponent } from './other-charts/combo-chart/combo-series-vertical.component';
import { WidgetChartService } from './widget-chart.service';

@NgModule({
    imports: [
        CommonModule,
        NgxChartsModule,
    ],
    exports: [
        WidgetChartComponent,
        ComboChartComponent,
        ComboSeriesVerticalComponent,
        BarChartsComponent,
        AreaLineChartComponent,
        OtherChartsComponent],
    declarations: [
        WidgetChartComponent,
        ComboChartComponent,
        ComboSeriesVerticalComponent,
        BarChartsComponent,
        AreaLineChartComponent,
        OtherChartsComponent],
    providers: [
        WidgetChartService
    ]
})
export class WidgetChartModule {
}
