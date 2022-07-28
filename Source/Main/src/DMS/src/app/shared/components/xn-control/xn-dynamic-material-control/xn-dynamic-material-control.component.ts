import {
    Component,
    OnInit,
    Input,
    ComponentFactoryResolver,
    ViewContainerRef,
    ViewChild,
    ComponentRef,
    forwardRef,
    Output,
    EventEmitter,
} from '@angular/core';
import { IMaterialControlConfig } from './interfaces/material-control-config.interface';
import { Router } from '@angular/router';
import { BaseComponent } from '@app/pages/private/base';
import { MaterialControlType } from '@widget/components/widget-mydm-form/consts/material-control-type.enum';
import { BaseMaterialControlComponent } from './components/base/base-material-control.component';
import { XnMaterialInputControlComponent } from './components/xn-material-input-control/xn-material-input-control.component';
import { XnMaterialSelectControlComponent } from './components/xn-material-select-control/xn-material-select-control.component';
import { XnMaterialSlideToggleControlComponent } from './components/xn-material-slide-toggle-control/xn-material-slide-toggle-control.component';
import { XnMaterialAutocompleteControlComponent } from './components/xn-material-autocomplete-control/xn-material-autocomplete-control.component';
import { XnMaterialDatepickerControlComponent } from './components/xn-material-datepicker-control/xn-material-datepicker-control.component';
import { FormGroup, NG_VALUE_ACCESSOR, ControlValueAccessor } from '@angular/forms';
import { FocusControlEvent } from './interfaces/focus-control-event.interface';
import { XnMaterialRadiosControlComponent } from './components/xn-material-radios-control/xn-material-radios-control.component';
import { HTMLInputControlComponent } from './components/html-input-control/html-input-control.component';
import { XnMaterialCheckboxControlComponent } from './components/xn-material-checkbox-control/xn-material-checkbox-control.component';
import { takeUntil } from 'rxjs/operators';
import { XnMaterialSelectSearchControlComponent } from './components/xn-material-select-search-control/xn-material-select-search-control.component';

@Component({
    selector: 'xn-dynamic-material-control',
    templateUrl: 'xn-dynamic-material-control.component.html',
    styleUrls: ['xn-dynamic-material-control.component.scss'],
    providers: [
        { provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => DynamicMaterialControlComponent), multi: true },
    ],
})
export class DynamicMaterialControlComponent extends BaseComponent implements ControlValueAccessor, OnInit {
    public componentRef: ComponentRef<BaseMaterialControlComponent>;

    @Input() config: IMaterialControlConfig;
    @Input() formGroup: FormGroup;
    @Input() set disabled(val: boolean) {
        this.setDisabledState(val);
    }

    @Output() controlValueChanged = new EventEmitter<any>();
    @Output() onControlFocus = new EventEmitter<FocusControlEvent>();
    @Output() onControlClick = new EventEmitter<FocusControlEvent>();
    @Output() onControlIconClick = new EventEmitter<FocusControlEvent>();
    @Output() onKeydown = new EventEmitter<KeyboardEvent>();
    @Output() onKeyup = new EventEmitter<KeyboardEvent>();
    @Output() onControlBlur = new EventEmitter<any>();
    @ViewChild('dynamicMaterialControl', { read: ViewContainerRef, static: true })
    dynamicMaterialControlContainer: ViewContainerRef;

    constructor(protected router: Router, private componentFactoryResolver: ComponentFactoryResolver) {
        super(router);
    }

    writeValue(obj: any): void {
        this.componentRef.instance.writeValue(obj);
    }
    registerOnChange(fn: any): void {
        this.componentRef.instance.registerOnChange(fn);
    }
    registerOnTouched(fn: any): void {
        this.componentRef.instance.registerOnTouched(fn);
    }
    setDisabledState?(isDisabled: boolean): void {
        this.componentRef.instance.setDisabledState(isDisabled);
    }

    ngOnInit() {
        this.loadMaterialControl();
    }

