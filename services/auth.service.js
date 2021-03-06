const JWT = require("jsonwebtoken");
const User = require("../models/User.model");
const Token = require("../models/Token.model");
const sendEmail = require("../utils/email/sendEmail");
const crypto = require("crypto");
const bcrypt = require("bcrypt");
const axios = require("axios");

const JWTSecret = process.env.JWT_SECRET;
const bcryptSalt = process.env.BCRYPT_SALT;
const clientURL = process.env.CLIENT_URL;

const signup = async (data) => {
  let user = await User.findOne({ email: data.email });
  if (user) {
    throw new Error("Email already exist", 422);
  }

  // Generate random user id
  let userTypingId = crypto.randomBytes(10).toString("hex");

  data.userTypingId = userTypingId;

  const patternResponse = await axios({
    method: "post",
    url: `https://api.typingdna.com/auto/${userTypingId}`,
    data: {
      tp: data.pattern,
    },
    auth: {
      username: process.env.TYPINGDNA_USERNAME,
      password: process.env.TYPINGDNA_PASSWORD,
    },
  })
    .catch((error) => {
      return error.message;
    })
    .then((response) => {
      console.log("Success enrolment: " + JSON.stringify(response.data));
      return response.data;
    });

  user = new User(data);
  const token = JWT.sign({ id: user._id }, JWTSecret);
  await user.save();

  console.log(" user :" + user);

  return (data = {
    userId: user._id,
    email: user.email,
    name: user.name,
    token: token,
    pattern: patternResponse.data,
  });
};

const requestPasswordReset = async (email) => {
  const user = await User.findOne({ email });
  if (!user) throw new Error("Email does not exist");

  let token = await Token.findOne({ userId: user._id });
  if (token) await token.deleteOne();

  let resetToken = crypto.randomBytes(32).toString("hex");
  const hash = await bcrypt.hash(resetToken, Number(bcryptSalt));

  await new Token({
    userId: user._id,
    token: hash,
    createdAt: Date.now(),
  }).save();

  const link = `${clientURL}/resetPassword?token=${resetToken}&id=${user._id}`;

  await sendEmail(
    user.email,
    "Password Reset Request",
    {
      name: user.name,
      link: link,
    },
    "./template/requestResetPassword.handlebars"
  );
  return link;
};

const resetPassword = async (userId, token, password, pattern) => {
  let passwordResetToken = await Token.findOne({ userId });
  const user1 = await User.findById({ _id: userId });

  const patternResponse = await axios({
    method: "post",
    url: `https://api.typingdna.com/auto/${user1.userTypingId}`,
    auth: {
      username: process.env.TYPINGDNA_USERNAME,
      password: process.env.TYPINGDNA_PASSWORD,
    },
  })
    .catch((error) => {
      return error.message;
    })
    .then((response) => {
      console.log("Success verification: " + JSON.stringify(response.data));
      return response.data;
    });

  if (!patternResponse) {
    throw new Error("Invalid Pattern");
  }
  if (patternResponse.status != 200 && patternResponse.data.result=='1' ) {
    const result = await patternResponse;
    throw new Error(result.message);
  }

  if (!passwordResetToken) {
    throw new Error("Invalid or expired password reset token");
  }

  const isValid = await bcrypt.compare(token, passwordResetToken.token);

  if (!isValid) {
    throw new Error("Invalid or expired password reset token");
  }

  const hash = await bcrypt.hash(password, Number(bcryptSalt));

  await User.updateOne(
    { _id: userId },
    { $set: { password: hash } },
    { new: true }
  );

  const user = await User.findById({ _id: userId });

  await sendEmail(
    user.email,
    "Password Reset Successfully",
    {
      name: user.name,
    },
    "./template/resetPassword.handlebars"
  );

  await passwordResetToken.deleteOne();

  return true;
};

module.exports = {
  signup,
  requestPasswordReset,
  resetPassword,
};
