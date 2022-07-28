import { Input, Directive, OnDestroy, OnInit, HostListener, Renderer2, ComponentFactoryResolver, Injector, ComponentRef, ApplicationRef, ChangeDetectorRef } from '@angular/core';
import { Store } from '@ngrx/store';
import { ReplaySubject, Observable, Subject } from 'rxjs';
import {  Configuration } from '../../../app.constants';
import { AppState } from '../../../state-management/store';
import { HotKeySettingActions } from '../../../state-management/store/actions';
// import { AddHotKey } from '../../../state-management/store/actions/app/app.actions';
import { HotKey, Module, HotKeySetting } from '../../../models';
import cloneDeep from 'lodash-es/cloneDeep';
import { HotKeyDialogComponent } from '../../components/hotkey-setting/hotkey-dialog/hotkey-dialog.component';
import { takeUntil } from 'rxjs/operators';

@Directive({
    selector: '[hotKeyProcessing]',
})
export class XnHotKeyProcessingDirective implements OnInit, OnDestroy {

    private destroy$: Subject<boolean> = new Subject<boolean>();

    private popHeight = 22;
    private popWidth = 22;
    private hotKeySettingState: Observable<HotKeySetting>;

    public isHotKeyActive: boolean = false;
    private keyBuffer: Array<any> = [];
    private keyBufferKeep: Array<any> = [];
    private consts: Configuration = new Configuration();
    private componentRef: ComponentRef<HotKeyDialogComponent>;
    private timeoutKeyup: any;
    private hotKeySetting: HotKeySetting = {};
    private notRegisteredColor = 'rgba(60, 60, 60, 0.5)';
    private registeredColor = 'rgba(46,157,50,0.5)';

    @Input() ofModule: Module;

    @HostListener('document:keyup.out-zone', ['$event'])
    onKeyUp(event) {
        const e = <KeyboardEvent>event;
        if (e.keyCode == 34) return; 
        this.removeKeyUpIntoBuffer(e.keyCode, e);
    }

    // Support to be able to press double key press for Hotkey feature
    @HostListener('document:keydown.out-zone', ['$event'])
    onKeyDown(event) {
        const e = <KeyboardEvent>event;
        this.pushKeyDownIntoBuffer(e.keyCode, e);
        // Uti.disabledEventPropagation(event);
        this.setHotKeyActiveValue(e);
    }

    private _unsubscribedNotifer$: ReplaySubject<boolean> = new ReplaySubject<boolean>();   

    constructor(
        private renderer: Renderer2,
        private store: Store<AppState>,
        private hotKeySettingActions: HotKeySettingActions,
        private componentFactoryResolver: ComponentFactoryResolver,
        private injector: Injector,
        private appRef: ApplicationRef,
        public changeDetectorRef: ChangeDetectorRef,
    ) {
        this.hotKeySettingState = this.store.select(state => state.hotKeySettingtState.hotKeySetting);
    }

    public ngOnInit() {
        this.store.dispatch(this.hotKeySettingActions.loadHotKeySetting(this.ofModule));
        this.subsscribe();
    }

    public ngAfterViewInit() {
        window.addEventListener('blur', () => {
            this.keyBuffer = [];
        });
    }

    private subsscribe() {
        this.hotKeySettingState.pipe(takeUntil(this.destroy$)).subscribe(hotKeySetting => {
            this.hotKeySetting = hotKeySetting;
        });
    }    

    public ngOnDestroy() {
        this.destroy$.next(true);
        this.destroy$.unsubscribe();
        this.unsubscribeFromNotifier();
    }
    

    protected getUnsubscriberNotifier(): Observable<any> {
        return this._unsubscribedNotifer$.asObservable();
    }

    protected unsubscribeFromNotifier() {
        this._unsubscribedNotifer$.next(true);
        this._unsubscribedNotifer$.complete();
    }

    private removeKeyUpIntoBuffer(keyCode: any, event: KeyboardEvent) {
        if (this.keyBuffer && this.keyBuffer.indexOf(keyCode) > -1) {
            this.keyBuffer = this.keyBuffer.filter(x => x !== keyCode);
        }
        if (this.timeoutKeyup) {
            clearTimeout(this.timeoutKeyup);
            this.timeoutKeyup = null;
        }
        this.timeoutKeyup = setImmediate(() => {
            if (this.keyBuffer.length === 0) return;
            this.buildKeyName(event);
        }, 300);
    }

