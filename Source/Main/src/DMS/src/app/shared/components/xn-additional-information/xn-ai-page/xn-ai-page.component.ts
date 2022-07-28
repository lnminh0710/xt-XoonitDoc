import { Component, OnInit, Input } from '@angular/core';
import {
    AdditionalInfromationPageModel,
} from '@app/models';

@Component({
    selector: 'app-xn-ai-page',
    templateUrl: './xn-ai-page.component.html',
    styleUrls: ['./xn-ai-page.component.scss']
})
export class XnAdditionalInformationPageComponent implements OnInit {

    public page: AdditionalInfromationPageModel;

    @Input()
    set data(data: AdditionalInfromationPageModel) {
        this.page = data;
    }
    @Input() tabID: string;

    constructor() {
    }

    ngOnInit() {
    }
}
