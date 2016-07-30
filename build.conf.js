module.exports = {
    module: {
        name: 'pipRest',
        styles: 'rest'
    },
    build: {
        js: true,
        ts: true,
        html: false,
        css: false,
        lib: true,
        images: false,
        dist: false
    },
    file: {
        lib: [
            '../pip-webui-test/dist/**/*',
            '../pip-webui-lib/dist/**/*',
            '../pip-webui-css/dist/**/*',
            '../pip-webui-core/dist/**/*'
        ]
    },
    samples: {
        port: 8050
    },
    api: {
        port: 8051
    }
};
