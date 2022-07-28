import { FormGroup, FormControl } from '@angular/forms';
import {
  Component,
  Input,
  Output,
  ElementRef,
  EventEmitter,
  OnInit,
  OnDestroy,
  ViewChild,
  AfterViewInit,
} from '@angular/core';
import { Uti } from '@app/utilities';
import { AdvanceSearchFilter, ApiResultResponse } from '@app/models';
import { Subscription } from 'rxjs/Subscription';
import { Configuration, ComboBoxTypeConstant } from '@app/app.constants';
import { AppErrorHandler, CommonService, PropertyPanelService } from '@app/services';
import { AppState } from '@app/state-management/store';
import { Store } from '@ngrx/store';
import * as propertyPanelReducer from '@app/state-management/store/reducer/property-panel';
import { ModuleList } from '@app/pages/private/base';
import { Observable } from 'rxjs';

@Component({
  selector: 'tr[advance-search-condition]',
  templateUrl: './advance-search-condition.component.html',
  styleUrls: ['./advance-search-condition.component.scss'],
})
export class AdvanceSearchConditionComponent implements OnInit, OnDestroy, AfterViewInit {
  public conditionDatasource: Array<any>;
  public fieldDatasource: Array<any>;
  public operatorDatasource: Array<any>;
  public form: FormGroup;
  public controlType = 'textbox';
  private formValueChangeSubscription: Subscription;
  private globalPropertiesStateSubscription: Subscription;
  private globalPropertiesState: Observable<any>;
  public dropdownDatasource: any;
  public focusControlId = '';
  public globalDateFormat: string = null;

  private isFirsTimeChangeForField = true;

  @Input() index: number;

  private _formData: AdvanceSearchFilter;
  @Input() set formData(data) {
    this._formData = data;
    // Build Form Group here ...
    if (!data) {
      this.form = new FormGroup({
        condition: new FormControl('And'),
        field: new FormControl(''),
        operator: new FormControl(''),
        value: new FormControl(''),
        dataType: new FormControl(''),
      });
    } else {
      if (data.value && ((data.dataType && data.dataType === 'date') || data.value.indexOf('T00:00:00.000Z') !== -1)) {
        let date = Uti.parseISODateToDate(data.value);
        //console.log(date)
        data.value = date;
      }

      this.form = new FormGroup({
        condition: new FormControl(data.condition || 'And'),
        field: new FormControl(data.field || ''),
        operator: new FormControl(data.operator || ''),
        value: new FormControl(data.value || ''),
        dataType: new FormControl(data.dataType || ''),
      });
    }
    this.setFormValueChange();
  }

  get formData() {
    return this._formData;
  }

  @Input() set fields(data) {
    this.fieldDatasource = data;
  }

  get fields() {
    return this.fieldDatasource;
  }

  @Output() onAdd = new EventEmitter<any>();
  @Output() onRemove = new EventEmitter<any>();
  @Output() onDirtyAction = new EventEmitter<any>();
  @Output() onFieldChangeAction = new EventEmitter<any>();

  constructor(
    private commonService: CommonService,
    private appErrorHandler: AppErrorHandler,
    private _elementRef: ElementRef,
    private store: Store<AppState>,
    private propertyPanelService: PropertyPanelService,
    private consts: Configuration,
  ) {
    this.globalPropertiesState = this.store.select(
      (state) => propertyPanelReducer.getPropertyPanelState(state, ModuleList.Base.moduleNameTrim).globalProperties,
    );
  }

  ngAfterViewInit(): void {}

  ngOnDestroy(): void {}

  ngOnInit(): void {
    this.subscribeData();
    this.conditionDatasource = [
      {
        key: 'And',
        value: 'And',
      },
      {
        key: 'Or',
        value: 'Or',
      },
    ];

    this.operatorDatasource = [
      {
        key: 'Equals',
        value: '=',
      },
      {
        key: 'Difference',
        value: '<>',
      },
      {
        key: 'GreaterThan',
        value: '>',
      },
      {
        key: 'LessThan',
        value: '<',
      },
      {
        key: 'GreaterThanOrEquals',
        value: '>=',
      },
      {
        key: 'LessThanOrEquals',
        value: '<=',
      },
      {
        key: 'Contains',
        value: 'Contains',
      },
      {
        key: 'Equals',
        value: 'Equals',
      },
      {
        key: 'NotContains',
        value: 'Does Not Contain',
      },
    ];
    this.focusControlId = 'advance-search-condition-value-' + this.index;
  }

  private getDataSourceForStringValue() {
    return [
      {
        key: 'Contains',
        value: 'Contains',
      },
      {
        key: 'Equals',
        value: 'Equals',
      },
      {
        key: 'NotContains',
        value: 'Does Not Contain',
      },
    ];
  }

  private getDataSourceForComboBoxValue() {
    return [
      {
        key: 'Equals',
        value: 'Equals',
      },
      {
        key: 'NotEquals',
        value: 'Does Not Equal',
      },
    ];
  }

  private getDataSourceForBooleanValue() {
    return [
      {
        key: 'Equals',
        value: 'Equals',
      },
      {
        key: 'NotEquals',
        value: 'Does Not Equal',
      },
    ];
  }

  private getDataSourceForNumberValue() {
    return [
      {
        key: 'Equals',
        value: '=',
      },
      {
        key: 'Difference',
        value: '<>',
      },
      {
        key: 'GreaterThan',
        value: '>',
      },
      {
        key: 'LessThan',
        value: '<',
      },
      {
        key: 'GreaterThanOrEquals',
        value: '>=',
      },
      {
        key: 'LessThanOrEquals',
        value: '<=',
      },
    ];
  }

