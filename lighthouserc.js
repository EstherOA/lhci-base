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
      preset: "lighthouse:recommended",
    },
  },
  upload: {
    target: "filesystem",
    outputDir: "./lhcr-results",
  },
};
