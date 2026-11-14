// Menu Mobile
const buttonMenuMobile = document.querySelector(
  ".header .inner-wrap .inner-button-menu"
);
if (buttonMenuMobile) {
  const sider = document.querySelector(".sider");
  const siderOverlay = document.querySelector(".sider-overlay");
  buttonMenuMobile.addEventListener("click", () => {
    sider.classList.add("active");
    siderOverlay.classList.add("active");
  });
  siderOverlay.addEventListener("click", () => {
    sider.classList.remove("active");
    siderOverlay.classList.remove("active");
  });
}
// End Menu Mobile

// Schedule Section 8
const scheduleSection8 = document.querySelector(
  ".section-8 form .inner-schedule"
);
if (scheduleSection8) {
  const buttonCreate = scheduleSection8.querySelector(".inner-schedule-create");
  const listItem = scheduleSection8.querySelector(".inner-schedule-list");
  buttonCreate.addEventListener("click", () => {
    const firstItem = listItem.querySelector(".inner-schedule-item");
    const nextItem = firstItem.cloneNode(true);
    nextItem.querySelector(".inner-schedule-head input").value = "";

    const body = nextItem.querySelector(".inner-schedule-body");
    const id = `mce_${Date.now()}`;
    body.innerHTML = `<textarea textarea-mce id="${id}"></textarea>`;

    listItem.appendChild(nextItem);
    initTinyMce(`#${id}`);
  });

  listItem.addEventListener("click", (event) => {
    const parentItem = event.target.closest(".inner-schedule-item");
    if (parentItem) {
      // Tính năng đóng mở
      if (event.target.closest(".inner-more")) {
        //Tìm dần ra bên ngoài (dùng cho trường hợp click vào phần tử con của đối tượng)
        parentItem.classList.toggle("hidden");
      }
      // Tính năng xóa
      else if (event.target.closest(".inner-remove")) {
        const numberItem = listItem.querySelectorAll(
          ".inner-schedule-item"
        ).length;
        if (numberItem > 1) {
          parentItem.remove();
        }
      }
    }
  });

  //Sắp xếp (SortableJS)
  new Sortable(listItem, {
    handle: ".inner-move",
    animation: 150,
    // Element dragging started
    onStart: function (event) {
      const textarea = event.item.querySelector("[textarea-mce]");
      const id = textarea.id;
      tinymce.get(id).remove();
    },
    // Element dragging ended
    onEnd: function (event) {
      const textarea = event.item.querySelector("[textarea-mce]");
      const id = textarea.id;
      initTinyMce(`#${id}`);
    },
  });
  // Hết sắp xếp
}
// End Schedule Section 8

// Filepond image (FilepondJS)
const listFilepondImage = document.querySelectorAll("[filepond-image]");
let filePond = {};
if (listFilepondImage.length >= 1) {
  listFilepondImage.forEach((filepondImage) => {
    FilePond.registerPlugin(
      FilePondPluginImagePreview,
      FilePondPluginFileValidateType
    );

    let files = null;
    const elementImageDefault = filepondImage.closest("[image-default]");
    if(elementImageDefault){
      const imageDefault = elementImageDefault.getAttribute("image-default");
      if(imageDefault){
        files = [
          {
            source: imageDefault,
          }
        ];
      }
    }

    filePond[filepondImage.name] = FilePond.create(filepondImage, {
      labelIdle: `+`,
      files: files,
    });
  });
}
// End Filepond image

// Filepond image multi (FilepondJS)
const listFilepondImageMulti = document.querySelectorAll("[filepond-image-multi]");
let filePondMulti = {};
if (listFilepondImageMulti.length >= 1) {
  listFilepondImageMulti.forEach((filepondImage) => {
    FilePond.registerPlugin(
      FilePondPluginImagePreview,
      FilePondPluginFileValidateType
    );

    let files = null;
    const elementListImageDefault = filepondImage.closest("[list-image-default]");
    if(elementListImageDefault){
      let listImageDefault = elementListImageDefault.getAttribute("list-image-default");
      if(listImageDefault){
        listImageDefault = JSON.parse(listImageDefault);
        files = [];
        listImageDefault.forEach(item => {
          files.push({
            source: item,
          });
        });
      }
    }

    filePondMulti[filepondImage.name] = FilePond.create(filepondImage, {
      labelIdle: `+`,
      files: files,
    });
  });
}
// End Filepond image multi



// Category Create Form
const categoryCreateForm = document.querySelector("#category-create-form");
if (categoryCreateForm) {
  const validation = new JustValidate("#category-create-form");

  validation
    .addField("#name", [
      {
        rule: "required",
        errorMessage: "Vui lòng nhập vào tên danh mục",
      },
    ])
    .onSuccess((event) => {
      const name = event.target.name.value;
      const parent = event.target.parent.value;
      const position = event.target.position.value;
      const status = event.target.status.value;
      const avatars = filePond.avatar.getFiles();
      let avatar = null;
      if (avatars.length > 0) {
        avatar = avatars[0].file;
      }
      const description = tinymce.get("description").getContent();

      // Tạo FormData để gửi file
      const formData = new FormData();
      formData.append("name", name);
      formData.append("parent", parent);
      formData.append("position", position);
      formData.append("status", status);
      formData.append("avatar", avatar);
      formData.append("description", description);

      fetch(`/${pathAdmin}/category/create`, {
        method: "POST",
        body: formData,
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.code === "SUCCESS") {
            window.location.href = `/${pathAdmin}/category/list`;
          } else {
            alert(data.message);
          }
        });
    });
}
// End Category Create Form

