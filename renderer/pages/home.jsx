import electron from 'electron';
import React from 'react';
import Head from 'next/head';

const ipcRenderer = electron.ipcRenderer || false;

function Home() {
  const [message, setMessage] = React.useState('No ipc message');
  const [logMessage, setLogMessage] = React.useState('');
  const [filePath, setFilePath] = React.useState();
  const [exportPath, setExportPath] = React.useState();

  const onClickCheckConnection = () => {
    ipcRenderer.send('connection', new Date());
  };

  const onFileUpload = (files) => {
    ipcRenderer.send('fileUpload', files)
  }

  const onExportFileUpdate = () => {
    ipcRenderer.send('exportFileUpdate');
  }

  const onShuffle = () => {
    ipcRenderer.send('shuffle')
  }

  const onFfmpegSet = () => {
    ipcRenderer.send('ffmpegSet')
  }

  const onRenderAudio = () => {
    onClickCheckConnection();
    setMessage(message + " \n Đang chạy, chờ chút đi.")
    ipcRenderer.send('renderAudio')
  }

  if (ipcRenderer) {
  }

  React.useEffect(() => {

    ipcRenderer.on('status-check', (event, data) => {
      setMessage(data);
    });

    ipcRenderer.on('updateFiles', (event, data) => {
      setFilePath(data);
    })

    ipcRenderer.on('updateExportPath', (event, data) => {
      setExportPath(data);
    })

    ipcRenderer.on('logUpdate', (event, data) => {
      console.log("Log Update", data);
      const currentLogMessage = logMessage;
      const newLogMessage = currentLogMessage + "\n" + data;
      setLogMessage(newLogMessage)
    })

    document.getElementById('inputFile').addEventListener('change', (event) => {
      const files = Array.from(event.target.files).map(f => f.path);
      console.log(files);
      setFilePath(files);
      onFileUpload(files);
    })

    return () => {
      ipcRenderer.removeAllListeners('status-check');
    };
  }, []);

  return (
    <React.Fragment>
      <Head>
        <title>Audio-Video-Prossesor</title>
      </Head>
      <div>
        <h1>File sẽ được copy</h1>
        <span style={{ whiteSpace: "pre-line"}}>
          {
            filePath ? filePath.map(a => `${a} \n`) : "Chọn đã..."
          }
        </span>
        <br/>
        <br/>
        <input type='file' id="inputFile" multiple/>
        <h1>Nơi file được export</h1>
        <span>
        {
            exportPath ? exportPath : "Chọn đã..."
          }
        </span>
        <br/>
        <br/>
        <button onClick={onExportFileUpdate}>Choose export path</button>
        <h1>Chọn file ffmpeg</h1>
        <button onClick={onFfmpegSet}>Ffmpeg file</button>
        <br/>
        <br/>
        <h1>Output</h1>
        <h3>{message}</h3>
        <div style={{ backgroundColor: "#000000" }}>
          <span style={{ whiteSpace: "pre-line", backgroundColor: "#000000", color: "#ffffff"}}>
            {logMessage}
          </span>
        </div>
        <br/>
        <br/>
        <br/>
        <button onClick={onShuffle}>Lắc cái mông :)</button>
        <button onClick={onRenderAudio}>Render audio</button>

      </div>
    </React.Fragment>
  );
};

export default Home;
