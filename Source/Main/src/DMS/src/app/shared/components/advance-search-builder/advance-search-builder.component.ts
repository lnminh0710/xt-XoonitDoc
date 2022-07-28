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
  ViewChildren,
} from '@angular/core';
import { Uti } from '@app/utilities';
import { AdvanceSearchConditionComponent } from './components';
import { SearchService } from '@app/services';
import { AdvanceSearchFilter } from '@app/models';

@Component({
  selector: 'advance-search-builder',
  templateUrl: './advance-search-builder.component.html',
  styleUrls: ['./advance-search-builder.component.scss'],
})
export class AdvanceSearchBuilderComponent implements OnInit, OnDestroy, AfterViewInit {
  public fields;

  private executeFunctionCounter = 0;

  private _moduleId;
  @Input() set moduleId(id) {
    this._moduleId = id;
    if (id) {
      this.getFields();
    }
  }

  get moduleId() {
    return this._moduleId;
  }

  @ViewChildren(AdvanceSearchConditionComponent)
  advanceSearchConditionComponents: Array<AdvanceSearchConditionComponent>;

  private popup: any;
  private _builderList: Array<AdvanceSearchFilter> = [new AdvanceSearchFilter({})];

  @Input() set builderList(data) {
    this.unbuildLastControlKeyupEvent();
    this._builderList = data;

    this.executeFunctionCounter = 0;
    this.executeFunctionForWaitingControl(this.focusOnFistValue.bind(this));
    this.executeFunctionForWaitingControl(this.buildControlFocus.bind(this));
  }

  get builderList() {
    return this._builderList;
  }

  @Output() onDirtyAction = new EventEmitter<any>();
  @Output() onMeetLastInputAction = new EventEmitter<any>();

  constructor(private searchService: SearchService) {}

  ngAfterViewInit(): void {}

  ngOnDestroy(): void {}

  ngOnInit(): void {}

  getFields() {
    this.searchService.getColumnSetting(this.moduleId).subscribe((data) => {
      const columnSetting = JSON.parse(data[0][0].SettingColumnName)[1].ColumnsName;
      const fields: Array<any> = columnSetting.map((item) => {
        return {
          key: item.ColumnName,
          value: item.ColumnHeader,
          dataType: item.DataType,
          hidden: this.isHiddenField(item),
          setting: item.Setting,
        };
      });

      this.fields = fields.filter((p) => !p.hidden);
    });
  }

  private isHiddenField(item) {
    let isHidden: boolean = false;
    if (item.Setting && item.Setting.length) {
      (item.Setting as Array<any>).forEach((setting) => {
        if (
          setting.DisplayField &&
          (setting.DisplayField.Hidden == '1' || setting.DisplayField.HiddenAdvanceSearch == '1')
        ) {
          isHidden = true;
        }
      });
    }
    return isHidden;
  }

  add(index) {
    this.unbuildLastControlKeyupEvent();
    this.builderList.splice(index, 0, new AdvanceSearchFilter({}));

    this.executeFunctionCounter = 0;
    this.executeFunctionForWaitingControl(this.buildControlFocus.bind(this));
  }

  addLast() {
    this.builderList = this.builderList || [];
    this.builderList.push(new AdvanceSearchFilter({}));
    this.onDirtyAction.emit();
  }

  remove(index) {
    this.unbuildLastControlKeyupEvent();
    if (this.builderList.length == 1) {
      return;
    }
    this.builderList.splice(index, 1);

    this.executeFunctionCounter = 0;
    this.executeFunctionForWaitingControl(this.buildControlFocus.bind(this));
  }

  getData() {
    let arr = [];
    if (this.advanceSearchConditionComponents && this.advanceSearchConditionComponents.length) {
      this.advanceSearchConditionComponents.forEach((advanceSearchConditionComponent) => {
        let formData = advanceSearchConditionComponent.getFormData();
        arr.push(formData);
      });
    }
    return arr;
  }

  public onDirtyHandler() {
    this.onDirtyAction.emit();
  }

  public onFieldChangeHandler() {
    this.executeFunctionForWaitingControl(this.buildControlFocus.bind(this));
  }

  private executeFunctionForWaitingControl(func: Function) {
    if (this.executeFunctionCounter > 200) return;
    setTimeout(() => {
      const valueInput = $('#advance-search-condition-value-0');
      if (!valueInput || !valueInput.length) {
        this.executeFunctionForWaitingControl(func);
        return;
      }
      func();
    }, 10);
  }

  private focusOnFistValue() {
    $('#advance-search-condition-value-0').focus();
  }

  private buildControlFocus() {
    let controlList: any = $('*[id*=advance-search-condition-value]:visible');
    for (let i = 0; i < controlList.length; i++) {
      const control = $(controlList[i]);
      control.unbind('keyup');
      control.keyup(($event) => {
        if (!($event.which === 13 || $event.keyCode === 13)) return;
        if (i === controlList.length - 1) {
          this.onMeetLastInputAction.emit();
          return;
        }
        $(controlList[i + 1]).focus();
      });
    }
  }

  private unbuildLastControlKeyupEvent() {
    if (!this._builderList || !this._builderList.length) return;
    for (let i = 0; i < this._builderList.length; i++) {
      $('#advance-search-condition-value-' + i).unbind('keyup');
    }
  }
}
