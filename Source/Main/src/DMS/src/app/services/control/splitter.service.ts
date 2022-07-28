import { Injectable } from '@angular/core';
import { TabPageViewSplitItemModel } from '../../models';
import isNil from 'lodash-es/isNil';
import isUndefined from 'lodash-es/isUndefined';
import { Uti } from '../../utilities/uti';

@Injectable()
export class SplitterService {
    public hasChanged = false;

    public updatePageItemsContentSize(pageItems: Array<any>, splittersSize: any) {
        pageItems.forEach((pageItem, index) => {
            pageItem.ContentSize = splittersSize.sizes[index];
            pageItem.ContentSizeOriginal = pageItem.ContentSize;
        });
    }

    public rebuildAndUpdateSplitters(moduleSetting: any, splittersSize: any, pageItems: Array<any>, configSplitters: any, fnSaveGlobalSetting: Function) {
        this.hasChanged = true;

        const splittersSizes = Array.isArray(splittersSize) ? splittersSize : splittersSize.sizes;
        //1. update ContentSize of PageItems for Current
        this.updateContentSizePageItems(pageItems, splittersSizes);
        //2. build PageItems for Children Recursive
        this.buildPageItemsForChildrenRecursive(pageItems);

        let isCallSave = false;
        //3. rebuild Split PageItems For Current
        if (configSplitters && configSplitters.length) {
            const pageItemsFitSize = this._getSplitterValue(pageItems, configSplitters);
            if (pageItemsFitSize && pageItemsFitSize.length) {
                isCallSave = true;
                setTimeout(() => {
                    this._setSplitFitSize(pageItemsFitSize);

                    //4. save GlobalSetting
                    this.updateModuleSetting(moduleSetting, pageItems);
                    //save db
                    fnSaveGlobalSetting(moduleSetting);
                });
            }
        }

        //4. if haven't still saved db -> save GlobalSetting
        if (!isCallSave) {
            this.updateModuleSetting(moduleSetting, pageItems);
            fnSaveGlobalSetting(moduleSetting);
        }
    }

    private updateModuleSetting(moduleSetting: any, pageItems: Array<any>) {
        const jsonSettings = moduleSetting.item[0].jsonSettings;
        const moduleContent = jsonSettings.Content;

        //3. update CustomTabs for ModuleSetting
        for (let i = 0; i < pageItems.length; i++) {
            //update for CustomTabs
            this.updateCustomTabsRecursive(moduleContent.CustomTabs, pageItems[i]);
        }//for
        jsonSettings.Content = moduleContent;
        moduleSetting.item[0].jsonSettings = JSON.stringify(jsonSettings);
    }

    private updateCustomTabsRecursive(items: Array<any>, pageItem: any): void {
        for (let i = 0; i < items.length; i++) {
            const item = items[i];
            if (item.ID == pageItem.ID) {
                item.ContentSize = pageItem.ContentSize + '%';
                item.ContentSizeOriginal = item.ContentSize;
                break;
            }
            if (item.Split) {
                this.updateCustomTabsRecursive(item.Split.Items, pageItem);
            }

            if (item.SimpleTabs) {
                this.updateCustomTabsRecursive(item.SimpleTabs, pageItem);
            }

            if (item.EditForm) {
                if (item.EditForm.ID == pageItem.ID) {
                    item.ContentSize = pageItem.ContentSize + '%';
                    item.ContentSizeOriginal = item.ContentSize;
                    break;
                }
                if (item.EditForm.Split) {
                    this.updateCustomTabsRecursive(item.EditForm.Split.Items, pageItem);
                }

                if (item.EditForm.SimpleTabs) {
                    this.updateCustomTabsRecursive(item.EditForm.SimpleTabs, pageItem);
                }
            }
        }
    }

    private updateContentSizePageItems(pageItems: Array<any>, splittersSizes: Array<any>) {
        if (!splittersSizes || !splittersSizes.length) return;

        for (let i = 0; i < pageItems.length; i++) {
            if (i >= splittersSizes.length) break;

            //update for pageItems
            pageItems[i].ContentSize = splittersSizes[i] === null ? pageItems[i].ContentSize : splittersSizes[i];
            pageItems[i].ContentSizeOriginal = pageItems[i].ContentSize;
        }
    }

    public buildPageItems(pageItems: Array<TabPageViewSplitItemModel>, splitters?: Array<any>) {
        if (!pageItems || !pageItems.length) return;

        setTimeout(() => {
            pageItems.forEach((x) => {
                x.ContentSize = this.tryParseContentSizePercent(x.ContentSize);
                x.ContentSizeOriginal = x.ContentSize;

                if (!isNil(x['SimpleTabs'])) {
                    x['perfectScrollbarConfig'] = {
                        suppressScrollX: true,
                        suppressScrollY: true,
                    };
                } else {
                    const hasSplit = !isUndefined(x['Split']);
                    x['perfectScrollbarConfig'] = {
                        suppressScrollX: hasSplit,
                        suppressScrollY: hasSplit,
                    };
                }
            });

            //build for the current
            this.buildPageItemsForCurrent(pageItems, splitters);

            //build for children
            this.buildPageItemsForChildren(pageItems);
        });
    }

