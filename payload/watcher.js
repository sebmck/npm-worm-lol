var util = require("./util");

monitor(process.argv[2]);

function monitor(pid) {
  watchPid(pid, function () {
    // relaunch daemon
    var child = util.spawn([path.join(__dirname, "daemon.js"), process.pid]);

    // watch new pid
    monitor(child.pid);
  });
}
