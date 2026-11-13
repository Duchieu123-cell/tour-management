// Menu Mobile
const buttonMenuMobile = document.querySelector(".header .inner-menu-mobile");
if(buttonMenuMobile){
  const menu = document.querySelector(".header .inner-menu");

  // Click vào button mở menu
  buttonMenuMobile.addEventListener("click", () => {
    menu.classList.add("active");
  });

	// Click vào overlay thì đóng menu lại
	const overlay = document.querySelector(".header .inner-menu .inner-overlay");
	if(overlay){
		overlay.addEventListener("click", () => {
			menu.classList.remove("active");
		});
	}

	// Click vào icon caret-down thì mở sub menu lên
	const listButtonSubMenu = menu.querySelectorAll("ul > li > i");
	listButtonSubMenu.forEach(button => {
		button.addEventListener("click", () => {
			button.parentNode.classList.toggle("active");
		});
	});
}
// End Menu Mobile

// Header Account Dropdown
const headerAccountDropdown = document.querySelector("[header-account-dropdown]");
if(headerAccountDropdown){
	const trigger = headerAccountDropdown.querySelector("[header-account-trigger]");
	if(trigger){
		trigger.addEventListener("click", (event) => {
			event.stopPropagation();
			const isOpen = headerAccountDropdown.classList.toggle("is-open");
			trigger.setAttribute("aria-expanded", isOpen ? "true" : "false");
		});
	}

	document.addEventListener("click", (event) => {
		if(!headerAccountDropdown.contains(event.target)){
			headerAccountDropdown.classList.remove("is-open");
			if(trigger){
				trigger.setAttribute("aria-expanded", "false");
			}
		}
	});
}
// End Header Account Dropdown


// Box Address Section 1
const boxAddressSection1 = document.querySelector(".section-1 .inner-form .inner-address");
if(boxAddressSection1){
	// Ẩn hiện box suggest
	const input = boxAddressSection1.querySelector(".inner-input");
	input.addEventListener("focus", () => {
		boxAddressSection1.classList.add("active");
	});
	input.addEventListener("blur", () => {
		boxAddressSection1.classList.remove("active");
	});
	// Hết Ẩn hiện box suggest

	// Sự kiện click vào từng item
	const listItem = boxAddressSection1.querySelectorAll(".inner-suggest-list .inner-item");
	listItem.forEach(item => {
		item.addEventListener("mousedown", () => {
			const title = item.querySelector(".inner-item-title").innerHTML.trim();
			input.value = title;
		});
	});
	// Hết Sự kiện click vào từng item
}
// End Box Address Section 1


// Box User Section 1
const boxUserSection1 = document.querySelector(".section-1 .inner-form .inner-user");
if(boxUserSection1){
	// Hiển thị box quantity
	const input = boxUserSection1.querySelector(".inner-input");
	input.addEventListener("focus", () => {
		boxUserSection1.classList.add("active");
	});
	// Hết Hiển thị box quantity

	// Ẩn box quantity
	document.addEventListener("click", (event) => {
		if(!boxUserSection1.contains(event.target)){
			boxUserSection1.classList.remove("active");
		}
	});
	// Hết Ẩn box quantity

	//Thêm số lượng vào ô input
	const updateQuantityInput = () => {
		const listBoxNumber = boxUserSection1.querySelectorAll(".inner-count .inner-number");
		const listNumber = [];
		listBoxNumber.forEach(boxNumber => {
			const number = parseInt(boxNumber.innerHTML);
			listNumber.push(number);
		});
		const value = `NL: ${listNumber[0]}, TE = ${listNumber[1]}, EB = ${listNumber[2]}`;
		input.value = value;
	}
	//Hết Thêm số lượng vào ô input

	//Tăng lượng khách đặt
	const listButtonUp = boxUserSection1.querySelectorAll(".inner-up");
	listButtonUp.forEach(button => {
		button.addEventListener("click", () => {
			const parent = button.parentNode;
			const boxNumber = parent.querySelector(".inner-number");
			const number = parseInt(boxNumber.innerHTML);
			boxNumber.innerHTML = number + 1;
			updateQuantityInput();
		});
	});
	//Hết Tăng lượng khách đặt

	//Giảm lượng khách đặt
	const listButtonDown = boxUserSection1.querySelectorAll(".inner-down");
	listButtonDown.forEach(button => {
		button.addEventListener("click", () => {
			const parent = button.parentNode;
			const boxNumber = parent.querySelector(".inner-number");
			const number = parseInt(boxNumber.innerHTML);
			boxNumber.innerHTML = number > 0 ? number - 1 : 0;
			updateQuantityInput();
		});
	});
	//Hết Giảm lượng khách đặt
}
// End Box User Section 1


