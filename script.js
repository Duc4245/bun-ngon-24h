import { initializeApp } from "https://www.gstatic.com/firebasejs/12.12.0/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, onAuthStateChanged, signOut } 
from "https://www.gstatic.com/firebasejs/12.12.0/firebase-auth.js";

const firebaseConfig = {
    apiKey: "AIzaSyAdxKhklpQBddCWGSyQYM4mNmGP-OugOZ0",
    authDomain: "online-food-ordering-e8a1d.firebaseapp.com",
    projectId: "online-food-ordering-e8a1d",
    storageBucket: "online-food-ordering-e8a1d.firebasestorage.app",
    messagingSenderId: "632336127062",
    appId: "1:632336127062:web:04c1aa377dbe6066e817f7"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
window.auth = auth;

// giao diện UI cho đăng nhập :))
onAuthStateChanged(auth, (user) => {
    const userInfo = document.getElementById("user-info");

    if (user) {
        userInfo.innerHTML = `
            <div style="
                display:flex;
                align-items:center;
                gap:10px;
                background:#ffffff;
                padding:6px 10px;
                border-radius:20px;
                box-shadow:0 2px 8px rgba(0,0,0,0.1);
                font-size:14px;
            ">
                <i class="fas fa-user-circle" style="font-size:18px; color:#2ecc71;"></i>
                <span style="
                    max-width:150px;
                    overflow:hidden;
                    text-overflow:ellipsis;
                    white-space:nowrap;
                ">
                    ${user.email}
                </span>
                <button id="logout-btn" style="
                    border:none;
                    background:#e74c3c;
                    color:white;
                    padding:5px 10px;
                    border-radius:12px;
                    cursor:pointer;
                    font-size:12px;
                ">
                    Đăng xuất
                </button>
            </div>
        `;

        document.getElementById("logout-btn").onclick = () => signOut(auth);

    } else {
        userInfo.innerHTML = `
            <button onclick="window.scrollTo(0, 300)" style="
                background:#2ecc71;
                color:white;
                border:none;
                padding:6px 14px;
                border-radius:20px;
                cursor:pointer;
                font-weight:bold;
            ">
                Đăng nhập
            </button>
        `;
    }
});

window.login = () => {
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;
    signInWithEmailAndPassword(auth, email, password)
    .then(() => alert("Chào mừng bạn quay lại!"))
    .catch(err => alert("Lỗi: " + err.message));
};

window.register = () => {
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;
    createUserWithEmailAndPassword(auth, email, password)
    .then(() => alert("Đăng ký thành công!"))
    .catch(err => alert("Lỗi: " + err.message));
};

// thuận toán mua bán

let cart = [];
let currentProduct = null;

window.openAddModal = (name, price) => {
    currentProduct = { name, basePrice: price };
    document.getElementById('modal-product-name').innerText = name;
    document.getElementById('product-modal').style.display = 'flex';
};

window.closeModal = () => {
    document.getElementById('product-modal').style.display = 'none';
    document.getElementById('modal-note').value = "";
};

window.addToCartFinal = () => {
    const size = document.querySelector('input[name="size"]:checked').value;
    const note = document.getElementById('modal-note').value;

    let finalPrice = currentProduct.basePrice;
    if(size === 'S') finalPrice -= 5000;
    if(size === 'L') finalPrice += 10000;

    cart.push({ 
        name: currentProduct.name, 
        price: finalPrice, 
        size: size, 
        note: note 
    });

    renderCart();
    closeModal();
};

function renderCart() {
    const cartContent = document.getElementById("cart-content");
    const totalEl = document.getElementById("total-price");
    cartContent.innerHTML = "";
    let total = 0;

    cart.forEach((item, index) => {
        total += item.price;
        cartContent.innerHTML += `
            <div class="cart-item">
                <div>
                    <strong>${item.name}</strong> <small>(${item.size})</small><br>
                    <span style="font-size:12px; color:#777">${item.note || 'Không ghi chú'}</span>
                </div>
                <div style="text-align:right">
                    <span>${item.price.toLocaleString()}đ</span><br>
                    <i class="fas fa-trash-alt" onclick="removeItem(${index})" style="color:red; cursor:pointer"></i>
                </div>
            </div>
        `;
    });
    totalEl.innerText = total.toLocaleString();
}

window.removeItem = (index) => {
    cart.splice(index, 1);
    renderCart();
};

window.confirmOrder = async () => {
    if (!auth.currentUser) return alert("Vui lòng đăng nhập để đặt hàng!");
    if (cart.length === 0) return alert("Giỏ hàng của bạn đang trống!");

    const address = document.getElementById("address").value;
    const payment = document.getElementById("payment").value;
    if (!address) return alert("Vui lòng nhập địa chỉ!");

    try {
        await fetch("https://bun-ngon-24.onrender.com/order", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                user: auth.currentUser.email,
                items: cart,
                total: cart.reduce((t, i) => t + i.price, 0),
                address: address,
                payment: payment,
                date: new Date().toLocaleString()
            })
        });

        alert("🎉 Đặt hàng thành công!");
        cart = [];
        renderCart();
    } catch (e) {
        alert("Lỗi kết nối Server!");
    }
};

