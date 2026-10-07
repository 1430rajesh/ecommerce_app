// ======================================================
// SHOPKART E-COMMERCE APPLICATION
// ======================================================


// ======================================================
// API
// ======================================================

const API =
    "https://dummyjson.com";


// ======================================================
// STATE
// ======================================================

let products = [];

let displayedProducts = [];

let cart =
    JSON.parse(
        localStorage.getItem("shopkart_cart")
    ) || [];

let wishlist =
    JSON.parse(
        localStorage.getItem("shopkart_wishlist")
    ) || [];

let currentCategory = "all";

let currentPage = 1;

const productsPerPage = 12;

let searchQuery = "";


// ======================================================
// DOM
// ======================================================

const productGrid =
    document.getElementById("productGrid");

const categoryList =
    document.getElementById("categoryList");

const loading =
    document.getElementById("loading");

const errorBox =
    document.getElementById("error");

const emptyBox =
    document.getElementById("empty");

const resultText =
    document.getElementById("resultText");

const searchInput =
    document.getElementById("searchInput");

const searchBtn =
    document.getElementById("searchBtn");

const sortSelect =
    document.getElementById("sortSelect");

const filterBtn =
    document.getElementById("filterBtn");

const filterPanel =
    document.getElementById("filterPanel");

const minPrice =
    document.getElementById("minPrice");

const maxPrice =
    document.getElementById("maxPrice");

const ratingFilter =
    document.getElementById("ratingFilter");

const applyFilter =
    document.getElementById("applyFilter");

const pagination =
    document.getElementById("pagination");

const themeBtn =
    document.getElementById("themeBtn");

const cartBtn =
    document.getElementById("cartBtn");

const cartDrawer =
    document.getElementById("cartDrawer");

const cartOverlay =
    document.getElementById("cartOverlay");

const closeCart =
    document.getElementById("closeCart");

const cartItems =
    document.getElementById("cartItems");

const cartCount =
    document.getElementById("cartCount");

const cartTotal =
    document.getElementById("cartTotal");

const checkoutBtn =
    document.getElementById("checkoutBtn");

const wishlistBtn =
    document.getElementById("wishlistBtn");

const wishlistDrawer =
    document.getElementById("wishlistDrawer");

const wishlistOverlay =
    document.getElementById("wishlistOverlay");

const closeWishlist =
    document.getElementById("closeWishlist");

const wishlistItems =
    document.getElementById("wishlistItems");

const wishlistCount =
    document.getElementById("wishlistCount");

const productModal =
    document.getElementById("productModal");

const closeModal =
    document.getElementById("closeModal");

const modalBody =
    document.getElementById("modalBody");

const toast =
    document.getElementById("toast");

const retryBtn =
    document.getElementById("retryBtn");

const shopNowBtn =
    document.getElementById("shopNowBtn");


// ======================================================
// FETCH PRODUCTS
// ======================================================

async function fetchProducts() {

    showLoading();

    hideError();

    try {

        const response =
            await fetch(
                `${API}/products?limit=100`
            );


        if (!response.ok) {

            throw new Error(
                "Failed to fetch products."
            );
        }


        const data =
            await response.json();


        products =
            data.products;


        createCategories();

        applyFilters();

        updateCartUI();

        updateWishlistUI();


    } catch (error) {

        console.error(error);

        showError();

    } finally {

        hideLoading();
    }
}


// ======================================================
// CREATE CATEGORIES
// ======================================================

function createCategories() {

    const categories =
        [
            ...new Set(
                products.map(
                    product =>
                        product.category
                )
            )
        ];


    categoryList.innerHTML = `

        <button
            class="category active"
            data-category="all"
        >
            ✨ All
        </button>
    `;


    categories.forEach(
        category => {

            const button =
                document.createElement(
                    "button"
                );


            button.className =
                "category";


            button.dataset.category =
                category;


            button.innerHTML = `

                🛍️

                ${formatCategory(category)}

            `;


            categoryList.appendChild(
                button
            );
        }
    );


    document
        .querySelectorAll(".category")
        .forEach(
            button => {

                button.addEventListener(
                    "click",
                    () => {

                        document
                            .querySelectorAll(
                                ".category"
                            )
                            .forEach(
                                item =>
                                    item.classList.remove(
                                        "active"
                                    )
                            );


                        button.classList.add(
                            "active"
                        );


                        currentCategory =
                            button.dataset.category;


                        currentPage = 1;


                        applyFilters();
                    }
                );
            }
        );
}


