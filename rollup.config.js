import babel from 'rollup-plugin-babel'
import resolve from 'rollup-plugin-node-resolve'
import commonjs from 'rollup-plugin-commonjs'

import {version} from './package.json'

export default {
    input: './src/index.js',
    output: {
        name: 'vue-event-horizon',
        // format: 'umd',
				dir: "dist",
        banner: `/*!
  * vue-event-horizon v${version}
  * (c) 2021 Lucas Drummond & Matt Wiggins
  * @license MIT
  */`,
    },
    plugins: [
        resolve(),
        commonjs(),
        babel({
            exclude: 'node_modules/**',
            presets: ['@babel/env'],
            plugins: ['@babel/transform-object-assign'],
        }),
    ],
}
