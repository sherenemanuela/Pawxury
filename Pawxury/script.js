// variables
const cartBtn = document.querySelector(".cart-btn");
const closeCartBtn = document.querySelector(".close-cart");
const clearCartBtn = document.querySelector(".clear-cart");
const cartDOM = document.querySelector(".cart");
const cartOverlay = document.querySelector(".cart-overlay");
const cartItems = document.querySelector(".cart-items");
const cartTotal = document.querySelector(".cart-total");
const cartContent = document.querySelector(".cart-content");
const productsDOM = document.querySelector(".products-container");
const paymentBtn = document.querySelector(".metode-pembayaran");
const paymentOverlay = document.querySelector(".payment-overlay");
const paymentDOM = document.querySelector(".payment");
const closePaymentBtn = document.querySelector(".close-payment");
const detailPesananBtn = document.querySelector(".detail-btn");
const detailPesananOverlay = document.querySelector(".detailPesanan-overlay");
const detailPesananDOM = document.querySelector(".detail-pesanan");

let order = JSON.parse(localStorage.getItem('order')) || [];;
let buttonsDOM = [];
let cart = [];

class Products{
    async getProducts(){
        try{
            let result = await fetch('products.json');
            let products = await result.json();
            return products;
        } catch (error){
            console.log(error);
        }
    }
}

function formatPrice(price){
  return (price.toLocaleString("id-ID", {
      style:"currency", 
      currency:"IDR", 
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,}));
}

function countAvgRating(ratings){
  let sum = 0;
  ratings.forEach((rating) => {
    sum += rating;
  });

  return (sum / ratings.length).toFixed(1);
}

function getLocation(location){
  if(location.length > 8)
    return (location.substring(0, 7) + "...")
}

function reduceQty(){
    let qty = parseInt(document.getElementById('qty').innerHTML) - 1;
    if(qty > 0)
        document.getElementById('qty').innerHTML = qty - 1;
}

function increaseQty(){
    document.getElementById('qty').innerHTML = parseInt(document.getElementById('qty').innerHTML) + 1;
}

function displayProductDetails(products, id, idx){
    
    let detailDOM = document.getElementById(id);

    detailDOM.innerHTML = `
    <div class="product-info">
        <div class="info-img">
            <img src="${products[idx].image}">
        </div>
        <div class="product-detail">
            <div class="title-text left-text">
                <p>${products[idx].name}</p>
                <div class="title-underline"></div>
            </div>
            <p class="detail-price">${formatPrice(products[idx].price)}</p>
            <div class="detail-store">
                <div class="circle-frame">
                    <img src="">
                </div>
                <p class="desc-text">${products[idx].storeName}</p>
            </div>
            <div class="detail-location d-flex align-items-center">
                <i class="fa fa-location-pin"></i>
                <p>${products[idx].location}</p>
            </div>
            <div class="rate d-flex align-items-center">
                <i class="fa fa-star"></i>
                <p>${countAvgRating(products[idx].rating)}</p>
            </div>
        </div>
        <div class="atur-pesanan">
            <p>Atur pesanan</p>
            <div class="jumlah-pesanan d-flex justify-content-between">
                <span onclick="reduceQty()">-</span>
                <span id="qty">1</span>
                <span onclick="increaseQty()">+</span>
            </div>
            <button class="button" id="addCartBtn">+ Keranjang</button>
        </div>
    </div>
    <div class="deskripsi">
        <p class="desc-text" id="desc">Deskripsi</p>
        <p>${products[idx].description}</p>
    </div>
    <div class="ulasan" id="review-section">
        <p class="desc-text">Ulasan</p>
    </div>
    `
    showUserReviews(products[idx]);

    getBagButtons(products[idx]);
}

function showUserReviews(product){

    let reviewDOM = document.getElementById('review-section');

    for(let i = 0; i < product.review.length; i++){
        const div = document.createElement('div');
        div.classList.add('kotak');
        div.classList.add('d-flex');
        div.classList.add('align-items-center');
        div.id = 'user-review';
        div.innerHTML = `
            <div class="circle-frame">
                <img src="">
            </div>
            <div class="rating">
                <div class="stars-outer">
                    <div class="stars-inner" id="${product.category + product.id + i + 'review'}"></div>
                </div>
                <p>${product.user[i]}</p>
            </div>
            <p>${product.review[i]}</p>
        `
        reviewDOM.appendChild(div) 
        getRatings(product, i);
    }
}

