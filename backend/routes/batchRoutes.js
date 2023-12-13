const express = require("express");
const { VerifyToken } = require("../helpers/AuthHelpers");
const {
  superAdminRole,
  adminRole,
  validateParamsObjectId,
} = require("../helpers/utility");
const {
  getBatch,
  getBatches,
  editBatch,
  createBatch,
  deleteBatch,
} = require("../controllers/batch/batchController");
const { validateCreateBatch } = require("../controllers/batch/batchValidator");

const router = express.Router();

let adminAndSuperAdminRoles = [superAdminRole, adminRole];

// Get batch Details
router.route("/:id").get(validateParamsObjectId(), getBatch);

// Get batches
router.route("/").get(getBatches);

// create Batch
router.route("/").post(validateCreateBatch, createBatch);

// update batch
router.route("/:id").put(
  (req, res, next) => {
    req.mode = "update";
    next();
  },
  validateParamsObjectId(),
  validateCreateBatch,
  editBatch
);

// delete batch
router.route("/:id").delete(validateParamsObjectId(), deleteBatch);

module.exports = router;