// Clock expire
const clockExpire = document.querySelector("[clock-expire]");
if(clockExpire){
	const expireDateTimeString = clockExpire.getAttribute("clock-expire");
	// Chuyển đổi chuỗi thời gian thành đối tượng Date
	const expireDateTime = new Date(expireDateTimeString);
	
	// Hàm cập nhật đồng hồ
	const updateClock = () => {
		const now = new Date();
		const remainingTime = expireDateTime - now;
		if(remainingTime > 0){
			const days = Math.floor(remainingTime / (24 * 60 * 60 * 1000));
			const hours = Math.floor(remainingTime / (60 * 60 * 1000) % 24);
			const minutes = Math.floor(remainingTime / (60 * 1000) % 60);
			const seconds = Math.floor(remainingTime / 1000 % 60);

			const timeValues = [days, hours, minutes, seconds];
			
			const listBoxNumber = clockExpire.querySelectorAll(".inner-item .inner-number");
			listBoxNumber.forEach((element, index) => {
				element.innerHTML = `${timeValues[index]}`.padStart(2, "0");
			});
		}
		else{
			clearInterval(intervalClock);
		}
	};
	
	// Gọi hàm cập nhật đồng hồ mỗi giây
	const intervalClock = setInterval(updateClock, 1000);
}
// End Clock expire


// Box Filter
const buttonFilterMobile = document.querySelector(".section-9 .inner-filter-mobile");
if(buttonFilterMobile){
	const boxLeft = document.querySelector(".section-9 .inner-left");
	buttonFilterMobile.addEventListener("click", () => {
		boxLeft.classList.add("active");
	});
	const overlay = boxLeft.querySelector(".inner-overlay");
	overlay.addEventListener("click", () => {
		boxLeft.classList.remove("active");
	});
}
// End Box Filter


// Box tour info
const boxTourInfo = document.querySelector(".section-10 .box-tour-info");
if(boxTourInfo){
	const buttonReadMore = boxTourInfo.querySelector(".inner-read-more .button-outline");
	const infoContent = boxTourInfo.querySelector(".inner-content");

	// Chỉ thu gọn khi nội dung dài hơn chiều cao tối đa; nội dung ngắn hiển thị vừa khít, ẩn nút
	const updateCollapse = () => {
		if(boxTourInfo.classList.contains("active")){
			return;
		}
		boxTourInfo.classList.remove("no-collapse");
		if(infoContent.scrollHeight <= infoContent.clientHeight + 1){
			boxTourInfo.classList.add("no-collapse");
		}
	};
	updateCollapse();
	window.addEventListener("load", updateCollapse);
	infoContent.querySelectorAll("img").forEach((img) => {
		if(!img.complete){
			img.addEventListener("load", updateCollapse);
		}
	});

	buttonReadMore.addEventListener("click", () => {
		if(!boxTourInfo.classList.contains("active")){
			boxTourInfo.classList.add("active");
			buttonReadMore.innerHTML = "Thu gọn";
		}
		else{
			boxTourInfo.classList.remove("active");
			buttonReadMore.innerHTML = "Xem tất cả";
		}
	});
	const viewer = new Viewer(boxTourInfo);
}
// End Box tour info


