import {defineConfig} from 'vite'
import {resolve} from 'path'

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [],

    resolve: {
        alias: [{
            find:'@',
            replacement: resolve(__dirname, 'src')
        }]
    }
})
