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

  ListenToLogFile("log.txt", sendIPC);
});

ipcMain.on("fileUpload", (event, arg) => {
  console.log("Recieved file upload", arg);
  config.inputs = arg;
  console.log(config);
});

ipcMain.on("exportFileUpdate", async (event, arg) => {
  console.log(arg);
  const res = await dialog.showSaveDialogSync({ defaultPath: __dirname, filters: [{
    name: "Audio",
    extensions: "mp3"
  }] })
  config.export = res + ".mp3";
  console.log(config);
})

ipcMain.on('renderAudio', (event, arg) => {
  console.log("Called to render audio")
  AppendAudio(config.export, config.inputs);
  shell.showItemInFolder(config.export);
})