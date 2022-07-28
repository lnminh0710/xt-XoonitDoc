import {
  Component,
  Input,
  Output,
  ElementRef,
  EventEmitter,
  OnInit,
  OnDestroy,
  ViewChild,
  AfterViewInit,
  HostListener,
} from '@angular/core';
import { Uti } from '@app/utilities';
import { Module } from '@app/models';

@Component({
  selector: 'advance-search-icon',
  templateUrl: './advance-search-icon.component.html',
  styleUrls: ['./advance-search-icon.component.scss'],
})
export class AdvanceSearchIconComponent implements OnInit, OnDestroy, AfterViewInit {
  @Input() module: Module;
  @Input() activeSearch: boolean;

  private popup: any;

  @HostListener('window:beforeunload', ['$event']) unloadHandler(event: Event) {
    if (this.popup) {
      this.popup.close();
    }
  }

  constructor() {}

  ngAfterViewInit(): void {}

  ngOnDestroy(): void {}

  ngOnInit(): void {}

  public openPopup() {
    const moduleId = this.module ? this.module.idSettingsGUI : '';
    if (this.popup && !this.popup.closed && this.popup.location.search === '?moduleId=' + moduleId) {
      window.open('', 'advanceSearchPopup');
      return;
    }
    this.popup = null;
    this.popup = Uti.openPopupCenter('/advancesearch?moduleId=' + moduleId, 'advanceSearchPopup', 1280, 700);
  }
}
