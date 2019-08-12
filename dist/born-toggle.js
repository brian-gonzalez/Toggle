'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _bornUtilities = require('@borngroup/born-utilities');

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Toggle = function () {
    function Toggle(options) {
        _classCallCheck(this, Toggle);

        this.options = options || {};

        //Setup the data attribute to use for the triggers.
        this.options.dataAttribute = this.options.dataAttribute || 'data-toggle';

        _bornUtilities.callbackOnElements.call(this, this.options.triggers, this._setupTrigger);

        //Make sure the document only has this event attached once.
        document.removeEventListener('keydown', this._toggleOnReturn);
        document.addEventListener('keydown', this._toggleOnReturn);
    }

    //Adds event listener to trigger toggle on keyboard ENTER/RETURN, in case trigger is not focusable.


    _createClass(Toggle, [{
        key: '_toggleOnReturn',
        value: function _toggleOnReturn(evt) {
            var isNotFocusable = this.activeElement !== document.body && this.activeElement.nodeName !== 'BUTTON';

            if (this.activeElement.toggle && evt.keyCode === 13 && isNotFocusable) {
                Toggle.toggleEventHandler.call(this.activeElement, evt);
            }
        }

        /**
         * Sets up individual 'trigger' functionality.
         */

    }, {
        key: '_setupTrigger',
        value: function _setupTrigger(trigger) {

            trigger.toggle = trigger.toggle || {};

            trigger.toggle.options = this._getOptions(trigger);
            trigger.toggle.parentEl = this._getParent(trigger);
            trigger.toggle.targetEl = this._getTarget(trigger);

            if (!trigger.toggle.targetEl) {
                console.warn('No target provided or element not found for: ', trigger);

                return false;
            }

            trigger.toggle.targetEl.toggleTrigger = trigger;

            this._setupCallbacks(trigger);
            this._setupMethods(trigger);
            this._setupHandlers(trigger);

            this._setupCustomAttributes(trigger);

            Toggle.updateAttributes(trigger);

            if (trigger.toggle.options.auto) {
                if (!isNaN(trigger.toggle.options.auto)) {
                    //if the 'auto' property is set to a Number, use that as milliseconds to trigger the toggle when ellapsed.
                    window.setTimeout(Toggle.set.bind(this, trigger), trigger.toggle.options.auto);
                } else if (typeof trigger.toggle.options.auto === 'string') {
                    //if the 'auto' property is set to a String that matches a URL parameter or hash, fire the toggle.
                    if ((0, _bornUtilities.hasURLParameter)(trigger.toggle.options.auto)) {
                        Toggle.set(trigger);
                    } else if (this.options.breakpoints) {
                        //Else if this.options.breakpoints is provided, attempt to find the matched trigger.toggle.options.auto breakpoint name.
                        var matchedBreakpoint = this.options.breakpoints[trigger.toggle.options.auto];

                        //Check if the matched breakpoint falls within the provided boundaries.
                        if (matchedBreakpoint && (!matchedBreakpoint.min || document.body.offsetWidth >= matchedBreakpoint.min) && (!matchedBreakpoint.max || document.body.offsetWidth <= matchedBreakpoint.max)) {
                            Toggle.set(trigger);
                        } else {
                            Toggle.unset(trigger);
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
         * Gets the trigger's settings from its data-* attribute.
         * Attempts to add missing properties if needed.
         * @param  {[Node]} trigger: HTML element which functions as the toggle.
         */

    }, {
        key: '_getOptions',
        value: function _getOptions(trigger) {
            var triggerOptions = {};

            triggerOptions = trigger.getAttribute(this.options.dataAttribute) ? JSON.parse(trigger.getAttribute(this.options.dataAttribute)) : {};

            //Merges data-* options and properties passed on the 'this.options' object.
            for (var option in this.options) {
                //Skip the 'triggers' and 'dataAttribute' properties cause we don't need 'em.
                if (option === 'triggers' || option === 'dataAttribute') {
                    continue;
                }

                //If the data-* attribute didn't have an option that was set on the 'this.options' object,
                //add it to the triggerOptions object.
                if (!triggerOptions.hasOwnProperty(option)) {
                    triggerOptions[option] = this.options[option];
                }
            }

            triggerOptions.closeSelector = triggerOptions.closeSelector || '[data-toggle-close]';
            triggerOptions.activeClass = triggerOptions.activeClass || 'toggle--active';
            triggerOptions.unsetSelf = triggerOptions.hasOwnProperty('unsetSelf') ? triggerOptions.unsetSelf : true;

            return triggerOptions;
        }

        /**
         * Setup custom attributes for the toggle trigger and the target.
         * Default to setting a few aria-attributes to give more context to the browser.
         * @param  {[type]} trigger [description]
         * @return {[type]}         [description]
         */

    }, {
        key: '_setupCustomAttributes',
        value: function _setupCustomAttributes(trigger) {
            var triggerID = trigger.id || Toggle.generateCustomToggleID(trigger),
                targetID = trigger.toggle.targetEl.id || triggerID + '--target',

            //`value`: [String | Array] If Array, index 0 is used when Toggle is unset, and index 1 is used when it's set.
            //`trigger`: [Boolean] Set to true to only attach the attribute to the trigger element.
            //`target`: [Boolean] Set to true to only attach the attribute to the target element.
            defaultAttributes = {
                'aria-expanded': {
                    value: ['false', 'true']
                },
                'aria-describedby': {
                    value: triggerID,
                    target: true
                },
                'aria-controls': {
                    value: targetID,
                    trigger: true
                },
                'aria-haspopup': {
                    value: 'true',
                    trigger: true
                }
            };

            trigger.id = triggerID;
            trigger.toggle.targetEl.id = targetID;

            trigger.toggle.options.customAttributes = (0, _bornUtilities.objectAssign)(defaultAttributes, trigger.toggle.options.customAttributes);
        }

        /**
         * Generate a random toggleID string to be used in the trigger and target elements in case they don't have an ID.
         * @param  {[type]} trigger [description]
         * @return {[type]}         [description]
         */

    }, {
        key: '_getParent',


        /**
         * [_getParent] Gets and returns the trigger's parent. If no parent selector is set with data-parent it will default to parentNode
         * @param  {[object]} trigger [the target trigger]
         * @return {[object]}         [trigger's target parent]
         */
        value: function _getParent(trigger) {
            return trigger.closest(trigger.toggle.options.parent) || document.querySelector(trigger.toggle.options.parent) || trigger.parentNode;
        }

        /**
         * [_getTarget] Gets and returns the trigger's content. If there are more than one matching content
         * the method will return the trigger's parent content.
         * @param  {[object]} trigger       [the target trigger]
         * @return {[object]}               [the targeted content]
         */

    }, {
        key: '_getTarget',
        value: function _getTarget(trigger) {
            var targetSelector = trigger.toggle.options.target,
                targetEl = document.querySelectorAll(targetSelector);

            return targetEl.length > 1 ? trigger.toggle.parentEl.querySelector(targetSelector) : targetEl[0];
        }
    }, {
        key: '_setupCallbacks',
        value: function _setupCallbacks(trigger) {
            trigger.toggle.beforeUnset = trigger.toggle.options.beforeUnset || function () {
                return true;
            };
            trigger.toggle.afterUnset = trigger.toggle.options.afterUnset || function () {
                return true;
            };
            trigger.toggle.beforeUnsetAll = trigger.toggle.options.beforeUnsetAll || function () {
                return true;
            };
            trigger.toggle.beforeSet = trigger.toggle.options.beforeSet || function () {
                return true;
            };
            trigger.toggle.afterSet = trigger.toggle.options.afterSet || function () {
                return true;
            };
        }
    }, {
        key: '_setupMethods',
        value: function _setupMethods(trigger) {
            trigger.toggle.toggle = Toggle.toggle.bind(this, trigger);
            trigger.toggle.set = Toggle.set.bind(this, trigger);
            trigger.toggle.unset = Toggle.unset.bind(this, trigger);
        }

        /**
         * Sets up event handlers for each trigger.
         * Uses the string stored on the 'trigger.toggle.options.event' property.
         * @param {[type]} trigger [the trigger HTML element]
         */

    }, {
        key: '_setupHandlers',
        value: function _setupHandlers(trigger) {
            var evtType = (trigger.toggle.options.event || 'click').split(' ');

            evtType.forEach(function (currentEvt) {
                trigger.addEventListener(currentEvt, Toggle.toggleEventHandler);
            }.bind(this));
        }
    }], [{
        key: 'generateCustomToggleID',
        value: function generateCustomToggleID(trigger) {
            var randomString = Math.floor(new Date().getTime() * Math.random()).toString().substr(0, 4);

            return 'toggleID-' + randomString;
        }

        /**
         * Loop through the `trigger.toggle.options.customAttributes` object and update the configured attributes.
         * This method is also called whenever the toggle is set or unset, in case the attributes should change.
         * @param  {[type]}  trigger  [description]
         * @param  {Boolean} isActive [description]
         * @return {[type]}           [description]
         */

    }, {
        key: 'updateAttributes',
        value: function updateAttributes(trigger, isActive) {
            var customAttributes = trigger.toggle.options.customAttributes;

            for (var attrKey in customAttributes) {
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

    }, {
        key: 'setAttributeValue',
        value: function setAttributeValue(el, attrName, attrObject, isActive) {
            var value = typeof attrObject.value === 'string' ? attrObject.value : isActive ? attrObject.value[1] : attrObject.value[0];

            el.setAttribute(attrName, value);
        }
    }, {
        key: 'toggleEventHandler',
        value: function toggleEventHandler(evt) {
            var isTouch = evt.type.indexOf('touch') !== -1;

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

    }, {
        key: 'toggle',
        value: function toggle(trigger, evt) {
            var evtType = evt ? evt.type : '';

            if (trigger.classList.contains(trigger.toggle.options.activeClass)) {
                if (trigger.toggle.options.unsetSelf && evtType !== 'mouseenter') {
                    Toggle.unset(trigger, evt);
                }
            } else {
                Toggle.set(trigger, evt, evtType);
            }
        }

        /**
         * [unset] hides the target content and removes events from the body
         * @param  {[object]} trigger
         */

    }, {
        key: 'unset',
        value: function unset(trigger) {
            if (trigger.classList.contains(trigger.toggle.options.activeClass) && trigger.toggle.beforeUnset(trigger)) {
                trigger.classList.remove(trigger.toggle.options.activeClass);
                trigger.toggle.parentEl.classList.remove(trigger.toggle.options.activeClass);
                trigger.toggle.targetEl.classList.remove(trigger.toggle.options.activeClass);

                trigger.toggle.targetEl.removeEventListener('click', Toggle.closeElCallback);

                trigger.toggle.afterUnset(trigger);

                trigger.toggle.isSet = false;

                Toggle.updateAttributes(trigger);
            }
        }

        /**
         * [set]
         * [beforeSet, afterSet, beforeUnsetAll] are fired here
         *
         * @param  {[type]} trigger [description]
         * @param  {[type]} evtType [description]
         */

    }, {
        key: 'set',
        value: function set(trigger, evt, evtType) {
            var triggerEvt = evtType || '';

            if (trigger.toggle.beforeSet(trigger, evt)) {
                if (trigger.toggle.beforeUnsetAll(trigger)) {
                    Toggle.unsetAll(trigger, trigger.toggle.options.siblingSelector);
                }

                trigger.classList.add(trigger.toggle.options.activeClass);
                trigger.toggle.parentEl.classList.add(trigger.toggle.options.activeClass);
                trigger.toggle.targetEl.classList.add(trigger.toggle.options.activeClass);

                trigger.toggle.isSet = true;

                Toggle.updateAttributes(trigger, true);

                //If 'options.persist' is false, attach an event listener to the body to unset the trigger.
                if (!trigger.toggle.options.persist) {
                    var bodyEvtType = triggerEvt.indexOf('touch') >= 0 ? triggerEvt : 'click',
                        blurCallback = function blurCallback(evt) {
                        // Ugly, but it works. The reason we check for parentEl AND targetEl is
                        // cause sometimes the parentEl does not contain the targetEl, but only the trigger
                        if (!trigger.toggle.targetEl.contains(evt.target) && !trigger.toggle.parentEl.contains(evt.target) && evt.target !== trigger) {
                            this.removeEventListener(bodyEvtType, blurCallback, true);
                            Toggle.unset(trigger);
                        }
                    };

                    document.body.addEventListener(bodyEvtType, blurCallback, true);
                }

                //Hide content on hover out
                if (trigger.toggle.options.unsetOnHoverOut) {
                    var mouseLeaveCallback = function mouseLeaveCallback() {
                        this.removeEventListener('mouseleave', mouseLeaveCallback);
                        Toggle.unset(trigger);
                    };

                    trigger.toggle.parentEl.addEventListener('mouseleave', mouseLeaveCallback);
                }

                //Toggles the content off after 'timeout' has ellapsed.
                //Need to add option to reset timer when cursor is on trigger or its components
                if (trigger.toggle.options.timeout) {
                    window.setTimeout(Toggle.unset.bind(this, trigger), trigger.toggle.options.timeout);
                }

                trigger.toggle.targetEl.addEventListener('click', Toggle.closeElCallback);

                trigger.toggle.afterSet(trigger);
            }
        }
    }, {
        key: 'closeElCallback',
        value: function closeElCallback(evt) {
            var targetCloseEl = evt.target.closest(this.toggleTrigger.toggle.options.closeSelector),
                targetTriggerSelector = targetCloseEl && targetCloseEl.getAttribute('data-toggle-close') ? targetCloseEl.getAttribute('data-toggle-close') : null;

            if (targetCloseEl && (this.toggleTrigger.matches(targetTriggerSelector) || !targetTriggerSelector)) {
                Toggle.unset(this.toggleTrigger);
            }
        }

        /**
         * Unsets all active items, unless the item has the 'persistent' option set to true. 
         * If in addition they have a 'siblingSelector' set, the elements matching said class
         * will be unset when a trigger with the same 'siblingSelector' is actioned on.
         */

    }, {
        key: 'unsetAll',
        value: function unsetAll(refTrigger) {
            var activeClass = refTrigger.toggle.options.activeClass,
                siblingSelector = refTrigger.toggle.options.siblingSelector,
                skipSelector = refTrigger.toggle.options.skipSelector,
                activeTriggers = document.querySelectorAll('.' + activeClass);

            [].forEach.call(activeTriggers, function (trigger) {
                if (trigger.toggle && !trigger.matches(skipSelector) && (!trigger.toggle.options.persist || trigger.matches(siblingSelector))) {
                    Toggle.unset(trigger);
                }
            });
        }
    }]);

    return Toggle;
}();

exports.default = Toggle;
