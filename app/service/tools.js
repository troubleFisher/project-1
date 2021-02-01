'use strict';
const { Service } = require('egg');
const fse = require('fs-extra');
const path = require('path');
const nodemailer = require('nodemailer');

const userEmail = 'ty418740662@163.com';
const transporter = nodemailer.createTransport({
  service: '163',
  secureConnection: true,
  auth: {
    user: userEmail,
    pass: 'XFXXPOTYNMXZBQUZ',
  },
});

class ToolService extends Service {
  async sendMail(email, subject, text, html) {
    const mailOptions = {
      from: userEmail,
      cc: userEmail, // 抄送（规避被当成垃圾邮件）
      to: email,
      subject,
      text,
      html,
    };

    try {
      await transporter.sendMail(mailOptions);
      return true;
    } catch (error) {
      return false;
    }
  }

  async mergeFile(filePath, fileHash, size) {
    // 切片文件夹路径
    const chunkDir = path.resolve(this.config.UPLOAD_DIR, fileHash);
    let chunks = await fse.readdir(chunkDir);
    chunks.sort((a, b) => a.split('_')[1] - b.split('_')[1]);
    chunks = chunks.map(cp => path.resolve(chunkDir, cp));
    await this.mergeChunks(chunks, filePath, size);
  }

  async mergeChunks(filesList, filePath, size) {
    const pipStream = (file, WriteStream) => {
      return new Promise(resolve => {
        const readStream = fse.createReadStream(file);
        readStream.on('end', () => {
          fse.unlinkSync(file);
          resolve();
        });
        readStream.pipe(WriteStream);
      });
    };

    await Promise.all(
      filesList.map((file, index) => {
        return pipStream(
          file,
          fse.createWriteStream(filePath, {
            start: index * size,
            end: (index + 1) * size,
          })
        );
      })
    );
  }
}

module.exports = ToolService;
