
import {
    Component,
    OnInit,
    Input,
    Output,
    OnDestroy,
    ViewChild,
    AfterViewInit,
    ChangeDetectorRef,
    EventEmitter
} from '@angular/core';
import {
    Router
} from '@angular/router';
import * as wjcCore from 'wijmo/wijmo';
import * as wjcGrid from 'wijmo/wijmo.grid';
import PerfectScrollbar from 'perfect-scrollbar';
import { parse } from 'date-fns/esm';
import { BaseComponent } from '@app/pages/private/base';
import { User } from '@app/models';
import { AppErrorHandler, NotificationService, PropertyPanelService, SearchService } from '@app/services';
import { Uti } from '@app/utilities';

@Component({
    selector: 'notification-archive-view',
    styleUrls: ['./notification-archive-view.component.scss'],
    templateUrl: './notification-archive-view.component.html'
})
export class NotificationArchiveViewComponent extends BaseComponent implements OnInit, AfterViewInit, OnDestroy {
    public textSearch: string = '';
    public isSearching: boolean = false;
    public dataSource: any;
    public searchText: string = '';

    private Ps: PerfectScrollbar;
    private _typeArchive: string = '';
    private updatedLayoutHandlerTimer;
    private updatedLayoutHandlerInterval = 1000;
    private userData: User = new User();
    private pageIndex: number = 1;
    private pageSize: number = 15;
    private globalDateFormat: string = null;

    @ViewChild('flex') flex: wjcGrid.FlexGrid;

    @Input() set typeArchive(type: any) { this.executeTypeArchie(type); }

    @Output() showDetailAction = new EventEmitter<any>();

    constructor(
        private notificationService: NotificationService,
        private searchService: SearchService,
        private appErrorHandler: AppErrorHandler,
        private changeDetectorRef: ChangeDetectorRef,
        private propertyPanelService: PropertyPanelService,
        private uti: Uti,
        router?: Router
    ) {
        super(router);
        this.scrollPositionChangedHandler = this.scrollPositionChangedHandler.bind(this);
        this.userData = (new Uti()).getUserInfo();
    }
    public ngOnInit() {
        this.setGlobalFormat();
    }
    public ngOnDestroy() {
        Uti.unsubscribe(this);
    }
    public ngAfterViewInit() {
        if (!this.flex) return;
        this.flex.scrollPositionChanged.addHandler(this.scrollPositionChangedHandler);
        this.flex.cells.hostElement.addEventListener('click', this.onCellClick.bind(this));
    }

    private setGlobalFormat() {
        if (this.propertyPanelService.globalProperties && this.propertyPanelService.globalProperties.length) {
            this.globalDateFormat = this.propertyPanelService.buildGlobalDateFormatFromProperties(this.propertyPanelService.globalProperties);
        }
    }

    public searchClicked(keyword?: string) {
        this.searchText = keyword;
        this.isSearching = true;
        this.pageIndex = 1;
        this.search();
    }
    public scrollPositionChangedHandler(s, e) {
        if (s.viewRange.bottomRow >= s.rows.length - 1) {
            this.pageIndex += 1;
            this.search(s);
        }
    }
    public updatedLayoutHandler(evt) {
        clearTimeout(this.updatedLayoutHandlerTimer);
        this.updatedLayoutHandlerTimer = setTimeout(this.addPerfectScrollbar.bind(this), this.updatedLayoutHandlerInterval);
    }
    /*************************************************************************************************/
    /***************************************PRIVATE METHOD********************************************/
    public onCellClick() {
        if (!this.flex.selectedItems || !this.flex.selectedItems.length) return;
        this.showDetailAction.emit(this.flex.selectedItems[0]);
    }
    private executeTypeArchie(type: string) {
        this._typeArchive = type;
        this.dataSource = new wjcCore.CollectionView([]);
        this.getData();
    }
    private getData() {
        this.pageIndex = 1;
        this.searchText = '*';
        this.search();
    }
    private search(sender?: any): void {
        const params = this.createRequestParam();
        this.searchService.search(
            'notification',
            this.searchText,
            null,
            this.pageIndex,
            this.pageSize,
            '',
            params.fieldNames,
            params.fieldValues,
            true,
            'Both_*X*')
            .subscribe((response: any) => {
                this.appErrorHandler.executeAction(() => {
                    if (this.pageIndex > 1) {
                        const newData = this.buildResultData(response);
                        if (newData && newData.length && this.dataSource.items) {
                            this.dataSource.items.push(...newData);
                            if (sender && sender.collectionView)
                                sender.collectionView.refresh();
                        }
                        else
                            this.pageIndex -= 1;
                    } else {
                        this.dataSource = new wjcCore.CollectionView(this.buildResultData(response));
                        this.changeDetectorRef.detectChanges();
                    }
                    this.isSearching = false;
                });
            });
    }
    private createRequestParam(): any {
        let fieldNames: Array<string> = [];
        fieldNames.push('mainNotificationType');
        fieldNames.push('isActive');
        fieldNames.push('idLogin');

        let fieldValues: Array<string> = [];
        fieldValues.push(Uti.upperCaseFirstLetter(this._typeArchive));
        fieldValues.push('false');
        fieldValues.push(this.userData.id);
        return { fieldNames: fieldNames, fieldValues: fieldValues };
    }
    private addPerfectScrollbar() {
        setTimeout(() => {
            let wijmoGridElm = $('div[wj-part=\'root\']', this.flex.hostElement);
            if (wijmoGridElm.length) {
                this.Ps?.destroy();
                this.Ps = new PerfectScrollbar(wijmoGridElm.get(0));
                setTimeout(() => {
                    $('.ps-scrollbar-x-rail', this.flex.hostElement).css('z-index', 9999);
                    $('.ps-scrollbar-y-rail', this.flex.hostElement).css('z-index', 9999);
                });
            }
        });
    }
    private buildResultData(response: any): Array<any> {
        if (!Uti.isResquestSuccess(response) || !response.item.results || !response.item.results.length) {
            return [];
        }
        return response.item.results.map(x => {

            let createDateDisplay = '';
            if (x.sysCreateDate) {
                const createDate = Uti.parseISODateToDate(x.sysCreateDate);
                createDateDisplay = this.uti.formatLocale(createDate, this.globalDateFormat + ' HH:mm:ss');
            }
            else {
                const createDate = parse(x.createDate, 'dd.MM.yyyy', new Date());
                createDateDisplay = this.uti.formatLocale(createDate, this.globalDateFormat);
            }

            return {
                id: x.idNotification,
                data: {
                    title: x.subject,
                    content: x.mainComment,
                    createDateDisplay: createDateDisplay
                }
            };
        });
    }
}