// Category Edit Form
const categoryEditForm = document.querySelector("#category-edit-form");
if (categoryEditForm) {
  const validation = new JustValidate("#category-edit-form");

  validation
    .addField("#name", [
      {
        rule: "required",
        errorMessage: "Vui lòng nhập vào tên danh mục",
      },
    ])
    .onSuccess((event) => {
      const id = event.target.id.value;
      const name = event.target.name.value;
      const parent = event.target.parent.value;
      const position = event.target.position.value;
      const status = event.target.status.value;
      const avatars = filePond.avatar.getFiles();
      let avatar = null;
      if (avatars.length > 0) {
        avatar = avatars[0].file;
        const elementImageDefault = event.target.closest("[image-default]");
        if(elementImageDefault){
          const imageDefault = elementImageDefault.getAttribute("image-default");
          if(imageDefault.includes(avatar.name)){
            avatar = null;
          }
        }
      }
      const description = tinymce.get("description").getContent();

      // Tạo FormData để gửi file
      const formData = new FormData();
      formData.append("name", name);
      formData.append("parent", parent);
      formData.append("position", position);
      formData.append("status", status);
      formData.append("avatar", avatar);
      formData.append("description", description);

      fetch(`/${pathAdmin}/category/edit/${id}`, {
        method: "PATCH",
        body: formData,
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.code === "SUCCESS") {
            window.location.href = `/${pathAdmin}/category/edit/${id}`;
          } else {
            alert(data.message);
          }
        });
    });
}
// End Category Edit Form

// Tour Create Form
const tourCreateForm = document.querySelector("#tour-create-form");
if (tourCreateForm) {
  const validation = new JustValidate("#tour-create-form");

  validation
    .addField("#name", [
      {
        rule: "required",
        errorMessage: "Vui lòng nhập vào tên danh mục",
      },
    ])
    .onSuccess((event) => {
      const name = event.target.name.value;
      const category = event.target.category.value;
      const position = event.target.position.value;
      const status = event.target.status.value;
      const avatars = filePond.avatar.getFiles();
      let avatar = null;
      if (avatars.length > 0) {
        avatar = avatars[0].file;
      }
      const priceAdult = event.target.priceAdult.value;
      const priceChildren = event.target.priceChildren.value;
      const priceBaby = event.target.priceBaby.value;
      const newPriceAdult = event.target.newPriceAdult.value;
      const newPriceChildren = event.target.newPriceChildren.value;
      const newPriceBaby = event.target.newPriceBaby.value;
      const stockAdult = event.target.stockAdult.value;
      const stockChildren = event.target.stockChildren.value;
      const stockBaby = event.target.stockBaby.value;

      const locations = [];
      const time = event.target.time.value;
      const vehicle = event.target.vehicle.value;
      const departureDate = event.target.departure.value;
      const information = tinymce.get("information").getContent();
      const schedules = [];

      //locations
      const listLocations = tourCreateForm.querySelectorAll(
        `input[name="locations"]:checked`
      );
      listLocations.forEach((input) => {
        locations.push(input.value);
      });
      //End locations

      // schedules
      const listSchedules = tourCreateForm.querySelectorAll(
        ".inner-schedule-item"
      );
      listSchedules.forEach((item) => {
        const input = item.querySelector(".inner-schedule-head input");
        const title = input.value;

        const textarea = item.querySelector(".inner-schedule-body textarea");
        const id = textarea.id;
        const description = tinymce.get(id).getContent();
        schedules.push({
          title: title,
          description: description,
        });
      });
      // End schedules

      // Tạo FormData để gửi file
      const formData = new FormData();
      formData.append("name", name);
      formData.append("category", category);
      formData.append("position", position);
      formData.append("status", status);
      formData.append("avatar", avatar);
      formData.append("priceAdult", priceAdult);
      formData.append("priceChildren", priceChildren);
      formData.append("priceBaby", priceBaby);
      formData.append("newPriceAdult", newPriceAdult);
      formData.append("newPriceChildren", newPriceChildren);
      formData.append("newPriceBaby", newPriceBaby);
      formData.append("stockAdult", stockAdult);
      formData.append("stockChildren", stockChildren);
      formData.append("stockBaby", stockBaby);
      formData.append("locations", JSON.stringify(locations));
      formData.append("time", time);
      formData.append("vehicle", vehicle);
      formData.append("departureDate", departureDate);
      formData.append("information", information);
      formData.append("schedules", JSON.stringify(schedules));

      // Image Multi
      if(filePondMulti.images.getFiles().length > 0){
        filePondMulti.images.getFiles().forEach(item => {
          formData.append("images", item.file);
        })
      }
      // End Image Multi

      fetch(`/${pathAdmin}/tour/create`, {
        method: "POST",
        body: formData,
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.code === "SUCCESS") {
            window.location.href = `/${pathAdmin}/tour/list`;
          } else {
            alert(data.message);
          }
        });
    });
}
// End Tour Create Form

