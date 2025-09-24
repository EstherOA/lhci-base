const { execSync } = require("child_process");
const fs = require("fs");
const path = require("path");

const appDir = path.join(process.cwd(), "src/app"); //Use pages if using Pages Router

const baseUrl = "http://localhost:3000";

const ignorePatterns = ["["];

function isIgnored(url) {
  return ignorePatterns.some((pattern) => url.includes(pattern));
}

function getChangedFiles(mainBranch = "origin/main") {
  try {
    const diff = execSync(`git diff --name-only ${mainBranch}...HEAD`, {
      encoding: "utf-8",
    });
    return diff.split("\n").filter(Boolean);
  } catch (err) {
    console.error("Failed to get git diff:", err.messae);
    return [];
  }
}

function readFileSafe(file) {
  try {
    return fs.readFileSync(file, "utf-8");
  } catch {
    return "";
  }
}

function getImports(filePath) {
  const content = readFileSafe(filePath);
  const regex = /from ["']([^"']+)["']/g;
  const imports = [];
  let match;
  while ((match = regex.exec(content)) !== null) {
    imports.push(match[1]);
  }
  return imports;
}

function getAllRoutes(dir, parentRoute = "") {
  const entries = fs.readdirSync(dir, {
    withFileTypes: true,
  });
  let routes = [];

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      const childRoute = entry.name.startsWith("(") ? "" : `/${entry.name}`;
      routes = routes.concat(getAllRoutes(fullPath, parentRoute + childRoute));
    }

    if (
      entry.isFile() &&
      (entry.name === "page.tsx" || entry.name === "layout.tsx")
    ) {
      const url =
        entry.name === "page.tsx"
          ? parentRoute === ""
            ? "/"
            : parentRoute.replace(/\index$/, "/")
          : null;

      routes.push({
        type: entry.name === "page.tsx" ? "page" : "layout",
        file: fullPath,
        url: url ? baseUrl + url : null,
        imports: getImports(fullPath),
        children: [],
      });
    }
  }
  return routes;
}

function linkLayouts(routes) {
  const pages = routes.filter((r) => r.type === "page");
  const layouts = routes.filter((r) => r.type === "layout");

  for (const layout of layouts) {
    for (const page of pages) {
      if (page.file.startsWith(path.dirname(layout.file))) {
        layout.children.push(page);
      }
    }
  }
  return { pages, layouts };
}

function getAffectedUrls(routes, changedFiles) {
  const affected = new Set();

  function markPage(page) {
    if (page.url && !isIgnored(page.url)) affected.add(page.url);
  }

  function checkRoute(route) {
    if (changedFiles.some((f) => route.file.endsWith(f))) {
      if (route.type === "page") {
        markPage(route);
      } else if (route.type === "layout") {
        route.children.forEach(markPage);
      }

      for (const file of changedFiles) {
        const importPath = file
          .replace(/^app\//, "@")
          .replace(/\.(tsx|ts|js|jsx)$/, "");

        if (route.imports.some((imp) => imp.includes(importPath))) {
          if (route.type === "page") {
            markPage(route);
          } else if (route.type === "layout") {
            route.children.forEach(markPage);
          }
        }
      }
    }
  }

  routes.forEach(checkRoute);
  return Array.from(affected);
}

const changedFiles = getChangedFiles();
const allRoutes = getAllRoutes(appDir);
console.log("allRoutes:", allRoutes);

const { pages, layouts } = linkLayouts(allRoutes);
const affectedUrls = getAffectedUrls([...pages, ...layouts], changedFiles);

fs.writeFileSync(
  "lhci-urls.json",
  JSON.stringify(affectedUrls, null, 2),
  "utf-8"
);

console.log("Changed files", changedFiles);
console.log("Affected urls:");
console.log(affectedUrls.join("\n"));
