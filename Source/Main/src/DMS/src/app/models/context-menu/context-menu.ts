import { TemplateRef } from '@angular/core';

export class ContextMenuAction {
    name: string;
    icon: string;
    click: Function;
    enabled: boolean;
    visible: boolean;
    template: TemplateRef<any>;
    contextTemplate: any;
    divider: boolean;

    public constructor(init?: Partial<ContextMenuAction>) {
        Object.assign(this, init);
    }
}
