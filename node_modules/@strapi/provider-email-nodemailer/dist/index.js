"use strict";
const _ = require("lodash");
const nodemailer = require("nodemailer");
const _interopDefault = (e) => e && e.__esModule ? e : { default: e };
const ___default = /* @__PURE__ */ _interopDefault(_);
const nodemailer__default = /* @__PURE__ */ _interopDefault(nodemailer);
const emailFields = [
  "from",
  "replyTo",
  "to",
  "cc",
  "bcc",
  "subject",
  "text",
  "html",
  "attachments"
];
const index = {
  provider: "nodemailer",
  name: "Nodemailer",
  init(providerOptions, settings) {
    const transporter = nodemailer__default.default.createTransport(providerOptions);
    return {
      send(options) {
        const emailOptions = {
          ...___default.default.pick(options, emailFields),
          from: options.from || settings.defaultFrom,
          replyTo: options.replyTo || settings.defaultReplyTo,
          text: options.text || options.html,
          html: options.html || options.text
        };
        return transporter.sendMail(emailOptions);
      }
    };
  }
};
module.exports = index;
//# sourceMappingURL=index.js.map
