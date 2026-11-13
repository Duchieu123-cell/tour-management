const moment = require('moment');
const Category = require('../../models/category.model');
const CategoryHelper = require('../../helpers/category.helper');
const ProvinceCity = require('../../models/province-city.model');
const Tour = require('../../models/tour.model');
const AccountAdmin = require('../../models/accounts-admin.model');
const slugify = require('slugify');

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

  // Lọc theo danh mục
  if(req.query.category){
    const allCategoryChildren = [];
    const getCategoryChildren = async (parentId) => {
      const children = await Category.find({
        parent: parentId,
        deleted: false
      });
      for(const child of children){
        allCategoryChildren.push(child._id);
        await getCategoryChildren(child._id);
      }
    };
    await getCategoryChildren(req.query.category);
    find.category = { $in: [req.query.category, ...allCategoryChildren] };
  }
  // Hết lọc theo danh mục

  // Lọc theo mức giá
  if(req.query.price){
    const [minPrice, maxPrice] = req.query.price.split("-").map(Number);
    if(!isNaN(minPrice) && !isNaN(maxPrice)){
      const priceQuery = {
        $or: [
          {
            newPriceAdult: { $gt: 0, $gte: minPrice, $lte: maxPrice }
          },
          {
            $or: [
              { newPriceAdult: { $exists: false } },
              { newPriceAdult: 0 },
              { newPriceAdult: null }
            ],
            priceAdult: { $gte: minPrice, $lte: maxPrice }
          }
        ]
      };
      if (find.$or) {
        find.$and = find.$and || [];
        find.$and.push(priceQuery);
      } else {
        find.$or = priceQuery.$or;
      }
    }
  }
  // Hết lọc theo mức giá

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
  const limitItems = 10;
  
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

  const totalRecords = await Tour.countDocuments(find);
  const totalPages = Math.ceil(totalRecords / limitItems);

  const skip = (page - 1) * limitItems;

  const pagination = {
    totalRecords: totalRecords,
    totalPages: totalPages,
    skip: skip,
    limitItems: limitItems
  };
  //Hết phân trang

  const [tourList, adminAccountList, categoryList] = await Promise.all([
    Tour
      .find(find)
      .sort({
        position: "desc"
      })
      .limit(limitItems)
      .skip(skip),
    AccountAdmin
      .find({})
      .select("_id fullName")
      .lean(),
    Category
      .find({
        deleted: false
      })
      .lean()
  ]);

  const adminNameById = new Map(
    adminAccountList.map((admin) => [String(admin._id), admin.fullName])
  );

  for (const item of tourList) {
    if(item.createdBy){
      item.createdByFullName = adminNameById.get(String(item.createdBy)) || "";
    }

    if(item.updatedBy){
      item.updatedByFullName = adminNameById.get(String(item.updatedBy)) || "";
    }

    item.createdAtFormatted = moment(item.createdAt).format('HH:mm - DD/MM/YYYY');
    item.updatedAtFormatted = moment(item.updatedAt).format('HH:mm - DD/MM/YYYY');
  }

  // Danh sách phân cấp danh mục
  const categoryTree = CategoryHelper.buildCategoryTree(categoryList, "");
  // Hết danh sách phân cấp danh mục

  res.render('admin/pages/tour-list', {
    pageTitle: 'Quản lý tour',
    tourList: tourList,
    adminAccountList: adminAccountList,
    categoryList: categoryTree,
    pagination: pagination,
  });
}

module.exports.create = async (req, res) => {
  const categoryList = await Category.find({
    deleted: false
  });

  const categoryTree = CategoryHelper.buildCategoryTree(categoryList, "");

  const provinceCityList = await ProvinceCity.find({});

  res.render('admin/pages/tour-create', {
    pageTitle: 'Tạo tour',
    categoryList: categoryTree,
    provinceCityList: provinceCityList
  });
}