// Box tour shedule
const boxTourSchedule = document.querySelector(".section-10 .box-tour-schedule");
if(boxTourSchedule){
	const viewer = new Viewer(boxTourSchedule);
}
// End Box tour schedule


// Swiper Section 2
const swiperSection2 = document.querySelector(".swiper-section-2");
if(swiperSection2){
	var swiper = new Swiper(".swiper-section-2", {
      slidesPerView: 1,
      spaceBetween: 20,
	  loop: true,
	  autoplay: {
        delay: 4000,
        disableOnInteraction: false,
      },
	  breakpoints: {
        992: {
          slidesPerView: 2,
        },
		1200: {
          slidesPerView: 3,
        },
      },
    });
}
// End Swiper Section 2


// Swiper Section 3
const swiperSection3 = document.querySelector(".swiper-section-3");
if(swiperSection3){
	var swiper = new Swiper(".swiper-section-3", {
      slidesPerView: 1,
      spaceBetween: 20,
	  loop: true,
	  pagination: {
        el: ".swiper-pagination",
        clickable: true,
      },
	  autoplay: {
        delay: 4000,
        disableOnInteraction: false,
      },
	  breakpoints: {
        576: {
          slidesPerView: 2,
        },
		992: {
          slidesPerView: 3,
        },
      },
    });
}
// End Swiper Section 3


// Swiper Section 10
const boxImage = document.querySelector(".section-10 .box-image");
if(boxImage){
	var swiperBoxImagesThumb = new Swiper(".swiper-box-images-thumb", {
      loop: true,
      spaceBetween: 5,
      slidesPerView: 4,
      freeMode: true,
      watchSlidesProgress: true,
	  breakpoints: {
        576: {
          spaceBetween: 10,
        },
      },
    });
    var swiperBoxImagesMain = new Swiper(".swiper-box-images-main", {
      loop: true,
      spaceBetween: 0,
      thumbs: {
        swiper: swiperBoxImagesThumb,
      },
    });
}
// End Swiper Section 10


// Zoom Box Images Main
const boxImagesMain = document.querySelector(".section-10 .box-image .inner-images-main");
if(boxImagesMain){
	const viewer = new Viewer(boxImagesMain);
}
// End Zoom Box Images Main


// Khởi tạo AOS
AOS.init();
// Hết Khởi tạo AOS


// Email Form (Justvalidate)
const emailForm = document.querySelector("#email-form");
if(emailForm){
	const validator = new JustValidate('#email-form');

	validator
		.addField('#email-input', [
			{
				rule: 'required',
				errorMessage: 'Vui lòng nhập email của bạn'
			},
			{
				rule: 'email',
				errorMessage: 'Email không đúng định dạng'
			},
		])
		.onSuccess(( event ) => {
			const email = event.target.email.value;
			
			const dataFinal = {
				email: email,
			};

			fetch('/contact/create', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify(dataFinal),
			})
			.then(res => res.json())
			.then(data => {
				if(data.code == "SUCCESS"){
					window.location.reload();
				}

				if(data.code == "ERROR"){
					alert(data.message);
				}
			})
		});
}
// End Email Form


// Coupon Form (Justvalidate)
const couponForm = document.querySelector("#coupon-form");
if(couponForm){
	const validator = new JustValidate('#coupon-form');

	validator
		.addField('#coupon-input', [
			{
				rule: 'required',
				errorMessage: 'Vui lòng nhập mã coupon'
			},
		])
		.onSuccess(( event ) => {
			const coupon = event.target.coupon.value;
			console.log(coupon);
		});
}
// End Coupon Form


