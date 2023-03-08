import {defineConfig, loadEnv, UserConfig} from 'vite'
import {resolve} from 'path'
import {visualizer} from 'rollup-plugin-visualizer'

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
                headers: { 'ViteDev': 'true' } //加入标记是Vite开发环境
            },
        }
    }
});

//生产库
// https://rollupjs.org/guide/en/#outputpaths
const extSystem = resolve(__dirname, 'src/System');
const extPixUI = resolve(__dirname, 'src/PixUI');
const extCodeEditor = resolve(__dirname, 'src/CodeEditor');
const extLiveChartsCore = resolve(__dirname, 'src/LiveChartsCore');
const extAppBoxCore = resolve(__dirname, 'src/AppBoxCore');
const extAppBoxClient = resolve(__dirname, 'src/AppBoxClient');

const libSystem = defineConfig({
    plugins: [visualizer()],

    resolve: {
        alias: [{
            find: '@',
            replacement: resolve(__dirname, 'src')
        }]
    },

    build: {
        target: "es2020",
        lib: {
            entry: resolve(__dirname, 'src/System/index.ts'),
            formats: ['es'],
            name: 'System',
            fileName: (format) => 'System.js'
        },
    },
})

const libPixUI = defineConfig({
    plugins: [visualizer()],

    resolve: {
        alias: [{
            find: '@',
            replacement: resolve(__dirname, 'src')
        }]
    },

    build: {
        lib: {
            entry: resolve(__dirname, 'src/PixUI/index.ts'),
            formats: ['es'],
            name: 'PixUI',
            fileName: (format) => 'PixUI.js'
        },
        rollupOptions: {
            external: [extSystem, "canvaskit"],
            output: {
                paths: {
                    [extSystem]: '/System.js'
                },
            },
            makeAbsoluteExternalsRelative: false,
        },
    },
})

const libCodeEditor = defineConfig({
    plugins: [visualizer()],

    resolve: {
        alias: [{
            find: '@',
            replacement: resolve(__dirname, 'src')
        }]
    },

    build: {
        lib: {
            entry: resolve(__dirname, 'src/CodeEditor/index.ts'),
            formats: ['es'],
            name: 'CodeEditor',
            fileName: (format) => 'CodeEditor.js'
        },
        rollupOptions: {
            external: [extSystem, extPixUI, "canvaskit"],
            output: {
                paths: {
                    [extSystem]: '/System.js',
                    [extPixUI]: '/PixUI.js'
                },
            },
            makeAbsoluteExternalsRelative: false,
        },
    },
})

const libLiveChartsCore = defineConfig({
    plugins: [visualizer()],

    resolve: {
        alias: [{
            find: '@',
            replacement: resolve(__dirname, 'src')
        }]
    },

    build: {
        target: "es2020",
        lib: {
            entry: resolve(__dirname, 'src/LiveChartsCore/index.ts'),
            formats: ['es'],
            name: 'LiveChartsCore',
            fileName: (format) => 'LiveChartsCore.js'
        },
        rollupOptions: {
            external: [extSystem, extPixUI],
            output: {
                paths: {
                    [extSystem]: '/System.js',
                    [extPixUI]: '/PixUI.js'
                },
            },
            makeAbsoluteExternalsRelative: false,
        },
    },
})

const libAppBoxCore = defineConfig({
    plugins: [],

    resolve: {
        alias: [{
            find: '@',
            replacement: resolve(__dirname, 'src')
        }]
    },

    build: {
        target: "es2020",
        lib: {
            entry: resolve(__dirname, 'src/AppBoxCore/index.ts'),
            formats: ['es'],
            name: 'AppBoxCore',
            fileName: (format) => 'AppBoxCore.js'
        },
        rollupOptions: {
            external: [extSystem],
            output: {
                paths: {
                    [extSystem]: '/System.js'
                },
            },
            makeAbsoluteExternalsRelative: false,
        },
    },
})

const libAppBoxClient = defineConfig({
    plugins: [visualizer()],

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
            fileName: (format) => 'AppBoxClient.js'
        },
        rollupOptions: {
            external: [extSystem, extPixUI, extAppBoxCore],
            output: {
                paths: {
                    [extSystem]: '/System.js',
                    [extPixUI]: '/PixUI.js',
                    [extAppBoxCore]: '/AppBoxCore.js'
                },
            },
            makeAbsoluteExternalsRelative: false,
        },
        // minify: 'terser'
    },
})

const AppStudio = defineConfig({
    plugins: [visualizer()],

    resolve: {
        alias: [{
            find: '@',
            replacement: resolve(__dirname, 'src')
        }]
    },

    base: '/dev',

    build: {
        target: "es2020",
        rollupOptions: {
            external: [extSystem, extPixUI, extCodeEditor, extAppBoxCore, extAppBoxClient],
            output: {
                paths: {
                    [extSystem]: '/System.js',
                    [extPixUI]: '/PixUI.js',
                    [extCodeEditor]: '/CodeEditor.js',
                    [extAppBoxCore]: '/AppBoxCore.js',
                    [extAppBoxClient]: '/AppBoxClient.js'
                },
                entryFileNames: '[name].js',
                chunkFileNames: '[name].js',
                assetFileNames: '[name].[ext]'
            },
            makeAbsoluteExternalsRelative: false,
        },
        // minify: 'terser'
    },
})


export default ({mode}: UserConfig) => {
    //const url = loadEnv(mode, process.cwd()).VITE_BASEURL
    switch (mode) {
        case 'libSystem':
            return libSystem;
        case 'libPixUI':
            return libPixUI;
        case 'libCodeEditor':
            return libCodeEditor;
        case 'libLiveChartsCore':
            return libLiveChartsCore;
        case 'libAppBoxCore':
            return libAppBoxCore;
        case 'libAppBoxClient':
            return libAppBoxClient;
        case 'AppStudio':
            return AppStudio;
        default:
            return dev;
    }
}