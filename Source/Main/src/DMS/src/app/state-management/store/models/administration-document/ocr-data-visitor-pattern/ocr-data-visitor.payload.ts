import { IVisitor } from '@app/models/common/ivisitor.model';
import { IElement } from '@app/models/common/ielement.model';
import { CapturedFormElement } from './captured-form-element.payload';
import { ExtractedDataOcrState } from '../state/extracted-data-ocr.state.model';

export class OcrDataVisitor implements IVisitor {

    constructor(public ocrData: ExtractedDataOcrState[]) {

    }

    visit(element: IElement): void {
        if (!(element instanceof CapturedFormElement)) return;

        element.ocrData = this.ocrData;
    }
}