// ======================================================
// FILTER PRODUCTS
// ======================================================

function applyFilters() {

    let result =
        [...products];


    // CATEGORY

    if (
        currentCategory !==
        "all"
    ) {

        result =
            result.filter(
                product =>
                    product.category ===
                    currentCategory
            );
    }


    // SEARCH

    if (searchQuery) {

        result =
            result.filter(
                product => {

                    const text =
                        `
                        ${product.title}
                        ${product.brand || ""}
                        ${product.category}
                        ${product.description}
                        `.toLowerCase();


                    return text.includes(
                        searchQuery
                    );
                }
            );
    }


    // MIN PRICE

    const min =
        Number(
            minPrice.value
        );


    if (min > 0) {

        result =
            result.filter(
                product =>
                    product.price >= min
            );
    }


    // MAX PRICE

    const max =
        Number(
            maxPrice.value
        );


    if (max > 0) {

        result =
            result.filter(
                product =>
                    product.price <= max
            );
    }


    // RATING

    const rating =
        Number(
            ratingFilter.value
        );


    if (rating > 0) {

        result =
            result.filter(
                product =>
                    product.rating >= rating
            );
    }


    // SORT

    const sort =
        sortSelect.value;


    if (sort === "price-low") {

        result.sort(
            (a, b) =>
                a.price - b.price
        );
    }


    if (sort === "price-high") {

        result.sort(
            (a, b) =>
                b.price - a.price
        );
    }


    if (sort === "rating") {

        result.sort(
            (a, b) =>
                b.rating - a.rating
        );
    }


    if (sort === "discount") {

        result.sort(
            (a, b) =>
                b.discountPercentage -
                a.discountPercentage
        );
    }


    if (sort === "name") {

        result.sort(
            (a, b) =>
                a.title.localeCompare(
                    b.title
                )
        );
    }


    displayedProducts =
        result;


    renderProducts();

    renderPagination();
}


// ======================================================
// RENDER PRODUCTS
// ======================================================

function renderProducts() {

    productGrid.innerHTML = "";

    hideEmpty();


    if (
        displayedProducts.length === 0
    ) {

        showEmpty();

        resultText.textContent =
            "No products found.";

        return;
    }


    const start =
        (currentPage - 1) *
        productsPerPage;


    const end =
        start +
        productsPerPage;


    const pageProducts =
        displayedProducts.slice(
            start,
            end
        );


    resultText.textContent =
        `${displayedProducts.length} products found`;


    pageProducts.forEach(
        (product, index) => {

            const card =
                createProductCard(
                    product
                );


            card.style.animationDelay =
                `${index * 0.05}s`;


            productGrid.appendChild(
                card
            );
        }
    );
}


// ======================================================
// PRODUCT CARD
// ======================================================

