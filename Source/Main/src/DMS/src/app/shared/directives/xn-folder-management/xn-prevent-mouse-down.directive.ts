import { Directive, HostListener } from '@angular/core';

@Directive({
  selector: '[preventMousedown]',
})
export class PreventMouseDownDirective {
  @HostListener('mousedown', ['$event'])
  public onClick(event: any): void {
    event.preventDefault();
  }
}
