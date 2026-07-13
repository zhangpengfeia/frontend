const svgCaptcha = require("svg-captcha");

/**
 *
 * @returns {Object} captcha 生成的验证码对象
 */
module.exports.getCaptchaService = async function () {
  return svgCaptcha.create({
    size: 4,
    ignoreChars: "iIl10Oo",
    noise: 6,
    color: true,
  });
};
