const qiniu = require('qiniu')

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