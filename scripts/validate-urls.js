const fs = require("fs");
const path = require("path");

const appDir = path.join(process.cwd(), "src/app"); //Use pages if using Pages Router

const baseUrl = "http://localhost:3000";

const ignorePatterns = ["["];

function isIgnored(url) {
  return ignorePatterns.some((pattern) => url.includes(pattern));
}

function escapeRegex(str) {
  return str.replace(/[-/\\^$*+?.()|[\]{}]/g, "\\$&");
}

function validateUrlJson(dir, parentRoute = "") {
  const urlList = getUrlsFromJson();

  const entries = fs.readdirSync(dir, {
    withFileTypes: true,
  });
  let urls = [];

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      // skip Next.js conventions like (group) or @parallelRoutes
      const childRoute = entry.name.startsWith("(")
        ? ""
        : entry.name.startsWith("[")
          ? `/:${entry.name.slice(1, -1)}`
          : `/${entry.name}`;
      urls = urls.concat(validateUrlJson(fullPath, parentRoute + childRoute));
    }

    if (entry.isFile() && entry.name === "page.tsx") {
      const url =
        parentRoute === "" ? "/" : parentRoute.replace(/\/index$/, "/");
      const fullUrl = baseUrl + url;
      const pattern = "^" + fullUrl.replace(/:\w+/g, "[^/]+") + "$";
      const dynamicUrlRegex = new RegExp(pattern);

      const foundExact = urlList.includes(fullUrl);
      const foundDynamic = urlList.some((u) => dynamicUrlRegex.test(u));

      if (!foundExact && !foundDynamic) {
        console.log(`${fullUrl} not found in Urls json file!`);
        process.exit(1);
      }
    }
  }
  return urls;
}

function extractUrls(obj, result = []) {
  if (typeof obj === "string") {
    result.push(obj);
  } else if (Array.isArray(obj)) {
    obj.forEach((item) => extractUrls(item, result));
  } else if (typeof obj === "object" && obj !== null) {
    Object.values(obj).forEach((val) => extractUrls(val, result));
  }
  return result;
}

function getUrlsFromJson() {
  let urlList = ["http://localhost:3000/"];
  try {
    const urlObject = JSON.parse(fs.readFileSync("lhci-urls.json", "utf-8"));

    urlList = [...new Set(extractUrls(urlObject))];
  } catch (error) {
    console.log("Error parsing urls json:", error);
  }
  return urlList;
}

validateUrlJson(appDir);

module.exports = {
  getUrlsFromJson,
};