function getRatings(product, idx) {
    const starPercentage = (product.rating[idx] / 5) * 100;
    const starPercentageRounded = `${Math.round(starPercentage / 10) * 10}%`;
    document.getElementById(product.category + product.id + idx + 'review').style.width = starPercentageRounded;
}

function updatePaymentMethod(id){
    let paymentMethods = ["Transfer Bank (Verifikasi Manual)", "Transfer Bank Virtual Account", "Kartu Kredit / Debit"]
    paymentOverlay.classList.remove('transparentBcg');
    paymentDOM.classList.remove('show');
    document.getElementById('payment-text').innerText = paymentMethods[id - 1];
}

let konsul;
function determineDoctorBill(id){
    if(id == "on-consul"){
        document.getElementById('doctor-bill').innerHTML = "Rp 75.000";
        konsul = 75000;
    }
    else{
        document.getElementById('doctor-bill').innerHTML = "Rp 100.000";
        konsul = 100000;
    }
}

function showOrders(){
    let checkoutDOM = document.getElementById('summary-item');

    for(let i = 0; i < cart.length; i++){
        const div = document.createElement('div');
        div.classList.add('product-checkout-cont');
        div.innerHTML =  `
            <div class="store-name">
                <i class="fa-solid fa-house"></i>
                <p>${cart[i].storeName}</p>
            </div>
            <div class="product-checkout">
                <div class="checkout-img">
                    <img src="${cart[i].image}">
                </div>
                <div class="product-checkout-info">
                    <p>${cart[i].name}</p>
                    <p>${formatPrice(cart[i].price)}</p>
                </div>
            </div>
        `
        checkoutDOM.prepend(div);
    }
}

var checkoutTotal = 0;

function showOrderSummary(){
    let checkoutDOM = document.getElementById('summary');
    const div = document.createElement('div');
    div.classList.add('ringkasan-pesanan');
    div.innerHTML =  `
        <p>Ringkasan Pesanan</p>
        <div class="total-harga d-flex justify-content-between">
            <p>Total Harga</p>
            <p>${cartTotal.innerHTML}</p>
        </div>
        <div class="total-kirim d-flex justify-content-between">
            <p>Total Ongkos Kirim</p>
            <p>Rp 10.000</p>
        </div>
        <hr>
        <div class="total-tagihan d-flex justify-content-between">
            <p>Total Tagihan</p>
            <p>${formatPrice(checkoutTotal + 10000)}</p>
        </div>
        <a href="pesanan.html">
            <button class="button" id="addCartBtn" onclick="checkoutOrder()">Bayar</button>
        </a>
    `
    checkoutDOM.append(div);
}

function generateNomorPesanan(){
    const characters ='0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    let charactersLength = characters.length;
    let result = 'P';
    for ( let i = 0; i < 5; i++ ) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    result += '-'
    for ( let i = 0; i < 5; i++ ) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
}

function getOrderDate(){
    let months = ["Januari", "Febuari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"];
    let date = new Date();
    return date.getDate() + ' ' + months[date.getMonth()] + ' ' + date.getFullYear();
}

function checkoutOrder(){
    let payment = document.getElementById('payment-text').innerText;
    let ongkir = 10000;
    let date = getOrderDate();
    let nomorPesanan = generateNomorPesanan();
    order.push({'cart': cart, ongkir, nomorPesanan, date, payment});
    Storage.saveOrder();
    clearCart();
}

function checkoutDokter(){
    let ongkir = 0;
    let date = getOrderDate();
    let product = [{
        'name':'Dokter Hewan',
        'price': konsul,
        'image':'Asset/dokterhewan.png',
        'amount': 1
    }];
    let payment = document.getElementById('payment-text').innerText;
    let nomorPesanan = generateNomorPesanan();
    order.push({'cart': product, ongkir, nomorPesanan, payment, date});
    Storage.saveOrder();
    clearCart();
}

function clearCart(){
    let cartItems = cart.map(item => item.id);
    cartItems.forEach(id => removeItems(id));
    console.log(cartContent.children);
    while(cartContent.children.length > 0){
        cartContent.removeChild(cartContent.children[0]);
    }
    hideCart();
}

