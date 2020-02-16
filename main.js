const { app, Menu, ipcMain, dialog } = require('electron')
const isDev = require('electron-is-dev')
const menuTemplate = require('./src/menuTemplate.js')
const AppWindow = require('./src/AppWindow')
const path = require('path')
const Store = require('electron-store')
const QiniuManager = require('./src/utils/qiniuManager.js')
const settingsStore = new Store({ name: 'Settings' })
const fileStore = new Store({ name: 'Files Data' })
let mainWindow, settingsWindow

//实例化一个管理云操作的对象
const createManager = () => {
  const accessKey = settingsStore.get('accessKey')
  const secretKey = settingsStore.get('secretKey')
  const bucketName = settingsStore.get('bucketName')
  return new QiniuManager(accessKey, secretKey, bucketName)
}

app.on('ready', () => {
  const mainWindowConfig = {
    width: 1440,
    height: 768,
  }
  //模式选择
  const urlLocation = isDev ? 'http://localhost:3000' : 'dummyurl'
  //创建主进程
  mainWindow = new AppWindow(mainWindowConfig, urlLocation)
  mainWindow.on('closed', () => {
    mainWindow = null
  })
  //设置原生菜单
  let menu = Menu.buildFromTemplate(menuTemplate)
  Menu.setApplicationMenu(menu)  
  //hook up main events
  ipcMain.on('open-settings-window', () => {
    const settingsWindowConfig = {
      width: 600,
      height: 500,
      parent: mainWindow
    }
    const settingsFileLocation = `file://${path.join(__dirname, './settings/settings.html')}`
    settingsWindow = new AppWindow(settingsWindowConfig, settingsFileLocation)
    settingsWindow.removeMenu()
    settingsWindow.on('closed', () => {
      settingsWindow = null
    })
  })
  ipcMain.on('config-is-saved', () => {
    //注意mac和windows的菜单项个数不同
    let qiniuMenu = process.platform === 'darwin' ? menu.items[3] : menu.items[2]
    const switchItems = (toggle) => {
      [1, 2, 3].forEach(number => {
        qiniuMenu.submenu.items[number].enabled = toggle
      })
    }
    const qiniuIsConfiged =  ['accessKey', 'secretKey', 'bucketName'].every(key => !!settingsStore.get(key)) 
    if (qiniuIsConfiged) {
      switchItems(true)
    } else {
      switchItems(false)
    }
  })
  //上传
  ipcMain.on('upload-file', (event, data) => {
    const manager = createManager()
    manager.upLoadFile(data.key, data.path).then((data) => {
      console.log('上传成功', data)
      mainWindow.webContents.send('active-file-uploaded')
    }).catch(() => {
      dialog.showErrorBox('上传失败', '请检查七牛云同步参数是否正确')
    })
  })
  //下载
  ipcMain.on('download-file', (event, data) => {
    const manager = createManager()
    const filesObj = fileStore.get('files')
    const { key, id, path } = data 
    //获取云端指定文件信息
    manager.getStat(data.key).then((res) => {
      const serverUpdatedTime = Math.round(res.putTime/10000)
      const localUpdatedTime = filesObj[id].updatedAt 
      //同名文件在其他终端上传过或者该文件没有上传过云端
      if (serverUpdatedTime > localUpdatedTime || !localUpdatedTime) {
        console.log('new file downloaded')
        manager.downloadFile(key, path).then(() => {
          mainWindow.webContents.send('active-file-downloaded', { status: 'download-success', id })
        })
      } else {
        console.log('no new file')
        mainWindow.webContents.send('active-file-downloaded', { status: 'no-new-file', id })
      }
    }, (err) => {
      console.log(err)
      if (err.statusCode === 612) {
        mainWindow.webContents.send('active-file-downloaded', { status: 'no-file', id })
      }
    })
  })
  //全部同步到云端
  ipcMain.on('upload-all-to-qiniu', () => {
    mainWindow.webContents.send('loading-status', true)
    const manager = createManager()
    const filesObj = fileStore.get('files') || {}
    const uploadPromiseArr = Object.keys(filesObj).map(key => {
      const file = filesObj[key]
      return manager.upLoadFile(`${file.title}.md`, file.path)
    })
    Promise.all(uploadPromiseArr).then((result) => {
      console.log(result)
      dialog.showMessageBox({
        type: 'info',
        title: '上传成功',
        message: `已成功上传了 ${result.length} 个文件到云端`
      })
      mainWindow.webContents.send('all-files-uploaded')
    }).catch(() => {
      dialog.showErrorBox('上传失败', '请检查七牛云同步参数是否正确')
    }).finally(() => {
      setTimeout(() => {
        mainWindow.webContents.send('loading-status', false)
      }, 5000)
    })
  })
})