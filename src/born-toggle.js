import {callbackOnElements, hasURLParameter, objectAssign, forceFocus, focusTrap} from '@borngroup/born-utilities';

export default class Toggle{
    constructor(options) {
        this.options = options || {};

        //Setup the data attribute to use for the triggers.
        this.options.dataAttribute = this.options.dataAttribute || 'data-toggle';

        callbackOnElements.call(this, this.options.triggers, this._setupTrigger);

        //Make sure the document only has this event attached once.
        document.removeEventListener('keydown', this._toggleOnReturn);
        document.addEventListener('keydown', this._toggleOnReturn);
    }

    //Adds event listener to trigger toggle on keyboard ENTER/RETURN, in case trigger is not focusable.
    _toggleOnReturn(evt) {
        let isNotFocusable = this.activeElement !== document.body && this.activeElement.nodeName !== 'BUTTON';

        if (this.activeElement.toggle && evt.keyCode === 13 && isNotFocusable) {
            Toggle.toggleEventHandler.call(this.activeElement, evt);
        }
    }

    /**
     * Sets up individual 'trigger' functionality.
     */
    _setupTrigger(trigger) {
        let triggerID = trigger.id || this.generateCustomToggleID(trigger);

        trigger.toggle = trigger.toggle || {};

        trigger.toggle.options = this._getOptions(trigger);
        trigger.toggle.parentEl = this._getParent(trigger);
        trigger.toggle.targetEl = this._getTarget(trigger);

        if (!trigger.toggle.targetEl) {
            console.warn('No target provided or element not found for: ', trigger);

            return false;
        }

        trigger.toggle.targetFocusEl = this._getTargetFocus(trigger);

        trigger.id = triggerID;
        trigger.toggle.targetEl.id = trigger.toggle.targetEl.id || `${triggerID}--target`;

        trigger.toggle.options.customAttributes = objectAssign(this.getCustomAttributes(trigger), trigger.toggle.options.customAttributes);

        this._setupCallbacks(trigger);
        this._setupMethods(trigger);
        this._setupHandlers(trigger);

        Toggle.updateAttributes(trigger);

        if (trigger.toggle.options.auto) {
            if (!isNaN(trigger.toggle.options.auto)) {
                //if the 'auto' property is set to a Number, use that as milliseconds to trigger the toggle when ellapsed.
                window.setTimeout(Toggle.set.bind(this, trigger), trigger.toggle.options.auto);
            } else if (typeof trigger.toggle.options.auto === 'string') {
                //if the 'auto' property is set to a String that matches a URL parameter or hash, fire the toggle.
                if (hasURLParameter(trigger.toggle.options.auto)) {
                    Toggle.set(trigger);
                } else if (this.options.breakpoints) {
                    //Else if this.options.breakpoints is provided, attempt to find the matched trigger.toggle.options.auto breakpoint name.
                    let matchedBreakpoint = this.options.breakpoints[trigger.toggle.options.auto];

                    //Check if the matched breakpoint falls within the provided boundaries.
                    if (matchedBreakpoint 
                        && (!matchedBreakpoint.min || document.body.offsetWidth >= matchedBreakpoint.min)
                        && (!matchedBreakpoint.max || document.body.offsetWidth <= matchedBreakpoint.max)) {
                        Toggle.set(trigger);
                    } else {
                        Toggle.unset(trigger, false);
                    }
                }
            } else {
                Toggle.set(trigger);
            }
        }

        //Removes the data-* attribute to enable easy re-initialization if needed.
        trigger.removeAttribute(this.options.dataAttribute);
    }

    /**
     * Generate a random toggleID string to be used in the trigger and target elements in case they don't have an ID.
     * @param  {[type]} trigger [description]
     * @return {[type]}         [description]
     */
    generateCustomToggleID(trigger) {
        let randomString = Math.floor(new Date().getTime() * Math.random()).toString().substr(0, 4);

        return `toggleID-${randomString}`;
    }

