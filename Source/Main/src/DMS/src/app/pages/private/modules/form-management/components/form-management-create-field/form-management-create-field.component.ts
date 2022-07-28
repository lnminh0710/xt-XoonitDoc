import { Component, Input, OnChanges, SimpleChanges, Output, EventEmitter } from '@angular/core';
import {
  FormManagementModuleModel,
  FormManagementFieldModel,
  FormManagementModuleDetailModel,
} from '../../models/form-management.model';

import map from 'lodash-es/map';
import findIndex from 'lodash-es/findIndex';

@Component({
  selector: 'form-management-create-field',
  templateUrl: './form-management-create-field.component.html',
  styleUrls: ['./form-management-create-field.component.scss'],
})
export class FormManagementCreateFieldComponent implements OnChanges {
  //Input
  @Input() showDialog: boolean;

  @Input() modules: Array<FormManagementModuleDetailModel>;

  //Output
  @Output() closeDialog: EventEmitter<any> = new EventEmitter();

  //Variable
  public isDisabled: boolean;

  public fieldList: Array<FormManagementFieldModel>;
  public fieldName: string = '';

  public moduleList: Array<string>;
  public selectedModule: FormManagementModuleDetailModel;

  ngOnChanges(changes: SimpleChanges) {
    if (changes['modules']) {
      this.moduleList = map(this.modules, 'name');
    }
  }

  public onChangeFieldName(event) {
    this.fieldName = event.target.value;
    this.checkDisabled();
  }

  public cancel() {
    this.closeDialog.emit();
  }

  public createField() {
    this.closeDialog.emit({
      FieldName: this.fieldName,
      IdRepTableModuleTemplateName: this.selectedModule.IdRepTableModuleTemplateName,
    });
  }

  private checkDisabled() {
    this.isDisabled = findIndex(this.selectedModule.fields, ['FieldName', this.fieldName]) !== -1;
  }
}
