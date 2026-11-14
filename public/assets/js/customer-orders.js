document.querySelectorAll('[order-cancel]').forEach((button) => {
  button.addEventListener('click', async () => {
    const code = button.getAttribute('order-cancel');
    const errorElement = button.closest('[order-cancel-scope]').querySelector('.customer-order-error');

    if (!window.confirm(`Bạn có chắc muốn hủy đơn ${code}?`)) {
      return;
    }

    button.disabled = true;
    errorElement.hidden = true;

    try {
      const response = await fetch(`/account/orders/${encodeURIComponent(code)}/cancel`, {
        method: 'POST'
      });
      const data = await response.json();

      if (!response.ok || data.code !== 'SUCCESS') {
        throw new Error(data.message);
      }

      window.location.reload();
    } catch (error) {
      errorElement.textContent = error.message || 'Không thể hủy đơn. Vui lòng thử lại.';
      errorElement.hidden = false;
      button.disabled = false;
    }
  });
});
