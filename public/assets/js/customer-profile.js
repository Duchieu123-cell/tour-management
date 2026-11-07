// Prototype giao diện: các form chỉ kiểm tra dữ liệu, chưa gọi API lưu.
const PROTOTYPE_MESSAGE = 'Bản giao diện mẫu: dữ liệu chưa được lưu.';
const AVATAR_MAX_SIZE = 2 * 1024 * 1024;
const AVATAR_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

// Cùng luật với validates/client/account.validate.js
const PASSWORD_RULES = {
  length: (value) => value.length >= 8,
  uppercase: (value) => /[A-Z]/.test(value),
  lowercase: (value) => /[a-z]/.test(value),
  number: (value) => /\d/.test(value),
  special: (value) => /[@$!%*?&]/.test(value)
};

const setFieldError = (input, errorElement, message) => {
  errorElement.textContent = message;
  errorElement.hidden = !message;
  input.setAttribute('aria-invalid', message ? 'true' : 'false');
};

const showFormStatus = (form, message) => {
  const status = form.querySelector('.customer-profile-status');
  status.textContent = message;
  status.hidden = !message;
};

// Tabs
const profileTabs = document.querySelectorAll('[profile-tab]');

const showProfileTab = (name) => {
  profileTabs.forEach((tab) => {
    const isActive = tab.getAttribute('profile-tab') === name;
    const panel = document.getElementById(tab.getAttribute('aria-controls'));
    tab.setAttribute('aria-selected', isActive ? 'true' : 'false');
    panel.hidden = !isActive;
  });
};

const syncProfileTabWithHash = () => {
  showProfileTab(window.location.hash === '#password' ? 'password' : 'info');
};

window.addEventListener('hashchange', syncProfileTabWithHash);
syncProfileTabWithHash();
// End Tabs

// Dữ liệu cá nhân
const customerProfileForm = document.querySelector('#customer-profile-form');
if (customerProfileForm) {
  const avatarInput = customerProfileForm.querySelector('#customer-avatar');
  const avatarPreview = customerProfileForm.querySelector('#customer-avatar-preview');
  const avatarError = customerProfileForm.querySelector('#customer-avatar-error');
  const fullNameInput = customerProfileForm.querySelector('#customer-full-name');
  const fullNameError = customerProfileForm.querySelector('#customer-full-name-error');
  const birthdayFieldset = customerProfileForm.querySelector('.customer-profile-birthday');
  const birthdayError = customerProfileForm.querySelector('#customer-birthday-error');
  const saveButton = customerProfileForm.querySelector('button[type="submit"]');
  const cancelButton = customerProfileForm.querySelector('[profile-cancel]');
  const originalAvatar = avatarPreview.getAttribute('src');
  let previewUrl = null;

  const getSnapshot = () => {
    const formData = new FormData(customerProfileForm);
    formData.delete('avatar');
    return new URLSearchParams(formData).toString();
  };

  const initialSnapshot = getSnapshot();

  const updateFormActions = () => {
    const isDirty = getSnapshot() !== initialSnapshot || avatarInput.files.length > 0;
    saveButton.disabled = !isDirty;
    cancelButton.disabled = !isDirty;
  };

  const resetAvatarPreview = () => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      previewUrl = null;
    }

    if (originalAvatar) {
      avatarPreview.src = originalAvatar;
    } else {
      avatarPreview.removeAttribute('src');
      avatarPreview.hidden = true;
    }
  };

  const handleAvatarChange = () => {
    const file = avatarInput.files[0];
    resetAvatarPreview();
    setFieldError(avatarInput, avatarError, '');

    if (!file) {
      return;
    }

    if (!AVATAR_TYPES.includes(file.type)) {
      avatarInput.value = '';
      setFieldError(avatarInput, avatarError, 'Ảnh phải có định dạng JPG, PNG hoặc WebP');
      return;
    }

    if (file.size > AVATAR_MAX_SIZE) {
      avatarInput.value = '';
      setFieldError(avatarInput, avatarError, 'Ảnh không được lớn hơn 2 MB');
      return;
    }

    previewUrl = URL.createObjectURL(file);
    avatarPreview.src = previewUrl;
    avatarPreview.hidden = false;
  };

  avatarInput.addEventListener('change', () => {
    handleAvatarChange();
    updateFormActions();
  });

  const validateFullName = () => {
    const value = fullNameInput.value.trim();
    let message = '';

    if (!value) {
      message = 'Vui lòng nhập họ tên';
    } else if (value.length < 3) {
      message = 'Họ tên ít nhất 3 ký tự';
    }

    setFieldError(fullNameInput, fullNameError, message);
    return !message;
  };

  const validateBirthday = () => {
    const formData = new FormData(customerProfileForm);
    const parts = ['birthDay', 'birthMonth', 'birthYear'].map((name) => formData.get(name));
    const [day, month, year] = parts.map(Number);
    const selectedCount = parts.filter(Boolean).length;
    let message = '';

    if (selectedCount > 0 && selectedCount < 3) {
      message = 'Vui lòng chọn đủ ngày, tháng, năm sinh';
    } else if (selectedCount === 3) {
      const date = new Date(year, month - 1, day);
      if (date.getMonth() !== month - 1) {
        message = 'Ngày sinh không hợp lệ';
      } else if (date > new Date()) {
        message = 'Ngày sinh không được ở tương lai';
      }
    }

    setFieldError(birthdayFieldset, birthdayError, message);
    return !message;
  };

  customerProfileForm.addEventListener('input', () => {
    showFormStatus(customerProfileForm, '');
    updateFormActions();
    if (fullNameInput.getAttribute('aria-invalid') === 'true') {
      validateFullName();
    }
    if (birthdayFieldset.getAttribute('aria-invalid') === 'true') {
      validateBirthday();
    }
  });

  cancelButton.addEventListener('click', () => {
    customerProfileForm.reset();
    resetAvatarPreview();
    setFieldError(avatarInput, avatarError, '');
    setFieldError(fullNameInput, fullNameError, '');
    setFieldError(birthdayFieldset, birthdayError, '');
    showFormStatus(customerProfileForm, '');
    updateFormActions();
  });

  customerProfileForm.addEventListener('submit', (event) => {
    event.preventDefault();

    const isNameValid = validateFullName();
    const isBirthdayValid = validateBirthday();

    if (!isNameValid) {
      fullNameInput.focus();
      return;
    }

    if (isBirthdayValid) {
      showFormStatus(customerProfileForm, PROTOTYPE_MESSAGE);
    }
  });
}
// End Dữ liệu cá nhân

