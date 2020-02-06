import React from 'react';
import { faPlus, faFileImport } from '@fortawesome/free-solid-svg-icons';
import SimpleMDE from 'react-simplemde-editor';
import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'easymde/dist/easymde.min.css';
import FileSearch from './components/FileSearch.js';
import FileList from './components/FileList.js';
import BottomBtn from './components/BottomBtn.js';
import TabList from './components/TabList.js';
import defaultFile from './utils/defaultFile.js';

function App() {
  return (
    <div className="App container-fluid px-0">
      <div className="row no-gutters">
        <div className="col-3 bg-light left-panel">
          <FileSearch 
            title="我的云笔记"
            onFileSearch={(value) => {console.log(value)}}
          />
          <FileList 
            files={defaultFile}
            onFileClick={(id) => {console.log(id)}}
            onFileDelete={(id) => {console.log('delete', id)}}
            onSaveEdit={(id, newValue) => {console.log(id, newValue)}}
          />
          <div className="row no-gutters button-group">
            <div className="col">
              <BottomBtn 
                text="导入"
                colorClass="btn-info"
                icon={faFileImport}
                onBtnClick={() => {console.log("import success")}}
              />
            </div>
            <div className="col">
              <BottomBtn 
                text="新建"
                colorClass="btn-warning"
                icon={faPlus}
                onBtnClick={() => {console.log("new success")}}
              />
            </div>
          </div>
        </div>
        <div className="col-9 right-panel">
          <TabList 
            files={defaultFile}
            onTabClick={(id) => {console.log(id)}}
            activeId="1"
            onCloseTab={(id) => {console.log('closing', id)}}
            unSaveIds={["1", "2"]}
          />
          <SimpleMDE 
            value={defaultFile[1].body}
            onChange={(value) => {console.log(value)}}
            options={{
              minHeight: '475px'
            }}
          />
        </div> 
      </div>
    </div>
  );
}

export default App;
