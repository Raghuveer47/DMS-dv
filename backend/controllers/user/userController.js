const {
  sendResponse,
  httpCodes,
  superAdminRole,
  adminRole,
} = require("../../helpers/utility");
const Users = require("../../models/Users");
const { lowercase, capitalize } = require("../../helpers/typography");
const bcrypt = require("bcrypt");
const Batches = require("../../models/Batches");

module.exports = {
  async getUser(req, res) {
    let { id } = req.params;
    const data = await Users.findOne({
      _id: id,
    }).populate("batches");

    return sendResponse(res, httpCodes.OK, {
      message: "User Details",
      user: data,
    });
  },

  async getUsers(req, res) {
    let currentRole = req.user.role;
    let excludedRoles = [];
    let excludedIds = [];
    if (currentRole === adminRole) {
      excludedRoles.push(superAdminRole, adminRole);
      excludedIds.push(req.user._id);
    }
    let query = {
      role: { $nin: excludedRoles },
      _id: { $nin: excludedIds },
    };
    const users = await Users.find(query).populate("batches").sort({
      createdAt: -1,
    });
    return sendResponse(res, httpCodes.OK, {
      message: "User Details",
      users: users,
    });
  },

  async groupedUsersByRoles(req, res) {
    const data = await Users.aggregate([
      {
        $match: {
          role: { $ne: "superAdmin" }, // Filtering out 'superAdmin' role
        },
      },
      {
        $group: {
          _id: "$role",
          users: { $push: "$$ROOT" },
        },
      },
      {
        $group: {
          _id: null,
          trainers: {
            $push: {
              $cond: {
                if: { $eq: ["$_id", "trainer"] },
                then: "$users",
                else: [],
              },
            },
          },
          students: {
            $push: {
              $cond: {
                if: { $eq: ["$_id", "user"] },
                then: "$users",
                else: [],
              },
            },
          },
        },
      },
      {
        $project: {
          _id: 0,
          trainers: {
            $reduce: {
              input: "$trainers",
              initialValue: [],
              in: { $concatArrays: ["$$value", "$$this"] },
            },
          },
          students: {
            $reduce: {
              input: "$students",
              initialValue: [],
              in: { $concatArrays: ["$$value", "$$this"] },
            },
          },
        },
      },
    ]);
    return sendResponse(res, httpCodes.OK, {
      message: "Grouped Details",
      data: data[0],
    });
  },

  async createUser(req, res) {
    try {
      let { email, password, firstName, lastName, role } = req.body;
      email = lowercase(email);
      let hashedPassword = await bcrypt.hash(password, 10);
      let data = {
        email: email,
        firstName: capitalize(firstName),
        lastName: capitalize(lastName),
        password: hashedPassword,
        role: role,
        verified: true,
      };

      await Users.create(data);
      return sendResponse(res, httpCodes.OK, {
        message: "User Created Successfully",
      });
    } catch (e) {
      return sendResponse(res, httpCodes.BAD_REQUEST, {
        message: e.toString(),
      });
    }
  },

  async editUser(req, res) {
    try {
      let { email, password, firstName, lastName, role } = req.body;
      let userId = req.params.id;
      email = lowercase(email);

      let data = {
        email: email,
        firstName: capitalize(firstName),
        lastName: capitalize(lastName),
        role: role,
      };

      if (password) {
        let hashedPassword = await bcrypt.hash(password, 10);
        data.password = hashedPassword;
      }

      await Users.findByIdAndUpdate(
        {
          _id: userId,
        },
        {
          $set: data,
        }
      );
      return sendResponse(res, httpCodes.OK, {
        message: "User Updated successfully",
      });
    } catch (e) {
      return sendResponse(res, httpCodes.BAD_REQUEST, {
        message: e.toString(),
      });
    }
  },

  async deleteUser(req, res) {
    try {
      let id = req.params.id;
      await Batches.updateMany(
        {
          students: id,
        },
        {
          $pull: { students: id },
        }
      );

      await Users.findOneAndDelete({
        _id: id,
        role: { $ne: "superAdmin" },
      });

      return sendResponse(res, httpCodes.OK, {
        message: "User Deleted successfully",
      });
    } catch (e) {
      return sendResponse(res, httpCodes.BAD_REQUEST, {
        message: e.toString(),
      });
    }
  },
};
