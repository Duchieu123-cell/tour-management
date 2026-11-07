// Bộ lọc tháng
const dashboardMonthInput = document.querySelector('#dashboard-month');
if (dashboardMonthInput) {
  dashboardMonthInput.addEventListener('change', () => {
    if (dashboardMonthInput.value) {
      dashboardMonthInput.form.requestSubmit();
    }
  });
}
// End Bộ lọc tháng

// Biểu đồ doanh thu
const dashboardChartCanvas = document.querySelector('#dashboard-revenue-chart');
if (dashboardChartCanvas && window.Chart) {
  const chartData = JSON.parse(dashboardChartCanvas.dataset.chart);
  const dashboardStyle = getComputedStyle(dashboardChartCanvas.closest('.dashboard'));
  const getColor = (name) => dashboardStyle.getPropertyValue(name).trim();

  const colors = {
    current: getColor('--dashboard-series-current'),
    currentWash: getColor('--dashboard-series-current-wash'),
    previous: getColor('--dashboard-series-previous'),
    grid: getColor('--color-line'),
    surface: getColor('--color-surface'),
    text: getColor('--color-text'),
    muted: getColor('--color-muted')
  };

  const formatCompact = (value) => {
    if (value >= 1000000000) {
      return `${(value / 1000000000).toLocaleString('vi-VN', { maximumFractionDigits: 1 })} tỷ`;
    }
    if (value >= 1000000) {
      return `${(value / 1000000).toLocaleString('vi-VN', { maximumFractionDigits: 1 })} tr`;
    }
    return value.toLocaleString('vi-VN');
  };

  const lastCurrentIndex = chartData.current.reduce(
    (lastIndex, value, index) => (value === null ? lastIndex : index),
    -1
  );

  // Đường dọc theo vị trí con trỏ
  const crosshairPlugin = {
    id: 'dashboardCrosshair',
    afterDatasetsDraw(chart) {
      const activePoint = chart.tooltip.getActiveElements()[0];
      if (!activePoint) {
        return;
      }

      const { ctx, chartArea } = chart;
      ctx.save();
      ctx.beginPath();
      ctx.moveTo(activePoint.element.x, chartArea.top);
      ctx.lineTo(activePoint.element.x, chartArea.bottom);
      ctx.lineWidth = 1;
      ctx.strokeStyle = colors.muted;
      ctx.stroke();
      ctx.restore();
    }
  };

  // Chỉ ghi số tại điểm cuối của tháng đang chọn
  const endLabelPlugin = {
    id: 'dashboardEndLabel',
    afterDatasetsDraw(chart) {
      if (lastCurrentIndex < 0) {
        return;
      }

      const point = chart.getDatasetMeta(0).data[lastCurrentIndex];
      const { ctx, chartArea } = chart;
      const label = formatCompact(chartData.current[lastCurrentIndex]);

      ctx.save();
      ctx.font = '700 13px "Nunito Sans", sans-serif';
      ctx.fillStyle = colors.text;
      const labelWidth = ctx.measureText(label).width;
      const labelX = Math.min(Math.max(point.x - labelWidth / 2, chartArea.left), chartArea.right - labelWidth);
      ctx.fillText(label, labelX, Math.max(point.y - 12, chartArea.top + 12));
      ctx.restore();
    }
  };

  new Chart(dashboardChartCanvas, {
    type: 'line',
    data: {
      labels: chartData.labels,
      datasets: [
        {
          label: chartData.currentLabel,
          data: chartData.current,
          borderColor: colors.current,
          backgroundColor: colors.currentWash,
          borderWidth: 2,
          fill: 'origin',
          pointRadius: (context) => (context.dataIndex === lastCurrentIndex ? 4 : 0),
          pointHoverRadius: 4,
          pointBackgroundColor: colors.current,
          pointBorderColor: colors.surface,
          pointBorderWidth: 2,
          order: 1
        },
        {
          label: chartData.previousLabel,
          data: chartData.previous,
          borderColor: colors.previous,
          borderWidth: 2,
          pointRadius: 0,
          pointHoverRadius: 4,
          pointBackgroundColor: colors.previous,
          pointBorderColor: colors.surface,
          pointBorderWidth: 2,
          order: 2
        }
      ]
    },
    options: {
      maintainAspectRatio: false,
      animation: false,
      interaction: {
        mode: 'index',
        intersect: false
      },
      layout: {
        padding: { top: 20, right: 8 }
      },
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: colors.surface,
          borderColor: colors.grid,
          borderWidth: 1,
          titleColor: colors.muted,
          bodyColor: colors.text,
          padding: 12,
          usePointStyle: true,
          callbacks: {
            title: (items) => `Ngày ${items[0].label}`,
            label: (item) => `${item.parsed.y.toLocaleString('vi-VN')} đ · ${item.dataset.label}`,
            labelPointStyle: () => ({ pointStyle: 'line', rotation: 0 }),
            labelColor: (item) => ({
              borderColor: item.dataset.borderColor,
              backgroundColor: item.dataset.borderColor
            })
          }
        }
      },
      scales: {
        x: {
          grid: { display: false },
          border: { color: colors.grid },
          ticks: {
            color: colors.muted,
            maxRotation: 0,
            autoSkipPadding: 16
          }
        },
        y: {
          beginAtZero: true,
          grid: { color: colors.grid },
          border: { display: false },
          ticks: {
            color: colors.muted,
            maxTicksLimit: 6,
            callback: (value) => formatCompact(value)
          }
        }
      }
    },
    plugins: [crosshairPlugin, endLabelPlugin]
  });
}
// End Biểu đồ doanh thu
