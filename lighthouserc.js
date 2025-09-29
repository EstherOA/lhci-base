const { getUrlsFromJson } = require("./scripts/validate-urls");

module.exports = {
  ci: {
    collect: {
      url: getUrlsFromJson(),
      startServerCommand: "npm run start",
      numberOfRuns: 3,
      settings: {
        output: ["html", "json"],
      },
    },
    assert: {
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
      reportFilenamePattern: "%%PATHNAME%%.%%EXTENSION%%",
    },
  },
};
