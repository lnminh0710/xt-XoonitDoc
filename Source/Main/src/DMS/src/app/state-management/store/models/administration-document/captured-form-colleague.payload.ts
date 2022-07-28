import { CapturedFormMediator as CapturedFormMediator } from './captured-form-mediator.payload';
import { ExtractedDataOcrState } from './state/extracted-data-ocr.state.model';

export abstract class CapturedFormColleague {
    protected _mediator: CapturedFormMediator;
    constructor() {

    }

    set mediator(data: CapturedFormMediator) {
        this._mediator = data;
    }

    abstract notify: (toggle: boolean) => void;
}

export interface ToggleSynchronousIcon {
    sendToggle(toggle: boolean): void;
}

export class ContactFormColleague extends CapturedFormColleague implements ToggleSynchronousIcon {
    public extractDataOcr: (data: ExtractedDataOcrState[]) => void;
    public notify: (toggle: boolean) => void;

    constructor() {
        super();
    }

    sendToggle(toggle: boolean): void {
        if (!this._mediator) return;

        this._mediator.send(toggle, this);
    }
}

export class TabWidgetContactColleague extends CapturedFormColleague implements ToggleSynchronousIcon {
    public extractDataOcr: (data: ExtractedDataOcrState[]) => void;
    public notify: (toggle: boolean) => void;

    constructor() {
        super();
    }

    sendToggle(toggle: boolean): void {
        if (!this._mediator) return;

        this._mediator.send(toggle, this);
    }
}
