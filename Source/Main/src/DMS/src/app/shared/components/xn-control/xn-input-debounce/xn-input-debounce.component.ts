import {
  Component,
  Input,
  Output,
  ElementRef,
  EventEmitter,
  OnInit,
  OnDestroy,
  ViewChild,
  Renderer2,
  forwardRef,
  AfterViewInit,
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR, NG_VALIDATORS } from '@angular/forms';
import { Uti } from '@app/utilities';

@Component({
  selector: 'app-xn-input-debounce',
  templateUrl: './xn-input-debounce.component.html',
  styleUrls: ['./xn-input-debounce.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => InputDebounceComponent),
      multi: true,
    },
  ],
})
export class InputDebounceComponent implements ControlValueAccessor, OnInit, OnDestroy, AfterViewInit {
  public onChange: any = (_: any) => {};

  private delayTime = 500;
  private timer: any = null;
  public valueString: string = '';
  public isInsideForm: boolean = false;
  public isWithStar: boolean = false;
  private onPasting = false;
  public isHoverBox = false;
  public isFocusBox = false;

  @Input() id: string = Uti.guid();
  @Input() placeholder: string;
  @Input() set delayTimer(data: any) {
    this.delayTime = data;
  }
  @Input() value: string = '';
  @Input() cssClass: string;
  private _isLoading = false;
  @Input() set isLoading(loading: boolean) {
    if (!loading && !this.valueString) {
        this.focusInput();
    }
    this._isLoading = loading;
  };
  get isLoading(): boolean {
    return this._isLoading;
  }
  @Input() hasIndicator = true;
  @Input() hasSearchButton = true;
  @Input() isSearchBoxControl = false;
  @Input() hasValidation = false;
  @Input() isDisabled = false;
  @Input() hasClearText = false;
  // @Input() hasSearchButton = true;

  @Output() onValueChanged: EventEmitter<string> = new EventEmitter();
  @Output() onSearchButtonClicked: EventEmitter<string> = new EventEmitter();
  @Output() keyup: EventEmitter<any> = new EventEmitter();

  @ViewChild('inputControl') inputControl;

  constructor(private renderer: Renderer2, private elementRef: ElementRef) {}

  writeValue(value: any): void {
    const input = this.inputControl.nativeElement;
    this.value = this.value || value;
    this.renderer.setProperty(input, 'value', value);
  }
  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {}

  setDisabledState?(isDisabled: boolean): void {}

  ngOnInit(): void {}

  ngOnDestroy(): void {}

  ngAfterViewInit(): void {
    this.isInsideForm = this.elementRef.nativeElement['attributes']['formcontrolname'] ? true : false;
    this.registerPasteEvent();
  }

  public onKeyup($event) {
    if ($event.keyCode == 13 && !this.hasSearchButton) {
      this.searchClicked();
    }

    //press enter || combo ctrl key || paste event
    if (
      $event.keyCode == 13 ||
      $event.keyCode == 16 ||
      $event.keyCode == 17 ||
      $event.keyCode == 18 ||
      $event.ctrlKey ||
      this.onPasting
    )
      return;

    clearTimeout(this.timer);
    this.timer = null;
    this.timer = setTimeout(() => {
      this.valueString = $event.target.value.trim();
      if (this.valueString || this.hasValidation) {
        this.onChange(this.valueString);
        this.onValueChanged.emit(this.valueString);
      } else {
        this.isLoading = false;
      }
    }, this.delayTime);

    this.keyup.emit($event);
  }

  private registerPasteEvent() {
    var that = this;
    $('#' + this.id, this.elementRef.nativeElement).bind('paste', function(e) {
      let ctrl = this;
      that.onPasting = true;
      setTimeout(function() {
        that.onPasting = false;
        that.valueString = (<any>ctrl).value;
        if (that.valueString != that.value) {
          that.onChange(that.valueString);
          that.onValueChanged.emit(that.valueString);
        }
      }, 100);
    });
  }

  public clearText(event: MouseEvent) {
    event.stopImmediatePropagation();
    this.valueString = '';
    this.onChange(this.valueString);
    this.onValueChanged.emit(this.valueString);
  }

  public searchClicked() {
    this.valueString = this.value;
    console.log(this.valueString);
    this.onSearchButtonClicked.emit(this.valueString);
  }

  public focusInput() {
    if (this.inputControl && this.inputControl.nativeElement) this.inputControl.nativeElement.focus();
  }
}