// class UI{
    function displayProducts(products, category){

        let result = '';

        for(let i = 0; i < products.length; i++){
            if(products[i].category == category){
                result += `
                <a href="${products[i].fileName}">
                    <div class="products-box">
                        <div class="product-img">
                            <img src="${products[i].image}">
                        </div>
                        <p class="desc-text">${products[i].name}</p>
                        <p class="product-price">${formatPrice(products[i].price)}</p>
                        <div class="brief-desc">
                            <div class="location-brief">
                                <i class="fa fa-location-pin"></i>
                                <p>${getLocation(products[i].location)}</p>
                            </div>
                            <div class="rate">
                                <i class="fa fa-star"></i>
                                <p>${countAvgRating(products[i].rating)}</p>
                            </div>
                        </div>
                    </div>
                </a>
                `
            }
        }
        productsDOM.innerHTML = result;
    }

    function toggleMobileNavbar(){
      $("#hamburger").click(function(){
         $(this).toggleClass("open")
         $("#nav-links").toggle("fast");
      });
    }

    function getBagButtons(product){
        let button = document.getElementById('addCartBtn');
        let id = product.id;
        let inCart = cart.find(item => item.id === id);

        if(inCart){
            button.disabled = true;
        }

        button.addEventListener('click', (event) => {
            event.target.disabled = true;
            let cartItem = {...Storage.getProduct(id), amount: parseInt(document.getElementById('qty').innerHTML)};
            cart = [...cart, cartItem];
            Storage.saveCart(cart);
            setCartValues(cart);
            addCartItem(cartItem);
            showCart();
        });
    }

    function setCartValues(cart){
        let tempTotal = 0;
        let itemsTotal = 0;
        cart.map(item => {
            tempTotal += item.price * item.amount;
            itemsTotal += item.amount;
        })
        checkoutTotal = tempTotal;
        cartTotal.innerText = formatPrice(tempTotal).substring(3);
        cartItems.innerText = itemsTotal;
    }

    function addCartItem(item){
        const div = document.createElement('div');
        div.classList.add('cart-item');
        div.innerHTML = `
        <img src="${item.image}" alt="product">
        <div>
            <h4>${item.name}</h4>
            <h5>${formatPrice(item.price)}</h5>
            <span class="remove-item" data-id=${item.id}>remove</span>
        </div>
        <div>
            <i class="fas fa-chevron-up" data-id=${item.id}></i>
            <p class="item-amount">${item.amount}</p>
            <i class="fas fa-chevron-down" data-id=${item.id}></i>
        </div>
        `
        cartContent.appendChild(div);
    }

    function showCart(){
        cartOverlay.classList.add('transparentBcg');
        cartDOM.classList.add('show');
    }

    function showPaymentMethod(){
      paymentOverlay.classList.add('transparentBcg');
      paymentDOM.classList.add('show');
    }

    function hidePaymentMethod(){
        paymentOverlay.classList.remove('transparentBcg');
        paymentDOM.classList.remove('show');
    }

    function setupAPP(){
        toggleMobileNavbar();
        cart = Storage.getCart();
        setCartValues(cart);
        populateCart(cart);
        cartBtn.addEventListener('click', showCart);
        closeCartBtn.addEventListener('click', hideCart);
        try{
            paymentBtn.addEventListener('click', showPaymentMethod);
            closePaymentBtn.addEventListener('click', hidePaymentMethod);
        } catch(e){}
    }
    
    function populateCart(cart){
        cart.forEach(item => addCartItem(item));
    }

    function hideCart(){
        cartOverlay.classList.remove('transparentBcg');
        cartDOM.classList.remove('show')
    }

    function cartLogic(){
        cartContent.addEventListener('click', event => {
           if(event.target.classList.contains("remove-item")){
               let removeItem = event.target;
               let id = removeItem.dataset.id;
               cartContent.removeChild(removeItem.parentElement.parentElement);
               removeItems(id);
           }
           else if(event.target.classList.contains("fa-chevron-up")){
               let addAmount = event.target;
               let id = addAmount.dataset.id;
               let tempItem = cart.find(item => item.id === id);
               tempItem.amount += 1;
               Storage.saveCart(cart);
               setCartValues(cart);
               addAmount.nextElementSibling.innerText = tempItem.amount;
           }
           else if(event.target.classList.contains("fa-chevron-down")){
               let lowerAmount = event.target;
               let id = lowerAmount.dataset.id;
               let tempItem = cart.find(item => item.id === id);
               tempItem.amount -= 1;
               if(tempItem.amount > 0){
                    Storage.saveCart(cart);
                    setCartValues(cart);
                    lowerAmount.previousElementSibling.innerText = tempItem.amount;
               }
               else{
                   cartContent.removeChild(lowerAmount.parentElement.parentElement);
                    removeItems(id);
                }
           }
        });
    }

    function removeItems(id){
        cart = cart.filter(item => item.id !== id);
        setCartValues(cart);
        Storage.saveCart(cart);
        let button = getSingleButton(id);
    }

    function getSingleButton(id){
        return buttonsDOM.find(button => button.dataset.id === id);
    }