    private pushKeyDownIntoBuffer(keyCode: any, event: KeyboardEvent) {
        if (!this.keyBuffer.length) {
            this.keyBufferKeep.length = 0;
        }
        if (this.keyBuffer && this.keyBuffer.indexOf(keyCode) === -1 &&
            ((keyCode > 64 && keyCode < 91) ||  // from A -> Z
                (keyCode > 15 && keyCode < 19) ||  // Ctr + Shift + Alt
                (keyCode > 47 && keyCode < 58))) { // 0 -> 9
            this.keyBuffer.push(keyCode);
        }
        this.keyBufferKeep = cloneDeep(this.keyBuffer);
        this.buildKeyName(event);
    }

    private buildKeyName(event: KeyboardEvent) {
        if (this.keyBufferKeep.length === 0) {
            //this.store.dispatch(new AddHotKey(new HotKey({
            //    altKey: this.isHotKeyActive,
            //    keyCombineCode: null
            //})));
            return;
        }

        this.keyBufferKeep = this.keyBufferKeep.sort((a, b) => a - b);
        let displayText = '';
        for (let i = 0; i < this.keyBufferKeep.length; i++) {
            displayText += this.consts.keyCode[this.keyBufferKeep[i]];
            if (i < this.keyBufferKeep.length - 1) {
                displayText += '+';
            }
        }

        //this.store.dispatch(new AddHotKey(new HotKey({
        //    altKey: this.isHotKeyActive,
        //    keyCombineCode: displayText
        //})));

        this.focusControl(displayText, event);
    }

    private findAndClickOnTagName(tag: string, controlTarget: JQuery<HTMLElement>) : boolean {
        if (controlTarget[0].tagName != tag) {
            const inputTarget = controlTarget.find(tag.toLowerCase());
            if (inputTarget?.length) {
                inputTarget.focus();
                inputTarget.click();
                return true;
            }
        }
        return false;
    }

    private focusControl(displayText: string, event: KeyboardEvent) {
        // Open dialog setting, then do nothing
        if (this.componentRef || displayText.indexOf('Shift')>=0) {
            return;
        }
        Object.keys(this.hotKeySetting).forEach(key => {
            let value: string = this.hotKeySetting[key];
            if (value.toLowerCase() == displayText.toLowerCase()) {
                //console.log('click');
                const controlTarget = $("[control-key='" + key + "']");
                if (controlTarget?.length) {
                    console.log('click');
                    controlTarget.focus();
                    controlTarget.click();
                    let status = this.findAndClickOnTagName('INPUT', controlTarget);
                    if (!status) {
                        status = this.findAndClickOnTagName('BUTTON', controlTarget);
                    }
                    if (!status) {
                        status = this.findAndClickOnTagName('MAT-SELECT', controlTarget);
                    }

                    this.keyBuffer = [];
                    this.keyBufferKeep = [];

                    //this.store.dispatch(new AddHotKey(new HotKey({
                    //    altKey: false,
                    //    keyCombineCode: null
                    //})));
                    event.preventDefault();
                    this.changeDetectorRef.detectChanges();
                }
                this.isHotKeyActive = false;
                this.toggleHotkey(this.isHotKeyActive);
            }
        });
    }

    private setHotKeyActiveValue(e: any) {
        if (e.keyCode !== 18 || this.keyBufferKeep.length > 1) { // Alt key: 18
            return;
        }
        this.isHotKeyActive = !this.isHotKeyActive;

        //this.store.dispatch(new AddHotKey(new HotKey({
        //    altKey: this.isHotKeyActive,
        //    keyCombineCode: null
        //})));
       
        // $('input').each(function () { $(this).blur(); });
        e.preventDefault();

        this.toggleHotkey(this.isHotKeyActive);
    }

    private toggleHotkey(status) {
        if (status) {
            // const hotkeyTargetElements: NodeList = document.querySelectorAll('.xn-hotkey');
            const hotkeyTargetElements = $('[control-key]');
            if (hotkeyTargetElements && hotkeyTargetElements.length) {
                for (let i = 0; i < hotkeyTargetElements.length; i++) {
                    if ($(hotkeyTargetElements[i]).is(":visible")) {
                        this.appendComponentToRelativeElement(hotkeyTargetElements[i]);
                    }
                }
            }
            (<any>$('[data-toggle="tooltip"]')).tooltip({ trigger: 'manual' }).tooltip('show');
        }
        else {
            (<any>$('[data-toggle="tooltip"]')).tooltip('hide');
            const hotkeyPopupElements: NodeList = document.querySelectorAll('.hotkey-popup');
            if (hotkeyPopupElements && hotkeyPopupElements.length) {
                for (let i = 0; i < hotkeyPopupElements.length; i++) {
                    $(hotkeyPopupElements[i]).remove();
                }
            }
        }
    }

