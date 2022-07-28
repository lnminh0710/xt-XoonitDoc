import { Component, OnInit, OnDestroy, Input, ChangeDetectionStrategy, ChangeDetectorRef, Output, EventEmitter } from '@angular/core';
import { Module, ParkedItemModel } from '@app/models';
import { ParkedItemService, PropertyPanelService } from '@app/services';
import { parse, format } from 'date-fns/esm';
import { MenuModuleId } from '@app/app.constants';

@Component({
    selector: 'module-welcome-sub-module',
    styleUrls: ['./module-welcome-sub-module.component.scss'],
    templateUrl: './module-welcome-sub-module.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush
})

export class ModuleWelcomeSubModuleComponent implements OnInit, OnDestroy {

    @Input() data: Module;

    @Output() onSelect: EventEmitter<ParkedItemModel> = new EventEmitter();

    constructor(
    ) {
    }

    ngOnInit() {
    }

    ngOnDestroy() {

    }

    public selectSubModule(subModule) {
        this.onSelect.emit(subModule);
    }
}