// Tour Edit Form
const tourEditForm = document.querySelector("#tour-edit-form");
if (tourEditForm) {
  const validation = new JustValidate("#tour-edit-form");

  validation
    .addField("#name", [
      {
        rule: "required",
        errorMessage: "Vui lòng nhập vào tên danh mục",
      },
    ])
    .onSuccess((event) => {
      const id = event.target.id.value;
      const name = event.target.name.value;
      const category = event.target.category.value;
      const position = event.target.position.value;
      const status = event.target.status.value;
      const avatars = filePond.avatar.getFiles();
      let avatar = null;
      if (avatars.length > 0) {
        avatar = avatars[0].file;
        const elementImageDefault = event.target.closest("[image-default]");
        if(elementImageDefault){
          const imageDefault = elementImageDefault.getAttribute("image-default");
          if(imageDefault.includes(avatar.name)){
            avatar = null;
          }
        }
      }
      const priceAdult = event.target.priceAdult.value;
      const priceChildren = event.target.priceChildren.value;
      const priceBaby = event.target.priceBaby.value;
      const newPriceAdult = event.target.newPriceAdult.value;
      const newPriceChildren = event.target.newPriceChildren.value;
      const newPriceBaby = event.target.newPriceBaby.value;
      const stockAdult = event.target.stockAdult.value;
      const stockChildren = event.target.stockChildren.value;
      const stockBaby = event.target.stockBaby.value;

      const locations = [];
      const time = event.target.time.value;
      const vehicle = event.target.vehicle.value;
      const departureDate = event.target.departure.value;
      const information = tinymce.get("information").getContent();
      const schedules = [];

      //locations
      const listLocations = tourEditForm.querySelectorAll(
        `input[name="locations"]:checked`
      );
      listLocations.forEach((input) => {
        locations.push(input.value);
      });
      //End locations

      // schedules
      const listSchedules = tourEditForm.querySelectorAll(
        ".inner-schedule-item"
      );
      listSchedules.forEach((item) => {
        const input = item.querySelector(".inner-schedule-head input");
        const title = input.value;

        const textarea = item.querySelector(".inner-schedule-body textarea");
        const id = textarea.id;
        const description = tinymce.get(id).getContent();
        schedules.push({
          title: title,
          description: description,
        });
      });
      // End schedules

      // Tạo FormData để gửi file
      const formData = new FormData();
      formData.append("name", name);
      formData.append("category", category);
      formData.append("position", position);
      formData.append("status", status);
      formData.append("avatar", avatar);
      formData.append("priceAdult", priceAdult);
      formData.append("priceChildren", priceChildren);
      formData.append("priceBaby", priceBaby);
      formData.append("newPriceAdult", newPriceAdult);
      formData.append("newPriceChildren", newPriceChildren);
      formData.append("newPriceBaby", newPriceBaby);
      formData.append("stockAdult", stockAdult);
      formData.append("stockChildren", stockChildren);
      formData.append("stockBaby", stockBaby);
      formData.append("locations", JSON.stringify(locations));
      formData.append("time", time);
      formData.append("vehicle", vehicle);
      formData.append("departureDate", departureDate);
      formData.append("information", information);
      formData.append("schedules", JSON.stringify(schedules));

      // Image Multi
      if(filePondMulti.images.getFiles().length > 0){
        filePondMulti.images.getFiles().forEach(item => {
          formData.append("images", item.file);
        })
      }
      // End Image Multi

      fetch(`/${pathAdmin}/tour/edit/${id}`, {
        method: "PATCH",
        body: formData,
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.code === "SUCCESS") {
            window.location.href = `/${pathAdmin}/tour/edit/${id}`;
          } else {
            alert(data.message);
          }
        });
    });
}
// End Tour Edit Form

