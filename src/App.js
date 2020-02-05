import React from 'react';
import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css'
import FileSearch from './components/FileSearch.js'
import FileList from './components/FileList.js'
import defaultFile from './utils/defaultFile.js'

function App() {
  return (
    <div className="App container-fluid">
      <div className="row">
        <div className="col-6 bg-light left-panel">
          <FileSearch 
            title="我的云笔记"
            onFileSearch={(value) => {console.log(value)}}
          />
          <FileList 
            files={defaultFile}
          />
        </div>
        <div className="col-6 bg-primary right-panel">
          <h1>this is right</h1>
        </div> 
      </div>
    </div>
  );
}

export default App;
