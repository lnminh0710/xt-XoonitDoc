import { XFormConfigDefinitionV2 } from './x-form-config.interface';

export interface XFormGroupConfigDefinitionV2 {
    methodName: string;
    object: string;
    formConfigDefs: XFormConfigDefinitionV2[];
}
