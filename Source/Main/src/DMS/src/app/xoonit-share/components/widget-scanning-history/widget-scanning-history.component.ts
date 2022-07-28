import {
    Component,
    OnInit,
    ViewChild,
    AfterViewInit,
    OnDestroy,
    ChangeDetectorRef,
    ElementRef,
    ChangeDetectionStrategy,
    SkipSelf,
    Input,
} from '@angular/core';
import { BaseComponent } from '@app/pages/private/base';
import { Router } from '@angular/router';
import { DocumentTreeModel } from '@app/models/administration-document/document-tree.payload.model';
import { UserRoles } from '@app/app.constants';
import { IPageChangedEvent } from '@app/shared/components/xn-pager';
import { AppState } from '@app/state-management/store';
import { Store } from '@ngrx/store';
import { Observable, Observer, Subject } from 'rxjs';
import * as moment from 'moment';
import { switchMap, takeUntil, take, filter } from 'rxjs/operators';
import { of } from 'rxjs/observable/of';
import { isNullOrUndefined } from 'util';
import { cloneDeep } from 'lodash-es';
import {
    MatAutocompleteSelectedEvent,
    MatAutocomplete,
    MatAutocompleteTrigger,
} from '@app/shared/components/xn-control/light-material-ui/autocomplete';
import { UserService } from '@app/services';
import { AdministrationDocumentSelectors } from '@app/state-management/store/reducer';
import { User, DropdownListModel, ControlGridModel, ControlGridColumnModel } from '@app/models';
import { ColumnDefinition } from '@app/models/common/column-definition.model';
import { XnAgGridComponent } from '@xn-control/xn-ag-grid/pages/ag-grid-container/xn-ag-grid.component';
import { HistorySelectors } from '@app/pages/history/history.statemanagement/history.selectors';
import {
    HistoryActionNames,
    HistorySuccessAction,
    GetScanningHistoryAction,
    GetControlsFilter,
    GetHistoryUser,
    GetScanningHistoryDetailAction,
} from '@app/pages/history/history.statemanagement/history.actions';
import { HistoryDetailParameters } from './models/history-detail-parameters.model';
import { ScanningHistoryFilter } from '@app/pages/history/history.statemanagement/model/payload/scanning-history-filter.payload.model';
import { HistoryUser } from '@app/pages/history/history.statemanagement/model/payload/history-user.model';
import {
    ScanningHistoryTotalSummary,
    HistoryAgGridModel,
} from '@app/pages/history/history.statemanagement/model/payload/history-ag-grid.model';
import { BsDatepickerConfig } from 'ngx-bootstrap/datepicker';
import { AppSelectors } from '@app/state-management/store/reducer/app';
import { XnBsDatepickerComponent } from '@app/xoonit-share/components/xn-bs-datepicker/xn-bs-datepicker.component';
import { XnInputTypeaheadComponent } from '@app/xoonit-share/components/xn-input-typeahead/xn-input-typeahead.component';
import { XnNgxDropdownComponent } from '../xn-ngx-dropdown/xn-ngx-dropdown.component';
import { IPageEvent } from '../xn-pagination-grid/models/page-event.model';
import { HistoryDetailAgGridModel } from '@app/pages/history/history.statemanagement/model/payload/history-detail-ag-grid.model';

@Component({
    selector: 'widget-scanning-history',
    templateUrl: './widget-scanning-history.component.html',
    styleUrls: ['./widget-scanning-history.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    host: {
        '(window:resize)': 'windowResize($event)',
    },
})
export class WidgetScanningHistoryComponent extends BaseComponent implements OnInit, OnDestroy, AfterViewInit {
    private _filter: ScanningHistoryFilter;
    private _fromDate: Date;
    private _toDate: Date;
    private _userId: number;
    private _filterUsername: string;
    private _subjectDataSourceUsers = new Subject<HistoryUser[]>();
    private _observableDataSource$: Observable<HistoryUser[]>;
    private _typeaheadValue: string;

