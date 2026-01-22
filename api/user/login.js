// const bcrypt = require("bcrypt");
const getUserInfo = require("./getUserInfo");
const bcrypt = require("bcryptjs");
const TokenGenerator = require("../../utils/tokenGen.js");

module.exports = async (req, res) => {
  const { login, password, rememberMe } = req.body;
  const collUsers = await global.mongo.collection("users");

  // console.log("Login:", login, "Password:", password);
  if (!login || !password) {
    res.status(400).json({ message: "Login e senha são necessários!" });
    return
  }

  let aggr = [
    {
      $match: {
        email: login,
        type: { $in: ["employee", "company"] },
        isActive: true
      }
    },
    {
      $addFields: {
        userId: { $toString: "$_id" }
      }
    },
    {
      $lookup: {
        from: "secrets",
        localField: "userId",
        foreignField: "userId",
        as: "password",
        pipeline: [
          {
            $match: {
              isActive: true,
            }
          },
        ]
      }
    },
    {
      $unwind: "$password"
    },
    // Lookup employee data if the user is an employee
    {
      $lookup: {
        from: "company_employees",
        localField: "userId",
        foreignField: "userId",
        as: "employeeData",
        pipeline: [
          {
            $match: {
              isActive: true
            }
          },
          {
            $project: {
              _id: 0,
              companyId: 1,
              permission: 1,
            }
          }
        ]
      }
    },
    {
      $addFields: {
        isCompany: {
          $cond: {
            if: "$isCompany",
            then: true,
            else: false
          }
        },
        // Determine if user is an employee based on employeeData array
        isEmployee: { $gt: [{ $size: "$employeeData" }, 0] },
        // If employee, get the first employeeData entry (should be only one)
        employeeInfo: { $arrayElemAt: ["$employeeData", 0] },
        secret: "$password.secret"
      }
    },
    {
      $project: {
        _id: 0,
        userId: 1,
        isActive: 1,
        isCompany: 1,
        permission: 1,
        isEmployee: 1,
        employeeInfo: 1,
        secret: 1
      }
    }
  ]
  let ret = await collUsers.aggregate(aggr).next()
  // console.log(ret)

  if (!ret) {
    res.status(401).json({ message: "Usuário não encontrado!" })
    return
  }

  const compare = await bcrypt.compare(password, ret?.secret)

  if (compare) {
    // permissionInfo for token
    const userPermission = {
      isCompany: ret.isCompany,
      isEmployee: ret.isEmployee || false,
      companyId: ret.isEmployee ? ret.employeeInfo?.companyId : ret.userId,
      permission: ret.isEmployee ? ret.employeeInfo?.permission : 3
    };

    const tokenResult = await TokenGenerator.create({
      userId: ret.userId,
      rememberMe: rememberMe || false,
      isActive: ret.isActive,
      permissionInfo: userPermission
    }, res);

    // console.log(tokenResult)
    if (!tokenResult.success) {
      res.status(500).json({ success: false, message: tokenResult.message || "Error generating token" });
      return;
    }

    res.status(200).json({
      data: await getUserInfo(ret.userId),
      success: true
    })
    return
  }

  res.status(401).json({ success: false, message: "Senha Inválida!" })
  return
}