function createProductCard(
    product
) {

    const card =
        document.createElement(
            "article"
        );


    card.className =
        "product-card";


    const isWishlisted =
        wishlist.includes(
            product.id
        );


    const discount =
        Math.round(
            product.discountPercentage
        );


    const oldPrice =
        product.price /
        (1 - discount / 100);


    card.innerHTML = `

        <div class="product-image">

            <span class="discount">
                ${discount}% OFF
            </span>


            <button
                class="
                    wishlist
                    ${isWishlisted ? "active" : ""}
                "
                data-action="wishlist"
            >
                ${isWishlisted ? "❤️" : "♡"}
            </button>


            <img
                src="${product.thumbnail}"
                alt="${escapeHTML(
                    product.title
                )}"
                loading="lazy"
            >

        </div>


        <div class="product-body">

            <div class="product-category">

                ${formatCategory(
                    product.category
                )}

            </div>


            <h3 class="product-title">

                ${escapeHTML(
                    product.title
                )}

            </h3>


            <span class="rating">

                ${product.rating}

            </span>


            <div class="price-row">

                <strong class="price">

                    ₹${formatPrice(
                        product.price
                    )}

                </strong>


                <span class="old-price">

                    ₹${formatPrice(
                        oldPrice
                    )}

                </span>

            </div>


            <div class="card-actions">

                <button
                    class="
                        card-btn
                        details-btn
                    "
                    data-action="details"
                >
                    View Details
                </button>


                <button
                    class="
                        card-btn
                        cart-btn
                    "
                    data-action="cart"
                >
                    🛒 Add
                </button>

            </div>

        </div>
    `;


    // EVENTS

    card.addEventListener(
        "click",
        event => {

            const action =
                event.target
                    .closest(
                        "[data-action]"
                    );


            if (!action) return;


            const actionType =
                action.dataset.action;


            if (
                actionType ===
                "wishlist"
            ) {

                event.stopPropagation();

                toggleWishlist(
                    product.id
                );
            }


            if (
                actionType ===
                "cart"
            ) {

                addToCart(product.id);

            }


            if (
                actionType ===
                "details"
            ) {

                openProductModal(
                    product.id
                );
            }
        }
    );


    return card;
}


// ======================================================
// PRODUCT MODAL
// ======================================================

function openProductModal(id) {

    const product =
        products.find(
            item =>
                item.id === id
        );


    if (!product) return;


    modalBody.innerHTML = `

        <div class="modal-image">

            <img
                src="${product.images[0]}"
                alt="${escapeHTML(
                    product.title
                )}"
            >

        </div>


        <div class="modal-info">

            <span class="category">

                ${formatCategory(
                    product.category
                )}

            </span>


            <h2>

                ${escapeHTML(
                    product.title
                )}

            </h2>


            <span class="rating">

                ${product.rating}

            </span>


            <p class="modal-description">

                ${escapeHTML(
                    product.description
                )}

            </p>


            <div class="modal-price">

                ₹${formatPrice(
                    product.price
                )}

            </div>


            <button
                class="modal-add"
                id="modalAddBtn"
            >
                🛒 Add To Cart
            </button>

        </div>
    `;


    productModal.classList.add(
        "show"
    );


    document
        .getElementById("modalAddBtn")
        .addEventListener(
            "click",
            () => {

                addToCart(product.id);

                closeProductModal();
            }
        );
}


function closeProductModal() {

    productModal.classList.remove(
        "show"
    );
}


closeModal.addEventListener(
    "click",
    closeProductModal
);


productModal.addEventListener(
    "click",
    event => {

        if (
            event.target ===
            productModal
        ) {

            closeProductModal();
        }
    }
);


// ======================================================
// CART
// ======================================================

function addToCart(id) {

    const existing =
        cart.find(
            item =>
                item.id === id
        );


    if (existing) {

        existing.quantity++;

    } else {

        cart.push({

            id,

            quantity: 1
        });
    }


    saveCart();

    updateCartUI();

    showToast(
        "Product added to cart 🛒"
    );
}


function removeFromCart(id) {

    cart =
        cart.filter(
            item =>
                item.id !== id
        );


    saveCart();

    updateCartUI();
}


function changeQuantity(
    id,
    change
) {

    const item =
        cart.find(
            item =>
                item.id === id
        );


    if (!item) return;


    item.quantity += change;


    if (item.quantity <= 0) {

        removeFromCart(id);

        return;
    }


    saveCart();

    updateCartUI();
}


function saveCart() {

    localStorage.setItem(
        "shopkart_cart",
        JSON.stringify(cart)
    );
}


// ======================================================
// CART UI
// ======================================================

