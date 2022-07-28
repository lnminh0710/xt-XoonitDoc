export class FormManagementModuleDetailModel {
  public name: string;
  public IdRepTableModuleTemplateName: string;
  public fields: Array<FormManagementFieldModel>;

  public constructor(init?: Partial<FormManagementModuleModel>) {
    Object.assign(this, init);
  }
}

export class FormManagementDoctypeModel {
  public IdRepDocumentType: string;
  public DefaultValue: string;

  public selected?: boolean;

  public constructor(init?: Partial<FormManagementDoctypeModel>) {
    Object.assign(this, init);
  }
}

export class FormManagementModuleModel {
  public IdRepTableModuleTemplateName: string;
  public DefaultValue: string;

  public selected?: boolean;

  public constructor(init?: Partial<FormManagementModuleModel>) {
    Object.assign(this, init);
  }
}

export class FormManagementFieldModel {
  public IdTableModuleEntityTemplate: string;
  public IdRepDataType: string;
  public IdRepTableModuleTemplateName: string;

  public FieldName: string;
  public DefaultValue: string;
  public IsAddedFromUser: boolean = true;
  public IsActive: boolean = true;

  public IsDeleted: boolean;
  public OrderBy: string;

  public selected?: boolean;
  public new?: boolean;

  public constructor(init?: Partial<FormManagementFieldModel>) {
    Object.assign(this, init);
  }
}
