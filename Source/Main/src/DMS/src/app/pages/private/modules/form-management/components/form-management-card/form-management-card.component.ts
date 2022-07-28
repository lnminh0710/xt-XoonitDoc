import { Component, OnInit, Input, Output, EventEmitter, OnChanges, SimpleChanges, OnDestroy } from '@angular/core';

import { Subscription } from 'rxjs';
import { DragulaService } from 'ng2-dragula';

@Component({
  selector: 'form-management-card',
  templateUrl: './form-management-card.component.html',
  styleUrls: ['./form-management-card.component.scss'],
})
export class FormManagementCardComponent implements OnInit, OnChanges, OnDestroy {
  //Input
  @Input() isSort: boolean;
  @Input() isEditMode: boolean;
  @Input() dataSource: Array<any>;
  @Input() name: string;
  @Input() isShowField: boolean;

  @Input() isAssignMode: boolean;
  @Input() isCardMode: boolean;

  //Output
  @Output() actionSelectItem: EventEmitter<any> = new EventEmitter();
  @Output() actionAddItem: EventEmitter<any> = new EventEmitter();
  @Output() actionDrop: EventEmitter<any> = new EventEmitter();
  // Variable
  public inputValue: string = '';
  public isChecked: boolean;
  public perfectScrollbarConfig: any = {
    suppressScrollX: false,
    suppressScrollY: false,
  };
  private subscripteDropModel: Subscription;

  constructor(private dragulaService: DragulaService) {}

  ngOnInit() {
    this.initDragulaEvents();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['isSort']) {
      if (this.isSort && !this.dragulaService.find(this.name)) {
        this.dragulaService.setOptions(this.name, {
          moves: (el, container, handle) => {
            return this.isSort;
          },
        });
      } else if (!this.isSort && this.dragulaService.find(this.name)) {
        this.dragulaService.destroy(this.name);
      }
    }
  }

  ngOnDestroy() {
    if (this.dragulaService.find(this.name)) this.dragulaService.destroy(this.name);
  }

  public changeInputValue(event) {
    this.inputValue = event.target.value;
  }

  public onClickItem(item: any) {
    this.actionSelectItem.emit(item);
  }

  public addData() {
    this.actionAddItem.emit({ value: this.inputValue });
    this.inputValue = '';
  }

  private initDragulaEvents() {
    this.subscripteDropModel = this.dragulaService.drop.subscribe(this.onDropModel.bind(this));
  }

  private onDropModel(args: any) {
    const [bagName, elSource, bagTarget, bagSource] = args;
    if (bagName === this.name) {
      this.saveOrderData();
    }
  }

  private saveOrderData() {
    this.actionDrop.emit(this.dataSource);
  }
}