  public getFormData() {
    return this.form.value;
  }

  add() {
    this.onAdd.emit();
    this.onDirtyAction.emit();
  }

  remove() {
    this.onRemove.emit();
    this.onDirtyAction.emit();
  }

  onFieldChange(event) {
    if (event) {
      let item = this.fieldDatasource.find((p) => p.key == this.form.controls['field'].value);
      if (item) {
        this.controlType = 'textbox';
        let isNumberType = this.isNumberDataType(item.dataType);
        let isDateType = this.isDateDataType(item.dataType);
        let isCheckboxType = this.isCheckboxDataType(item.dataType);
        let isComboboxType = this.isDropdownDataType(item.setting);
        if (isNumberType) {
          this.controlType = 'numberbox';
        } else if (isDateType) {
          this.controlType = 'date';
        } else if (isComboboxType) {
          this.controlType = 'dropdown';
        } else if (isCheckboxType) {
          this.controlType = 'checkbox';
        }

        this.form.controls['dataType'].setValue(this.controlType);

        const oldOperator = this.form.controls['operator'].value;
        if (isNumberType || isDateType) {
          this.operatorDatasource = this.getDataSourceForNumberValue();
        } else if (isCheckboxType) {
          this.operatorDatasource = this.getDataSourceForBooleanValue();
        } else if (isComboboxType) {
          this.operatorDatasource = this.getDataSourceForComboBoxValue();
        } else {
          this.operatorDatasource = this.getDataSourceForStringValue();
        }
        this.reSetOldValueForOperator(oldOperator);
        if (!this.isFirsTimeChangeForField) {
          this.form.controls['value'].setValue('');
          this.isFirsTimeChangeForField = false;
        }
      }
    }
    this.rebuildControlFocus();
  }

  private rebuildControlFocus() {
    setTimeout(() => {
      // this.setIdForCheckbox();
      this.onFieldChangeAction.emit();
    }, 500);
  }

  private setIdForCheckbox() {
    if (this.controlType != 'checkbox') return;
    const checkbox = $('input.mat-checkbox-input', this._elementRef.nativeElement);
    if (!checkbox.length) return;
    checkbox.attr('id', this.focusControlId);
  }

  private reSetOldValueForOperator(oldOperator: string) {
    setTimeout(() => {
      for (const item of this.operatorDatasource) {
        if (item['key'] !== oldOperator) continue;
        this.form.controls['operator'].setValue(oldOperator);
        break;
      }
    });
  }

  private isCheckboxDataType(dataType) {
    let isCheckboxType = false;
    switch (dataType) {
      case 'bit':
        isCheckboxType = true;
        break;
    }
    return isCheckboxType;
  }

  private isNumberDataType(dataType) {
    let isNumberType = false;
    switch (dataType) {
      case 'int':
      case 'bigint':
      case 'float':
      case 'money':
        isNumberType = true;
        break;
    }
    return isNumberType;
  }

  private isDateDataType(dataType) {
    let isDateType = false;
    switch (dataType) {
      case 'date':
      case 'datetime':
        isDateType = true;
        break;
    }
    return isDateType;
  }

  private isDropdownDataType(settingArray) {
    const setting = Uti.getCloumnSettings(settingArray);
    if (setting.ControlType && /ComboBox/i.test(setting.ControlType.Type) && setting.ControlType.Value) {
      let identificationKey = setting.ControlType.Value;
      this.getComboBoxData(identificationKey);
      return true;
    }
    return false;
  }

  private getComboBoxData(identificationKey) {
    this.commonService.getListComboBox(identificationKey).subscribe((response: ApiResultResponse) => {
      if (!Uti.isResquestSuccess(response)) {
        return;
      }
      const comboOptions: Array<any> = this.getValidCombobox(response.item, identificationKey);
      if (comboOptions && comboOptions.length) {
        this.dropdownDatasource = comboOptions.map((option) => {
          return {
            key: option.textValue,
            value: option.textValue,
          };
        });
      }
    });
  }

  private setFormValueChange() {
    if (this.formValueChangeSubscription) {
      this.formValueChangeSubscription.unsubscribe();
    }
    setTimeout(() => {
      this.formValueChangeSubscription = this.form.valueChanges
        .debounceTime(this.consts.valueChangeDeboundTimeDefault)
        .subscribe((data) => {
          this.appErrorHandler.executeAction(() => {
            if (!this.form.pristine) {
              this.onDirtyAction.emit();
            }
          });
        });
    }, 500);
  }

  private getValidCombobox(listComboBox: any, identificationKey: any) {
    const keys = Object.keys(ComboBoxTypeConstant);
    let idx: string;
    keys.forEach((key) => {
      if (ComboBoxTypeConstant[key] == identificationKey) {
        idx = key;
      }
    });

    if (!idx) {
      idx = identificationKey;
    }

    return listComboBox[idx];
  }

  private subscribeData() {
    this.globalPropertiesStateSubscription = this.globalPropertiesState.subscribe((globalProperties: any) => {
      this.appErrorHandler.executeAction(() => {
        if (globalProperties && globalProperties.length) {
          this.globalDateFormat = this.propertyPanelService.buildGlobalInputDateFormatFromProperties(globalProperties);
        }
      });
    });
  }
}
