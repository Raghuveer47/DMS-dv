const express = require("express");
const { VerifyToken, checkRole } = require("../helpers/AuthHelpers");
const {
  getUser,
  createUser,
  getUsers,
  editUser,
  deleteUser,
  groupedUsersByRoles,
} = require("../controllers/user/userController");
const { validateCreateUser } = require("../controllers/user/userValidator");
const {
  superAdminRole,
  adminRole,
  validateParamsObjectId,
} = require("../helpers/utility");

const router = express.Router();

let adminAndSuperAdminRoles = [superAdminRole, adminRole];

// user role grouped

router.route("/grouped-by-roles").get(VerifyToken, groupedUsersByRoles);

// Get User Details
router.route("/:id").get(VerifyToken, validateParamsObjectId(), getUser);

// Get Users
router
  .route("/")
  .get(VerifyToken, checkRole(adminAndSuperAdminRoles), getUsers);

// Create User
router
  .route("/")
  .post(
    VerifyToken,
    checkRole(adminAndSuperAdminRoles),
    validateCreateUser,
    createUser
  );

// Update User
router.route("/:id").put(
  VerifyToken,
  checkRole(adminAndSuperAdminRoles),
  (req, res, next) => {
    req.mode = "update";
    next();
  },
  validateCreateUser,
  editUser
);

// delete user
router.route("/:id").delete(validateParamsObjectId(), deleteUser);

module.exports = router;
