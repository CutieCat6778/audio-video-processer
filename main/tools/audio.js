import { exec } from "child_process";
import { readFileSync, writeFileSync } from "fs";
import chokidar from "chokidar"
import { app } from "electron";
import { platform } from "os";

export async function AppendAudio(targetPath, filesPath, ffmpegPath) {
  const inputs = `${filesPath.map(a => `file ${a}`).join("\n")}`;
  const path = app.getPath("temp");
  let slash = "/"
  const osVer = platform();
  console.log(osVer)
  if(osVer == "win32") slash = "\\";

  await writeFileSync(path + `${slash}list.txt`, inputs, { encoding: "utf8" })

  let command_string = `${ffmpegPath} -f concat -safe 0 -i ${path}${slash}list.txt -c copy ${targetPath} -y 2> ${path}${slash}log.txt`;
  console.log(command_string);
  exec(command_string)
}

export async function CreateLogFile() {
  try {
    const file = await writeFileSync('log.txt', "", { encoding: "utf8" });
    console.log(file);
  } catch(e) {
    console.error(e);
  }
}

export async function ListenToLogFile(path, sendIpc) {
  console.log(path);
  const watcher = chokidar.watch(path, {ignored: /^\./, persistent: true});
  watcher
    .on("change", async (path) => {
      const logContent = await readFileSync(path, { encoding: "utf8" });
      return sendIpc(logContent);
    })
}