// Order Edit Form
const orderEditForm = document.querySelector("#order-edit-form");
if (orderEditForm) {
  const validation = new JustValidate("#order-edit-form");

  validation
    .addField("#fullName", [
      {
        rule: "required",
        errorMessage: "Vui lòng nhập họ tên",
      },
      {
        rule: "minLength",
        value: 5,
        errorMessage: "Họ tên phải có ít nhất 5 ký tự",
      },
      {
        rule: "maxLength",
        value: 50,
        errorMessage: "Họ tên không được vượt quá 50 ký tự",
      },
    ])
    .addField("#phoneNumber", [
      {
        rule: "required",
        errorMessage: "Vui lòng nhập số điện thoại!",
      },
      {
        rule: "customRegexp",
        value: /(84|0[3|5|7|8|9])+([0-9]{8})\b/g,
        errorMessage: "Số điện thoại không đúng định dạng",
      },
    ])
    .onSuccess((event) => {
      const id = event.target.id.value;
      const fullName = event.target.fullName.value;
      const phoneNumber = event.target.phoneNumber.value;
      const note = event.target.note.value;
      const paymentMethod = event.target.paymentMethod.value;
      const paymentStatus = event.target.paymentStatus.value;
      const status = event.target.status.value;

      const dataFinal = {
        fullName: fullName,
        phoneNumber: phoneNumber,
        note: note,
        paymentMethod: paymentMethod,
        paymentStatus: paymentStatus,
        status: status,
      };

      fetch(`/${pathAdmin}/order/edit/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(dataFinal),
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.code == "SUCCESS") {
            window.location.reload();
          } else {
            alert(data.message);
          }
        });
    });
}
// End Order Edit Form

// Setting Website Info Form
const settingWebsiteInfoForm = document.querySelector(
  "#setting-website-info-form"
);
if (settingWebsiteInfoForm) {
  const validation = new JustValidate("#setting-website-info-form");

  validation
    .addField("#websiteName", [
      {
        rule: "required",
        errorMessage: "Vui lòng nhập tên website",
      },
    ])
    .addField("#email", [
      {
        rule: "email",
        errorMessage: "Email không đúng định dạng",
      },
    ])
    .onSuccess((event) => {
      const websiteName = event.target.websiteName.value;
      const phoneNumber = event.target.phoneNumber.value;
      const email = event.target.email.value;
      const address = event.target.address.value;
      const clockExpire = event.target.clockExpire.value;
      const logos = filePond.logo.getFiles();
      let logo = null;
      if (logos.length > 0) {
        logo = logos[0].file;
        const elementImageDefault = event.target.closest("[image-default]");
        let imageDefault = null;
        if (elementImageDefault) {
          imageDefault = elementImageDefault.getAttribute("image-default");
        }
        if (imageDefault && imageDefault.includes(logo.name)) {
          logo = null;
        }
      }

      const favicons = filePond.favicon.getFiles();
      let favicon = null;
      if (favicons.length > 0) {
        favicon = favicons[0].file;
        const elementImageDefault = event.target.closest("[image-default]");
        let imageDefault = null;
        if (elementImageDefault) {
          imageDefault = elementImageDefault.getAttribute("image-default");
        }
        if (imageDefault && imageDefault.includes(favicon.name)) {
          favicon = null;
        }
      }

      // Tạo FormData để gửi file
      const formData = new FormData();
      formData.append("websiteName", websiteName);
      formData.append("phoneNumber", phoneNumber);
      formData.append("email", email);
      formData.append("address", address);
      formData.append("clockExpire", clockExpire);
      formData.append("logo", logo);
      formData.append("favicon", favicon);

      fetch(`/${pathAdmin}/setting/website-info`, {
        method: "PATCH",
        body: formData,
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.code === "SUCCESS") {
            window.location.reload();
          } else {
            alert(data.message);
          }
        });
    });
}
// End Setting Website Info Form

// Setting Account Admin Create Form
const settingAccountAdminCreateForm = document.querySelector(
  "#setting-account-admin-create-form"
);
if (settingAccountAdminCreateForm) {
  const validation = new JustValidate("#setting-account-admin-create-form");

  validation
    .addField("#fullName", [
      {
        rule: "required",
        errorMessage: "Vui lòng nhập họ tên",
      },
      {
        rule: "minLength",
        value: 5,
        errorMessage: "Họ tên phải có ít nhất 5 ký tự",
      },
      {
        rule: "maxLength",
        value: 50,
        errorMessage: "Họ tên không được vượt quá 50 ký tự",
      },
    ])
    .addField("#email", [
      {
        rule: "required",
        errorMessage: "Vui lòng nhập email",
      },
      {
        rule: "email",
        errorMessage: "Email không đúng định dạng",
      },
    ])
    .addField("#phoneNumber", [
      {
        rule: "required",
        errorMessage: "Vui lòng nhập số điện thoại",
      },
      {
        rule: "customRegexp",
        value: /(84|0[3|5|7|8|9])+([0-9]{8})\b/g,
        errorMessage: "Số điện thoại không đúng định dạng",
      },
    ])
    .addField("#positionCompany", [
      {
        rule: "required",
        errorMessage: "Vui lòng nhập chức vụ",
      },
    ])
    .addField("#password", [
      {
        rule: "required",
        errorMessage: "Vui lòng nhập mật khẩu",
      },
      {
        validator: (value) => value.length >= 8,
        errorMessage: "Mật khẩu phải chứa ít nhất 8 ký tự",
      },
      {
        validator: (value) => /[A-Z]/.test(value),
        errorMessage: "Mật khẩu phải chứa ít nhất một chữ cái in hoa",
      },
      {
        validator: (value) => /[a-z]/.test(value),
        errorMessage: "Mật khẩu phải chứa ít nhất một chữ cái thường",
      },
      {
        validator: (value) => /\d/.test(value),
        errorMessage: "Mật khẩu phải chứa ít nhất một chữ số",
      },
      {
        validator: (value) => /[@$!%*?&]/.test(value),
        errorMessage: "Mật khẩu phải chứa ít nhất một ký tự đặc biệt",
      },
    ])
    .onSuccess((event) => {
      const fullName = event.target.fullName.value;
      const email = event.target.email.value;
      const phoneNumber = event.target.phoneNumber.value;
      const role = event.target.role.value;
      const positionCompany = event.target.positionCompany.value;
      const status = event.target.status.value;
      const password = event.target.password.value;
      const avatars = filePond.avatar.getFiles();
      let avatar = null;
      if (avatars.length > 0) {
        avatar = avatars[0].file;
      }

      const formData = new FormData();
      formData.append("fullName", fullName);
      formData.append("email", email);
      formData.append("phoneNumber", phoneNumber);
      formData.append("role", role);
      formData.append("positionCompany", positionCompany);
      formData.append("status", status);
      formData.append("password", password);
      formData.append("avatar", avatar);

      fetch(`/${pathAdmin}/setting/account-admin/create`, {
        method: "POST",
        body: formData,
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.code == "SUCCESS") {
            window.location.href = `/${pathAdmin}/setting/account-admin/list`;
          } else {
            alert(data.message);
          }
        });
    });
}
// End Setting Account Admin Create Form

// Setting Account Admin Edit Form
const settingAccountAdminEditForm = document.querySelector(
  "#setting-account-admin-edit-form"
);
if (settingAccountAdminEditForm) {
  const validation = new JustValidate("#setting-account-admin-edit-form");

  validation
    .addField("#fullName", [
      {
        rule: "required",
        errorMessage: "Vui lòng nhập họ tên",
      },
      {
        rule: "minLength",
        value: 5,
        errorMessage: "Họ tên phải có ít nhất 5 ký tự",
      },
      {
        rule: "maxLength",
        value: 50,
        errorMessage: "Họ tên không được vượt quá 50 ký tự",
      },
    ])
    .addField("#email", [
      {
        rule: "required",
        errorMessage: "Vui lòng nhập email",
      },
      {
        rule: "email",
        errorMessage: "Email không đúng định dạng",
      },
    ])
    .addField("#phoneNumber", [
      {
        rule: "required",
        errorMessage: "Vui lòng nhập số điện thoại",
      },
      {
        rule: "customRegexp",
        value: /(84|0[3|5|7|8|9])+([0-9]{8})\b/g,
        errorMessage: "Số điện thoại không đúng định dạng",
      },
    ])
    .addField("#positionCompany", [
      {
        rule: "required",
        errorMessage: "Vui lòng nhập chức vụ",
      },
    ])
    .addField("#password", [
      {
        validator: (value) => value ? value.length >= 8 : true,
        errorMessage: "Mật khẩu phải chứa ít nhất 8 ký tự",
      },
      {
        validator: (value) => value ? /[A-Z]/.test(value) : true,
        errorMessage: "Mật khẩu phải chứa ít nhất một chữ cái in hoa",
      },
      {
        validator: (value) => value ? /[a-z]/.test(value) : true,
        errorMessage: "Mật khẩu phải chứa ít nhất một chữ cái thường",
      },
      {
        validator: (value) => value ? /\d/.test(value) : true,
        errorMessage: "Mật khẩu phải chứa ít nhất một chữ số",
      },
      {
        validator: (value) => value ? /[@$!%*?&]/.test(value) : true,
        errorMessage: "Mật khẩu phải chứa ít nhất một ký tự đặc biệt",
      },
    ])
    .onSuccess((event) => {
      const id = event.target.id.value;
      const fullName = event.target.fullName.value;
      const email = event.target.email.value;
      const phoneNumber = event.target.phoneNumber.value;
      const role = event.target.role.value;
      const positionCompany = event.target.positionCompany.value;
      const status = event.target.status.value;
      const password = event.target.password.value;
      const avatars = filePond.avatar.getFiles();
      let avatar = null;
      if (avatars.length > 0) {
        avatar = avatars[0].file;
        const elementImageDefault = event.target.closest("[image-default]");
        if(elementImageDefault){
          const imageDefault = elementImageDefault.getAttribute("image-default"); 
          if(imageDefault.includes(avatar.name)){
            avatar = null;
          }
        }
      }

      const formData = new FormData();
      formData.append("fullName", fullName);
      formData.append("email", email);
      formData.append("phoneNumber", phoneNumber);
      formData.append("role", role);
      formData.append("positionCompany", positionCompany);
      formData.append("status", status);
      formData.append("password", password);
      formData.append("avatar", avatar);

      fetch(`/${pathAdmin}/setting/account-admin/edit/${id}`, {
        method: "PATCH",
        body: formData,
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.code == "SUCCESS") {
            window.location.reload();
          } else {
            alert(data.message);
          }
        });
    });
}
// End Setting Account Admin Edit Form

// Setting Role Create Form
const settingRoleCreateForm = document.querySelector(
  "#setting-role-create-form"
);
if (settingRoleCreateForm) {
  const validation = new JustValidate("#setting-role-create-form");

  validation
    .addField("#name", [
      {
        rule: "required",
        errorMessage: "Vui lòng nhập tên nhóm quyền",
      },
    ])
    .onSuccess((event) => {
      const name = event.target.name.value;
      const description = event.target.shortDescription.value;
      const permissions = [];

      // permissions
      const listPermissions = settingRoleCreateForm.querySelectorAll(
        'input[name="permissions"]:checked'
      );
      listPermissions.forEach((input) => {
        permissions.push(input.value);
      });
      // End permissions

      const dataFinal = {
        name: name,
        description: description,
        permissions: permissions,
      }

      fetch(`/${pathAdmin}/setting/role/create`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(dataFinal),
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.code == "SUCCESS") {
            window.location.href = `/${pathAdmin}/setting/role/list`;
          } else {
            alert(data.message);
          }
        });
    });
}
// End Setting Role Create Form

// Setting Role Edit Form
const settingRoleEditForm = document.querySelector(
  "#setting-role-edit-form"
);
if (settingRoleEditForm) {
  const validation = new JustValidate("#setting-role-edit-form");

  validation
    .addField("#name", [
      {
        rule: "required",
        errorMessage: "Vui lòng nhập tên nhóm quyền",
      },
    ])
    .onSuccess((event) => {
      const id = event.target.id.value;
      const name = event.target.name.value;
      const description = event.target.shortDescription.value;
      const permissions = [];

      // permissions
      const listPermissions = settingRoleEditForm.querySelectorAll(
        'input[name="permissions"]:checked'
      );
      listPermissions.forEach((input) => {
        permissions.push(input.value);
      });
      // End permissions

      const dataFinal = {
        name: name,
        description: description,
        permissions: permissions,
      }

      fetch(`/${pathAdmin}/setting/role/edit/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(dataFinal),
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.code == "SUCCESS") {
            window.location.reload();
          } else {
            alert(data.message);
          }
        });
    });
}
// End Setting Role Edit Form