    public isLoading = false;
    public userLogin: User;
    public docTypes: DocumentTreeModel[];
    public companiesList: DropdownListModel[];
    public dataAutoCompleteCompaniesList: DropdownListModel[];
    public dataSourceUsers$: Observable<HistoryUser[]>;
    public selectedDocType: DocumentTreeModel;

    public selectedCompany: DropdownListModel;
    public autoCompleteDropdownModel: DropdownListModel;

    // HISTORY LIST: public typeaheadValue: string;
    public bsConfig: Partial<BsDatepickerConfig>;
    public dataSource: ControlGridModel;
    public page: number;
    public pageSize: number;
    public totalPages: number;
    public totalSummary: ScanningHistoryTotalSummary;
    public noResults: boolean;
    public hasFiltered: boolean;
    public controlsFilter: ColumnDefinition[];
    public hiddenStatisticScanning: boolean;
    public isShownHistoryDetailPage: boolean = false;

    // HISTORY DETAIL
    public dataSourceDetail: ControlGridModel;
    public detailTitle: string = '';

    public set typeaheadValue(val: string) {
        this._typeaheadValue = val;
    }

    public get typeaheadValue() {
        return this._typeaheadValue;
    }

    public UserRolesEnum = UserRoles;

    public controlsName = {
        company: 'COMPANY',
    };

    public controlsOnFocus = {
        COMPANY: false,
    };
    public controlsOnHover = {
        COMPANY: false,
    };

    @Input() globalProperties: any;

    @ViewChild('topPanelStatisticScanning') topPanelStatisticScanning: ElementRef;
    @ViewChild('dpFrom') dpFrom: XnBsDatepickerComponent;
    @ViewChild('dpTo') dpTo: XnBsDatepickerComponent;
    @ViewChild('xnAgGrid') xnAgGrid: XnAgGridComponent;
    @ViewChild(XnInputTypeaheadComponent) xnInputTypeahead: XnInputTypeaheadComponent<HistoryUser[]>;
    @ViewChild(XnNgxDropdownComponent) xnNgxDropdown: XnNgxDropdownComponent<any>;
    @ViewChild('autocompleteCtrl') autocompleteCtrl: MatAutocomplete;
    @ViewChild(MatAutocompleteTrigger) autoCompleteTrigger: MatAutocompleteTrigger;

    constructor(
        protected router: Router,
        private cdRef: ChangeDetectorRef,
        private appStore: Store<AppState>,
        private administrationDocumentSelectors: AdministrationDocumentSelectors,
        private historySelectors: HistorySelectors,
        @SkipSelf() private appSelectors: AppSelectors,
        private userService: UserService,
    ) {
        super(router);
        this.registerSubscriptions();
        this.bsConfig = new BsDatepickerConfig();
        this.bsConfig.containerClass = 'theme-default';
        this.bsConfig.showWeekNumbers = false;
        this.bsConfig.dateInputFormat = 'DD.MM.YYYY';

        this.totalPages = 0;
        this.page = 1;
        this.pageSize = 10;
        this.totalSummary = {
            scan: 0,
            import: 0,
            mobile: 0,
            transferring: 0,
            transferred: 0,
        };
        this._observableDataSource$ = this._subjectDataSourceUsers.asObservable();

        this._filter = new ScanningHistoryFilter();
        this._filter.pageIndex = this.getPageIndex(this.page);
        this._filter.pageSize = this.pageSize;
    }

    public ngOnInit(): void {
        this.isLoading = true;
        this.appStore.dispatch(new GetScanningHistoryAction(this._filter));
        this.appStore.dispatch(new GetControlsFilter());
    }

    public ngOnDestroy(): void {
        super.onDestroy();
    }

    public ngAfterViewInit(): void {
        this.xnAgGrid.rowHeight = 36;
        this.dpTo.disabled = true;
    }

