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
  const patternResponse = await axios({
    method: "post",
    url: `https://api.typingdna.com/auto/${data.name}`,
    data: {
      tp: data.pattern,
    },
    auth: {
      username: "apiKey",
      password: "apiSecret",
    },
  });

  user = new User(data);
  const token = JWT.sign({ id: user._id }, JWTSecret);
  await user.save();

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

  sendEmail(
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
  // let passwordResetToken = await Token.findOne({ userId });
  const user1 = await User.findById({ _id: userId });

  const patternResponse = await axios({
    method: "post",
    url: `https://api.typingdna.com/verify/${user1.name}`,
    data: {
      tp: pattern,
      quality: 2,
    },
    auth: {
      username: "apiKey",
      password: "apiSecret",
    },
  })
    .catch((error) => {
      // console.log(error.message);
      return error;
    })
    .then((response) => {
      return response.data;
    });

  if (patternResponse.status != 200) {
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

  sendEmail(
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
