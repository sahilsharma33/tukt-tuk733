const API_BASE = 'http://localhost:5003/api';

// ======================
// STATE
// ======================
let currentUser = null;
let currentCart = { items: [], total: 0 };
let allProducts = [];
let authToken = localStorage.getItem('token');


// ======================
// INITIALIZE APP
// ======================
document.addEventListener('DOMContentLoaded', () => {
    console.log('App Loaded');

    if (authToken) {
        verifyToken();
    }

    loadProducts();
    updateCartUI();

    // Attach form events safely
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
        loginForm.addEventListener('submit', login);
    }

    const registerForm = document.getElementById('register-form');
    if (registerForm) {
        registerForm.addEventListener('submit', register);
    }
});

function toggleAuth() {
    const loginForm = document.getElementById('login-form');
    const registerForm = document.getElementById('register-form');

    loginForm.classList.toggle('active');
    registerForm.classList.toggle('active');
}

// ======================
// SECTION NAVIGATION
// ======================
function showSection(sectionId) {
    document.querySelectorAll('.section').forEach(section => {
        section.classList.remove('active');
    });

    const activeSection = document.getElementById(sectionId);

    if (activeSection) {
        activeSection.classList.add('active');
    }
}

function showHome() {
    showSection('home');
}

function showProducts() {
    showSection('products');
    loadProducts();
}

function showCart() {
    showSection('cart');
    loadCart();
}

function showAuth() {
    showSection('auth');
}

function showProfile() {
    showSection('profile');
    loadUserProfile();
    loadUserOrders();
}

// ======================
// AUTH FUNCTIONS
// ======================
async function login(e) {
    e.preventDefault();

    const email = document.getElementById('login-email')?.value;
    const password = document.getElementById('login-password')?.value;

    try {
        const response = await fetch(`${API_BASE}/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email, password })
        });

        const data = await response.json();

        if (response.ok) {
            authToken = data.token;
            currentUser = data.user;

            localStorage.setItem('token', authToken);

            updateAuthUI();

            alert('Login Successful');

            showHome();
        } else {
            alert(data.message || 'Login failed');
        }

    } catch (err) {
        console.error(err);
        alert('Server Error');
    }
}

async function register(e) {
    e.preventDefault();

    const name = document.getElementById('register-name')?.value;
    const email = document.getElementById('register-email')?.value;
    const password = document.getElementById('register-password')?.value;
    const confirmPassword = document.getElementById('register-confirm')?.value;

    if (password !== confirmPassword) {
        alert('Passwords do not match');
        return;
    }

    try {
        const response = await fetch(`${API_BASE}/auth/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                name,
                email,
                password
            })
        });

        const data = await response.json();

        if (response.ok) {
            authToken = data.token;
            currentUser = data.user;

            localStorage.setItem('token', authToken);

            updateAuthUI();

            alert('Registration Successful');

            showHome();
        } else {
            alert(data.message || 'Registration failed');
        }

    } catch (err) {
        console.error(err);
        alert('Server Error');
    }
}

function logout() {
    currentUser = null;
    authToken = null;

    localStorage.removeItem('token');

    currentCart = {
        items: [],
        total: 0
    };

    updateAuthUI();
    updateCartUI();

    showHome();
}

async function verifyToken() {
    try {
        const response = await fetch(`${API_BASE}/auth/verify`, {
            headers: {
                Authorization: `Bearer ${authToken}`
            }
        });

        if (response.ok) {
            const data = await response.json();

            currentUser = data.user;

            updateAuthUI();
        } else {
            logout();
        }

    } catch (err) {
        console.error(err);
        logout();
    }
}

function updateAuthUI() {
    const authLink = document.getElementById('auth-link');
    const profileLink = document.getElementById('profile-link');
    const logoutLink = document.getElementById('logout-link');

    if (currentUser) {
        if (authLink) authLink.style.display = 'none';
        if (profileLink) profileLink.style.display = 'block';
        if (logoutLink) logoutLink.style.display = 'block';
    } else {
        if (authLink) authLink.style.display = 'block';
        if (profileLink) profileLink.style.display = 'none';
        if (logoutLink) logoutLink.style.display = 'none';
    }
}

// ======================
// PRODUCTS
// ======================
async function loadProducts() {
    try {
        const response = await fetch(`${API_BASE}/products`);

        const data = await response.json();

        allProducts = data.products || [];

        console.log(allProducts);

        displayProducts(allProducts);

    } catch (err) {
        console.error('Error Loading Products:', err);

        displayProducts([]);
    }
}

function displayProducts(products) {
    const grid = document.getElementById('products-grid');

    if (!grid) {
        console.log('products-grid not found');
        return;
    }

    if (!products || products.length === 0) {
        grid.innerHTML = `
            <h2 style="text-align:center;">
                No Products Found
            </h2>
        `;
        return;
    }

    grid.innerHTML = products.map(product => `
        <div class="product-card">

            <img 
                src="${product.image || 'https://via.placeholder.com/250'}"
                class="product-image"
                alt="${product.name || 'Product'}"
            >

            <div class="product-info">

                <h3>${product.name || 'No Name'}</h3>

                <p>${product.description || 'No Description'}</p>

                <h2>
                  ₹${product.price ? product.price.toLocaleString('en-IN') : 0}
                </h2>

                <p>
                    ${product.stock > 0 ? 'In Stock' : 'Out Of Stock'}
                </p>

                ${product.stock > 0 ? `
                    <button 
                        onclick="addToCart(
                            '${product._id}',
                            '${product.name}',
                            ${product.price || 0}
                        )"
                        class="btn"
                    >
                        Add To Cart
                    </button>
                ` : `
                    <button disabled class="btn">
                        Out Of Stock
                    </button>
                `}
            </div>
        </div>
    `).join('');
}

