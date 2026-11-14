const { pathAdmin } = require("../../config/variable");
const jwt = require('jsonwebtoken');
const AccountAdmin = require("../../models/accounts-admin.model");
const Role = require("../../models/role.model");

module.exports.verifyToken = async (req, res, next) => {
  try{
    const token = req.cookies.token;

    if(!token){
      return res.redirect(`/${pathAdmin}/account/login`);
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const { id, email } = decoded;
    
    const existAccount = await AccountAdmin.findOne({
      _id: id,
      email: email,
      status: "active"
    }).select("fullName avatar role email status").lean();

    if(!existAccount){
      res.clearCookie("token");
      return res.redirect(`/${pathAdmin}/account/login`);
    }

    const roleDetail = await Role.findOne({
      _id: existAccount.role,
    }).select("name permissions").lean();

    req.account = {
      ...existAccount,
      id: String(existAccount._id)
    };
    req.role = roleDetail;

    res.locals.account = {
      fullName: existAccount.fullName,
      avatar: existAccount.avatar,
      roleName: roleDetail ? roleDetail.name : "",
      permissions: roleDetail ? roleDetail.permissions : []
    };

    next();
  }catch(err){
    res.clearCookie("token");
    return res.redirect(`/${pathAdmin}/account/login`);
  }
  
}