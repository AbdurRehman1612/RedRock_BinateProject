const nodemailer = require('nodemailer');
const transporter = nodemailer.createTransport({
  service: 'appsstaging',
  host: 'server.appsstaging.com',
  port: 465,
  secure: true,
  auth: {
    user: 'noreply@server.appsstaging.com',
    pass: 'Technado@1234'
  }
});
// const transporter = nodemailer.createTransport({
//   service: 'Gmail',
//   host: 'smtp.gmail.com',
//   port: 465,
//   secure: true,
//   auth: {
//     user: 'dev.appsnado@gmail.com',
//     pass: 'Bj~s=QBUwY9e~'
//   }
// });
const sendEmail = (email_obj) => {
  const mailOptions = {
    from: 'noreply@server.appsstaging.com', // sender address
    to: email_obj.user_email, // list of receivers
    subject: email_obj.email_subject, // Subject line
    attachments: [{
      filename: 'logo.png',
      path: process.cwd() + '/assets/images/logo.png',
      cid: 'imagename'
    }],
    html: `<table width="600" border="0" align="center" cellpadding="0" cellspacing="0" style="background:#f6f6f6;
        border: 1px solid #d8d8d8;
        padding: 0 24px 0px">
      <tr>
        <td><table width="603" border="0" align="center" cellpadding="0" cellspacing="0">
            <tr>
              <td width="382" align="center" style="padding:20px 0;"><img src="cid:imagename" width="150"></td>
            </tr>
          </table></td>
      </tr>
      <tr align="center" style="font-size:18px; font-family:Tahoma, Geneva, sans-serif;"> </tr>
      <tr>
        <td style="background: none repeat scroll 0 0 #A901F7;color: #fff;font: bold 30px/35px Arial,Helvetica,sans-serif;margin-top: 25px;padding: 15px 0;text-align: center;text-transform: uppercase; ">
        ` + email_obj.email_html_heading + `
        </td>
      </tr>
      <tr>
        <td height="0"></td>
      </tr>
      <tr>
        <td bgcolor="#fff" style="font-family:Arial, Helvetica, sans-serif; padding:10px 18px 15px;"><table width="582" border="0" align="center" cellpadding="0" cellspacing="0">
            <tr>
              <td style="color:#3d3d3d; font-size:16px;line-height:26px; padding:10px 0; text-align:center; font-family:Arial, Helvetica, sans-serif;">` +
      email_obj.email_html_text +
      `</td>
            </tr>
            <tr>
              <td style="color:#004563; font-size:22px;line-height:26px; padding:10px 0;text-align:center; font-family:Arial, Helvetica, sans-serif;"><strong>` +
      email_obj.email_html_code +
      `</strong></td>
            </tr>


          </table></td>
      </tr>
      <tr>
        <td style="text-align:center;  color: #3d3d3d;
        font-size: 16px; font-family:Arial, Helvetica, sans-serif; padding:15px 0 ;">Copyright © 2021 Game of Mems</td>
      </tr>
    </table>`, // plain text body
  };
  transporter.sendMail(mailOptions, function(err, info) {
    if (err)
      console.log(err);
    else
      console.log(info);
  });
}
module.exports = sendEmail;