function filterProducts() {
    const search =
        document.getElementById('search-input')?.value.toLowerCase() || '';

    const filtered = allProducts.filter(product => {
        const name = (product.name || '').toLowerCase();
        const desc = (product.description || '').toLowerCase();

        return name.includes(search) || desc.includes(search);
    });

    displayProducts(filtered);
}

// ======================
// CART
// ======================
async function addToCart(productId, productName, price) {

    if (!currentUser) {
        alert('Please Login First');
        showAuth();
        return;
    }

    try {
        const response = await fetch(`${API_BASE}/cart/add`, {
            method: 'POST',

            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${authToken}`
            },

            body: JSON.stringify({
                productId,
                productName,
                price,
                quantity: 1
            })
        });

        if (response.ok) {
            const data = await response.json();

            currentCart = data;

            updateCartUI();

            alert('Added To Cart');
            window.location.href = "checkout.html";
            
        }

    } catch (err) {
        console.error(err);
    }
}

async function loadCart() {

    if (!currentUser) return;

    try {
        const response = await fetch(`${API_BASE}/cart`, {
            headers: {
                Authorization: `Bearer ${authToken}`
            }
        });

        const data = await response.json();

        currentCart = data;

        displayCart();

    } catch (err) {
        console.error(err);
    }
}

function goToCheckout(){

   if(currentCart.items.length === 0){
      alert('Cart is Empty');
      return;
   }
   

   window.location.href = 'checkout.html';
}

function displayCart() {

    const cartDiv = document.getElementById('cart-items');

    if (!cartDiv) return;

    if (!currentCart.items || currentCart.items.length === 0) {

        cartDiv.innerHTML = `
            <h3>Your Cart Is Empty</h3>
        `;

        return;
    }

    cartDiv.innerHTML =
     currentCart.items.map(item => `
        <div class="cart-item">

            <h3>${item.productName}</h3>

            <p>Qty: ${item.quantity}</p>

            <p>
                $${(item.price * item.quantity).toFixed(2)}
            </p>

            <button onclick="removeFromCart('${item.productId}')">
                Remove
            </button>
        </div>
    `).join('') + 
    `
   <button onclick="goToCheckout()" class="btn">
      Proceed To Checkout
   </button>
`;
}

async function removeFromCart(productId) {

    try {
        const response = await fetch(`${API_BASE}/cart/remove`, {

            method: 'POST',

            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${authToken}`
            },

            body: JSON.stringify({ productId })
        });

        if (response.ok) {

            const data = await response.json();

            currentCart = data;

            displayCart();

            updateCartUI();
        }

    } catch (err) {
        console.error(err);
    }
}

function updateCartUI() {

    const cartCount = document.getElementById('cart-count');

    if (!cartCount) return;

    const count = currentCart.items.reduce((sum, item) => {
        return sum + item.quantity;
    }, 0);

    cartCount.textContent = count;
}

// ======================
// PROFILE
// ======================
function loadUserProfile() {
3
    const userInfo = document.getElementById('user-info');

    if (!userInfo || !currentUser) return;

    userInfo.innerHTML = `
        <h2>${currentUser.name}</h2>
        <p>${currentUser.email}</p>
    `;
}

async function loadUserOrders() {

    if (!currentUser) return;

    try {

        const response = await fetch(`${API_BASE}/orders`, {

            headers: {
                Authorization: `Bearer ${authToken}`
            }

        });

        const orders = await response.json();
        console.log(orders);

        const ordersDiv =
            document.getElementById('orders');

        if(!ordersDiv) return;

        if(orders.length === 0){

            ordersDiv.innerHTML = `
                <h3>No Orders Found</h3>
            `;

            return;
        }

        ordersDiv.innerHTML = orders.map(order => `

            <div class="order-card">

                <h3>
                    Order ID:
                    ${order._id}
                </h3>

                <p>
                    Payment:
                    ${order.paymentStatus}
                </p>

                <p>
                    Order Status:
                    ${order.orderStatus}
                </p>

                <p>
                    Total:
                    ₹${order.totalPrice}
                </p>

            </div>

        `).join('');

    } catch (err) {

        console.error(err);
    }
}
    
function placeOrder() {

    const paymentMethod = document.getElementById("payment").value;

    if(paymentMethod === "Online"){

        window.location.href = "payment.html";

    } else {

        alert("Order Placed Successfully!");

        window.location.href = "success.html";
    }
}
async function saveOrder(paymentStatus){

    const orderData = {

        items: currentCart.items,

        shippingAddress: {
            fullName: document.getElementById('name').value,
            address: document.getElementById('address').value,
            phone: document.getElementById('phone').value
        },

        totalPrice: currentCart.total,

        paymentMethod:
            document.getElementById('payment').value,

        paymentStatus
    };

    const response = await fetch(
        'http://localhost:5003/api/orders/create',
        {
            method: 'POST',

            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${authToken}`
            },

            body: JSON.stringify(orderData)
        }
    );

    const data = await response.json();

    // CLEAR CART
    currentCart = {
        items: [],
        total: 0
    };

    updateCartUI();

    localStorage.removeItem('cart');

    alert('Order Placed Successfully');
}