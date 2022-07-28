import { ChangeDetectionStrategy, Component, OnInit, OnDestroy, Input, ChangeDetectorRef, AfterViewInit } from '@angular/core';
import { BaseWidget } from '@app/pages/private/base';
import { Uti } from '@app/utilities';
import { UploadFileMode } from '@app/app.constants';
import { CommonService } from '@app/services';
import { TemplateColor, ReportBehavior } from '../widget-info/mixins/report-model/report.model';

declare var Stimulsoft: any;
declare var zip: any;

@Component({
    selector: 'report-widget',
    styleUrls: ['./widget-report.component.scss'],
    templateUrl: './widget-report.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class WidgetReportComponent extends BaseWidget implements OnInit, OnDestroy, AfterViewInit {
    viewer: any;
    report: any;
    options: any;
    public contentStyle: Object = {};
    public randomNumb: string = Uti.guid();
    public loading = true;
    private reportStyle: {
        templateColor: TemplateColor,
        reportFonts: any,
        reportBehavior: ReportBehavior
    } = {
            templateColor: null,
            reportFonts: null,
            reportBehavior: null
        }

    // If true , this form is displaying on Widget
    private _isActivated: boolean;
    @Input() set isActivated(status: boolean) {
        this._isActivated = status;
        if (!status) {
            this.changeDetectorRef.detach();
        }
        else {
            this.changeDetectorRef.reattach();
        }
    };

    get isActivated() {
        return this._isActivated;
    }

    @Input() set templateColor(templateColor: TemplateColor) {
        this.reportStyle.templateColor = templateColor;
        this.updateColor(templateColor);
    }

    @Input() set reportFonts(reportFonts: any) {
        this.reportStyle.reportFonts = reportFonts;
        this.updateFonts(reportFonts);
    }

    @Input() set reportBehavior(reportBehavior: ReportBehavior) {
        this.reportStyle.reportBehavior = reportBehavior;
        this.updateBehavior(reportBehavior);
    }

    constructor(
        private changeDetectorRef: ChangeDetectorRef,
        private commonService: CommonService
    ) {
        super();
    }

    public ngOnInit() {
    }

    ngAfterViewInit() {
        if (typeof Stimulsoft == "undefined" || typeof Stimulsoft.Viewer == 'undefined') {
            this.initReport();
        } else {
            this.loadReport();
        }
    }

    ngOnDestroy() {
        Uti.unsubscribe(this);
    }

    private initReport() {
        zip.installJS("public/assets/lib/stimulsoft/lib.zip", ["stimulsoft.reports.js", "stimulsoft.viewer.js"], () => {
            this.loadReport();
        });
    }

    private loadReport() {
        setTimeout(() => {
            this.renderReport();
        }, 50);
    }

    private renderReport() {
        this.loading = false;
        this.options = new Stimulsoft.Viewer.StiViewerOptions();
        this.options.appearance.fullScreenMode = false;
        this.options.toolbar.showSaveButton = false;
        this.options.toolbar.showOpenButton = false;

        this.viewer = new Stimulsoft.Viewer.StiViewer(this.options, 'StiViewer', false);

        this.viewer.renderHtml(this.randomNumb + '-report-viewer');

        this.changeDetectorRef.detectChanges();

        setTimeout(() => {
            this.loadReportFromFileName();
        }, 500);
    }

    private loadReportFromFileName() {
        this.report = new Stimulsoft.Report.StiReport();

        let templateUrl = Uti.getFileUrl(`\\\\file.xena.local\\XenaReporting\\report\\template\\TamTest.json`, UploadFileMode.Path);
        this.commonService.getFileByUrl(templateUrl).subscribe((json) => {
            this.report.load(json);

            this.viewer.report = this.report;

            if (this.reportStyle) {
                this.updateStyle(this.reportStyle);
            }
            this.changeDetectorRef.detectChanges();
        });
    }

    //public updateStyle(styleName: string) {
    //    let newStyle = new Stimulsoft.Report.Styles.StiStyle('Xena_Title');
    //    let newFont = new Stimulsoft.System.Drawing.Font('Arial', 20, 2);
    //    newStyle.font = newFont;
    //    this.viewer.report.styles.setByName('Xena_Title', newStyle);
    //    this.viewer.report.applyStyles();
    //}

    private updateStyle(newStyle) {
        if (newStyle.templateColor) {
            if (newStyle.templateColor.titles) {
                let rgb = this.hexToRgb(newStyle.templateColor.titles);

                let xenaTitleStyle = this.viewer.report.styles.getByName('Xena_Title');
                xenaTitleStyle.textBrush.color.r = rgb.r;
                xenaTitleStyle.textBrush.color.g = rgb.g;
                xenaTitleStyle.textBrush.color.b = rgb.b;
                this.viewer.report.styles.setByName('Xena_Title', xenaTitleStyle);

                let xenaTableHeaderStyle = this.viewer.report.styles.getByName('Xena_Table_Header');
                xenaTableHeaderStyle.textBrush.color.r = rgb.r;
                xenaTableHeaderStyle.textBrush.color.g = rgb.g;
                xenaTableHeaderStyle.textBrush.color.b = rgb.b;
                this.viewer.report.styles.setByName('Xena_Table_Header', xenaTableHeaderStyle);
                this.viewer.report.applyStyles();
            }

            if (newStyle.templateColor.text) {
                let rgb = this.hexToRgb(newStyle.templateColor.text);

                let xenaTextStyle = this.viewer.report.styles.getByName('Xena_Text');
                xenaTextStyle.textBrush.color.r = rgb.r;
                xenaTextStyle.textBrush.color.g = rgb.g;
                xenaTextStyle.textBrush.color.b = rgb.b;
                this.viewer.report.styles.setByName('Xena_Text', xenaTextStyle);

                let xenaCompanyTextStyle = this.viewer.report.styles.getByName('Xena_Company_Text');
                xenaCompanyTextStyle.textBrush.color.r = rgb.r;
                xenaCompanyTextStyle.textBrush.color.g = rgb.g;
                xenaCompanyTextStyle.textBrush.color.b = rgb.b;
                this.viewer.report.styles.setByName('Xena_Company_Text', xenaCompanyTextStyle);
                this.viewer.report.applyStyles();
            }
        }

        if (newStyle.reportFonts) {
            if (newStyle.reportFonts.fontFamily) {
                let xenaTextStyle = this.viewer.report.styles.getByName('Xena_Text');
                let newFont = new Stimulsoft.System.Drawing.Font(newStyle.reportFonts.fontFamily, xenaTextStyle.font.size);
                xenaTextStyle.font = newFont;
                this.viewer.report.styles.setByName('Xena_Text', xenaTextStyle);

                let xenaCompanyTextStyle = this.viewer.report.styles.getByName('Xena_Company_Text');
                newFont = new Stimulsoft.System.Drawing.Font(newStyle.reportFonts.fontFamily, xenaCompanyTextStyle.font.size);
                xenaCompanyTextStyle.font = newFont;
                this.viewer.report.styles.setByName('Xena_Company_Text', xenaCompanyTextStyle);

                let xenaTitleStyle = this.viewer.report.styles.getByName('Xena_Title');
                newFont = new Stimulsoft.System.Drawing.Font(newStyle.reportFonts.fontFamily, xenaTitleStyle.font.size);
                xenaTitleStyle.font = newFont;
                this.viewer.report.styles.setByName('Xena_Title', xenaTitleStyle);

                let xenaTableHeaderStyle = this.viewer.report.styles.getByName('Xena_Table_Header');
                newFont = new Stimulsoft.System.Drawing.Font(newStyle.reportFonts.fontFamily, xenaTableHeaderStyle.font.size);
                xenaTableHeaderStyle.font = newFont;
                this.viewer.report.styles.setByName('Xena_Table_Header', xenaTableHeaderStyle);

                this.viewer.report.applyStyles();
            }

            if (newStyle.reportFonts.fontSize) {
                let xenaTextStyle = this.viewer.report.styles.getByName('Xena_Text');
                let newFont = new Stimulsoft.System.Drawing.Font(xenaTextStyle.font.fontFamily.name, parseInt(newStyle.reportFonts.fontSize));
                xenaTextStyle.font = newFont;
                this.viewer.report.styles.setByName('Xena_Text', xenaTextStyle);
                this.viewer.report.applyStyles();
            }

            if (newStyle.reportFonts.headingFontSize) {
                let xenaTitleStyle = this.viewer.report.styles.getByName('Xena_Title');
                let newFont = new Stimulsoft.System.Drawing.Font(xenaTitleStyle.font.fontFamily.name, parseInt(newStyle.reportFonts.headingFontSize));
                xenaTitleStyle.font = newFont;
                this.viewer.report.styles.setByName('Xena_Title', xenaTitleStyle);
                this.viewer.report.applyStyles();
            }

            if (newStyle.reportFonts.recipientFontSize) {
                let xenaRecipientTextStyle = this.viewer.report.styles.getByName('Xena_Recipient_Text');
                let newFont = new Stimulsoft.System.Drawing.Font(xenaRecipientTextStyle.font.fontFamily.name, parseInt(newStyle.reportFonts.recipientFontSize));
                xenaRecipientTextStyle.font = newFont;
                this.viewer.report.styles.setByName('Xena_Recipient_Text', xenaRecipientTextStyle);
                this.viewer.report.applyStyles();
            }

            if (newStyle.reportFonts.companyFontSize) {
                let xenaCompanyTextStyle = this.viewer.report.styles.getByName('Xena_Company_Text');
                let newFont = new Stimulsoft.System.Drawing.Font(xenaCompanyTextStyle.font.fontFamily.name, parseInt(newStyle.reportFonts.companyFontSize));
                xenaCompanyTextStyle.font = newFont;
                this.viewer.report.styles.setByName('Xena_Company_Text', xenaCompanyTextStyle);
                this.viewer.report.applyStyles();
            }
        }
    }

    private updateColor(templateColor: TemplateColor) {
        if (this.viewer && this.report && templateColor) {
            this.loadReportFromFileName();
        }
    }

    private updateFonts(reportFonts: any) {
        if (this.viewer && this.report && reportFonts) {
            this.loadReportFromFileName();
        }
    }

    private updateBehavior(reportBehavior: ReportBehavior) {
        if (this.viewer && this.report && reportBehavior) {
            this.loadReportFromFileName();
        }
    }

    private hexToRgb(hex) {
        hex = hex.replace('#', '');
        var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? {
            r: parseInt(result[1], 16),
            g: parseInt(result[2], 16),
            b: parseInt(result[3], 16)
        } : null;
    }
}
