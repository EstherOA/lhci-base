const fs = require("fs");
const path = require("path");

const appDir = path.join(process.cwd(), "src/app"); //Use pages if using Pages Router

const baseUrl = "http://localhost:3000";

const ignorePatterns = ["["];

function isIgnored(url) {
  return ignorePatterns.some((pattern) => url.includes(pattern));
}

function getPageUrls(dir, parentRoute = "") {
  const entries = fs.readdirSync(dir, {
    withFileTypes: true,
  });
  let urls = [];

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      // skip Next.js conventions like (group) or @parallelRoutes
      const childRoute = entry.name.startsWith("(") ? "" : `/${entry.name}`;
      urls = urls.concat(getPageUrls(fullPath, parentRoute + childRoute));
    }

    if (entry.isFile() && entry.name === "page.tsx") {
      const url =
        parentRoute === "" ? "/" : parentRoute.replace(/\/index$/, "/");
      const fullUrl = baseUrl + url;
      if (!isIgnored(fullUrl)) {
        urls.push(fullUrl);
      }
    }
  }
  return urls;
}

const urls = getPageUrls(appDir);

fs.writeFileSync("lhci-urls.json", JSON.stringify(urls, null, 2), "utf-8");

console.log("LHCI urls generated");
console.log(urls.join("\n"));
