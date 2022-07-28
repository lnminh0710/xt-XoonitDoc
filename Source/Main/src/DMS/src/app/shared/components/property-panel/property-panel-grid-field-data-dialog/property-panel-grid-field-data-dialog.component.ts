import {
    Component, Output, EventEmitter, OnInit,
    OnDestroy, ViewChild, AfterViewInit, ViewChildren, QueryList,
    ChangeDetectionStrategy, ChangeDetectorRef, Input
} from '@angular/core';
import cloneDeep from 'lodash-es/cloneDeep';
import { Observable, Subscription } from 'rxjs';
import { Store } from '@ngrx/store';
import { AppState } from '@app/state-management/store';
import { WidgetTemplateSettingService, AppErrorHandler, PropertyPanelService } from '@app/services';
import { Uti } from '@app/utilities/uti';
import { WidgetDetail, RawFieldEntity, WidgetPropertyModel, StyleFormatFieldEntity, Module } from '@app/models';
import { PerfectScrollbarDirective } from 'ngx-perfect-scrollbar';
import { PopoverDirective } from 'ngx-bootstrap/popover';
import * as propertyPanelReducer from '@app/state-management/store/reducer/property-panel';

@Component({
    selector: 'property-panel-grid-field-data-dialog',
    styleUrls: ['./property-panel-grid-field-data-dialog.component.scss'],
    templateUrl: './property-panel-grid-field-data-dialog.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class PropertyPanelGridFieldDataDialogComponent implements OnInit, OnDestroy, AfterViewInit {

    public showDialog = false;
    private propertiesParentDataState: Observable<any>;
    private propertiesParentDataStateSubscription: Subscription;
    private widgetDetail: WidgetDetail;

    private selectedField: StyleFormatFieldEntity;
    private formatedFields: Array<StyleFormatFieldEntity> = null;
    public perfectScrollbarConfig: any = {};

    displayFields: Array<StyleFormatFieldEntity>;

    properties: WidgetPropertyModel[] = [];

    @ViewChild(PerfectScrollbarDirective) directiveScroll: PerfectScrollbarDirective;
    @ViewChildren(PopoverDirective) popoverDirectives: QueryList<PopoverDirective>;

    @Input() usingModule: Module;

    @Output() onApply = new EventEmitter<Array<StyleFormatFieldEntity>>();

    constructor(private store: Store<AppState>,
        private appErrorHandler: AppErrorHandler,
        private widgetTemplateSettingService: WidgetTemplateSettingService,
        protected propertyPanelService: PropertyPanelService,
        private changeDetectorRef: ChangeDetectorRef,
    ) {
        this.propertiesParentDataState = this.store.select(state => propertyPanelReducer.getPropertyPanelState(state, this.usingModule.moduleNameTrim).propertiesParentData);
    }

    /**
     * scrollBodyContainer
     */
    public get scrollBodyContainer() {
        if (this.directiveScroll) {
            return this.directiveScroll.elementRef.nativeElement;
        }
        return null;
    }

    ngOnInit() {

        this.perfectScrollbarConfig = {
            suppressScrollX: false,
            suppressScrollY: false
        };

        this.subscribePropertiesParentDataState();
    }

    /**
     * ngAfterViewInit
     */
    ngAfterViewInit() {
    }

    /**
     * ngOnDestroy
     */
    ngOnDestroy() {
        Uti.unsubscribe(this);
        $(this.scrollBodyContainer).off('ps-scroll-y');
    }

    private initProperty() {
        let alignProperty: WidgetPropertyModel = new WidgetPropertyModel({
            id: 'DataLabelStyleAlign',
            name: 'Align',
            value: 'Left',
            dataType: 'Object',
            options: this.propertyPanelService.defaultAlignOptions()
        });

        let colorProperty: WidgetPropertyModel = new WidgetPropertyModel({
            id: 'DataLabelStyleColor',
            name: 'Color',
            value: 'Black',
            dataType: 'Color',
            options: null
        });

        let fontProperty: WidgetPropertyModel = new WidgetPropertyModel({
            id: 'DataLabelStyleFontName',
            name: 'FontName',
            value: 'Tahoma',
            dataType: 'Object',
            options: this.propertyPanelService.defaultFontNameOptions()
        });

        let fontSizeProperty: WidgetPropertyModel = new WidgetPropertyModel({
            id: 'DataLabelStyleFontSize',
            name: 'FontSize',
            value: 12,
            dataType: 'Object',
            options: this.propertyPanelService.defaultFontSizeOptions()
        });

        let styleBoldProperty: WidgetPropertyModel = new WidgetPropertyModel({
            id: 'DataLabelStyleBold',
            name: 'Bold',
            value: false,
            dataType: 'Boolean',
            options: null
        });

        let styleItalicProperty: WidgetPropertyModel = new WidgetPropertyModel({
            id: 'DataLabelStyleItalic',
            name: 'Italic',
            value: false,
            dataType: 'Boolean',
            options: null
        });

        let styleUnderlineProperty: WidgetPropertyModel = new WidgetPropertyModel({
            id: 'DataLabelStyleUnderline',
            name: 'Underline',
            value: false,
            dataType: 'Boolean',
            options: null
        });

        this.properties = [
            alignProperty,
            colorProperty,
            fontProperty,
            fontSizeProperty,
            styleBoldProperty,
            styleItalicProperty,
            styleUnderlineProperty];

        this.changeDetectorRef.markForCheck();
    }

    private subscribePropertiesParentDataState() {
        this.propertiesParentDataStateSubscription = this.propertiesParentDataState.subscribe((propertiesParentDataState: any) => {
            this.appErrorHandler.executeAction(() => {
                if (!propertiesParentDataState)
                    return;
                this.widgetDetail = cloneDeep(propertiesParentDataState || {});

                this.changeDetectorRef.markForCheck();
            });
        });
    }

    public open(item: WidgetPropertyModel) {
        if (item && item.value) {
            this.formatedFields = item.value;
        }
        if (this.widgetDetail.contentDetail && this.widgetDetail.contentDetail.data) {
            const isGroup: boolean = this.widgetDetail.contentDetail.data[0][0]['IsGroup'];
            const data: Array<RawFieldEntity> = this.widgetDetail.contentDetail.data[1];
            this.displayFields = Uti.styleFormatFieldsetData(data, isGroup);
            if (this.displayFields.length) {
                this.displayFields.forEach(item => {
                    this.updateDisplayField(item);
                });
            }
            this.showDialog = true;

            setTimeout(() => {
                $(this.scrollBodyContainer).on('ps-scroll-y', () => {
                    if (this.popoverDirectives && this.popoverDirectives.length) {
                        this.popoverDirectives.forEach(popoverDirective => {
                            popoverDirective.hide();
                        });
                    }
                });
            });

            this.changeDetectorRef.markForCheck();
        }
    }

    public close() {
        this.showDialog = false;

        this.changeDetectorRef.markForCheck();
    }

    public apply() {
        this.close();
        const data = this.displayFields.filter(p => p.stylePoperties);
        this.onApply.emit(data);
    }


    /**
     * updateDisplayField
     * @param selectedField
     */
    private updateDisplayField(selectedField: StyleFormatFieldEntity) {
        if (!selectedField.stylePoperties || (selectedField.stylePoperties && !selectedField.stylePoperties.length)) {
            if (this.formatedFields && this.formatedFields.length) {
                const rs = this.formatedFields.filter(p => p.originalColumnName == selectedField.originalColumnName);
                if (rs.length) {
                    selectedField.stylePoperties = rs[0].stylePoperties;
                }
            }
        }

        this.changeDetectorRef.markForCheck();
    }

    /**
     * showPopover
     * @param item
     */
    public showPopover(item: StyleFormatFieldEntity, pop) {
        this.selectedField = item;
        this.initProperty();
        this.updateDisplayField(this.selectedField);

        if (this.selectedField.stylePoperties && this.selectedField.stylePoperties.length) {
            this.selectedField.stylePoperties.forEach((style: WidgetPropertyModel) => {
                let prop: WidgetPropertyModel = this.propertyPanelService.getItemRecursive(this.properties, style.id);
                prop.value = style.value;
            })
        }

        pop.show();

        this.changeDetectorRef.markForCheck();
    }

    /**
     * propertiesChange
     * @param event
     */
    propertiesChange(event) {
        if (event) {
            this.selectedField.stylePoperties = cloneDeep(this.properties);

            this.changeDetectorRef.markForCheck();
        }
    }

    public itemsTrackBy(index, item) {
        return item ? item.value : undefined;
    }
}
