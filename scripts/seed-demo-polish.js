require('dotenv').config();
const mongoose = require('mongoose');
const slugify = require('slugify');

const Tour = require('../models/tour.model');
const Category = require('../models/category.model');
const Customer = require('../models/customer.model');
const AccountAdmin = require('../models/accounts-admin.model');
const Role = require('../models/role.model');
const Order = require('../models/order.model');
const SettingWebsiteInfo = require('../models/setting-website-info.model');
const ProvinceCity = require('../models/province-city.model');
const { permissionList } = require('../config/permission');

const CAT_MIEN_BAC = '68d72e153fdf25f23ffc5bb1';
const CAT_MIEN_TRUNG = '68d72e333fdf25f23ffc5bb9';
const CAT_MIEN_NAM = '68d72e433fdf25f23ffc5bc1';
const CAT_XUYEN_VIET = '68d72e723fdf25f23ffc5bc9';
const CAT_CHAU_A = '68d72e913fdf25f23ffc5bd1';
const CAT_CHAU_AU = '68d72eae3fdf25f23ffc5bd9';
const CAT_CHAU_UC = '695a124ee5950d9069c56950';

const GALLERY_IMAGES = [
  'https://res.cloudinary.com/dfbnrahme/image/upload/v1769438873/g04cyh3kllwttapoymiu.jpg',
  'https://res.cloudinary.com/dfbnrahme/image/upload/v1767961121/stktxuke7pukrwtu7yxh.jpg',
  'https://res.cloudinary.com/dfbnrahme/image/upload/v1767961083/avp46m20qgybfwqd9fvz.jpg',
  'https://res.cloudinary.com/dfbnrahme/image/upload/v1767961537/taw6twzca6drzu8018ti.jpg',
  'https://res.cloudinary.com/dfbnrahme/image/upload/v1768054996/vcma5z6e7v5jbkyiggpb.jpg',
  'https://res.cloudinary.com/dfbnrahme/image/upload/v1768055025/iecem0sb1vwd1n9mvdbt.jpg',
  'https://res.cloudinary.com/dfbnrahme/image/upload/v1768055091/rjnjeuuvoicnbndizul8.jpg',
  'https://res.cloudinary.com/dfbnrahme/image/upload/v1768055149/k79vy55k9rwjg95aaujb.jpg',
  'https://res.cloudinary.com/dfbnrahme/image/upload/v1768055174/qgow0ksuvbqcscaadm8g.jpg',
  'https://res.cloudinary.com/dfbnrahme/image/upload/v1768055213/by64xvfvjmswztpo3pum.jpg',
  'https://res.cloudinary.com/dfbnrahme/image/upload/v1768055234/rec4qxybvlj3rz6szldu.jpg',
  'https://res.cloudinary.com/dfbnrahme/image/upload/v1768055266/ryjmg20amicmpzw6lzhi.jpg',
  'https://res.cloudinary.com/dfbnrahme/image/upload/v1768055298/xevrnpd1ps8eoyhjo7w3.jpg',
  'https://res.cloudinary.com/dfbnrahme/image/upload/v1768785091/oigwb22o7gwpzcse5mdn.jpg'
];

const roundToHundredThousand = (val) => {
  if (!val || val <= 0) return 0;
  return Math.max(500000, Math.round(val / 100000) * 100000);
};

const classifyDomesticCategory = (name) => {
  const n = name.toLowerCase();
  if (/xuyên việt/.test(n)) return CAT_XUYEN_VIET;
  if (/(hà nội|sapa|sa pa|lào cai|hạ long|quảng ninh|ninh bình|hà giang|mộc châu|sơn la|điện biên|cao bằng|bắc kạn|lạng sơn|hải phòng|cát bà|tam đảo|vĩnh phúc|yên tử|thái nguyên|bắc ninh)/.test(n)) {
    return CAT_MIEN_BAC;
  }
  if (/(đà nẵng|hội an|bà nà|huế|quảng bình|phong nha|quảng trị|nha trang|khánh hòa|bình ba|cam ranh|đà lạt|lâm đồng|quy nhơn|bình định|phú yên|tuy hòa|mũi né|phan thiết|bình thuận|lý sơn|quảng ngãi|thanh hóa|sầm sơn|pù luông|nghệ an|cửa lò|hà tĩnh|buôn ma thuột|đắk lắk|pleiku|gia lai|măng đen|kon tum)/.test(n)) {
    return CAT_MIEN_TRUNG;
  }
  return CAT_MIEN_NAM;
};

