import Vue from "vue";
import { EventHorizon } from "../vue-event-horizon/index.js";
Vue.directive("event-horizon", EventHorizon);
// import EventHorizon from "./event-horizon.js";
// const eventHorizon = EventHorizon();

import App from "./App.vue";

Vue.config.productionTip = false;

new Vue({
  render: h => h(App)
}).$mount("#app");
