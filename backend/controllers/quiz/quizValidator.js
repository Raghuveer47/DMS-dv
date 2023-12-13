const { lowercase, uppercase } = require("../../helpers/typography");
const { sendResponse, httpCodes } = require("../../helpers/utility");
const Quiz = require("../../models/Quiz");

module.exports = {
  async validateCreateQuiz(req, res, next) {
    const {
      name,
      totalMarks,
      availableFrom,
      availableUntil,
      batch,
      timeLimit,
      availableTo,
      availableToEveryone,
      questions,
      timeLimitEnabled,
      passPercentage,
      singleQuestionMarks,
    } = req.body;
    try {
      if (!name) {
        throw "Quiz Name required";
      }

      if (typeof timeLimit !== "number" && timeLimitEnabled) {
        throw "Time Limit required";
      }

      if (typeof totalMarks !== "number") {
        throw "Invalid Total Marks Format";
      }

      if (typeof singleQuestionMarks !== "number") {
        throw "Single Question Marks Format";
      }

      if (typeof passPercentage !== "number") {
        throw "Invalid Pass Marks Format";
      }

      if (!availableFrom) {
        throw "Available from required";
      }

      if (!availableUntil) {
        throw "Available Until required";
      }

      if (
        !availableToEveryone &&
        (!availableTo || availableTo.length === 0 || !batch)
      ) {
        throw "Please select students to give access";
      }

      if (!questions || questions.length === 0) {
        throw "Please select questions";
      }

      for (i = 0; i < questions.length; i++) {
        let question = questions[i];
        let { questionText, questionType, options } = question;
        if (!questionText) {
          throw `Question required at position ${i + 1} `;
        }
        if (!questionType) {
          throw `Question type required for question at position ${i + 1} `;
        }
        if (!options || options.length === 0) {
          throw `Options required for question at position ${i + 1}`;
        }
      }

      //   let batchExists;
      //   let mode = req.mode;
      //   if (mode && mode === "update") {
      //     let batchId = req.params.id;
      //     batchExists = await Batches.findOne({
      //       code: uppercase(code),
      //       _id: { $ne: batchId },
      //     });
      //   } else {
      //     batchExists = await Batches.findOne({
      //       code: uppercase(code),
      //     });
      //   }

      //   if (batchExists) {
      //     throw "Batch Code Already Exists";
      //   }

      next();
    } catch (e) {
      return sendResponse(res, httpCodes.BAD_REQUEST, {
        message: e,
      });
    }
  },

  async validateSubmitQuiz(req, res, next) {
    try {
      const { timeSpentInSeconds, questions } = req.body;
      let quizId = req.params.id;
      let user = req.user;
      let quiz = await Quiz.findOne({
        _id: quizId,
      });
      if (!quiz) {
        throw "No Quiz Found";
      }

      if (!quiz.availableToEveryone && !quiz.availableTo.includes(user._id)) {
        throw "Quiz is not available to you";
      }

      if (typeof timeSpentInSeconds !== "number") {
        throw "Required Time Spent";
      }

      if (!questions || questions.length === 0) {
        throw "Please select questions";
      }

      next();
    } catch (e) {
      return sendResponse(res, httpCodes.BAD_REQUEST, {
        message: e,
      });
    }
  },
};
