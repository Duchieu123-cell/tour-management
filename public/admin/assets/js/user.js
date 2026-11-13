document.addEventListener("DOMContentLoaded", () => {
  // Helpers: Mở / Đóng Modal
  const openModal = (modal) => {
    if (modal) {
      modal.classList.add("show");
      document.body.style.overflow = "hidden";
    }
  };

  const closeModal = (modal) => {
    if (modal) {
      modal.classList.remove("show");
      document.body.style.overflow = "";
      const form = modal.querySelector("form");
      if (form) form.reset();
    }
  };

  // Đóng Modal khi bấm vào phần tử có thuộc tính [modal-close]
  document.querySelectorAll("[modal-close]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const modal = btn.closest(".custom-modal");
      if (modal) closeModal(modal);
    });
  });

  // Đóng Modal khi nhấn phím Escape
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      document.querySelectorAll(".custom-modal.show").forEach(closeModal);
    }
  });

  // Helper xem trước ảnh đại diện (Instant Image Preview)
  const setupAvatarPreview = (inputId, previewId, defaultSrc) => {
    const input = document.getElementById(inputId);
    const preview = document.getElementById(previewId);
    if (input && preview) {
      input.addEventListener("change", (e) => {
        const file = e.target.files[0];
        if (file) {
          const reader = new FileReader();
          reader.onload = (event) => {
            preview.src = event.target.result;
          };
          reader.readAsDataURL(file);
        } else {
          preview.src = defaultSrc;
        }
      });
    }
  };

  setupAvatarPreview("create-avatar", "avatar-preview-create", "/admin/assets/images/batman.png");
  setupAvatarPreview("edit-avatar", "avatar-preview-edit", "/admin/assets/images/batman.png");

  // ==========================================
  // Xử lý Modal Tạo mới người dùng
  // ==========================================
  const btnCreateUser = document.querySelector("[button-create-user]");
  const modalCreate = document.getElementById("modal-user-create");
  const formCreate = document.getElementById("user-create-form");
  const avatarPreviewCreate = document.getElementById("avatar-preview-create");

  if (btnCreateUser && modalCreate) {
    btnCreateUser.addEventListener("click", () => {
      if (formCreate) formCreate.reset();
      if (avatarPreviewCreate) {
        avatarPreviewCreate.src = "/admin/assets/images/batman.png";
      }
      openModal(modalCreate);
    });
  }

  if (formCreate) {
    formCreate.addEventListener("submit", async (e) => {
      e.preventDefault();

      const submitBtn = formCreate.querySelector('button[type="submit"]');
      const originalText = submitBtn ? submitBtn.innerHTML : "";
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Đang xử lý...';
      }

      const formData = new FormData(formCreate);

      try {
        const response = await fetch(`/${pathAdmin}/user/create`, {
          method: "POST",
          body: formData,
        });
        const data = await response.json();

        if (data.code === "SUCCESS") {
          window.location.reload();
        } else {
          alert(data.message || "Tạo người dùng thất bại!");
          if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.innerHTML = originalText;
          }
        }
      } catch (err) {
        console.error(err);
        alert("Có lỗi xảy ra trong quá trình xử lý!");
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.innerHTML = originalText;
        }
      }
    });
  }

  // ==========================================
  // Xử lý Modal Chỉnh sửa người dùng
  // ==========================================
  const modalEdit = document.getElementById("modal-user-edit");
  const formEdit = document.getElementById("user-edit-form");
  const avatarPreviewEdit = document.getElementById("avatar-preview-edit");
  const editButtons = document.querySelectorAll("[button-edit-user]");

  if (editButtons.length > 0 && modalEdit) {
    editButtons.forEach((btn) => {
      btn.addEventListener("click", async () => {
        const userId = btn.getAttribute("data-id");
        if (!userId) return;

        try {
          const res = await fetch(`/${pathAdmin}/user/detail/${userId}`);
          const result = await res.json();

          if (result.code === "SUCCESS" && result.data) {
            const user = result.data;

            document.getElementById("edit-id").value = user._id || "";
            document.getElementById("edit-fullName").value = user.fullName || "";
            document.getElementById("edit-email").value = user.email || "";
            document.getElementById("edit-password").value = "";
            document.getElementById("edit-phone").value = user.phone || "";
            document.getElementById("edit-gender").value = user.gender || "";

            if (user.dob) {
              const dobDate = new Date(user.dob);
              const yyyy = dobDate.getFullYear();
              const mm = String(dobDate.getMonth() + 1).padStart(2, "0");
              const dd = String(dobDate.getDate()).padStart(2, "0");
              document.getElementById("edit-dob").value = `${yyyy}-${mm}-${dd}`;
            } else {
              document.getElementById("edit-dob").value = "";
            }

            document.getElementById("edit-status").value = user.status || "active";
            document.getElementById("edit-address").value = user.address || "";

            if (avatarPreviewEdit) {
              avatarPreviewEdit.src = user.avatar || "/admin/assets/images/batman.png";
            }
            const fileInput = document.getElementById("edit-avatar");
            if (fileInput) fileInput.value = "";

            openModal(modalEdit);
          } else {
            alert(result.message || "Không thể lấy thông tin người dùng!");
          }
        } catch (err) {
          console.error(err);
          alert("Có lỗi xảy ra khi tải dữ liệu người dùng!");
        }
      });
    });
  }

  if (formEdit) {
    formEdit.addEventListener("submit", async (e) => {
      e.preventDefault();

      const userId = document.getElementById("edit-id").value;
      if (!userId) {
        alert("Không tìm thấy ID người dùng!");
        return;
      }

      const submitBtn = formEdit.querySelector('button[type="submit"]');
      const originalText = submitBtn ? submitBtn.innerHTML : "";
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Đang lưu...';
      }

      const formData = new FormData(formEdit);
      formData.delete("id"); // Không gửi id trong form data vì đã nằm trên URL params

      try {
        const response = await fetch(`/${pathAdmin}/user/edit/${userId}`, {
          method: "PATCH",
          body: formData,
        });
        const data = await response.json();

        if (data.code === "SUCCESS") {
          window.location.reload();
        } else {
          alert(data.message || "Cập nhật người dùng thất bại!");
          if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.innerHTML = originalText;
          }
        }
      } catch (err) {
        console.error(err);
        alert("Có lỗi xảy ra trong quá trình cập nhật!");
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.innerHTML = originalText;
        }
      }
    });
  }

  // ==========================================
  // Xử lý Đổi trạng thái nhanh người dùng
  // ==========================================
  const listButtonChangeStatus = document.querySelectorAll("[button-change-status]");
  if (listButtonChangeStatus.length > 0) {
    listButtonChangeStatus.forEach((button) => {
      button.addEventListener("click", () => {
        const id = button.getAttribute("data-id");
        const statusChange = button.getAttribute("data-status");
        if (!id || !statusChange) return;

        const dataApi = `/${pathAdmin}/user/change-status/${statusChange}/${id}`;

        fetch(dataApi, {
          method: "PATCH"
        })
          .then((res) => res.json())
          .then((data) => {
            if (data.code === "SUCCESS") {
              window.location.reload();
            } else {
              alert(data.message || "Cập nhật trạng thái thất bại!");
            }
          })
          .catch((err) => {
            console.error(err);
            alert("Có lỗi xảy ra khi cập nhật trạng thái!");
          });
      });
    });
  }
});
