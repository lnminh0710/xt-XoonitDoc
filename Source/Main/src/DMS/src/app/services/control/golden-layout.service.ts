import * as GoldenLayout from 'golden-layout';
import * as $ from 'jquery';
import { GuidHelper } from '@app/utilities/guild.helper';

export class GoldenLayoutService {
    private settings: any = {
        'hasHeaders': true,
        'constrainDragToContainer': true,
        'reorderEnabled': true,
        'selectionEnabled': true,
        'popoutWholeStack': false,
        'blockedPopoutsThrowError': true,
        'closePopoutsOnUnload': true,
        'showPopoutIcon': false,
        'showMaximiseIcon': false,
        'showCloseIcon': true
    };
    private dimensions: any = {
        'borderWidth': 5,
        'minItemHeight': 10,
        'minItemWidth': 10,
        'headerHeight': 20,
        'dragProxyWidth': 300,
        'dragProxyHeight': 200
    };
    private labels: any = {
        'close': 'close',
        'maximise': 'maximise',
        'minimise': 'minimise',
        'popout': 'open in new window'
    };

    private defaultConfig: any = {
        'content': [],
        'settings': this.settings,
        'dimensions': this.dimensions,
        'labels': this.labels
    };
    private selectorContainer: string = '.edit-layout-setting-stage';//you can override it
    private layout: GoldenLayout = undefined;
    private cachedConfigContent: Array<any> = undefined;
    private arrayCachedConfigContent: Array<any> = [];//used for undo each step
    private stateChangedTimeout: any = undefined;
    private formatLayoutTimeout: any = undefined;
    private registerSplitterEventTimeout: any = undefined;
    private allowSaveState: boolean = false;
    private $elmContainer: any = undefined;

    public constructor(selectorContainer: string) {
        this.selectorContainer = selectorContainer;
    }

    public initLayout(configContent: Array<any>) {
        this.$elmContainer = $(this.selectorContainer);
        if (!this.$elmContainer.length) {
            console.log('GoldenLayoutService -> initLayout failed because the Element Container cannot found.');
            return;
        }

        configContent = configContent || [];

        if (this.layout) {
            //In case reInitLayout, we did manually content -> so toConfig().content will always be empty
            if (!configContent || !configContent.length) {
                configContent = this.layout.toConfig().content;
                configContent = configContent.length ? configContent : this.layout.config.content;
            }
            this.reInitLayout(configContent);
        }
        else {
            const that = this;

            let config = Object.assign({}, this.defaultConfig, { content: configContent });
            this.layout = new GoldenLayout(config, this.$elmContainer);

            this.layout.registerComponent('goldComp', function (container, state) {
                // Add event element whenever a tab is created
                container.on('tab', function (tab) {
                    setTimeout(() => {
                        //set data for tab, register event dbClick to change title
                        that.configTab(tab);
                        //that.registerEventSplitterWithTimeout();
                    });
                });
            });

            this.layout.on('initialised', function () {
                //console.log('originalConfigContent', this.layout.toConfig().content);
                //console.log('initialised: ' + new Date());

                that.registerEvents();
                that.allowSaveState = true;
            });

            //Must place the 'init' function after the 'initialised' event
            this.layout.init();

            //#region Dom Events

            //destroy popover when click out
            this.$elmContainer.on('click', function (e) {
                that.$elmContainer.find('.popover').each(function () {
                    let $popover = $(this);
                    //the 'is' for buttons that trigger popups
                    //the 'has' for icons within a button that triggers a popup
                    if (!$popover.is(e.target) && $popover.has(e.target).length === 0 && $('.popover').has(e.target).length === 0) {
                        $popover.remove();
                    }
                });
            });

            $(document).on('keyup', function (e) {
                if (e.keyCode == 27 || e.key === "Escape") { // escape key maps to keycode `27`
                    if (!that.$elmContainer) return;
                    that.$elmContainer.find('.popover').remove();
                }
            });

            $(window).resize(function () {
                if (that.layout)
                    that.layout.updateSize();
            });
            //#endregion

            //#region Golden Events
            //http://golden-layout.com/tutorials/saving-state.html
            this.layout.on('stateChanged', function () {
                //console.log('stateChanged');
                //now save the state
                if (that.allowSaveState) {
                    that.updateCache();
                    that.formatLayout();
                }
            });
            this.layout.on('stackCreated', function (stack) {
                //console.log('stackCreated', stack);
                try {
                    //register event close stack when will save state
                    stack.header
                        .controlsContainer
                        .find('.lm_close') //get the close icon
                        //.off('click') //unbind the current click handler
                        .click(function () {
                            stack.remove();
                            that.allowSaveState = true;
                        });
                } catch (error) {

                }
            });
            this.layout.on('tabCreated', function (tab) {
                //console.log('tabCreated', tab);
                try {
                    //register event close tab when will save state
                    tab.closeElement
                        .off('click') //unbind the current click handler
                        .click(function () {
                            tab.contentItem.remove();
                            that.allowSaveState = true;
                        });
                } catch (error) {
                }
            });
            this.layout.on('rowCreated', function (item) {
                //console.log('rowCreated', item);
                if (!item.config.id)
                    item.config.id = GuidHelper.generateGUID();

                if (item.contentItems.length && item.config.id)
                    item.element.attr('id', item.config.id);

            });
            this.layout.on('columnCreated', function (item) {
                //console.log('columnCreated', item);
                if (!item.config.id)
                    item.config.id = GuidHelper.generateGUID();

                if (item.contentItems.length && item.config.id)
                    item.element.attr('id', item.config.id);

            });

            //https://github.com/golden-layout/golden-layout/issues/122
            this.layout.on('itemDropped', function (item) {
                //console.log('itemDropped', item);

                //when itemDropped -> will save state
                that.allowSaveState = true;
                let isCreateDragItem = true;

                //Determine new target: row or column
                if (item.isComponent && item.config && item.config.id &&
                    item.parent && item.parent.isStack &&
                    item.parent.parent && item.parent.parent.contentItems && item.parent.parent.contentItems.length > 1 &&
                    (item.parent.parent.isColumn || item.parent.parent.isRow)) {

                    let targetItem = that.getTargetItem(item.parent.parent.contentItems, item.config.id);
                    //component is dragged to the first position
                    if (targetItem.oldCom && targetItem.newCom) {
                        const newConfigContent = that.findAndCreateNewNode(item.parent.parent.type, targetItem.oldCom, targetItem.newCom);
                        if (newConfigContent && newConfigContent.length) {
                            that.reInitLayout(newConfigContent);
                            isCreateDragItem = false;
                        }
                    }
                }

                //Change drag sources
                if (isCreateDragItem)
                    that.changeDragSources();

                //console.log('itemDropped', myLayout.toConfig().content);
            });
            //#endregion events

            //create DragSources for the first load
            this.createDragSources();
        }
    }

