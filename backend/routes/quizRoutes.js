const express = require("express");
const { VerifyToken, checkRole } = require("../helpers/AuthHelpers");
const {
  superAdminRole,
  adminRole,
  validateParamsObjectId,
  userRole,
} = require("../helpers/utility");

const {
  getQuiz,
  getQuizes,
  createQuiz,
  editQuiz,
  submitQuiz,
} = require("../controllers/quiz/quizController");
const {
  validateCreateQuiz,
  validateSubmitQuiz,
} = require("../controllers/quiz/quizValidator");

const router = express.Router();

let adminAndSuperAdminRoles = [superAdminRole, adminRole];

// Get Quiz Details
router
  .route("/:id")
  .get(
    validateParamsObjectId(),
    checkRole([...adminAndSuperAdminRoles, userRole]),
    getQuiz
  );

// Get Quizes
router
  .route("/")
  .get(checkRole([...adminAndSuperAdminRoles, userRole]), getQuizes);

// Create Quiz
router
  .route("/")
  .post(checkRole(adminAndSuperAdminRoles), validateCreateQuiz, createQuiz);

// Submit Quiz
router
  .route("/submit/:id")
  .post(checkRole([userRole]), validateSubmitQuiz, submitQuiz);

// update quiz
router.route("/:id").put(
  (req, res, next) => {
    req.mode = "update";
    next();
  },
  checkRole(adminAndSuperAdminRoles),
  validateParamsObjectId(),
  validateCreateQuiz,
  editQuiz
);

// // delete batch
// router.route("/:id").delete(validateParamsObjectId(), deleteBatch);

module.exports = router;
