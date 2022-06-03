var fullNameErrorMsg = document.getElementById("fullName-error");
var emailErrorMsg = document.getElementById("email-error");
var passwordErrorMsg = document.getElementById("password-error");
let fName, lName, email, password, userData;

function validateSignin(){
    userData = JSON.parse(localStorage.getItem('userData')) || [];

    if(!validateEmail()){
        return;
    }else if(!validatePassword()){
        return;
    }else{
        if(dataIsCorrect())
            window.location = "beranda.html";
    }
}

function validateSignup(){
    userData = JSON.parse(localStorage.getItem('userData')) || [];

    if(!validateFullName()){
        return;
    }else if(!validateEmail()){
        return;
    }else if(!validatePassword()){
        return;
    }else{
        if(!validateDuplicate())
            window.location = 'signin.html';
    }
}

function dataIsCorrect(){
    let user = null;

    for(let i = 0; i < userData.length; i++){
        if(userData[i].email.toLowerCase() == email && userData[i].password.toLowerCase() == password)
            user = userData[i];
    }

    if(!user){
        alert("Incorrect login credentials");
        return false;
    }
    else{
        localStorage.setItem('activeUser', JSON.stringify(user));
        return true;
    }
}

function validateDuplicate(){
    let exist = userData.length && JSON.parse(localStorage.getItem('userData')).some(user => 
        user.email.toLowerCase() == email.toLowerCase()
    );

    if(!exist){
        userData.push({fName, email, password});
        localStorage.setItem('userData', JSON.stringify(userData));
        alert("Akun berhasil dibuat.\n\nSilakan masuk dengan akun baru anda.");
    }
    else{
        alert("Akun sudah terdaftar!");
    }
}

function validateFullName(){
    fName = document.getElementById("full-name").value;

    if(!fName){
        fullNameErrorMsg.innerHTML = '❗ Nama lengkap harus diisi!';
        return false;
    }else if(fName.length < 3){
        fullNameErrorMsg.innerHTML = '❗ Nama lengkap harus lebih dari 3 huruf!';
        return false;
    }else if(fName.length > 20){
        fullNameErrorMsg.innerHTML = '❗ Nama lengkap tidak boleh lebih dari 20 huruf!';
        return false;
    }

    fullNameErrorMsg.innerHTML = '';
    return true;
}


function validateEmail(){
    email = document.getElementById("email").value;
    console.log()
    if(!email){
        emailErrorMsg.innerHTML = '❗ Email harus diisi!';
        document.getElementById("email").style.borderColor = "red";
        return false;
    }else if(email.indexOf("@")==-1 || email.indexOf(".")==-1){
        emailErrorMsg.innerHTML = '❗ Email invalid!';
        document.getElementById("email").style.borderColor = "red";
        return false;
    }
        
    emailErrorMsg.innerHTML ='';
    return true;

}

function validatePassword(){
    password = document.getElementById("password").value;

    if(!password){
        passwordErrorMsg.innerHTML = '❗ Kata sandi harus diisi!';
        return false;
    }else if(password.length < 8){
        passwordErrorMsg.innerHTML = '❗ Kata sandi tidak boleh kurang dari 8 karakter!';
        return false;
    }else if(password.length > 15){
        passwordErrorMsg.innerHTML = '❗ Kata sandi tidak boleh lebih dari 15 karakter!';
        return false;
    }

    passwordErrorMsg.innerHTML = '';
    return true;

}