import React, { useState, useEffect }from 'react';
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

//require node.js modules
const { join, basename, extname, dirname } = window.require('path')
//remote made render process use app methods of main process
const { remote, ipcRenderer } = window.require('electron')
const Store = window.require('electron-store')

const fileStore = new Store({ 'name': 'Files Data' })
//electron-store 保存路径 %APPDATA% C:\Users\Administrator\AppData\Roaming\note-edit

const saveFilesToStore = (files) => {
  const filesStoreObj = objToArr(files).reduce((result, file) => {
    const { id, path, title, createdAt } = file
    result[id] = {
      id,
      path,
      title,
      createdAt
    }
    return result
  }, {})
  fileStore.set('files', filesStoreObj)
}

function App() {
  const [ files, setFiles ] = useState(fileStore.get('files') || {})
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
    //设置当前的激活状态的文件
    setActiveFileID(fileID)
    const currentFile = files[fileID]
    if (!currentFile.isLoaded) {
      fileHelper.readFile(currentFile.path).then(value => {
        const newFile = { ...files[fileID], body: value, isLoaded: true }
        setFiles({ ...files, [fileID]: newFile })
      })
    }
    //如果打开数组总包含当前点击的则不添加
    if (!openedFileIDs.includes(fileID)) {
      setOpenedFileIDs([...openedFileIDs, fileID])
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
    if (files[id].isNew) {
      //delete files[id] 这里不使用delete直接修改state
      const { [id]: value, ...afterDelete } = files
      setFiles(afterDelete)
    } else {
      fileHelper.deleteFile(files[id].path).then(() => {
        const { [id]: value, ...afterDelete } = files
        setFiles(afterDelete)
        saveFilesToStore(afterDelete)
        //如果文件是打开的 需要关闭这个tab
        tabClose(id)
      })
    }
  }
  //点击icon/新建文件时编辑文件名
  const updateFileName = (id, title, isNew) => {
    //更改名字的文件路径应该由是否是新创建的文件决定，如果不是newPath应该是old dirname + new title
    const newPath = isNew ? join(savedLocation, `${title}.md`) : join(dirname(files[id].path), `${title}.md`)
    const modifiedFile = { ...files[id], title: title, isNew: false, path: newPath }
    const newFiles = { ...files, [id]: modifiedFile }
    //新建文件的命名处理
    if (isNew) {
      fileHelper.writeFile(newPath, files[id].body).then(() => {
        setFiles(newFiles)
        saveFilesToStore(newFiles)
      })
    } else {
      const oldPath = files[id].path
      fileHelper.renameFile(oldPath, newPath).then(() => {
        setFiles(newFiles)
        saveFilesToStore(newFiles)
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
    fileHelper.writeFile(activeFile.path, activeFile.body)
      .then(() => {
        setUnsavedFileIDs(unsavedFileIDs.filter(id => activeFile.id !== id))
      })
  }
  //导入文件
  const importFiles = () => {
    remote.dialog.showOpenDialog({
      title: '选择导入的markdown文档',
      properties: ['openFile', 'multiSelections'],
      filters: [
        { name: 'markdown files', extensions: ['md'] }
      ]
    }, (paths) => {
      //考虑取选择文件时
      if (Array.isArray(paths)) {
        //过滤和electron-store中相同的文件
        const filteredPaths = paths.filter(path => {
          const alreadyAdded = Object.values(files).find(file => file.path === path)
          return !alreadyAdded
        })
        //对paths此数组进行信息添加
        const importFilesArr = filteredPaths.map(path => {
          return {
            id: uuidv4(),
            title: basename(path, extname(path)),
            path
          }
        })
        //将flattenArr 转化为文件同统一的对象格式
        const newFiles = { ...files, ...flattenArr(importFilesArr) }
        //数据写入到electron-store中且对state进行更新
        setFiles(newFiles)
        saveFilesToStore(newFiles)
        if (importFilesArr.length > 0) {
          remote.dialog.showMessageBox({
            type: 'info',
            title: `result`,
            message: `成功导入${importFilesArr.length}个文件`
          })
        }
      } 
    })
  }
  useEffect(() => {
    const callback = () => {
      console.log('yo')
    }
    ipcRenderer.on('create-new-file', callback)
    return () => {
      ipcRenderer.removeListener('create-new-file', callback)
    }
  })
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
                onBtnClick={importFiles}
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