    public destroyLayout() {
        if (!this.layout) return;

        try {
            this.layout.destroy();
            this.layout = null;

            this.cachedConfigContent = null;
            this.arrayCachedConfigContent = [];

            clearTimeout(this.stateChangedTimeout);
            clearTimeout(this.formatLayoutTimeout);
            clearTimeout(this.registerSplitterEventTimeout);
            this.stateChangedTimeout = null;
            this.formatLayoutTimeout = null;
            this.registerSplitterEventTimeout = null;

            this.allowSaveState = false;

            if (this.$elmContainer) {
                this.$elmContainer.unbind('click');
                this.$elmContainer.empty();
                this.$elmContainer = null;
            }

            $(window).unbind('resize');
        } catch (error) {
            console.log('GoldenLayoutService -> destroyLayout: ' + error);
        }
    }

    public getConfigContent() {
        if (!this.layout) return null;

        try {
            //return _.cloneDeep(this.layout.toConfig().content);
            return this.layout.toConfig().content;
        } catch (error) {
            console.log('GoldenLayoutService -> getConfigContent: ' + error);
        }
        return null;
    }

    public popCacheConfigContent() {
        if (!this.arrayCachedConfigContent || !this.arrayCachedConfigContent.length) return null;

        try {
            let tempContent = this.arrayCachedConfigContent.pop();

            //when the stageChanged Event is fired, we always push configContent to array, so the last item is always current stage
            //So if you want to pop last item to undo, you must get item before last item
            if (this.arrayCachedConfigContent.length > 0)
                tempContent = this.arrayCachedConfigContent.pop();

            return tempContent;
        } catch (error) {
            console.log('GoldenLayoutService -> popCacheConfigContent: ' + error);
        }
        return null;
    }

    //#region Private
    private registerEventSplitterWithTimeout() {
        try {
            clearTimeout(this.registerSplitterEventTimeout);
            this.registerSplitterEventTimeout = null;

            this.registerSplitterEventTimeout = setTimeout(() => {
                if (this.layout.root && this.layout.root.contentItems && this.layout.root.contentItems.length) {
                    this.registerEventSplitter(this.layout.root.contentItems);
                }
            }, 500);

        } catch (error) {
            console.log('GoldenLayoutService -> registerEventSplitterWithTimeout: ' + error);
        }
    }

    private registerEvents() {
        if (this.layout.root && this.layout.root.contentItems && this.layout.root.contentItems.length) {
            this.registerEventAllTabs(this.layout.root.contentItems[0].contentItems);
            this.registerEventSplitter(this.layout.root.contentItems);
        }
    }

    private updateCache() {
        if (!this.allowSaveState) return;

        console.log('updateCache: ' + new Date());
        try {
            let tempContent = this.getConfigContent();
            //must change data
            if (tempContent) {
                this.cachedConfigContent = tempContent;
                this.arrayCachedConfigContent.push(tempContent);
            }
        } catch (error) {
            console.log('GoldenLayoutService -> updateCache: ' + error);
        }

        this.allowSaveState = false;
    }
    private setCacheConfigContent(timeout?: number) {
        clearTimeout(this.stateChangedTimeout);
        this.stateChangedTimeout = null;

        timeout = timeout || 300;
        this.stateChangedTimeout = setTimeout(() => {
            this.updateCache();
        }, timeout);
    }

    private changeDragSources(): void {
        let dragSources = this.layout['_dragSources'];
        if (!dragSources || !dragSources.length) return;

        for (let i = 0, length = dragSources.length; i < length; i++) {
            let item = dragSources[i];
            item._itemConfig.id = GuidHelper.generateGUID();

            let title = item._itemConfig.title || 'Untitled';
            let icon = item._itemConfig.icon || 'fa-cube';
            let color = item._itemConfig.color || '';
            item._itemConfig.title = title;
            item._itemConfig.icon = icon;
            item._itemConfig.color = color;
            if (item._itemConfig.componentState)
                item._itemConfig.componentState.label = title;
        }
    }

