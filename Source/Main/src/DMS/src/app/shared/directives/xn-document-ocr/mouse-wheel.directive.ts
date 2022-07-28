import { Directive, Output, HostListener, EventEmitter } from '@angular/core';

@Directive({ selector: '[mouseWheel]' })
export class MouseWheelDirective {
  @Output() mouseWheel: EventEmitter<any> = new EventEmitter();

  @HostListener('mousewheel', ['$event']) onMouseWheelChrome(event: any) {
    this.mouseWheelFunc(event);
  }

  @HostListener('DOMMouseScroll', ['$event']) onMouseWheelFirefox(event: any) {
    this.mouseWheelFunc(event);
  }

  @HostListener('onmousewheel', ['$event']) onMouseWheelIE(event: any) {
    this.mouseWheelFunc(event);
  }

  mouseWheelFunc(event: any) {
    var event = window.event || event; // old IE support

    this.mouseWheel.emit(event);
  }
}
