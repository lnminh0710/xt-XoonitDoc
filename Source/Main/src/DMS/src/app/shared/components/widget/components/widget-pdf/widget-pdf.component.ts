import {
    Component,
    Input,
    OnInit,
    ViewEncapsulation,
    ViewChild,
    OnChanges,
    OnDestroy
} from "@angular/core";
import { Configuration } from "@app/app.constants";
import { WjPdfViewer } from "wijmo/wijmo.angular2.viewer";
import { Subscription, Observable } from "rxjs";
import { AppState } from "@app/state-management/store";
import { Store, ReducerManagerDispatcher } from "@ngrx/store";

import * as processDataReducer from "@app/state-management/store/reducer/process-data";
import { Module } from "@app/models";
import { XnCommonActions, CustomAction } from "@app/state-management/store/actions";
import { Uti } from "@app/utilities";
import { PdfService } from "@app/services";
import { filter, map } from "rxjs/operators";
@Component({
    selector: "pdf-widget",
    styleUrls: ["./widget-pdf.component.scss"],
    templateUrl: "./widget-pdf.component.html",
    encapsulation: ViewEncapsulation.None
})
export class WidgetPdfComponent implements OnInit, OnChanges, OnDestroy {
    public pdfApiUrl: string = Configuration.PublicSettings.pdfApiUrl;
    public pdfUrl: string;
    private selectedEntityStateSubscription: Subscription;
    private loadPdfStateSubscription: Subscription;
    private selectedEntityState: Observable<any>;

    private columns: Array<string> = ["invoicepdf", "pdf"];

    @Input() set rowData(data: any) {
        this.execRowData(data);
    }
    @Input() currentModule: Module;
    @ViewChild(WjPdfViewer) wjPdfViewer: WjPdfViewer;

    constructor(protected store: Store<AppState>,
        private dispatcher: ReducerManagerDispatcher,
        private pdfService: PdfService
    ) {
        this.selectedEntityState = store.select(
            state =>
                processDataReducer.getProcessDataState(
                    state,
                    this.currentModule.moduleNameTrim
                ).selectedEntity
        );
    }

    public ngOnInit() {
        this.subscribeSelectedEntityState();
        this.subscribeLoadPdfState();
    }

    public ngOnDestroy() {
        Uti.unsubscribe(this);
        this.pdfService.isWidgetPdfAlive = false;
    }

    ngOnChanges(): void { }

    private subscribeLoadPdfState() {
        this.loadPdfStateSubscription = this.dispatcher
            .pipe(
                filter((action: CustomAction) => {
                    return action.type === XnCommonActions.LOAD_PDF;
                }),
                map((action: CustomAction) => {
                    return action.payload;
                }),
            ).subscribe((pdfUrl) => {
            if (pdfUrl) {
                this.pdfService.isWidgetPdfAlive = true;
                this.pdfUrl = pdfUrl;
            }
        });
    }

    private subscribeSelectedEntityState() {
        if (this.selectedEntityStateSubscription) {
            this.selectedEntityStateSubscription.unsubscribe();
        }
        this.selectedEntityStateSubscription = this.selectedEntityState.subscribe(
            (selectedEntityState: any) => {
                if (selectedEntityState && selectedEntityState.pathFolder && selectedEntityState.fileName) {
                    var x = (
                        selectedEntityState.pathFolder +
                        "\\" +
                        selectedEntityState.fileName
                    )
                        .replace(Configuration.PublicSettings.fileShareUrl, "")
                        .replace("\\\\file.xena.local", "");
                    this.pdfUrl = x;
                }
            }
        );
    }

    private execRowData(rowData: any) {
        if (!rowData || !rowData.data) {
            return;
        }
        for (const fileName of rowData.data) {
            if (
                !fileName.key ||
                this.columns.indexOf(fileName.key.toLowerCase()) === -1
            ) {
                continue;
            }
            this.pdfUrl = (fileName.value || "").replace(
                Configuration.PublicSettings.fileShareUrl,
                ""
            );
            return;
        }
    }

    public refresh() {
        if (this.wjPdfViewer) {
            this.wjPdfViewer.refresh();
        }
    }
}
