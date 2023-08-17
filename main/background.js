import { app, dialog, ipcMain, shell } from "electron";
import serve from "electron-serve";
import { createWindow } from "./helpers";
import { ListenToLogFile, CreateLogFile, AppendAudio } from "./tools/audio";

const isProd = process.env.NODE_ENV === "production";

const config = {
  export: __dirname + "/output.mp3",
  inputs: [],
}

if (isProd) {
  serve({ directory: "app" });
} else {
  app.setPath("userData", `${app.getPath("userData")} (development)`);
}

(async () => {
  await app.whenReady();

  const mainWindow = createWindow("main", {
    width: 1000,
    height: 600,
  });

  if (isProd) {
    await mainWindow.loadURL("app://./home.html");
  } else {
    const port = process.argv[2];
    await mainWindow.loadURL(`http://localhost:${port}/home`);
    mainWindow.webContents.openDevTools();
  }
})();

const appPath = app.getPath("temp");

app.on("window-all-closed", () => {
  app.quit();
});

ipcMain.on("connection", (event, arg) => {
  console.log("Recieved connection ", arg);
  event.sender.send("logUpdate", "Create log");
  event.sender.send("status-check", `[${new Date() - arg}ms] Status OK`);

  CreateLogFile();

  function sendIPC(log) {
    try {
      event.sender.send("logUpdate", log);
    } catch (e) {
      console.error(e);
    }
  }

  ListenToLogFile(appPath+"/log.txt", sendIPC);
});
function shuffle(array) {
  let currentIndex = array.length,  randomIndex;

  // While there remain elements to shuffle.
  while (currentIndex != 0) {

    // Pick a remaining element.
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;

    // And swap it with the current element.
    [array[currentIndex], array[randomIndex]] = [
      array[randomIndex], array[currentIndex]];
  }

  return array;
}

ipcMain.on("shuffle", (event, arg) => {
  config.inputs = shuffle(config.inputs);
  event.sender.send('updateFiles', config.inputs)
})

ipcMain.on("fileUpload", (event, arg) => {
  config.inputs = arg;
});

ipcMain.on("exportFileUpdate", async (event, arg) => {
  console.log(arg);
  const res = await dialog.showSaveDialogSync({ defaultPath: __dirname, filters: [{
    name: "Audio",
    extensions: "mp3"
  }] })
  if(!res.endsWith(".mp3")) {
    config.export = res + ".mp3";
  } else {
    config.export = res;
  }
  console.log(config);
  event.sender.send('updateExportPath', config.export)
})

ipcMain.on('renderAudio', (event, arg) => {
  console.log("Called to render audio")
  AppendAudio(config.export, config.inputs);
  shell.showItemInFolder(config.export);
})