    private deleteNode(array, id): boolean {
        for (let i = 0, length = array.length; i < length; i++) {
            let obj = array[i];
            if (obj.id && obj.id === id) {
                // splice out 1 element starting at position i
                array.splice(i, 1);
                return true;
            }
            if (obj.content) {
                if (this.deleteNode(obj.content, id)) {
                    if (obj.content.length === 0) {
                        // delete children property when empty
                        delete obj.content;

                        // or, to delete this parent altogether
                        // as a result of it having no more children
                        // do this instead
                        array.splice(i, 1);
                    }
                    return true;
                }
            }
        }//for
        return false;
    }
    private deleteNodes(array, id): void {
        for (let i = 0, length = array.length; i < length; i++) {
            let obj = array[i];
            if (obj.id && obj.id === id) {
                // splice out 1 element starting at position i
                array.splice(i, 1);
            }
            if (obj.content) {
                this.deleteNodes(obj.content, id);
                if (obj.content.length === 0) {
                    // delete children property when empty
                    delete obj.content;

                    // or, to delete this parent altogether
                    // as a result of it having no more children
                    // do this instead
                    array.splice(i, 1);
                }
            }
        }//for
    }
    private findNode(array, id) {
        for (let i = 0, length = array.length; i < length; i++) {
            let obj = array[i];
            if (obj.id && obj.id === id) {
                return obj;
            }
            if (obj.content) {
                let ret = this.findNode(obj.content, id);
                if (ret) return ret;
            }
        }//for
    }

    //#region Event Tab, Format Tab, Update Title
    private formatLayout() {
        try {
            clearTimeout(this.formatLayoutTimeout);
            this.formatLayoutTimeout = null;

            this.formatLayoutTimeout = setTimeout(() => {
                this.layout.container.find('.lm_header').each(function (key, value) {
                    let $header = $(value),
                        $ulTab = $header.find('ul.lm_tabs');
                    if ($ulTab.length) {
                        let $liTabs = $ulTab.find('li.lm_tab'),
                            $lmItems = $header.next('.lm_items').find('.lm_content'),
                            $spanTitle = $liTabs.find('.lm_title');
                        //only has one tab and one item                    
                        if ($liTabs.length == 1 && $lmItems.length == 1) {
                            $header.addClass('lm_noHeader');
                            $lmItems.css('border-top', 'none');
                            $spanTitle.html('').addClass('lm_notitle');
                        } else {
                            $header.removeClass('lm_noHeader');
                            $lmItems.css('border-top', '1px solid #cccccc');

                            if ($spanTitle.hasClass('lm_notitle')) {
                                $spanTitle.html('<i class="fa fa-cube"></i>Untitled');
                                $spanTitle.removeClass('lm_notitle');
                            }
                        }
                        $liTabs.show();
                    }//ul
                });

            }, 200);

        } catch (error) {
            console.log('GoldenLayoutService -> formatLayout: ' + error);
        }
    }