    /**
     * Gets the trigger's settings from its data-* attribute.
     * Attempts to add missing properties if needed.
     * @param  {[Node]} trigger: HTML element which functions as the toggle.
     */
    _getOptions(trigger) {
        let triggerOptionsString = trigger.getAttribute(this.options.dataAttribute),
            triggerOptions = objectAssign({}, this.options, triggerOptionsString ? this._safeJSONParse(triggerOptionsString) : {});

        triggerOptions.closeSelector = triggerOptions.closeSelector || '[data-toggle-close]';
        triggerOptions.activeClass = triggerOptions.activeClass || 'toggle--active';
        triggerOptions.unsetSelf = triggerOptions.hasOwnProperty('unsetSelf') ? triggerOptions.unsetSelf : true;
        triggerOptions.allowEscClose = triggerOptions.hasOwnProperty('allowEscClose') ? triggerOptions.allowEscClose : true;

        return triggerOptions;
    }

    /**
     * Safe JSON parse prevents erroring out the plugin.
     */
    _safeJSONParse(JSONString) {
        try {
            return JSON.parse(JSONString);
        } catch (e) {
            return {};
        }
    }

    /**
     * Setup custom attributes for the toggle trigger and the target.
     * Default to setting a few aria-attributes to give more context to the browser.
     * @param  {[type]} trigger [description]
     * @return {[type]}         [description]
     */
    getCustomAttributes(trigger) {
        //`value`: [String | Array] If Array, index 0 is used when Toggle is unset, and index 1 is used when it's set.
        //`trigger`: [Boolean] Set to true to only attach the attribute to the trigger element.
        //`target`: [Boolean] Set to true to only attach the attribute to the target element.
        return {
            'aria-expanded': {
                value: ['false', 'true'],
                trigger: true
            },
            'aria-labelledby': {
                value: trigger.id,
                target: true
            },
            'aria-controls': {
                value: trigger.toggle.targetEl.id,
                trigger: true
            }
        };
    }

    /**
     * Loop through the `trigger.toggle.options.customAttributes` object and update the configured attributes.
     * This method is also called whenever the toggle is set or unset, in case the attributes should change.
     * @param  {[type]}  trigger  [description]
     * @param  {Boolean} isActive [description]
     * @return {[type]}           [description]
     */
    static updateAttributes(trigger, isActive) {
        let customAttributes = trigger.toggle.options.customAttributes;

        for (let attrKey in customAttributes) {
            if (customAttributes[attrKey]) {
                if (customAttributes[attrKey].trigger) {
                    Toggle.setAttributeValue(trigger, attrKey, customAttributes[attrKey], isActive);
                } else if (customAttributes[attrKey].target) {
                    Toggle.setAttributeValue(trigger.toggle.targetEl, attrKey, customAttributes[attrKey], isActive);
                } else {
                    Toggle.setAttributeValue(trigger, attrKey, customAttributes[attrKey], isActive);
                    Toggle.setAttributeValue(trigger.toggle.targetEl, attrKey, customAttributes[attrKey], isActive);
                }
            }
        }
    }

    /**
     * Updates a single Toggle element with the custom attributes provided in `attrName` and `attrObject`
     * Set the `isActive` argument to TRUE to swap the attribute value when `attrObject.value` is an Array.
     */
    static setAttributeValue(el, attrName, attrObject, isActive) {
        let value = typeof attrObject.value === 'string' ? attrObject.value : (isActive ? attrObject.value[1] : attrObject.value[0]);

        el.setAttribute(attrName, value);
    }

    /**
     * [_getParent] Gets and returns the trigger's parent. If no parent selector is set with data-parent it will default to parentNode
     * @param  {[object]} trigger [the target trigger]
     * @return {[object]}         [trigger's target parent]
     */
    _getParent(trigger) {
        return trigger.closest(trigger.toggle.options.parent) || document.querySelector(trigger.toggle.options.parent) || trigger.parentNode;
    }

    /**
     * [_getTarget] Gets and returns the trigger's content. If there are more than one matching content
     * the method will return the trigger's parent content.
     * @param  {[object]} trigger       [the target trigger]
     * @return {[object]}               [the targeted content]
     */
    _getTarget(trigger) {
        let targetSelector = trigger.toggle.options.target,
            targetEl = document.querySelectorAll(targetSelector);

        return targetEl.length > 1 ? trigger.toggle.parentEl.querySelector(targetSelector) : targetEl[0];
    }

