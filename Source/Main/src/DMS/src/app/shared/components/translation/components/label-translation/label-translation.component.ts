import { Component, OnInit, Input, OnDestroy, AfterViewInit, ViewEncapsulation } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { ResourceTranslationService } from '@app/services';

@Component({
    selector: 'label-translation',
    templateUrl: './label-translation.component.html',
    styleUrls: ['./label-translation.component.scss'],
    host: {
        '[attr.keyword]': 'keyword'
    },
    encapsulation: ViewEncapsulation.None
})
export class LabelTranslationComponent implements OnInit, OnDestroy, AfterViewInit {

    @Input() keyword: string;
    @Input() allowUpdateLanguage = true;
    @Input() params: any = {};
    @Input() isHtml: boolean;

    constructor(translate: TranslateService, private resourceTranslationService: ResourceTranslationService) {
        translate.setDefaultLang('en');
    }

    public ngOnInit() {

    }

    public ngOnDestroy() {

    }

    ngAfterViewInit() {
        if (this.resourceTranslationService.translationStatus && this.allowUpdateLanguage) {
            this.resourceTranslationService.rebindEvent();
        }
    }
}