const INTERNATIONAL_TOURS = [
  {
    name: 'Tour Thái Lan: Bangkok - Pattaya - Đảo Coral (5N4Đ)',
    slug: 'tour-thai-lan-bangkok-pattaya-dao-coral-5n4d',
    category: CAT_CHAU_A,
    priceAdult: 9500000,
    priceChildren: 7500000,
    priceBaby: 3000000,
    newPriceAdult: 7900000,
    newPriceChildren: 6200000,
    newPriceBaby: 2500000,
    stockAdult: 28,
    stockChildren: 12,
    stockBaby: 5,
    time: '5 ngày 4 đêm',
    vehicle: 'Máy bay khứ hồi & Xe du lịch đời mới',
    departureOffsetDays: 10,
    information: '<p>Hành trình khám phá xứ sở Chùa Vàng Thái Lan: tham quan Hoàng Cung, chùa Phật Ngọc, dạo thuyền sông Chao Phraya, tắm biển đảo Coral tại Pattaya và thưởng thức buffet quốc tế tại tòa nhà Baiyoke Sky 86 tầng.</p>',
    schedules: [
      { title: 'Ngày 1: TP.HCM / Hà Nội – Bangkok – Pattaya', description: '<p>Đón đoàn tại sân bay, làm thủ tục bay đến Bangkok. Xe đưa đoàn đi thành phố biển Pattaya, nhận phòng khách sạn 4 sao và khám phá Pattaya về đêm.</p>' },
      { title: 'Ngày 2: Đảo San Hô Coral – Trân Bảo Phật Sơn – Alcazar Show', description: '<p>Tàu cao tốc đưa đoàn ra đảo Coral tắm biển, tham gia lặn ngắm san hô. Chiều tham quan núi Phật Vàng Khao Chee Chan và xem Alcazar Show.</p>' },
      { title: 'Ngày 3: Pattaya – Bangkok – Buffet Baiyoke Sky 86 tầng', description: '<p>Khởi hành về Bangkok, ăn trưa buffet tại tòa nhà 86 tầng Baiyoke Sky, viếng Phật Bốn Mặt và tự do mua sắm tại Central World, Big C.</p>' },
      { title: 'Ngày 4: Dạo thuyền sông Chao Phraya – Chùa Thuyền Wat Yannawa', description: '<p>Dạo thuyền trên dòng sông huyền thoại Chao Phraya, viếng chùa Phật Vàng Wat Traimit và chùa Thuyền Wat Yannawa.</p>' },
      { title: 'Ngày 5: Bangkok – Tiễn sân bay trở về Việt Nam', description: '<p>Dùng điểm tâm tại khách sạn, làm thủ tục trả phòng, ra sân bay đáp chuyến bay về lại Việt Nam.</p>' }
    ]
  },
  {
    name: 'Tour Singapore - Malaysia: Hành Trình Hai Quốc Gia (5N4Đ)',
    slug: 'tour-singapore-malaysia-hanh-trinh-hai-quoc-gia-5n4d',
    category: CAT_CHAU_A,
    priceAdult: 14500000,
    priceChildren: 11500000,
    priceBaby: 4500000,
    newPriceAdult: 11900000,
    newPriceChildren: 9500000,
    newPriceBaby: 3900000,
    stockAdult: 24,
    stockChildren: 10,
    stockBaby: 4,
    time: '5 ngày 4 đêm',
    vehicle: 'Máy bay & Xe du lịch',
    departureOffsetDays: 14,
    information: '<p>Trải nghiệm liên tuyến Singapore – Malaysia: check-in Gardens by the Bay, công viên Merlion, đảo Sentosa, thành phố cổ Malacca, cao nguyên Genting và tòa tháp đôi Petronas Twin Towers tại Kuala Lumpur.</p>',
    schedules: [
      { title: 'Ngày 1: Việt Nam – Singapore – Jewel Changi – Merlion Park', description: '<p>Đáp sân bay Changi, tham quan thác nước trong nhà Jewel Changi, công viên Sư tử biển Merlion Park và nhà hát Esplanade.</p>' },
      { title: 'Ngày 2: Gardens by the Bay – Đảo Sentosa – Malacca', description: '<p>Tham quan vườn thực vật Gardens by the Bay, chụp hình tại Universal Studios đảo Sentosa, sau đó khởi hành sang thành phố cổ Malacca (Malaysia).</p>' },
      { title: 'Ngày 3: Malacca – Cao nguyên Genting – Kuala Lumpur', description: '<p>Tham quan Quảng trường Hà Lan, Pháo đài cổ Bồ Đào Nha, đi cáp treo lên cao nguyên Genting và về nghỉ đêm tại Kuala Lumpur.</p>' },
      { title: 'Ngày 4: Động Batu – Tháp đôi Petronas – Mua sắm', description: '<p>Viếng động Batu 272 bậc thang sắc màu, Hoàng cung Malaysia, chụp ảnh tại Tháp đôi Petronas và mua sắm đặc sản sô-cô-la.</p>' },
      { title: 'Ngày 5: Putrajaya – Sân bay Kuala Lumpur – Việt Nam', description: '<p>Tham quan thành phố thông minh Putrajaya trước khi ra sân bay đáp chuyến bay về Việt Nam.</p>' }
    ]
  },
  {
    name: 'Tour Hàn Quốc: Seoul - Đảo Nami - Công Viên Everland (5N4Đ)',
    slug: 'tour-han-quoc-seoul-dao-nami-cong-vien-everland-5n4d',
    category: CAT_CHAU_A,
    priceAdult: 18900000,
    priceChildren: 15500000,
    priceBaby: 5900000,
    newPriceAdult: 15900000,
    newPriceChildren: 12900000,
    newPriceBaby: 4900000,
    stockAdult: 20,
    stockChildren: 8,
    stockBaby: 4,
    time: '5 ngày 4 đêm',
    vehicle: 'Máy bay khứ hồi',
    departureOffsetDays: 18,
    information: '<p>Khám phá xứ sở Kim Chi Hàn Quốc: dạo bước dưới hàng cây lãng mạn tại đảo Nami, mặc Hanbok truyền thống tại cung điện Gyeongbokgung, vui chơi tại công viên giải trí Everland và ngắm toàn cảnh Seoul từ tháp Namsan.</p>',
    schedules: [
      { title: 'Ngày 1: Khởi hành đi Seoul – Hàn Quốc', description: '<p>Tập trung tại sân bay quốc tế, làm thủ tục chuyến bay đêm đi sân bay Incheon (Seoul).</p>' },
      { title: 'Ngày 2: Seoul – Đảo Nami – Tháp Namsan', description: '<p>Đến Incheon, khởi hành tham quan đảo Nami thơ mộng, chiều lên tháp truyền hình N Seoul Tower ngắm toàn cảnh thủ đô.</p>' },
      { title: 'Ngày 3: Công viên giải trí Everland – Chợ đêm Myeongdong', description: '<p>Trải nghiệm trọn ngày tại công viên chủ đề Everland và tự do thưởng thức ẩm thực đường phố tại chợ đêm Myeongdong.</p>' },
      { title: 'Ngày 4: Cung điện Gyeongbokgung – Làng cổ Bukchon Hanok', description: '<p>Mặc trang phục Hanbok tham quan cung điện hoàng gia Gyeongbokgung, Nhà Xanh và làng cổ Bukchon Hanok.</p>' },
      { title: 'Ngày 5: Incheon – Trở về Việt Nam', description: '<p>Mua sắm tại trung tâm nhân sâm, mỹ phẩm Hàn Quốc trước khi ra sân bay Incheon bay về Việt Nam.</p>' }
    ]
  },
  {
    name: 'Tour Nhật Bản: Tokyo - Núi Phú Sĩ - Kyoto - Osaka (6N5Đ)',
    slug: 'tour-nhat-ban-tokyo-nui-phu-si-kyoto-osaka-6n5d',
    category: CAT_CHAU_A,
    priceAdult: 32900000,
    priceChildren: 27900000,
    priceBaby: 9900000,
    newPriceAdult: 28900000,
    newPriceChildren: 24500000,
    newPriceBaby: 8500000,
    stockAdult: 18,
    stockChildren: 6,
    stockBaby: 3,
    time: '6 ngày 5 đêm',
    vehicle: 'Máy bay & Tàu cao tốc Shinkansen',
    departureOffsetDays: 22,
    information: '<p>Hành trình Cung Đường Vàng Nhật Bản: đi tàu siêu tốc Shinkansen, chiêm ngưỡng núi Phú Sĩ hùng vĩ, tắm suối khoáng nóng Onsen truyền thống, thăm cố đô Kyoto cổ kính và lâu đài Osaka.</p>',
    schedules: [
      { title: 'Ngày 1: Việt Nam – Sân bay Narita (Tokyo)', description: '<p>Đoàn tập trung tại sân bay làm thủ tục bay đến thủ đô Tokyo, Nhật Bản.</p>' },
      { title: 'Ngày 2: Tokyo – Chùa Asakusa Kannon – Tháp Tokyo Skytree', description: '<p>Viếng chùa cổ Asakusa Kannon, chụp hình tháp truyền hình Tokyo Skytree, ngoại cảnh Hoàng cung Nhật Bản và phố điện tử Akihabara.</p>' },
      { title: 'Ngày 3: Núi Phú Sĩ – Làng cổ Oshino Hakkai – Tắm Onsen', description: '<p>Tham quan Trạm 5 núi Phú Sĩ, dạo bước làng cổ Oshino Hakkai dưới chân núi và nghỉ đêm khách sạn suối khoáng nóng Onsen.</p>' },
      { title: 'Ngày 4: Trải nghiệm tàu Shinkansen – Cố đô Kyoto – Chùa Vàng', description: '<p>Trải nghiệm tàu cao tốc Shinkansen đến Kyoto, tham quan Chùa Vàng Kinkaku-ji và rừng trúc Sagano Arashiyama.</p>' },
      { title: 'Ngày 5: Kyoto – Lâu đài Osaka – Phố mua sắm Shinsaibashi', description: '<p>Di chuyển về Osaka, chụp ảnh tại Lâu đài Osaka và tự do mua sắm tại khu phố sầm uất Shinsaibashi – Dotonbori.</p>' },
      { title: 'Ngày 6: Sân bay Kansai – Việt Nam', description: '<p>Trả phòng khách sạn, ra sân bay quốc tế Kansai đáp chuyến bay về lại Việt Nam.</p>' }
    ]
  },
  {
    name: 'Tour Bali Indonesia: Đảo Thiên Đường - Nusa Penida (4N3Đ)',
    slug: 'tour-bali-indonesia-dao-thien-duong-nusa-penida-4n3d',
    category: CAT_CHAU_A,
    priceAdult: 12900000,
    priceChildren: 10500000,
    priceBaby: 4200000,
    newPriceAdult: 10900000,
    newPriceChildren: 8900000,
    newPriceBaby: 3500000,
    stockAdult: 22,
    stockChildren: 8,
    stockBaby: 4,
    time: '4 ngày 3 đêm',
    vehicle: 'Máy bay khứ hồi & Tàu cao tốc',
    departureOffsetDays: 12,
    information: '<p>Khám phá hòn đảo thiên đường Bali: check-in sống lưng khủng long Kelingking Beach tại đảo Nusa Penida, ruộng bậc thang Tegalalang Ubud, đền thiêng Tanah Lot trên biển và thưởng thức hải sản bên bờ biển Jimbaran.</p>',
    schedules: [
      { title: 'Ngày 1: Việt Nam – Sân bay Quốc tế Ngurah Rai (Bali)', description: '<p>Bay thẳng đến đảo Bali, xe đón đoàn về nhận phòng resort 4 sao gần biển Kuta nghỉ ngơi.</p>' },
      { title: 'Ngày 2: Khám phá đảo Nusa Penida – Kelingking Beach', description: '<p>Tàu cao tốc đưa đoàn ra đảo Nusa Penida, chụp ảnh tại Kelingking Beach, Broken Beach và Angel Billabong.</p>' },
      { title: 'Ngày 3: Cao nguyên Ubud – Đền Tirta Empul – Đền Tanah Lot', description: '<p>Tham quan làng nghệ thuật Ubud, đền suối thiêng Tampak Siring, ngắm hoàng hôn tại đền Tanah Lot và ăn tối hải sản bãi biển Jimbaran.</p>' },
      { title: 'Ngày 4: Mua sắm đặc sản Bali – Bay về Việt Nam', description: '<p>Tự do tắm biển hoặc mua sắm quà lưu niệm tại Krishna trước khi ra sân bay về Việt Nam.</p>' }
    ]
  },
  {
    name: 'Tour Đài Loan: Đài Bắc - Đài Trung - Hồ Nhật Nguyệt (5N4Đ)',
    slug: 'tour-dai-loan-dai-bac-dai-trung-ho-nhat-nguyet-5n4d',
    category: CAT_CHAU_A,
    priceAdult: 13900000,
    priceChildren: 11200000,
    priceBaby: 4500000,
    newPriceAdult: 11500000,
    newPriceChildren: 9200000,
    newPriceBaby: 3800000,
    stockAdult: 25,
    stockChildren: 10,
    stockBaby: 4,
    time: '5 ngày 4 đêm',
    vehicle: 'Máy bay khứ hồi',
    departureOffsetDays: 16,
    information: '<p>Du lịch Đài Loan trọn gói: du thuyền Hồ Nhật Nguyệt thơ mộng, thả đèn trời cầu phúc tại phố cổ Thập Phần, chinh phục tòa tháp Taipei 101 và thưởng thức trà sữa trân châu chính gốc tại chợ đêm Tây Môn Đình.</p>',
    schedules: [
      { title: 'Ngày 1: Việt Nam – Đài Trung – Chợ đêm Phụng Giáp', description: '<p>Đáp sân bay quốc tế Đào Viên, di chuyển về Đài Trung và khám phá ẩm thực chợ đêm Phụng Giáp.</p>' },
      { title: 'Ngày 2: Du thuyền Hồ Nhật Nguyệt – Đền Văn Võ – Đài Bắc', description: '<p>Ngồi du thuyền ngắm cảnh Hồ Nhật Nguyệt, viếng Đền Văn Võ và khởi hành về Đài Bắc.</p>' },
      { title: 'Ngày 3: Công viên Địa chất Dã Liễu – Phố cổ Thập Phần – Tháp Taipei 101', description: '<p>Tham quan công viên Dã Liễu, thả đèn trời tại làng cổ Thập Phần và chụp hình tại tòa tháp Taipei 101.</p>' },
      { title: 'Ngày 4: Đài tưởng niệm Tưởng Giới Thạch – Tự do mua sắm Ximending', description: '<p>Tham quan Quảng trường Tự Do, lớp học làm bánh dứa DIY và mua sắm tại phố đi bộ Tây Môn Đình.</p>' },
      { title: 'Ngày 5: Đài Bắc – Sân bay Đào Viên – Việt Nam', description: '<p>Làm thủ tục trả phòng, ra sân bay đáp chuyến bay về Việt Nam.</p>' }
    ]
  },
  {
    name: 'Tour Châu Âu: Pháp - Thụy Sĩ - Ý (9N8Đ)',
    slug: 'tour-chau-au-phap-thuy-si-y-9n8d',
    category: CAT_CHAU_AU,
    priceAdult: 65000000,
    priceChildren: 54000000,
    priceBaby: 19000000,
    newPriceAdult: 58900000,
    newPriceChildren: 48900000,
    newPriceBaby: 16500000,
    stockAdult: 15,
    stockChildren: 5,
    stockBaby: 2,
    time: '9 ngày 8 đêm',
    vehicle: 'Máy bay quốc tế & Xe कोच Châu Âu',
    departureOffsetDays: 28,
    information: '<p>Hành trình Châu Âu kinh điển qua 3 quốc gia Pháp – Thụy Sĩ – Ý: du thuyền sông Seine ngắm tháp Eiffel tại Paris, chinh phục núi tuyết Titlis tại Thụy Sĩ, đi thuyền Gondola tại Venice và khám phá Đấu trường La Mã Colosseum tại Rome.</p>',
    schedules: [
      { title: 'Ngày 1-2: Việt Nam – Kinh đô ánh sáng Paris (Pháp)', description: '<p>Hạ cánh tại Paris, tham quan Tháp Eiffel, Khải Hoàn Môn, đại lộ Champs-Élysées và du thuyền trên sông Seine.</p>' },
      { title: 'Ngày 3-4: Paris – Lucerne – Núi tuyết Titlis (Thụy Sĩ)', description: '<p>Khởi hành sang Thụy Sĩ, dạo cầu gỗ Chapel tại Lucerne và đi cáp treo xoay 360 độ lên đỉnh núi tuyết Titlis cao 3.020m.</p>' },
      { title: 'Ngày 5-6: Milan – Thành phố nổi Venice (Ý)', description: '<p>Tham quan Nhà thờ Duomo tại Milan, đi tàu ra đảo Venice thăm Quảng trường San Marco và trải nghiệm thuyền Gondola.</p>' },
      { title: 'Ngày 7-9: Tháp nghiêng Pisa – Rome – Tòa thánh Vatican – Việt Nam', description: '<p>Chụp ảnh tại Tháp nghiêng Pisa, tham quan Đấu trường La Mã Colosseum, Tòa thánh Vatican và bay về Việt Nam.</p>' }
    ]
  },
  {
    name: 'Tour Châu Úc: Sydney - Melbourne - Công Viên Dã Thú (7N6Đ)',
    slug: 'tour-chau-uc-sydney-melbourne-cong-vien-da-thu-7n6d',
    category: CAT_CHAU_UC,
    priceAdult: 48900000,
    priceChildren: 41000000,
    priceBaby: 14500000,
    newPriceAdult: 43900000,
    newPriceChildren: 36900000,
    newPriceBaby: 12900000,
    stockAdult: 16,
    stockChildren: 6,
    stockBaby: 2,
    time: '7 ngày 6 đêm',
    vehicle: 'Máy bay khứ hồi',
    departureOffsetDays: 25,
    information: '<p>Khám phá xứ sở chuột túi Australia: chiêm ngưỡng Nhà hát Con Sò Sydney Opera House, cầu cảng Sydney Harbour Bridge, dãy núi Blue Mountains, trải nghiệm tàu hơi nước Puffing Billy tại Melbourne và gặp gỡ chuột túi Kangaroo, gấu Koala.</p>',
    schedules: [
      { title: 'Ngày 1-2: Việt Nam – Sydney – Nhà hát Opera Sydney', description: '<p>Đáp chuyến bay đến Sydney, tham quan Nhà hát Con Sò, Cầu cảng Sydney, khu phố cổ The Rocks và Darling Harbour.</p>' },
      { title: 'Ngày 3: Công viên động vật hoang dã Featherdale – Blue Mountains', description: '<p>Giao lưu cùng Kangaroo & Koala tại Featherdale Wildlife Park và khám phá kỳ quan thiên nhiên Blue Mountains.</p>' },
      { title: 'Ngày 4-5: Sydney – Melbourne – Tàu cổ Puffing Billy', description: '<p>Bay nội địa sang Melbourne, trải nghiệm tàu lửa hơi nước cổ điển Puffing Billy xuyên rừng Dandenong.</p>' },
      { title: 'Ngày 6-7: Thị trấn đãi vàng Ballarat – Bay về Việt Nam', description: '<p>Tham quan bảo tàng ngoài trời Sovereign Hill tại thị trấn Ballarat trước khi ra sân bay Melbourne về lại Việt Nam.</p>' }
    ]
  }
];

