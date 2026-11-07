const axios = require('axios');
const geminiHelper = require('../../helpers/gemini.helper');

const suggestedRequests = [
  'Tôi muốn tour du lịch đi Nha Trang, 3 ngày 2 đêm, giá 5 - 10 triệu.',
  'Tìm tour Đà Lạt 2 ngày 1 đêm, giá dưới 5 triệu.',
  'Tôi muốn tìm tour biển giá khoảng 8 triệu.'
];

module.exports.searchPost = async (req, res) => {
  if (!process.env.GEMINI_API_KEY?.trim()) {
    return res.status(503).json({
      code: 'ERROR',
      message: 'Tính năng tìm tour AI chưa được cấu hình GEMINI_API_KEY trên máy chủ.'
    });
  }

  try {
    const criteria = await geminiHelper.analyzeTourRequest(req.body.request);
    if (!criteria.isTourSearch || !criteria.hasSpecificCriteria) {
      return res.json({
        code: 'NEED_MORE_DETAILS',
        message: 'Mình chưa nhận ra bộ lọc tìm tour cụ thể. Hãy nêu điểm đến, thời lượng hoặc ngân sách nhé.',
        suggestions: suggestedRequests
      });
    }

    const searchParams = new URLSearchParams();
    searchParams.set('ai', '1');
    if (criteria.name) {
      searchParams.set('locationTo', criteria.name);
    }
    if (criteria.time) {
      searchParams.set('time', criteria.time);
    }
    if (criteria.priceMin > 0) {
      searchParams.set('priceMin', String(criteria.priceMin));
    }
    if (criteria.priceMax > 0) {
      searchParams.set('priceMax', String(criteria.priceMax));
    }
    if (criteria.priceAdult > 0) {
      searchParams.set('priceAdult', String(criteria.priceAdult));
    }

    return res.json({
      code: 'SUCCESS',
      message: 'Đã phân tích xong yêu cầu. Đang mở danh sách tour phù hợp nhất.',
      criteria,
      searchUrl: `/search?${searchParams.toString()}`
    });
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const providerStatus = error.response?.status;
      console.error('AI tour search provider error:', {
        status: providerStatus,
        code: error.code,
        message: error.response?.data?.error?.message || error.message
      });

      if (error.code === 'ECONNABORTED' || error.code === 'ETIMEDOUT') {
        return res.status(504).json({
          code: 'ERROR',
          message: 'AI phản hồi quá thời gian chờ. Vui lòng thử lại.'
        });
      }

      let message = 'Không thể phân tích yêu cầu lúc này. Vui lòng thử lại sau.';
      if (providerStatus === 400 || providerStatus === 403) {
        message = 'Gemini từ chối yêu cầu. Hãy kiểm tra API key và quyền sử dụng Gemini API.';
      } else if (providerStatus === 404) {
        message = 'Không tìm thấy model Gemini đã cấu hình. Hãy kiểm tra GEMINI_MODEL.';
      } else if (providerStatus === 429) {
        message = 'Gemini đang giới hạn lượt gọi hoặc đã hết quota. Vui lòng thử lại sau.';
      }

      return res.status(providerStatus === 429 ? 503 : 502).json({
        code: 'ERROR',
        message
      });
    }

    console.error('AI tour search failed:', error.message);
    return res.status(502).json({
      code: 'ERROR',
      message: 'Gemini không trả về bộ lọc tìm kiếm hợp lệ. Vui lòng thử diễn đạt lại.'
    });
  }
};