    private registerSubscriptions() {
        this.userService.currentUser.pipe(takeUntil(this.getUnsubscriberNotifier())).subscribe((user: User) => {
            this.userLogin = user;
        });

        this.dataSourceUsers$ = Observable.create((observer: Observer<any>) => {
            observer.next(this.typeaheadValue);
        }).pipe(
            switchMap((value: string) => this.loadUserByString(value)),
            takeUntil(this.getUnsubscriberNotifier()),
        );

        this.administrationDocumentSelectors.docTypes$
            .pipe(
                filter((docTypes) => !!docTypes && docTypes.length > 0),
                takeUntil(this.getUnsubscriberNotifier()),
            )
            .subscribe((docTypes) => {
                this.docTypes = docTypes;
            });

        this.historySelectors
            .actionSuccessOfSubtype$(HistoryActionNames.GET_SCANNING_HISTORY)
            .pipe(
                filter((action: HistorySuccessAction) => !!action.payload),
                takeUntil(this.getUnsubscriberNotifier()),
            )
            .subscribe(
                (action: HistorySuccessAction) => {
                    const payload = action.payload as HistoryAgGridModel;
                    const ctrlGridModel = new ControlGridModel();

                    if (!payload.columns || payload.columns.length < 0) {
                        ctrlGridModel.columns = (this.dataSource && this.dataSource.columns) || null;
                    } else {
                        ctrlGridModel.columns = payload.columns.map((col) => {
                            return new ControlGridColumnModel({
                                title: col.columnHeader,
                                data: col.columnName,
                                dataType: col.dataType,
                                readOnly: true,
                                visible: true,
                                setting: {
                                    Setting:
                                        (col.setting &&
                                            Object.keys(col.setting).map((key) => {
                                                const obj = {};
                                                obj[key] = col.setting[key];
                                                return obj;
                                            })) ||
                                        [],
                                },
                            });
                        });
                    }

                    ctrlGridModel.data = payload.data || [];
                    ctrlGridModel.totalResults = payload.totalResults;
                    this.dataSource = ctrlGridModel;
                    this.totalSummary = payload.totalSummary;

                    this.totalPages = Math.ceil(payload.totalResults / this.pageSize);
                    if (this.page > this.totalPages) {
                        this.page = this.totalPages;
                    }
                    if (this.page <= 0 && this.totalPages > 0) {
                        this.page = 1;
                    }
                    this.isLoading = false;
                    this.cdRef.detectChanges();
                },
                (error) => {
                    this.isLoading = false;
                    this.cdRef.detectChanges();
                },
            );

        this.historySelectors
            .actionSuccessOfSubtype$(HistoryActionNames.GET_HISTORY_USER)
            // .filter((action: HistorySuccessAction) => action.payload && action.payload.length > 0)
            .pipe(takeUntil(this.getUnsubscriberNotifier()))
            .subscribe((action: HistorySuccessAction) => {
                let payload = action.payload as HistoryUser[];
                if (!payload || !payload.length) {
                    payload = [];
                }
                this._subjectDataSourceUsers.next(payload);
            });

        this.appSelectors.companyList$
            .pipe(
                filter((companyList) => !!companyList && companyList.length > 0),
                takeUntil(this.getUnsubscriberNotifier()),
            )
            .subscribe((companyList) => {
                this.companiesList = companyList;
                this.dataAutoCompleteCompaniesList = cloneDeep(companyList);
            });

        this.historySelectors
            .actionOfType$(HistoryActionNames.DRAG_SPLITTER_END)
            .pipe(takeUntil(this.getUnsubscriberNotifier()))
            .subscribe((_) => {
                if (!this.xnAgGrid) return;

                if (this.xnAgGrid.columnApi) {
                    this.xnAgGrid.columnApi.autoSizeAllColumns();
                }

                if (this.xnAgGrid.api) {
                    this.xnAgGrid.api.sizeColumnsToFit();
                }
            });

        this.historySelectors
            .actionSuccessOfSubtype$(HistoryActionNames.GET_SCANNING_HISTORY_DETAIL)
            .pipe(takeUntil(this.getUnsubscriberNotifier()))
            .subscribe((action: HistorySuccessAction) => {
                const payload = action.payload as HistoryDetailAgGridModel;
                const ctrlGridModel = new ControlGridModel();

                if (!payload.columns || payload.columns.length < 0) {
                    ctrlGridModel.columns = (this.dataSourceDetail && this.dataSourceDetail.columns) || null;
                } else {
                    ctrlGridModel.columns = payload.columns.map((col) => {
                        return new ControlGridColumnModel({
                            title: col.columnHeader,
                            data: col.columnName,
                            dataType: col.dataType,
                            readOnly: true,
                            visible: true,
                            setting: {
                                Setting:
                                    (col.setting &&
                                        Object.keys(col.setting).map((key) => {
                                            const obj = {};
                                            obj[key] = col.setting[key];
                                            return obj;
                                        })) ||
                                    [],
                            },
                        });
                    });
                }

                ctrlGridModel.data = payload.data || [];
                ctrlGridModel.totalResults = payload.totalResults;
                this.dataSourceDetail = ctrlGridModel;
                // this.fileNameTitle =
                //     isNullOrUndefined(this._parameters.companyTitle) || isNullOrUndefined(this._parameters.email)
                //         ? ''
                //         : `${this._parameters.companyTitle}: ${this._parameters.email}`;
                this.cdRef.detectChanges();
            });
    }