function isProductPage(categories){
    for(let i = 0; i < categories.length; i++){
        if(document.getElementById(categories[i]))
            return categories[i];
    }
    return false;
}

function isProductDetail(){
    let detail = false;

    try {
        detail = document.getElementsByClassName('detail')[0].id;
    }catch(e){};

    if(detail) return detail;
    return false;
}

function showDetailPesanan(idx){
    detailPesananOverlay.classList.add('transparentBcg');
    let orders = Storage.getOrder();
    let isi = document.querySelector('#list-produk');
    let order = orders[idx].cart;

    isi.innerHTML = `
        <h6>${orders[idx].nomorPesanan} | ${orders[idx].date}</h6>
        <div class="toko">
            <img src="Asset/store.png" alt="">
            <p>PawStore</p>
        </div>
    `

    for(let i = 0; i < order.length; i++){
        const div = document.createElement('div');
        div.classList.add('detail-pesanan');
        div.innerHTML = `
            <div class="lihat-detail">
                <img src="${order[i].image}" class="detail-img" alt="">
                <div class="rincian">
                    <h7>${order[i].name}</h7>
                    <p>${formatPrice(order[i].price)}</p>
                </div>
                <p>${order[i].amount} x ${formatPrice(order[i].price)}</p>
            </div>
        `
        isi.append(div);
    }

    const div = document.createElement('div');
    div.classList.add('info-penerima');
    div.innerHTML = `
         <div class="alamat-detail">
            <h5>Alamat Penerima</h3>
            <p>${user.address[0].infoPenerima}</p>
            <p>${user.address[0].alamatLengkap}</p>
        </div>
        <div class="pembayaran-detail">
            <h5>Detail Pembayaran</h5>
            <p>Metode Pembayaran : ${orders[idx].payment}</p>
            <p>Total Harga : ${formatPrice(getTotalHarga(order))}</p>
            <p>Ongkos Kirim : ${formatPrice(orders[idx].ongkir)}</p>
            <p>Total Pembelian : ${formatPrice(orders[idx].ongkir + getTotalHarga(order))}</p>
        </div>
    `
    isi.append(div);
}

function getTotalHarga(order){
    let sum = 0;
    for(let i = 0; i < order.length; i++){
        sum += order[i].price;
    }
    return sum;
}

function showPesanan(){

    let orders = Storage.getOrder();
    let isi = document.getElementsByClassName('isi')[0];

    if(orders.length > 0){
        document.querySelector('.isi > p').remove();

        for(let i = 0; i < orders.length; i++){
            const div = document.createElement('div');
            div.classList.add('pesanan');
            div.innerHTML = `
                    <h6>${order[i].nomorPesanan} &nbsp;&nbsp;|&nbsp;&nbsp; ${order[i].date}</h6>
                    <div class="toko">
                        <img src="Asset/store.png" alt="">
                        <p>PawStore</p>
                    </div>
                    <div class="history-pesanan">
                        <div class="order-img">
                            <img src="${order[i].cart[0].image}" alt="">
                        </div>
                        <div class="rincian">
                            <h7 class="nama-pesanan">${order[i].cart[0].name}</h7>
                        </div>
                        <div class="rincian-responsive">
                            <div class="rincian-tagihan">
                                <p>Total Tagihan</p>
                                <h6>${formatPrice(calculateTotalPrice(order[i].cart))}</h6>
                            </div>
                            <input type="button" class="detail-btn" value="Lihat Detail" onclick="showDetailPesanan(${i})">
                        </div>
                    </div>
                    <hr>
            `
            isi.prepend(div);
            checkOtherProducts(order[i]);
        }
    }
}

