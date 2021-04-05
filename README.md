# Event Horizon
Where we're going, we won't need eyes to see...

## Project setup
Add as a directive / plugin

## Usage
```jsx
<div vue-event-horizon:trigger />
<div vue-event-horizon:trigger.once />
<div vue-event-horizon:trigger="(el, is_visible) => onVisibilityChange(el, is_visible)" />
<div vue-event-horizon:parallax="{x: {from: 0, to: 2, at: 1}}" />
<div vue-event-horizon:parallax="{
  x: {from: 0, to: 2, at: 1}, 
  y: {from: 0, to: 3}, 
  callback: (el, is_visible) => onVisibilityChange(el, is_visible)}
" />
```

Trigger adds classes

```jsx
<div vue-event-horizon:trigger />
...
<div class="trigger-0 trigger-25 trigger-50 trigger-75"/>
```

Parallax adds transforms

```jsx
<div vue-event-horizon:parallax="{x: {from: 0, to: 2, at: 1}}" />
...
<div style="transform: translateX(0.5px)"  />
```