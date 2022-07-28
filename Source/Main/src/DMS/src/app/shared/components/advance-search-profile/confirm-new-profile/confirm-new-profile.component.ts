import { Component, OnInit, Input, Output, OnDestroy, EventEmitter } from '@angular/core';
import { BaseComponent } from '@app/pages/private/base';
import { Router } from '@angular/router';

@Component({
  selector: 'confirm-new-profile',
  styleUrls: ['./confirm-new-profile.component.scss'],
  templateUrl: './confirm-new-profile.component.html',
})
export class ConfirmNewProfileComponent extends BaseComponent implements OnInit, OnDestroy {
  private _DEFAULTMESSAGE = 'You must input profile name';

  public profileName: string = '';
  public isGlobal: boolean = false;
  public isSaveWithValue: boolean = false;
  public showDialog: boolean = false;
  public errorMessage = '';

  @Input() profiles: Array<any>;

  @Output() onSaveAction = new EventEmitter<any>();
  @Output() onCloseAction = new EventEmitter<any>();

  constructor(router?: Router) {
    super(router);
  }

  public ngOnInit() {}

  public ngOnDestroy() {}

  public show() {
    this.showDialog = true;
    setTimeout(() => {
      $('#profileName').focus();
    });
  }

  public close(isCreating?: boolean) {
    this.showDialog = false;
    this.profileName = '';
    this.errorMessage = '';
    this.isGlobal = this.isSaveWithValue = false;
    if (isCreating) return;
    this.onCloseAction.emit();
  }

  public save() {
    if (!this.validation()) {
      return;
    }
    this.onSaveAction.emit({
      profileName: this.profileName,
      isGlobal: this.isGlobal,
      isSaveWithValue: this.isSaveWithValue,
    });
  }

  /*************************************************************************************************/
  /***************************************PRIVATE METHOD********************************************/

  private validation() {
    if (!this.validationExistingName()) {
      $('#profileName').focus();
      return false;
    }
    if (!this.profileName) {
      $('#profileName').focus();
      this.errorMessage = this._DEFAULTMESSAGE;
      return false;
    }
    return true;
  }

  private validationExistingName() {
    if (this.isExistedName()) {
      this.errorMessage = 'The name is existing';
      return false;
    }
    return true;
  }

  private isExistedName() {
    const item = this.profiles.find((x) => x.GlobalName === this.profileName);
    return item && item.GlobalName;
  }
}
