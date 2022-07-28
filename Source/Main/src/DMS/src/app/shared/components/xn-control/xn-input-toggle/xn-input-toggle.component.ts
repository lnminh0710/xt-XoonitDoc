import { Component, OnInit, EventEmitter } from '@angular/core';
import { FormControl } from '@angular/forms';

@Component({
    selector: 'xn-input-toggle',
    inputs: ['canEdit', 'type', 'title', 'icon', 'placeholder', 'formControl', 'name', 'showAccept', 'collapsed'],
    outputs: ['onAccept', 'onToggle'],
    templateUrl: './xn-input-toggle.component.html',
    styleUrls: ['./xn-input-toggle.component.scss'],
})
export class XnInputToggleComponent implements OnInit {
    type: string | null = 'text';
    title: string | null = null;
    icon: string | null = null;
    placeholder: string | null = null;
    name: string | null = null;
    canEdit: boolean = true;
    showAccept: boolean = true;
    formControl: FormControl;
    collapsed: boolean = true;

    onAccept = new EventEmitter<any>();
    onToggle = new EventEmitter<any>();

    constructor() {}

    ngOnInit(): void {}

    onClick() {
        this.collapsed = !this.collapsed;
        this.onAccept.emit();
    }

    toggleEdit() {
        this.collapsed = !this.collapsed;
        this.onToggle.emit(this.collapsed);
    }
}
