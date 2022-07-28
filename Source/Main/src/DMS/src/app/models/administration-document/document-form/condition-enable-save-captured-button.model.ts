import { DocumentProcessingTypeEnum, DocumentFormNameEnum } from '@app/app.constants';

export class ConditionEnableSaveCapturedButton {
    documentProcessingType: DocumentProcessingTypeEnum;
    needInitialForms: DocumentFormNameEnum[];
    countInitialForm: number;

    public canEnable(documentFormName: DocumentFormNameEnum): boolean {
        if (!this.needInitialForms || !this.needInitialForms.length) {
            return false;
        }

        if (this.needInitialForms.indexOf(documentFormName) !== -1) {
            this.countInitialForm += 1;
        }

        return this.countInitialForm >= this.needInitialForms.length;
    }
}
