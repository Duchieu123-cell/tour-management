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
