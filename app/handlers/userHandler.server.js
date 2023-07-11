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
    try {
      const { name, cnic } = req.body;
      const user = await Users.findOne({ cnic });
      if (user) {
        const token = jwt.sign(user.id, process.env.JWT_KEY);
        res.json({
          success: true,
          response: 200,
          token: token,
          data: "User already exists",
        });
      } else {
        const newUser = await Users.create({ name, cnic });
        if (newUser) {
          const token = jwt.sign(newUser.id, process.env.JWT_KEY);
          res.json({
            success: true,
            response: 200,
            token: token,
            data: "User created successfully",
          });
        }
      }
    } catch (error) {
      res.send(error).status(500);
    }
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

  // this.changePassword = async function (req, res) {
  //   try {
  //     const user = await Users.findById(req.user);
  //     if (!validPassword(req.body.current_password, user)) {
  //       return res.status(400).send("Invalid Current Password");
  //     }
  //     let temp = rand(160, 36);
  //     let newpass = temp + req.body.new_password;
  //     let hashed_password = crypto
  //       .createHash("sha512")
  //       .update(newpass)
  //       .digest("hex");
  //     user.hashed_password = hashed_password;
  //     user.salt = temp;
  //     await user.save();
  //     res.status(200).send("Password successfully updated");
  //   } catch (e) {
  //     res.status(400).send(e);
  //   }
  // };
  // var validPassword = function (password, user) {
  //   let temp = user.salt;
  //   let hash_db = user.hashed_password;
  //   let newpass = temp + password;
  //   let hashed_password = crypto
  //     .createHash("sha512")
  //     .update(newpass)
  //     .digest("hex");
  //   return hashed_password == hash_db;
  // };
}

module.exports = UserHandler;
