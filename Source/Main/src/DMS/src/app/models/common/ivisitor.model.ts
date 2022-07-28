import { IElement } from './ielement.model';

export interface IVisitor {
    visit(element: IElement): void;
}
