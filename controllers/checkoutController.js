const db = require("../models");

const express = require("express");
const router = express.Router();

const randomID = require("../components/randomID");
const auth = require("../components/auth");

var routerCheckout = require("require-directory")(
  module,
  "../router/checkout/",
);

router.use("/checkout", auth(["guest"]), routerCheckout.checkout);

router.use("/kulakan", auth(["admin", "clerk"]), routerCheckout.kulakan);

module.exports = router;
