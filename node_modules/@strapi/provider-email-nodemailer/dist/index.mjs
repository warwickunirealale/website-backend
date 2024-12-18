import _ from "lodash";
import nodemailer from "nodemailer";
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
    const transporter = nodemailer.createTransport(providerOptions);
    return {
      send(options) {
        const emailOptions = {
          ..._.pick(options, emailFields),
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
export {
  index as default
};
//# sourceMappingURL=index.mjs.map
