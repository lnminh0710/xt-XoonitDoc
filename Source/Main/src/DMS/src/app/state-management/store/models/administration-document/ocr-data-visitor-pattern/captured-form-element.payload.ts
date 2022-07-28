import { DocumentFormNameEnum } from '@app/app.constants';
import { IElement } from '@app/models/common/ielement.model';
import { IVisitor } from '@app/models/common/ivisitor.model';
import { ExtractedDataOcrState } from '../state/extracted-data-ocr.state.model';

export class CapturedFormElement implements IElement {
    tabFormName: DocumentFormNameEnum;
    ocrData: ExtractedDataOcrState[];

    constructor(tabFormName: DocumentFormNameEnum) {
        this.tabFormName = tabFormName;
    }

    notifyOnAccept: () => void;

    accept(visitor: IVisitor): void {
        visitor.visit(this);
    }
}
