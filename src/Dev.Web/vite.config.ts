import {defineConfig, loadEnv, UserConfig} from 'vite'
import {resolve} from 'path'

// https://vitejs.dev/config/

//开发模式
const dev = defineConfig({
    plugins: [],

    build: {
        target: 'es2020', //bigint
        chunkSizeWarningLimit: 2000,
    },

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
            },
            '/preview': {
                target: 'http://localhost:5137/',
                secure: false,
            }
        }
    }
});

//生产库
const libAppBoxClient = defineConfig({
    plugins: [],

    resolve: {
        alias: [{
            find: '@',
            replacement: resolve(__dirname, 'src')
        }]
    },

    build: {
        lib: {
            entry: resolve(__dirname, 'src/AppBoxClient/index.ts'),
            formats: ['es'],
            name: 'AppBoxClient',
            fileName: 'AppBoxClient'
        },
        rollupOptions: {
            external: [
                resolve(__dirname, 'src/AppBoxCore'),
                resolve(__dirname, 'src/System'),
            ]
        },
        // minify: 'terser'
    },
})

export default ({mode}: UserConfig) => {
    console.log(mode)
    const url = loadEnv(mode, process.cwd()).VITE_BASEURL
    if (mode === 'libAppBoxClient') {
        return libAppBoxClient;
    } else {
        return dev;
    }
}