'use strict';
const svgCaptcha = require('svg-captcha');
const fse = require('fs-extra');
const path = require('path');
const baseController = require('./base');

class UtilController extends baseController {
  async captcha() {
    const captcha = svgCaptcha.create({
      size: 4,
      fontSize: 50,
      width: 100,
      height: 32,
      noise: 2,
      color: true,
    });
    console.log('captcha==>', captcha.text);
    this.ctx.session.captcha = captcha.text;
    this.ctx.response.type = 'image/svg+xml';
    this.ctx.body = captcha.data;
  }

  async sendCode() {
    const { ctx } = this;

    const email = ctx.query.email;
    const code = Math.random().toString().slice(2, 6);

    ctx.session.emailcode = code;
    const subject = 'ty的验证码';
    const text = '啦啦啦';
    const html = `<h2>来看看ty的github点个赞吧<a href='https://github.com/troubleFisher'><span>${code}</span></a></h2>`;
    const hasSend = await this.service.tools.sendMail(
      email,
      subject,
      text,
      html
    );
    if (hasSend) {
      return this.message('发送成功');
    }
    this.error('发送失败');
  }

  async uploadFile() {
    // 模拟报错
    if (Math.random() < 0.5) {
      return (this.ctx.state = 500);
    }
    // 存放地址 /public/hash/name
    const { ctx } = this;
    const file = ctx.request.files[0];
    const { hash, name } = ctx.request.body;

    const chunkPath = path.resolve(this.config.UPLOAD_DIR, hash);
    // const filePath = path.resolve(chunkPath, name);
    if (!fse.existsSync(chunkPath)) {
      await fse.mkdir(chunkPath);
    }

    // await fse.move(file.filepath, this.config.UPLOAD_DIR + '/' + file.filename);
    await fse.move(file.filepath, `${chunkPath}/${name}`);
    // this.success({ url: `/public/${file.filename}` });
    this.message('切片上传成功');
  }

  async mergeFile() {
    const { ext, hash, size } = this.ctx.request.body;
    const filePath = path.resolve(this.config.UPLOAD_DIR, `${hash}.${ext}`);
    await this.ctx.service.tools.mergeFile(filePath, hash, size);
    this.success({
      url: `/public/${hash}.${ext}`,
    });
  }

  async checkFile() {
    const { hash, ext } = this.ctx.request.body;
    const filePath = path.resolve(this.config.UPLOAD_DIR, `${hash}.${ext}`);
    let uploaded = false;
    let uploadedList = [];
    if (fse.existsSync(filePath)) {
      // 文件存在
      uploaded = true;
    } else {
      uploadedList = await this.getUploadedList(
        path.resolve(this.config.UPLOAD_DIR, hash)
      );
    }
    this.success({ uploaded, uploadedList });
  }

  async getUploadedList(dirPath) {
    return fse.existsSync(dirPath) ? fse.readdirSync(dirPath) : [];
  }
}

module.exports = UtilController;
