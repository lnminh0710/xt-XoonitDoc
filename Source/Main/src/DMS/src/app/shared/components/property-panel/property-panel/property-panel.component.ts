import {
    Component,
    Input,
    Output,
    OnInit,
    OnDestroy,
    EventEmitter,
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    ElementRef
} from '@angular/core';
import {
    trigger,
    transition,
    style,
    animate,
} from '@angular/animations';
import {
    Store,
    ReducerManagerDispatcher
} from '@ngrx/store';
import { AppState } from '@app/state-management/store';
import { Observable, Subscription } from 'rxjs';
import {
    PropertyPanelActions,
    LayoutInfoActions,
    CustomAction
} from '@app/state-management/store/actions';
import { SubLayoutInfoState } from '@app/state-management/store/reducer/layout-info';
import {
    AppErrorHandler,
    PropertyPanelService,
    ModalService
} from '@app/services';
import { ResizeEvent } from 'angular-resizable-element';
import {
    WidgetPropertyModel,
    WidgetPropertiesStateModel,
} from '@app/models';
import * as layoutInfoReducer from '@app/state-management/store/reducer/layout-info';
import * as propertyPanelReducer from '@app/state-management/store/reducer/property-panel';
import { BaseComponent } from '@app/pages/private/base';
import { Router } from '@angular/router';
import { Uti } from '@app/utilities';
import { filter } from 'rxjs/operators';

@Component({
    selector: 'property-panel',
    styleUrls: ['./property-panel.component.scss'],
    templateUrl: './property-panel.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
    animations: [
        trigger(
            'enterAnimation', [
                transition(':enter', [
                    style({ transform: 'translateX(100%)', opacity: 1 }),
                    animate('100ms', style({ transform: 'translateX(0)', opacity: 1 }))
                ]),
                transition(':leave', [
                    style({ transform: 'translateX(0)', opacity: 1 }),
                    animate('100ms', style({ transform: 'translateX(100%)', opacity: 1 }))
                ])
            ]
        )
    ]
})

export class PropertyPanelComponent extends BaseComponent implements OnInit, OnDestroy {
    private el: HTMLElement;
    private propertyPanelStyle = {};
    public propertyPanelBodyStyle = {};
    private layoutInfo: any;
    private isGlobalLocal = true;
    private propertyWidth: string = "0";

    private layoutInfoState: Observable<SubLayoutInfoState>;
    private layoutInfoStateSubscription: Subscription;
    private requestClearPropertiesSubscription: Subscription;
    private isExpandStateSubscription: Subscription;
    private isExpandState: Observable<boolean>;

    @Input() properties: WidgetPropertyModel[] = [];
    @Input() parentData: any = null;
    @Input() isExpand = false;
    @Input() set isGlobal(isGlobal: boolean) {
        this.isGlobalLocal = isGlobal;
        this.buildPropertyPanelStyle(this.layoutInfo, this.isGlobalLocal);
    }

    get isGlobal() {
        return this.isGlobalLocal;
    }

    @Output() onClose = new EventEmitter<any>();
    @Output() onSave = new EventEmitter<any>();
    @Output() onChange = new EventEmitter<any>();
    @Output() onApply = new EventEmitter<any>();

    constructor(
        private store: Store<AppState>,
        private propertyPanelActions: PropertyPanelActions,
        private appErrorHandler: AppErrorHandler,
        private propertyPanelService: PropertyPanelService,
        private modalService: ModalService,
        private changeDetectorRef: ChangeDetectorRef,
        private elementRef: ElementRef,
        private layoutInfoActions: LayoutInfoActions,
        private dispatcher: ReducerManagerDispatcher,
        protected router: Router
    ) {
        super(router);

        this.layoutInfoState = store.select(state => layoutInfoReducer.getLayoutInfoState(state, this.ofModule.moduleNameTrim));
        this.isExpandState = store.select(state => propertyPanelReducer.getPropertyPanelState(state, this.ofModule.moduleNameTrim).isExpand);
        this.el = elementRef.nativeElement;
    }

    ngOnInit() {
        this.subscribe();
    }

    ngOnDestroy() {
        this.store.dispatch(this.propertyPanelActions.clearProperties(this.ofModule));
        this.store.dispatch(this.layoutInfoActions.setRightPropertyPanelWidth('0', this.ofModule));

        Uti.unsubscribe(this);
    }

    onRouteChanged() {
        this.buildModuleFromRoute();
    }