function updateCartUI() {

    const count =
        cart.reduce(
            (sum, item) =>
                sum + item.quantity,
            0
        );


    cartCount.textContent =
        count;


    cartItems.innerHTML = "";


    if (cart.length === 0) {

        cartItems.innerHTML = `

            <div class="empty">

                <div>🛒</div>

                <h2>
                    Your cart is empty
                </h2>

                <p>
                    Add some products to get started.
                </p>

            </div>
        `;


        cartTotal.textContent =
            "₹0";


        return;
    }


    let total = 0;


    cart.forEach(
        item => {

            const product =
                products.find(
                    p =>
                        p.id === item.id
                );


            if (!product) return;


            total +=
                product.price *
                item.quantity;


            const element =
                document.createElement(
                    "div"
                );


            element.className =
                "cart-item";


            element.innerHTML = `

                <img
                    src="${product.thumbnail}"
                    alt=""
                >


                <div class="cart-item-info">

                    <h4>

                        ${escapeHTML(
                            product.title
                        )}

                    </h4>


                    <div class="cart-item-price">

                        ₹${formatPrice(
                            product.price
                        )}

                    </div>


                    <div class="quantity">

                        <button
                            data-change="-1"
                            data-id="${product.id}"
                        >
                            −
                        </button>


                        <span>
                            ${item.quantity}
                        </span>


                        <button
                            data-change="1"
                            data-id="${product.id}"
                        >
                            +
                        </button>

                    </div>


                    <button
                        class="remove-cart"
                        data-remove="${product.id}"
                    >
                        Remove
                    </button>

                </div>
            `;


            cartItems.appendChild(
                element
            );
        }
    );


    cartTotal.textContent =
        `₹${formatPrice(total)}`;
}


// ======================================================
// CART EVENTS
// ======================================================

cartItems.addEventListener(
    "click",
    event => {

        const quantityButton =
            event.target.closest(
                "[data-change]"
            );


        const removeButton =
            event.target.closest(
                "[data-remove]"
            );


        if (quantityButton) {

            const id =
                Number(
                    quantityButton.dataset.id
                );


            const change =
                Number(
                    quantityButton.dataset.change
                );


            changeQuantity(
                id,
                change
            );
        }


        if (removeButton) {

            removeFromCart(
                Number(
                    removeButton.dataset.remove
                )
            );
        }
    }
);


// ======================================================
// CART DRAWER
// ======================================================

function openCart() {

    cartDrawer.classList.add(
        "open"
    );

    cartOverlay.classList.add(
        "show"
    );
}


function closeCartDrawer() {

    cartDrawer.classList.remove(
        "open"
    );

    cartOverlay.classList.remove(
        "show"
    );
}


cartBtn.addEventListener(
    "click",
    openCart
);


closeCart.addEventListener(
    "click",
    closeCartDrawer
);


cartOverlay.addEventListener(
    "click",
    closeCartDrawer
);


// ======================================================
// WISHLIST
// ======================================================

function toggleWishlist(id) {

    if (
        wishlist.includes(id)
    ) {

        wishlist =
            wishlist.filter(
                item =>
                    item !== id
            );


        showToast(
            "Removed from wishlist."
        );

    } else {

        wishlist.push(id);


        showToast(
            "Added to wishlist ❤️"
        );
    }


    saveWishlist();

    updateWishlistUI();

    renderProducts();
}


function saveWishlist() {

    localStorage.setItem(
        "shopkart_wishlist",
        JSON.stringify(wishlist)
    );
}


// ======================================================
// WISHLIST UI
// ======================================================

