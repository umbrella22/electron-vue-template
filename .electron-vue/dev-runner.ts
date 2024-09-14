process.env.NODE_ENV = "development";

import electron from "electron";
import chalk from "chalk";
import { join } from "path";
// import { watch } from "rollup";
import Portfinder from "portfinder";
import config from "../config";
import { say } from "cfonts";
import { spawn } from "child_process";
import type { ChildProcess } from "child_process";
import { electronLog, logStats, removeJunk } from "./utils";
// import rollupOptions from "./rollup.config";

// const mainOpt = rollupOptions(process.env.NODE_ENV, "main");
// const preloadOpt = rollupOptions(process.env.NODE_ENV, "preload");

let electronProcess: ChildProcess | null = null;
let manualRestart = false;

function startRenderer(): Promise<void> {
  return new Promise((resolve, reject) => {
    Portfinder.basePort = config.dev.port || 9080;
    Portfinder.getPort(async (err, port) => {
      if (err) {
        reject("PortError:" + err);
      } else {
        // const { createServer } = await import("vite");
        // const server = await createServer({
        //   configFile: join(__dirname, "vite.config.mts"),
        // });
        // process.env.PORT = String(port);
        // await server.listen(port);
        console.log(
          "\n\n" + chalk.blue(`  正在准备主进程，请等待...`) + "\n\n"
        );
        resolve();
      }
    });
  });
}

function startMain(): Promise<void> {
  return new Promise((resolve, reject) => {
    const MainWatcher = watch(mainOpt);
    MainWatcher.on("change", (filename) => {
      // 主进程日志部分
      logStats(`主进程文件变更`, filename);
    });
    MainWatcher.on("event", (event) => {
      if (event.code === "END") {
        if (electronProcess) {
          manualRestart = true;
          electronProcess.pid && process.kill(electronProcess.pid);
          electronProcess = null;
          startElectron();

          setTimeout(() => {
            manualRestart = false;
          }, 5000);
        }

        resolve();
      } else if (event.code === "ERROR") {
        reject(event.error);
      }
    });
  });
}

function startPreload(): Promise<void> {
  console.log("\n\n" + chalk.blue(`  正在准备预加载脚本，请等待...`) + "\n\n");
  return new Promise((resolve, reject) => {
    const PreloadWatcher = watch(preloadOpt);
    PreloadWatcher.on("change", (filename) => {
      // 预加载脚本日志部分
      logStats(`预加载脚本文件变更`, filename);
    });
    PreloadWatcher.on("event", (event) => {
      if (event.code === "END") {
        if (electronProcess) {
          manualRestart = true;
          electronProcess.pid && process.kill(electronProcess.pid);
          electronProcess = null;
          startElectron();

          setTimeout(() => {
            manualRestart = false;
          }, 5000);
        }

        resolve();
      } else if (event.code === "ERROR") {
        reject(event.error);
      }
    });
  });
}

function startElectron() {
  var args = [
    "--inspect=5858",
    join(__dirname, "../dist/electron/main/main.js"),
  ];

  // detect yarn or npm and process commandline args accordingly
  if (process.env.npm_execpath?.endsWith("yarn.js")) {
    args = args.concat(process.argv.slice(3));
  } else if (process.env.npm_execpath?.endsWith("npm-cli.js")) {
    args = args.concat(process.argv.slice(2));
  }

  electronProcess = spawn(electron as any, args);

  electronProcess.stdout?.on("data", (data: string) => {
    electronLog(removeJunk(data), "blue");
  });
  electronProcess.stderr?.on("data", (data: string) => {
    electronLog(removeJunk(data), "red");
  });

  electronProcess.on("close", () => {
    if (!manualRestart) process.exit();
  });
}

function greeting() {
  const cols = process.stdout.columns;
  let text: string | boolean = "";

  if (cols > 104) text = "rspack-electron";
  else if (cols > 76) text = "rspack-|electron";
  else text = false;

  if (text) {
    say(text, {
      colors: ["yellow"],
      font: "simple3d",
      space: false,
    });
  } else console.log(chalk.yellow.bold("\n  rspack-electron"));
  console.log(chalk.blue(`准备启动...`) + "\n");
}

async function init() {
  greeting();

  try {
    await startRenderer();
    await startMain();
    await startPreload();
    startElectron();
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
}

init();
