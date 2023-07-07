"use strict";

var Users = require("../models/users.js");
var Polls = require("../models/polls");
const rand = require("csprng");
var crypto = require("crypto");
const jwt = require("jsonwebtoken");

function UserHandler(passport) {
  this.getUser = function (req, res) {
    Users.findOne({ email: req.user.email }, { _id: false }).exec(function (
      err,
      result
    ) {
      if (err) {
        throw err;
      }
      res.json(result);
    });
  };

  this.getUserById = async function (req, res) {
    const user = await Users.findById(req.user, {
      _id: false,
      password: 0,
      hashed_password: 0,
      polls: 0,
      salt: 0,
    });
    return res.json(user);
  };

  // user signup
  this.addUser = async function (req, res) {
    let temp = rand(160, 36);
    let newpass = temp + req.body.password;
    let hashed_password = crypto
      .createHash("sha512")
      .update(newpass)
      .digest("hex");
    var newUser = new Users({
      email: req.body.email,
      hashed_password: hashed_password,
      salt: temp,
      name: req.body.name,
    });
    const user = await Users.findOne({ email: newUser.email });
    if (user)
      return res.json({ response: "Email already Registered", res: false });
    await newUser.save();
    const token = jwt.sign(newUser.id, process.env.JWT_KEY);
    return res.json({ token: token });
  };

  this.getPolls = async function (req, res) {
    try {
      const user = await Users.findById(req.user);
      const polls = await Polls.find({ _id: { $in: user.polls } });
      return res.json(polls);
    } catch (e) {
      return res.status(400).send(err);
    }
  };

  this.changePassword = async function (req, res) {
    try {
      const user = await Users.findById(req.user);
      if (!validPassword(req.body.current_password, user)) {
        return res.status(400).send("Invalid Current Password");
      }
      let temp = rand(160, 36);
      let newpass = temp + req.body.new_password;
      let hashed_password = crypto
        .createHash("sha512")
        .update(newpass)
        .digest("hex");
      user.hashed_password = hashed_password;
      user.salt = temp;
      await user.save();
      res.status(200).send("Password successfully updated");
    } catch (e) {
      res.status(400).send(e);
    }
  };
  var validPassword = function (password, user) {
    let temp = user.salt;
    let hash_db = user.hashed_password;
    let newpass = temp + password;
    let hashed_password = crypto
      .createHash("sha512")
      .update(newpass)
      .digest("hex");
    return hashed_password == hash_db;
  };
}

module.exports = UserHandler;
