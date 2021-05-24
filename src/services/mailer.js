const nodemailer = require('nodemailer');


module.exports.sendEmail = (data, done) => {
  let transporter = nodemailer.createTransport({
    service: 'Gmail',
    auth: {
      user: "qlda.lienhe@gmail.com",
      pass: "matkhau123",
    },
  });
  let mainOptions = {
    from: data.data.from,
    to: data.to,
    subject: data.data.subject,
    text: data.data.text,
    html: data.data.html,
  };
  transporter.sendMail(mainOptions);
  done();
};
