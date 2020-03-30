<template>
  <div id="app">
    <label>
      Toggle Square
      <input type="checkbox" v-model="show_square" v-show="false" />
    </label>
    <div v-if="show_square">
      <!-- <div
        class="square"
        v-if="show_square"
        v-event-horizon:parallax="{ s: { at: 1, from: 1, to: 2 }, x: { at: 1, from: 1, to: 2 } }"
        v-event-horizon:trigger="(el, is_visible) => {console.log(is_visible)}"
        :style="{bottom: '10vh'}"
      />-->
      <div
        class="square"
        v-for="i in 1000"
        :key="i"
        :style="{top: i * 200 + 'px'}"
        v-event-horizon:trigger
      />
      <!-- <div class="square" v-if="show_square" data-scroll="trigger" /> -->
    </div>
    <div class="horizon" v-for="i in 4" :key="i" :style="{top: i * 25 + 'vh'}" />
  </div>
</template>

<script>
export default {
  name: "App",
  data() {
    return {
      show_square: true
    };
  },
  mounted() {
    setTimeout(() => {
      window.scrollTo(0, 0);
    }, 1);
    setTimeout(() => {
      this.rafLoop = requestAnimationFrame(this.onRaf);
    }, 3000);
  },
  methods: {
    // onVisibilityChange(el, is_visible) {
    //   // console.log(is_visible);
    // },
    onRaf(delta) {
      window.scrollTo(0, window.pageYOffset + 0.1 * delta);
      // console.log(window.pageYOffset, window.innerHeight);
      // if (window.pageYOffset < window.innerHeight - 1) {
      requestAnimationFrame(this.onRaf);
      // } else {
      // cancelAnimationFrame(this.rafLoop);
      // }
    }
  }
};
</script>

<style>
#app {
  height: 200vh;
}

label {
  font-size: 50px;
  position: fixed;
  top: 10px;
  border: 1px solid black;
  cursor: pointer;
}

.horizon {
  border-bottom: 2px dashed pink;
  position: fixed;
  width: 100%;
}

.square {
  position: absolute;
  bottom: -20vh;
  display: block;
  width: 100px;
  height: 100px;
  left: 50%;
  transform: translate(-50%, 0);
  background: rgb(0, 0, 0);
}

.square.trigger-0 {
  background: rgb(0, 50, 0);
}

.square.trigger-25 {
  background: rgb(0, 100, 0);
}

.square.trigger-50 {
  background: rgb(0, 150, 0);
}

.square.trigger-75 {
  background: rgb(0, 200, 0);
}
</style>
