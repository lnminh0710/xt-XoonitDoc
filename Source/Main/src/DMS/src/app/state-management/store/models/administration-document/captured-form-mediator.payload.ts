import { CapturedFormColleague, ContactFormColleague } from './captured-form-colleague.payload';

export class CapturedFormMediator {
    private _colleagues: CapturedFormColleague[];

    constructor() {
        this.clearColleagues();
    }

    public clearColleagues() {
        this._colleagues = [];
    }

    public clearContactFormColleagues() {
        this._colleagues = this._colleagues.filter(
            (colleague) => colleague.constructor.name !== ContactFormColleague.name,
        );
    }

    public register(colleague: CapturedFormColleague) {
        if (!colleague) return;

        colleague.mediator = this;
        this._colleagues.push(colleague);
    }

    public send(toggle: boolean, colleague: CapturedFormColleague): void {
        for (let i = 0; i < this._colleagues.length; i++) {
            if (this._colleagues[i] !== colleague) {
                this._colleagues[i].notify(toggle);
            }
        }
    }
}