    //appendComponentToBody(evt : HTMLElement) {
    //    const controlKey = this.getControlKey(evt);
    //    const customClass = this.getControlClassKey(evt);
    //    let existsHotKey = this.hotKeySetting[controlKey] ? true : false;        
    //    const currentDomElm = this.renderer.createElement('div');
    //    const domElem: HTMLElement= currentDomElm;
    //    const domRect = evt.getBoundingClientRect();
    //    domElem.style.position = 'absolute';
    //    domElem.style.top = domRect.top - 4 + 'px';
    //    domElem.style.left = domRect.left + 'px';
    //    domElem.style.zIndex = '99999';
    //    domElem.style.display = 'flex';
    //    domElem.style.alignItems = 'center';
    //    domElem.style.height = this.popHeight + 'px';
    //    domElem.style.width = this.popWidth + 'px';
    //    domElem.style.borderRadius = '15px';
    //    domElem.style.cursor = 'pointer';
    //    domElem.style.backgroundColor = existsHotKey ? 'rgba(46,157,50,0.5)' : 'rgba(60, 60, 60, 0.5)';
    //    domElem.classList.add("hotkey-popup");
    //    domElem.classList.add(controlKey);
    //    domElem.classList.add(customClass);
    //    document.body.appendChild(domElem);
    //    domElem.addEventListener('dblclick', this.onClick.bind(this, controlKey, domElem));
    //}

    appendComponentToRelativeElement(evt: HTMLElement) {
        const controlKey = this.getAttributeKey(evt, 'control-key');
        const customClass = this.getAttributeKey(evt, 'hotkey-class');
        const customWidth = this.getAttributeKey(evt, 'hotkey-width');
        const customHeight = this.getAttributeKey(evt, 'hotkey-height');
        const width = customWidth || this.popWidth;
        const height = customHeight || this.popHeight;
        let existsHotKey = this.hotKeySetting[controlKey] ? true : false;
        const currentDomElm = this.renderer.createElement('div');
        const domElem: HTMLElement = currentDomElm;
        domElem.style.position = 'absolute';
        domElem.style.top = '0px';
        domElem.style.left = '0px';
        domElem.style.zIndex = '99999';
        domElem.style.display = 'flex';
        domElem.style.alignItems = 'center';
        domElem.style.height = height + 'px';
        domElem.style.width = width + 'px';
        domElem.style.borderRadius = '15px';
        domElem.style.cursor = 'pointer';
        domElem.style.backgroundColor = existsHotKey ? this.registeredColor : this.notRegisteredColor;
        domElem.classList.add("hotkey-popup");
        domElem.classList.add(controlKey);
        domElem.setAttribute('data-placement', 'bottom');
        domElem.setAttribute('data-toggle', 'tooltip');
        domElem.setAttribute('title', existsHotKey ? this.hotKeySetting[controlKey] : '');
        if (customClass) {
            domElem.classList.add(customClass);
        }
        evt.parentElement.appendChild(domElem);
        evt.parentElement.style.position = 'relative';
        // document.body.appendChild(domElem);
        domElem.addEventListener('dblclick', this.onClick.bind(this, controlKey, domElem));
    }

    private getAttributeKey(element: HTMLElement, attributeKey: string) {
        let val: string = element.getAttribute(attributeKey);
        return val;
    }

    public onClick(controlKey, domElem: HTMLElement, event) {
        event.preventDefault();
        event.stopPropagation();
        // 1. Create a component reference from the component 
        this.componentRef = this.componentFactoryResolver
            .resolveComponentFactory(HotKeyDialogComponent)
            .create(this.injector);
        const popoverComponent: HotKeyDialogComponent = this.componentRef.instance;
        popoverComponent.controlKey = controlKey;
        popoverComponent.onClose.subscribe(() => {
            console.log('destroy popoverComponent');
            setTimeout(() => {
                this.destroyElement();
            });
        });
        popoverComponent.onSuccessSaved.subscribe((data) => {
            console.log('onSuccessSaved');
            domElem.style.backgroundColor = data ? this.registeredColor : this.notRegisteredColor;
            const titleToShow = data ? data : '';
            domElem.setAttribute('data-original-title', titleToShow);
            if (titleToShow) {
                (<any>$(domElem)).attr('title', titleToShow).tooltip('show');
            } else (<any>$(domElem)).tooltip('hide');
            setTimeout(() => {
                this.destroyElement();
            });
        });
        this.appRef.attachView(this.componentRef.hostView);
    }

    private destroyElement() {
        // $(this.currentDomElm).remove();
        if (this.componentRef) {
            this.componentRef.destroy();
            this.componentRef = null;
        }
    }
}