// Order Form (Justvalidate)
const orderForm = document.querySelector("#order-form");
if(orderForm){
	const validator = new JustValidate('#order-form');

	validator
		.addField('#fullname-input', [
			{
				rule: 'required',
				errorMessage: 'Vui lòng nhập họ tên'
			},
			{
				rule: 'minLength',
				value: 5,
				errorMessage: 'Vui lòng nhập ít nhất 5 ký tự'
			},
			{
				rule: 'maxLength',
				value: 50,
				errorMessage: 'Họ tên không được vượt quá 50 ký tự'
			},
		])
		.addField('#phone-input', [
			{
				rule: 'required',
				errorMessage: 'Vui lòng nhập số điện thoại'
			},
			{
				rule: 'customRegexp',
				value: /(84|0[3|5|7|8|9])+([0-9]{8})\b/g,
				errorMessage: 'Số điện thoại không đúng định dạng'
			},
		])
		.onSuccess(( event ) => {
			const fullName = event.target.fullName.value;
			const phoneNumber = event.target.phoneNumber.value;
			const note = event.target.note.value;
			const method = event.target.method.value;

			let cart = localStorage.getItem("cart");

			// Chỉ lấy ra những tour được chọn trong giỏ hàng và có số lượng lớn hơn 0
			cart = JSON.parse(cart).filter(item => item.checked && (item.quantityAdult + item.quantityChildren + item.quantityBaby > 0));

			// Chỉ lấy ra những trường cần thiết
			cart = cart.map(item => ({
				tourId: item.tourId,
				quantityAdult: item.quantityAdult,
				quantityChildren: item.quantityChildren,
				quantityBaby: item.quantityBaby,
				locationFrom: item.locationFrom
			}));

			if(cart.length > 0){
				const dataFinal = {
					fullName: fullName,
					phoneNumber: phoneNumber,
					note: note,
					paymentMethod: method,
					items: cart
				};
				fetch(`/order/create`, {
					method: 'POST',
					headers: {
						'Content-Type': 'application/json',
					},
					body: JSON.stringify(dataFinal),
				})
				.then(res => res.json())
				.then(data => {
					if(data.code == "SUCCESS"){
						// Cập nhật lại giỏ hàng
						let cart = JSON.parse(localStorage.getItem("cart"));
						cart = cart.filter(item => item.checked == false);
						localStorage.setItem("cart", JSON.stringify(cart));

						switch(method){
							case "money":
							case "bank":
								// Chuyển sang trang đặt hàng thành công
								window.location.href = `/order/success?code=${data.orderCode}&phoneNumber=${phoneNumber}`;
								break;
							case "momo":
								// Chuyển sang trang thanh toán Momo
								window.location.href = `/order/payment-momo?code=${data.orderCode}`;
								break;
							case "zalopay":
								// Chuyển sang trang thanh toán Zalopay
								window.location.href = `/order/payment-zalopay?code=${data.orderCode}`;
								break;
							case "vnpay":
								// Chuyển sang trang thanh toán VNPAY
								window.location.href = `/order/payment-vnpay?code=${data.orderCode}`;
								break;
						}
					}
					if(data.code == "ERROR"){
						alert(data.message);
					}
				});
			}
		});
	
	const listInputMethod = orderForm.querySelectorAll(`input[name="method"]`);
	const elementInfoBank = orderForm.querySelector(".inner-info-bank");

	listInputMethod.forEach(inputMethod => {
		inputMethod.addEventListener("change", () => {
			if(inputMethod.value == "bank"){
				elementInfoBank.classList.add("active");
			}
			else{
				elementInfoBank.classList.remove("active");
			}
		})
	});

}
// End Order Form

// Alert
const alertTime = document.querySelector("[alert-time]");
if (alertTime) {
  let time = alertTime.getAttribute("alert-time");
  time = time ? parseInt(time) : 4000;
  setTimeout(() => {
    alertTime.remove();
  }, time); 
}
// End Alert