// Profile Edit Form
const profileEditForm = document.querySelector("#profile-edit-form");
if (profileEditForm) {
  const validation = new JustValidate("#profile-edit-form");

  validation
    .addField("#fullName", [
      {
        rule: "required",
        errorMessage: "Vui lòng nhập họ tên",
      },
      {
        rule: "minLength",
        value: 5,
        errorMessage: "Họ tên phải có ít nhất 5 ký tự",
      },
      {
        rule: "maxLength",
        value: 50,
        errorMessage: "Họ tên không được vượt quá 50 ký tự",
      },
    ])
    .addField("#email", [
      {
        rule: "required",
        errorMessage: "Vui lòng nhập email",
      },
      {
        rule: "email",
        errorMessage: "Email không đúng định dạng",
      },
    ])
    .addField("#phoneNumber", [
      {
        rule: "required",
        errorMessage: "Vui lòng nhập số điện thoại",
      },
      {
        rule: "customRegexp",
        value: /(84|0[3|5|7|8|9])+([0-9]{8})\b/g,
        errorMessage: "Số điện thoại không đúng định dạng",
      },
    ])
    .onSuccess((event) => {
      const fullName = event.target.fullName.value;
      const email = event.target.email.value;
      const phoneNumber = event.target.phoneNumber.value;
      const avatars = filePond.avatar.getFiles();
      let avatar = null;
      if (avatars.length > 0) {
        avatar = avatars[0].file;
        const elementImageDefault = event.target.closest("[image-default]");
        if(elementImageDefault){
          const imageDefault = elementImageDefault.getAttribute("image-default"); 
          if(imageDefault.includes(avatar.name)){
            avatar = null;
          }
        }
      }

      const formData = new FormData();
      formData.append("fullName", fullName);
      formData.append("email", email);
      formData.append("phoneNumber", phoneNumber);
      formData.append("avatar", avatar);

      fetch(`/${pathAdmin}/profile/edit`, {
        method: "PATCH",
        body: formData,
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.code === "SUCCESS") {
            window.location.reload();
          } else {
            alert(data.message);
          }
        });
    });
}
// End Profile Edit Form

