import { Component, ChangeDetectorRef } from '@angular/core';
import { AppState } from '@app/state-management/store';
import { Store } from '@ngrx/store';

import { ScanningActions } from '@app/state-management/store/actions';

@Component({
  selector: 'scanning-action',
  templateUrl: './action.component.html',
  styleUrls: ['./action.component.scss'],
})
export class ScanningActionComponent {
  constructor(
    private store: Store<AppState>,
    private scanningAction: ScanningActions,
    private ref: ChangeDetectorRef,
  ) {}

  public isLoading: boolean;

  public groupImage() {
    if (this.isLoading) return;
    this.store.dispatch(this.scanningAction.groupImage());
  }
  public saveImage() {
    if (this.isLoading) return;

    this.isLoading = true;
    const callback = () => {
      this.isLoading = false;
      this.ref.detectChanges();
    };
    this.store.dispatch(this.scanningAction.uploadImage(callback.bind(this)));
  }
  public deleteImage() {
    if (this.isLoading) return;
    this.store.dispatch(this.scanningAction.deleteAllImage());
  }
}
