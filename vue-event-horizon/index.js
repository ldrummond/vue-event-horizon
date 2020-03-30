import EventHorizon from "./directives/event-horizon";

// // Install the components
// export function install(Vue) {
//   Vue.directive("event-horizon", EventHorizon);
// }

export { EventHorizon };

// /* -- Plugin definition & Auto-install -- */
// /* You shouldn't have to modify the code below */

// // Plugin
// const plugin = {
//   // eslint-disable-next-line no-undef
//   version: 1,
//   install
// };

// export default plugin;

// // Auto-install
// let GlobalVue = null;
// if (typeof window !== "undefined") {
//   GlobalVue = window.Vue;
// } else if (typeof global !== "undefined") {
//   GlobalVue = global.Vue;
// }
// if (GlobalVue) {
//   GlobalVue.use(plugin);
// }