    ngOnDestroy() {
        super.onDestroy();
    }

    private loadMaterialControl() {
        let componentFactory;
        switch (this.config.type) {
            case MaterialControlType.INPUT:
                componentFactory = this.componentFactoryResolver.resolveComponentFactory(
                    XnMaterialInputControlComponent,
                );
                break;

            case MaterialControlType.AUTOCOMPLETE:
                componentFactory = this.componentFactoryResolver.resolveComponentFactory(
                    XnMaterialAutocompleteControlComponent,
                );
                break;

            case MaterialControlType.DATEPICKER:
                componentFactory = this.componentFactoryResolver.resolveComponentFactory(
                    XnMaterialDatepickerControlComponent,
                );
                break;

            case MaterialControlType.SELECT:
                componentFactory = this.componentFactoryResolver.resolveComponentFactory(
                    XnMaterialSelectControlComponent,
                );
                break;

            case MaterialControlType.SLIDE_TOGGLE:
                componentFactory = this.componentFactoryResolver.resolveComponentFactory(
                    XnMaterialSlideToggleControlComponent,
                );
                break;

            case MaterialControlType.RADIO_BUTTON:
                componentFactory = this.componentFactoryResolver.resolveComponentFactory(
                    XnMaterialRadiosControlComponent,
                );
                break;
            case MaterialControlType.HTML_INPUT:
                componentFactory = this.componentFactoryResolver.resolveComponentFactory(HTMLInputControlComponent);
                break;
            case MaterialControlType.SELECT_SEARCH:
                componentFactory = this.componentFactoryResolver.resolveComponentFactory(
                    XnMaterialSelectSearchControlComponent,
                );
                break;
            case MaterialControlType.CHECKBOX:
                componentFactory = this.componentFactoryResolver.resolveComponentFactory(
                    XnMaterialCheckboxControlComponent,
                );
                break;
            default:
                return;
        }

        const componentRef = this.dynamicMaterialControlContainer.createComponent<BaseMaterialControlComponent>(
            componentFactory,
        );
        componentRef.instance.config = this.config;
        componentRef.instance.formGroup = this.formGroup;
        if (this.controlValueChanged.observers && this.controlValueChanged.observers.length) {
            componentRef.instance.controlValueChanged
                .pipe(takeUntil(this.getUnsubscriberNotifier()))
                .subscribe((val) => this.controlValueChanged.emit(val));
        }
        if (this.onControlFocus.observers && this.onControlFocus.observers.length) {
            componentRef.instance.onControlFocus
                .pipe(takeUntil(this.getUnsubscriberNotifier()))
                .subscribe((val) => this.onControlFocus.emit(val));
        }
        if (this.onKeydown.observers && this.onKeydown.observers.length) {
            componentRef.instance.onKeydown
                .pipe(takeUntil(this.getUnsubscriberNotifier()))
                .subscribe((val) => this.onKeydown.emit(val));
        }
        if (this.onKeyup.observers && this.onKeyup.observers.length) {
            componentRef.instance.onKeyup
                .pipe(takeUntil(this.getUnsubscriberNotifier()))
                .subscribe((val) => this.onKeyup.emit(val));
        }
        if (this.onControlBlur.observers && this.onControlBlur.observers.length) {
            componentRef.instance.onControlBlur
                .pipe(takeUntil(this.getUnsubscriberNotifier()))
                .subscribe((val) => this.onControlBlur.emit(val));
        }
        if (this.onControlClick.observers && this.onControlClick.observers.length) {
            componentRef.instance.onControlClick
                .pipe(takeUntil(this.getUnsubscriberNotifier()))
                .subscribe((val) => this.onControlClick.emit(val));
        }
        if (this.onControlIconClick.observers && this.onControlIconClick.observers.length) {
            componentRef.instance.onControlIconClick
                .pipe(takeUntil(this.getUnsubscriberNotifier()))
                .subscribe((val) => this.onControlIconClick.emit(val));
        }
        this.componentRef = componentRef;
    }
}
