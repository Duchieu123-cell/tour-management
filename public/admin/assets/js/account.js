// Login form
const loginForm = document.querySelector("#login-form");
if(loginForm){
    const validation = new JustValidate("#login-form");

    validation
		.addField('#email', [
			{
				rule: 'required',
				errorMessage: 'Vui lòng nhập email của bạn'
			},
			{
				validator: (value) => value.trim() === 'admin' || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim()),
				errorMessage: 'Email không đúng định dạng'
			},
		])
        .addField('#password', [
			{
				rule: 'required',
				errorMessage: 'Vui lòng nhập mật khẩu'
			},
		])
        .onSuccess(( event ) => {
			const email = event.target.email.value;
            const password = event.target.password.value;
            const rememberPassword = event.target.rememberPassword.checked;

            const dataFinal = {
                email: email,
                password: password,
                rememberPassword: rememberPassword
            }
            fetch(`/${pathAdmin}/account/login`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(dataFinal)
            })
            .then(res => res.json())
            .then(data => {
                if(data.code === "SUCCESS"){
                    window.location.href = `/${pathAdmin}/dashboard`;
                }
                else{
                    alert(data.message);
                }
            })

			console.log(email);
            console.log(password);
            console.log(rememberPassword);
		});
}
// End Login form


// Register form
const registerForm = document.querySelector("#register-form");
if(registerForm){
    const validation = new JustValidate("#register-form");

    validation
        .addField('#fullName', [
            {
                rule: 'required',
                errorMessage: 'Vui lòng nhập họ tên của bạn'
            },
            {
                rule: 'minLength',
                value: 3,
                errorMessage: 'Độ dài ít nhất 3 ký tự'
            },
            {
                rule: 'maxLength',
                value: 50,
                errorMessage: 'Độ dài nhiều nhất 50 ký tự'
            },
        ])
		.addField('#email', [
			{
				rule: 'required',
				errorMessage: 'Vui lòng nhập email của bạn'
			},
			{
				rule: 'email',
				errorMessage: 'Email không đúng định dạng'
			},
		])
        .addField('#password', [
			{
				rule: 'required',
				errorMessage: 'Vui lòng nhập mật khẩu'
			},
            {
                validator: (value) => value.length >= 8,
                errorMessage: 'Mật khẩu bao gồm ít nhất 8 ký tự'
            },
            {
                validator: (value) => /[A-Z]/.test(value),
                errorMessage: 'Mật khẩu bao gồm ít nhất 1 chữ cái in hoa'
            },
            {
                validator: (value) => /[a-z]/.test(value),
                errorMessage: 'Mật khẩu bao gồm ít nhất 1 chữ cái in thường'
            },
            {
                validator: (value) => /\d/.test(value),
                errorMessage: 'Mật khẩu bao gồm ít nhất 1 số'
            },
            {
                validator: (value) => /[@$!%*?&]/.test(value),
                errorMessage: 'Mật khẩu bao gồm ít nhất 1 ký tự đặc biệt'
            },
		])
        .addField('#agreement', [
			{
				rule: 'required',
				errorMessage: 'Bạn phải đồng ý với các điều khoản và điều kiện'
			},
		])
        .onSuccess(( event ) => {
            const fullName = event.target.fullName.value;
			const email = event.target.email.value;
            const password = event.target.password.value;
            const agreement = event.target.agreement.checked;

            if(agreement){
                const dataFinal = {
                    fullName: fullName,
                    email: email,
                    password: password
                }
                fetch(`/${pathAdmin}/account/register`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify(dataFinal)
                })
                .then(res => res.json())
                .then(data => {
                    if(data.code === "SUCCESS"){
                        window.location.href = `/${pathAdmin}/account/register-initial`;
                    }
                    else{
                        alert(data.message);
                    }
                })
            }

            console.log(fullName);
			console.log(email);
            console.log(password);
            console.log(agreement);
        });
}       
// End Register form

// Forgot Password form
const forgotPasswordForm = document.querySelector("#forgot-password-form");
if(forgotPasswordForm){
    const validation = new JustValidate("#forgot-password-form");

    validation
		.addField('#email', [
			{
				rule: 'required',
				errorMessage: 'Vui lòng nhập email của bạn'
			},
			{
				validator: (value) => value.trim() === 'admin' || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim()),
				errorMessage: 'Email không đúng định dạng'
			},
		])
        .onSuccess(( event ) => {
			const email = event.target.email.value;

            const dataFinal = {
                email: email
            }
            fetch(`/${pathAdmin}/account/forgot-password`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(dataFinal)
            })
            .then(res => res.json())
            .then(data => {
                if(data.code === "SUCCESS"){
                    window.location.href = `/${pathAdmin}/account/otp-password?email=${email}`;
                }
                else{
                    alert(data.message);
                }
            })

			console.log(email);
		});
}
// End Forgot Password form


// OTP form
const otpForm = document.querySelector("#otp-form");
if(otpForm){
    const validation = new JustValidate("#otp-form");

    validation
		.addField('#otp', [
			{
				rule: 'required',
				errorMessage: 'Vui lòng nhập vào mã OTP'
			},
		])
        .onSuccess(( event ) => {
			const otp = event.target.otp.value;

            const urlParams = new URLSearchParams(window.location.search);
            const email = urlParams.get('email');

            const dataFinal = {
                email: email,
                otp: otp
            }
            fetch(`/${pathAdmin}/account/otp-password`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(dataFinal)
            })
            .then(res => res.json())
            .then(data => {
                if(data.code === "SUCCESS"){
                    window.location.href = `/${pathAdmin}/account/reset-password`;
                }
                else{
                    alert(data.message);
                }
            })
		});
}
//End OTP form


// Reset Password form
const resetPasswordForm = document.querySelector("#reset-password-form");
if(resetPasswordForm){
    const validation = new JustValidate("#reset-password-form");

    validation
		.addField('#password', [
			{
				rule: 'required',
				errorMessage: 'Vui lòng nhập mật khẩu'
			},
            {
                validator: (value) => value.length >= 8,
                errorMessage: 'Mật khẩu bao gồm ít nhất 8 ký tự'
            },
            {
                validator: (value) => /[A-Z]/.test(value),
                errorMessage: 'Mật khẩu bao gồm ít nhất 1 chữ cái in hoa'
            },
            {
                validator: (value) => /[a-z]/.test(value),
                errorMessage: 'Mật khẩu bao gồm ít nhất 1 chữ cái in thường'
            },
            {
                validator: (value) => /\d/.test(value),
                errorMessage: 'Mật khẩu bao gồm ít nhất 1 số'
            },
            {
                validator: (value) => /[@$!%*?&]/.test(value),
                errorMessage: 'Mật khẩu bao gồm ít nhất 1 ký tự đặc biệt'
            },
		])
        .addField('#confirm-password', [
            {
				rule: 'required',
				errorMessage: 'Vui lòng nhập xác nhận mật khẩu'
			},
            {
                validator: (value, fields) => {
                    const password = fields["#password"].elem.value;
                    return value == password;
                },
                errorMessage: "Mật khẩu xác nhận không khớp"
            }
        ])
        .onSuccess(( event ) => {
			const password = event.target.password.value;

            const dataFinal = {
                password: password
            }
            fetch(`/${pathAdmin}/account/reset-password`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(dataFinal)
            })
            .then(res => res.json())
            .then(data => {
                if(data.code === "SUCCESS"){
                    window.location.href = `/${pathAdmin}/dashboard`;
                }
                else{
                    alert(data.message);
                }
            })
		});
}
// End Reset Password form