// Box Filter
const boxFilter = document.querySelector(".box-filter");
if(boxFilter){
	const url = new URL(`${window.location.origin}/search`);

	const buttonApply = boxFilter.querySelector(".inner-button");
	buttonApply.addEventListener("click", () => {
		// Lấy giá trị từ các trường lọc
		const filterList = [
			"locationFrom",
			"locationTo",
			"departureDate",
			"stockAdult",
			"stockChildren",
			"stockBaby",
			"price"
		];

		filterList.forEach(item => {
			const value = boxFilter.querySelector(`[name="${item}"]`).value;
			if(value){
				url.searchParams.set(item, value);
			} else {
				url.searchParams.delete(item);
			}
		})

		window.location.href = url.href;
	});
}
// End Box Filter

// Form Search
const formSearch = document.querySelector("[form-search]");
if(formSearch){
	const url = new URL(`${window.location.origin}/search`);

	formSearch.addEventListener("submit", (event) => {
		event.preventDefault();

		// Điểm đến
		const locationTo = formSearch.querySelector(`[name="locationTo"]`).value;

		if(locationTo){
			url.searchParams.set("locationTo", locationTo);
		} else {
			url.searchParams.delete("locationTo");
		}

		// Số lượng
		const stockAdult = parseInt(formSearch.querySelector(`[stock-adult]`).innerHTML);
		if(stockAdult && stockAdult > 0){
			url.searchParams.set("stockAdult", stockAdult);
		} else {
			url.searchParams.delete("stockAdult");
		}

		const stockChildren = parseInt(formSearch.querySelector(`[stock-children]`).innerHTML);
		if(stockChildren && stockChildren > 0){
			url.searchParams.set("stockChildren", stockChildren);
		} else {
			url.searchParams.delete("stockChildren");
		}

		const stockBaby = parseInt(formSearch.querySelector(`[stock-baby]`).innerHTML);
		if(stockBaby && stockBaby > 0){
			url.searchParams.set("stockBaby", stockBaby);
		} else {
			url.searchParams.delete("stockBaby");
		}

		// Ngày khởi hành
		const departureDate = formSearch.querySelector(`[name="departureDate"]`).value;
		if(departureDate){
			url.searchParams.set("departureDate", departureDate);
		} else {
			url.searchParams.delete("departureDate");
		}

		window.location.href = url.href;
	});
}
// End Form Search

// AI Tour Search
const aiSearchForm = document.querySelector("#ai-search-form");
if(aiSearchForm){
	const aiTourRequest = aiSearchForm.querySelector("#ai-tour-request");
	const aiSearchButton = aiSearchForm.querySelector("[type='submit']");
	const aiTourResults = document.querySelector("[ai-tour-results]");
	const aiTourMessage = aiTourResults.querySelector("[ai-tour-message]");
	const aiTourSuggestions = aiTourResults.querySelector("[ai-tour-suggestions]");

	aiSearchForm.addEventListener("submit", async (event) => {
		event.preventDefault();
		const request = aiTourRequest.value.trim();
		if(!request){
			aiTourRequest.focus();
			aiTourResults.hidden = false;
			aiTourMessage.textContent = "Hãy mô tả điểm đến, thời lượng hoặc ngân sách bạn mong muốn.";
			return;
		}

		aiSearchButton.disabled = true;
		aiSearchButton.classList.add("is-loading");
		aiTourResults.hidden = false;
		aiTourMessage.textContent = "AI đang phân tích yêu cầu...";
		aiTourSuggestions.replaceChildren();

		try{
			const response = await fetch("/search/ai", {
				method: "POST",
				headers: {
					"Content-Type": "application/json"
				},
				body: JSON.stringify({ request })
			});

			if(response.redirected && new URL(response.url).pathname === "/account/login"){
				window.location.href = response.url;
				return;
			}
			if(!response.headers.get("content-type")?.includes("application/json")){
				throw new Error("Phiên đăng nhập có thể đã hết hạn. Vui lòng đăng nhập lại.");
			}

			const data = await response.json();
			if(!response.ok || data.code === "ERROR"){
				throw new Error(data.message || "Không thể phân tích yêu cầu.");
			}

			aiTourMessage.textContent = data.message;
			(data.suggestions || []).forEach((suggestion) => {
				const button = document.createElement("button");
				button.type = "button";
				button.className = "ai-tour-suggestion";
				button.textContent = suggestion;
				button.addEventListener("click", () => {
					aiTourRequest.value = suggestion;
					aiTourRequest.focus();
				});
				aiTourSuggestions.appendChild(button);
			});

			if(data.code === "SUCCESS"){
				if(typeof data.searchUrl !== "string" || !data.searchUrl.startsWith("/search?")){
					throw new Error("AI trả về bộ lọc tìm kiếm không hợp lệ.");
				}
				window.location.assign(data.searchUrl);
			}
		}
		catch(error){
			aiTourMessage.textContent = error.message || "Không thể tìm tour lúc này. Vui lòng thử lại.";
		}
		finally{
			aiSearchButton.disabled = false;
			aiSearchButton.classList.remove("is-loading");
		}
	});
}
// End AI Tour Search