// Số di động
const customerPhoneForm = document.querySelector('#customer-phone-form');
if (customerPhoneForm) {
  const addButton = document.querySelector('#customer-phone-add');
  const phoneInput = customerPhoneForm.querySelector('#customer-phone');
  const phoneError = customerPhoneForm.querySelector('#customer-phone-error');

  const togglePhoneForm = (isOpen) => {
    customerPhoneForm.hidden = !isOpen;
    addButton.hidden = isOpen;
    addButton.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
  };

  addButton.addEventListener('click', () => {
    togglePhoneForm(true);
    phoneInput.focus();
  });

  customerPhoneForm.querySelector('[phone-cancel]').addEventListener('click', () => {
    customerPhoneForm.reset();
    setFieldError(phoneInput, phoneError, '');
    showFormStatus(customerPhoneForm, '');
    togglePhoneForm(false);
    addButton.focus();
  });

  phoneInput.addEventListener('input', () => {
    showFormStatus(customerPhoneForm, '');
    setFieldError(phoneInput, phoneError, '');
  });

  customerPhoneForm.addEventListener('submit', (event) => {
    event.preventDefault();

    if (!/^0\d{9}$/.test(phoneInput.value.trim())) {
      setFieldError(phoneInput, phoneError, 'Số di động gồm 10 chữ số, bắt đầu bằng 0');
      phoneInput.focus();
      return;
    }

    showFormStatus(customerPhoneForm, PROTOTYPE_MESSAGE);
  });
}
// End Số di động

// Đổi mật khẩu
const customerPasswordForm = document.querySelector('#customer-password-form');
if (customerPasswordForm) {
  const currentInput = customerPasswordForm.querySelector('#customer-password-current');
  const newInput = customerPasswordForm.querySelector('#customer-password-new');
  const confirmInput = customerPasswordForm.querySelector('#customer-password-confirm');
  const fields = [currentInput, newInput, confirmInput].map((input) => ({
    input,
    error: customerPasswordForm.querySelector(`#${input.id}-error`)
  }));
  const ruleElements = customerPasswordForm.querySelectorAll('[password-rule]');

  const updatePasswordRules = () => {
    ruleElements.forEach((element) => {
      const rule = PASSWORD_RULES[element.getAttribute('password-rule')];
      element.classList.toggle('is-met', rule(newInput.value));
    });
  };

  const getPasswordMessages = () => {
    const newPasswordValid = Object.values(PASSWORD_RULES).every((rule) => rule(newInput.value));
    let newMessage = '';
    let confirmMessage = '';

    if (!newInput.value) {
      newMessage = 'Vui lòng nhập mật khẩu mới';
    } else if (!newPasswordValid) {
      newMessage = 'Mật khẩu mới chưa đủ các yêu cầu';
    } else if (newInput.value === currentInput.value) {
      newMessage = 'Mật khẩu mới phải khác mật khẩu hiện tại';
    }

    if (!confirmInput.value) {
      confirmMessage = 'Vui lòng nhập lại mật khẩu mới';
    } else if (confirmInput.value !== newInput.value) {
      confirmMessage = 'Mật khẩu nhập lại không khớp';
    }

    return [
      currentInput.value ? '' : 'Vui lòng nhập mật khẩu hiện tại',
      newMessage,
      confirmMessage
    ];
  };

  newInput.addEventListener('input', updatePasswordRules);

  customerPasswordForm.addEventListener('input', () => {
    showFormStatus(customerPasswordForm, '');
  });

  customerPasswordForm.querySelectorAll('[password-toggle]').forEach((button) => {
    button.addEventListener('click', () => {
      const input = button.parentElement.querySelector('input');
      const isHidden = input.type === 'password';
      const label = button.getAttribute('aria-label').replace(/^(Hiện|Ẩn) /, '');

      input.type = isHidden ? 'text' : 'password';
      button.setAttribute('aria-pressed', isHidden ? 'true' : 'false');
      button.setAttribute('aria-label', `${isHidden ? 'Ẩn' : 'Hiện'} ${label}`);
      button.querySelector('i').className = `fa-solid ${isHidden ? 'fa-eye-slash' : 'fa-eye'}`;
    });
  });

  customerPasswordForm.addEventListener('submit', (event) => {
    event.preventDefault();

    const messages = getPasswordMessages();
    fields.forEach(({ input, error }, index) => {
      setFieldError(input, error, messages[index]);
    });

    const firstInvalidIndex = messages.findIndex(Boolean);
    if (firstInvalidIndex !== -1) {
      fields[firstInvalidIndex].input.focus();
      return;
    }

    showFormStatus(customerPasswordForm, PROTOTYPE_MESSAGE);
  });
}
// End Đổi mật khẩu
