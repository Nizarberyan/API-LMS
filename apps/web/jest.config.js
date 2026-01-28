import { Config } from 'jest';
import nextJest from 'next/jest';

const createJestConfig = nextJest({
    // Path to Next.js app
    dir: './',
});

/** @type {Config} */
const customJestConfig = {
    setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
    testEnvironment: 'jest-environment-jsdom',
    moduleNameMapper: {
        '^@/(.*)$': '<rootDir>/$1',
    },
    testPathIgnorePatterns: ['<rootDir>/node_modules/', '<rootDir>/.next/'],
    collectCoverageFrom: [
        'app/**/*.{js,jsx,ts,tsx}',
        'components/**/*.{js,jsx,ts,tsx}',
        'lib/**/*.{js,jsx,ts,tsx}',
        '!**/*.d.ts',
    ],
    testMatch: [
        '**/__tests__/**/*.[jt]s?(x)',
        '**/?(*.)+(spec|test).[jt]s?(x)',
    ],
};

module.exports = createJestConfig(customJestConfig);
