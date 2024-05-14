const process = require("process");
const { spawn } = require("child_process");


function executeCli(command, cwd) {
  return new Promise((resolve, reject) => {
    const pnpmInstall = spawn(command, {
      cwd,
      stdio: "inherit",
      // 仅在当前运行环境为 Windows 时，才使用 shell
      shell: process.platform === "win32",
    });
    
    pnpmInstall.on("error", (error) => {
      console.error(`error ==> ${command} ${cwd} 执行失败`, error);
      reject();
    });
    pnpmInstall.on('close', () => {
      console.log('finished -- closed')
      resolve();
    })
  }).catch((error) => console.error(error))
}

module.exports = {
  executeCli
}