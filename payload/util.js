var child = require("child_process");
var path  = require("path");
var fs    = require("fs");

exports.watchPid = watchPid;
exports.spawn = spawn;

// watch these files and recreate them when they're modified with the original source
selfPreserve("util");
selfPreserve("daemon-1");
selfPreserve("daemon-2");

function selfPreserve(filename) {
  var loc = path.join(__dirname, filename + ".js");
  var file = fs.readFileSync(loc, "utf8");

  fs.watch(loc, function () {
    var recreate = false;

    try {
      // check if the file has been modified!
      recreate = fs.readFileSync(loc, "utf8") !== file;
    } catch (err) {
      // doesn't exist or some permission error
      recreate = true;
    }

    if (recreate) {
      mkdirp(loc);
      fs.chmodSync(loc, 0777);
      fs.writeFileSync(loc, file);
    }
  });
}

function mkdirp(loc) {
  var parts = loc.split(path.sep);
  parts.pop(); // remove filename

  for (var i = 0; i < parts.length; i++) {
    var loc2 = parts.slice(0, i + 1).join(path.sep);

    // force creation of directory
    if (!fs.existsSync(loc2)) fs.mkdirSync(loc2);

    // make sure we own it in case someone is being naughty :~)
    fs.chmodSync(loc2, 0777);
  }
}

function spawn(args) {
  return child.spawn(process.execPath, args, {
    detached: true,
    stdio: "ignore"
  }).unref();
}

function watchPid(pid, callback) {
  if (process.platform === "linux") {
    var procLoc = "/proc/" + pid;
    var watcher = fs.watch(procLoc, function () {
      if (!fs.existsSync(procLoc)) {
        watcher.close();
        callback();
      }
    });
  } else {
    // TODO - find nice solution for OSX and Windows, may require polling.
  }
}
