const {
  sendResponse,
  httpCodes,
  userRole,
  superAdminRole,
  adminRole,
  getObjectId,
  trainerRole,
} = require("../../helpers/utility");
const { capitalize, uppercase } = require("../../helpers/typography");
const QuizAttempt = require("../../models/QuizAttempt");
const _ = require("lodash");
const Users = require("../../models/Users");

const calculatePassFailPercentage = (attempts) => {
  const totalAttempts = attempts.length;
  let passCount = 0;
  let failCount = 0;

  attempts.forEach((attempt) => {
    if (attempt.result === "pass") {
      passCount++;
    } else if (attempt.result === "fail") {
      failCount++;
    }
  });

  const passPercentage = (passCount / totalAttempts) * 100;
  const failPercentage = (failCount / totalAttempts) * 100;

  return {
    passPercentage: passPercentage.toFixed(2),
    failPercentage: failPercentage.toFixed(2),
  };
};

module.exports = {
  async getReports(req, res) {
    let user = req.user;
    let role = user.role;
    let query = {};
    let selectQuery = {};
    if (role === userRole) {
      query = {
        user: user._id,
      };
    } else {
      query = {};
      selectQuery = {
        _id: 1,
        "quiz._id": 1,
        "quiz.name": 1,
        result: 1,
      };
    }

    let quizAttempts = await QuizAttempt.find(query)
      .populate()
      .select(selectQuery)
      .sort({
        createdAt: -1,
      });

    if ([superAdminRole, adminRole, trainerRole].includes(role)) {
      const groupedData = _.groupBy(quizAttempts, "quiz._id");
      let structuredAttempts = [];

      Object.keys(groupedData).map((key, i) => {
        let values = groupedData[key];
        let obj = {
          _id: key,
          name: values[0]?.quiz?.name,
          attempted: values.length,
        };
        let { passPercentage, failPercentage } =
          calculatePassFailPercentage(values);
        obj.passPercentage = Number(passPercentage);
        obj.failPercentage = Number(failPercentage);
        structuredAttempts.push(obj);
        quizAttempts = structuredAttempts;
      });
    }

    return sendResponse(res, httpCodes.OK, {
      message: "Reports",
      reports: quizAttempts,
    });
  },

  async getReport(req, res) {
    let reportId = req.params.id;
    const quizAttempt = await QuizAttempt.findOne({
      _id: reportId,
    }).sort({
      createdAt: -1,
    });
    return sendResponse(res, httpCodes.OK, {
      message: "Report Details",
      report: quizAttempt,
    });
  },

  async getQuizReport(req, res) {
    let quizId = req.params.id;
    let user = req.user;
    user = await Users.findOne({
      _id: user._id,
    }).populate("batches");
    let batches = user.batches;
    console.log(batches);
    // Extract all student IDs into one array
    let allStudentIds = batches.flatMap((batch) =>
      batch.students.map((student) => student)
    );

    let query = {
      "quiz._id": getObjectId(quizId),
    };
    if ([trainerRole].includes(user.role)) {
      query = {
        "quiz._id": getObjectId(quizId),
        user: { $in: allStudentIds },
      };
    }

    let quizAttempts = await QuizAttempt.find(query)
      .populate({
        path: "user",
        populate: "batches",
      })
      .sort({
        createdAt: -1,
      });
    let report = null;

    if (quizAttempts.length > 0) {
      report = {
        name: quizAttempts[0].quiz?.name,
        attempts: quizAttempts,
      };
    }

    return sendResponse(res, httpCodes.OK, {
      message: "Report Details",
      report: report,
    });
  },
};
