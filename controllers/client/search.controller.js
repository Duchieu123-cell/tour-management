const moment = require('moment');
const slugify = require('slugify');
const Tour = require('../../models/tour.model');

const normalizeDuration = (value) => String(value || '')
  .normalize('NFD')
  .replace(/[\u0300-\u036f]/g, '')
  .replace(/[đĐ]/g, 'd')
  .toLowerCase();

const parseDuration = (value) => {
  const normalized = normalizeDuration(value);
  const daysMatch = normalized.match(/(\d+)\s*(?:ngay|n)(?=\s|\d|$)/);
  const nightsMatch = normalized.match(/(\d+)\s*(?:dem|d)\b/);

  const days = daysMatch ? Number.parseInt(daysMatch[1], 10) : null;
  const nights = nightsMatch ? Number.parseInt(nightsMatch[1], 10) : null;

  if (days === null && nights === null) {
    return null;
  }

  return {
    days: days ?? (nights !== null ? nights + 1 : null),
    nights
  };
};

const durationRegex = (value) => {
  const normalized = normalizeDuration(value);
  const days = normalized.match(/(\d+)\s*(?:ngay|n)(?=\s|\d|$)/);
  const nights = normalized.match(/(\d+)\s*(?:dem|d)\b/);

  if (days && nights) {
    return new RegExp(
      `${days[1]}\\s*(?:ngày|ngay|n)\\s*${nights[1]}\\s*(?:đêm|dem|đ|d)`,
      'i'
    );
  }

  if (days) {
    return new RegExp(`${days[1]}\\s*(?:ngày|ngay|n)(?:\\s|$)`, 'i');
  }

  return new RegExp(value.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
};

const parsePriceBounds = (query) => {
  const parseValidPrice = (val) => {
    const num = typeof val === 'string' || typeof val === 'number' ? Number(val) : NaN;
    return Number.isSafeInteger(num) && num > 0 && num <= 1_000_000_000 ? num : 0;
  };

  let min = parseValidPrice(query.priceMin);
  let max = parseValidPrice(query.priceMax);
  const adultMax = parseValidPrice(query.priceAdult);

  if (!max && adultMax) {
    max = adultMax;
  }

  if (min > 0 && max > 0 && min > max) {
    [min, max] = [max, min];
  }

  if (min === 0 && max === 0) {
    return null;
  }

  // Nếu người dùng nêu 1 mức giá duy nhất ("khoảng 8 triệu" -> min=8M, max=8M),
  // tạo biên độ khớp hoàn hảo ±15% quanh mức giá đó để ưu tiên hợp lý
  if (min > 0 && max > 0 && min === max) {
    const target = min;
    return {
      min: Math.round(target * 0.85),
      max: Math.round(target * 1.15),
      target,
      displayMin: target,
      displayMax: target
    };
  }

  const effectiveMin = min > 0 ? min : 0;
  const effectiveMax = max > 0 ? max : Infinity;
  const target = Number.isFinite(effectiveMax)
    ? (effectiveMin > 0 ? Math.round((effectiveMin + effectiveMax) / 2) : effectiveMax)
    : effectiveMin;

  return {
    min: effectiveMin,
    max: effectiveMax,
    target,
    displayMin: min,
    displayMax: max
  };
};

const getEffectiveAdultPrice = (tour) => {
  if (typeof tour.newPriceAdult === 'number' && tour.newPriceAdult > 0) {
    return tour.newPriceAdult;
  }
  if (typeof tour.priceAdult === 'number' && tour.priceAdult > 0) {
    return tour.priceAdult;
  }
  return 0;
};

const isAiPriorityQuery = (query) => Boolean(
  query.ai === '1'
  || (typeof query.time === 'string' && query.time.trim())
  || query.priceMin
  || query.priceMax
  || query.priceAdult
);

const buildHardDestinationQuery = (query) => {
  const find = {
    deleted: false,
    status: 'active'
  };

  if (typeof query.locationTo === 'string' && query.locationTo.trim()) {
    const keyword = slugify(query.locationTo, {
      lower: true
    });
    if (keyword) {
      find.slug = new RegExp(keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
    }
  }

  return find;
};

const rankToursByPriority = (tours, query) => {
  const hasDurationCriterion = typeof query.time === 'string' && Boolean(query.time.trim());
  const targetDuration = hasDurationCriterion ? parseDuration(query.time) : null;
  const targetTimeRegex = hasDurationCriterion ? durationRegex(query.time) : null;
  const priceBounds = parsePriceBounds(query);
  const hasDestination = typeof query.locationTo === 'string' && Boolean(query.locationTo.trim());

  const scored = tours.map((tour) => {
    // 1. Đánh giá độ khớp và khoảng cách Thời lượng (Duration)
    let isDurationMatch = false;
    let durationDiff = 0;

    if (hasDurationCriterion) {
      const tourDuration = parseDuration(tour.time);
      if (targetTimeRegex && targetTimeRegex.test(String(tour.time || ''))) {
        isDurationMatch = true;
        durationDiff = 0;
      } else if (targetDuration && tourDuration) {
        const dayDiff = Math.abs((tourDuration.days ?? 0) - (targetDuration.days ?? 0));
        const nightDiff = (targetDuration.nights !== null && tourDuration.nights !== null)
          ? Math.abs(tourDuration.nights - targetDuration.nights)
          : 0;
        isDurationMatch = dayDiff === 0 && (targetDuration.nights === null || nightDiff === 0);
        durationDiff = isDurationMatch ? 0 : dayDiff + nightDiff * 0.25;
      } else {
        durationDiff = Number.MAX_SAFE_INTEGER;
      }
    }

    // 2. Đánh giá độ khớp và khoảng cách Giá (Price)
    let isPriceMatch = false;
    let priceDiff = 0;
    let midpointDiff = 0;

    if (priceBounds) {
      const effectivePrice = getEffectiveAdultPrice(tour);
      if (effectivePrice <= 0) {
        priceDiff = Number.MAX_SAFE_INTEGER;
        midpointDiff = Number.MAX_SAFE_INTEGER;
      } else if (effectivePrice >= priceBounds.min && effectivePrice <= priceBounds.max) {
        isPriceMatch = true;
        priceDiff = 0;
        midpointDiff = priceBounds.target > 0 ? Math.abs(effectivePrice - priceBounds.target) : 0;
      } else if (effectivePrice < priceBounds.min) {
        priceDiff = priceBounds.min - effectivePrice;
        midpointDiff = priceBounds.target > 0 ? Math.abs(effectivePrice - priceBounds.target) : priceDiff;
      } else {
        priceDiff = effectivePrice - priceBounds.max;
        midpointDiff = priceBounds.target > 0 ? Math.abs(effectivePrice - priceBounds.target) : priceDiff;
      }
    }

    const matchedCount = (hasDurationCriterion && isDurationMatch ? 1 : 0)
      + (priceBounds && isPriceMatch ? 1 : 0);

    return {
      tour,
      matchedCount,
      isDurationMatch,
      isPriceMatch,
      durationDiff,
      priceDiff,
      midpointDiff
    };
  });

  // Khi người dùng KHÔNG nêu điểm đến (chỉ nêu thời lượng / giá),
  // lọc bỏ các tour quá xa (không khớp tiêu chí nào và lệch quá 2 ngày hoặc lệch quá 3 triệu)
  let filteredScored = scored;
  if (!hasDestination && (hasDurationCriterion || priceBounds)) {
    const closeCandidates = scored.filter((item) => {
      if (item.matchedCount >= 1) {
        return true;
      }
      const durationClose = !hasDurationCriterion || item.durationDiff <= 2;
      const priceClose = !priceBounds || item.priceDiff <= 3_000_000;
      return durationClose && priceClose;
    });

    if (closeCandidates.length > 0) {
      filteredScored = closeCandidates;
    }
  }

  // Sắp xếp theo thứ tự ưu tiên:
  // 1. Số tiêu chí khớp (Cả thời lượng & giá > Khớp 1 > Không khớp chính xác nhưng gần nhất)
  // 2. Ưu tiên khớp / gần Thời lượng trước (durationDiff tăng dần)
  // 3. Ưu tiên khớp / gần Khoảng giá (priceDiff tăng dần, sau đó midpointDiff tăng dần)
  // 4. position giảm dần
  filteredScored.sort((a, b) => {
    if (b.matchedCount !== a.matchedCount) {
      return b.matchedCount - a.matchedCount;
    }
    if (a.durationDiff !== b.durationDiff) {
      return a.durationDiff - b.durationDiff;
    }
    if (a.priceDiff !== b.priceDiff) {
      return a.priceDiff - b.priceDiff;
    }
    if (a.midpointDiff !== b.midpointDiff) {
      return a.midpointDiff - b.midpointDiff;
    }
    return (b.tour.position || 0) - (a.tour.position || 0);
  });

  return filteredScored.map((item) => item.tour);
};

const buildAiSearchSummary = (query) => {
  if (!isAiPriorityQuery(query)) {
    return null;
  }

  const chips = [];
  if (typeof query.locationTo === 'string' && query.locationTo.trim()) {
    chips.push({
      label: 'Điểm đến',
      value: query.locationTo.trim()
    });
  }

  if (typeof query.time === 'string' && query.time.trim()) {
    chips.push({
      label: 'Thời lượng ưu tiên',
      value: query.time.trim()
    });
  }

  const priceBounds = parsePriceBounds(query);
  if (priceBounds) {
    let priceText = '';
    if (priceBounds.displayMin > 0 && priceBounds.displayMax > 0) {
      if (priceBounds.displayMin === priceBounds.displayMax) {
        priceText = `Khoảng ${priceBounds.displayMin.toLocaleString('vi-VN')}đ`;
      } else {
        priceText = `${priceBounds.displayMin.toLocaleString('vi-VN')}đ - ${priceBounds.displayMax.toLocaleString('vi-VN')}đ`;
      }
    } else if (priceBounds.displayMax > 0) {
      priceText = `Dưới ${priceBounds.displayMax.toLocaleString('vi-VN')}đ`;
    } else if (priceBounds.displayMin > 0) {
      priceText = `Trên ${priceBounds.displayMin.toLocaleString('vi-VN')}đ`;
    }

    if (priceText) {
      chips.push({
        label: 'Ngân sách ưu tiên',
        value: priceText
      });
    }
  }

  return chips.length > 0 ? chips : null;
};

const buildTourQuery = (query) => {
  const find = {
    deleted: false,
    status: "active"
  };

  if(query.locationFrom){
    find.locations = query.locationFrom;
  }

  if(typeof query.locationTo === 'string' && query.locationTo.trim()){
    const keyword = slugify(query.locationTo, {
      lower: true
    });
    if(keyword){
      find.slug = new RegExp(keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
    }
  }

  if(typeof query.time === 'string' && query.time.trim()){
    find.time = durationRegex(query.time);
  }

  if(typeof query.departureDate === 'string' && query.departureDate){
    const departureDateFormat = new Date(query.departureDate);
    if(!Number.isNaN(departureDateFormat.getTime())){
      find.departureDate = departureDateFormat;
    }
  }

  if(query.stockAdult){
    const stockAdult = Number.parseInt(query.stockAdult, 10);
    if(Number.isSafeInteger(stockAdult) && stockAdult > 0){
      find.stockAdult = { $gte: stockAdult };
    }
  }

  if(query.stockChildren){
    const stockChildren = Number.parseInt(query.stockChildren, 10);
    if(Number.isSafeInteger(stockChildren) && stockChildren > 0){
      find.stockChildren = { $gte: stockChildren };
    }
  }

  if(query.stockBaby){
    const stockBaby = Number.parseInt(query.stockBaby, 10);
    if(Number.isSafeInteger(stockBaby) && stockBaby > 0){
      find.stockBaby = { $gte: stockBaby };
    }
  }

  if(typeof query.price === 'string'){
    const [ priceMin, priceMax ] = query.price.split('-').map(x => Number.parseInt(x, 10));
    if(Number.isFinite(priceMin) && Number.isFinite(priceMax) && priceMin >= 0 && priceMax >= priceMin){
      find.newPriceAdult = { $gte: priceMin, $lte: priceMax };
    }
  }

  const maxAdultPrice = typeof query.priceAdult === 'string'
    ? Number(query.priceAdult)
    : NaN;
  if(Number.isSafeInteger(maxAdultPrice) && maxAdultPrice > 0 && maxAdultPrice <= 1_000_000_000){
    find.$or = [
      { newPriceAdult: { $gt: 0, $lte: maxAdultPrice } },
      {
        newPriceAdult: { $in: [0, null] },
        priceAdult: { $gt: 0, $lte: maxAdultPrice }
      }
    ];
  }

  return find;
};

module.exports.list = async (req, res) => {
  let tourList = [];

  if (isAiPriorityQuery(req.query)) {
    const hardFind = buildHardDestinationQuery(req.query);
    const candidateTours = await Tour
      .find(hardFind)
      .sort({
        position: "desc"
      });
    tourList = rankToursByPriority(candidateTours, req.query);
  } else {
    const find = buildTourQuery(req.query);
    tourList = await Tour
      .find(find)
      .sort({
        position: "desc"
      });
  }

  for (const item of tourList) {
    item.departureDateFormatted = moment(item.departureDate).format('DD/MM/YYYY');
    if (item.priceAdult > 0 && item.newPriceAdult > 0 && item.priceAdult > item.newPriceAdult) {
      item.discount = Math.round(((item.priceAdult - item.newPriceAdult) / item.priceAdult) * 100);
    } else {
      item.discount = 0;
    }
  }

  const aiSearchSummary = buildAiSearchSummary(req.query);

  res.render('client/pages/search', {
    pageTitle: 'Kết quả tìm kiếm',
    tourList: tourList,
    aiSearchSummary: aiSearchSummary
  });
};

module.exports.buildTourQuery = buildTourQuery;
module.exports.durationRegex = durationRegex;
module.exports.parseDuration = parseDuration;
module.exports.rankToursByPriority = rankToursByPriority;
