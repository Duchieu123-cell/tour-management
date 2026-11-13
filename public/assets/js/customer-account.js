const showCustomerAuthError = (message) => {
  const errorElement = document.querySelector('#customer-auth-error');
  errorElement.textContent = message;
  errorElement.hidden = false;
};

const submitCustomerAccountForm = (endpoint, payload, onSuccess) => {
  fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(payload)
  })
    .then(async (response) => {
      const data = await response.json();
      if (!response.ok || data.code !== 'SUCCESS') {
        throw new Error(data.message || 'Không thể xử lý yêu cầu.');
      }
      onSuccess(data);
    })
    .catch((error) => {
      showCustomerAuthError(error.message);
    });
};

const customerLoginForm = document.querySelector('#customer-login-form');
if (customerLoginForm) {
  customerLoginForm.addEventListener('submit', (event) => {
    event.preventDefault();
    const formData = new FormData(customerLoginForm);

    submitCustomerAccountForm(
      '/account/login',
      {
        email: formData.get('email'),
        password: formData.get('password'),
        rememberPassword: formData.get('rememberPassword') === 'on'
      },
      () => {
        window.location.href = '/';
      }
    );
  });
}

const customerRegisterForm = document.querySelector('#customer-register-form');
if (customerRegisterForm) {
  customerRegisterForm.addEventListener('submit', (event) => {
    event.preventDefault();
    const formData = new FormData(customerRegisterForm);

    submitCustomerAccountForm(
      '/account/register',
      {
        fullName: formData.get('fullName'),
        email: formData.get('email'),
        password: formData.get('password')
      },
      () => {
        window.location.href = '/account/login?registered=1';
      }
    );
  });
}

const customerForgotPasswordForm = document.querySelector('#customer-forgot-password-form');
if (customerForgotPasswordForm) {
  customerForgotPasswordForm.addEventListener('submit', (event) => {
    event.preventDefault();
    const formData = new FormData(customerForgotPasswordForm);
    submitCustomerAccountForm('/account/forgot-password', {
      email: formData.get('email')
    }, (data) => {
      const status = document.querySelector('#customer-auth-error');
      status.textContent = data.message;
      status.classList.remove('is-error');
      status.classList.add('is-success');
      status.hidden = false;
    });
  });
}

const customerResetPasswordForm = document.querySelector('#customer-reset-password-form');
if (customerResetPasswordForm) {
  customerResetPasswordForm.addEventListener('submit', (event) => {
    event.preventDefault();
    const formData = new FormData(customerResetPasswordForm);
    submitCustomerAccountForm('/account/reset-password', {
      email: formData.get('email'),
      token: formData.get('token'),
      password: formData.get('password'),
      confirmPassword: formData.get('confirmPassword')
    }, () => {
      window.location.href = '/account/login?passwordReset=1';
    });
  });
}
