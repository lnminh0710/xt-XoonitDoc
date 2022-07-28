import { Input, Directive, OnDestroy, OnInit, ComponentRef, ComponentFactoryResolver, ElementRef, Renderer2, Injector, ApplicationRef, HostListener } from '@angular/core';
import { Store } from "@ngrx/store";
import { AppState } from '@app/state-management/store';
import { Subscription, Subject } from 'rxjs';
import { Uti } from '@app/utilities';
import { DialogResourceTranslationComponent } from '../components/dialog-resource-translation/dialog-resource-translation.component';
import { Module } from '@app/models';
import { ResourceTranslationService } from '@app/services';
import { defaultLanguage } from '@app/app.resource';
import { TranslateService } from '@ngx-translate/core';
import { debounceTime } from 'rxjs/operators';


@Directive({
    selector: '[resourceTranslation]'
})

export class ResourceTranslationDirective implements OnDestroy, OnInit {

    private translationStatus: boolean = true;
    private popHeight = 25;
    private popWidth = 25;
    private componentRef: ComponentRef<DialogResourceTranslationComponent>;
    private currentDomElm: any;
    private enableTranslationSubscription: Subscription;
    private rebindEventSubscription: Subscription;
    private closeEventSubscription: Subscription;
    private successSavedEventSubscription: Subscription;
    private contextMenuSubscription: Subscription;
    private subject: Subject<any> = new Subject();
    private subscription: Subscription;

    @Input() module: Module;

    constructor(private elementRef: ElementRef,
        private renderer: Renderer2,
        private componentFactoryResolver: ComponentFactoryResolver,
        private injector: Injector,
        private appRef: ApplicationRef,
        private store: Store<AppState>,
        private resourceTranslationService: ResourceTranslationService,
        private translate: TranslateService) {
    }

    public ngOnInit() {
        this.subscribeTranslationStatus();
        this.gridEventHandler();
        this.subscription = this.subject
            .pipe(
                debounceTime(150),
            ).subscribe(event => {
            if (this.translationStatus) {
                // console.log('DOMNodeInserted');
                $(this.currentDomElm).remove();
                this.unbindEvent();
                this.registerHoverEvent();
                this.formatLabelStyle(this.translationStatus);
            } else {
                this.unbindEvent();
                this.destroyElement();
                this.formatLabelStyle(false);
                this.renderer.removeClass(this.elementRef.nativeElement, 'resource-translation');
            }
        });
    }

    public ngOnDestroy() {
        Uti.unsubscribe(this);
        this.unbindEvent();
        this.destroyElement();
    }

    private gridEventHandler() {
        const that = this;
        $(document).on('DOMNodeInserted', '.ag-theme-balham, wj-popup', function (e) {
            // console.log('DOMNodeInserted');
            that.subject.next(true);
        });
    }

    private subscribeTranslationStatus() {
        this.enableTranslationSubscription = this.resourceTranslationService.translationStatus$.subscribe(status => {
            //status = true;
            this.translationStatus = status;
            this.formatLabelStyle(status);
            if (status) {
                this.registerHoverEvent();
                this.renderer.addClass(this.elementRef.nativeElement, 'resource-translation');
            } else {
                this.unbindEvent();
                this.destroyElement();
                this.renderer.removeClass(this.elementRef.nativeElement, 'resource-translation');
            }
        });
        this.rebindEventSubscription = this.resourceTranslationService.bindEventMessage$.pipe(
            debounceTime(250)
        ).subscribe(status => {
            //status = true;
            if (status) {
                this.unbindEvent();
                this.registerHoverEvent();
                this.formatLabelStyle(status);
            }
        });
    }

    private registerHoverEvent() {
        const that = this;
        $(".mat-form-field-label-wrapper").css("pointer-events", "all");
        $(".mat-form-field-label").css("pointer-events", "all");
        $(".disabled").css("pointer-events", "all");
        $('label-translation').hover(function (evt) {
            // console.log('hover');
            $(that.currentDomElm).remove();
            that.appendComponentToBody(evt, false);
        });
        // $('.ag-menu-option-text,.ag-overlay-no-rows-center').hover(function (evt) {
        //    // console.log('hover');
        //    $(that.currentDomElm).remove();
        //    that.appendComponentToBody(evt, true);
        // });
    }

