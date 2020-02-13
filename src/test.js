const qiniu = require('qiniu')
const QiniuManager = require('./utils/qiniuManager.js')
//鉴权对象
var accessKey = 'UzkilnXmJFQFF86NtUYoZWKdIPxaBMjVGFVpBPwI';
var secretKey = 'yXHB8ydepVcLGI_APzXiN50jwTgxVwR6Ck1baTuw';
var localFile = '/Documents/myStore/shadowsocks.md';
var key='shadowsocks.md';
// var publicBucketDomain = 'http://q5ku5dhfe.bkt.clouddn.com';

const manager = new QiniuManager(accessKey, secretKey, 'noteedit')
// manager.upLoadFile(key, localFile).then((data) => {
//   console.log('upload success', data)
//   return manager.deleteFile(key)
// }, (err) => {
//   console.log(err)
// }).then((data) => {
//   console.log('delete success', data)
// })


manager.getBucketDomain().then((data) => {
  console.log(data)
})

