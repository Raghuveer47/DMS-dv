const {
  sendResponse,
  httpCodes,
  userRole,
  trainerRole,
} = require("../../helpers/utility");
const { capitalize, uppercase } = require("../../helpers/typography");
const Batches = require("../../models/Batches");
const Users = require("../../models/Users");

module.exports = {
  async getBatch(req, res) {
    let { id } = req.params;
    const batch = await Batches.findOne({
      _id: id,
    }).populate("students trainers");

    return sendResponse(res, httpCodes.OK, {
      message: "Batch Details",
      batch: batch,
    });
  },

  async getBatches(req, res) {
    const batches = await Batches.find().populate("students trainers").sort({
      createdAt: -1,
    });

    return sendResponse(res, httpCodes.OK, {
      message: "Batches Details",
      batches: batches,
    });
  },

  async createBatch(req, res) {
    try {
      let { code, name, students, trainers } = req.body;
      let data = {
        code: uppercase(code),
        name: capitalize(name),
        students: students,
        trainers: trainers,
      };

      let newBatch = await Batches.create(data);

      // update student
      await Users.updateMany(
        {
          _id: { $in: students },
          role: userRole,
        },
        {
          $push: {
            batches: newBatch._id,
          },
        }
      );
      // update trainer
      await Users.updateMany(
        {
          _id: { $in: trainers },
          role: trainerRole,
        },
        {
          $push: {
            batches: newBatch._id,
          },
        }
      );

      return sendResponse(res, httpCodes.OK, {
        message: "Batch added successfully",
      });
    } catch (e) {
      return sendResponse(res, httpCodes.BAD_REQUEST, {
        message: e.toString(),
      });
    }
  },

  async editBatch(req, res) {
    try {
      let id = req.params.id;
      let batch = await Batches.findOne({
        _id: id,
      });
      if (!batch) {
        throw "no batch";
      }
      // remove students
      if (batch.students.length > 0) {
        await Users.updateMany(
          {
            _id: { $in: batch.students },
          },
          {
            $pull: {
              batches: batch._id,
            },
          }
        );
      }

      // remove trainers
      if (batch.trainers.length > 0) {
        await Users.updateMany(
          {
            _id: { $in: batch.trainers },
          },
          {
            $pull: {
              batches: batch._id,
            },
          }
        );
      }

      let { code, name, students, trainers } = req.body;
      let data = {
        code: uppercase(code),
        name: capitalize(name),
        students: students,
        trainers: trainers,
      };

      await Batches.findOneAndUpdate(
        {
          _id: id,
        },
        {
          $set: data,
        }
      );

      // update student
      await Users.updateMany(
        {
          _id: { $in: students },
          role: userRole,
        },
        {
          $push: {
            batches: batch._id,
          },
        }
      );
      // update trainer
      await Users.updateMany(
        {
          _id: { $in: trainers },
          role: trainerRole,
        },
        {
          $push: {
            batches: batch._id,
          },
        }
      );

      return sendResponse(res, httpCodes.OK, {
        message: "Batch updated successfully",
      });
    } catch (e) {
      return sendResponse(res, httpCodes.BAD_REQUEST, {
        message: e.toString(),
      });
    }
  },

  async deleteBatch(req, res) {
    try {
      let id = req.params.id;

      await Batches.findOneAndDelete({
        _id: id,
      });
      return sendResponse(res, httpCodes.OK, {
        message: "Batch Deleted successfully",
      });
    } catch (e) {
      return sendResponse(res, httpCodes.BAD_REQUEST, {
        message: e.toString(),
      });
    }
  },
};