function checkOtherProducts(order) {
    let otherProduct = order.length - 1;

    if(otherProduct > 0) {
        const div = document.createElement('p');
        div.innerText = '+ ' + otherProduct + ' produk lainnya';
        let otherProductDOM = document.getElementsByClassName('rincian');
        otherProductDOM[0].appendChild(div);
    }
}

function calculateTotalPrice(order) {
    let sum = 0;
    for(let i = 0; i < order.length; i++) {
        sum += order[i].price;
    }
    return sum;
}

function hideDetailPesanan(){
    detailPesananOverlay.classList.remove('transparentBcg');
    let DOM = document.getElementsByClassName('detail-pesanan');
    for(let i = 1; i < DOM.length; i++){
        DOM[i].remove();
    }
    document.getElementsByClassName('info-penerima')[0].remove();
}

class Storage {
    static saveProducts(products){
        localStorage.setItem("products", JSON.stringify(products));
    }
    
    static getProduct(id){
        let products = JSON.parse(localStorage.getItem('products'));
        return products.find(product => product.id === id);
    }

    static saveCart(cart){
        localStorage.setItem("cart", JSON.stringify(cart));
    }

    static getCart(){
        return localStorage.getItem('cart') ? JSON.parse(localStorage.getItem('cart')) : [];
    }

    static saveOrder(){
        localStorage.setItem('order', JSON.stringify(order));
    }

    static getOrder(){
        return localStorage.getItem('order') ? JSON.parse(localStorage.getItem('order')) : [];
    }

    static saveUser(user){
        localStorage.setItem('user', JSON.stringify(user));
    }
}

let user = JSON.parse(localStorage.getItem('activeUser'));

function showProfil(){
    let profileData = [user.fName, user.email, user.phone, user.dob];
    let profile = ['nama', 'email', 'phone', 'dob'];

    for(let i = 0; i < profile.length; i++){
        let DOM = document.getElementsByClassName(profile[i])[0];
        if(profileData[i]){
            const p = document.createElement('p');
            p.innerText = profileData[i];
            DOM.appendChild(p);
        }
    }
}

function showAlamatPengiriman(){
    console.log("tes");
    if(user.address){
        let DOM = document.getElementById('isi-alamat');
        DOM.removeChild(DOM.firstElementChild);
        let result = ``;

        for(let i = 0; i < user.address.length; i++){
            const div = document.createElement('div'); 
            div.innerHTML = `
                <div>
                    <p>${user.address[i].infoPenerima}</p>
                    <p>${user.address[i].alamatLengkap}</p>
                </div>
                
            `
            DOM.prepend(div);
        }
    }
    
}

function showCard(){
    if(user.card){
        let DOM = document.getElementById('isi-kartu');
        DOM.removeChild(DOM.lastElementChild);
        let result = ``;

        for(let i = 0; i < user.card.length; i++){
            const div = document.createElement('div'); 
            div.innerHTML = `
                <div>
                    <p>${user.card[i].nama}</p>
                    <p>${user.card[i].nomor}</p>
                    <p>${user.card[i].tanggal}</p>
                    <p>${user.card[i].cvv}</p>
                </div>
            `
            DOM.append(div);
        }
    }
}

function showBankAccount(){
    if(user.bankAccount){
        let DOM = document.getElementById('isi-rekening');
        DOM.removeChild(DOM.lastElementChild);
        let result = ``;

        for(let i = 0; i < user.bankAccount.length; i++){
            const div = document.createElement('div'); 
            div.innerHTML = `
                <div>
                    <p>${user.bankAccount[i].nama}</p>
                    <p>${user.bankAccount[i].nomor}</p>
                    <p>${user.bankAccount[i].bank}</p>
                </div>
            `
            DOM.append(div);
        }
    }
}

function changeDataUI(type){
    let overlay = document.getElementsByClassName('modify-overlay')[0];
    console.log(overlay)
    overlay.classList.add('transparentBcg');

    switch(type){
        case 1:
            changeProfile(overlay);
            break;
        case 2:
            changeAddress(overlay);
            break;
        case 3:
            changeCreditCard(overlay);
            break;
        case 4:
            changeBankAccount(overlay);
            break;
    }
}