    /**
     * Returns an optional focus target when triggering a Toggle.
     * This is useful for ADA / ARIA flows.
     */
    _getTargetFocus(trigger) {
        let targetFocus = trigger.toggle.options.targetFocus,
            isSelector = typeof targetFocus === 'string';

        return isSelector ? trigger.toggle.targetEl.querySelector(targetFocus) : (targetFocus ? trigger.toggle.targetEl : null);
    }

    _setupCallbacks(trigger) {
        trigger.toggle.beforeUnset      = trigger.toggle.options.beforeUnset    || function() { return true; };
        trigger.toggle.afterUnset       = trigger.toggle.options.afterUnset     || function() { return true; };
        trigger.toggle.beforeUnsetAll   = trigger.toggle.options.beforeUnsetAll || function() { return true; };
        trigger.toggle.beforeSet        = trigger.toggle.options.beforeSet      || function() { return true; };
        trigger.toggle.afterSet         = trigger.toggle.options.afterSet       || function() { return true; };
    }

    _setupMethods(trigger) {
        trigger.toggle.toggle   = Toggle.toggle.bind(this, trigger);
        trigger.toggle.set      = Toggle.set.bind(this, trigger);
        trigger.toggle.unset    = Toggle.unset.bind(this, trigger);
    }

    /**
     * Sets up event handlers for each trigger.
     * Uses the string stored on the 'trigger.toggle.options.event' property.
     * @param {[type]} trigger [the trigger HTML element]
     */
    _setupHandlers(trigger) {
        let evtType = (trigger.toggle.options.event || 'click').split(' ');

        evtType.forEach(function(currentEvt) {
            trigger.addEventListener(currentEvt, Toggle.toggleEventHandler);
        }.bind(this));
    }

    static toggleEventHandler(evt) {
        const isTouch = evt.type.indexOf('touch') !== -1;

        if (this.nodeName === 'A' || isTouch) {
            evt.preventDefault();
        }

        Toggle.toggle(this, evt);

        if (isTouch) {
            evt.stopImmediatePropagation();
        }
    }

    /**
     * [toggle] determines wether it should display or hide the content.
     * Gets the current active triggers and removes their active classes.
     * @param  {[object]} trigger [trigger which has the target content and parent]
     */
    static toggle(trigger, evt) {
        let evtType = evt ? evt.type : '';

        if (trigger.classList.contains(trigger.toggle.options.activeClass)) {
            if (trigger.toggle.options.unsetSelf && evtType !== 'mouseenter') {
                Toggle.unset(trigger, false);
            }
        } else {
            Toggle.set(trigger, evt, evtType);
        }
    }

    /**
     * [unset] hides the target content and removes events from the body
     * @param  {[object]} trigger
     * @param {Boolean} [focusTrigger] Wether or not to set focus on the trigger after the Toggle is unset.
     */
    static unset(trigger, focusTrigger) {
        if (trigger.classList.contains(trigger.toggle.options.activeClass) && trigger.toggle.beforeUnset(trigger)) {
            trigger.classList.remove(trigger.toggle.options.activeClass);
            trigger.toggle.parentEl.classList.remove(trigger.toggle.options.activeClass);
            trigger.toggle.targetEl.classList.remove(trigger.toggle.options.activeClass);

            trigger.toggle.targetEl.removeEventListener('click', Toggle.closeElHandler);

            trigger.toggle.afterUnset(trigger);

            trigger.toggle.isSet = false;
            //Remove the currently active trigger from this targetEl.
            trigger.toggle.targetEl.currentTrigger = null;

            Toggle.updateAttributes(trigger);

            if (focusTrigger) {
                trigger.focus();
            }
        }
    }

