require('dotenv').config();
const mongoose = require('mongoose');
const Tour = require('../models/tour.model');

const CATEGORIES = {
  mienTrung: '68d72e333fdf25f23ffc5bb9',
  mienNam: '68d72e433fdf25f23ffc5bc1',
  chauAu: '68d72eae3fdf25f23ffc5bd9'
};

const CITIES = {
  haNoi: '6959ef83de936435761443f4',
  hoChiMinh: '6959ef83de936435761443f5',
  daNang: '6959ef83de936435761443f7'
};

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

const futureDate = (daysFromNow) => new Date(Date.now() + daysFromNow * 24 * 60 * 60 * 1000);

const TOURS = [
  // 1. Nha Trang 3 ngày 2 đêm (5 - 10 triệu)
  {
    name: 'Tour Nha Trang - VinWonders - Đảo Bình Ba 3N2Đ',
    slug: 'tour-nha-trang-vinwonders-dao-binh-ba-3n2d',
    category: CATEGORIES.mienTrung,
    time: '3 ngày 2 đêm',
    vehicle: 'Máy bay',
    priceAdult: 7800000,
    priceChildren: 5400000,
    priceBaby: 1800000,
    newPriceAdult: 6990000,
    newPriceChildren: 4890000,
    newPriceBaby: 1500000,
    stockAdult: 24,
    stockChildren: 10,
    stockBaby: 6,
    locations: [CITIES.haNoi, CITIES.hoChiMinh],
    departureDate: futureDate(10),
    avatar: GALLERY_IMAGES[0],
    images: [GALLERY_IMAGES[0], GALLERY_IMAGES[1], GALLERY_IMAGES[2], GALLERY_IMAGES[3]],
    information: '<p>Khám phá thành phố biển Nha Trang xinh đẹp với tổ hợp giải trí VinWonders, lặn ngắm san hô tại vịnh biển trong xanh và thưởng thức hải sản tươi ngon.</p>',
    schedules: [
      { title: 'Ngày 1 | Khởi hành - Nha Trang - Tháp Bà Ponagar', description: '<p>Đón khách tại sân bay Cam Ranh, tham quan Tháp Bà Ponagar và nhận phòng khách sạn ven biển.</p>' },
      { title: 'Ngày 2 | Đảo Bình Ba - VinWonders Nha Trang', description: '<p>Trải nghiệm tắm biển, lặn ngắm san hô và vui chơi trọn ngày tại VinWonders.</p>' },
      { title: 'Ngày 3 | Chợ Đầm - Tiễn sân bay', description: '<p>Mua sắm đặc sản địa phương tại Chợ Đầm và khởi hành về điểm xuất phát.</p>' }
    ]
  },
  {
    name: 'Tour Biển Nha Trang - Hòn Tằm Resort 3N2Đ',
    slug: 'tour-bien-nha-trang-hon-tam-resort-3n2d',
    category: CATEGORIES.mienTrung,
    time: '3 ngày 2 đêm',
    vehicle: 'Máy bay',
    priceAdult: 9200000,
    priceChildren: 6500000,
    priceBaby: 2100000,
    newPriceAdult: 8490000,
    newPriceChildren: 5990000,
    newPriceBaby: 1800000,
    stockAdult: 18,
    stockChildren: 8,
    stockBaby: 4,
    locations: [CITIES.haNoi, CITIES.hoChiMinh, CITIES.daNang],
    departureDate: futureDate(14),
    avatar: GALLERY_IMAGES[4],
    images: [GALLERY_IMAGES[4], GALLERY_IMAGES[5], GALLERY_IMAGES[6], GALLERY_IMAGES[7]],
    information: '<p>Kỳ nghỉ biển cao cấp 3 ngày 2 đêm tại Nha Trang kết hợp tắm bùn khoáng Hòn Tằm và du thuyền ngắm hoàng hôn trên vịnh Nha Trang.</p>',
    schedules: [
      { title: 'Ngày 1 | Nha Trang - Du thuyền vịnh biển', description: '<p>Nhận phòng resort 4 sao, dùng bữa tối hải sản trên du thuyền.</p>' },
      { title: 'Ngày 2 | Đảo Hòn Tằm - Tắm bùn khoáng', description: '<p>Thư giãn tại khu nghỉ dưỡng đảo Hòn Tằm, chèo kayak và tắm biển.</p>' },
      { title: 'Ngày 3 | Viện Hải dương học - Kết thúc tour', description: '<p>Tham quan Viện Hải dương học Nha Trang và ra sân bay Cam Ranh.</p>' }
    ]
  },

  // 2. Đà Lạt 2 ngày 1 đêm (< 5 triệu)
  {
    name: 'Tour Đà Lạt 2N1Đ: Săn Mây Cầu Đất - Thung Lũng Tình Yêu',
    slug: 'tour-da-lat-2n1d-san-may-cau-dat-thung-lung-tinh-yeu',
    category: CATEGORIES.mienNam,
    time: '2 ngày 1 đêm',
    vehicle: 'Xe giường nằm',
    priceAdult: 3400000,
    priceChildren: 2400000,
    priceBaby: 800000,
    newPriceAdult: 2890000,
    newPriceChildren: 1990000,
    newPriceBaby: 650000,
    stockAdult: 30,
    stockChildren: 12,
    stockBaby: 6,
    locations: [CITIES.hoChiMinh, CITIES.daNang],
    departureDate: futureDate(7),
    avatar: GALLERY_IMAGES[8],
    images: [GALLERY_IMAGES[8], GALLERY_IMAGES[9], GALLERY_IMAGES[10], GALLERY_IMAGES[11]],
    information: '<p>Hành trình ngắn ngày lý tưởng cuối tuần tại Đà Lạt: đón bình minh săn mây đồi chè Cầu Đất, dạo bước Thung Lũng Tình Yêu và thưởng thức lẩu gà lá é.</p>',
    schedules: [
      { title: 'Ngày 1 | Đà Lạt - Thung Lũng Tình Yêu - Chợ Đêm', description: '<p>Check-in Quảng trường Lâm Viên, tham quan Thung Lũng Tình Yêu và dạo Chợ Đêm Đà Lạt.</p>' },
      { title: 'Ngày 2 | Săn mây Cầu Đất - Vườn dâu - Trở về', description: '<p>Đón bình minh trên đồi chè Cầu Đất, tham quan vườn dâu công nghệ cao và khởi hành về.</p>' }
    ]
  },
  {
    name: 'Tour Đà Lạt 2N1Đ: Thành Phố Ngàn Hoa - Puppy Farm',
    slug: 'tour-da-lat-2n1d-thanh-pho-ngan-hoa-puppy-farm',
    category: CATEGORIES.mienNam,
    time: '2 ngày 1 đêm',
    vehicle: 'Xe du lịch',
    priceAdult: 4200000,
    priceChildren: 2950000,
    priceBaby: 950000,
    newPriceAdult: 3690000,
    newPriceChildren: 2590000,
    newPriceBaby: 800000,
    stockAdult: 22,
    stockChildren: 10,
    stockBaby: 5,
    locations: [CITIES.hoChiMinh],
    departureDate: futureDate(11),
    avatar: GALLERY_IMAGES[12],
    images: [GALLERY_IMAGES[12], GALLERY_IMAGES[13], GALLERY_IMAGES[0], GALLERY_IMAGES[1]],
    information: '<p>Tour Đà Lạt 2 ngày 1 đêm tiết kiệm cho gia đình và nhóm bạn: khám phá nông trại cún Puppy Farm, thác Datanla và thưởng thức cà phê đồi thông.</p>',
    schedules: [
      { title: 'Ngày 1 | Hồ Tuyền Lâm - Thác Datanla - Giao lưu cồng chiêng', description: '<p>Tham quan Thiền Viện Trúc Lâm, trải nghiệm máng trượt Datanla và thưởng thức ẩm thực Tây Nguyên.</p>' },
      { title: 'Ngày 2 | Puppy Farm - Nhà thờ Domain De Marie', description: '<p>Vui chơi tại nông trại cún, mua sắm mứt đặc sản và kết thúc hành trình.</p>' }
    ]
  },

  // 3. Phú Quốc 4 ngày 3 đêm (~8 triệu) & Tour biển ~8 triệu
  {
    name: 'Tour Phú Quốc 4N3Đ: Grand World - Hòn Thơm - Đảo Ngọc',
    slug: 'tour-phu-quoc-4n3d-grand-world-hon-thom-dao-ngoc',
    category: CATEGORIES.mienNam,
    time: '4 ngày 3 đêm',
    vehicle: 'Máy bay',
    priceAdult: 8900000,
    priceChildren: 6300000,
    priceBaby: 1950000,
    newPriceAdult: 7990000,
    newPriceChildren: 5690000,
    newPriceBaby: 1650000,
    stockAdult: 20,
    stockChildren: 10,
    stockBaby: 5,
    locations: [CITIES.haNoi, CITIES.hoChiMinh],
    departureDate: futureDate(12),
    avatar: GALLERY_IMAGES[2],
    images: [GALLERY_IMAGES[2], GALLERY_IMAGES[3], GALLERY_IMAGES[4], GALLERY_IMAGES[5]],
    information: '<p>Trải nghiệm trọn vẹn Đảo Ngọc Phú Quốc 4 ngày 3 đêm: cáp treo vượt biển dài nhất thế giới tới Hòn Thơm, thành phố không ngủ Grand World và tắm biển Bãi Sao.</p>',
    schedules: [
      { title: 'Ngày 1 | Bay đến Phú Quốc - Grand World', description: '<p>Nhận phòng khách sạn, tham quan thành phố không ngủ Grand World và xem show Tinh hoa Việt Nam.</p>' },
      { title: 'Ngày 2 | VinWonders - Vinpearl Safari Phú Quốc', description: '<p>Khám phá công viên chăm sóc động vật bán hoang dã Safari và khu vui chơi VinWonders.</p>' },
      { title: 'Ngày 3 | Cáp treo Hòn Thơm - Bãi Sao', description: '<p>Đi cáp treo ra đảo Hòn Thơm, tắm biển Bãi Sao và ngắm hoàng hôn tại Sunset Sanato.</p>' },
      { title: 'Ngày 4 | Chợ Dương Đông - Tiễn sân bay', description: '<p>Tham quan cơ sở nước mắm truyền thống, mua sắm đặc sản và bay về.</p>' }
    ]
  },
  {
    name: 'Tour Biển Phú Quốc 4N3Đ: Cano 4 Đảo - Sunset Town',
    slug: 'tour-bien-phu-quoc-4n3d-cano-4-dao-sunset-town',
    category: CATEGORIES.mienNam,
    time: '4 ngày 3 đêm',
    vehicle: 'Máy bay',
    priceAdult: 9100000,
    priceChildren: 6400000,
    priceBaby: 2000000,
    newPriceAdult: 8290000,
    newPriceChildren: 5890000,
    newPriceBaby: 1700000,
    stockAdult: 16,
    stockChildren: 8,
    stockBaby: 4,
    locations: [CITIES.haNoi, CITIES.hoChiMinh, CITIES.daNang],
    departureDate: futureDate(16),
    avatar: GALLERY_IMAGES[6],
    images: [GALLERY_IMAGES[6], GALLERY_IMAGES[7], GALLERY_IMAGES[8], GALLERY_IMAGES[9]],
    information: '<p>Tour biển Phú Quốc 4 ngày 3 đêm lặn ngắm san hô bằng cano 4 đảo (Móng Tay, Gầm Ghì, Mây Rút), dạo bước Cầu Hôn Sunset Town và thưởng thức hải sản Hàm Ninh.</p>',
    schedules: [
      { title: 'Ngày 1 | Đến Phú Quốc - Làng chài Hàm Ninh', description: '<p>Đón sân bay, thưởng thức ghẹ Hàm Ninh và check-in resort ven biển.</p>' },
      { title: 'Ngày 2 | Tour cano 4 đảo - Lặn ngắm san hô', description: '<p>Khám phá Hòn Móng Tay, Hòn Gầm Ghì, Hòn Mây Rút và chụp ảnh flycam miễn phí.</p>' },
      { title: 'Ngày 3 | Sunset Town - Cầu Hôn - Chợ đêm', description: '<p>Ngắm hoàng hôn tại Thị trấn Hoàng Hôn và dạo chợ đêm Phú Quốc.</p>' },
      { title: 'Ngày 4 | Chùa Hộ Quốc - Kết thúc hành trình', description: '<p>Viếng Chùa Hộ Quốc hướng biển và ra sân bay Phú Quốc.</p>' }
    ]
  },
  {
    name: 'Tour Biển Quy Nhơn - Kỳ Co - Eo Gió 4N3Đ',
    slug: 'tour-bien-quy-nhon-ky-co-eo-gio-4n3d',
    category: CATEGORIES.mienTrung,
    time: '4 ngày 3 đêm',
    vehicle: 'Máy bay',
    priceAdult: 8500000,
    priceChildren: 5900000,
    priceBaby: 1850000,
    newPriceAdult: 7890000,
    newPriceChildren: 5490000,
    newPriceBaby: 1600000,
    stockAdult: 20,
    stockChildren: 8,
    stockBaby: 4,
    locations: [CITIES.haNoi, CITIES.hoChiMinh],
    departureDate: futureDate(18),
    avatar: GALLERY_IMAGES[10],
    images: [GALLERY_IMAGES[10], GALLERY_IMAGES[11], GALLERY_IMAGES[12], GALLERY_IMAGES[13]],
    information: '<p>Khám phá thiên đường biển Quy Nhơn - Phú Yên: bãi biển Kỳ Co xanh ngọc, Eo Gió hùng vĩ, Gành Đá Đĩa và Tháp Nghinh Phong.</p>',
    schedules: [
      { title: 'Ngày 1 | Quy Nhơn - Tháp Đôi - Ghềnh Ráng Tiên Sa', description: '<p>Tham quan bãi tắm Hoàng Hậu, khu mộ Hàn Mặc Tử và dạo biển Quy Nhơn.</p>' },
      { title: 'Ngày 2 | Kỳ Co - Eo Gió - Tịnh xá Ngọc Hòa', description: '<p>Đi cano ra đảo Kỳ Co, lặn san hô Bãi Dứa và ngắm hoàng hôn tại Eo Gió.</p>' },
      { title: 'Ngày 3 | Phú Yên - Gành Đá Đĩa - Bãi Xép', description: '<p>Tham quan Nhà thờ Mằng Lăng, Gành Đá Đĩa và phim trường Hoa vàng trên cỏ xanh.</p>' },
      { title: 'Ngày 4 | Mua sắm đặc sản - Tiễn sân bay Phù Cát', description: '<p>Mua bánh ít lá gai, nem Chợ Huyện và bay về.</p>' }
    ]
  },

  // 4. Tour du lịch Châu Âu 8 ngày 7 đêm
  {
    name: 'Tour Châu Âu 8N7Đ: Pháp - Thụy Sĩ - Ý Lãng Mạn',
    slug: 'tour-chau-au-8n7d-phap-thuy-si-y-lang-man',
    category: CATEGORIES.chauAu,
    time: '8 ngày 7 đêm',
    vehicle: 'Máy bay',
    priceAdult: 58900000,
    priceChildren: 47100000,
    priceBaby: 18500000,
    newPriceAdult: 54900000,
    newPriceChildren: 43900000,
    newPriceBaby: 16900000,
    stockAdult: 15,
    stockChildren: 6,
    stockBaby: 2,
    locations: [CITIES.haNoi, CITIES.hoChiMinh],
    departureDate: futureDate(21),
    avatar: GALLERY_IMAGES[1],
    images: [GALLERY_IMAGES[1], GALLERY_IMAGES[3], GALLERY_IMAGES[5], GALLERY_IMAGES[7]],
    information: '<p>Hành trình Châu Âu kinh điển 8 ngày 7 đêm đi qua kinh đô ánh sáng Paris, đỉnh núi tuyết Titlis Thụy Sĩ và thành phố kênh đào Venice - Milan nước Ý.</p>',
    schedules: [
      { title: 'Ngày 1-2 | Khởi hành - Paris - Tháp Eiffel - Du thuyền sông Seine', description: '<p>Check-in Tháp Eiffel, Khải Hoàn Môn, đại lộ Champs-Élysées và du thuyền sông Seine.</p>' },
      { title: 'Ngày 3-4 | Paris - Bảo tàng Louvre - Dijon - Lucerne', description: '<p>Tham quan Bảo tàng Louvre, di chuyển sang Thụy Sĩ ngắm cầu gỗ Chapel và hồ Lucerne.</p>' },
      { title: 'Ngày 5-6 | Núi tuyết Titlis - Milan - Venice', description: '<p>Lên đỉnh Titlis ngắm tuyết trắng, ghé kinh đô thời trang Milan và đi thuyền Gondola tại Venice.</p>' },
      { title: 'Ngày 7-8 | Florence - Rome - Bay về Việt Nam', description: '<p>Tham quan Đấu trường La Mã Colosseum và hoàn tất hành trình Châu Âu.</p>' }
    ]
  },
  {
    name: 'Tour Châu Âu 8N7Đ: Đức - Áo - Séc - Hungary',
    slug: 'tour-chau-au-8n7d-duc-ao-sec-hungary',
    category: CATEGORIES.chauAu,
    time: '8 ngày 7 đêm',
    vehicle: 'Máy bay',
    priceAdult: 53900000,
    priceChildren: 43100000,
    priceBaby: 16900000,
    newPriceAdult: 49900000,
    newPriceChildren: 39900000,
    newPriceBaby: 15500000,
    stockAdult: 16,
    stockChildren: 6,
    stockBaby: 2,
    locations: [CITIES.haNoi, CITIES.hoChiMinh],
    departureDate: futureDate(25),
    avatar: GALLERY_IMAGES[9],
    images: [GALLERY_IMAGES[9], GALLERY_IMAGES[11], GALLERY_IMAGES[13], GALLERY_IMAGES[2]],
    information: '<p>Khám phá Đông - Trung Âu cổ kính 8 ngày 7 đêm qua Prague, Vienna, Budapest và Munich với kiến trúc lâu đài tráng lệ và du thuyền sông Danube.</p>',
    schedules: [
      { title: 'Ngày 1-2 | Frankfurt - Munich - Lâu đài Neuschwanstein', description: '<p>Tham quan quảng trường Marienplatz và lâu đài cổ tích Neuschwanstein.</p>' },
      { title: 'Ngày 3-4 | Munich - Prague - Cầu Charles', description: '<p>Khám phá Phố Cổ Prague, đồng hồ thiên văn và lâu đài Prague.</p>' },
      { title: 'Ngày 5-6 | Vienna - Cung điện Schönbrunn - Budapest', description: '<p>Thưởng ngoạn cố đô Vienna và du thuyền ngắm toàn cảnh tòa nhà Quốc hội Hungary bên sông Danube.</p>' },
      { title: 'Ngày 7-8 | Budapest - Mua sắm - Bay về Việt Nam', description: '<p>Tự do mua sắm và đáp chuyến bay về Việt Nam.</p>' }
    ]
  }
];

(async () => {
  await mongoose.connect(process.env.DATABASE);

  let created = 0;
  let updated = 0;

  for (const tourData of TOURS) {
    const existing = await Tour.findOne({ slug: tourData.slug });
    if (existing) {
      await Tour.updateOne(
        { _id: existing._id },
        {
          $set: {
            ...tourData,
            status: 'active',
            deleted: false
          }
        }
      );
      updated++;
    } else {
      await Tour.create({
        ...tourData,
        status: 'active',
        deleted: false
      });
      created++;
    }
  }

  const totalActive = await Tour.countDocuments({ deleted: false, status: 'active' });
  console.log(JSON.stringify({ created, updated, totalActive }, null, 2));

  await mongoose.disconnect();
})();