async function loadData() {
    let foods = [];
    let drinks = [];

    try {
        const resF = await fetch("https://bun-ngon-24.onrender.com/foods");
        foods = await resF.json();

        const fContainer = document.getElementById("foods");
        foods.forEach(item => {
            fContainer.innerHTML += `
                <div class="card">
                    <img src="${item.image || 'https://via.placeholder.com/300x200?text=Food'}">
                    <div class="card-body">
                        <h4>${item.name_vi || item.name}</h4>
                        <div class="price">${item.price.toLocaleString()} VND</div>
                        <button class="btn-add" onclick="openAddModal('${item.name}', ${item.price})">
                            CHỌN MUA
                        </button>
                    </div>
                </div>`;
        });

        const resD = await fetch("https://bun-ngon-24.onrender.com/drinks");
        drinks = await resD.json();

        const dContainer = document.getElementById("drinks");
        drinks.forEach(item => {
            dContainer.innerHTML += `
                <div class="card">
                    <img src="${item.image || 'https://via.placeholder.com/300x200?text=Drink'}">
                    <div class="card-body">
                        <h4>${item.name_vi || item.name}</h4>
                        <div class="price">${item.price.toLocaleString()} VND</div>
                        <button class="btn-add" onclick="openAddModal('${item.name}', ${item.price})">
                            CHỌN MUA
                        </button>
                    </div>
                </div>`;
        });

    } catch (e) {
        console.error("Data error", e);
    }

    // CATEGORY VI (FOODS + DRINKS)
    const categories = new Set();

    foods.forEach(item => {
        if (item.category_vi) categories.add(item.category_vi);
        else if (item.category) categories.add(item.category);
    });

    drinks.forEach(item => {
        if (item.category_vi) categories.add(item.category_vi);
        else if (item.category) categories.add(item.category);
    });

    const categoryList = document.getElementById("category-list");

    categories.forEach(cat => {
        categoryList.innerHTML += `<li onclick="filterCategory('${cat}')">${cat}</li>`;
    });

    window.filterCategory = (cat) => {
        const fContainer = document.getElementById("foods");
        const dContainer = document.getElementById("drinks");

        fContainer.innerHTML = "";
        dContainer.innerHTML = "";

        fetch("https://bun-ngon-24.onrender.com/foods")
            .then(res => res.json())
            .then(data => {
                data
                .filter(item => (item.category_vi || item.category) === cat)
                .forEach(item => {
                    fContainer.innerHTML += `
                        <div class="card">
                            <img src="${item.image || 'https://via.placeholder.com/300x200?text=Food'}">
                            <div class="card-body">
                                <h4>${item.name_vi || item.name}</h4>
                                <div class="price">${item.price.toLocaleString()}đ</div>
                                <button class="btn-add" onclick="openAddModal('${item.name}', ${item.price})">
                                    CHỌN MUA
                                </button>
                            </div>
                        </div>
                    `;
                });
            });

        fetch("https://bun-ngon-24.onrender.com/drinks")
            .then(res => res.json())
            .then(data => {
                data
                .filter(item => (item.category_vi || item.category) === cat)
                .forEach(item => {
                    dContainer.innerHTML += `
                        <div class="card">
                            <img src="${item.image || 'https://via.placeholder.com/300x200?text=Drink'}">
                            <div class="card-body">
                                <h4>${item.name_vi || item.name}</h4>
                                <div class="price">${item.price.toLocaleString()}đ</div>
                                <button class="btn-add" onclick="openAddModal('${item.name}', ${item.price})">
                                    CHỌN MUA
                                </button>
                            </div>
                        </div>
                    `;
                });
            });
    };
}

loadData();
