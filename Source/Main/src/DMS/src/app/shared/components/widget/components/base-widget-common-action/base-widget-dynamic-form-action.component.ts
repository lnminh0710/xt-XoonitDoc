import { ViewContainerRef, Injector, ViewChild } from '@angular/core';
import { FieldFilter, WidgetPropertyModel } from '../../../../../models';
import { Router } from '@angular/router';
import { CommonFormComponent } from '../../../../../xoonit-share/components/widget-dynamic-form/components/common-form/common-form.component';
import { BaseWidgetCommonAction } from './base-widget-common-action.component';
import { WidgetDynamicFormComponent } from '../../../../../xoonit-share/components/widget-dynamic-form/widget-dynamic-form.component';

export abstract class BaseWidgetDynamicFormCommonAction extends BaseWidgetCommonAction {

    @ViewChild(WidgetDynamicFormComponent) widgetDynamicFormComponent: WidgetDynamicFormComponent;

    constructor(protected injector: Injector,
                protected containerRef: ViewContainerRef,
                protected router: Router) {
        super(injector, containerRef, router);
    }    

    ngAfterViewInit() {
        this.widgetDynamicFormComponent?.formInitialized.takeUntil(this.getUnsubscriberNotifier()).subscribe(form => {
            this.dynamicCommonFormInitialized(form);
        });
        this.widgetDynamicFormComponent?.formListInitialized.takeUntil(this.getUnsubscriberNotifier()).subscribe(form => {
            this.dynamicCommonFormListInitialized(form);
        });
    }

    private dynamicCommonFormInitialized(form: CommonFormComponent) {
        const displayFields = form.getDisplayFields();
        const orgFieldFilters = displayFields.map(p => new FieldFilter({
            fieldDisplayName: p.value,
            fieldName: p.key,
            selected: true
        }));
        this.updateFieldFilter(orgFieldFilters);
        this.displayFieldsSubject.next(orgFieldFilters);
        this.filterDisplayFields(orgFieldFilters);
    }

    private dynamicCommonFormListInitialized(forms: Array<CommonFormComponent>) {
        let orgFieldFilters: FieldFilter[] = [];
        forms.forEach(form => {
            const displayFields = form.getDisplayFields();
            let arr = displayFields.map(p => new FieldFilter({
                fieldDisplayName: p.value,
                fieldName: p.key,
                selected: true
            }));
            orgFieldFilters = orgFieldFilters.concat(arr);
        });
        this.updateFieldFilter(orgFieldFilters);
        this.displayFieldsSubject.next(orgFieldFilters);
        this.filterDisplayFields(orgFieldFilters);
    }

    private updateFieldFilter(orgFieldFilters: FieldFilter[]) {
        if (this.widgetProperties?.length) {
            const propDisplayFields: WidgetPropertyModel = this.propertyPanelService.getItemRecursive(this.widgetProperties, 'DisplayField');
            const savingFieldFilters: FieldFilter[] = propDisplayFields.options.map((x) => {
                return new FieldFilter({
                    fieldName: x.key,
                    fieldDisplayName: x.value,
                    selected: x.selected,
                    isEditable: x.isEditable,
                    isHidden: x.isHidden,
                });
            });

            orgFieldFilters.forEach(orgFieldFilter => {
                const item = savingFieldFilters.find(p => p.fieldName == orgFieldFilter.fieldName);
                if (item) {
                    orgFieldFilter.selected = item.selected;
                }
            });
        }
    }

    public resetWidget() {
        this.widgetDynamicFormComponent?.reset();
    }

    public filterDisplayFields(displayFields: Array<FieldFilter>) {
        displayFields.forEach(field => {
            this.widgetDynamicFormComponent?.setHiddenField(field.fieldName, field.selected ? false : true, -1);
        });
    }
}
