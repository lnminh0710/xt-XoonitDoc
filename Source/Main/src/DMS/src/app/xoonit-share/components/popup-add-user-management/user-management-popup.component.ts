import { AfterViewInit, Component, EventEmitter, Input, OnInit, Output, TemplateRef, ViewChild } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';

@Component({
  selector: 'user-management-popup',
  templateUrl: './user-management-popup.component.html',
  styleUrls: ['./user-management-popup.component.scss']
})
export class UserManagementPopupComponent implements OnInit {

  public valueInvalid: boolean;
  public optionPopup = {
    ADD:  { type: 'add' },
    EDIT: { type: 'edit' }
  };

  @Input() nameInput: string;
  @Input() closeFunc: Function = () => {};
  @Input() optionShowPopup: string;
  @Input() listName: Array<any>;
  @Input() nameEditing: any;
  @Output() onSendValue: EventEmitter<any> = new EventEmitter();

  public inputControl: FormControl = new FormControl('', [Validators.required]);

  constructor() { }

  ngOnInit(): void {
    this.setValueInput();
  }

  public createUpdateUser() {
    if (this.inputControl.invalid) {
      return;
    }
    const value = this.inputControl.value;
    this.valueInvalid = this.listName.some((el) => el.name.toLowerCase() === value.toLowerCase());
    if (this.valueInvalid) {
      return;
    }
    this.onSendValue.emit(value);
    this.closeFunc();
  }

  public setValueInput() {
    if (this.optionShowPopup === this.optionPopup.EDIT.type) {
      this.inputControl.setValue(this.nameEditing.name);
    }
  }

  public onChangeValue(event) {
    this.valueInvalid = this.listName.some((el) => el.name.toLowerCase() === event.toLowerCase());
  }
}