    /**
     * [set]
     * [beforeSet, afterSet, beforeUnsetAll] are fired here
     *
     * @param  {[type]} trigger [description]
     * @param  {[type]} evtType [description]
     */
    static set(trigger, evt, evtType) {
        let triggerEvt = evtType || '';

        if (trigger.toggle.beforeSet(trigger, evt)) {
            if (trigger.toggle.beforeUnsetAll(trigger)) {
                Toggle.unsetAll(trigger, trigger.toggle.options.siblingSelector);
            }

            trigger.classList.add(trigger.toggle.options.activeClass);
            trigger.toggle.parentEl.classList.add(trigger.toggle.options.activeClass);
            trigger.toggle.targetEl.classList.add(trigger.toggle.options.activeClass);

            trigger.toggle.isSet = true;
            //Set the currently active trigger for this targetEl.
            trigger.toggle.targetEl.currentTrigger = trigger;

            Toggle.updateAttributes(trigger, true);

            if (trigger.toggle.targetFocusEl) {
                forceFocus(trigger.toggle.targetFocusEl);
            }

            //If 'options.persist' is false, attach an event listener to the body to unset the trigger.
            if (!trigger.toggle.options.persist) {
                let bodyEvtType = triggerEvt.indexOf('touch') >= 0 ? triggerEvt : 'click',
                    blurCloseHandler = function(evt) {
                        // Ugly, but it works. The reason we check for parentEl AND targetEl is
                        // cause sometimes the parentEl does not contain the targetEl, but only the trigger
                        if (!trigger.toggle.targetEl.contains(evt.target) && !trigger.toggle.parentEl.contains(evt.target) && evt.target !== trigger) {
                            this.removeEventListener(bodyEvtType, blurCloseHandler, true);

                            Toggle.unset(trigger, false);
                        }
                    };

                document.body.addEventListener(bodyEvtType, blurCloseHandler, true);

                if (trigger.toggle.options.allowEscClose) {
                    let escCloseHandler = function(evt) {
                        if (evt.keyCode === 27) {
                            this.removeEventListener('keydown', escCloseHandler);

                            Toggle.unset(trigger, true);
                        }
                    };

                    document.addEventListener('keydown', escCloseHandler);
                }
            }

            //Hide content on hover out
            if (trigger.toggle.options.unsetOnHoverOut) {
                let mouseLeaveHandler = function() {
                    this.removeEventListener('mouseleave', mouseLeaveHandler);
                    Toggle.unset(trigger, true);
                };

                trigger.toggle.parentEl.addEventListener('mouseleave', mouseLeaveHandler);
            }

            //Toggles the content off after 'timeout' has ellapsed.
            //Need to add option to reset timer when cursor is on trigger or its components
            if (trigger.toggle.options.timeout) {
                window.setTimeout(Toggle.unset.bind(this, trigger, false), trigger.toggle.options.timeout);
            }

            //Trap focus within the target element.
            if (trigger.toggle.options.focusTrap) {
                focusTrap(trigger.toggle.targetEl);
            }

            trigger.toggle.targetEl.addEventListener('click', Toggle.closeElHandler);

            trigger.toggle.afterSet(trigger);
        }
    }

    static closeElHandler(evt) {
        let targetCloseEl = evt.target.closest(this.currentTrigger.toggle.options.closeSelector),
            targetTriggerSelector = targetCloseEl && targetCloseEl.getAttribute('data-toggle-close') ? targetCloseEl.getAttribute('data-toggle-close') : null;

        if (targetCloseEl && (this.currentTrigger.matches(targetTriggerSelector) || !targetTriggerSelector)) {
            Toggle.unset(this.currentTrigger, true);
        }
    }

    /**
     * Unsets all active items, unless the item has the 'persistent' option set to true. 
     * If in addition they have a 'siblingSelector' set, the elements matching said class
     * will be unset when a trigger with the same 'siblingSelector' is actioned on.
     */
    static unsetAll(refTrigger) {
        const
            activeClass = refTrigger.toggle.options.activeClass,
            siblingSelector = refTrigger.toggle.options.siblingSelector,
            skipSelector = refTrigger.toggle.options.skipSelector,
            activeTriggers = document.querySelectorAll('.' + activeClass);

        [].forEach.call(activeTriggers, function(trigger) {
            if (trigger.toggle && !trigger.matches(skipSelector) && (!trigger.toggle.options.persist || trigger.matches(siblingSelector))) {
                Toggle.unset(trigger, false);
            }
        });
    }
}
