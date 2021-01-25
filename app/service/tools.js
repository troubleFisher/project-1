'use strict';
const { Service } = require('egg');
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
}

module.exports = ToolService;
