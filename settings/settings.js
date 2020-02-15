const { remote, ipcRenderer } = require('electron') 
const Store = require('electron-store')
const settingsStore = new Store({ name: 'Settings' })
const qiniuConfigArr = ['#saved-file-location', '#accessKey', '#secretKey', '#bucketName']

const $ = (selector) => {
  const result = document.querySelectorAll(selector)
  return result.length > 1 ? result : result[0] 
}

document.addEventListener('DOMContentLoaded', () => {
  let savedLocation =  settingsStore.get('savedFileLocation')
  if (savedLocation) {
    $('#saved-file-location').value = savedLocation
  }
  // 上次记录自动填满当前的input
  qiniuConfigArr.forEach(selector => {
    const savedValue = settingsStore.get(selector.substr(1))
    if (savedValue) {
      $(selector).value = savedValue
    }
  })
  $('#select-new-location').addEventListener('click', () => {
    remote.dialog.showOpenDialog({
      properties: ['openDirectory'],
      message: '选择文件存储的位置'
    }, (path) => {
      if (Array.isArray(path)) {
        $('#saved-file-location').value = path[0]
      }
    })
  })
  $('#settings-form').addEventListener('submit', (e) => {
    e.preventDefault()
    qiniuConfigArr.forEach(selector => {
      if ($(selector)) {
        let { id, value } = $(selector)
        settingsStore.set(id, value ? value : '')
      }
    })
    //当配置选项全部填写完成时，发送时间给主进程
    ipcRenderer.send('config-is-saved')
    remote.getCurrentWindow().close()
  })
  $('.nav-tabs').addEventListener('click', (e) => {
    e.preventDefault()
    $('.nav-link').forEach((item) => {
      item.classList.remove('active')
    })
    e.target.classList.add('active')
    $('.config-area').forEach((item) => {
      item.style.display = 'none'
    })
    $(e.target.dataset.tab).style.display = 'block'
  })
})