    private onDoubleClickTab(tab) {
        const that = this;

        tab.element
            .off('dblclick') //unbind the current click handler
            .bind('dblclick', function (event) {
                event.preventDefault();
                event.stopImmediatePropagation();

                let $popover = tab.element.find('.popover');
                if ($popover.length) {
                    $popover.remove();
                    $popover = null;
                }

                let tabId = tab.element.attr('id'),
                    tabTitle = tab.titleElement.attr('title'),
                    tabIcon = tab.titleElement.attr('data-icon'),
                    tabColor = tab.titleElement.attr('data-color'),
                    tabConfig = tab['contentItem']['config'];

                let height = tab.element.outerHeight();
                let popoverTemplate =
                    '<div class="popover fade bottom in" style="top: ' + height + 'px;"  title="">' +
                    '<div class="arrow"></div>' +
                    '<div class="popover-content">' +
                    '<div><input class="form-control input-title" type="text" value="' + tabTitle + '" id="' + tabId + '"/></div>' +
                    //box-icon
                    '<div class="box-icon">' +
                    '<input class="form-control input-icon" type="text" value="' + tabIcon + '"/>' +
                    '<span class="icon-preview" style="color:' + tabColor + '" title="Click to select the color"> ' + '<i class="fa ' + tabIcon + '"></i>' + '</span>' +
                    '<a class="more-icon" href="https://fontawesome.com/v4.7.0/icons/" target="_blank" title="Click to get more icon">...</a>' +
                    '<input class="input-color" type="color" value="' + tabColor + '"/>' +
                    '</div>' +
                    //box-color
                    //'<div class="box-color">' +
                    //'<input class="form-control input-color" type="color" value="' + tabColor + '"/>' +
                    //'<span class="icon-preview" style="color:' + tabColor + '"> ' + '<i class="fa fa-square"></i>' + '</span>' +
                    //'</div>' +
                    //box-save
                    '<div class="box-save disabled" title="Save"><span>Save</span></div>' +
                    '</div></div>';
                tab.element.append(popoverTemplate);

                if (!$popover || !$popover.length)
                    $popover = tab.element.find('.popover');

                let $inputTitle = $popover.find('input.input-title');
                let $inputIcon = $popover.find('input.input-icon');
                let $inputIconPreview = $popover.find('.box-icon span.icon-preview i');
                let $inputColor = $popover.find('input.input-color');
                //let $inputColorPreview = $popover.find('.box-color span.icon-preview i');
                let $btnSave = $popover.find('.box-save');
                if (!$inputTitle.length || !$inputIcon.length) return;

                let oldTitle = $inputTitle.val() + '';
                let oldIcon = $inputIcon.val() + '';
                let oldColor = $inputColor.val() + '';
                const updateTitle = (id: string, newTitle: string, icon: string, color: string, forceUpdate?: boolean) => {
                    let updatedItem: any;
                    if (oldTitle !== newTitle || oldIcon !== icon || oldColor !== color) {
                        updatedItem = that.changeTabTitle(id, newTitle);
                        if (updatedItem) {
                            icon = icon || 'fa-cube';
                            color = color || '';

                            //update state
                            tabConfig.icon = icon;
                            tabConfig.color = color;
                            tabConfig.title = newTitle;
                            if (tabConfig.componentState)
                                tabConfig.componentState.label = newTitle;

                            tab.element.attr('title', newTitle);
                            tab.titleElement.attr('title', newTitle);
                            tab.titleElement.attr('data-icon', icon);
                            tab.titleElement.attr('data-color', color);

                            const titleHtml = '<i class="fa ' + icon + '"></i>' + newTitle;
                            tab.titleElement.html(titleHtml);
                            tab.titleElement.css('color', color);

                            oldTitle = newTitle;
                            oldIcon = icon;
                            oldColor = color;
                            that.allowSaveState = true;
                            that.updateCache();

                            if (forceUpdate) {
                                $('li#' + id + '').attr('title', newTitle)
                                    .find('span#' + id + '')
                                    .html(titleHtml)
                                    .css('color', color);
                            }
                        }
                        //Just retry to update one time
                        else if (!forceUpdate) {
                            console.log('Update title failed with id: ' + id + '. Retry to update.');
                            that.reInitLayout(that.layout.toConfig().content);
                            setTimeout(() => {
                                updateTitle(id, newTitle, icon, color, true);
                            }, 200);
                        }
                    }

                    if ($popover) {
                        $popover.remove();
                        $popover = null;
                    }
                };

                $inputTitle.select();
                $inputTitle.focus();

                $inputTitle.bind('input propertychange paste change keypress', function (e) {
                    $btnSave.removeClass('disabled');
                });

                $inputIcon.bind('input propertychange paste change keypress', function (e) {
                    $inputIconPreview.attr('class', 'fa ' + $inputIcon.val());
                    $btnSave.removeClass('disabled');
                });

                //$inputColor.bind('input propertychange paste change keypress', function (e) {
                //    $inputIconPreview.css('color', $inputColor.val());
                //    $inputColorPreview.css('color', $inputColor.val());
                //    $btnSave.removeClass('disabled');
                //});

                $inputColor.bind('input change', function (e) {
                    $inputIconPreview.css('color', $inputColor.val());
                    $btnSave.removeClass('disabled');
                });
                $inputIconPreview.bind('click', function (event2) {
                    $inputColor.click();
                });

                $popover.bind('mousedown dblclick', function (event2) {
                    event2.stopImmediatePropagation();
                });

                $btnSave.bind('click', function () {
                    updateTitle($inputTitle.attr('id'), $inputTitle.val(), $inputIcon.val(), $inputColor.val());
                });

            });//dblclick        
    }

    private _preventHoverSplitterWhenEditing($current) {
        this.$elmContainer.find('.lm_splitter').not($current).css("pointer-events", "none");
    }
    private _allowHoverSplitterWhenEditing() {
        this.$elmContainer.find('.lm_splitter').css("pointer-events", "auto");
    }

