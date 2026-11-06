const moment = require('moment');
const slugify = require('slugify');
const Tour = require('../../models/tour.model');

const normalizeDuration = (value) => String(value || '')
  .normalize('NFD')
  .replace(/[\u0300-\u036f]/g, '')
  .replace(/[đĐ]/g, 'd')
  .toLowerCase();

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
  const find = buildTourQuery(req.query);
  const tourList = await Tour 
    .find(find)
    .sort({
      position: "desc"
    })

  for (const item of tourList) {
    item.departureDateFormatted = moment(item.departureDate).format('DD/MM/YYYY');
  }

  res.render('client/pages/search', {
    pageTitle: 'Kết quả tìm kiếm',
    tourList: tourList,
  });
};

module.exports.buildTourQuery = buildTourQuery;
module.exports.durationRegex = durationRegex;