    private subscribe() {
        this.layoutInfoStateSubscription = this.layoutInfoState.subscribe((layoutInfoState: SubLayoutInfoState) => {
            this.appErrorHandler.executeAction(() => {
                if (layoutInfoState) {
                    this.layoutInfo = layoutInfoState;
                    this.buildPropertyPanelStyle(this.layoutInfo, this.isGlobalLocal);
                }
            });
        });

        this.isExpandStateSubscription = this.isExpandState.subscribe((isExpandState: boolean) => {
            this.appErrorHandler.executeAction(() => {
                this.isExpand = isExpandState;
                this.buildPropertyPanelStyle(this.layoutInfo, this.isGlobalLocal);
            });
        });

        this.requestClearPropertiesSubscription = this.dispatcher.pipe(
            filter((action: CustomAction) => {
                return action.type === PropertyPanelActions.REQUEST_CLEAR_PROPERTIES && action.module.idSettingsGUI == this.ofModule.idSettingsGUI;
            })
        ).subscribe((requestChangeTabState: any) => {
            this.appErrorHandler.executeAction(() => {
                if (this.propertyPanelService.isDirty(this.properties)) {
                    let options = {
                        headerText: 'Saving Changes',
                        message: [{ key: '<p>'}, { key: 'Modal_Message__DoYouWantToSaveWidgetProperties' }, { key: '<p>' }],
                        onModalSaveAndExit: () => {
                            this.savePanel();
                        },
                        onModalExit: () => {
                            this.store.dispatch(this.propertyPanelActions.requestRollbackProperties(
                                {
                                    data: this.parentData,
                                    isGlobal: this.isGlobal
                                },
                                this.ofModule
                            ));
                            this.store.dispatch(this.propertyPanelActions.togglePanel(this.ofModule, false));
                            this.store.dispatch(this.propertyPanelActions.requestClearPropertiesSuccess(this.ofModule));
                        }
                    }

                    this.showWarningDialog(options);
                } else {
                    this.store.dispatch(this.propertyPanelActions.togglePanel(this.ofModule, false));
                    this.store.dispatch(this.propertyPanelActions.requestClearPropertiesSuccess(this.ofModule));
                }
            });
        });
    }

    private showWarningDialog(options) {
        this.modalService.unsavedWarningMessage(options);
    }

    private buildPropertyPanelStyle(layoutInfoState, isGlobal) {
        if (!layoutInfoState) {
            return;
        }

        let topPos = parseInt(layoutInfoState.headerHeight, null) + parseInt(layoutInfoState.smallHeaderLineHeight, null);
        if (!isGlobal) {
            topPos = topPos + parseInt(layoutInfoState.dashboardPaddingTop, null) + parseInt(layoutInfoState.tabHeaderHeight, null);
        }
        this.propertyPanelStyle['top'] = `calc(${topPos}px)`;
        this.propertyPanelStyle['right'] = `calc(${layoutInfoState.rightMenuWidth}px)`;

        // let height = `calc(100vh - ${layoutInfoState.globalSearchHeight}px
        let height = `calc(100vh - ${layoutInfoState.headerHeight}px
                                 - ${layoutInfoState.smallHeaderLineHeight}px
                                 - ${layoutInfoState.dashboardPaddingTop}px`;

        if (!this.isGlobalLocal) {
            height += ` - ${layoutInfoState.tabHeaderHeight}px `;
        }

        height += `- ${layoutInfoState.propertyPanelHeader}px)`;

        this.propertyPanelBodyStyle = {
            'min-height': height,
            'max-height': height,
            'width': '100%'
        };

        setTimeout(() => {
            if (this.isExpand && this.el.children[0] && layoutInfoState.rightPropertyPanelWidth !== this.el.children[0].clientWidth.toString()) {
                this.propertyWidth = this.el.children[0].clientWidth.toString();
                this.store.dispatch(this.layoutInfoActions.setRightPropertyPanelWidth(this.propertyWidth, this.ofModule));
            }
        }, 200);

        this.changeDetectorRef.markForCheck();
    }

    public closePanel() {
        if (this.propertyPanelService.isDirty(this.properties)) {
            let options = {
                headerText: 'Saving Changes',
                message: [{ key: '<p>'}, { key: 'Modal_Message__DoYouWantToSaveWidgetProperties' }, { key: '<p>' }],
                onModalSaveAndExit: () => {
                    this.savePanel();
                    this.onClose.emit();
                },
                onModalExit: () => {
                    this.store.dispatch(this.propertyPanelActions.requestRollbackProperties(
                        {
                            data: this.parentData,
                            isGlobal: this.isGlobal
                        },
                        this.ofModule
                    ));
                    this.store.dispatch(this.layoutInfoActions.setRightPropertyPanelWidth('0', this.ofModule));
                    this.onClose.emit();
                }
            }

            this.showWarningDialog(options);

        } else {
            this.store.dispatch(this.layoutInfoActions.setRightPropertyPanelWidth('0', this.ofModule));
            this.onClose.emit();
        }
    }

    private savePanel() {
        this.store.dispatch(this.layoutInfoActions.setRightPropertyPanelWidth('0', this.ofModule));
        this.onSave.emit(this.parentData);
    }

    public onResizeEnd(event: ResizeEvent) {
        this.propertyPanelStyle['width'] = `${event.rectangle.width}px`;
        this.store.dispatch(this.layoutInfoActions.setRightPropertyPanelWidth(event.rectangle.width.toString(), this.ofModule));
        this.changeDetectorRef.markForCheck();
    }

    public propertiesChange(event) {
        const widgetPropertiesStateModel: WidgetPropertiesStateModel = new WidgetPropertiesStateModel({
            widgetData: this.parentData,
            widgetProperties: this.properties
        });

        this.onChange.emit(widgetPropertiesStateModel);
    }

    public propertiesApply(event) {
        this.onApply.emit(this.parentData);
    }
}