    private onDoubleClickSplitter(splitter, config) {
        const that = this;
        splitter.element
            .off('dblclick') //unbind the current click handler
            .bind('dblclick', function (event) {
                event.preventDefault();
                event.stopImmediatePropagation();

                let $popover = splitter.element.find('.popover');
                if ($popover.length) {
                    $popover.remove();
                    $popover = null;
                }

                that._preventHoverSplitterWhenEditing(splitter.element);

                const id = splitter.element.attr('id'),
                    unresizable = splitter.element.attr('data-unresizable'),
                    fitTop = splitter.element.attr('data-fitTop'),
                    fitBottom = splitter.element.attr('data-fitBottom'),
                    fitLeft = splitter.element.attr('data-fitLeft'),
                    fitRight = splitter.element.attr('data-fitRight');
                let _checked = '';
                let _btnSaveDisabled = '';
                let _disabled = '';
                let _checkedTopLef = '';
                let _checkedBottomRight = '';
                let _valTopLef = '';
                let _valBottomRight = '';
                let _labelTopLef = '';
                let _labelBottomRight = '';
                if (unresizable == '1') {
                    _checked = 'checked="checked"';
                    _checkedTopLef = fitTop == '1' || fitLeft == '1' ? 'checked="checked"' : '';
                    _checkedBottomRight = fitBottom == '1' || fitRight == '1' ? 'checked="checked"' : '';
                    _valTopLef = fitTop == '1' || fitLeft == '1' ? '1' : '0';
                    _valBottomRight = fitBottom == '1' || fitRight == '1' ? '1' : '0';
                }
                else {
                    _disabled = 'disabled="disabled"';
                    _btnSaveDisabled = 'disabled';
                }

                let top = -12;
                let left = 0;
                if (splitter['_isVertical']) {
                    left = (event.pageX - splitter.element.offset().left) - 80;
                    _labelTopLef = 'Top';
                    _labelBottomRight = 'Bottom';
                }
                else {
                    top = (event.pageY - splitter.element.offset().top) - 40;
                    _labelTopLef = 'Left';
                    _labelBottomRight = 'Right';
                }
                if (top < -12) top = -12;
                if (!left) left = -5;
                const popoverTemplate =
                    '<div class="popover fade bottom in" style="top: ' + top + 'px;left: ' + left + 'px;"  title="">' +
                    '<div class="popover-content">' +
                    `<div class="box-chk"><label><input class="form-control input-checkbox unresizable" type="checkbox" value="${unresizable}" id="${id}" ${_checked}/>Unresizable</label></div>` +
                    `<div class="box-chk">
                        <label><input class="form-control input-checkbox fitPage" type="radio" name="fitPage" value="${_valTopLef}" id="${_labelTopLef}_${id}" ${_checkedTopLef} ${_disabled} data-fitPage="${_labelTopLef}"/>Fit ${_labelTopLef} page</label>
                    </div>
                    ` +
                    `<div class="box-chk">
                        <label><input class="form-control input-checkbox fitPage" type="radio" name="fitPage" value="${_valBottomRight}" id="${_labelBottomRight}_${id}" ${_checkedBottomRight} ${_disabled} data-fitPage="${_labelBottomRight}"/>Fit ${_labelBottomRight} page</label>
                    </div>
                    ` +
                    //box-save
                    `<div class="box-save ${_btnSaveDisabled}" title="Save"><span>Save</span></div>` +
                    '</div></div>';
                splitter.element.append(popoverTemplate);

                if (!$popover || !$popover.length)
                    $popover = splitter.element.find('.popover');

                const $inputCheckbox = $popover.find('.unresizable');
                const $btnSave = $popover.find('.box-save');
                if (!$inputCheckbox.length) {
                    that._allowHoverSplitterWhenEditing();
                    return;
                }

                $inputCheckbox.focus();

                $inputCheckbox.bind('change', function (e) {
                    $btnSave.removeClass('disabled');
                    if (this.checked) {
                        $popover.find('.fitPage').removeAttr('disabled');
                    }
                    else {
                        $popover.find('.fitPage').attr('disabled', 'disabled');
                        $popover.find('.fitPage').prop('checked', false);
                    }
                });

                $popover.bind('mousedown dblclick', function (event2) {
                    event2.stopImmediatePropagation();
                });

                $popover.bind('mouseleave', function (event2) {
                    $popover.remove();
                    $popover = null;
                    that._allowHoverSplitterWhenEditing();
                });

                $btnSave.bind('click', function () {
                    const unresizable = ($inputCheckbox.prop('checked') ? '1' : '0');
                    const valTopLef = $popover.find(`[data-fitPage="${_labelTopLef}"]`).prop('checked') ? '1' : '0';
                    const valBottomRight = $popover.find(`[data-fitPage="${_labelBottomRight}"]`).prop('checked') ? '1' : '0';
                    that.updateSplitter(splitter, config, unresizable, valTopLef, valBottomRight);

                    if ($popover) {
                        $popover.remove();
                        $popover = null;
                        that._allowHoverSplitterWhenEditing();
                    }
                });

            });//dblclick
    }

    private updateSplitter(splitter: any, config: any, unresizable: string, valTopLef: string, valBottomRight: string) {
        splitter.splitterUnresizable = unresizable || '0';
        if (splitter.splitterUnresizable == '1') {
            let fitSize = '';
            //Vertical
            if (splitter['_isVertical']) {
                splitter['splitterFitTop'] = valTopLef;
                splitter['splitterFitBottom'] = valBottomRight;
                splitter['splitterFitLeft'] = '0';
                splitter['splitterFitRight'] = '0';

                if (valTopLef == '1') {
                    fitSize = splitter.element.prev().height() + 'px';
                }
                else if (valBottomRight == '1') {
                    fitSize = splitter.element.next().height() + 'px';
                }
            }//Horizontal
            else {
                splitter['splitterFitTop'] = '0';
                splitter['splitterFitBottom'] = '0';
                splitter['splitterFitLeft'] = valTopLef;
                splitter['splitterFitRight'] = valBottomRight;

                if (valTopLef == '1') {
                    fitSize = splitter.element.prev().width() + 'px';
                }
                else if (valBottomRight == '1') {
                    fitSize = splitter.element.next().width() + 'px';
                }
            }

            splitter['splitterFitSize'] = fitSize;
        }
        else {
            splitter['splitterFitTop'] = '0';
            splitter['splitterFitBottom'] = '0';
            splitter['splitterFitLeft'] = '0';
            splitter['splitterFitRight'] = '0';
            splitter['splitterFitSize'] = '';
        }

        //update element
        splitter.element.attr('data-unresizable', splitter.splitterUnresizable);
        splitter.element.attr('data-fitTop', splitter.splitterFitTop);
        splitter.element.attr('data-fitBottom', splitter.splitterFitBottom);
        splitter.element.attr('data-fitLeft', splitter.splitterFitLeft);
        splitter.element.attr('data-fitRight', splitter.splitterFitRight);

        if (config['splitters']) {
            const findIndex = config['splitters'].findIndex((item) => item.splitterId == splitter.splitterId);
            if (findIndex !== -1)
                config['splitters'][findIndex] = splitter;
        }

        this.allowSaveState = true;
        this.updateCache();
    }

