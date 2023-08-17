import electron from 'electron';
import React from 'react';
import Head from 'next/head';

const ipcRenderer = electron.ipcRenderer || false;

function Home() {
  const [message, setMessage] = React.useState('No ipc message');
  const [logMessage, setLogMessage] = React.useState('');
  const [filePath, setFilePath] = React.useState();

  const onClickCheckConnection = () => {
    ipcRenderer.send('connection', new Date());
  };

  const onFileUpload = (files) => {
    ipcRenderer.send('fileUpload', files)
  }

  const onExportFileUpdate = () => {
    ipcRenderer.send('exportFileUpdate');
  }

  const onRenderAudio = () => {
    onClickCheckConnection();
    ipcRenderer.send('renderAudio')
  }

  if (ipcRenderer) {
  }

  React.useEffect(() => {

    ipcRenderer.on('status-check', (event, data) => {
      setMessage(data);
    });

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
        <p>
          {message}
          <br/>
          <br/>
          {
            filePath ? filePath.map(a => `${a} \n`) : null
          }
        </p>
        <input type='file' id="inputFile" multiple/>
        <button onClick={onExportFileUpdate}>Choose export path</button>
        <div style={{ backgroundColor: "#000000" }}>
          <span style={{ whiteSpace: "pre-line", backgroundColor: "#000000", color: "#ffffff"}}>
            {logMessage}
          </span>
        </div>
        
        <button onClick={onRenderAudio}>Render audio</button>
      </div>
    </React.Fragment>
  );
};

export default Home;