function changeBankAccount(overlay){
    overlay.innerHTML = `
    <div class="popup-center">
        <div class="modify">
            <div class="header" id="atur-rekening">
                <p>Atur Rekening Bank</p>
                <span class="close-popup" onclick="hidePopUp()">
                    <i class="fas fa-window-close"></i>
                </span>
            </div>
            <div class="isi-popup">
            </div>
        </div>
    </div>
    `
    let itemId = ['nama','nomor','bank'];
    let itemDesc = ['Nama lengkap pemilik rekening','No. rekening','Nama bank'];
    addTextOverlayItems(itemId, itemDesc);
    addSubmitButton();
}

function changeCreditCard(overlay){
    overlay.innerHTML = `
    <div class="popup-center">
        <div class="modify">
            <div class="header" id="atur-kartu">
                <p>Atur Kartu Kredit/Debit</p>
                <span class="close-popup" onclick="hidePopUp()">
                    <i class="fas fa-window-close"></i>
                </span>
            </div>
            <div class="isi-popup">
            </div>
        </div>
    </div>
    `
    let itemId = ['nama','nomor','tanggal','cvv'];
    let itemDesc = ['Nama tertera di kartu','No. kartu','Tanggal akhir masa berlaku','Kode CVV'];
    addTextOverlayItems(itemId, itemDesc);
    addSubmitButton();
}

function changeAddress(overlay){
    overlay.innerHTML = `
    <div class="popup-center">
        <div class="modify">
            <div class="header" id="Alamat">
                <p id="atur-alamat">Atur Alamat</p>
                <span class="close-popup" onclick="hidePopUp()">
                    <i class="fas fa-window-close"></i>
                </span>
            </div>
            <div class="isi-popup">
            </div>
        </div>
    </div>
    `
    let itemId = ['nama','nomor','alamat','kelurahan','kecamatan','kota','provinsi','pos'];
    let itemDesc = ['Nama','Nomor Telepon','Alamat Lengkap','Kelurahan','Kecamatan','Kota','Provinsi','Pos'];
    addTextOverlayItems(itemId, itemDesc);
    addSubmitButton();
}

function changeProfile(overlay){
    overlay.innerHTML = `
    <div class="popup-center">
        <div class="modify">
            <div class="header" id="ubah-profil">
                <p>Ubah Profil</p>
                <span class="close-popup" onclick="hidePopUp()">
                    <i class="fas fa-window-close"></i>
                </span>
            </div>
            <div class="isi-popup">
                <div class="d-flex popup-item">
                    <label for="phone">Nomor Telepon</label>
                    <span>:&emsp;</span>
                    <br>
                    <input type="text" class="form-input" id="phone" name="phone">
                </div>
                <div class="date popup-item">
                    <div class="birthday-input">
                        <label for="birthday">Pilih hari</label>
                        <span>:&emsp;</span>
                        <input type="date" id="birthday" name="birthday">
                    </div>
                </div>
            </div>
        </div>
    </div>
    `
    addSubmitButton();
}

function addSubmitButton(){
    let inputs = document.getElementsByClassName('isi-popup')[0];

    const div = document.createElement('div');
    div.innerHTML = `
        <button class="account-btn" onclick="saveData()"><p>Simpan</p></button>
    `
    inputs.appendChild(div);
}

function addTextOverlayItems(itemId, itemDesc){
    let inputs = document.getElementsByClassName('isi-popup')[0];

    for(let i = 0; i < itemId.length; i++){
        const div = document.createElement('div');
        div.classList.add('d-flex');
        div.innerHTML = `
            <label for="${itemId[i]}">${itemDesc[i]}</label>
            <span>:&emsp;</span>
            <br>
            <input type="text" class="form-input" id="${itemId[i]}" name="${itemId[i]}">
        `
        inputs.appendChild(div);
    }
}

function hidePopUp(){
    let container = document.getElementsByClassName('modify-overlay')[0];
    container.innerHTML = '';
    container.classList.remove('transparentBcg');
}

function saveData(){
    
    if(document.getElementById('ubah-profil')){
        saveProfil();
    }
    else if(document.getElementById('atur-alamat')){
        saveAddress();
    }
    else if(document.getElementById('atur-kartu')){
        saveCard();
    }
    else if(document.getElementById('atur-rekening')){
        saveBankAccount();
    }
    
    hidePopUp();
}

