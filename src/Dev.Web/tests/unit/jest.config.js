// const {pathsToModuleNameMapper} = require('ts-jest');
// const {compilerOptions} = require('./tsconfig')

/** @type {import('ts-jest/dist/types').InitialOptionsTsJest} */
module.exports = {
    preset: 'ts-jest',
    testEnvironment: 'node',
    roots: ["<rootDir>"],
    // verbose: true,
    bail: true,
    testRegex: ["(.*)$"],
    testMatch: null,
    // Setup File
    setupFilesAfterEnv: ["./initialize.ts"],

    // module
    // moduleNameMapper: pathsToModuleNameMapper(compilerOptions.paths /*, { prefix: '<rootDir>/' } */),

    // modulePaths: [
    //     "<rootDir>/../../src/"
    // ],
    moduleNameMapper: {
        "@/System": "<rootDir>/../../src/System",
        "@/PixUI": "<rootDir>/../../src/PixUI",
    }
};