// Profile Change Password Form
const profileChangePasswordForm = document.querySelector(
  "#profile-change-password-form"
);
if (profileChangePasswordForm) {
  const validation = new JustValidate("#profile-change-password-form");

  validation
    .addField("#password", [
      {
        rule: "required",
        errorMessage: "Vui lòng nhập mật khẩu",
      },
      {
        validator: (value) => value.length >= 8,
        errorMessage: "Mật khẩu phải chứa ít nhất 8 ký tự",
      },
      {
        validator: (value) => /[A-Z]/.test(value),
        errorMessage: "Mật khẩu phải chứa ít nhất một chữ cái in ho!",
      },
      {
        validator: (value) => /[a-z]/.test(value),
        errorMessage: "Mật khẩu phải chứa ít nhất một chữ cái thường",
      },
      {
        validator: (value) => /\d/.test(value),
        errorMessage: "Mật khẩu phải chứa ít nhất một chữ số",
      },
      {
        validator: (value) => /[@$!%*?&]/.test(value),
        errorMessage: "Mật khẩu phải chứa ít nhất một ký tự đặc biệt",
      },
    ])
    .addField("#confirmPassword", [
      {
        rule: "required",
        errorMessage: "Vui lòng xác nhận mật khẩu",
      },
      {
        validator: (value, fields) => {
          const password = fields["#password"].elem.value;
          return value == password;
        },
        errorMessage: "Mật khẩu xác nhận không khớp",
      },
    ])
    .onSuccess((event) => {
      const password = event.target.password.value;
      
      const dataFinal = { password: password };

      fetch(`/${pathAdmin}/profile/change-password`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(dataFinal),
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.code === "SUCCESS") {
            window.location.reload();
          } else {
            alert(data.message);
          }
        });
    });
}
// End Profile Change Password Form

//Sider
const sider = document.querySelector(".sider");
if (sider) {
  const currentPathName = window.location.pathname;
  const splitCurrentPathName = currentPathName.split("/");
  const menuList = sider.querySelectorAll("a");
  menuList.forEach((item) => {
    const href = item.href;
    const pathName = new URL(href).pathname;
    const splitPathName = pathName.split("/");
    if (
      splitCurrentPathName[1] == splitPathName[1] &&
      splitCurrentPathName[2] == splitPathName[2]
    ) {
      item.classList.add("active");
    }
  });

  const siderToggle = sider.querySelector(".sider-toggle");
  if (siderToggle) {
    const toggleLabel = siderToggle.querySelector(".inner-label");
    const syncToggleState = (collapsed) => {
      siderToggle.setAttribute("aria-expanded", String(!collapsed));
      siderToggle.setAttribute("aria-label", collapsed ? "Mở rộng thanh bên" : "Thu gọn thanh bên");
      if (toggleLabel) {
        toggleLabel.textContent = collapsed ? "Mở rộng" : "Thu gọn";
      }
    };

    syncToggleState(document.body.classList.contains("sider-collapsed"));

    siderToggle.addEventListener("click", () => {
      const isCollapsed = document.body.classList.toggle("sider-collapsed");
      syncToggleState(isCollapsed);
      try {
        localStorage.setItem("adminSiderCollapsed", isCollapsed ? "1" : "0");
      } catch (e) {}
    });
  }
}
//End Sider

//Logout
const buttonLogout = document.querySelector(".sider .inner-logout");
if (buttonLogout) {
  buttonLogout.addEventListener("click", () => {
    fetch(`/${pathAdmin}/account/logout`, {
      method: "POST",
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.code == "SUCCESS") {
          window.location.href = `/${pathAdmin}/account/login`;
        }
      });
  });
}
//End Logout

