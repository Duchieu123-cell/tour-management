const moment = require("moment");
const slugify = require('slugify');
const Category = require("../../models/category.model");
const AccountAdmin = require("../../models/accounts-admin.model");

const CategoryHelper = require("../../helpers/category.helper");

module.exports.list = async (req, res) => {
  const find = {
    deleted: false
  };

  // Lọc theo trạng thái
  if(req.query.status){
    find.status = req.query.status;
  }
  // Hết lọc theo trạng thái

  // Lọc theo người tạo
  if(req.query.createdBy){
    find.createdBy = req.query.createdBy;
  }
  // Hết lọc theo người tạo

  // Lọc theo Ngày tạo
  const dateFilter = {};
  if(req.query.startDate){
    const startDate = moment(req.query.startDate).startOf('day').toDate();
    dateFilter.$gte = startDate;
  }
  if(req.query.endDate){
    const endDate = moment(req.query.endDate).endOf('day').toDate();
    dateFilter.$lte = endDate;
  }
  if(Object.keys(dateFilter).length > 0){
    find.createdAt = dateFilter;
  }
  // Hết lọc theo Ngày tạo

  // Tìm kiếm
  if(req.query.keyword){
    const keyword = slugify(req.query.keyword, {
      lower: true,
    });
    const keywordRegex = new RegExp(keyword);
    find.slug = keywordRegex;
  }
  // Hết lọc tìm kiếm

  //Phân trang
  const limitItems = 3;
  
  let page = 1;
  if(req.query.page){
    const currentPage = parseInt(req.query.page);
    if(currentPage > 0){
      page = currentPage;
    }
    else{
      page = 1;
    }
  }

  const totalRecords = await Category.countDocuments(find);
  const totalPages = Math.ceil(totalRecords / limitItems);

  const skip = (page - 1) * limitItems;

  const pagination = {
    totalRecords: totalRecords,
    totalPages: totalPages,
    skip: skip,
    limitItems: limitItems
  };
  //Hết phân trang

  const categoryList = await Category
    .find(find)
    .sort({ 
      position: "desc"
    })
    .limit(limitItems)
    .skip(skip)

  for (const item of categoryList) {
    if(item.createdBy){
      const accountCreated = await AccountAdmin.findOne({
        _id: item.createdBy
      });
      item.createdByFullName = accountCreated ? accountCreated.fullName : "";
    }

    if(item.updatedBy){
      const accountUpdated = await AccountAdmin.findOne({
        _id: item.updatedBy
      });
      item.updatedByFullName = accountUpdated ? accountUpdated.fullName : "";
    }

    item.createdAtFormatted = moment(item.createdAt).format('HH:mm - DD/MM/YYYY');
    item.updatedAtFormatted = moment(item.updatedAt).format('HH:mm - DD/MM/YYYY');
  }

  //Danh sách tài khoản quản trị
  const adminAccountList = await AccountAdmin
    .find({})
    .select("_id fullName");
  //Hết danh sách tài khoản quản trị

  res.render('admin/pages/category-list', {
    pageTitle: 'Quản lý danh mục',
    categoryList: categoryList,
    adminAccountList: adminAccountList,
    pagination: pagination,
  });
}

module.exports.create = async (req, res) => {
  const categoryList = await Category.find({
    deleted: false
  });

  const categoryTree = CategoryHelper.buildCategoryTree(categoryList, "");

  res.render('admin/pages/category-create', {
    pageTitle: 'Tạo danh mục',
    categoryList: categoryTree
  });
}

module.exports.createPost = async (req, res) => {
  if(req.role.permissions.includes("category-create")){
    if(req.body.position){
      req.body.position = parseInt(req.body.position);
    }
    else{
      const totalRecords = await Category.countDocuments({});
      req.body.position = totalRecords + 1; 
    }

    req.body.createdBy = req.account._id;
    req.body.updatedBy = req.account._id;

    req.body.avatar = req.file ? req.file.path : null;

    const newRecord = new Category(req.body);
    await newRecord.save();

    req.flash('success', 'Tạo danh mục thành công');

    res.json({
      code: "SUCCESS"
    });
  } else {
    res.json({
      code: "ERROR"
    });
  }
  
}

module.exports.edit = async (req, res) => {
  try {
    const categoryList = await Category.find({
      deleted: false
    });

    const categoryTree = CategoryHelper.buildCategoryTree(categoryList, "");

    const id = req.params.id;

    const categoryDetail = await Category.findOne({
      _id: id,
      deleted: false
    });

    res.render('admin/pages/category-edit', {
      pageTitle: 'Chỉnh sửa danh mục',
      categoryList: categoryTree,
      categoryDetail: categoryDetail
    });
  } catch (error) {
    console.log(error);
    res.redirect(`/${pathAdmin}/category/list`);
  }
}

module.exports.editPatch = async (req, res) => {
  try {
    if(req.role.permissions.includes("category-edit")){
      const id = req.params.id;

      if(req.body.position){
        req.body.position = parseInt(req.body.position);
      }
      else{
        const totalRecords = await Category.countDocuments({});
        req.body.position = totalRecords + 1; 
      }

      req.body.updatedBy = req.account._id;

      if(req.file){
        req.body.avatar = req.file.path;
      }
      else{
        delete req.body.avatar;
      }

      await Category.updateOne({
        _id: id,
        deleted: false
      }, req.body);

      req.flash('success', 'Cập nhật danh mục thành công');

      res.json({
        code: "SUCCESS"
      });
    } else {
      return res.json({
        code: "ERROR"
      });
    }
  } catch (error) {
    res.json({
      code: "ERROR",
      message: error.message
    });
  }
}

module.exports.deletePatch = async (req, res) => {
  try {
    if(req.role.permissions.includes("category-delete")){
      const id = req.params.id;

      await Category.updateOne({
        _id: id,
      }, {
        deleted: true,
        deletedAt: Date.now(),
        deletedBy: req.account._id
      });

      req.flash('success', 'Xóa danh mục thành công');

      res.json({
        code: "SUCCESS"
      });
    } else {
      return res.json({
        code: "ERROR"
      });
    }
  } catch (error) {
    res.json({
      code: "ERROR",
      message: error.message
    });
  }
}

module.exports.changeMultiPatch = async (req, res) => {
  try {
    const { option, ids } = req.body;

    const permissions = req.role.permissions;

    if(permissions.includes("category-edit") && (option === "active" || option === "inactive")) {
      await Category.updateMany({
        _id: { $in: ids }
      }, {
        status: option
      });
      req.flash('success', 'Đổi trạng thái thành công');

      return res.json({
        code: "SUCCESS"
      });
    }

    else if(permissions.includes("category-delete") && option === "delete") {
      await Category.updateMany({
        _id: { $in: ids }
      }, {
        deleted: true,
        deletedAt: Date.now(),
        deletedBy: req.account._id
      });
      req.flash('success', 'Xóa thành công');

      return res.json({
        code: "SUCCESS"
      });
    } 
    
    else {
      return res.json({
        code: "ERROR"
      });
    }
  } catch (error) {
    res.json({
      code: "ERROR"
    });
  }
}