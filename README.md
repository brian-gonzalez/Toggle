

# Description
	
Adds the ability to toggle a class when an event is triggered, can be setup to look for a `data-toggle` attribute to hold the configurations for the trigger. Does not use jQuery.

## Options

|Property|Type|Default|Description|
|--|--|--|--|
|trigger / triggers| `Query String` `NodeList` `HTMLElement` | N/A |**REQUIRED**. Provide either a query selector, a NodeList, or an HTML element to use as the `Trigger`.
|target| `Query String` | N/A | **REQUIRED**. Query selector for the target element.
|activeClass| `String` | active--class | Custom class name.
|parent| `Query String` | Closest `parentNode` element of the `Trigger`. | Selector query for the parent element.
|dataAttribute|`String`|data-toggle|Attribute name to use instead of the default 'data-toggle' to hold specific settings for a `Trigger`.
|event|`String`|click| Space separated list of events a `Trigger` should listen to.
|auto| `Boolean`/`String`/`Number` (Milliseconds) |false|If set to `true`, Toggle will fire immediately after document ready. If set to a `Number` (milliseconds) value, Toggle will fire after `Number` has ellapsed. If set to a breakpoint name, Toggle will fire when the breakpoint is matched.
|persist|`Boolean`|false|When true, keeps the `Trigger` active after losing focus, clicking on the body, or toggling other triggers.
|siblingSelector|`Query String`|N/A|If `persist` is set to `true`, the `Trigger` will unset other triggers that match its `siblingSelector` value.
|skipSelector|`Query String`|N/A|If `persist` is set to `false`, setting a `Trigger` will cause all other triggers to unset. Specify a selector to skip matching triggers.
|unsetOnHoverOut|`Boolean`|false| Unsets the `Trigger` when hovering out.
|unsetSelf|`Boolean`|true|Enable or disable the `Trigger` from unsetting itself.
|timeout|Integer (milliseconds)|0|Unsets the `Trigger` after `timeout` milliseconds.


## Events

|Event|Arguments|Description
|--|--|--|
|beforeSet|`trigger`: the trigger HTML element.| Fires before the `Toggle.set()` method is triggered. Must return a truthy value, otherwise the `Toggle.set()` execution will be halted.
|afterSet|`trigger`: the trigger HTML element.|Runs after the `Toggle.set()` method is triggered.
|beforeUnsetAll|`trigger`: the trigger HTML element.|Runs inside the `Toggle.set()` method before unsetting all toggles to their default state. Return false on this callback to prevent unsetting other toggles and continue `Toggle.set()` execution.
|afterUnset|`trigger`: the trigger HTML element.|Runs after the `Toggle.unset()` method is triggered.


## Methods
	
**toggle()**: Set or unsets the toggle.

**set()**: Sets the toggle.

**unset()**: Unsets the toggle.

## Extras

[data-toggle-close]: An element with this attribute inside the toggle's target or parent will act as a close action for the active toggle.