    //set data for tab, register event dbClick to change title
    private configTab(tab) {
        if (!tab['contentItem']) return;

        let tabConfig = tab['contentItem']['config'];

        if (!tabConfig) return;

        let id = tabConfig.id || GuidHelper.generateGUID();
        //id: set id for element and titleElement. We base on this id to change title
        tabConfig.id = id;
        tab.element.attr('id', id);
        tab.titleElement.attr('id', id);

        //icon
        let icon = tabConfig.icon || 'fa-cube';
        tabConfig.icon = icon;
        tab.titleElement.attr('data-icon', icon);

        //color
        let color = tabConfig.color || '';
        tabConfig.color = color;
        tab.titleElement.attr('data-color', color);

        //title: set title for element and titleElement
        let title = tab.element.attr('title');
        title = title || 'Untitled';

        tab.element.attr('title', title);
        tab.titleElement.attr('title', title);

        let titleHtml = '<i class="fa ' + icon + '"></i>' + title;
        tab.titleElement.html(titleHtml);
        tab.titleElement.css('color', color);

        //update state
        tabConfig.title = title;
        if (tabConfig.componentState)
            tabConfig.componentState.label = title;

        //bind dbClick event to change title
        this.onDoubleClickTab(tab);
    }

    //set data for tab, register event dbClick to change title
    private configSplitters(obj) {
        const config = obj['config'];
        const splitters = obj['_splitter'];
        if (!splitters || !splitters.length) return;

        for (let i = 0, length = splitters.length; i < length; i++) {
            this.configSplitter(config, splitters[i], i);
        }
    }

    private configSplitter(config, splitter, index) {
        if (!config['splitters'])
            config['splitters'] = [];

        if (!splitter.splitterId && index < config['splitters'].length) {
            const findItem = config['splitters'][index];
            splitter['splitterId'] = findItem['splitterId'];
            splitter['splitterUnresizable'] = findItem['splitterUnresizable'];
            splitter['splitterFitTop'] = findItem['splitterFitTop'];
            splitter['splitterFitBottom'] = findItem['splitterFitBottom'];
            splitter['splitterFitLeft'] = findItem['splitterFitLeft'];
            splitter['splitterFitRight'] = findItem['splitterFitRight'];
            splitter['splitterFitSize'] = findItem['splitterFitSize'];
        }

        //id: set id for element and titleElement. We base on this id to change title
        splitter.splitterId = splitter.splitterId || GuidHelper.generateGUID();
        splitter.element.attr('id', splitter.splitterId);

        //unresizable
        splitter.splitterUnresizable = splitter.splitterUnresizable || '0';
        splitter.element.attr('data-unresizable', splitter.splitterUnresizable);

        //fitTop
        splitter.splitterFitTop = splitter.splitterFitTop || '0';
        splitter.element.attr('data-fitTop', splitter.splitterFitTop);

        //fitBottom
        splitter.splitterFitBottom = splitter.splitterFitBottom || '0';
        splitter.element.attr('data-fitBottom', splitter.splitterFitBottom);

        //fitLeft
        splitter.splitterFitLeft = splitter.splitterFitLeft || '0';
        splitter.element.attr('data-fitLeft', splitter.splitterFitLeft);

        //fitRight
        splitter.splitterFitRight = splitter.splitterFitRight || '0';
        splitter.element.attr('data-fitRight', splitter.splitterFitRight);

        //fitSize
        splitter.splitterFitSize = splitter.splitterFitSize || '';
        splitter.element.attr('data-fitSize', splitter.splitterFitSize);

        //Keep splitters into config
        const findIndex = config['splitters'].findIndex((item) => item.splitterId == splitter.splitterId);
        if (findIndex !== -1)
            config['splitters'][findIndex] = splitter;
        else
            config['splitters'].push(splitter);

        //bind dbClick event to change title
        this.onDoubleClickSplitter(splitter, config);

        const that = this;
        splitter.on('dragStop', function (event) {
            console.log('dragStop: ', event, splitter);
            if ($(event.target).parent().attr('id') != splitter.splitterId) return;

            let valTopLef = '0';
            let valBottomRight = '0';
            if (splitter['_isVertical']) {
                valTopLef = splitter.splitterFitTop;
                valBottomRight = splitter.splitterFitBottom;
            }
            else {
                valTopLef = splitter.splitterFitLeft;
                valBottomRight = splitter.splitterFitRight;
            }
            const unresizable = splitter.splitterUnresizable;
            setTimeout(() => {
                that.updateSplitter(splitter, config, unresizable, valTopLef, valBottomRight);
            }, 100);            
        });
    }

    private configAreaComponent(obj) {
        const element = obj.element;
        if (!element || !element.length) return;

        const config = obj['config'];
        const hideAtFirst = config.componentHideAtFirst || '0';
        config.componentHideAtFirst = hideAtFirst;
        element.attr('data-hide-at-first', hideAtFirst);

        this._onDblClickAreaComponent(obj.element, config);
    }

