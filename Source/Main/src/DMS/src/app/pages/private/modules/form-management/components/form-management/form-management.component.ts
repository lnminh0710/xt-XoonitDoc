import { Component, OnInit, Input } from '@angular/core';
import { Store } from '@ngrx/store';
import { AppState } from '@app/state-management/store';
import { ProcessDataActions } from '@app/state-management/store/actions';
import { BaseWidget } from '@app/pages/private/base';
import { FormManagementService } from '../../services/form-management.service';

import find from 'lodash-es/find';
import remove from 'lodash-es/remove';
import cloneDeep from 'lodash-es/cloneDeep';
import omit from 'lodash-es/omit';

import {
  FormManagementDoctypeModel,
  FormManagementModuleModel,
  FormManagementModuleDetailModel,
  FormManagementFieldModel,
} from '../../models/form-management.model';

@Component({
  selector: 'form-management',
  styleUrls: ['./form-management.component.scss'],
  templateUrl: './form-management.component.html',
  host: { '(contextmenu)': 'rightClicked($event)' },
})
export class FormManagementComponent extends BaseWidget implements OnInit {
  //Variable
  @Input() isCardMode: boolean;

  public isAssignMode: boolean;
  public isDisabledAssign: boolean = true;

  // Document type
  public listDocumentType: Array<FormManagementDoctypeModel> = [];

  // Module
  public listModule: Array<FormManagementModuleModel> = [];
  // Field
  public fields: Array<FormManagementModuleDetailModel> = [];
  public fieldChanges: FormManagementModuleModel;

  constructor(
    private store: Store<AppState>,
    private processDataActions: ProcessDataActions,
    private formManagementService: FormManagementService,
  ) {
    super();
  }

  ngOnInit() {
    this.getDocumentTypes();
    this.getModules(null);
  }

  public rightClicked($event) {
    this.store.dispatch(this.processDataActions.dontWantToShowContextMenu());
  }

  // BEGIN Document type

  public addDocumentType(event) {
    this.updateDoctypeById({ IdRepDocumentType: null, DefaultValue: event.value });
  }

  public onClickDocumentType(documentType: FormManagementDoctypeModel) {
    const listDocumentType = cloneDeep(this.listDocumentType);
    const key = 'selected';
    if (!this.isAssignMode) {
      const documentTypeSelected = find(listDocumentType, [key, true]);
      if (documentTypeSelected && documentTypeSelected.IdRepDocumentType !== documentType.IdRepDocumentType) {
        documentTypeSelected[key] = false;
      }
      this.fields = [];
    }

    const documentTypeF = find(listDocumentType, ['IdRepDocumentType', documentType.IdRepDocumentType]);
    documentTypeF[key] = !documentTypeF[key];

    this.listDocumentType = listDocumentType;

    if (this.isAssignMode) {
      this.checkDisableAssignButton();
      return;
    }
    this.getModules(documentTypeF[key] ? documentTypeF.IdRepDocumentType : null);
  }

  // END Document type

  // BEGIN Module

  public addModule(event) {
    this.updateModuleById({ IdRepTableModuleTemplateName: null, DefaultValue: event.value });
  }

  public changeModuleName(event) {
    this.updateModuleById(event);
  }

  public onClickModule(module: FormManagementModuleModel) {
    const listModule = this.listModule;
    const moduleF = find(listModule, ['IdRepTableModuleTemplateName', module.IdRepTableModuleTemplateName]);
    const key = 'selected';
    moduleF[key] = !moduleF[key];
    this.listModule = listModule;
    this.getFields(moduleF[key], module);
    this.checkDisableAssignButton();
  }

  // END Module

  // BEGIN Field

  public changeField(data: any) {
    // if (this.isAssignMode) return;
    const fields = this.fields;
    const moduleF = find(fields, ['IdRepTableModuleTemplateName', data.IdRepTableModuleTemplateName]);
    if (moduleF) {
      let field =
        find(moduleF.fields || [], ['IdTableModuleEntityTemplate', data.field.IdTableModuleEntityTemplate]) || {};
      field = Object.assign(field, data.field);
      const IdRepTableModuleTemplateName = field.new ? data.IdRepTableModuleTemplateName : null;
      this.updateFieldById([omit(field, ['DefaultValue', 'new'])], IdRepTableModuleTemplateName);
    }
    this.fields = fields;
  }

