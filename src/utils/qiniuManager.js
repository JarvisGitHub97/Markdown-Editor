const qiniu = require('qiniu')
const axios = require('axios')
const fs = require('fs')
class QiniuManager {
  constructor(accessKey, secretKey, bucket) {
    this.mac = new qiniu.auth.digest.Mac(accessKey, secretKey)
    this.bucket = bucket
    //初始化配置类
    this.config = new qiniu.conf.Config()
    // 空间对应的机房
    this.config.zone = qiniu.zone.Zone_z0
    this.bucketManager = new qiniu.rs.BucketManager(this.mac, this.config)
  }
  upLoadFile(key, localFilePath) {
    //上传凭证token
    var options = {
      scope: this.bucket + ":" + key
    }
    var putPolicy = new qiniu.rs.PutPolicy(options)
    var uploadToken=putPolicy.uploadToken(this.mac)
    var formUploader = new qiniu.form_up.FormUploader(this.config)
    var putExtra = new qiniu.form_up.PutExtra()
    
    //使用promise管理异步操作
    return new Promise((resolve, reject) => {
      formUploader.putFile(uploadToken, key, localFilePath, putExtra, this._handleCallback(resolve, reject));
    })

  }
  deleteFile(key) {
    return new Promise((resolve, reject) => {
      this.bucketManager.delete(this.bucket, key, this._handleCallback(resolve, reject))
    })
  }

  getBucketDomain() {
    const reqURL = `http://api.qiniu.com/v6/domain/list?tbl=${this.bucket}`
    const digest = qiniu.util.generateAccessToken(this.mac, reqURL)
    return new Promise((resolve, reject) => {
      qiniu.rpc.postWithoutForm(reqURL, digest, this._handleCallback(resolve, reject))
    })
  }
  generatedDownloadLink(key) {
    const domainPromise = this.publicBucketDomain ?
      Promise.resolve([this.publicBucketDomain]) : this.getBucketDomain()
    return domainPromise.then(data => {
      if (Array.isArray(data) && data.length > 0) {
        const pattern = /^http?/
        this.publicBucketDomain = pattern.test(data[0]) ? data[0] : `http://${data[0]}`
        return this.bucketManager.publicDownloadUrl(this.publicBucketDomain, key)
      } else {
        throw Error('域名未找到，请检检查存储空间是否过期')
      }
    })
  }

  downloadFile(key, downloadPath) {
    //1. 获取 下载链接
    //2. 向这个下载链接发送请求，返回一个可读流
    //3. 创建一个可写流，可读流到可写流的转换(容器)
    //4. 将结果构造成一个promise对象
    return this.generatedDownloadLink(key).then((link) => {
      const timeStamp = new Date().getTime()
      const url = `${link}?timestamp=${timeStamp}`
      return axios({
        url,
        method: 'GET',
        responseType: 'stream',
        headers: {'Cache-Control': 'no-cache'}
      }).then(response => {
        const writer = fs.createWriteStream(downloadPath)
        response.data.pipe(writer)
        return new Promise((resolve, reject) => {
          writer.on('finish', resolve)
          writer.on('error', reject)
        })
      }).catch(err => {
        return Promise.reject({err: err.response})
      })
      
    })
  }
  getStat(key) {
    return new Promise((resolve, reject) => {
      this.bucketManager.stat(this.bucket, key, this._handleCallback(resolve, reject))
    }) 
  }
  _handleCallback(resolve, reject) {
    return (respErr, respBody, respInfo) => {
      if (respErr) {
        throw respErr;
      }
      if (respInfo.statusCode === 200) {
        resolve(respBody)
      } else {
        reject({
          statusCode: respInfo.statusCode,
          body: respBody
        })
      }
    }
  }
}

module.exports = QiniuManager