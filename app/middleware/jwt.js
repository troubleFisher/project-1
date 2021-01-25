'use strict';
const jwt = require('jsonwebtoken');

// 解析token的中间价，也可以用egg-jwt
module.exports = ({ app }) => {
  return async function verify(ctx, next) {
    if (!ctx.request.header.authorization) {
      ctx.body = {
        code: -666,
        message: '用户没有登陆',
      };
      return;
    }
    const token = ctx.request.header.authorization.replace('Bearer', '');
    try {
      const ret = await jwt.verify(token, app.config.jwt.secret);

      ctx.state.email = ret.email;
      ctx.state._id = ret._id;
      await next();
    } catch (err) {
      if (err.name === 'TokenExpiredError') {
        ctx.body = {
          code: -666,
          message: '登陆过期',
        };
      } else {
        ctx.body = {
          code: -1,
          message: '登陆出错',
        };
      }
    }
  };
};
