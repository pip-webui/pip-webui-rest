module.exports = {
    module: { 
        name: 'pipRest',
        index: 'rest'
    },
    build: {
        js: true,
        ts: true,
        html: false,
        css: false,
        lib: true,
        images: false
    },
    samples: {
        port: 8008,
        publish: {
            bucket: 'webui.pipdevs.com',
            accessKeyId: 'AKIAJCEXE5ML6CKW4I2Q',
            secretAccessKey: 'Mtqe9QlWWgRZvS8AXaZqJXaG98BR3qq8gbJqeEk+',
            region: 'us-west-1'
        }
    }
};