function saveBankAccount(){
    let nama = document.getElementById('nama').value;
    let nomor = document.getElementById('nomor').value;
    let bank = document.getElementById('bank').value;

    user.bankAccount = [{nama, nomor, bank}];

    localStorage.setItem('activeUser', JSON.stringify(user));

    let userData = JSON.parse(localStorage.getItem('userData')) || [];

    for(let i = 0; i < userData.length; i++){
        if(userData[i].email == user.email){
            userData.splice(i, 1);
            userData.push(user);
            localStorage.setItem('userData', JSON.stringify(userData));
            break;
        }
    }

    location.reload();
}

function saveCard(){
    let nama = document.getElementById('nama').value;
    let nomor = document.getElementById('nomor').value;
    let tanggal = document.getElementById('tanggal').value;
    let cvv = document.getElementById('cvv').value;

    user.card = [{nama, nomor, tanggal, cvv}];

    localStorage.setItem('activeUser', JSON.stringify(user));

    let userData = JSON.parse(localStorage.getItem('userData')) || [];

    for(let i = 0; i < userData.length; i++){
        if(userData[i].email == user.email){
            userData.splice(i, 1);
            userData.push(user);
            localStorage.setItem('userData', JSON.stringify(userData));
            break;
        }
    }

    location.reload();
}

function saveAddress(){
    let nama = document.getElementById('nama').value;
    let nomor = document.getElementById('nomor').value;
    let lokasi = document.getElementById('alamat').value;
    let kelurahan = document.getElementById('kelurahan').value;
    let kecamatan = document.getElementById('kecamatan').value;
    let kota = document.getElementById('kota').value;
    let provinsi = document.getElementById('provinsi').value;
    let pos = document.getElementById('pos').value;
   
    let alamatLengkap = lokasi + ', ' + kelurahan + ', ' + kecamatan + ', ' + kota + ', ' + provinsi + ', ' + pos;
    let infoPenerima = nama + ', ' + nomor;

    user.address = [{infoPenerima, alamatLengkap}];

    localStorage.setItem('activeUser', JSON.stringify(user));

    let userData = JSON.parse(localStorage.getItem('userData')) || [];

    for(let i = 0; i < userData.length; i++){
        if(userData[i].email == user.email){
            userData.splice(i, 1);
            userData.push(user);
            localStorage.setItem('userData', JSON.stringify(userData));
            break;
        }
    }

    location.reload();
}

function saveProfil(){
    user.phone = document.getElementById('phone').value;
    user.dob = document.getElementById('birthday').value;

    localStorage.setItem('activeUser', JSON.stringify(user));

    let userData = JSON.parse(localStorage.getItem('userData')) || [];

    for(let i = 0; i < userData.length; i++){
        if(userData[i].email == user.email){
            userData.splice(i, 1);
            userData.push(user);
            localStorage.setItem('userData', JSON.stringify(userData));
            break;
        }
    }

    location.reload();
}

document.addEventListener("DOMContentLoaded", ()=>{

    const products = new Products();
    const categories = ["perawatan", "pelatihan", "kesehatan", "penitipan"];

    setupAPP();
    
    products.getProducts().then(products => {
        let cat = isProductPage(categories);
        let detail = isProductDetail();
        
        if(cat){
            displayProducts(products, cat);
        }
        else if(detail){
            let idx = detail.substring(detail.indexOf('-') + 1) - 1;
            displayProductDetails(products, detail, idx);
        }
        else if(document.getElementById('checkout')){
            showOrders();
            showOrderSummary();
            showAlamatKonsultasi();
        }
        else if(document.getElementById('pesanan')){
            showPesanan();
        }
        else if(document.getElementById('akun')){
            showProfil();
            showAlamatPengiriman();
            showCard();
            showBankAccount();
        }
        else if(document.getElementById('dokter-hewan')){
            showAlamatKonsultasi();
        }
        Storage.saveProducts(products);
    }).then(()=> {
        cartLogic();
    });
});

function showAlamatKonsultasi(){
    let DOM = document.getElementsByClassName('info')[0];

    let p = document.createElement('p');
    p.innerText = user.address[0].alamatLengkap;
    DOM.prepend(p);

    p = document.createElement('p');
    p.innerText = user.address[0].infoPenerima;
    DOM.prepend(p);
}