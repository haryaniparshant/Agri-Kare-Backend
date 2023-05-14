const express = require('express');

const router = express.Router();
const mongoose = require('mongoose');
const User = mongoose.model("User");
const Question = mongoose.model("Question");
const Answer = mongoose.model("Answer");
const jwt = require('jsonwebtoken');
// 
require('dotenv').config();
// 
const bcrypt = require('bcrypt');
const nodemailer = require("nodemailer");


// nodemailer
async function mailer(recieveremail, code) {


    let transporter = nodemailer.createTransport({
        host: "smtp.gmail.com",
        port: 587,

        secure: false, // true for 465, false for other ports
        requireTLS: true,
        auth: {
            user: "agrikare777@gmail.com", // generated ethereal user
            pass: "ramcqiuicuqvuotb", // generated ethereal password
        },
    });

    // send mail with defined transport object
    let info = await transporter.sendMail({
        from: 'agrikare777@gmail.com', // sender address
        to: `${recieveremail}`, // list of receivers
        subject: "Signup Verification", // Subject line
        text: `Your Verification Code is ${code}`, // plain text body
        html: `<b>Your Verification Code is ${code}</b>`, // html body
    });

    console.log("Message sent: %s", info.messageId);

    console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));

}

//

router.post('/signup', async (req, res) => {
    console.log('sent by client - ', req.body);
    const { name, email, password, dob, CNIC } = req.body.fdata;
    console.log(req.body.fdata);
    const user = new User({
        name,
        email,
        password,
        dob,
        CNIC
    })

    try {
        await user.save();
        const token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET);
        res.send({ message: "User Registered Successfully", token });
    }
    catch (err) {
        console.log(err);
    }

})


router.post('/verify', (req, res) => {
    console.log('sent by client - ', req.body);
    const { name, email, password, dob, CNIC } = req.body.fdata;
    if (!name || !email || !password || !dob || !CNIC) {
        return res.status(422).json({ error: "Please add all the fields" });
    }


    User.findOne({ email: email })
        .then(async (savedUser) => {
            if (savedUser) {
                return res.status(422).json({ error: "Invalid Credentials" });
            }
            try {

                let VerificationCode = Math.floor(100000 + Math.random() * 900000);
                let user = [
                    {
                        name,
                        email,
                        password,
                        dob,
                        CNIC,
                        VerificationCode
                    }
                ]
                // await mailer(email, VerificationCode);
                res.send({ message: "Verification Code Sent to your Email", udata: user });
            }
            catch (err) {
                console.log(err);
            }
        })


})



router.post('/signin', async (req, res) => {
    const { email, password } = req.body;
    console.log(email);
    console.log(email,password);
    if (!email || !password) {
        return res.status(422).send({ error: "Please add email or password" });
    }
    const savedUser = await User.findOne({ email: email })

    if (!savedUser) {
        return res.send({ error: "Invalid Credentials" });
    }

    try {
        bcrypt.compare(password, savedUser.password, (err, result) => {
            if (result) {
                console.log("Password matched");
                const token = jwt.sign({ _id: savedUser._id }, process.env.JWT_SECRET);
                res.send({ token, savedUser });
            }
            else {
                console.log('Password does not match');
                return res.send({ error: "Invalid Credentials" });
            }
        })
    }
    catch (err) {
        console.log(err);
    }
})
router.post("/questions", async (req, res) => {
    try {
      const question = new Question({
        user_id: req.body.user_id,
        question_text: req.body.question_text,
        is_approved: true,
      });
      const savedQuestion = await question.save();
      res.json(savedQuestion);
    } catch (err) {
      res.status(500).send(err);
    }
  });
  
router.post("/answers", async (req, res) => {
    try {
      const answer = new Answer({
        user_id: req.body.user_id,
        question_id: req.body.question_id,
        answer_text: req.body.answer_text,
        is_approved: true,
      });
      const savedAnswer = await answer.save();
      res.json(savedAnswer);
    } catch (err) {
      res.status(500).send(err);
    }
});
router.get("/questions", async (req, res) => {
    try {
      const questions = await Question.find({ is_approved: true });
      res.json(questions);
    } catch (err) {
      res.status(500).send(err);
    }
  });
  
  router.get("/answers", async (req, res) => {
    try {
      const answers = await Answer.find({ is_approved: true });
      res.json(answers);
    } catch (err) {
      res.status(500).send(err);
    }
  });
module.exports = router;