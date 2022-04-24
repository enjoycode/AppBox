import {defineConfig} from 'vite'
import {resolve} from 'path'

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [],

    resolve: {
        alias: [{
            find: '@',
            replacement: resolve(__dirname, 'src')
        }]
    },

    server: {
        proxy: {
            '/ws': {
                target: 'ws://localhost:5137/',
                secure: false,
                ws: true
            }
        }
    }
})
