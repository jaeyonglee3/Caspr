// module.exports = {
//   preset: 'ts-jest', // Enable Jest to work with TypeScript
//   testEnvironment: 'jsdom', // Simulate a browser environment
//   transform: {
//     '^.+\\.(ts|tsx|js|jsx)$': 'babel-jest', // Use babel-jest for TypeScript and JSX transformation
//   },
//   moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx'], // Recognize these file extensions
//   transformIgnorePatterns: ['<rootDir>/node_modules/'], // Avoid transforming node_modules
//   setupFiles: ['jest-canvas-mock'],
//   moduleNameMapper: {
//     '\\.(css|less|scss|sass)$': 'identity-obj-proxy', // Mock CSS imports
//     '^react$': require.resolve('react'),
//     '^react-dom$': require.resolve('react-dom'),
//     '^d3$': '<rootDir>/node_modules/d3/dist/d3.min.js',

//   },
// };
const nextJest = require("next/jest");
const dotenv = require("dotenv");

dotenv.config({ path: ".env.local" });

/** @type {import('jest').Config} */
const createJestConfig = nextJest({
	// Provide the path to your Next.js app to load next.config.js and .env files in your test environment
	dir: "./"
});

// Add any custom config to be passed to Jest
const config = {
	coverageProvider: "babel",
	testEnvironment: "jsdom",
	setupFiles: ["jest-canvas-mock"],
	// Add more setup options before each test is run
	// setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
	moduleNameMapper: {
		"^@/(.*)$": "<rootDir>/src/$1"
	},
	verbose: false,
	silent: true,
	maxConcurrency: 5,

	reporters: [
		"default",
		[
			"jest-summary-reporter",
			{
				showPassedTests: true,
				showFailedTests: true,
				showPendingTests: true,
				showSkippedTests: true,
				skipShapshots: true
			}
		]
	]
};

// createJestConfig is exported this way to ensure that next/jest can load the Next.js config which is async
module.exports = createJestConfig(config);
