# Event Horizon
Where we're going, we won't need eyes to see...

[![Vue 2.x](https://img.shields.io/badge/Vue-2.x-brightgreen.svg)](https://vuejs.org/v2/guide/)
[![npm](https://img.shields.io/npm/v/vue-event-horizon.svg)](https://www.npmjs.com/package/vue-event-horizon)
[![npm-downloads](https://img.shields.io/npm/dm/vue-event-horizon.svg)](https://www.npmjs.com/package/vue-event-horizon)
[![license](https://img.shields.io/github/license/mashape/apistatus.svg)](https://github.com/rigor789/vue-scrollto/blob/master/LICENSE)

## Project setup
In your project root
```jsx
import Vue from "vue";
import EventHorizon from "vue-event-horizon";
Vue.use(EventHorizon)
```

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
<div class="trigger-0 trigger-25 trigger-50 trigger-75 trigger-100"/>
```

Parallax adds transforms

```jsx
<div vue-event-horizon:parallax="{x: {from: 0, to: 2, at: 1}}" />
<div style="transform: translateX(0.5px)"  />
```