    public onChangedDatepickerFrom($event: Date) {
        this.dpTo.minDate = $event;

        if (this.dpTo.date < $event) {
            this.dpTo.date = null;
        }

        this.dpTo.disabled = isNullOrUndefined($event);
        this.loadData(
            this.page,
            this.pageSize,
            $event,
            this._toDate,
            this._userId,
            this.selectedDocType,
            this.selectedCompany,
        );
    }

    public onChangedDatepickerTo($event: Date) {
        if (this.dpTo.disabled) return;

        if ($event && this.dpFrom.date > $event) {
            return;
        }

        this.loadData(
            this.page,
            this.pageSize,
            this._fromDate,
            $event,
            this._userId,
            this.selectedDocType,
            this.selectedCompany,
        );
    }

    public loadUserByString(value: string) {
        if (!value) {
            return of([]);
        }

        this.appStore.dispatch(new GetHistoryUser(value));
        return this._observableDataSource$;
    }

    public selectUser($event: HistoryUser) {
        const item = $event;
        const userId = item.userId;

        this.loadData(
            this.page,
            this.pageSize,
            this._fromDate,
            this._toDate,
            userId,
            this.selectedDocType,
            this.selectedCompany,
        );
    }

    public changeInputUserNull($event) {
        if (!$event) {
            const userId = null;
            this.loadData(
                this.page,
                this.pageSize,
                this._fromDate,
                this._toDate,
                userId,
                this.selectedDocType,
                this.selectedCompany,
            );
        }
    }

    public selectDocType(docType: DocumentTreeModel) {
        const _docType = docType;

        this.loadData(
            this.page,
            this.pageSize,
            this._fromDate,
            this._toDate,
            this._userId,
            _docType,
            this.selectedCompany,
        );
    }

    public onSelectCompany($event: MatAutocompleteSelectedEvent | DropdownListModel) {
        let _selectedCompany: any;

        if ($event instanceof MatAutocompleteSelectedEvent) {
            _selectedCompany = $event.option.value as DropdownListModel;
        } else if ($event instanceof Object && $event.idValue && $event.textValue) {
            _selectedCompany = $event;
        } else {
            _selectedCompany = null;
        }

        this.loadData(
            this.page,
            this.pageSize,
            this._fromDate,
            this._toDate,
            this._userId,
            this.selectedDocType,
            _selectedCompany,
        );
    }

    public onTypingCompanyList(input: string | DropdownListModel) {
        let value: string = null;
        if (typeof input === 'object') {
            value = input.textValue.toLowerCase();
        } else if (typeof input === 'string') {
            value = input.toLowerCase();
        } else {
            return;
        }

        this.dataAutoCompleteCompaniesList = this.companiesList.filter(
            (company) => company.textValue.toLowerCase().indexOf(value) !== -1,
        );

        if (!value) {
            this.onSelectCompany(null);
        }
    }

    public displayCompanyItem(data: any) {
        return data ? data.textValue : null;
    }

    public doFilter() {
        if (this.dpFrom.date || this.dpTo.date || this._userId || this.selectedDocType || this.selectedCompany) {
            this.hasFiltered = true;
        } else {
            this.hasFiltered = false;
        }

        // this.cdRef.markForCheck();
    }

