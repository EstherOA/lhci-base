module.exports = {
  ci: {
    collect: {
      url: ["http://localhost:3000/"],
      startServerCommand: "npm start",
      numberOfRuns: 3,
      settings: {
        output: ["html", "json"],
      },
    },
    assert: {
      // "preset": "lighthouse:recommended",
      // "assertions": {
      //   "categories:performance": ["error", { "minScore": 0.9 }],
      //   "categories:accessibility": ["warn", { "minScore": 0.95 }]
      // }
      assertions: {},
    },
  },
  upload: {
    target: "filesystem",
    outputDir: "./lhcr-results",
  },
};
