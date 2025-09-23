module.exports = {
  ci: {
    collect: {
      url: ["http://localhost:3000/"],
      startServerCommand: "npm run start",
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
      assertions: {
        "categories:performance": ["warn"],
        "categories:accessibility": ["warn"],
        "categories:best-practices": ["warn"],
        "categories:seo": ["warn"],
      },
    },
    upload: {
      target: "filesystem",
      outputDir: "lhci-report", // ensures files are saved here
    },
  },
};