// Alert
const alertTime = document.querySelector("[alert-time]");
if (alertTime) {
  let time = alertTime.getAttribute("alert-time");
  time = time ? parseInt(time) : 4000;
  setTimeout(() => {
    alertTime.remove();
  }, time); 
}
// End Alert

// Button Delete
const listButtonDelete = document.querySelectorAll("[button-delete]");
if (listButtonDelete.length > 0) {
  listButtonDelete.forEach((button) => {
    button.addEventListener("click", () => {
      const confirmMessage = button.getAttribute("data-confirm");
      if (confirmMessage && !window.confirm(confirmMessage)) {
        return;
      }

      const dataApi = button.getAttribute("data-api");

      fetch(dataApi, {
        method: "PATCH",
      })
        .then((response) => response.json())
        .then((data) => {
          if (data.code == "SUCCESS") {
            window.location.reload();
          }
          else {
            alert(data.message);
          }
        })
        .catch(() => alert("Không thể xử lý yêu cầu. Vui lòng thử lại."));
    })
  });
}
// End Button Delete

// Button Undo
const listButtonUndo = document.querySelectorAll("[button-undo]");
if (listButtonUndo.length > 0) {
  listButtonUndo.forEach((button) => {
    button.addEventListener("click", () => {
      const dataApi = button.getAttribute("data-api");

      fetch(dataApi, {
        method: "PATCH",
      })
        .then((response) => response.json())
        .then((data) => {
          if (data.code == "SUCCESS") {
            window.location.reload();
          }
          else {
            alert(data.message);
          }
        });
    })
  });
}
// End Button Undo

// Filter Status
const filterStatus = document.querySelector("[filter-status]");
if (filterStatus) {
  const url = new URL(window.location.href);

  //Lắng nghe thay đổi lựa chọn
  filterStatus.addEventListener("change", () => {
    const status = filterStatus.value;

    if(status){
      url.searchParams.set("status", status);
    }
    else {
      url.searchParams.delete("status");
    }

    url.searchParams.delete("page");
    window.location.href = url.href;
  });

  // Hiển thị lựa chọn mặc định
  const currentStatus = url.searchParams.get("status");
  if (currentStatus) {
    filterStatus.value = currentStatus;
  }
}
// End Filter Status

// Filter Created By
const filterCreatedBy = document.querySelector("[filter-created-by]");
if (filterCreatedBy) {
  const url = new URL(window.location.href);

  //Lắng nghe thay đổi lựa chọn
  filterCreatedBy.addEventListener("change", () => {
    const createdBy = filterCreatedBy.value;

    if(createdBy){
      url.searchParams.set("createdBy", createdBy);
    }
    else {
      url.searchParams.delete("createdBy");
    }

    url.searchParams.delete("page");
    window.location.href = url.href;
  });

  // Hiển thị lựa chọn mặc định
  const currentCreatedBy = url.searchParams.get("createdBy");
  if (currentCreatedBy) {
    filterCreatedBy.value = currentCreatedBy;
  }
}
// End Filter Created By

// Filter Start Date
const filterStartDate = document.querySelector("[filter-start-date]");
if (filterStartDate) {
  const url = new URL(window.location.href);

  //Lắng nghe thay đổi lựa chọn
  filterStartDate.addEventListener("change", () => {
    const startDate = filterStartDate.value;

    if(startDate){
      url.searchParams.set("startDate", startDate);
    }
    else {
      url.searchParams.delete("startDate");
    }

    url.searchParams.delete("page");
    window.location.href = url.href;
  });

  // Hiển thị lựa chọn mặc định
  const currentStartDate = url.searchParams.get("startDate");
  if (currentStartDate) {
    filterStartDate.value = currentStartDate;
  }
}
// End Filter Start Date

// Filter End Date
const filterEndDate = document.querySelector("[filter-end-date]");
if (filterEndDate) {
  const url = new URL(window.location.href);

  //Lắng nghe thay đổi lựa chọn
  filterEndDate.addEventListener("change", () => {
    const endDate = filterEndDate.value;

    if(endDate){
      url.searchParams.set("endDate", endDate);
    }
    else {
      url.searchParams.delete("endDate");
    }

    url.searchParams.delete("page");
    window.location.href = url.href;
  });

  // Hiển thị lựa chọn mặc định
  const currentEndDate = url.searchParams.get("endDate");
  if (currentEndDate) {
    filterEndDate.value = currentEndDate;
  }
}
// End Filter End Date

// Filter Category
const filterCategory = document.querySelector("[filter-category]");
if (filterCategory) {
  const url = new URL(window.location.href);

  // Lắng nghe thay đổi lựa chọn
  filterCategory.addEventListener("change", () => {
    const category = filterCategory.value;

    if(category){
      url.searchParams.set("category", category);
    }
    else {
      url.searchParams.delete("category");
    }

    url.searchParams.delete("page");
    window.location.href = url.href;
  });

  // Hiển thị lựa chọn mặc định
  const currentCategory = url.searchParams.get("category");
  if (currentCategory) {
    filterCategory.value = currentCategory;
  }
}
// End Filter Category

// Filter Price
const filterPrice = document.querySelector("[filter-price]");
if (filterPrice) {
  const url = new URL(window.location.href);

  // Lắng nghe thay đổi lựa chọn
  filterPrice.addEventListener("change", () => {
    const price = filterPrice.value;

    if(price){
      url.searchParams.set("price", price);
    }
    else {
      url.searchParams.delete("price");
    }

    url.searchParams.delete("page");
    window.location.href = url.href;
  });

  // Hiển thị lựa chọn mặc định
  const currentPrice = url.searchParams.get("price");
  if (currentPrice) {
    filterPrice.value = currentPrice;
  }
}
// End Filter Price

