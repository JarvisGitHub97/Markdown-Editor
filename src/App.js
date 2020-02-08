import React, { useState }from 'react';
import { faPlus, faFileImport, faSave } from '@fortawesome/free-solid-svg-icons';
import { flattenArr, objToArr } from './utils/helper.js';
import SimpleMDE from 'react-simplemde-editor';
import uuidv4 from 'uuid/v4';
import fileHelper from './utils/fileHelper.js'

import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'easymde/dist/easymde.min.css';

import FileSearch from './components/FileSearch.js';
import FileList from './components/FileList.js';
import BottomBtn from './components/BottomBtn.js';
import TabList from './components/TabList.js';
import defaultFile from './utils/defaultFile.js';

//require node.js modules
const { join } = window.require('path')
//remote made render process use app methods of main process
const { remote } = window.require('electron')

function App() {
  const [ files, setFiles ] = useState(flattenArr(defaultFile))
  const [ activeFileID, setActiveFileID ] = useState('')
  const [ openedFileIDs, setOpenedFileIDs ] = useState([])
  const [ unsavedFileIDs, setUnsavedFileIDs ] = useState([])
  const [ searchedFile, setSearchedFile ] = useState([])
  const filesArr = objToArr(files)
  //存储到本地的地址 documents文件夹中
  const savedLocation = remote.app.getPath('documents') + '\\myStore'

  const activeFile = files[activeFileID]
  const fileListArr = searchedFile.length > 0 ? searchedFile : filesArr
  const openedFiles = openedFileIDs.map(openedID => {
    return files[openedID]
  })
  //左侧点击右侧展示
  const fileClick = (fileID) => {
    setActiveFileID(fileID)
    //如果打开数组总包含当前点击的则不添加
    if (!openedFileIDs.includes(fileID)) {
      setOpenedFileIDs([...openedFileIDs, ...fileID])
    }
  }
  //右侧文件点击切换active样式
  const tabClick = (fileID) => {
    setActiveFileID(fileID)
  }
  //右侧文件点击关闭
  const tabClose = (fileID) => {
    const tabLeave = openedFileIDs.filter(item => item !== fileID)
    setOpenedFileIDs(tabLeave)
    if (tabLeave.length > 0) {
      setActiveFileID(tabLeave[0])
    } else {
      setActiveFileID('')
    }
  }
  //右侧文件内容改变显示未保存状态并保存
  const fileChange = (id, newValue) => {
    const newFile = { ...files[id], body: newValue }
    setFiles({ ...files, [id]: newFile })
    if (!unsavedFileIDs.includes(id)) {
      setUnsavedFileIDs([...unsavedFileIDs, id])
    }
  }
  //点击左侧icon删除
  const deleteFile = (id) => {
    delete files[id]
    setFiles(files)
    //如果在打开 需要关闭这个tab
    tabClose(id)
  }
  //点击icon/新建文件时编辑文件名
  const updateFileName = (id, title, isNew) => {
    const modifiedFile = { ...files[id], title: title, isNew: false }
    //新建文件的命名处理
    if (isNew) {
      fileHelper.writeFile(join(savedLocation, `${title}.md`), files[id].body).then(() => {
        setFiles({ ...files, [id]: modifiedFile })
      })
    } else {
      fileHelper.renameFile(join(savedLocation, `${files[id].title}.md`), join(savedLocation, `${title}.md`))
        .then(() => {
          setFiles({ ...files, [id]: modifiedFile })
        })
    }
  }
  //搜索显示对应文件
  const filesSearch = (keyword) => {
    const newFiles = filesArr.filter(file => file.title.includes(keyword))
    setSearchedFile(newFiles)
  }
  //创建文件
  const createNewFile = () => {
    const newID = uuidv4()
    const newFile = {
      id: newID,
      title: '',
      body: '## this is a new file',
      createdAt: new Date().getTime(),
      isNew: true
    }
    setFiles({ ...files, [newID]: newFile })
  }

  //当前文件保存
  const saveCurrentFile = () => {
    fileHelper.writeFile(join(savedLocation, `${activeFile.title}`), activeFile.body)
      .then(() => {
        setUnsavedFileIDs(unsavedFileIDs.filter(id => activeFile.id !== id))
      })
  }
  return (
    <div className="App container-fluid px-0">
      <div className="row no-gutters">
        <div className="col-3 bg-light left-panel">
          <FileSearch 
            title="我的云笔记"
            onFileSearch={filesSearch}
          />
          <FileList 
            files={fileListArr}
            onFileClick={fileClick}
            onFileDelete={deleteFile}
            onSaveEdit={updateFileName}
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
                onBtnClick={createNewFile}
              />
            </div>
          </div>
        </div>
        <div className="col-9 right-panel">
          { 
            !activeFile &&
            <div className="start-page">
              选择打开或者创建 markdown 文档
            </div>
          }
          {
            activeFile &&
            <>
              <TabList 
                files={openedFiles}
                onTabClick={tabClick}
                activeId={activeFileID}
                onCloseTab={tabClose}
                unSaveIds={unsavedFileIDs}
              />
              <SimpleMDE
                key={activeFile && activeFile.id} 
                value={activeFile && activeFile.body}
                onChange={(value) => {fileChange(activeFileID, value)}}
                options={{
                  minHeight: '475px'
                }}
              />
            <div className="col">
              <BottomBtn 
                text="保存"
                colorClass="btn-primary"
                icon={faSave}
                onBtnClick={saveCurrentFile}
              />
            </div>
            </> 
          }         
        </div> 
      </div>
    </div>
  );
}

export default App;
