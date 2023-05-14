const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    password: {
        type: String,
        required: true

    },
    dob: {
        type: String,
        required: true
    },
    CNIC: {
        type: String,
        required: true
    }

})
const questionSchema = new mongoose.Schema({
    user_id: String,
    question_text: String,
    is_approved: Boolean,
  });
  
  const answerSchema = new mongoose.Schema({
    user_id: String,
    question_id: String,
    answer_text: String,
    is_approved: Boolean,
});
userSchema.pre('save', async function (next) {
    const user = this;
    console.log("Just before saving before hashing  ", user.password);
    if (!user.isModified('password')) {
        return next();
    }
    user.password = await bcrypt.hash(user.password, 8);
    console.log("Just before saving & after hashing", user.password);
    next();
})


mongoose.model("User", userSchema);
mongoose.model("Question", questionSchema);
mongoose.model("Answer", answerSchema);