    private buildPageItemsForCurrent

        (pageItems: Array<any>, splitters: Array<any>) {
        if (!splitters || !splitters.length) return;

        const pageItemsFitSize = this._getSplitterValue(pageItems, splitters);
        this._setSplitFitSizeWithTimeout(pageItemsFitSize);
    }

    private buildPageItemsForChildren(pageItems: Array<TabPageViewSplitItemModel>) {
        pageItems.forEach((x) => {
            //hasSplit
            if (!isUndefined(x['Split'])) {
                const pageItemsFitSize = this._getSplitterValue(x['Split']['Items'], x['Split']['Splitters']);
                this._setSplitFitSizeWithTimeout(pageItemsFitSize);
            }
        });
    }

    public buildPageItemsForChildrenRecursive(pageItems: Array<TabPageViewSplitItemModel>) {
        if (!pageItems || !pageItems.length) return;

        pageItems.forEach((x) => {
            //has Split
            if (!isUndefined(x['Split'])) {
                const pageItemsFitSize = this._getSplitterValue(x['Split']['Items'], x['Split']['Splitters']);
                this._setSplitFitSize(pageItemsFitSize);

                //loop Recursive
                this.buildPageItemsForChildrenRecursive(x['Split']['Items']);
            }
        });
    }

    private _getSplitterValue(splitPageItems: Array<any>, splitters: Array<any>) {
        if (!splitPageItems || !splitPageItems.length || !splitters || !splitters.length) return [];

        let pageItemsFitSize = [];

        splitPageItems.forEach((x) => {
            x.ContentSize = this.tryParseContentSizePercent(x.ContentSize);
            x.ContentSizeOriginal = x.ContentSize;
        });

        splitters.forEach((splitter, index) => {
            if (splitter['Id'] && splitter['Unresizable'] == '1') {
                const fitSizeItem = {
                    index: index
                };
                let contentFixSize = splitter['FitSize'];
                let pageItem;

                if (splitter['FitTop'] == '1' || splitter['FitLeft'] == '1') {
                    fitSizeItem['size'] = contentFixSize;
                    fitSizeItem['fitTop'] = splitter['FitTop'] === '1';
                    fitSizeItem['fitLeft'] = splitter['FitLeft'] === '1';
                    pageItem = splitPageItems[index];
                }
                else if (splitter['FitBottom'] == '1' || splitter['FitRight'] == '1') {
                    fitSizeItem['size'] = contentFixSize;
                    fitSizeItem['fitBottom'] = splitter['FitBottom'] === '1';
                    fitSizeItem['fitRight'] = splitter['FitRight'] === '1';

                    let splitItemIndex = index + 1;
                    if (splitItemIndex >= splitPageItems.length)
                        splitItemIndex--;

                    if (splitItemIndex < splitPageItems.length)
                        pageItem = splitPageItems[splitItemIndex];
                }

                if (pageItem) {
                    fitSizeItem['id'] = pageItem['TabID'];
                    contentFixSize = this.parseFloatContentSize(contentFixSize);
                    fitSizeItem['sizePixel'] = contentFixSize;
                    pageItem.ContentSizePixel = contentFixSize;
                    pageItemsFitSize.push(fitSizeItem);
                }
            }
        });

        if (pageItemsFitSize.length) {
            //Recalculate SplitAreas with Percent
            const widthOrHeight = this._getTabContainerWidthOrHeight(pageItemsFitSize);
            if (widthOrHeight) {
                let sumFixedSizePercent = 0;//Sum of Fixed-SizePercent
                let sumSizePercent = 0;//Sum of SizePercent
                let sumSizePixel = 0;//Sum of SizePixel
                let numofSizePercent = 0;

                //Convert percent to pixel to calculate Ratio base on the current width/height DOM after that calculate to percent again
                splitPageItems.forEach((x) => {
                    if (x.ContentSizePixel) {
                        //From the fixed Pixel -> cal to percent by the current width/height. (Convert Pixel to Percent)
                        const sizePercent = (x.ContentSizePixel / widthOrHeight) * 100;
                        x.ContentSize = sizePercent;
                        x.ContentSizeOriginal = sizePercent;
                        sumFixedSizePercent += sizePercent;
                    }
                    else {
                        sumSizePercent += x.ContentSize;
                        numofSizePercent++;
                    }
                });
                const remainingSizePercent = 100 - sumFixedSizePercent;
                const excessSizePercent = sumSizePercent - remainingSizePercent;
                const aPart = excessSizePercent && numofSizePercent ? excessSizePercent / numofSizePercent : 0;
                splitPageItems.forEach((x) => {
                    if (!x.ContentSizePixel) {
                        //Convert Percent to Temp Pixel for purpose calculating to Percent by the current width/height
                        let contentSize = x.ContentSize > aPart ? x.ContentSize - aPart : x.ContentSize;
                        const sizePixel = (contentSize * widthOrHeight) / 100;
                        x.ContentSizePixelTemp = sizePixel;
                        sumSizePixel += sizePixel;
                    }
                });
                if (sumSizePixel) {
                    //Calculate new Ratio
                    splitPageItems.forEach((x) => {
                        //Only calculate for percent
                        if (!x.ContentSizePixel && x.ContentSizePixelTemp) {
                            const newRatio = x.ContentSizePixelTemp / sumSizePixel;
                            const newContentSize = newRatio * remainingSizePercent;
                            //console.log(' - newRatio: ', newRatio, 'contentSize: ', x.ContentSize, 'newContentSize: ', newContentSize);
                            x.ContentSize = newContentSize;
                            x.ContentSizeOriginal = newContentSize;
                            x.ContentSizePixelTemp = null;//reset
                        }
                    });
                }
            }
        }
        return pageItemsFitSize;
    }