function updateWishlistUI() {

    wishlistCount.textContent =
        wishlist.length;


    wishlistItems.innerHTML = "";


    if (
        wishlist.length === 0
    ) {

        wishlistItems.innerHTML = `

            <div class="empty">

                <div>❤️</div>

                <h2>
                    Wishlist is empty
                </h2>

                <p>
                    Save products you love.
                </p>

            </div>
        `;

        return;
    }


    wishlist.forEach(
        id => {

            const product =
                products.find(
                    item =>
                        item.id === id
                );


            if (!product) return;


            const element =
                document.createElement(
                    "div"
                );


            element.className =
                "wishlist-item";


            element.innerHTML = `

                <img
                    src="${product.thumbnail}"
                    alt=""
                >


                <div class="wishlist-item-info">

                    <h4>
                        ${escapeHTML(
                            product.title
                        )}
                    </h4>


                    <div class="wishlist-price">

                        ₹${formatPrice(
                            product.price
                        )}

                    </div>


                    <button
                        class="wishlist-add"
                        data-add="${product.id}"
                    >
                        Add To Cart
                    </button>

                </div>
            `;


            wishlistItems.appendChild(
                element
            );
        }
    );
}


// ======================================================
// WISHLIST DRAWER
// ======================================================

function openWishlist() {

    wishlistDrawer.classList.add(
        "open"
    );

    wishlistOverlay.classList.add(
        "show"
    );
}


function closeWishlistDrawer() {

    wishlistDrawer.classList.remove(
        "open"
    );

    wishlistOverlay.classList.remove(
        "show"
    );
}


wishlistBtn.addEventListener(
    "click",
    openWishlist
);


closeWishlist.addEventListener(
    "click",
    closeWishlistDrawer
);


wishlistOverlay.addEventListener(
    "click",
    closeWishlistDrawer
);


wishlistItems.addEventListener(
    "click",
    event => {

        const button =
            event.target.closest(
                "[data-add]"
            );


        if (!button) return;


        addToCart(
            Number(
                button.dataset.add
            )
        );
    }
);


// ======================================================
// SEARCH
// ======================================================

function performSearch() {

    searchQuery =
        searchInput.value
            .trim()
            .toLowerCase();


    currentPage = 1;

    applyFilters();
}


searchBtn.addEventListener(
    "click",
    performSearch
);


searchInput.addEventListener(
    "keydown",
    event => {

        if (
            event.key === "Enter"
        ) {

            performSearch();
        }
    }
);


searchInput.addEventListener(
    "input",
    () => {

        searchQuery =
            searchInput.value
                .trim()
                .toLowerCase();


        currentPage = 1;

        applyFilters();
    }
);


// ======================================================
// SORT
// ======================================================

sortSelect.addEventListener(
    "change",
    () => {

        currentPage = 1;

        applyFilters();
    }
);


// ======================================================
// FILTER PANEL
// ======================================================

filterBtn.addEventListener(
    "click",
    () => {

        filterPanel.classList.toggle(
            "show"
        );
    }
);


applyFilter.addEventListener(
    "click",
    () => {

        currentPage = 1;

        applyFilters();

        filterPanel.classList.remove(
            "show"
        );

        showToast(
            "Filters applied ✓"
        );
    }
);


// ======================================================
// PAGINATION
// ======================================================

function renderPagination() {

    pagination.innerHTML = "";


    const totalPages =
        Math.ceil(
            displayedProducts.length /
            productsPerPage
        );


    if (totalPages <= 1) {

        return;
    }


    // Previous

    const previous =
        document.createElement(
            "button"
        );


    previous.className =
        "page-btn";


    previous.textContent =
        "‹";


    previous.disabled =
        currentPage === 1;


    previous.addEventListener(
        "click",
        () => {

            if (
                currentPage >
                1
            ) {

                currentPage--;

                renderProducts();

                renderPagination();

                scrollProducts();
            }
        }
    );


    pagination.appendChild(
        previous
    );


    // Pages

    for (
        let page = 1;
        page <= totalPages;
        page++
    ) {

        const button =
            document.createElement(
                "button"
            );


        button.className =
            "page-btn";


        if (
            page === currentPage
        ) {

            button.classList.add(
                "active"
            );
        }


        button.textContent =
            page;


        button.addEventListener(
            "click",
            () => {

                currentPage =
                    page;


                renderProducts();

                renderPagination();

                scrollProducts();
            }
        );


        pagination.appendChild(
            button
        );
    }


    // Next

    const next =
        document.createElement(
            "button"
        );


    next.className =
        "page-btn";


    next.textContent =
        "›";


    next.disabled =
        currentPage ===
        totalPages;


    next.addEventListener(
        "click",
        () => {

            if (
                currentPage <
                totalPages
            ) {

                currentPage++;

                renderProducts();

                renderPagination();

                scrollProducts();
            }
        }
    );


    pagination.appendChild(
        next
    );
}


