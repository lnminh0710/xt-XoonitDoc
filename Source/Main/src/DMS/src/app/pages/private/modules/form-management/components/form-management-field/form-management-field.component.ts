import { Component, OnInit, Input, OnDestroy, OnChanges, SimpleChanges, Output, EventEmitter } from '@angular/core';
import { FormManagementFieldModel } from '../../models/form-management.model';
import { Subscription } from 'rxjs';
import { DragulaService } from 'ng2-dragula';

import cloneDeep from 'lodash-es/cloneDeep';

@Component({
  selector: 'form-management-field',
  templateUrl: './form-management-field.component.html',
  styleUrls: ['./form-management-field.component.scss'],
})
export class FormManagementFieldComponent implements OnInit, OnDestroy, OnChanges {
  //Input
  @Input() moduleName: string;
  @Input() IdRepTableModuleTemplateName: number;

  @Input() isCardMode: boolean;
  @Input() isEditMode: boolean;
  @Input() isAssignMode: boolean;

  @Input() fields: Array<FormManagementFieldModel>;

  //Output
  @Output() updateFieldValue: EventEmitter<any> = new EventEmitter();
  @Output() updateModuleName: EventEmitter<any> = new EventEmitter();
  @Output() updateFieldOrder: EventEmitter<any> = new EventEmitter();

  //Variable
  public isExpand = true;

  public classNameOrder = 'order-icon';
  public totalFieldActive = 0;
  public totalField = 0;

  private subscripteDropModel: Subscription;

  constructor(private dragulaService: DragulaService) {}

  ngOnInit() {
    this.initDragulaEvents();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['fields']) {
      this.countFieldDetail();
    }
    if (changes['isAssignMode']) {
      if (!this.isAssignMode && !this.dragulaService.find(this.moduleName)) {
        this.dragulaService.setOptions(this.moduleName, {
          moves: (el, container, handle) => {
            return true;
          },
        });
      } else if (this.isAssignMode && this.dragulaService.find(this.moduleName)) {
        this.dragulaService.destroy(this.moduleName);
      }
    }
  }

  ngOnDestroy() {
    this.subscripteDropModel.unsubscribe();
    if (this.dragulaService.find(this.moduleName)) this.dragulaService.destroy(this.moduleName);
  }

  public changeModule(e: any) {
    this.updateModuleName.emit({
      IdRepTableModuleTemplateName: this.IdRepTableModuleTemplateName,
      DefaultValue: e.target.value,
    });
  }

  public onFocusOut(event: any, field: FormManagementFieldModel) {
    const value = event.target.value;
    if (value === field.FieldName) return;
    field.FieldName = value;
    const request = field.new
      ? field
      : {
          IdTableModuleEntityTemplate: field.IdTableModuleEntityTemplate,
          FieldName: value,
        };
    this.updateFieldValue.emit({
      IdRepTableModuleTemplateName: this.IdRepTableModuleTemplateName,
      field: request,
    });
  }

  public clickToggle(field: FormManagementFieldModel) {
    if (this.isAssignMode) return;
    const key = 'IsActive';
    // if (this.isAssignMode) key = 'selected';
    this.updateFieldValue.emit({
      IdRepTableModuleTemplateName: this.IdRepTableModuleTemplateName,
      field: {
        IdTableModuleEntityTemplate: field.IdTableModuleEntityTemplate,
        [key]: !field[key],
      },
    });
    // this.countFieldDetail();
  }

  private countFieldDetail() {
    const key = 'IsActive';
    this.totalFieldActive = this.fields.filter(_f => _f[key]).length;
    this.totalField = this.fields.length;
  }

  private initDragulaEvents() {
    this.subscripteDropModel = this.dragulaService.drop.subscribe(this.onDropModel.bind(this));
  }

  private onDropModel(args: any) {
    const [bagName, elSource, bagTarget, bagSource] = args;
    if (bagName === this.moduleName) {
      setTimeout(() => {
        this.updateFieldOrder.emit({
          IdRepTableModuleTemplateName: this.IdRepTableModuleTemplateName,
          fields: cloneDeep(this.fields),
        });
      }, 1);
    }
  }
}
