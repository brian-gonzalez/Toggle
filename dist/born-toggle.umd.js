(function (global, factory) {
  if (typeof define === "function" && define.amd) {
    define(["exports", "@borngroup/born-utilities"], factory);
  } else if (typeof exports !== "undefined") {
    factory(exports, require("@borngroup/born-utilities"));
  } else {
    var mod = {
      exports: {}
    };
    factory(mod.exports, global.bornUtilities);
    global.bornToggle = mod.exports;
  }
})(typeof globalThis !== "undefined" ? globalThis : typeof self !== "undefined" ? self : this, function (_exports, _bornUtilities) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;

  function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

  function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

  function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

  var Toggle = /*#__PURE__*/function () {
    function Toggle(options) {
      _classCallCheck(this, Toggle);

      this.options = options || {}; //Setup the data attribute to use for the triggers.

      this.options.dataAttribute = this.options.dataAttribute || 'data-toggle';

      _bornUtilities.callbackOnElements.call(this, this.options.triggers, this._setupTrigger); //Make sure the document only has this event attached once.


      document.removeEventListener('keydown', this._toggleOnReturn);
      document.addEventListener('keydown', this._toggleOnReturn);
    } //Adds event listener to trigger toggle on keyboard ENTER/RETURN, in case trigger is not focusable.


    _createClass(Toggle, [{
      key: "_toggleOnReturn",
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
      key: "_setupTrigger",
      value: function _setupTrigger(trigger) {
        var triggerID = trigger.id || this.generateCustomToggleID(trigger);
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
        trigger.toggle.targetEl.id = trigger.toggle.targetEl.id || "".concat(triggerID, "--target");
        trigger.toggle.options.customAttributes = (0, _bornUtilities.objectAssign)(this.getCustomAttributes(trigger), trigger.toggle.options.customAttributes);

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
            if ((0, _bornUtilities.hasURLParameter)(trigger.toggle.options.auto)) {
              Toggle.set(trigger);
            } else if (this.options.breakpoints) {
              //Else if this.options.breakpoints is provided, attempt to find the matched trigger.toggle.options.auto breakpoint name.
              var matchedBreakpoint = this.options.breakpoints[trigger.toggle.options.auto]; //Check if the matched breakpoint falls within the provided boundaries.

              if (matchedBreakpoint && (!matchedBreakpoint.min || document.body.offsetWidth >= matchedBreakpoint.min) && (!matchedBreakpoint.max || document.body.offsetWidth <= matchedBreakpoint.max)) {
                Toggle.set(trigger);
              } else {
                Toggle.unset(trigger, false);
              }
            }
          } else {
            Toggle.set(trigger);
          }
        } //Removes the data-* attribute to enable easy re-initialization if needed.


        trigger.removeAttribute(this.options.dataAttribute);
      }
      /**
       * Generate a random toggleID string to be used in the trigger and target elements in case they don't have an ID.
       * @param  {[type]} trigger [description]
       * @return {[type]}         [description]
       */

    }, {
      key: "generateCustomToggleID",
      value: function generateCustomToggleID(trigger) {
        var randomString = Math.floor(new Date().getTime() * Math.random()).toString().substr(0, 4);
        return "toggleID-".concat(randomString);
      }
      /**
       * Gets the trigger's settings from its data-* attribute.
       * Attempts to add missing properties if needed.
       * @param  {[Node]} trigger: HTML element which functions as the toggle.
       */

    }, {
      key: "_getOptions",
      value: function _getOptions(trigger) {
        var triggerOptionsString = trigger.getAttribute(this.options.dataAttribute),
            triggerOptions = (0, _bornUtilities.objectAssign)({}, this.options, triggerOptionsString ? this._safeJSONParse(triggerOptionsString) : {});
        triggerOptions.closeSelector = triggerOptions.closeSelector || '[data-toggle-close]';
        triggerOptions.activeClass = triggerOptions.activeClass || 'toggle--active';
        triggerOptions.unsetSelf = triggerOptions.hasOwnProperty('unsetSelf') ? triggerOptions.unsetSelf : true;
        triggerOptions.unsetOthers = triggerOptions.hasOwnProperty('unsetOthers') ? triggerOptions.unsetOthers : true;
        triggerOptions.allowEscClose = triggerOptions.hasOwnProperty('allowEscClose') ? triggerOptions.allowEscClose : true;
        triggerOptions.allowSet = triggerOptions.hasOwnProperty('allowSet') ? triggerOptions.allowSet : true;
        triggerOptions.allowUnset = triggerOptions.hasOwnProperty('allowUnset') ? triggerOptions.allowUnset : true;
        return triggerOptions;
      }
      /**
       * Safe JSON parse prevents erroring out the plugin.
       */

    }, {
      key: "_safeJSONParse",
      value: function _safeJSONParse(JSONString) {
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

    }, {
      key: "getCustomAttributes",
      value: function getCustomAttributes(trigger) {
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

    }, {
      key: "_getParent",

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
      key: "_getTarget",
      value: function _getTarget(trigger) {
        var targetSelector = trigger.toggle.options.target,
            targetEl = document.querySelectorAll(targetSelector);
        return targetEl.length > 1 ? trigger.toggle.parentEl.querySelector(targetSelector) : targetEl[0];
      }
      /**
       * Returns an optional focus target when triggering a Toggle.
       * This is useful for ADA / ARIA flows.
       */

    }, {
      key: "_getTargetFocus",
      value: function _getTargetFocus(trigger) {
        var targetFocus = trigger.toggle.options.targetFocus,
            isSelector = typeof targetFocus === 'string';
        return isSelector ? trigger.toggle.targetEl.querySelector(targetFocus) : targetFocus ? trigger.toggle.targetEl : null;
      }
    }, {
      key: "_setupCallbacks",
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
      key: "_setupMethods",
      value: function _setupMethods(trigger) {
        trigger.toggle.toggle = Toggle.toggle.bind(this, trigger);
        trigger.toggle.persist = Toggle.persist.bind(this, trigger);
        trigger.toggle.set = Toggle.set.bind(this, trigger);
        trigger.toggle.unset = Toggle.unset.bind(this, trigger);
        trigger.toggle.unsetOnEscKey = Toggle.unsetOnEscKey.bind(this, trigger);
        trigger.toggle.unsetOnTimeout = Toggle.unsetOnTimeout.bind(this, trigger);
        trigger.toggle.unsetOnClickOut = Toggle.unsetOnClickOut.bind(this, trigger);
        trigger.toggle.unsetOnMouseLeave = Toggle.unsetOnMouseLeave.bind(this, trigger);
        trigger.addEventListener('toggle:toggle', Toggle.toggle.bind(this, trigger));
        trigger.addEventListener('toggle:set', Toggle.set.bind(this, trigger));
        trigger.addEventListener('toggle:unset', Toggle.unset.bind(this, trigger));
      }
      /**
       * Sets up event handlers for each trigger.
       * Uses the string stored on the 'trigger.toggle.options.event' property.
       * @param {[type]} trigger [the trigger HTML element]
       */

    }, {
      key: "_setupHandlers",
      value: function _setupHandlers(trigger) {
        var evtType = (trigger.toggle.options.event || 'click').split(' ');
        evtType.forEach(function (currentEvt) {
          trigger.addEventListener(currentEvt, Toggle.toggleEventHandler);
        }.bind(this)); //Create a scope to store any "Temporaty Handlers".
        //These are handlers that are only attached at certain times, i.e. after Toggle is `set()`, and removed after the event is fulfilled.

        trigger.toggle.tempHandlers = trigger.toggle.tempHandlers || {};
      }
    }], [{
      key: "updateAttributes",
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
      key: "setAttributeValue",
      value: function setAttributeValue(el, attrName, attrObject, isActive) {
        var value = typeof attrObject.value === 'string' ? attrObject.value : isActive ? attrObject.value[1] : attrObject.value[0];
        el.setAttribute(attrName, value);
      }
    }, {
      key: "toggleEventHandler",
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
      key: "toggle",
      value: function toggle(trigger, evt) {
        var evtType = evt ? evt.type : '';

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

    }, {
      key: "unset",
      value: function unset(trigger, focusTrigger) {
        Toggle.publishToggleEvents(trigger, 'beforeUnset');

        if (trigger.classList.contains(trigger.toggle.options.activeClass) && trigger.toggle.beforeUnset(trigger) && trigger.toggle.options.allowUnset) {
          trigger.classList.remove(trigger.toggle.options.activeClass);
          trigger.toggle.parentEl.classList.remove(trigger.toggle.options.activeClass);
          trigger.toggle.targetEl.classList.remove(trigger.toggle.options.activeClass);
          trigger.toggle.targetEl.removeEventListener('click', Toggle.unsetOnTriggerHandler);
          trigger.toggle.afterUnset(trigger);
          Toggle.publishToggleEvents(trigger, 'afterUnset');
          trigger.toggle.isSet = false; //Remove the currently active trigger from this targetEl.

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
       */

    }, {
      key: "set",
      value: function set(trigger, evt) {
        Toggle.publishToggleEvents(trigger, 'beforeSet');

        if (trigger.toggle.beforeSet(trigger, evt) && trigger.toggle.options.allowSet) {
          Toggle.publishToggleEvents(trigger, 'beforeUnsetAll');

          if (trigger.toggle.beforeUnsetAll(trigger) && trigger.toggle.options.unsetOthers) {
            Toggle.unsetAll(trigger);
          }

          trigger.classList.add(trigger.toggle.options.activeClass);
          trigger.toggle.parentEl.classList.add(trigger.toggle.options.activeClass);
          trigger.toggle.targetEl.classList.add(trigger.toggle.options.activeClass);
          trigger.toggle.isSet = true; //Set the currently active trigger for this targetEl.

          trigger.toggle.targetEl.currentTrigger = trigger;
          Toggle.updateAttributes(trigger, true);

          if (trigger.toggle.targetFocusEl) {
            (0, _bornUtilities.forceFocus)(trigger.toggle.targetFocusEl);
          } //If 'options.persist' is false, attach an event listener to the body to unset the trigger.


          if (!trigger.toggle.options.persist) {
            Toggle.unsetOnClickOut(trigger, !trigger.toggle.options.persist);
            Toggle.unsetOnEscKey(trigger, trigger.toggle.options.allowEscClose);
            Toggle.unsetOnMouseLeave(trigger, trigger.toggle.options.unsetOnHoverOut);
          }

          Toggle.unsetOnTimeout(trigger, trigger.toggle.options.timeout); //Trap focus within the target element.

          if (trigger.toggle.options.focusTrap) {
            (0, _bornUtilities.focusTrap)(trigger.toggle.targetEl);
          }

          trigger.toggle.targetEl.addEventListener('click', Toggle.unsetOnTriggerHandler);
          Toggle.publishToggleEvents(trigger, 'afterSet');
          trigger.toggle.afterSet(trigger);
        }
      }
    }, {
      key: "persist",
      value: function persist(trigger, isEnabled) {
        Toggle.unsetOnClickOut(trigger, !isEnabled);
        Toggle.unsetOnEscKey(trigger, !isEnabled);
        Toggle.unsetOnMouseLeave(trigger, !isEnabled);
      }
      /**
       * Event handler for interactions on a "close" element within a Toggle parent container.
       * Unsets Toggle when clicking on or interacting with any element that has a "data-toggle-close" attribute.
       */

    }, {
      key: "unsetOnTriggerHandler",
      value: function unsetOnTriggerHandler(evt) {
        var targetCloseEl = evt.target.closest(this.currentTrigger.toggle.options.closeSelector),
            targetTriggerSelector = targetCloseEl && targetCloseEl.getAttribute('data-toggle-close') ? targetCloseEl.getAttribute('data-toggle-close') : null;

        if (targetCloseEl && (this.currentTrigger.matches(targetTriggerSelector) || !targetTriggerSelector)) {
          Toggle.unset(this.currentTrigger, true);
        }
      }
      /**
       * Automatically Unsets Toggle after 'timeout' has ellapsed.
       * TODO: Add option to reset timer when cursor is on trigger or its components
       */

    }, {
      key: "unsetOnTimeout",
      value: function unsetOnTimeout(trigger, timeout) {
        if (timeout) {
          window.setTimeout(Toggle.unset.bind(this, trigger, false), timeout);
        }
      }
      /**
       * Prevent Toggle from closing a triggered element when clicking outside of its parent.
       * @param  {[type]}  trigger   [description]
       * @param  {Boolean} isEnabled [description]
       */

    }, {
      key: "unsetOnClickOut",
      value: function unsetOnClickOut(trigger, isEnabled) {
        //When enabled, the body should have an event to unset the Toggle.
        if (isEnabled) {
          //This next line was used to detect if the event was touch-related, but I don't think it's necessary anymore.
          // let bodyEvtType = evtType.indexOf('touch') >= 0 ? evtType : 'click';
          trigger.toggle.tempHandlers.unsetOnClickOut = trigger.toggle.tempHandlers.unsetOnClickOut || function (evt) {
            // Ugly, but it works. The reason we check for parentEl AND targetEl is
            // cause sometimes the parentEl does not contain the targetEl, but only the trigger
            if (!trigger.toggle.targetEl.contains(evt.target) && !trigger.toggle.parentEl.contains(evt.target) && evt.target !== trigger) {
              this.removeEventListener('click', trigger.toggle.tempHandlers.unsetOnClickOut, true);
              Toggle.unset(trigger, false);
            }
          };

          document.body.addEventListener('click', trigger.toggle.tempHandlers.unsetOnClickOut, true);
        } else {
          document.body.removeEventListener('click', trigger.toggle.tempHandlers.unsetOnClickOut, true);
        }
      }
      /**
       * Unsets Toggle when hitting the keyboard's ESC key.
       * @param  {[type]}  trigger   [description]
       * @param  {Boolean} isEnabled [description]
       */

    }, {
      key: "unsetOnEscKey",
      value: function unsetOnEscKey(trigger, isEnabled) {
        if (isEnabled) {
          trigger.toggle.tempHandlers.unsetOnEscKey = trigger.toggle.tempHandlers.unsetOnEscKey || function (evt) {
            if (evt.keyCode === 27) {
              this.removeEventListener('keydown', trigger.toggle.tempHandlers.unsetOnEscKey);
              Toggle.unset(trigger, true);
            }
          };

          document.addEventListener('keydown', trigger.toggle.tempHandlers.unsetOnEscKey);
        } else {
          document.removeEventListener('keydown', trigger.toggle.tempHandlers.unsetOnEscKey);
        }
      }
      /**
       * Unsets Toggle when hovering out of the its parent container.
       * @param  {[type]}  trigger   [description]
       * @param  {Boolean} isEnabled [description]
       */

    }, {
      key: "unsetOnMouseLeave",
      value: function unsetOnMouseLeave(trigger, isEnabled) {
        if (isEnabled) {
          trigger.toggle.tempHandlers.unsetOnMouseLeave = trigger.toggle.tempHandlers.unsetOnMouseLeave || function () {
            this.removeEventListener('mouseleave', trigger.toggle.tempHandlers.unsetOnMouseLeave);
            Toggle.unset(trigger, true);
          };

          trigger.toggle.parentEl.addEventListener('mouseleave', trigger.toggle.tempHandlers.unsetOnMouseLeave);
        } else {
          trigger.toggle.parentEl.removeEventListener('mouseleave', trigger.toggle.tempHandlers.unsetOnMouseLeave);
        }
      }
      /**
       * Unsets all active Toggles, unless a Toggle has its 'persist' option set to true.
       * If a Toggle with a set 'siblingSelector' is triggered, any other matching Toggles will be unset.
       * This is specially useful to create tabbed interfaces.
       */

    }, {
      key: "unsetAll",
      value: function unsetAll(trigger) {
        var activeClass = trigger.toggle.options.activeClass,
            siblingSelector = trigger.toggle.options.siblingSelector,
            skipSelector = trigger.toggle.options.skipSelector,
            activeTriggers = document.querySelectorAll('.' + activeClass);
        [].forEach.call(activeTriggers, function (currentTrigger) {
          if (currentTrigger.toggle && !currentTrigger.matches(skipSelector) && (!currentTrigger.toggle.options.persist || currentTrigger.matches(siblingSelector))) {
            Toggle.unset(currentTrigger, false);
          }
        });
      }
      /**
       * Return a standard event data object which is used by all of the fired events in the plugin.
       * @param  {[type]} trigger        [description]
       * @param  {Object} additionalData [description]
       */

    }, {
      key: "getEventData",
      value: function getEventData(trigger) {
        var additionalData = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
        return (0, _bornUtilities.objectAssign)({
          trigger: trigger,
          targetEl: trigger.toggle.targetEl,
          parentEl: trigger.toggle.parentEl,
          toggleOptions: trigger.toggle.options
        }, additionalData);
      }
      /**
       * Publishes Toggle events for both pre-set events (afterSet, beforeSet, afterUnset, etc.) and also custom events configured at initialization time.
       * Thse events can be listened to using Node.addEventListener();
       * @param  {[type]} eventType [description]
       */

    }, {
      key: "publishToggleEvents",
      value: function publishToggleEvents(trigger, eventType) {
        //Publish a pre-set event using a naming format of `toggle:<eventName>`, for example: "toggle:afterSet".
        Toggle.publishEvent('toggle', eventType, trigger, Toggle.getEventData(trigger)); //If a custom event was provided, fire it now.
        //These events match the pre-set event types, however a custom event name can be assed instead, as well as custom data.

        if (trigger.toggle.options.customEvents && trigger.toggle.options.customEvents[eventType]) {
          Toggle.publishEvent(null, trigger.toggle.options.customEvents[eventType].name, trigger, Toggle.getEventData(trigger, trigger.toggle.options.customEvents[eventType].data));
        }
      }
      /**
       * Publish an event at the specific target element scope
       * for other modules to subscribe.
       * The subscribe method can be a standard
       * .addEventListener('moduleName.eventName') method
       *
       * @param {String} moduleName
       * @param {String} eventName
       * @param {HTMLElement} target
       */

    }, {
      key: "publishEvent",
      value: function publishEvent(moduleName, eventName, target, detail) {
        var event,
            params = {
          bubbles: true,
          cancelable: true,
          detail: detail
        },
            eventString = moduleName && eventName ? "".concat(moduleName, ":").concat(eventName) : moduleName || eventName; // IE >= 9, CustomEvent() constructor does not exist

        if (typeof window.CustomEvent !== 'function') {
          event = document.createEvent('CustomEvent');
          event.initCustomEvent(eventString, params.bubbles, params.cancelable, null);
        } else {
          event = new CustomEvent(eventString, params);
        }

        target.dispatchEvent(event);
      }
    }]);

    return Toggle;
  }();

  _exports.default = Toggle;
});