// Box Tour Detail
const boxTourDetail = document.querySelector(".box-tour-detail");
if(boxTourDetail){
	const inputStockAdult = boxTourDetail.querySelector("[input-stock-adult]");
	const inputStockChildren = boxTourDetail.querySelector("[input-stock-children]");
	const inputStockBaby = boxTourDetail.querySelector("[input-stock-baby]");

	const drawBoxDetail = () => {
		const quantityAdult = parseInt(inputStockAdult.value);
		const quantityChildren = parseInt(inputStockChildren.value);
		const quantityBaby = parseInt(inputStockBaby.value);

		const stockAdult = boxTourDetail.querySelector("[stock-adult]");
		const stockChildren = boxTourDetail.querySelector("[stock-children]");
		const stockBaby = boxTourDetail.querySelector("[stock-baby]");

		const priceAdult = parseInt(inputStockAdult.getAttribute("price"));
		const priceChildren = parseInt(inputStockChildren.getAttribute("price"));
		const priceBaby = parseInt(inputStockBaby.getAttribute("price"));
		const totalPrice = priceAdult * quantityAdult + priceChildren * quantityChildren + priceBaby * quantityBaby;
		
		const elementTotalPrice = boxTourDetail.querySelector("[total-price]");
		elementTotalPrice.innerHTML = totalPrice.toLocaleString("vi-VN");

		stockAdult.innerHTML = quantityAdult;
		stockChildren.innerHTML = quantityChildren;
		stockBaby.innerHTML = quantityBaby;
	}

	inputStockAdult.addEventListener("change", drawBoxDetail);
	inputStockChildren.addEventListener("change", drawBoxDetail);
	inputStockBaby.addEventListener("change", drawBoxDetail);

	const buttonAddCart = boxTourDetail.querySelector(".inner-button-add-cart");
	buttonAddCart.addEventListener("click", () => {
		const tourId = buttonAddCart.getAttribute("tour-id");
		const quantityAdult = parseInt(inputStockAdult.value);
		const quantityChildren = parseInt(inputStockChildren.value);
		const quantityBaby = parseInt(inputStockBaby.value);
		const locationFrom = boxTourDetail.querySelector("[location-from]").value;

		if(quantityAdult > 0 || quantityChildren > 0 || quantityBaby > 0){
			const cartItem = {
				tourId: tourId,
				quantityAdult: quantityAdult,
				quantityChildren: quantityChildren,
				quantityBaby: quantityBaby,
				locationFrom: locationFrom,
				checked: true
			};

			const cart = JSON.parse(localStorage.getItem("cart"));
			const indexExistingItem = cart.findIndex(item => item.tourId === tourId);
			if(indexExistingItem != -1){
				cart[indexExistingItem] = cartItem;
			} else {
				cart.push(cartItem);
			}
			localStorage.setItem("cart", JSON.stringify(cart));
			window.location.href = "/cart";
		}
	});
}
// End Box Tour Detail

