import { ElementRef, Injectable, Injector, TemplateRef } from '@angular/core';
import { ConnectionPositionPair, Overlay, OverlayConfig, PositionStrategy } from '@angular/cdk/overlay';
import { ComponentPortal, ComponentType, PortalInjector } from '@angular/cdk/portal';
import { PopupContent, PopupRef } from '../popup-ref';
import { IPopupConfig } from '../models/popup-config.interface';
import { PopupParams } from '../models/popup-params.interface';
import { SimplePopupComponent } from '../components/simple-popup/simple-popup.component';
import { ComponentTemplatePopupComponent } from '../components/component-template-popup/component-template-popup.component';
import { coerceBooleanProperty } from '@angular/cdk/coercion';

@Injectable()
export class PopupService {
    constructor(private overlay: Overlay, private injector: Injector) {}

    public open<T>(popupParams: PopupParams<T>): PopupRef<T> {
        const overlayRef = this.overlay.create(this._getOverlayConfig(popupParams));
        const popoverRef = new PopupRef<T>(overlayRef, popupParams);

        const injector = this._createInjector(popoverRef, this.injector);

        const factoryComponent = this._getFactoryPopupComponent(popupParams.content);

        overlayRef.attach(new ComponentPortal(factoryComponent(), null, injector));

        if (overlayRef?.hostElement?.parentElement) {
            if (popupParams?.containerClass) {
                overlayRef?.hostElement?.parentElement.classList.add(popupParams?.containerClass);
            }
            if (popupParams?.containerStyle) {
                overlayRef?.hostElement?.parentElement.setAttribute('style', popupParams?.containerStyle);
            }
        }
        return popoverRef;
    }

    private _createInjector(popoverRef: PopupRef, injector: Injector) {
        const tokens = new WeakMap([[PopupRef, popoverRef]]);
        return new PortalInjector(injector, tokens);
    }

    private _getOverlayConfig(popupConfig: IPopupConfig): OverlayConfig {
        return new OverlayConfig({
            hasBackdrop: coerceBooleanProperty(popupConfig.hasBackdrop),
            width: popupConfig.width,
            height: popupConfig.height,
            backdropClass: 'popup-backdrop',
            positionStrategy: this._getOverlayPosition(popupConfig),
            scrollStrategy: this.overlay.scrollStrategies.reposition(),
            minHeight: popupConfig.minHeight,
            minWidth: popupConfig.minWidth,
        });
    }

    private _getOverlayPosition(popupConfig: IPopupConfig): PositionStrategy {
        const positionStrategy = this.overlay
            .position()
            .flexibleConnectedTo(popupConfig.origin || document.body)
            .withPositions(popupConfig.position || this._getDefaultPositions())
            .withFlexibleDimensions(true)
            .withDefaultOffsetY(popupConfig.offsetY || 0)
            .withDefaultOffsetX(popupConfig.offsetX || 0)
            .withTransformOriginOn('.popover')
            .withPush(true);

        return positionStrategy;
    }

    private _getDefaultPositions(): ConnectionPositionPair[] {
        return [
            {
                originX: 'center',
                originY: 'center',
                overlayX: 'center',
                overlayY: 'center',
            },
        ];
    }

    private _getFactoryPopupComponent(content: PopupContent): () => ComponentType<any> {
        let _componentType: ComponentType<any> = null;

        if (typeof content === 'string' || content instanceof TemplateRef) {
            _componentType = SimplePopupComponent;
        } else {
            _componentType = ComponentTemplatePopupComponent;
        }

        return () => {
            return _componentType;
        };
    }
}
