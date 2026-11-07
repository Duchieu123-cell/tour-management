const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Customer = require('../../models/customer.model');

const cookieOptions = {
  httpOnly: true,
  sameSite: 'strict'
};

const getCustomerId = (res) => res.locals.customer?._id || res.locals.customer?.id;

const respondWithError = (res, status, message) => res.status(status).json({
  code: 'ERROR',
  message
});

// [GET] /profile
module.exports.detail = async (req, res) => {
  const customerId = getCustomerId(res);
  if (!customerId) {
    return respondWithError(res, 401, 'Vui lòng đăng nhập để tiếp tục');
  }

  try {
    const customer = await Customer.findOne({
      _id: customerId,
      status: 'active',
      deleted: { $ne: true }
    }).select('_id fullName email phone avatar dob gender address createdAt updatedAt');

    if (!customer) {
      return respondWithError(res, 404, 'Không tìm thấy tài khoản');
    }

    return res.json({
      code: 'SUCCESS',
      message: 'Lấy thông tin cá nhân thành công',
      data: customer
    });
  } catch (error) {
    return respondWithError(res, 500, 'Không thể lấy thông tin cá nhân lúc này');
  }
};

module.exports.getProfile = module.exports.detail;

// [PATCH] /profile
module.exports.update = async (req, res) => {
  const customerId = getCustomerId(res);
  if (!customerId) {
    return respondWithError(res, 401, 'Vui lòng đăng nhập để tiếp tục');
  }

  try {
    const updateData = {};
    const body = req.body || {};

    if (body.fullName !== undefined) {
      updateData.fullName = body.fullName.trim();
    }

    const phone = body.phone !== undefined ? body.phone : body.phoneNumber;
    if (phone !== undefined) {
      updateData.phone = phone.trim();
    }

    if (body.gender !== undefined) {
      updateData.gender = body.gender.trim();
    }

    const address = body.address !== undefined ? body.address : body.city;
    if (address !== undefined) {
      updateData.address = address.trim();
    }

    const birthParts = [body.birthDay, body.birthMonth, body.birthYear];
    const suppliedBirthParts = birthParts.filter((part) => part !== undefined && part !== '');
    const hasBirthParts = birthParts.some((part) => part !== undefined);
    if (suppliedBirthParts.length > 0 && suppliedBirthParts.length < 3) {
      return respondWithError(res, 400, 'Vui lòng chọn đủ ngày, tháng, năm sinh');
    }

    if (suppliedBirthParts.length === 3) {
      const [day, month, year] = birthParts.map(Number);
      const dob = new Date(Date.UTC(year, month - 1, day));
      if (
        dob.getUTCFullYear() !== year ||
        dob.getUTCMonth() !== month - 1 ||
        dob.getUTCDate() !== day ||
        dob > new Date()
      ) {
        return respondWithError(res, 400, 'Ngày sinh không hợp lệ');
      }
      updateData.dob = dob;
    } else if (hasBirthParts && suppliedBirthParts.length === 0) {
      updateData.dob = null;
    } else if (body.dob !== undefined) {
      if (!body.dob) {
        updateData.dob = null;
      } else {
        const dob = new Date(body.dob);
        if (Number.isNaN(dob.getTime()) || dob > new Date()) {
          return respondWithError(res, 400, 'Ngày sinh không hợp lệ');
        }
        updateData.dob = dob;
      }
    }

    if (req.file) {
      updateData.avatar = req.file.path;
    } else if (body.avatar !== undefined) {
      updateData.avatar = body.avatar;
    }

    let emailChanged = false;
    if (body.email !== undefined) {
      const email = body.email.trim().toLowerCase();
      if (email !== res.locals.customer.email) {
        updateData.email = email;
        emailChanged = true;
      }
    }

    if (Object.keys(updateData).length === 0) {
      return respondWithError(res, 400, 'Vui lòng cung cấp thông tin cần cập nhật');
    }

    const customer = await Customer.findOneAndUpdate(
      {
        _id: customerId,
        status: 'active',
        deleted: { $ne: true }
      },
      { $set: updateData },
      { new: true, runValidators: true }
    ).select('_id fullName email phone avatar dob gender address status createdAt updatedAt');

    if (!customer) {
      return respondWithError(res, 404, 'Không tìm thấy tài khoản');
    }

    if (emailChanged) {
      const token = jwt.sign(
        { id: customer.id, email: customer.email },
        process.env.JWT_SECRET,
        { expiresIn: '1d' }
      );
      res.cookie('customerToken', token, {
        ...cookieOptions,
        maxAge: 24 * 60 * 60 * 1000
      });
    }

    res.locals.customer = customer;
    req.customer = customer;

    return res.json({
      code: 'SUCCESS',
      message: 'Cập nhật thông tin cá nhân thành công',
      data: customer
    });
  } catch (error) {
    if (error.code === 11000) {
      return respondWithError(res, 409, 'Email đã được sử dụng bởi tài khoản khác');
    }
    return respondWithError(res, 500, 'Không thể cập nhật thông tin cá nhân lúc này');
  }
};

// [DELETE] /profile/delete
module.exports.deleteAccount = async (req, res) => {
  const customerId = getCustomerId(res);
  if (!customerId) {
    return respondWithError(res, 401, 'Vui lòng đăng nhập để tiếp tục');
  }

  try {
    const customer = await Customer.findOne({
      _id: customerId,
      status: 'active',
      deleted: { $ne: true }
    });

    if (!customer) {
      res.clearCookie('customerToken', cookieOptions);
      return respondWithError(res, 404, 'Tài khoản không tồn tại hoặc đã bị xóa');
    }

    if (typeof req.body?.password === 'string' && req.body.password.length > 0) {
      const isPasswordValid = await bcrypt.compare(req.body.password, customer.password);
      if (!isPasswordValid) {
        return respondWithError(res, 400, 'Mật khẩu xác nhận không đúng');
      }
    }

    customer.status = 'inactive';
    customer.deleted = true;
    customer.deletedAt = new Date();
    await customer.save();

    res.clearCookie('customerToken', cookieOptions);
    return res.json({
      code: 'SUCCESS',
      message: 'Xóa tài khoản thành công'
    });
  } catch (error) {
    return respondWithError(res, 500, 'Không thể xóa tài khoản lúc này');
  }
};