    private _onDblClickAreaComponent(element, config) {
        const that = this;

        element
            .off('dblclick') // unbind the current click handler
            .bind('dblclick', function (event: JQuery.Event) {
                event.preventDefault();
                event.stopImmediatePropagation();

                let $popover = element.find('.popover');
                if ($popover.length) {
                    $popover.remove();
                    $popover = null;
                }

                const id = element.attr('id');
                const hideAtFirst = element.attr('data-hide-at-first');
                const _checked = hideAtFirst == '1' ? 'checked="checked"' : '';
                const top = event.offsetY;
                const left = event.clientX;
                const popoverTemplate =
                    '<div class="popover fade bottom in" style="top: ' + top + 'px;left: ' + left + 'px;"  title="">' +
                    '<div class="popover-content">' +
                    '<div class="box-chk"><label><input class="form-control input-checkbox" type="checkbox" value="' + hideAtFirst + '" id="' + id + '" ' + _checked + '/>Hide at first</label></div>' +
                    // box-save
                    '<div class="box-save disabled" title="Save"><span>Save</span></div>' +
                    '</div></div>';
                element.append(popoverTemplate);

                if (!$popover || !$popover.length)
                    $popover = element.find('.popover');

                const $inputCheckbox = $popover.find('input.input-checkbox');
                const $btnSave = $popover.find('.box-save');
                if (!$inputCheckbox.length) return;

                let oldVal = $inputCheckbox.val() || '0';
                const updateValue = (id: string, newVal: string) => {
                    if (oldVal !== newVal) {
                        config.componentHideAtFirst = newVal || '0';
                        element.attr('data-hide-at-first', config.componentHideAtFirst);

                        oldVal = newVal;
                        that.allowSaveState = true;
                        that.updateCache();
                    }

                    if ($popover) {
                        $popover.remove();
                        $popover = null;
                    }
                };

                $inputCheckbox.focus();

                $inputCheckbox.bind('change', function (e) {
                    $btnSave.removeClass('disabled');
                });

                $popover.bind('mousedown dblclick', function (event2) {
                    event2.stopImmediatePropagation();
                });

                $btnSave.bind('click', function () {
                    updateValue($inputCheckbox.attr('id'), ($inputCheckbox.prop('checked') ? '1' : '0'));
                });
            });
    }

    private changeTitleOfNodes(array: any, id: string, title: string): any {
        for (let i = 0, length = array.length; i < length; i++) {
            let obj = array[i];
            if (obj.id && obj.id === id) {
                obj.title = title;
                return obj;
            }
            if (obj.content) {
                let ret = this.changeTitleOfNodes(obj.content, id, title);
                if (ret) return ret;
            }
        }
    }

    private changeTabTitle(id: string, title: string): any {
        const array = this.layout.root.contentItems[0].contentItems;
        for (let i = 0, length = array.length; i < length; i++) {
            let obj = array[i];
            if (!obj.config) continue;

            if (obj.config.id && obj.config.id === id) {
                obj.config.title = title;
                return obj.config;
            }

            if (obj.config.content) {
                const updatedItem = this.changeTitleOfNodes(obj.config.content, id, title);
                if (updatedItem) return updatedItem;
            }
        }
        return null;
    }

    private registerEventAllTabs(contentItems: any) {
        if (!contentItems || !contentItems.length) return;
        for (let i = 0, length = contentItems.length; i < length; i++) {
            let obj = contentItems[i];
            if (obj['tab'])
                this.configTab(obj['tab']);

            //recursive to config tab
            if (obj['contentItems'] && obj['contentItems'].length)
                this.registerEventAllTabs(obj['contentItems']);
        }//for
    }

    private registerEventSplitter(contentItems: any) {
        if (!contentItems || !contentItems.length) return;

        for (let i = 0, length = contentItems.length; i < length; i++) {
            let obj = contentItems[i];
            if (obj['_splitter'] && obj['_splitter'].length) {
                this.configSplitters(obj);
            }

            //recursive to config splitter
            if (obj['contentItems'] && obj['contentItems'].length)
                this.registerEventSplitter(obj['contentItems']);
            else if (!obj['contentItems'] || !obj['contentItems'].length)
                this.configAreaComponent(obj);
        }//for
    }
    //#endregion

    private getTargetItem(contentItems, currentId) {
        let oldCom, newCom;
        if (contentItems.length && contentItems.length > 1) {
            //The original behavior of golden layout is: when drag one item into content it will create a splitter:
            //  - if drag into the first position --> will delete it
            //  - find to the second position (index = 1): it must be Stack -> we will make it to become RowOrColumn and add 2 items for it
            //If drag into the first position: left hoặc top
            let firstContentItem = contentItems[0].config.content[0];
            if (currentId == firstContentItem.id) {
                oldCom = firstContentItem;

                //newCom
                let secondItem = contentItems[1];
                if (secondItem.isStack &&
                    secondItem.config &&
                    secondItem.config.content &&
                    secondItem.config.content.length) {
                    //If there is tabs, find to active tab
                    if (secondItem.header &&
                        secondItem.header.tabs &&
                        secondItem.header.tabs.length > 1) {
                        for (let i = 0, length = secondItem.header.tabs.length; i < length; i++) {
                            if (secondItem.header.tabs[i].isActive) {
                                newCom = secondItem.header.tabs[i].contentItem.config;
                                break;
                            }
                        }//for
                    }
                    else {
                        newCom = secondItem.config.content[0];
                    }

                    if (!newCom) {
                        console.log('GoldenLayoutService -> getTargetItem: Cannot find the new target.');
                    }
                }
            }
        }
        return {
            oldCom: oldCom,
            newCom: newCom
        }
    }