async function run() {
  await mongoose.connect(process.env.DATABASE);
  console.log('Connected to MongoDB.');

  // 1. Update Role "Quản trị viên" with all permissions
  const allPermissionValues = permissionList.map((p) => p.value);
  await Role.updateMany(
    { name: /Quản trị viên/i },
    { $set: { permissions: allPermissionValues } }
  );
  console.log('Updated Quản trị viên role with all permissions:', allPermissionValues.length);

  // Get valid admin IDs for createdBy / updatedBy
  const adminAccounts = await AccountAdmin.find({ deleted: false, status: 'active' }).select('_id fullName');
  const validAdminIds = new Set(adminAccounts.map((a) => String(a._id)));
  const fallbackAdminIds = adminAccounts.length > 0
    ? adminAccounts.map((a) => String(a._id))
    : ['68c4e190fe2903209e1d4cb4'];

  // 2. Clean up test category 'Mới'
  await Category.updateMany(
    { slug: 'moi' },
    { $set: { deleted: true } }
  );

  // 3. Remove the 44 dummy "Tour mẫu XX" records
  const deleteDummyRes = await Tour.deleteMany({ name: /^Tour mẫu\s+\d+/i });
  console.log('Removed dummy "Tour mẫu XX" tours:', deleteDummyRes.deletedCount);

  // Get cities for locations fallback
  const cities = await ProvinceCity.find({}).select('_id');
  const defaultLocations = cities.slice(0, 3).map((c) => String(c._id));

  // 4. Polish all remaining domestic tours (fix category, image variety, round prices, future departureDate, valid admin refs)
  const existingTours = await Tour.find({}).sort({ createdAt: 1 });
  let posCounter = 1;

  for (let i = 0; i < existingTours.length; i++) {
    const tour = existingTours[i];
    const updates = {};

    // Fix domestic tours that were mistakenly placed in Tour Châu Á
    if (!/Thái Lan|Singapore|Malaysia|Hàn Quốc|Nhật Bản|Bali|Đài Loan|Châu Âu|Châu Úc/i.test(tour.name)) {
      updates.category = classifyDomesticCategory(tour.name);
    }

    // Rotate diverse high-res travel images
    updates.avatar = GALLERY_IMAGES[i % GALLERY_IMAGES.length];
    if (!Array.isArray(tour.images) || tour.images.length < 3) {
      updates.images = [
        GALLERY_IMAGES[i % GALLERY_IMAGES.length],
        GALLERY_IMAGES[(i + 3) % GALLERY_IMAGES.length],
        GALLERY_IMAGES[(i + 6) % GALLERY_IMAGES.length]
      ];
    }

    // Round prices to clean 100,000 VND increments
    const priceAdult = roundToHundredThousand(tour.priceAdult || 4500000);
    const newPriceAdult = roundToHundredThousand(
      tour.newPriceAdult && tour.newPriceAdult < priceAdult
        ? tour.newPriceAdult
        : Math.round(priceAdult * 0.85)
    );
    updates.priceAdult = priceAdult;
    updates.newPriceAdult = newPriceAdult;
    updates.priceChildren = roundToHundredThousand(tour.priceChildren || Math.round(priceAdult * 0.75));
    updates.newPriceChildren = roundToHundredThousand(tour.newPriceChildren || Math.round(newPriceAdult * 0.75));
    updates.priceBaby = roundToHundredThousand(tour.priceBaby || Math.round(priceAdult * 0.3));
    updates.newPriceBaby = roundToHundredThousand(tour.newPriceBaby || Math.round(newPriceAdult * 0.3));

    // Ensure valid admin creator/updater so "Tạo bởi" & "Cập nhật bởi" are never blank
    if (!tour.createdBy || !validAdminIds.has(String(tour.createdBy))) {
      updates.createdBy = fallbackAdminIds[i % fallbackAdminIds.length];
    }
    if (!tour.updatedBy || !validAdminIds.has(String(tour.updatedBy))) {
      updates.updatedBy = fallbackAdminIds[(i + 1) % fallbackAdminIds.length];
    }

    // Ensure upcoming departureDate (between Nov 16, 2026 and Jan 25, 2027)
    const depDate = new Date(Date.UTC(2026, 10, 16 + (i % 45)));
    updates.departureDate = depDate;
    updates.position = posCounter++;

    await Tour.updateOne({ _id: tour._id }, { $set: updates });
  }
  console.log(`Polished ${existingTours.length} existing domestic tours.`);

  // 5. Upsert the 8 International Tours so "Tour nước ngoài" section on homepage is authentic
  for (let i = 0; i < INTERNATIONAL_TOURS.length; i++) {
    const intl = INTERNATIONAL_TOURS[i];
    const avatar = GALLERY_IMAGES[(i + 4) % GALLERY_IMAGES.length];
    const images = [
      avatar,
      GALLERY_IMAGES[(i + 7) % GALLERY_IMAGES.length],
      GALLERY_IMAGES[(i + 10) % GALLERY_IMAGES.length]
    ];
    const departureDate = new Date(Date.UTC(2026, 10, 15 + intl.departureOffsetDays));
    const creatorId = fallbackAdminIds[i % fallbackAdminIds.length];

    await Tour.findOneAndUpdate(
      { slug: intl.slug },
      {
        $set: {
          name: intl.name,
          slug: intl.slug,
          category: intl.category,
          position: posCounter++,
          avatar,
          images,
          status: 'active',
          priceAdult: intl.priceAdult,
          priceChildren: intl.priceChildren,
          priceBaby: intl.priceBaby,
          newPriceAdult: intl.newPriceAdult,
          newPriceChildren: intl.newPriceChildren,
          newPriceBaby: intl.newPriceBaby,
          stockAdult: intl.stockAdult,
          stockChildren: intl.stockChildren,
          stockBaby: intl.stockBaby,
          locations: defaultLocations,
          time: intl.time,
          vehicle: intl.vehicle,
          departureDate,
          information: intl.information,
          schedules: intl.schedules,
          createdBy: creatorId,
          updatedBy: creatorId,
          deleted: false
        }
      },
      { upsert: true, new: true }
    );
  }
  console.log(`Upserted ${INTERNATIONAL_TOURS.length} international tours.`);

  // Bump the flagship featured tours (Nha Trang, Đà Nẵng, Phú Quốc, Sapa, Thái Lan, Nhật Bản) to the top positions
  const flagshipMatchers = [
    /HÀ NỘI - LÀO CAI - SAPA/i,
    /PHÚ QUỐC - THIÊN ĐƯỜNG ĐẢO NGỌC/i,
    /COMBO ĐÀ NẴNG 2026/i,
    /^Tour Nha Trang$/i,
    /Tour Thái Lan: Bangkok/i,
    /Tour Nhật Bản: Tokyo/i
  ];
  for (const matcher of flagshipMatchers) {
    const t = await Tour.findOne({ name: matcher, deleted: false });
    if (t) {
      await Tour.updateOne({ _id: t._id }, { $set: { position: posCounter++ } });
    }
  }

  // Ensure 2 soft-deleted tours exist in Trash for demoing /admin/tour/trash
  const trashCount = await Tour.countDocuments({ deleted: true });
  if (trashCount === 0) {
    const lowPosTours = await Tour.find({ deleted: false }).sort({ position: 1 }).limit(2);
    for (const t of lowPosTours) {
      await Tour.updateOne(
        { _id: t._id },
        {
          $set: {
            deleted: true,
            deletedAt: new Date('2026-11-10T09:30:00Z'),
            deletedBy: fallbackAdminIds[0]
          }
        }
      );
    }
  }

  // 6. Update SettingWebsiteInfo for Demo
  await SettingWebsiteInfo.updateMany(
    {},
    {
      $set: {
        websiteName: 'SmartTour',
        phoneNumber: '1900 6868',
        email: 'booking@smarttour.vn',
        address: '268 Lý Thường Kiệt, Phường 14, Quận 10, TP. Hồ Chí Minh',
        clockExpire: '2026-12-31T23:59'
      }
    }
  );
  console.log('Updated SettingWebsiteInfo branding and countdown clockExpire.');

  // 7. Polish Customer records (replace placeholder user1/user2/testuser/djdskjdkjskd with realistic profiles)
  const customerPolishMap = [
    {
      match: { email: 'buihahaivas@gmail.com' },
      update: {
        fullName: 'Bùi Hà Hải',
        phone: '0912345678',
        gender: 'male',
        dob: new Date('2003-05-15'),
        address: '268 Lý Thường Kiệt, Quận 10, TP. Hồ Chí Minh'
      }
    },
    {
      match: { email: 'khai03042005@gmail.com' },
      update: {
        fullName: 'Nguyễn Quốc Khải',
        phone: '0396570305',
        gender: 'male',
        dob: new Date('2005-04-03'),
        address: 'Khu đô thị ĐHQG, TP. Thủ Đức, TP. Hồ Chí Minh'
      }
    },
    {
      match: { email: 'tay.pham2313063@hcmut.edu.vn' },
      update: {
        fullName: 'Phạm Ngọc Tây',
        phone: '0908231063',
        gender: 'male',
        dob: new Date('2005-08-20'),
        address: '142 Tô Hiến Thành, Quận 10, TP. Hồ Chí Minh'
      }
    },
    {
      match: { email: 'user1@gmail.com' },
      update: {
        fullName: 'Trần Minh Tuấn',
        phone: '0938112233',
        gender: 'male',
        dob: new Date('1996-11-12'),
        address: '45 Nguyễn Huệ, Quận 1, TP. Hồ Chí Minh'
      }
    },
    {
      match: { email: 'user2@gmail.com' },
      update: {
        fullName: 'Lê Hoàng Lan Anh',
        phone: '0987654321',
        gender: 'female',
        dob: new Date('1998-03-25'),
        address: '18 Tràng Tiền, Quận Hoàn Kiếm, Hà Nội'
      }
    },
    {
      match: { email: 'user3@gmail.com' },
      update: {
        fullName: 'Võ Thanh Hùng',
        phone: '0918223344',
        gender: 'male',
        dob: new Date('1994-07-08'),
        address: '102 Bạch Đằng, Quận Hải Châu, Đà Nẵng'
      }
    },
    {
      match: { email: 'user4@gmail.com' },
      update: {
        fullName: 'Đặng Ngọc Mai',
        phone: '0977889900',
        gender: 'female',
        dob: new Date('2000-01-19'),
        address: '88 Trần Phú, TP. Nha Trang, Khánh Hòa'
      }
    },
    {
      match: { email: 'customer@gmail.com' },
      update: {
        fullName: 'Hoàng Gia Bảo',
        phone: '0909556677',
        gender: 'male',
        dob: new Date('1995-09-30'),
        address: '56 Lê Lợi, TP. Huế, Thừa Thiên Huế'
      }
    },
    {
      match: { email: 'testuser@gmail.com' },
      update: {
        fullName: 'Phan Thị Thu Thảo',
        phone: '0886032940',
        gender: 'female',
        dob: new Date('1999-12-05'),
        address: '210 Nguyễn Văn Cừ, Quận Ninh Kiều, Cần Thơ'
      }
    }
  ];

  for (const item of customerPolishMap) {
    await Customer.updateOne(item.match, { $set: item.update });
  }
  console.log('Polished customer profiles for User Management demo.');

  // 8. Ensure October & November 2026 Orders have rich status/paymentStatus variety for Dashboard chart
  const activeTours = await Tour.find({ deleted: false, status: 'active' }).sort({ position: -1 }).limit(6);
  if (activeTours.length >= 3) {
    const octOrdersCount = await Order.countDocuments({
      deleted: false,
      createdAt: { $gte: new Date('2026-10-01T00:00:00Z'), $lt: new Date('2026-11-01T00:00:00Z') }
    });

    if (octOrdersCount < 4) {
      const sampleOctOrders = [
        {
          code: 'OD2026100501',
          fullName: 'Trần Minh Tuấn',
          phoneNumber: '0938112233',
          note: 'Đặt tour gia đình tháng 10',
          items: [{
            tourId: String(activeTours[0]._id),
            quantityAdult: 2,
            quantityChildren: 1,
            quantityBaby: 0,
            priceAdult: activeTours[0].priceAdult,
            priceChildren: activeTours[0].priceChildren,
            priceBaby: activeTours[0].priceBaby,
            newPriceAdult: activeTours[0].newPriceAdult,
            newPriceChildren: activeTours[0].newPriceChildren,
            newPriceBaby: activeTours[0].newPriceBaby,
            departureDate: activeTours[0].departureDate,
            locationFrom: defaultLocations[0]
          }],
          subTotal: activeTours[0].newPriceAdult * 2 + activeTours[0].newPriceChildren,
          discount: 0,
          total: activeTours[0].newPriceAdult * 2 + activeTours[0].newPriceChildren,
          paymentMethod: 'vnpay',
          paymentStatus: 'paid',
          status: 'done',
          deleted: false,
          createdAt: new Date('2026-10-05T09:15:00Z'),
          updatedAt: new Date('2026-10-05T10:00:00Z')
        },
        {
          code: 'OD2026101102',
          fullName: 'Lê Hoàng Lan Anh',
          phoneNumber: '0987654321',
          note: 'Yêu cầu phòng view biển',
          items: [{
            tourId: String(activeTours[1]._id),
            quantityAdult: 2,
            quantityChildren: 0,
            quantityBaby: 0,
            priceAdult: activeTours[1].priceAdult,
            priceChildren: activeTours[1].priceChildren,
            priceBaby: activeTours[1].priceBaby,
            newPriceAdult: activeTours[1].newPriceAdult,
            newPriceChildren: activeTours[1].newPriceChildren,
            newPriceBaby: activeTours[1].newPriceBaby,
            departureDate: activeTours[1].departureDate,
            locationFrom: defaultLocations[0]
          }],
          subTotal: activeTours[1].newPriceAdult * 2,
          discount: 0,
          total: activeTours[1].newPriceAdult * 2,
          paymentMethod: 'momo',
          paymentStatus: 'paid',
          status: 'done',
          deleted: false,
          createdAt: new Date('2026-10-11T14:20:00Z'),
          updatedAt: new Date('2026-10-11T15:00:00Z')
        },
        {
          code: 'OD2026101903',
          fullName: 'Võ Thanh Hùng',
          phoneNumber: '0918223344',
          note: 'Chuyển khoản ngân hàng',
          items: [{
            tourId: String(activeTours[2]._id),
            quantityAdult: 3,
            quantityChildren: 1,
            quantityBaby: 0,
            priceAdult: activeTours[2].priceAdult,
            priceChildren: activeTours[2].priceChildren,
            priceBaby: activeTours[2].priceBaby,
            newPriceAdult: activeTours[2].newPriceAdult,
            newPriceChildren: activeTours[2].newPriceChildren,
            newPriceBaby: activeTours[2].newPriceBaby,
            departureDate: activeTours[2].departureDate,
            locationFrom: defaultLocations[0]
          }],
          subTotal: activeTours[2].newPriceAdult * 3 + activeTours[2].newPriceChildren,
          discount: 0,
          total: activeTours[2].newPriceAdult * 3 + activeTours[2].newPriceChildren,
          paymentMethod: 'bank',
          paymentStatus: 'paid',
          status: 'done',
          deleted: false,
          createdAt: new Date('2026-10-19T11:10:00Z'),
          updatedAt: new Date('2026-10-19T11:45:00Z')
        },
        {
          code: 'OD2026102604',
          fullName: 'Đặng Ngọc Mai',
          phoneNumber: '0977889900',
          note: '',
          items: [{
            tourId: String(activeTours[0]._id),
            quantityAdult: 2,
            quantityChildren: 0,
            quantityBaby: 0,
            priceAdult: activeTours[0].priceAdult,
            priceChildren: activeTours[0].priceChildren,
            priceBaby: activeTours[0].priceBaby,
            newPriceAdult: activeTours[0].newPriceAdult,
            newPriceChildren: activeTours[0].newPriceChildren,
            newPriceBaby: activeTours[0].newPriceBaby,
            departureDate: activeTours[0].departureDate,
            locationFrom: defaultLocations[0]
          }],
          subTotal: activeTours[0].newPriceAdult * 2,
          discount: 0,
          total: activeTours[0].newPriceAdult * 2,
          paymentMethod: 'vnpay',
          paymentStatus: 'paid',
          status: 'done',
          deleted: false,
          createdAt: new Date('2026-10-26T16:05:00Z'),
          updatedAt: new Date('2026-10-26T16:30:00Z')
        }
      ];

      for (const ord of sampleOctOrders) {
        await Order.collection.updateOne({ code: ord.code }, { $set: ord }, { upsert: true });
      }
      console.log('Seeded October 2026 comparison orders for Dashboard chart.');
    }

    // Mark completed November 2026 orders as paid so Dashboard shows realistic paid vs unpaid figures
    await Order.updateMany(
      { status: 'done', paymentStatus: 'unpaid' },
      { $set: { paymentStatus: 'paid' } }
    );
  }

  console.log('Demo seed & polish completed successfully!');
  process.exit(0);
}

run().catch((err) => {
  console.error('Seed error:', err);
  process.exit(1);
});
