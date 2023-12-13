const { lowercase } = require("../../helpers/typography");
const {
  sendResponse,
  httpCodes,
  adminRole,
  trainerRole,
  userRole,
} = require("../../helpers/utility");
const Users = require("../../models/Users");
const bcrypt = require("bcrypt");

module.exports = {
  async validateCreateUser(req, res, next) {
    const { email, password, firstName, lastName, role, verified } = req.body;
    let mode = req.mode;

    try {
      if (!email) {
        throw "Email required";
      }

      if (!firstName) {
        throw "First Name required";
      }

      if (!lastName) {
        throw "Last Name required";
      }

      if (!password && mode !== "update") {
        throw "Password required";
      }

      if (typeof verified !== "boolean") {
        throw "Verified mark required";
      }

      if (!role) {
        throw "Role required";
      }
      if (![adminRole, trainerRole, userRole].includes(role)) {
        throw "Invalid Role";
      }

      let userExists;
      if (mode && mode === "update") {
        let userId = req.params.id;
        userExists = await Users.findOne({
          email: lowercase(email),
          _id: { $ne: userId },
        });
      } else {
        userExists = await Users.findOne({
          email: lowercase(email),
        });
      }

      if (userExists) {
        throw "Email-Id is already registered with another account!";
      }

      next();
    } catch (e) {
      return sendResponse(res, httpCodes.BAD_REQUEST, {
        message: e,
      });
    }
  },
};
