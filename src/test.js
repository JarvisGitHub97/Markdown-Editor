const qiniu = require('qiniu')
const path =require('path')
const QiniuManager = require('./utils/qiniuManager.js')
//鉴权对象
var accessKey = 'UzkilnXmJFQFF86NtUYoZWKdIPxaBMjVGFVpBPwI';
var secretKey = 'yXHB8ydepVcLGI_APzXiN50jwTgxVwR6Ck1baTuw';
var localFile = '/coding/笔记/杂/坚持就是实力.md';
var key='坚持就是实力.md';
const downloadPath = path.join(__dirname, key)


const manager = new QiniuManager(accessKey, secretKey, 'noteedit')
// manager.upLoadFile(key, localFile).then((data) => {
//   console.log('upload success', data)
//   return manager.deleteFile(key)
// }, (err) => {
//   console.log(err)
// }).then((data) => {
//   console.log('delete success', data)
// })

// manager.getBucketDomain().then((data) => {
//   console.log(data)
// })

// manager.generatedDownloadLink(key).then(data => {
//   console.log(data)
//   return manager.generatedDownloadLink('muhah.md')
// }).then(data => {
//   console.log(data)
// })

// manager.downloadFile(key, downloadPath).then(() => {
//   console.log('success download')
// })

manager.upLoadFile(key, localFile).then((data) => {
  console.log('upload success', data)
}, (err) => {
  console.log(err)
})