    public clearFilter($event) {
        this.loadData(this.page, this.pageSize, null, null, null, null, null);

        this.dpFrom.date = null;
        this.dpTo.date = null;
        this.dpTo.disabled = true;

        this.typeaheadValue = null;
        this.xnInputTypeahead && this.xnInputTypeahead.clear();

        this.xnNgxDropdown.clear();

        this.autoCompleteDropdownModel = null;
        this.dataAutoCompleteCompaniesList = cloneDeep(this.companiesList);
    }

    public onResultSelect(data: Array<any>) {}
    public onResultSelectDetail(data: Array<any>) {}

    public onRowDoubleClick(data: any) {
        const historyDetailModel = <HistoryDetailParameters>{
            email: data.Email,
            date: data.ScanDate,
        };

        this.detailTitle = data.ScanDate;
        this.cdRef.detectChanges();
        this.appStore.dispatch(new GetScanningHistoryDetailAction(historyDetailModel));
        // this.navigateToHistoryDetail(data);
    }
    public onRowDoubleClickDetail(data: any) {}

    public onEditClick($event) {
        // this.navigateToHistoryDetail($event);
    }

    public onPaginatorChanged($event: IPageEvent) {
        this.loadData($event.page, $event.pageSize, this._fromDate, this._toDate, this._userId, this.selectedDocType);
    }

    public onPageChanged(event: IPageChangedEvent) {}
    public onPageChangedDetail(event: IPageChangedEvent) {}

    public onPageNumberChanged(pageNumber: number) {}
    public onPageNumberChangedDetail(pageNumber: number) {}

    public gridMouseDown($event) {}
    public gridMouseDownDetail($event) {}

    public gridMouseUp($event) {}
    public gridMouseUpDetail($event) {}

    public onDataSourceChanged($event) {
        //setTimeout(() => {
        //    if (this.xnAgGrid.columnApi) {
        //        this.xnAgGrid.columnApi.autoSizeAllColumns();
        //    }
        //    if (this.xnAgGrid.api) {
        //        this.xnAgGrid.api.sizeColumnsToFit();
        //    }
        //}, 500);
    }

    public goToPreviousPage(page: number) {
        if (!this.canPreviousPage(page)) return;

        page -= 1;
        this.loadData(page, this.pageSize, this._fromDate, this._toDate, this._userId, this.selectedDocType);
    }

    public goToNextPage(page: number) {
        if (!this.canNextPage(page, this.totalPages)) return;

        page += 1;
        this.loadData(page, this.pageSize, this._fromDate, this._toDate, this._userId, this.selectedDocType);
    }

    public changePage($event: KeyboardEvent) {
        const inputElem = $event.srcElement as HTMLInputElement;
        if (!inputElem.value) return;

        const page = +inputElem.value;
        this.loadData(page, this.pageSize, this._fromDate, this._toDate, this._userId, this.selectedDocType);
    }

    public changePageSize($event: KeyboardEvent) {
        const inputElem = $event.srcElement as HTMLInputElement;
        if (!inputElem.value) return;

        const pageSize = +inputElem.value;
        this.loadData(this.page, pageSize, this._fromDate, this._toDate, this._userId, this.selectedDocType);
    }

    public canNextPage(page: number, totalPages: number) {
        return page < totalPages ? true : false;
    }

    public canPreviousPage(page: number) {
        return page > 1 ? true : false;
    }

    public windowResize($event: Event) {
        if (!($event.target instanceof Window)) {
            return;
        }

        if (this.isShownHistoryDetailPage) {
            return;
        }

        const win = $event.target as Window;
        if (win.innerWidth > 1195) {
            this.setHiddenStatisticScanningTotalPanel(false);
            return;
        }

        this.setHiddenStatisticScanningTotalPanel(true);
    }

    public onHoverControl(ctrlName: string, onHover: boolean) {
        this.controlsOnHover[ctrlName] = onHover;
    }

    public onFocusControl(ctrlName: string, onFocus: boolean) {
        this.controlsOnFocus[ctrlName] = onFocus;
    }