module.exports.createPost = async (req, res) => {
  if(req.body.position){
    req.body.position = parseInt(req.body.position);
  } else {
    const totalRecords = await Tour.countDocuments({});
    req.body.position = totalRecords + 1;
  }

  req.body.createdBy = req.account.id;
  req.body.updatedBy = req.account.id;
  if(req.files && req.files['avatar'] && req.files['avatar'].length > 0){
    req.body.avatar = req.files['avatar'][0].path;
  } else {
    req.body.avatar = "";
  }
  req.body.priceAdult = req.body.priceAdult ? parseInt(req.body.priceAdult) : 0;
  req.body.priceChildren = req.body.priceChildren ? parseInt(req.body.priceChildren) : 0;
  req.body.priceBaby = req.body.priceBaby ? parseInt(req.body.priceBaby) : 0;
  req.body.newPriceAdult = req.body.newPriceAdult ? parseInt(req.body.newPriceAdult) : 0;
  req.body.newPriceChildren = req.body.newPriceChildren ? parseInt(req.body.newPriceChildren) : 0;
  req.body.newPriceBaby = req.body.newPriceBaby ? parseInt(req.body.newPriceBaby) : 0;
  req.body.stockAdult = req.body.stockAdult ? parseInt(req.body.stockAdult) : 0;
  req.body.stockChildren = req.body.stockChildren ? parseInt(req.body.stockChildren) : 0;
  req.body.stockBaby = req.body.stockBaby ? parseInt(req.body.stockBaby) : 0;
  req.body.locations = req.body.locations ? JSON.parse(req.body.locations) : [];
  req.body.departureDate = req.body.departureDate ? new Date(req.body.departureDate) : null;
  req.body.schedules = req.body.schedules ? JSON.parse(req.body.schedules) : [];

  if(req.files && req.files['images'] && req.files['images'].length > 0){
    const imagePaths = req.files['images'].map(file => file.path);
    req.body.images = imagePaths;
  } else {
    req.body.images = [];
  }

  const newRecord = new Tour(req.body);
  await newRecord.save();

  req.flash('success', 'Tạo tour thành công');

  res.json({
    code: "SUCCESS"
  });
}

module.exports.edit = async (req, res) => {
  try {
    const id = req.params.id;

    const tourDetail = await Tour.findOne({
      _id: id,
      deleted: false
    });

    tourDetail.departureDateFormatted = moment(tourDetail.departureDate).format('YYYY-MM-DD');

    const categoryList = await Category.find({
      deleted: false
    });

    const categoryTree = CategoryHelper.buildCategoryTree(categoryList, "");

    const provinceCityList = await ProvinceCity.find({});

    res.render('admin/pages/tour-edit', {
      pageTitle: 'Chỉnh sửa tour',
      categoryList: categoryTree,
      provinceCityList: provinceCityList,
      tourDetail: tourDetail
    });
  } catch (error) {
    res.redirect(`/${pathAdmin}/tour/list`);
  }
}

module.exports.editPatch = async (req, res) => {
  try {
    const id = req.params.id;

    if(req.body.position){
      req.body.position = parseInt(req.body.position);
    } else {
      const totalRecords = await Tour.countDocuments({});
      req.body.position = totalRecords + 1;
    }

    req.body.updatedBy = req.account.id;
    if(req.files && req.files['avatar'] && req.files['avatar'].length > 0){
      req.body.avatar = req.files['avatar'][0].path;
    } else {
      delete req.body.avatar;
    }
    req.body.priceAdult = req.body.priceAdult ? parseInt(req.body.priceAdult) : 0;
    req.body.priceChildren = req.body.priceChildren ? parseInt(req.body.priceChildren) : 0;
    req.body.priceBaby = req.body.priceBaby ? parseInt(req.body.priceBaby) : 0;
    req.body.newPriceAdult = req.body.newPriceAdult ? parseInt(req.body.newPriceAdult) : 0;
    req.body.newPriceChildren = req.body.newPriceChildren ? parseInt(req.body.newPriceChildren) : 0;
    req.body.newPriceBaby = req.body.newPriceBaby ? parseInt(req.body.newPriceBaby) : 0;
    req.body.stockAdult = req.body.stockAdult ? parseInt(req.body.stockAdult) : 0;
    req.body.stockChildren = req.body.stockChildren ? parseInt(req.body.stockChildren) : 0;
    req.body.stockBaby = req.body.stockBaby ? parseInt(req.body.stockBaby) : 0;
    req.body.locations = req.body.locations ? JSON.parse(req.body.locations) : [];
    req.body.departureDate = req.body.departureDate ? new Date(req.body.departureDate) : null;
    req.body.schedules = req.body.schedules ? JSON.parse(req.body.schedules) : [];

    if(req.files && req.files['images'] && req.files['images'].length > 0){
      const imagePaths = req.files['images'].map(file => file.path);
      req.body.images = imagePaths;
    } else {
      delete req.body.images;
    }

    await Tour.updateOne({
      _id: id,
      deleted: false
    }, req.body);

    req.flash('success', 'Cập nhật tour thành công');

    res.json({
      code: "SUCCESS",
    });
  } catch (error) {
    res.json({
      code: "ERROR",
      message: error.message
    });
  }
  
}

