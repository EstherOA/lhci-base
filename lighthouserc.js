const fs = require("fs");

const urlList = JSON.parse(fs.readFileSync("lhci-urls.json", "utf-8"));

module.exports = {
  ci: {
    collect: {
      url: urlList,
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
    },
  },
};