    private unbindEvent() {
        $(".mat-form-field-label-wrapper").css("pointer-events", "none");
        $(".mat-form-field-label").css("pointer-events", "none");
        //$(".disabled").css("pointer-events", "none");
        $('label-translation').unbind('mouseenter mouseleave');
        // $('.ag-menu-option-text,.ag-overlay-no-rows-center').unbind('mouseenter mouseleave');
    }

    private destroyElement() {
        $(this.currentDomElm).remove();
        if (this.componentRef) {
            this.componentRef.destroy();
        }
    }

    @HostListener('document:click', ['$event'])
    clickout(event) {
        $(this.currentDomElm).remove();
    }

    @HostListener('document:contextmenu', ['$event'])
    rightClick(event) {
        $(this.currentDomElm).remove();
    }

    private formatLabelStyle(status) {
        this.formatStyle('label-translation', status);
        // this.formatStyle('.ag-menu-option-text,.ag-overlay-no-rows-center', status);
    }
    // ag-menu-option-text

    private formatStyle(selector: string, status) {
        const labelTranslationElements: NodeList = document.querySelectorAll(selector);
        if (labelTranslationElements && labelTranslationElements.length) {
            for (let i = 0; i < labelTranslationElements.length; i++) {
                if (status) {
                    this.renderer.addClass(labelTranslationElements[i], 'active-translation');
                } else {
                    this.renderer.removeClass(labelTranslationElements[i], 'active-translation');
                }
            }
        }
    }

    appendComponentToBody(evt, isMenu : boolean) {
        const languageIcon = '<i class="fa fa-language" style="font-size: 17px; color: #4775c7; cursor: pointer"></i>';
        this.currentDomElm = this.renderer.createElement('div');
        const domElem = this.currentDomElm;
        const domRect = evt.target.getBoundingClientRect();
        domElem.style.position = 'absolute';
        // domElem.style.left = domRect.left + domRect.width + 10 + 'px';
        domElem.style.top = isMenu ? domRect.top + 'px' : domRect.top - this.popHeight - 2 + 'px'; // - this.popHeight - 2 + 'px';
        domElem.style.left = evt.clientX + 'px';
        domElem.style.zIndex = '99999';
        domElem.style.display = 'flex';
        domElem.style.alignItems = 'center';
        domElem.style.height = this.popHeight + 'px';
        domElem.style.width = this.popWidth + 'px';
        domElem.classList.add('translate-popup');
        domElem.innerHTML = languageIcon;
        document.body.appendChild(domElem);
        const keyword = this.getKeyword(evt.target);
        domElem.querySelector('.fa-language').addEventListener('click', this.onClick.bind(this, keyword));
    }

    private getKeyword(element: HTMLElement) {
        let keyword: string = element.getAttribute('keyword');
        if (!keyword) {
            // keyword = element.innerText;
            const keyTranslationElement = element.querySelector('.key-translation');
            if (keyTranslationElement) {
                keyword = keyTranslationElement.getAttribute('keyword');
            }
        }
        return keyword;
    }

    public onClick(keyword, event) {
        $(this.currentDomElm).remove();
        // 1. Create a component reference from the component 
        this.componentRef = this.componentFactoryResolver
            .resolveComponentFactory(DialogResourceTranslationComponent)
            .create(this.injector);
        const popoverComponent: DialogResourceTranslationComponent = this.componentRef.instance;
        popoverComponent.showDialog = true;
        popoverComponent.keyword = keyword;
        popoverComponent.defaultValue = (defaultLanguage && defaultLanguage[keyword]) ? defaultLanguage[keyword] : keyword;
        this.closeEventSubscription = popoverComponent.onClose.subscribe(() => {
            console.log('destroy popoverComponent');
            setTimeout(() => {
                this.destroyElement();
            });
        });
        this.successSavedEventSubscription = popoverComponent.onSuccessSaved.subscribe(() => {
            console.log('onSuccessSaved');
            setTimeout(() => {
                this.destroyElement();
                const lang = this.translate.currentLang || this.translate.defaultLang;
                this.translate.resetLang(lang);
                const newLang = lang == 'en' ? 'en_' : 'en';
                this.translate.use(newLang).subscribe((data) => {
                    this.resourceTranslationService.saveSuccess();
                });
            });
        });
        this.appRef.attachView(this.componentRef.hostView);
    }
}

