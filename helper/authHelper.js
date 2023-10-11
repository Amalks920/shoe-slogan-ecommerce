const MailGen = require("mailgen");
const nodemailer = require("nodemailer");
const otpGenerator = require("otp-generator");

const sendOtp=(email)=>{
    let userEmail=email
    return new Promise((resolve,reject)=>{
        try {
        const EMAIL = process.env.MAILGEN_EMAIL;
        const PASSWORD = process.env.MAILGEN_PASSWORD;  

        let config = {
            service: "gmail",
            auth: {
              user: EMAIL,
              pass: PASSWORD,
            },
          };

        let transporter = nodemailer.createTransport(config);
        
        let MailGenerator = new MailGen({
            theme: "default",
            product: {
              name: "Mailgen",
              link: "https://mailgen.js/",
            },
          });

          let otp = otpGenerator.generate(6, {
            upperCaseAlphabets: false,
            specialChars: false,
            lowerCaseAlphabets: false,
            digits: true,
          });
          let response = {
            body: {
              Email: userEmail,
              intro: `Your OTP ${otp})}`,
    
              outro: "Expires within 10 minuites",
            },
          };
    
          let mail = MailGenerator.generate(response);
    
          let message = {
            from: EMAIL,
            to: userEmail,
            subject: "Your OTP",
            html: mail,
          };
    
          transporter
            .sendMail(message)
            .then(async () => {

                resolve({otp:otp,email:userEmail})
            //   req.session.otp = otp;
            //   req.session.email=userEmail
            //   req.session.isUserOtpSend=true
    
              //res.redirect("/verify-otp-admin-f");
            })
        
        } catch (error) {
            reject(error)
        }
    })
}

module.exports={
    sendOtp
}