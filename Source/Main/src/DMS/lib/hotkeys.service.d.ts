import { Hotkey } from './hotkey.model';
import { Subject } from 'rxjs';
import { IHotkeyOptions } from './hotkey.options';
import 'mousetrap';
import * as ɵngcc0 from '@angular/core';
export declare class HotkeysService {
    private options;
    hotkeys: Hotkey[];
    pausedHotkeys: Hotkey[];
    mousetrap: any;
    cheatSheetToggle: Subject<any>;
    private preventIn;
    constructor(options: IHotkeyOptions);
    add(hotkey: Hotkey | Hotkey[], specificEvent?: string): Hotkey | Hotkey[];
    remove(hotkey?: Hotkey | Hotkey[]): Hotkey | Hotkey[];
    get(combo?: string | string[]): Hotkey | Hotkey[];
    pause(hotkey?: Hotkey | Hotkey[]): Hotkey | Hotkey[];
    unpause(hotkey?: Hotkey | Hotkey[]): Hotkey | Hotkey[];
    reset(): void;
    private findHotkey;
    static ɵfac: ɵngcc0.ɵɵFactoryDef<HotkeysService>;
}

//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaG90a2V5cy5zZXJ2aWNlLmQudHMiLCJzb3VyY2VzIjpbImhvdGtleXMuc2VydmljZS5kLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FBQ0E7QUFDQTtBQUNBOztBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFDQSIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IEhvdGtleSB9IGZyb20gJy4vaG90a2V5Lm1vZGVsJztcclxuaW1wb3J0IHsgU3ViamVjdCB9IGZyb20gJ3J4anMnO1xyXG5pbXBvcnQgeyBJSG90a2V5T3B0aW9ucyB9IGZyb20gJy4vaG90a2V5Lm9wdGlvbnMnO1xyXG5pbXBvcnQgJ21vdXNldHJhcCc7XHJcbmV4cG9ydCBkZWNsYXJlIGNsYXNzIEhvdGtleXNTZXJ2aWNlIHtcclxuICAgIHByaXZhdGUgb3B0aW9ucztcclxuICAgIGhvdGtleXM6IEhvdGtleVtdO1xyXG4gICAgcGF1c2VkSG90a2V5czogSG90a2V5W107XHJcbiAgICBtb3VzZXRyYXA6IE1vdXNldHJhcEluc3RhbmNlO1xyXG4gICAgY2hlYXRTaGVldFRvZ2dsZTogU3ViamVjdDxhbnk+O1xyXG4gICAgcHJpdmF0ZSBwcmV2ZW50SW47XHJcbiAgICBjb25zdHJ1Y3RvcihvcHRpb25zOiBJSG90a2V5T3B0aW9ucyk7XHJcbiAgICBhZGQoaG90a2V5OiBIb3RrZXkgfCBIb3RrZXlbXSwgc3BlY2lmaWNFdmVudD86IHN0cmluZyk6IEhvdGtleSB8IEhvdGtleVtdO1xyXG4gICAgcmVtb3ZlKGhvdGtleT86IEhvdGtleSB8IEhvdGtleVtdKTogSG90a2V5IHwgSG90a2V5W107XHJcbiAgICBnZXQoY29tYm8/OiBzdHJpbmcgfCBzdHJpbmdbXSk6IEhvdGtleSB8IEhvdGtleVtdO1xyXG4gICAgcGF1c2UoaG90a2V5PzogSG90a2V5IHwgSG90a2V5W10pOiBIb3RrZXkgfCBIb3RrZXlbXTtcclxuICAgIHVucGF1c2UoaG90a2V5PzogSG90a2V5IHwgSG90a2V5W10pOiBIb3RrZXkgfCBIb3RrZXlbXTtcclxuICAgIHJlc2V0KCk6IHZvaWQ7XHJcbiAgICBwcml2YXRlIGZpbmRIb3RrZXk7XHJcbn1cclxuIl19