// Filter reset
const filterReset = document.querySelector("[filter-reset]");
if (filterReset) {
  const url = new URL(window.location.href);
  filterReset.addEventListener("click", () => {
    url.search = "";
    window.location.href = url.href;
  });
}
// End Filter reset

// Check All
const checkAll = document.querySelector("[check-all]");
if(checkAll){
  checkAll.addEventListener("click", () => {
    const listCheckItem = document.querySelectorAll("[check-item]");
    listCheckItem.forEach((item) => {
      item.checked = checkAll.checked;
    })
  });
}
// End Check All

// Change Multi
const changeMulti = document.querySelector("[change-multi]");
if(changeMulti){
  const select = changeMulti.querySelector("select");
  const button = changeMulti.querySelector("button");
  const selectedCountEl = changeMulti.querySelector("[bulk-selected-count]");
  const checkItems = document.querySelectorAll("[check-item]");

  const updateBulkActionState = () => {
    const checkedCount = document.querySelectorAll("[check-item]:checked").length;
    changeMulti.classList.toggle("is-active", checkedCount > 0);
    if (selectedCountEl) {
      selectedCountEl.textContent = checkedCount > 0
        ? `Đã chọn ${checkedCount} mục`
        : "Chọn ô tích bên dưới để áp dụng";
    }
    if (button) {
      button.disabled = checkedCount === 0;
    }
  };

  checkItems.forEach((item) => {
    item.addEventListener("change", updateBulkActionState);
  });
  updateBulkActionState();

  button.addEventListener("click", () => {
    const option = select.value;
    const listCheckItem = document.querySelectorAll("[check-item]:checked");
    if (listCheckItem.length === 0) {
      return;
    }
    if (!option) {
      alert("Vui lòng chọn hành động cần áp dụng!");
      select.focus();
      return;
    }

    const ids = [];

    listCheckItem.forEach((item) => {
      const id = item.getAttribute("check-item");
      ids.push(id);
    });

    const dataFinal = {
      option: option,
      ids: ids
    };

    const dataApi = changeMulti.getAttribute("data-api");

    fetch(dataApi, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(dataFinal)
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.code === "SUCCESS") {
          window.location.reload();
        } else {
          alert(data.message);
        }
      });
  });
}
// End Change Multi

//Search
const inputSearch = document.querySelector("[search]");
if(inputSearch){
  const url = new URL(window.location.href);

  // Lắng nghe bấm enter thì đi tìm
  inputSearch.addEventListener("keyup", (event) => {
    if(event.code == "Enter"){
      const value = inputSearch.value;
      
      if(value){
        url.searchParams.set("keyword", value);
      }
      else {
        url.searchParams.delete("keyword");
      }

      url.searchParams.delete("page");
      window.location.href = url.href;
      }
  })

  // Hiển thị lựa chọn mặc định
  const valueCurrent = url.searchParams.get("keyword");
  if (valueCurrent) {
    inputSearch.value = valueCurrent;
  }
}
// End Search

// Pagination
const pagination = document.querySelector("[pagination]");
if (pagination) {
  const url = new URL(window.location.href);

  const goToPage = (targetPage) => {
    if (targetPage && targetPage > 1) {
      url.searchParams.set("page", targetPage);
    } else {
      url.searchParams.delete("page");
    }
    window.location.href = url.href;
  };

  if (pagination.tagName === "SELECT") {
    pagination.addEventListener("change", () => {
      goToPage(parseInt(pagination.value, 10));
    });

    const valueCurrent = url.searchParams.get("page");
    if (valueCurrent) {
      pagination.value = valueCurrent;
    }
  } else {
    const totalPages = Math.max(1, parseInt(pagination.getAttribute("data-total-pages"), 10) || 1);
    const paramPage = parseInt(url.searchParams.get("page"), 10);
    const attrPage = parseInt(pagination.getAttribute("data-current-page"), 10) || 1;
    const currentPage = Math.min(totalPages, Math.max(1, Number.isNaN(paramPage) ? attrPage : paramPage));

    const prevBtn = pagination.querySelector("[pagination-prev]");
    const nextBtn = pagination.querySelector("[pagination-next]");
    const pageInput = pagination.querySelector("[pagination-input]");

    if (prevBtn) {
      prevBtn.disabled = currentPage <= 1;
      prevBtn.addEventListener("click", () => {
        if (currentPage > 1) {
          goToPage(currentPage - 1);
        }
      });
    }

    if (nextBtn) {
      nextBtn.disabled = currentPage >= totalPages;
      nextBtn.addEventListener("click", () => {
        if (currentPage < totalPages) {
          goToPage(currentPage + 1);
        }
      });
    }

    if (pageInput) {
      pageInput.value = currentPage;
      const submitInputPage = () => {
        const parsed = parseInt(pageInput.value, 10);
        if (Number.isNaN(parsed)) {
          pageInput.value = currentPage;
          return;
        }
        const clamped = Math.min(totalPages, Math.max(1, parsed));
        pageInput.value = clamped;
        if (clamped !== currentPage) {
          goToPage(clamped);
        }
      };

      pageInput.addEventListener("keydown", (event) => {
        if (event.key === "Enter") {
          event.preventDefault();
          submitInputPage();
        }
      });

      pageInput.addEventListener("change", submitInputPage);
    }
  }
}
// End Pagination
