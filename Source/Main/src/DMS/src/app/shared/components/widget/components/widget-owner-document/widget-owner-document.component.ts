import {
    AfterViewInit,
    Component,
    ElementRef,
    Input,
    OnDestroy,
    OnInit,
    TemplateRef,
    ViewChild,
    ViewContainerRef,
    Injector,
} from '@angular/core';
import { Router, ActivatedRoute, NavigationEnd } from '@angular/router';
import { BaseComponent } from '@app/pages/private/base';
import { InvoiceAprrovalService } from '@app/services';
import { ReducerManagerDispatcher, Store } from '@ngrx/store';
import { AppState } from '@app/state-management/store';
import { ToasterService } from 'angular2-toaster';
import { auditTime, filter, takeUntil } from 'rxjs/operators';
import { MonoTypeOperatorFunction, Observable } from 'rxjs';
import { FormStatus, IWidgetIsAbleToSave } from '@app/state-management/store/models/app-global/widget-is-able-to-save.payload.model';
import { ControlGridModel, SearchResultItemModel } from '@app/models';
import { AdministrationDocumentActionNames, CustomAction, DocumentThumbnailActions, LayoutInfoActions } from '@app/state-management/store/actions';
import { WidgetDynamicFormComponent } from '@app/xoonit-share/components/widget-dynamic-form/widget-dynamic-form.component';
import { defaultLanguage } from '@app/app.resource';
import { AppInjectWigetInstanceIsAbleToSaveAction } from '@app/state-management/store/actions/app-global/app-global.actions';
import * as processDataReducer from '@app/state-management/store/reducer/process-data';
import { get } from 'lodash-es';
import { BaseWidgetDynamicFormCommonAction } from '../base-widget-common-action';
import { XnSearchTableComponent } from '@app/xoonit-share/components/xn-search-table/xn-search-table.component';

const headerToolbar = 50;

@Component({
    selector: 'widget-owner-document',
    templateUrl: './widget-owner-document.component.html',
    styleUrls: ['./widget-owner-document.component.scss'],
})
export class WidgetOwnerDocumentComponent extends BaseWidgetDynamicFormCommonAction implements OnInit, AfterViewInit, OnDestroy, IWidgetIsAbleToSave {
    width: number = 0;
    height: number = 0;
    dataSource: ControlGridModel;
    isShowAddNew: boolean;
    hightlightKeywords: string = '';

    // Form
    public formMethodName = '';
    public formObjectName = '';
    public idMainDocument;
    public isEmpty = false;

    @Input() globalProperties: any;

    @ViewChild('ownerDocumentForm') ownerDocumentForm: WidgetDynamicFormComponent;
    @ViewChild('searchTemp') searchControl: XnSearchTableComponent;

    // private subscribe

    constructor(
        protected router: Router,
        private element: ElementRef,
        private dispatcher: ReducerManagerDispatcher,
        private invoiceApprovalService: InvoiceAprrovalService,
        private activatedRoute: ActivatedRoute,
        private appStore: Store<AppState>,
        private toasterService: ToasterService,
        protected containerRef: ViewContainerRef,
        protected injector: Injector,
    ) {
        super(injector, containerRef, router);
        this._subscribe();
    }

    ngOnInit(): void {
        this.parseConfigToWidthHeight();
        this.appStore.dispatch(new AppInjectWigetInstanceIsAbleToSaveAction(this));
    }

    private _subscribe() {
        this._registerRouterEvent(takeUntil(this.getUnsubscriberNotifier()), () => {
            const idMainDocument = this.activatedRoute.snapshot.queryParams['idDocument'];
            this.idMainDocument = idMainDocument;
            this.formMethodName = 'SpAppWg001InvoiceApproval';
            this.formObjectName = 'InfoDocumentOwner';
            if (!idMainDocument) {
                this.reset();
            }
        });

        this.dispatcher
            .pipe(
                filter((action: CustomAction) => {
                    return action.type === DocumentThumbnailActions.DOCUMENT_THUMBNAIL_NO_ITEM;
                }),
                takeUntil(this.getUnsubscriberNotifier()),
            )
            .subscribe((action: CustomAction) => {
                this.isEmpty = true;
            });
    }

    validateForm(): FormStatus {
        let formStatus = this.ownerDocumentForm.validateForm();

        return formStatus;
    }

    validateBeforeSave(): boolean {
        return true;
    }

    public getDataSave() {
        return {};
    }

    reset() {
        this.ownerDocumentForm?.setFormValue('Owner', '', 0);
        this.ownerDocumentForm?.reset();
    }

    ngOnDestroy(): void {
        super.onDestroy();
    }

    ngAfterViewInit(): void {
        super.ngAfterViewInit();
        const idMainDocument = this.activatedRoute.snapshot.queryParams['idDocument'];
        this.idMainDocument = idMainDocument;
        this.formMethodName = 'SpAppWg001InvoiceApproval';
        this.formObjectName = 'InfoDocumentOwner';
        if (idMainDocument) {
            this.isEmpty = false;
        }
        this.dispatcher
            .pipe(
                filter((action: CustomAction) => {
                    return action.type === LayoutInfoActions.RESIZE_SPLITTER;
                }),
                auditTime(100),
                takeUntil(this.getUnsubscriberNotifier()),
            )
            .subscribe((action: CustomAction) => {
                this.parseConfigToWidthHeight();
            });
    }

    private _registerRouterEvent(disposeWhen: MonoTypeOperatorFunction<any>, callback: () => void) {
        this.router.events.pipe(disposeWhen).subscribe((e) => {
            let currentRoute = this.activatedRoute.root;
            while (currentRoute.children[0] !== undefined) {
                currentRoute = currentRoute.children[0];
            }

            if (e instanceof NavigationEnd) {
                callback();
            }
        });
    }

    private parseConfigToWidthHeight() {
        try {
            this.width = $(this.element.nativeElement).parent().width();
            this.height = $(this.element.nativeElement).parent().height() - headerToolbar;
        } catch (error) {
            this.width = 0;
            this.height = 0;
        }
    }
    public onControlClick(event: any) {
        if (get(event, ['config', 'formControlName']) == 'Owner' && !this.idMainDocument) {
            this.searchControl.toggleSearch(true);
        }
    }
}
