module.exports = {
    presets: [
        ['@babel/preset-env', {
            targets: { node: 'current' },
            modules: false // Don't transform ESM imports to CommonJS
        }],
        ['@babel/preset-react', { runtime: 'automatic' }]
    ],
    // This is important for Jest to handle ES modules
    env: {
        test: {
            presets: [
                ['@babel/preset-env', {
                    targets: { node: 'current' },
                    modules: 'commonjs' // Transform ESM to CommonJS for Jest
                }]
            ]
        }
    }
};

