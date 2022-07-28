import { Component, OnInit, Input, OnChanges, SimpleChanges, Output, EventEmitter } from '@angular/core';
import { FormManagementFieldModel, FormManagementModuleDetailModel } from '../../models/form-management.model';

import map from 'lodash-es/map';
import find from 'lodash-es/find';

@Component({
  selector: 'form-management-detail',
  templateUrl: './form-management-detail.component.html',
  styleUrls: ['./form-management-detail.component.scss'],
})
export class FormManagementDetailComponent implements OnInit, OnChanges {
  // Input
  @Input() dataSource: Array<FormManagementModuleDetailModel>;
  @Input() isAssignMode: boolean;
  @Input() isCardMode: boolean;
  @Input() fieldChanged: any;
  // Output
  @Output() onEditField: EventEmitter<any> = new EventEmitter();
  @Output() onChangeModuleName: EventEmitter<any> = new EventEmitter();
  @Output() saveFieldOrder: EventEmitter<any> = new EventEmitter();

  //Variable
  public isEditMode = true;
  public perfectScrollbarConfig: any = {
    suppressScrollX: false,
    suppressScrollY: false,
  };

  // Variable dialogs
  public showDialog: boolean;
  constructor() {}

  ngOnInit() {}

  ngOnChanges(changes: SimpleChanges) {}

  public changeEditMode() {
    this.isEditMode = !this.isEditMode;
  }

  public addField() {
    if (this.dataSource.length === 1) {
      const firstItem = this.dataSource[0];
      const maxOrder = Math.max(...map(firstItem.fields, 'OrderBy')) || 0;
      firstItem.fields.push(
        new FormManagementFieldModel({
          FieldName: 'New field',
          IsActive: true,
          IdRepDataType: '1',
          OrderBy: maxOrder + 1 + '',
          IdRepTableModuleTemplateName: firstItem.IdRepTableModuleTemplateName,
          new: true,
        }),
      );
      this.dataSource[0] = firstItem;
    } else {
      this.showDialog = true;
    }
  }

  public updateFieldValue(event: any) {
    this.onEditField.emit(event);
  }

  public updateFieldOrder(event: any) {
    this.saveFieldOrder.emit(event);
  }

  public updateModuleName(event) {
    this.onChangeModuleName.emit(event);
  }

  public closeDialog(event) {
    this.showDialog = false;
    if (event) {
      const module = find(this.dataSource, ['IdRepTableModuleTemplateName', event.IdRepTableModuleTemplateName]);
      const maxOrder = Math.max(...map(module.fields, 'OrderBy')) || 0;
      const field = new FormManagementFieldModel({
        FieldName: event.FieldName,
        IsActive: true,
        IdRepDataType: '1',
        OrderBy: maxOrder + 1 + '',
        IdRepTableModuleTemplateName: event.IdRepTableModuleTemplateName,
        new: true,
      });
      this.onEditField.emit({
        IdRepTableModuleTemplateName: event.IdRepTableModuleTemplateName,
        field,
      });
    }
  }
}
