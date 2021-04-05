import EventHorizon from "./directive"

const install = function(Vue) {
  Vue.directive("event-horizon", EventHorizon)
}

if (typeof window !== 'undefined' && window.Vue) {
  window.EventHorizon = EventHorizon
  if (window.Vue.use) window.Vue.use(install)
}

EventHorizon.install = install
export default EventHorizon