    private _getTabContainerWidthOrHeight(pageItemsFitSize?: Array<any>) {
        const $tabContainer = $('[data-splitareaid="' + pageItemsFitSize[0].id + '"]').closest('as-split');
        if (!$tabContainer.length) return null;

        //vertical, horizontal
        return $tabContainer.attr('direction') === 'horizontal' ? $tabContainer.width() : $tabContainer.height();
    }

    private _setSplitFitSize(pageItemsFitSize: Array<any>) {
        try {
            if (!pageItemsFitSize || !pageItemsFitSize.length) return;

            pageItemsFitSize.forEach((x) => {
                const $el = $('[data-splitareaid="' + x.id + '"]');
                if ($el.length) {
                    //hide splitter
                    $el.parent('as-split').find(' > .as-split-gutter').eq(x.index).addClass('gutter-hidden');
                    //set for the current
                    this._setCurrentSplitterFitSize($el, x.size);
                }
            });
        }
        catch { }
    }

    private _setSplitFitSizeWithTimeout(pageItemsFitSize: Array<any>) {
        setTimeout(() => {
            this._setSplitFitSize(pageItemsFitSize);
        }, 200);
    }

    private _setCurrentSplitterFitSize($el, size) {
        /*
        const flexbasis = this._parseFlexbasisObj($el.css('flex'));
        flexbasis.pixelFixed = this.parseFloatContentSize(size);
        console.log('flexbasis: ', flexbasis);
        $el.css('flex', '0 0 calc(' + size + ' - ' + flexbasis.pixel + 'px )');
        */
        const flexbasis = this._parseFlexbasis($el.css('flex'));
        //console.log('size: ', size, 'flexbasis: ', flexbasis);
        $el.css('flex', '0 0 calc(' + size + ' - ' + flexbasis + 'px )');
    }

    private _parseFlexbasis(flex) {
        const currentFlex = flex;
        const arr = currentFlex.split('-');
        let flexbasis = 0;
        if (arr.length > 1) {
            //flex: 0 0 calc(89.4077% - 4.47039px);
            flexbasis = this.parseFloatContentSize(arr[arr.length - 1]);
        }
        return flexbasis;
    }

    private _parseFlexbasisObj(flex) {
        //flex: 0 0 calc(89.4077% - 4.47039px);
        const arr = flex.split('calc(');
        const ret = {
            percent: null,
            pixel: null,
            pixelFixed: null
        };
        if (arr.length > 1) {
            const arr2 = arr[1].split('-');
            if (arr2.length > 1) {
                //{ 0: ?%, 1: ?px }
                ret.percent = this.parseFloatContentSize(arr2[0]);
                ret.pixel = this.parseFloatContentSize(arr2[1]);
            }
            else if (arr2.length) {
                let val = arr2[0].trim().replace(')', '');
                if (val.indexOf('%') !== -1)
                    ret.percent = this.parseFloatContentSize(val);
                else if (val.indexOf('px') !== -1)
                    ret.pixel = this.parseFloatContentSize(val);
            }
        }
        return ret;
    }

    private parseFloatContentSize(contentSize) {
        if (contentSize && typeof contentSize === 'string') {
            contentSize = contentSize.trim()
                .replace('px)', '')
                .replace('px', '')
                .replace('%', '');
            return Number.parseFloat(contentSize);
        }
        return contentSize;
    }

    private tryParseContentSizePercent(contentSize) {
        contentSize = Uti.parFloatFromObject(contentSize, 50, '%');
        contentSize = this.fixContentSize(contentSize);
        return contentSize;
    }

    public fixContentSize(contentSize) {
        if (contentSize && contentSize < 0.0000000000001) {
            contentSize = 0;
        }
        return contentSize;
    }
}
