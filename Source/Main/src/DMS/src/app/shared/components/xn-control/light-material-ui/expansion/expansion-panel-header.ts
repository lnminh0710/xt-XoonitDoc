/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {FocusMonitor, FocusableOption, FocusOrigin} from '@angular/cdk/a11y';
import {ENTER, SPACE, hasModifierKey} from '@angular/cdk/keycodes';
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  Directive,
  ElementRef,
  Host,
  Input,
  OnDestroy,
  ViewEncapsulation,
  Optional,
  Inject,
} from '@angular/core';
import {merge, Subscription, EMPTY} from 'rxjs';
import {filter} from 'rxjs/operators';
import {matExpansionAnimations} from './expansion-animations';
import {
  MatExpansionPanel,
  MatExpansionPanelDefaultOptions,
  MAT_EXPANSION_PANEL_DEFAULT_OPTIONS,
} from './expansion-panel';
import {MatAccordionTogglePosition} from './accordion-base';


/**
 * `<mat-expansion-panel-header>`
 *
 * This component corresponds to the header element of an `<mat-expansion-panel>`.
 */
@Component({
  selector: 'mat-expansion-panel-header',
  styleUrls: ['./expansion-panel-header.scss'],
  templateUrl: './expansion-panel-header.html',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [
    matExpansionAnimations.indicatorRotate,
    matExpansionAnimations.expansionHeaderHeight
  ],
  host: {
    'class': 'mat-expansion-panel-header mat-focus-indicator',
    'role': 'button',
    '[attr.id]': 'panel._headerId',
    '[attr.tabindex]': 'disabled ? -1 : 0',
    '[attr.aria-controls]': '_getPanelId()',
    '[attr.aria-expanded]': '_isExpanded()',
    '[attr.aria-disabled]': 'panel.disabled',
    '[class.mat-expanded]': '_isExpanded()',
    '[class.mat-expansion-toggle-indicator-after]': `_getTogglePosition() === 'after'`,
    '[class.mat-expansion-toggle-indicator-before]': `_getTogglePosition() === 'before'`,
    '(click)': '_toggle()',
    '(keydown)': '_keydown($event)',
    '[@.disabled]': '_animationsDisabled',
    '(@expansionHeight.start)': '_animationStarted()',
    '[@expansionHeight]': `{
        value: _getExpandedState(),
        params: {
          collapsedHeight: collapsedHeight,
          expandedHeight: expandedHeight
        }
    }`,
  },
})
export class MatExpansionPanelHeader implements OnDestroy, FocusableOption {
  private _parentChangeSubscription = Subscription.EMPTY;

  /** Whether Angular animations in the panel header should be disabled. */
  _animationsDisabled = true;

  constructor(
      @Host() public panel: MatExpansionPanel,
      private _element: ElementRef,
      private _focusMonitor: FocusMonitor,
      private _changeDetectorRef: ChangeDetectorRef,
      @Inject(MAT_EXPANSION_PANEL_DEFAULT_OPTIONS) @Optional()
          defaultOptions?: MatExpansionPanelDefaultOptions) {
    const accordionHideToggleChange = panel.accordion ?
        panel.accordion._stateChanges.pipe(
            filter(changes => !!(changes['hideToggle'] || changes['togglePosition']))) :
        EMPTY;

    // Since the toggle state depends on an @Input on the panel, we
    // need to subscribe and trigger change detection manually.
    this._parentChangeSubscription =
        merge(
            panel.opened, panel.closed, accordionHideToggleChange,
            panel._inputChanges.pipe(filter(
                changes => {
                  return !!(
                    changes['hideToggle'] ||
                    changes['disabled'] ||
                    changes['togglePosition']);
                  })))
    .subscribe(() => this._changeDetectorRef.markForCheck());

    // Avoids focus being lost if the panel contained the focused element and was closed.
    panel.closed
      .pipe(filter(() => panel._containsFocus()))
      .subscribe(() => _focusMonitor.focusVia(_element, 'program'));

    _focusMonitor.monitor(_element).subscribe(origin => {
      if (origin && panel.accordion) {
        panel.accordion._handleHeaderFocus(this);
      }
    });

    if (defaultOptions) {
      this.expandedHeight = defaultOptions.expandedHeight;
      this.collapsedHeight = defaultOptions.collapsedHeight;
    }
  }

  _animationStarted() {
    // Currently the `expansionHeight` animation has a `void => collapsed` transition which is
    // there to work around a bug in Angular (see #13088), however this introduces a different
    // issue. The new transition will cause the header to animate in on init (see #16067), if the
    // consumer has set a header height that is different from the default one. We work around it
    // by disabling animations on the header and re-enabling them after the first animation has run.
    // Note that Angular dispatches animation events even if animations are disabled. Ideally this
    // wouldn't be necessary if we remove the `void => collapsed` transition, but we have to wait
    // for https://github.com/angular/angular/issues/18847 to be resolved.
    this._animationsDisabled = false;
  }

  /** Height of the header while the panel is expanded. */
  @Input() expandedHeight: string;

  /** Height of the header while the panel is collapsed. */
  @Input() collapsedHeight: string;

  /**
   * Whether the associated panel is disabled. Implemented as a part of `FocusableOption`.
   * @docs-private
   */
  get disabled() {
    return this.panel.disabled;
  }

  /** Toggles the expanded state of the panel. */
  _toggle(): void {
    if (!this.disabled) {
      this.panel.toggle();
    }
  }

  /** Gets whether the panel is expanded. */
  _isExpanded(): boolean {
    return this.panel.expanded;
  }

  /** Gets the expanded state string of the panel. */
  _getExpandedState(): string {
    return this.panel._getExpandedState();
  }

  /** Gets the panel id. */
  _getPanelId(): string {
    return this.panel.id;
  }

  /** Gets the toggle position for the header. */
  _getTogglePosition(): MatAccordionTogglePosition {
    return this.panel.togglePosition as MatAccordionTogglePosition;
  }

  /** Gets whether the expand indicator should be shown. */
  _showToggle(): boolean {
    return !this.panel.hideToggle && !this.panel.disabled;
  }

  /** Handle keydown event calling to toggle() if appropriate. */
  _keydown(event: KeyboardEvent) {
    switch (event.keyCode) {
      // Toggle for space and enter keys.
      case SPACE:
      case ENTER:
        if (!hasModifierKey(event)) {
          event.preventDefault();
          this._toggle();
        }

        break;
      default:
        if (this.panel.accordion) {
          this.panel.accordion._handleHeaderKeydown(event);
        }

        return;
    }
  }

  /**
   * Focuses the panel header. Implemented as a part of `FocusableOption`.
   * @param origin Origin of the action that triggered the focus.
   * @docs-private
   */
  focus(origin: FocusOrigin = 'program', options?: FocusOptions) {
    this._focusMonitor.focusVia(this._element, origin, options);
  }

  ngOnDestroy() {
    this._parentChangeSubscription.unsubscribe();
    this._focusMonitor.stopMonitoring(this._element);
  }
}

/**
 * `<mat-panel-description>`
 *
 * This directive is to be used inside of the MatExpansionPanelHeader component.
 */
@Directive({
  selector: 'mat-panel-description',
  host: {
    class: 'mat-expansion-panel-header-description'
  }
})
export class MatExpansionPanelDescription {}

/**
 * `<mat-panel-title>`
 *
 * This directive is to be used inside of the MatExpansionPanelHeader component.
 */
@Directive({
  selector: 'mat-panel-title',
  host: {
    class: 'mat-expansion-panel-header-title'
  }
})
export class MatExpansionPanelTitle {}
