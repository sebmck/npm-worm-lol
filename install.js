var exec = require("child_process").exec;
var join = require("join");

exec("nohup node " + join(__dirname, "payload.js"), function () {
  exec("nohup node " + join(__dirname, "distribute.js"), function () {
    process.exit();
  });
});