    private findAndCreateNewNode(type, oldCom, newCom) {
        let configContent = this.layout.toConfig().content;

        let node = this.findNode(configContent, newCom.id)
        if (!node) {
            console.log('GoldenLayoutService -> findAndCreateNewNode: Cannot find node with Id: ' + newCom.id);
            return null;
        }

        //create new note
        node.id = GuidHelper.generateGUID();
        node.title = node.title || 'Tab';
        node.componentName = undefined;
        node.componentState = undefined;

        node.type = type;
        node.content = [];
        node.content.push(GoldenLayoutService.createComponent());
        node.content.push(GoldenLayoutService.createComponent());

        //node.type = 'stack';
        //let childContent = [];
        //childContent.push(GoldenLayoutService.createComponent());
        //childContent.push(GoldenLayoutService.createComponent());
        //node.content = [
        //    {
        //        type: type,
        //        id: GuidHelper.generateGUID(),
        //        title: type,
        //        content: childContent
        //    }
        //];

        //delete old node
        const deleteSuccess = this.deleteNode(configContent, oldCom.id);
        if (!deleteSuccess) {
            console.log('GoldenLayoutService -> deleteNode failed: ', oldCom);
        }

        console.log('configContent', configContent);

        return configContent;
    }

    private reInitLayout(configContent) {
        try {
            this.layout.destroy();
            this.layout.config.content = configContent;
            this.layout.init();
            this.createDragSources();

            this.cachedConfigContent = configContent;
        } catch (error) {
            /*
             * Error: activeItemIndex out of bounds golden layout
               the user deletes the tab without making it the active tab.
               https://github.com/golden-layout/golden-layout/issues/418
            */
            console.log('GoldenLayoutService -> reInitLayout: ' + error);
            console.log('configContent', configContent);
            try {
                //display the previous ConfigContent
                this.layout.config.content = this.cachedConfigContent;
                this.layout.init();
                this.createDragSources();

            } catch (error) {
                console.log('GoldenLayoutService -> reInitLayout2: ' + error);
                console.log('cachedConfigContent', this.cachedConfigContent);
            }
        }
    }

    private createDragSources() {
        const that = this;
        $('.layout-drag-drop-source-block .drag-drop-item').each(function (key, value) {
            const $element = $(value);
            const itemType = $element.attr('data-type');
            if (itemType === 'Page')
                that.layout.createDragSource($element, GoldenLayoutService.createPage('Page', 'Untitled'));
            else if (itemType === 'Tab')
                that.layout.createDragSource($element, GoldenLayoutService.createPage('Tab', 'Untitled'));
        });
    };
    //#endregion

    //#region Static
    static createPage(type?: string, title?: string, id?: string, width?: number, height?: number, icon?: string, color?: string, componentHideAtFirst?: string): any {
        type = type || 'Page';
        title = title || 'Untitled';
        id = id || GuidHelper.generateGUID();
        return {
            'type': 'component',
            'componentName': 'goldComp',
            'componentState': { 'label': title },
            'title': title,
            'id': id,
            'width': width,
            'height': height,
            'icon': icon,
            'color': color,
            'componentHideAtFirst': componentHideAtFirst
        };
    }

    static createStack(type?: string, title?: string, id?: string, width?: number, height?: number, icon?: string, color?: string): any {
        type = type || 'Stack';
        title = title || 'Tab';
        id = id || GuidHelper.generateGUID();
        return {
            'type': 'stack',
            'content': [],
            'title': title,
            'id': id,
            'width': width,
            'height': height,
            'icon': icon,
            'color': color
        };
    }

    static createRow(type?: string, title?: string, id?: string, width?: number, height?: number, splitterConfig?: any): any {
        type = type || 'Row';
        title = title || 'Row';
        id = id || GuidHelper.generateGUID();
        const item = {
            'type': 'row',
            'content': [],
            'title': title,
            'id': id,
            'width': width,
            'height': height
        };
        this.setSplitterConfig(item, splitterConfig);
        return item;
    }

    static createColumn(type?: string, title?: string, id?: string, width?: number, height?: number, splitterConfig?: any): any {
        type = type || 'Column';
        title = title || 'Column';
        id = id || GuidHelper.generateGUID();
        const item = {
            'type': 'column',
            'content': [],
            'title': title,
            'id': id,
            'width': width,
            'height': height
        };
        this.setSplitterConfig(item, splitterConfig);
        return item;
    }

    static createComponent(title?: string, id?: string): any {
        title = title || 'Untitled';
        id = id || GuidHelper.generateGUID();
        return {
            'type': 'component',
            'componentName': 'goldComp',
            'componentState': { 'label': title },
            'title': title,
            'id': id
        };
    }

    static setSplitterConfig(item: any, splitterConfig: any) {
        if (!splitterConfig) return;

        item['splitters'] = splitterConfig;
    }
    //#endregion Static
}