// Initial Cart
const cart = localStorage.getItem("cart");
if(!cart){
	localStorage.setItem("cart", JSON.stringify([]));
}
// End Initial Cart

// Mini Cart
const miniCart = document.querySelector("[mini-cart]");
if(miniCart){
	const cart = JSON.parse(localStorage.getItem("cart"));
	miniCart.innerHTML = cart.length;
}
// End Mini Cart

// Page Cart
const drawCart = () => {
	const cart = localStorage.getItem("cart");
	fetch('/cart/detail', {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
		},
		body: cart,
	})
		.then(res => res.json())
		.then(data => {
			if(data.code == "SUCCESS"){
				// Hiển thị item
				const htmlCart = data.cart.map(item => `
				<div class="inner-tour-item">
					<div class="inner-action">
						<button class="inner-delete" button-delete tour-id="${item.tourId}">
							<i class="fa-solid fa-xmark"></i>
						</button>
						<input class="inner-check" type="checkbox" ${item.checked ? "checked" : ""} input-check tour-id="${item.tourId}">
					</div>
					<div class="inner-product">
						<div class="inner-image">
							<a href="/tour/detail/${item.slug}">
								<img alt="${item.name}" src="${item.avatar}">
							</a>
						</div>
						<div class="inner-content">
							<div class="inner-title">
								<a href="/tour/detail/${item.slug}">${item.name}</a>
							</div>
							<div class="inner-meta">
								<div class="inner-meta-item">Mã tour: <b>123456789</b>
								</div>
								<div class="inner-meta-item">Ngày khởi hành: <b>${item.departureDateFormat}</b>
								</div>
								<div class="inner-meta-item">Khởi hành tại: <b>${item.locationFromName}</b>
								</div>
							</div>
						</div>
					</div>
					<div class="inner-quantity">
						<div class="inner-label">Số lượng hành khách</div>
						<div class="inner-list">
							<div class="inner-item">
								<div class="inner-item-label">Người lớn:</div>
								<input 
									class="inner-item-input" 
									value="${item.quantityAdult}" 
									min="0" 
									max="${item.stockAdult}" 
									type="number" 
									name="quantityAdult" 
									input-quantity 
									tour-id="${item.tourId}"
								>
								<div class="inner-item-price">
									<span>${item.quantityAdult}</span>
									<span>x</span>
									<span class="inner-highlight">${item.newPriceAdult.toLocaleString("vi-VN")}</span>
								</div>
							</div>
							<div class="inner-item">
								<div class="inner-item-label">Trẻ em:</div>
								<input 
									class="inner-item-input" 
									value="${item.quantityChildren}" 
									min="0" 
									max="${item.stockChildren}" 
									type="number"
									name="quantityChildren" 
									input-quantity 
									tour-id="${item.tourId}"
								>
								<div class="inner-item-price">
									<span>${item.quantityChildren}</span>
									<span>x</span>
									<span class="inner-highlight">${item.newPriceChildren.toLocaleString("vi-VN")}</span>
								</div>
							</div>
							<div class="inner-item">
								<div class="inner-item-label">Em bé:</div>
								<input 
									class="inner-item-input" 
									value="${item.quantityBaby}" 
									min="0" 
									max="${item.stockBaby}" 
									type="number"
									name="quantityBaby" 
									input-quantity 
									tour-id="${item.tourId}"
								>
								<div class="inner-item-price">
									<span>${item.quantityBaby}</span>
									<span>x</span>
									<span class="inner-highlight">${item.newPriceBaby.toLocaleString("vi-VN")}</span>
								</div>
							</div>
						</div>
					</div>
				</div>	
				`)

				const cartList = pageCart.querySelector("[cart-list]");
				cartList.innerHTML = htmlCart.join("");

				// Hết hiển thị item
				miniCart.innerHTML = data.cart.length;

				// Cập nhật lại cart trong localStorage
				localStorage.setItem("cart", JSON.stringify(data.cart));
				// Hết Cập nhật lại cart trong localStorage

				// Tính tổng tiền
				const subTotalPrice = data.cart.reduce((total, item) => {
					if(item.checked) {
						return total + (item.quantityAdult * item.newPriceAdult) + (item.quantityChildren * item.newPriceChildren) + (item.quantityBaby * item.newPriceBaby);
					} else {
						return total;
					}
				}, 0);

				const discount = 0;
				const totalPrice = subTotalPrice - discount;

				const elementCartSubTotal = pageCart.querySelector("[cart-sub-total]");
				const elementCartDiscount = pageCart.querySelector("[cart-discount]");
				const elementCartTotal = pageCart.querySelector("[cart-total]");

				elementCartSubTotal.innerHTML = subTotalPrice.toLocaleString("vi-VN");
				elementCartDiscount.innerHTML = discount.toLocaleString("vi-VN");
				elementCartTotal.innerHTML = totalPrice.toLocaleString("vi-VN");
				// Hết tính tổng tiền

				// Sự kiện cập nhật lại số lượng
				const listInputQuantity = pageCart.querySelectorAll("[input-quantity]");
				listInputQuantity.forEach(input => {
					input.addEventListener("change", () => {
						const tourId = input.getAttribute("tour-id");
						const name = input.getAttribute("name");
						const quantity = parseInt(input.value);
						const cart = JSON.parse(localStorage.getItem("cart"));

						const index = cart.findIndex(item => item.tourId == tourId);
						if(index != -1){
							cart[index][name] = quantity;
							localStorage.setItem("cart", JSON.stringify(cart));
							drawCart();
						}
					});
				});
				// Hết Sự kiện cập nhật lại số lượng

				// Xóa tour khỏi giỏ hàng
				const listButtonDelete = document.querySelectorAll("[button-delete]");
				listButtonDelete.forEach(button => {
					button.addEventListener("click", () => {
						const tourId = button.getAttribute("tour-id");
						const cart = JSON.parse(localStorage.getItem("cart"));
						const index = cart.findIndex(tour => tour.tourId == tourId);
      			cart.splice(index, 1);
						localStorage.setItem("cart", JSON.stringify(cart));
						drawCart();
					});
				})
				// Hết Xóa tour khỏi giỏ hàng

				// Sự kiện chọn checkbox
				const listInputCheck = document.querySelectorAll("[input-check]");
				listInputCheck.forEach(input => {
					input.addEventListener("change", () => {
						const tourId = input.getAttribute("tour-id");
						const checked = input.checked;
						const cart = JSON.parse(localStorage.getItem("cart"));
						const index = cart.findIndex(item => item.tourId == tourId);
						if(index != -1){
							cart[index].checked = checked;
							localStorage.setItem("cart", JSON.stringify(cart));
							drawCart();
						}
					});
				})
				// Hết Sự kiện chọn checkbox
			}
		});	
}

const pageCart = document.querySelector("[page-cart]");
if(pageCart){
	drawCart();
}
// End Page Cart

// Client Pagination
const clientPagination = document.querySelector("[client-pagination]");
if(clientPagination){
	const buttons = clientPagination.querySelectorAll("[data-page]");
	buttons.forEach((button) => {
		button.addEventListener("click", () => {
			if(button.disabled || button.classList.contains("active")) return;
			const targetPage = parseInt(button.getAttribute("data-page"), 10);
			if(Number.isNaN(targetPage) || targetPage < 1) return;
			const url = new URL(window.location.href);
			if(targetPage > 1){
				url.searchParams.set("page", targetPage);
			} else {
				url.searchParams.delete("page");
			}
			window.location.href = url.href;
		});
	});
}
// End Client Pagination