  public saveFieldOrder(e: any) {
    const fields = e.fields;
    for (let index = 0; index < fields.length; index++) {
      const element = fields[index];
      delete element.DefaultValue;
      delete element.new;
      element.OrderBy = index + 1 + '';
      fields[index] = element;
    }

    this.updateFieldById(fields, e.IdRepTableModuleTemplateName);
  }

  // END Field

  // BEGIN Assign mode

  public saveModuleOrder(event) {}

  public changeAssignMode() {
    this.isAssignMode = !this.isAssignMode;
    this.isDisabledAssign = true;
    const key = 'selected';
    this.resetKeyword(this.listDocumentType, key);
    this.resetKeyword(this.listModule, key);
    if (this.isAssignMode) this.getModules(null);
    this.fields = [];
  }

  public saveAssignMode() {
    const documentTypeSelected = this.listDocumentType.filter(_d => _d.selected);
    const moduleSelected = this.listModule.filter(_d => _d.selected);
    const request = [];
    for (const key in documentTypeSelected) {
      if (documentTypeSelected.hasOwnProperty(key)) {
        const document = documentTypeSelected[key];
        for (const keyModule in moduleSelected) {
          if (moduleSelected.hasOwnProperty(keyModule)) {
            const module = moduleSelected[keyModule];
            request.push({
              IdDocumentTableModuleContainer: null,
              IdRepDocumentType: document.IdRepDocumentType,
              IdRepTableModuleTemplateName: module.IdRepTableModuleTemplateName,
            });
          }
        }
      }
    }

    this.formManagementService.assignModule(request).subscribe(response => {
      this.changeAssignMode();
    });
  }

  // END Assign mode

  // BEGIN call API
  private getDocumentTypes() {
    this.formManagementService.getAllDocumentType().subscribe(response => {
      this.listDocumentType = cloneDeep(response);
    });
  }

  private getModules(doctypeId?: any) {
    this.formManagementService.getAllModule(doctypeId).subscribe(response => {
      this.listModule = cloneDeep(response);
    });
  }

  private getFields(isAdd: boolean, module: FormManagementModuleModel) {
    const fields = cloneDeep(this.fields);
    if (isAdd) {
      this.formManagementService.getFieldByModuleId(module.IdRepTableModuleTemplateName).subscribe(response => {
        fields.push({
          name: module.DefaultValue,
          IdRepTableModuleTemplateName: module.IdRepTableModuleTemplateName,
          fields: response,
        });
        this.fields = fields;
      });
    } else {
      remove(fields, _f => _f.name === module.DefaultValue);
      this.fields = fields;
    }
  }

  private updateDoctypeById(data: FormManagementDoctypeModel) {
    this.formManagementService.saveDoctype([data]).subscribe(response => {
      this.getDocumentTypes();
    });
  }

  private updateModuleById(data: FormManagementModuleModel) {
    this.formManagementService.saveModule([data]).subscribe(response => {
      const doc = find(this.listDocumentType, ['selected', true]);
      this.getModules(doc ? doc.IdRepDocumentType : null);
    });
  }

  private updateFieldById(data: Array<FormManagementFieldModel>, IdRepTableModuleTemplateName?: any) {
    this.formManagementService.saveField(data).subscribe(response => {
      // this.getF;
      if (IdRepTableModuleTemplateName) {
        const module = find(this.fields, ['IdRepTableModuleTemplateName', IdRepTableModuleTemplateName]);
        this.formManagementService.getFieldByModuleId(IdRepTableModuleTemplateName).subscribe(fieldResponse => {
          if (module) module.fields = fieldResponse;
        });
      }
    });
  }

  // END call API

  private checkDisableAssignButton() {
    const docTypeSelected = this.listDocumentType.filter(_d => _d.selected).length;
    const moduleSelected = this.listModule.filter(_f => _f.selected).length;
    this.isDisabledAssign = !docTypeSelected || !moduleSelected;
  }

  private resetKeyword(list, key) {
    list.forEach(_l => (_l[key] = false));
  }
}
