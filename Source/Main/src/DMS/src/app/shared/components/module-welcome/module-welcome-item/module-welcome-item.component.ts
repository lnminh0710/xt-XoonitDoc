import {
    Component,
    OnInit,
    OnDestroy,
    Input,
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Output,
    EventEmitter,
} from '@angular/core';
import { Module, ParkedItemModel } from '@app/models';
import { ParkedItemService, PropertyPanelService } from '@app/services';
import { parse, format } from 'date-fns/esm';
import { MenuModuleId } from '@app/app.constants';
import { Uti } from '@app/utilities';

@Component({
    selector: 'module-welcome-item',
    styleUrls: ['./module-welcome-item.component.scss'],
    templateUrl: './module-welcome-item.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ModuleWelcomeItemComponent implements OnInit, OnDestroy {
    public parkedItem: ParkedItemModel;
    private config: Array<any> = [];
    public parkedItemFields: Array<any> = [];
    public globalDateFormat: string = '';

    @Input() activeModule: Module;
    @Input() subModules: Module[] = [];
    @Input() set data(data: any) {
        setTimeout(() => {
            this.parkedItem = data.item;
            this.config = data.fieldConfig;

            this.buildDisplayFields();
            this.ref.markForCheck();
        }, 200);
    }
    @Input() set globalProperties(globalProperties: any[]) {
        this.globalDateFormat = this.propertyPanelService.buildGlobalDateFormatFromProperties(globalProperties);
    }

    @Output() onSelect: EventEmitter<ParkedItemModel> = new EventEmitter();

    constructor(
        private ref: ChangeDetectorRef,
        private parkedItemService: ParkedItemService,
        private propertyPanelService: PropertyPanelService,
        private uti: Uti,
    ) {}

    ngOnInit() {}

    ngOnDestroy() {}

    private buildDisplayFields() {
        this.parkedItemFields = [];

        for (const name in this.parkedItem) {
            if (!this.parkedItem[name]) {
                continue;
            }

            const allowedField = this.parkedItemService.buildFieldFromConfig(name, this.parkedItem, this.config);
            if (allowedField && allowedField.fieldName) {
                if (allowedField.fieldName.toLowerCase().indexOf('date') > -1 && allowedField.fieldValue) {
                    allowedField.fieldValue = parse(allowedField.fieldValue, 'dd.MM.yyyy', new Date());
                }
                this.parkedItemFields.push(allowedField);
            }
        }

        if (
            this.activeModule &&
            this.activeModule.idSettingsGUI === MenuModuleId.processing &&
            this.parkedItem['idSettingsGUI'] &&
            this.parkedItem['idSettingsGUI'].value
        ) {
            const activeSubModule = this.parkedItemService.getActiveSubModule(
                this.subModules,
                this.parkedItem['idSettingsGUI'].value,
            );
            if (activeSubModule) {
                const titleField = {
                    fieldName: activeSubModule.moduleName,
                    fieldValue: activeSubModule.moduleName,
                    icon: activeSubModule.iconName,
                    tooltipPlacement: 'top',
                };

                this.parkedItemFields.push(titleField);

                this.parkedItemService.moveHeaderToTop(activeSubModule.moduleName, this.parkedItemFields);
            }
        } else {
            this.parkedItemService.moveHeaderToTop('personNr', this.parkedItemFields);
        }
    }

    public formatDate(date) {
        try {
            return this.uti.formatLocale(date, this.globalDateFormat);
        } catch (error) {
            return null;
        }
    }

    public selectParkedItem(parkedItem) {
        this.onSelect.emit(parkedItem);
    }
}