// ======================================================
// SCROLL PRODUCTS
// ======================================================

function scrollProducts() {

    window.scrollTo({

        top:
            document
                .querySelector(
                    ".main"
                )
                .offsetTop - 80,

        behavior: "smooth"
    });
}


// ======================================================
// THEME
// ======================================================

themeBtn.addEventListener(
    "click",
    () => {

        document.body.classList.toggle(
            "dark"
        );


        const dark =
            document.body.classList.contains(
                "dark"
            );


        localStorage.setItem(
            "shopkart_theme",
            dark
                ? "dark"
                : "light"
        );


        themeBtn.textContent =
            dark
                ? "☀️"
                : "🌙";
    }
);


function loadTheme() {

    const theme =
        localStorage.getItem(
            "shopkart_theme"
        );


    if (
        theme === "dark"
    ) {

        document.body.classList.add(
            "dark"
        );

        themeBtn.textContent =
            "☀️";
    }
}


// ======================================================
// SHOP NOW
// ======================================================

shopNowBtn.addEventListener(
    "click",
    () => {

        document
            .querySelector(
                ".main"
            )
            .scrollIntoView({
                behavior: "smooth"
            });
    }
);


// ======================================================
// CHECKOUT
// ======================================================

checkoutBtn.addEventListener(
    "click",
    () => {

        if (cart.length === 0) {

            showToast(
                "Your cart is empty."
            );

            return;
        }


        showToast(
            "Checkout demo — payment integration can be added here."
        );
    }
);


// ======================================================
// RETRY
// ======================================================

retryBtn.addEventListener(
    "click",
    fetchProducts
);


// ======================================================
// UI HELPERS
// ======================================================

function showLoading() {

    loading.classList.add(
        "show"
    );

    productGrid.style.display =
        "none";
}


function hideLoading() {

    loading.classList.remove(
        "show"
    );

    productGrid.style.display =
        "grid";
}


function showError() {

    errorBox.classList.add(
        "show"
    );

    productGrid.style.display =
        "none";
}


function hideError() {

    errorBox.classList.remove(
        "show"
    );
}


function showEmpty() {

    emptyBox.classList.add(
        "show"
    );
}


function hideEmpty() {

    emptyBox.classList.remove(
        "show"
    );
}


function showToast(
    message
) {

    toast.textContent =
        message;


    toast.classList.add(
        "show"
    );


    setTimeout(
        () => {

            toast.classList.remove(
                "show"
            );

        },
        2500
    );
}


// ======================================================
// FORMAT PRICE
// ======================================================

function formatPrice(
    price
) {

    return Number(
        price
    ).toLocaleString(
        "en-IN",
        {
            maximumFractionDigits: 0
        }
    );
}


// ======================================================
// CATEGORY FORMAT
// ======================================================

function formatCategory(
    category
) {

    return category
        .replace(
            /-/g,
            " "
        )
        .replace(
            /\b\w/g,
            letter =>
                letter.toUpperCase()
        );
}


// ======================================================
// ESCAPE HTML
// ======================================================

function escapeHTML(
    value
) {

    const div =
        document.createElement(
            "div"
        );


    div.textContent =
        value;


    return div.innerHTML;
}


// ======================================================
// KEYBOARD SHORTCUT
// ======================================================

document.addEventListener(
    "keydown",
    event => {

        // ESC closes modal/drawers

        if (
            event.key ===
            "Escape"
        ) {

            closeProductModal();

            closeCartDrawer();

            closeWishlistDrawer();
        }
    }
);


// ======================================================
// INITIALIZE
// ======================================================

loadTheme();

fetchProducts();
