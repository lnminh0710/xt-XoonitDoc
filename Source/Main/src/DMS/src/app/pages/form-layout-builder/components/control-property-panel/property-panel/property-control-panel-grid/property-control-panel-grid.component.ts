import { Component, Input, Output, OnInit, OnDestroy, EventEmitter, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { Module } from '@app/models';
import { ControlProperty } from '../../../../models/control-property';
import { Store } from '@ngrx/store';
import { UpdateValueControlSettingAction } from '../../../../form-layout-builder.statemanagement/form-layout-builder.actions';

@Component({
    selector: 'app-property-control-panel-grid',
    styleUrls: ['./property-control-panel-grid.component.scss'],
    templateUrl: './property-control-panel-grid.component.html',
    //changeDetection: ChangeDetectionStrategy.OnPush
})

export class PropertyControlPanelGridComponent implements OnInit, OnDestroy {

    @Input() set datasource(datasource: ControlProperty[]){        
        this.datasourceLocal = datasource;
        this.changeDetectorRef.markForCheck();
    }
    @Input() set isRoot(isRoot: boolean) {
        this.isRootLocal = isRoot;

        this.changeDetectorRef.markForCheck();
    }
    @Input() set level(level: number) {
        this.levelLocal = level;

        if (this.isRootLocal === false) {
            this.levelLocal += 1;
        }

        this.changeDetectorRef.markForCheck();
    }
    @Input() usingModule: Module;

    @Output() onPropertiesChange = new EventEmitter<any>();
    @Output() onPropertiesApply = new EventEmitter<any>();

    public levelLocal = 0;
    public isRootLocal = true;
    public datasourceLocal: ControlProperty[] = [];
    constructor(
        private changeDetectorRef: ChangeDetectorRef,
        private store: Store<any>
    ) {
    }

    ngOnInit() {
    }

    ngOnDestroy() {
    }

    public propertiesChange(event: ControlProperty) {
        this.store.dispatch(new UpdateValueControlSettingAction(event));
        this.onPropertiesChange.emit(event);
    }

    public propertiesApply(event) {
        this.onPropertiesApply.emit(event);
    }

    public itemsTrackBy(index, item) {
        return item ? item.id : undefined;
    }

}
