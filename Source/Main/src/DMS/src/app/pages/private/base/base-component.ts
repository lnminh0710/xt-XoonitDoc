import { Router, NavigationEnd } from '@angular/router';
import { Module } from '@app/models';
import { Uti } from '@app/utilities';
import { Subscription, ReplaySubject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { OnInit } from '@angular/core';

export class ModuleList {
    static Base = new Module({ idSettingsGUI: -1, moduleName: 'Base' });
    static Processing = new Module({
        idSettingsGUI: 1,
        moduleName: 'Processing',
        iconName: 'fa-user-secret',
        searchIndexKey: 'document',
    });
    static Contact = new Module({
        idSettingsGUI: 2,
        moduleName: 'Contact',
        iconName: 'fa-users',
        isCanNew: true,
        searchIndexKey: 'contact',
    });
    static Invoice = new Module({
        idSettingsGUI: 3,
        moduleName: 'Invoice',
        iconName: 'fa-newspaper-o',
        isCanNew: true,
        searchIndexKey: 'rechnung',
    });
    static Campaign = new Module({
        idSettingsGUI: 4,
        moduleName: 'Campaign',
        iconName: 'fa-umbrella',
        isCanNew: true,
        searchIndexKey: 'campaign',
    });
    static Scan = new Module({
        idSettingsGUI: 44,
        moduleName: 'Scan',
        moduleNameTrim: 'Scan',
        iconName: 'fa-barcode',
        isCanNew: false,
        isCanSearch: false,
        searchIndexKey: null,
    });

    static Briefe = new Module({
        idSettingsGUI: 5,
        moduleName: 'Briefe',
        iconName: 'fa-calendar',
        searchIndexKey: 'briefe',
    });
    static BlockedOrder = new Module({
        idSettingsGUI: 24,
        moduleName: 'Blocked Order',
        iconName: 'fa-ban',
        idSettingsGUIParent: 5,
    });
    static DataExport = new Module({
        idSettingsGUI: 25,
        moduleName: 'Data Export',
        iconName: 'fa-mail-reply-all',
        idSettingsGUIParent: 5,
    });
    static Doublette = new Module({
        idSettingsGUI: 26,
        moduleName: 'Doublette',
        iconName: 'fa-clone',
        idSettingsGUIParent: 5,
    });
    static Logistic = new Module({
        idSettingsGUI: 27,
        moduleName: 'Logistic',
        iconName: 'fa-truck',
        idSettingsGUIParent: 5,
    });
    static Purchase = new Module({
        idSettingsGUI: 30,
        moduleName: 'Purchase',
        iconName: 'fa-money',
        idSettingsGUIParent: 27,
        searchIndexKey: 'purchase',
    });
    static StockCorrection = new Module({
        idSettingsGUI: 31,
        moduleName: 'Stock Correction',
        iconName: 'fa-line-chart',
        idSettingsGUIParent: 27,
        searchIndexKey: 'stockcorrection',
    });
    static WarehouseMovement = new Module({
        idSettingsGUI: 32,
        moduleName: 'Warehouse Movement',
        iconName: 'fa-home',
        idSettingsGUIParent: 27,
        searchIndexKey: 'warehousemovement',
    });

    static BusinessCosts = new Module({
        idSettingsGUI: 6,
        moduleName: 'Business Costs',
        iconName: 'fa-calculator',
        isCanNew: true,
        searchIndexKey: 'businesscosts',
    });
    static OrderDataEntry = new Module({ idSettingsGUI: 7, moduleName: 'Order Data Entry', iconName: 'fa-list-alt' });
    static Statistic = new Module({ idSettingsGUI: 8, moduleName: 'Statistic', iconName: 'fa-bar-chart-o' });
    static StatistisReport = new Module({
        idSettingsGUI: 39,
        moduleName: 'Statistis Report',
        iconName: 'fa-bar-chart-o',
        idSettingsGUIParent: 8,
    });

    // The module name will be replace spacing and bring to compare with name of table B00SettingsModule with LayoutSetting row.
    // So must be careful with the moduleName

    static Tools = new Module({ idSettingsGUI: 9, moduleName: 'Tools', iconName: 'fa-wrench' });
    static TracksSetup = new Module({
        idSettingsGUI: 35,
        moduleName: 'Tracks Setup',
        iconName: 'fa-random',
        idSettingsGUIParent: 9,
    });
    static ScanManagement = new Module({
        idSettingsGUI: 36,
        moduleName: 'Scan Management',
        iconName: 'fa-print',
        idSettingsGUIParent: 9,
    });
    static DoubletCheckTool = new Module({
        idSettingsGUI: 37,
        moduleName: 'Doublet Check Tool',
        iconName: 'fa-check-circle-o',
        idSettingsGUIParent: 9,
    });
    static ToolsAddOn = new Module({
        idSettingsGUI: 40,
        moduleName: 'Tools Add On',
        iconName: 'fa-plus-circle',
        idSettingsGUIParent: 9,
    });
    static CampaignAddOn = new Module({
        idSettingsGUI: 41,
        moduleName: 'Campaign Add On',
        iconName: 'fa-umbrela',
        idSettingsGUIParent: 9,
    });

    static Selection = new Module({ idSettingsGUI: 10, moduleName: 'Selection', iconName: 'fa-check-square-o' });
    static CampaignSelection = new Module({
        idSettingsGUI: 97,
        moduleName: 'Campaign Selection',
        iconName: 'fa-umbrella',
    });
    static BrokerSelection = new Module({ idSettingsGUI: 98, moduleName: 'Broker Selection', iconName: 'fa-exchange' });
    static CollectSelection = new Module({
        idSettingsGUI: 99,
        moduleName: 'Collect Selection',
        iconName: 'fa-newspaper-o',
    });

    static Orders = new Module({
        idSettingsGUI: 28,
        moduleName: 'Orders',
        iconName: 'fa-shopping-cart',
        idSettingsGUIParent: 5,
        searchIndexKey: 'orders',
    });
    static ReturnRefund = new Module({
        idSettingsGUI: 29,
        moduleName: 'Return & Refund',
        iconName: 'fa-exchange',
        idSettingsGUIParent: 5,
        searchIndexKey: 'returnrefund',
    });
    static SystemManagement = new Module({ idSettingsGUI: 38, moduleName: 'System Management', iconName: 'fa-cog' });

    static OrderProcessing = new Module({ idSettingsGUI: 43, moduleName: 'Order Processing', iconName: 'fa-cube' });

    static Document = new Module({
        idSettingsGUI: 42,
        moduleName: 'Document',
        moduleNameTrim: 'Document',
        iconName: 'fa-cog',
        searchIndexKey: 'document',
    });
    static Import = new Module({
        idSettingsGUI: 45,
        moduleName: 'Import/Upload',
        moduleNameTrim: 'Import',
        iconName: 'file-import',
        isCanNew: false,
        isCanSearch: false,
        searchIndexKey: 'document',
    });
    static Export = new Module({
        idSettingsGUI: 46,
        moduleName: 'Export',
        moduleNameTrim: 'Export',
        iconName: 'fa-cloud',
        isCanNew: false,
        isCanSearch: false,
        searchIndexKey: null,
    });
    static Cloud = new Module({
        idSettingsGUI: 47,
        moduleName: 'Cloud',
        moduleNameTrim: 'Cloud',
        iconName: 'fa-cloud',
        isCanNew: false,
        isCanSearch: false,
        searchIndexKey: null,
    });
    static UserGuide = new Module({
        idSettingsGUI: 48,
        moduleName: 'UserGuide',
        moduleNameTrim: 'UserGuide',
        iconName: 'fa-cloud',
        isCanNew: false,
        isCanSearch: false,
        searchIndexKey: null,
    });
    static OneDrive = new Module({
        idSettingsGUI: 49,
        idSettingsGUIParent: 47,
        moduleName: 'One Drive',
        moduleNameTrim: 'One Drive',
        iconName: 'fa-cloud',
        isCanNew: false,
        isCanSearch: false,
        searchIndexKey: null,
    });
    static History = new Module({
        idSettingsGUI: 50,
        moduleName: 'History',
        moduleNameTrim: 'History',
        iconName: 'fa-cloud',
        isCanNew: false,
        isCanSearch: false,
        searchIndexKey: null,
    });
    static HistoryDetail = new Module({
        idSettingsGUI: 57,
        idSettingsGUIParent: 50,
        moduleName: 'History Detail',
        moduleNameTrim: 'HistoryDetail',
        iconName: 'fa-cloud',
        isCanNew: false,
        isCanSearch: false,
        searchIndexKey: 'historydetails',
    });
    static AllDocumentGlobalSearch = new Module({
        idSettingsGUI: 51,
        moduleName: 'All Document',
        moduleNameTrim: 'AllDocument',
        iconName: 'fa-cloud',
        isCanNew: false,
        isCanSearch: false,
        searchIndexKey: 'maindocument',
    });
    static ChangePassword = new Module({
        idSettingsGUI: 55,
        moduleName: 'ChangePassword',
        iconName: 'fa-users',
        isCanNew: true,
        searchIndexKey: 'user',
    });
    static AttachmentGlobalSearch = new Module({
        // CHEAT, module does not exist in database
        idSettingsGUI: 55,
        moduleName: 'Documents for',
        moduleNameTrim: 'Contact',
        iconName: 'fa-file',
        isCanNew: true,
        searchIndexKey: null,
    });
    static User_Old = new Module({
        idSettingsGUI: 58,
        moduleName: 'User_Old',
        moduleNameTrim: 'User_Old',
        iconName: 'user-management-module',
        isCanNew: false,
        isCanSearch: false,
        searchIndexKey: null,
    });
    static FormBuilder = new Module({
        idSettingsGUI: 59,
        moduleName: 'Form Layout Builder',
        moduleNameTrim: 'FormBuilder',
        iconName: 'form-builder-module',
        isCanNew: false,
        isCanSearch: false,
        searchIndexKey: null,
    });
    static Email = new Module({
        idSettingsGUI: 60,
        moduleName: 'Email',
        moduleNameTrim: 'Email',
        iconName: 'processing-menu',
        isCanNew: false,
        isCanSearch: false,
        searchIndexKey: null,
    });
    static EmailDetailGlobalSearch = new Module({
        // CHEAT, module does not exist in database
        idSettingsGUI: 999, // faked
        moduleName: 'Email for',
        moduleNameTrim: 'EmailFor',
        iconName: 'processing-menu',
        isCanNew: true,
        searchIndexKey: 'emailFor',
    });
    static Approval = new Module({
        idSettingsGUI: 61,
        moduleName: 'Approval',
        moduleNameTrim: 'Approval',
        iconName: 'invoiceApproval-menu',
        isCanNew: false,
        isCanSearch: false,
        searchIndexKey: null,
    });
    static ApprovalProcessing = new Module({
        idSettingsGUI: 62,
        moduleName: 'Approval Processing',
        moduleNameTrim: 'ApprovalProcessing',
        iconName: 'IAProcessing-menu',
        isCanNew: false,
        isCanSearch: false,
        searchIndexKey: 'approvalprocessing',
    });

    static ApprovalRejected = new Module({
        idSettingsGUI: 66,
        moduleName: 'Approval',
        moduleNameTrim: 'Approval',
        iconName: 'IAProcessing-menu',
        isCanNew: false,
        isCanSearch: false,
        searchIndexKey: 'approvalrejected',
    });

    static User = new Module({
        idSettingsGUI: 101,
        moduleName: 'User',
        moduleNameTrim: 'User',
        iconName: 'user-management-module',
        isCanNew: false,
        isCanSearch: false,
        searchIndexKey: null,
    });

    static Indexing = new Module({
        idSettingsGUI: 102,
        moduleName: 'Indexing',
        moduleNameTrim: 'Indexing',
        iconName: 'user-management-module',
        isCanNew: false,
        isCanSearch: false,
        searchIndexKey: null,
    });

    static Company = new Module({
        idSettingsGUI: 103,
        moduleName: 'Company',
        moduleNameTrim: 'Company',
        iconName: 'contact-menu',
        isCanNew: false,
        isCanSearch: false,
        searchIndexKey: null,
    });

    static PreissChild = new Module({
        idSettingsGUI: 104,
        moduleName: 'PreissChild',
        moduleNameTrim: 'Preisschild',
        iconName: 'user-management-module',
        isCanNew: false,
        isCanSearch: false,
        searchIndexKey: null,
    });
}

/**
 * BaseComponent
 */
export abstract class BaseComponent implements OnInit {
    private _subscriptions: Subscription[] = [];
    protected _unsubscribedNotifer$: ReplaySubject<boolean> = new ReplaySubject<boolean>();

    public ofModule: Module;
    protected onRouteChanged(event?: NavigationEnd) {}
    protected overrideDefaultModule() {}

    constructor(protected router: Router) {
        this.buildModuleFromRoute();

        router.events.pipe(takeUntil(this.getUnsubscriberNotifier())).subscribe((val) => {
            if (val instanceof NavigationEnd) {
                this.onRouteChanged(val);
            }
        });
    }

    ngOnInit() {
        this.overrideDefaultModule();
    }

    protected buildModuleFromRoute() {
        if (this.router && this.router.url) {
            const routerUrl: string = this.router.url;
            if (Uti.isRootUrl(routerUrl)) {
                this.ofModule = ModuleList.Base;
            } else {
                let moduleName: any = routerUrl.substring(1, routerUrl.length);
                if (moduleName.indexOf('?') !== -1) {
                    moduleName = moduleName.substring(0, moduleName.indexOf('?'));
                }

                moduleName = moduleName.split('/');

                if (moduleName.length >= 3) {
                    moduleName = moduleName[1] !== 'Tools' ? moduleName[1] : moduleName[2];
                } else if (moduleName.length > 2) {
                    moduleName = moduleName[2];
                } else if (moduleName.length > 1) {
                    moduleName = moduleName[1];
                } else {
                    moduleName = moduleName[0];
                }

                this.ofModule = ModuleList[moduleName] || ModuleList.Base;
            }
        }
    }

    protected registerSubscriptionsToAutomaticallyUnsubscribe(...subscriptions: Subscription[]) {
        if (!subscriptions) return;

        for (let i = 0; i < subscriptions.length; i++) {
            this._subscriptions.push(subscriptions[i]);
        }
    }

    protected getUnsubscriberNotifier(): ReplaySubject<boolean> {
        // return this._unsubscribedNotifer$.asObservable();
        return this._unsubscribedNotifer$;
    }

    protected unsubscribeFromNotifier() {
        this._unsubscribedNotifer$.next(true);
        this._unsubscribedNotifer$.complete();
    }

    protected onDestroy() {
        Uti.unsubscribe(this);
        if (this._subscriptions && this._subscriptions.length) {
            this._subscriptions.forEach((subscription) => subscription.unsubscribe());
        }

        this.unsubscribeFromNotifier();
    }
}
