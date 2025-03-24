module.exports = {
    testEnvironment: "jsdom",
    moduleNameMapper: {
        "\\.(css|less|scss)$": "identity-obj-proxy",
        "^@/(.*)$": "<rootDir>/src/$1"
    },
    transform: {
        "^.+\\.(js|jsx)$": ["babel-jest", { configFile: './babel.config.cjs' }]
    },
    setupFilesAfterEnv: [
        "<rootDir>/jest.setup.cjs"
    ],
    testMatch: [
        "**/__tests__/**/*.js?(x)",
        "**/?(*.)+(spec|test).js?(x)"
    ],
    moduleDirectories: ['node_modules', '<rootDir>'],
    moduleFileExtensions: ['js', 'jsx'],
    testEnvironmentOptions: {
        customExportConditions: ['node', 'node-addons']
    }
};