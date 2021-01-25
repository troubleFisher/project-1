'use strict';

const baseController = require('./base');
const md5 = require('md5');
const jwt = require('jsonwebtoken');

const HashSalt = ':secret@123';

const createRule = {
  email: { type: 'email' },
  username: { type: 'string' },
  password: { type: 'string' },
  captcha: { type: 'string' },
};

class UserController extends baseController {
  async login() {
    const { ctx, app } = this;
    const { email, password, captcha } = ctx.request.body;
    if (captcha.toUpperCase() !== ctx.session.captcha.toUpperCase()) {
      return this.error('验证码错误');
    }
    const user = await ctx.model.User.findOne({
      email,
      password: md5(password + HashSalt),
    });

    if (!user) {
      return this.error('用户密码错误');
    }
    // 用户信息加密成token
    const token = jwt.sign(
      {
        email,
        _id: user._id,
      },
      app.config.jwt.secret,
      { expiresIn: '1h' }
    );
    this.success({ token, email, username: user.username });
  }

  async register() {
    const { ctx } = this;

    try {
      ctx.validate(createRule);
    } catch (e) {
      return this.error('参校验失败', -1, e.errors);
    }

    const { email, password, captcha, username } = ctx.request.body;
    // 验证码校验
    if (captcha.toUpperCase() !== ctx.session.captcha.toUpperCase()) {
      return this.error('验证码错误');
    }
    // 邮箱校验
    if (await this.checkEmail(email)) {
      return this.error('邮箱重复');
    }

    const ret = await ctx.model.User.create({
      email,
      username,
      password: md5(password + HashSalt),
      captcha,
    });
    if (ret._id) {
      this.success('注册成功');
    }
  }

  async checkEmail(email) {
    const user = await this.ctx.model.User.findOne({ email });
    return user;
  }

  async verify() {
    // 校验用户名是否存在
  }

  async info() {}
}

module.exports = UserController;