    public clearText(ctrlName: string) {
        const _selectedCompany = null;
        if (ctrlName === this.controlsName.company) {
            this.autoCompleteDropdownModel = null;
            this.dataAutoCompleteCompaniesList = cloneDeep(this.companiesList);
        }

        this.loadData(
            this.page,
            this.pageSize,
            this._fromDate,
            this._toDate,
            this._userId,
            this.selectedDocType,
            _selectedCompany,
        );
    }

    public enterAutocomplete($event: KeyboardEvent) {
        if (!this.dataAutoCompleteCompaniesList || this.dataAutoCompleteCompaniesList.length !== 1) {
            return;
        }

        this.autoCompleteDropdownModel = this.dataAutoCompleteCompaniesList[0];
        this.onSelectCompany(this.autoCompleteDropdownModel);
        this.autoCompleteTrigger.closePanel();
    }

    private getPageIndex(page: number) {
        return !page || page <= 0 ? 0 : page - 1;
    }

    private loadData(
        page: number,
        pageSize: number,
        fromDate: Date,
        toDate: Date,
        userId: number,
        docType: DocumentTreeModel,
        company?: DropdownListModel,
    ) {
        if (
            this.page !== page ||
            this.pageSize !== pageSize ||
            this._fromDate !== fromDate ||
            this._toDate !== toDate ||
            this._userId !== userId ||
            this.selectedDocType !== docType ||
            this.selectedCompany !== company
        ) {
            this.page = page;
            this.pageSize = pageSize;
            this._fromDate = fromDate;
            this._toDate = toDate;
            this._userId = userId;
            this.selectedDocType = docType;
            this.selectedCompany = company;
            this._filter.pageIndex = this.getPageIndex(page);
            this._filter.pageSize = this.pageSize || 10;
            this._filter.userId = this._userId;
            this._filter.idDocument = this.selectedDocType ? this.selectedDocType.idDocument : null;
            this._filter.fromDate = this._fromDate ? moment(this._fromDate).format('DD.MM.YYYY') : null;
            this._filter.toDate = this._toDate ? moment(this._toDate).format('DD.MM.YYYY') : null;
            this._filter.company = this.selectedCompany ? this.selectedCompany.idValue : null;

            this.isLoading = true;
            this.appStore.dispatch(new GetScanningHistoryAction(this._filter));

            this.dataSourceDetail = new ControlGridModel();
        }
        this.doFilter();
    }

    // private navigateToHistoryDetail(data: any) {
    //     this.setHiddenStatisticScanningTotalPanel(true);

    //     const parameters = new HistoryDetailParameters(data['Email'], data['ScanDate'], this._filter);
    //     parameters.companyTitle = data['Company'];

    //     this.router.navigate([`/${ModuleList.History.moduleNameTrim}/${ModuleList.HistoryDetail.moduleNameTrim}`], {
    //         queryParams: parameters,
    //     });
    //     this.isShownHistoryDetailPage = true;

    //     this.router.events
    //         .pipe(
    //             filter((e) => e instanceof NavigationEnd && e.url === `/${ModuleList.History.moduleNameTrim}`),
    //             take(1),
    //         )
    //         .subscribe((e: NavigationEnd) => {
    //             // when navigate back to History List page
    //             this.setHiddenStatisticScanningTotalPanel(false);
    //             this.isShownHistoryDetailPage = false;

    //             setTimeout(() => {
    //                 // delay 300ms until collapse History Detail List page then resize all columns to fit on History Page
    //                 this.xnAgGrid.api.sizeColumnsToFit();
    //             }, 300);
    //         });
    // }

    private setHiddenStatisticScanningTotalPanel(isHidden: boolean = true) {
        if (isHidden) {
            (this.topPanelStatisticScanning.nativeElement as HTMLElement).classList.add('hidden');
            return;
        }
        (this.topPanelStatisticScanning.nativeElement as HTMLElement).classList.remove('hidden');
    }

    public closeDetail() {
        this.detailTitle = '';
        this.dataSourceDetail = null;
        this.cdRef.detectChanges();
    }
}
