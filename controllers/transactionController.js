const db = require("../models");

const express = require("express");
const router = express.Router();

const randomID = require("../components/randomID");
const auth = require("../components/auth");

var routerCheckout = require("require-directory")(
  module,
  "../router/checkout/",
);

//get all being processed
router.use(
  "/process",
  auth(["admin", "clerk"]),
  routerCheckout.transactionInProcess,
);

//edit
router.use("/process", auth(["clerk"]), routerCheckout.editTransactionProcess);

//get all user transaction still processed or not
router.use(
  "/usertransaction",
  auth(["clerk"], ["guest"]),
  routerCheckout.userTransaction,
);

router.use("/checkout", auth(["guest"]), routerCheckout.checkout);

router.use("/kulakan", auth(["admin", "clerk"]), routerCheckout.kulakan);

module.exports = router;
