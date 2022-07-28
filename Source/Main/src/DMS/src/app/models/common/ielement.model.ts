import { IVisitor } from './ivisitor.model';

export interface IElement {
    notifyOnAccept: () => void;
    accept(visitor: IVisitor): void;
}
