import {
  Component,
  OnInit,
  Input,
  Output,
  EventEmitter,
  HostListener,
  ElementRef,
  OnDestroy,
  ViewChild,
  Renderer2,
} from '@angular/core';

import { BaseWidget } from '@app/pages/private/base';
import { ItemModel } from '../../models';

import includes from 'lodash-es/includes';
import { FileManagerActions } from '@app/state-management/store/actions';

const KEY_CODE_RENAME = 113;
const KEY_CODE_ENTER = 13;
const KEY_CODE_TAB = 9;
const KEY_CODE_ESCAPE = 27;

@Component({
  selector: 'file-item',
  styleUrls: ['./file-item.component.scss'],
  templateUrl: './file-item.component.html',
})
export class FileItemComponent extends BaseWidget implements OnInit, OnDestroy {
  @ViewChild('inlineEditValue') inlineEditValue;
  //Input
  @Input()
  public item: ItemModel;

  //Output
  @Output()
  public openItem: EventEmitter<any> = new EventEmitter();

  @Output()
  public updateItemValue: EventEmitter<any> = new EventEmitter();

  @Output() onSelect: EventEmitter<any> = new EventEmitter();

  //Variable
  public isEditing: boolean;
  public isSelected: boolean;

  public err = '';

  constructor(private element: ElementRef, private _renderer: Renderer2, private fileManagerAction: FileManagerActions) {
    super();
  }

  ngOnInit() {
    window.addEventListener('keydown', this.onKeydown.bind(this));
  }

  ngOnDestroy() {
    window.removeEventListener('keydown', this.onKeydown.bind(this));
  }

  @HostListener('document:click', ['$event'])
  clickout(event) {
    if (includes(event.target.className, 'file-manager__item') && event.ctrlKey) return;
    if (
      !this.element.nativeElement.contains(event.target) &&
      !includes(event.target.className, 'folder-toolbar') &&
      this.isSelected
    ) {
      this.focusOut();
    }
  }

  public dblClickItem() {
    this.openItem.emit(this.item);
  }

  public selectItem(event: any) {
    this.isSelected = true;
    setTimeout(() => {
      this.onSelect.emit({ item: this.item, ctrlKey: event.ctrlKey });
    }, 100);
  }

  public renameItem(value?: string) {
    this.isSelected = true;
    this.isEditing = true;
    setTimeout(_ => {
      if (this.inlineEditValue) {
        this._renderer.selectRootElement(this.inlineEditValue.nativeElement).focus();
        if (value) {
          this.inlineEditValue.nativeElement.value = value;
        }
      }
    });
  }

  private handleError(err: string) {
    if (err) {
      this.err = err;
      this.renameItem(this.item.value);
      setTimeout(() => {
        this.err = '';
      }, 8000);
      return;
    }
    this.isEditing = false;
  }

  private focusOut() {
    this.onSelect.emit(null);
    this.isSelected = false;

    this.err = '';
    if (this.isEditing) {
      if (!this.inlineEditValue) return;
      const value = this.inlineEditValue.nativeElement.value;
      if (value === this.item.value) {
        this.isEditing = false;
        return;
      }
      this.updateItemValue.emit({
        item: this.item,
        value,
        callback: this.handleError.bind(this),
      });
    }
  }

  private onKeydown(e: any) {
    const keycode = e.keyCode;
    if (!this.isSelected) {
      return;
    }
    if (keycode === KEY_CODE_RENAME) {
      this.renameItem();
    } else if (keycode === KEY_CODE_ENTER && !this.isEditing) {
      this.dblClickItem();
    } else if (keycode === KEY_CODE_TAB || keycode === KEY_CODE_ENTER) {
      e.preventDefault();
      this.focusOut();
    } else if (keycode === KEY_CODE_ESCAPE) {
      this.isEditing = false;
    }
  }
}
