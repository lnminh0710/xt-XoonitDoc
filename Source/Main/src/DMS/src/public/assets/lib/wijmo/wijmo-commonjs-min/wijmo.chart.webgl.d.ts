/*!
    *
    * Wijmo Library 5.20201.680
    * http://wijmo.com/
    *
    * Copyright(c) GrapeCity, Inc.  All rights reserved.
    *
    * Licensed under the GrapeCity Commercial License.
    * sales@wijmo.com
    * wijmo.com/products/wijmo-5/license/
    *
    */
/**
 * {@module wijmo.chart.webgl}
 * Includes WebGL rendering engine for FlexChart.
*/
/**
 *
 */
export declare var ___keepComment: any;
import * as chart from 'wijmo/wijmo.chart';
export declare class WebGLRenderEngine extends chart._SvgRenderEngine {
    private static svgns;
    canvas: HTMLCanvasElement;
    foCanvas: SVGForeignObjectElement;
    private gl;
    private rdraw;
    private edraw;
    private pdraw;
    private ldraw;
    private adraw;
    private primitives;
    private isIE;
    constructor(el?: HTMLElement);
    beginRender(): void;
    setViewportSize(w: number, h: number): void;
    endRender(): void;
    drawEllipse(cx: number, cy: number, rx: number, ry: number, className?: string, style?: any): SVGElement;
    drawRect(x: number, y: number, w: number, h: number, className?: string, style?: any, clipPath?: string): SVGElement;
    drawLines(xs: number[], ys: number[], className?: string, style?: any, clipPath?: string, num?: number): SVGElement;
    drawPolygon(xs: number[], ys: number[], className?: string, style?: any, clipPath?: string): SVGElement;
    init(): void;
}