module.exports.deletePatch = async (req, res) => {
  try {
    if(req.role && req.role.permissions.includes("tour-delete")){
      const id = req.params.id;
      await Tour.updateOne({
        _id: id,
        deleted: false
      }, {
        deleted: true,
        deletedAt: new Date(),
        deletedBy: req.account ? req.account._id : null
      });
      req.flash('success', 'Xóa tour thành công');
      res.json({
        code: "SUCCESS"
      });
    } else {
      res.json({
        code: "ERROR",
        message: "Bạn không có quyền xóa tour"
      });
    }
  } catch (error) {
    res.json({
      code: "ERROR",
      message: error.message
    });
  }
}

module.exports.undoPatch = async (req, res) => {
  try {
    const id = req.params.id;
    await Tour.updateOne({
      _id: id,
      deleted: true
    }, {
      deleted: false
    });
    req.flash('success', 'Khôi phục tour thành công');
    res.json({
      code: "SUCCESS"
    });
  } catch (error) {
    res.json({
      code: "ERROR",
      message: error.message
    });
  }
}

module.exports.deletePermanentPatch = async (req, res) => {
  try {
    const id = req.params.id;
    await Tour.deleteOne({
      _id: id
    });
    req.flash('success', 'Đã xóa vĩnh viễn tour');
    res.json({
      code: "SUCCESS"
    });
  } catch (error) {
    res.json({
      code: "ERROR",
      message: error.message
    });
  }
}

module.exports.trash = async (req, res) => {
  const find = {
    deleted: true
  };

  if(req.query.keyword){
    const keyword = slugify(req.query.keyword, {
      lower: true,
    });
    const keywordRegex = new RegExp(keyword);
    find.slug = keywordRegex;
  }

  const limitItems = 10;
  let page = 1;
  if(req.query.page){
    const currentPage = parseInt(req.query.page);
    if(currentPage > 0){
      page = currentPage;
    }
  }

  const totalRecords = await Tour.countDocuments(find);
  const totalPages = Math.ceil(totalRecords / limitItems) || 1;
  const skip = (page - 1) * limitItems;

  const pagination = {
    totalRecords: totalRecords,
    totalPages: totalPages,
    skip: skip,
    limitItems: limitItems
  };

  const tourList = await Tour
    .find(find)
    .sort({ 
      position: "desc"
    })
    .limit(limitItems)
    .skip(skip);

  const deletedByIds = [...new Set(tourList.map((item) => item.deletedBy).filter(Boolean))];
  const deletedAdmins = deletedByIds.length > 0
    ? await AccountAdmin.find({ _id: { $in: deletedByIds } }).select("_id fullName").lean()
    : [];
  const deletedAdminMap = new Map(deletedAdmins.map((admin) => [String(admin._id), admin.fullName]));

  for (const item of tourList) {
    if(item.deletedBy){
      item.deletedByFullName = deletedAdminMap.get(String(item.deletedBy)) || "";
    }

    item.deletedAtFormatted = moment(item.deletedAt).format('HH:mm - DD/MM/YYYY');
  }

  res.render('admin/pages/tour-trash', {
    pageTitle: 'Thùng rác tour',
    tourList: tourList,
    pagination: pagination,
  });
}

module.exports.changeMultiPatch = async (req, res) => {
  try {
    const { option, ids } = req.body;
    const permissions = req.role ? req.role.permissions : [];

    if(permissions.includes("tour-edit") && (option === "active" || option === "inactive")) {
      await Tour.updateMany({
        _id: { $in: ids }
      }, {
        status: option
      });
      req.flash('success', 'Đổi trạng thái thành công');
      return res.json({
        code: "SUCCESS"
      });
    } else if(permissions.includes("tour-delete") && option === "delete") {
      await Tour.updateMany({
        _id: { $in: ids }
      }, {
        deleted: true,
        deletedAt: Date.now(),
        deletedBy: req.account ? req.account._id : null
      });
      req.flash('success', 'Xóa thành công');
      return res.json({
        code: "SUCCESS"
      });
    } else {
      return res.json({
        code: "ERROR",
        message: "Bạn không có quyền thực hiện thao tác này"
      });
    }
  } catch (error) {
    res.json({
      code: "ERROR",
      message: "Cập nhật thất bại"
    });
  }
}

module.exports.trashChangeMultiPatch = async (req, res) => {
  try {
    const { option, ids } = req.body;

    switch (option){
      case "undo":
        await Tour.updateMany({
          _id: { $in: ids },
          deleted: true
        }, {
          deleted: false
        });
        req.flash('success', 'Khôi phục thành công');
        break;
      case "delete-permanent":
        await Tour.deleteMany({
          _id: { $in: ids }
        });
        req.flash('success', 'Xóa vĩnh viễn thành công');
    }

    res.json({
      code: "SUCCESS"
    });
  } catch (error) {
    res.json({
      code: "ERROR",
      message: "Cập nhật thất bại"
    });
  }
}