import { exec } from "child_process";
import { readFileSync, writeFileSync } from "fs";
import chokidar from "chokidar"

export async function AppendAudio(targetPath, filesPath) {
  const inputs = `${filesPath.map(a => `-i ${a}`).join(" ")}`;

  let command_string = `ffmpeg ${inputs} -filter_complex "[0:a][1:a]concat=n=${filesPath.length}:v=0:a=1" ${targetPath} -y 2> log.txt`;
  exec(command_string);
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
  const watcher = chokidar.watch(path, {ignored: /^\./, persistent: true});
  watcher
    .on("change", async (path) => {
      const logContent = await readFileSync(path, { encoding: "utf8" });
      return sendIpc(logContent);
    })
}
