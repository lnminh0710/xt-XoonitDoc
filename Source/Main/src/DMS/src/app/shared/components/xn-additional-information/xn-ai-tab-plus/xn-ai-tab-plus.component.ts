import { Component, OnInit, Input, Output, EventEmitter, ElementRef, HostListener } from '@angular/core';
import { BsDropdownConfig } from 'ngx-bootstrap/dropdown';

export function getBsDropdownConfig(): BsDropdownConfig {
    return Object.assign(new BsDropdownConfig(), { autoClose: false });
}
@Component({
    selector: 'app-xn-ai-tab-plus',
    styleUrls: ['./xn-ai-tab-plus.component.scss'],
    templateUrl: './xn-ai-tab-plus.component.html',
    providers: [{ provide: BsDropdownConfig, useFactory: getBsDropdownConfig }],
    host: {
        '(document:click)': 'onDocumentClick($event)'
    }
})
export class XnAdditionalInformationTabPlusComponent implements OnInit {

    public status: any = { isOpen: false };
    public perfectScrollbarConfig: any;

    @Input() tabs: any[] = [];
    @Input() buttonIcon: string = 'plus-circle';
    @Input() toolTip: string = 'Add more Additional Information tab';
    @Input() customCss: string = 'add-more-tab';
    @Output() dropdownItemClicked: EventEmitter<any> = new EventEmitter();

    @HostListener('document:click.out-zone', ['$event']) onDocumentClick(event) {
        if (!this._eref.nativeElement.contains(event.target)) { // or some similar check
            this.toggled(false);
        }
    }

    constructor(private _eref: ElementRef) {
    }

    ngOnInit() {
        this.perfectScrollbarConfig = {
            suppressScrollX: true,
            suppressScrollY: false
        };
    }

    public toggled(open: boolean) {
        this.status.isOpen = open;
        if (!open) { return; }
        this.setMenuPosition();
    }

    private setMenuPosition() {
        const menuParentIcon = $('#tab-header-menu', this._eref.nativeElement);
        if (!menuParentIcon || !menuParentIcon.length) { return; }
        const aiDropDownMenu = $('#dropdown-menu', this._eref.nativeElement);
        if (!aiDropDownMenu || !aiDropDownMenu.length) { return; }
        const documentBody = $(document.body);
        const rightSpace = documentBody.width() - menuParentIcon.offset().left;
        let leftSpace = 0;
        if (rightSpace <= aiDropDownMenu.width()) {
            leftSpace = (rightSpace - (aiDropDownMenu.width() + 5));
        }
        aiDropDownMenu.css('left', leftSpace);
    }

    public menuItemClickHanlder(tab: any) {
        this.dropdownItemClicked.emit(tab);
        this.status.isOpen = false;
    }
}
