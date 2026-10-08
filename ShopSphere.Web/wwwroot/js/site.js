document.addEventListener("DOMContentLoaded", () => {
    const body = document.body;
    const sidebar = document.getElementById("customerSidebar");
    const sidebarToggle = document.getElementById("sidebarToggle");
    const sidebarClose = document.getElementById("sidebarClose");
    const sidebarOverlay = document.getElementById("sidebarOverlay");
    const sidebarCollapse = document.getElementById("sidebarCollapse");

    const globalSearch = document.getElementById("globalSearch");
    const searchSuggestions = document.getElementById("searchSuggestions");

    const toast = document.getElementById("ssToast");
    const toastTitle = document.getElementById("ssToastTitle");
    const toastMessage = document.getElementById("ssToastMessage");
    const toastClose = document.getElementById("ssToastClose");

    const newsletterEmail = document.getElementById("newsletterEmail");
    const newsletterButton = document.getElementById("newsletterButton");

    let toastTimer;

    window.showToast = (title, message) => {
        if (!toast) {
            return;
        }

        toastTitle.textContent = title;
        toastMessage.textContent = message;
        toast.classList.add("is-visible");

        clearTimeout(toastTimer);

        toastTimer = setTimeout(() => {
            toast.classList.remove("is-visible");
        }, 3000);
    };

    const openSidebar = () => {
        if (!sidebar) {
            return;
        }

        sidebar.classList.add("is-open");
        sidebarOverlay?.classList.add("is-visible");
        body.classList.add("ss-sidebar-open");
    };

    const closeSidebar = () => {
        if (!sidebar) {
            return;
        }

        sidebar.classList.remove("is-open");
        sidebarOverlay?.classList.remove("is-visible");
        body.classList.remove("ss-sidebar-open");
    };

    sidebarToggle?.addEventListener("click", () => {
        if (window.innerWidth <= 900) {
            openSidebar();
            return;
        }

        body.classList.toggle("ss-sidebar-collapsed");
    });

    sidebarClose?.addEventListener("click", closeSidebar);
    sidebarOverlay?.addEventListener("click", closeSidebar);

    sidebarCollapse?.addEventListener("click", () => {
        if (window.innerWidth <= 900) {
            closeSidebar();
            return;
        }

        body.classList.toggle("ss-sidebar-collapsed");

        const collapsed = body.classList.contains("ss-sidebar-collapsed");
        sidebarCollapse.querySelector("span").textContent = collapsed ? "Expand" : "Collapse";
    });

    window.addEventListener("resize", () => {
        if (window.innerWidth > 900) {
            closeSidebar();
        }
    });


globalSearch?.addEventListener("focus", () => {
    searchSuggestions?.classList.add("is-visible");
});

globalSearch?.addEventListener("input", () => {
    searchSuggestions?.classList.add("is-visible");
});

globalSearch?.addEventListener("keydown", event => {
    if (event.key !== "Enter") {
        return;
    }

    const value = globalSearch.value.trim();

    if (!value) {
        return;
    }

    window.location.href =
        `/Search?query=${encodeURIComponent(value)}`;
});

searchSuggestions?.querySelectorAll("[data-search]").forEach(button => {
    button.addEventListener("click", () => {
        const value = button.dataset.search;

        globalSearch.value = value;

        searchSuggestions.classList.remove("is-visible");

        window.location.href =
            `/Search?query=${encodeURIComponent(value)}`;
    });
});

document.addEventListener("click", event => {
    if (!event.target.closest(".ss-search")) {
        searchSuggestions?.classList.remove("is-visible");
    }
});

    document.querySelectorAll(".ss-demo-link").forEach((link) => {
        link.addEventListener("click", (event) => {
            event.preventDefault();
            showToast("ShopSphere Prototype", "This page will be connected in the next frontend stage.");
        });
    });

    toastClose?.addEventListener("click", () => {
        toast.classList.remove("is-visible");
    });

    newsletterButton?.addEventListener("click", () => {
        const email = newsletterEmail?.value.trim();

        if (!email) {
            showToast("Newsletter", "Please enter your email address.");
            return;
        }

        showToast("Subscribed", "Your newsletter subscription was recorded for the prototype.");

        if (newsletterEmail) {
            newsletterEmail.value = "";
        }
    });
});
document.querySelectorAll(".ss-wishlist-btn").forEach((button) => {
    button.addEventListener("click", () => {
        button.classList.toggle("is-active");

        const active = button.classList.contains("is-active");

        if (typeof showToast === "function") {
            showToast(
                active ? "Wishlist" : "Wishlist",
                active ? "Product added to your wishlist." : "Product removed from your wishlist."
            );
        }
    });
});

document.querySelectorAll(".ss-add-home-cart").forEach((button) => {
    button.addEventListener("click", () => {
        if (typeof showToast === "function") {
            showToast("Added to Cart", "The product was added to your cart.");
        }
    });
});

const homeNewsletterEmail = document.getElementById("homeNewsletterEmail");
const homeNewsletterButton = document.getElementById("homeNewsletterButton");

homeNewsletterButton?.addEventListener("click", () => {
    const email = homeNewsletterEmail?.value.trim();

    if (!email) {
        if (typeof showToast === "function") {
            showToast("Newsletter", "Please enter your email address.");
        }
        return;
    }

    if (!email.includes("@")) {
        if (typeof showToast === "function") {
            showToast("Newsletter", "Please enter a valid email address.");
        }
        return;
    }

    if (typeof showToast === "function") {
        showToast("Subscribed", "You are now subscribed to ShopSphere updates.");
    }

    homeNewsletterEmail.value = "";
});
(() => {
    const grid = document.getElementById("shopProductGrid");

    if (!grid || typeof shopProducts === "undefined") {
        return;
    }

    const searchInput = document.getElementById("shopSearch");
    const sortSelect = document.getElementById("sortProducts");
    const priceFilter = document.getElementById("priceFilter");
    const priceValue = document.getElementById("priceValue");
    const productCount = document.getElementById("shopProductCount");
    const activeFilters = document.getElementById("activeFilters");
    const pagination = document.getElementById("shopPagination");
    const emptyProducts = document.getElementById("emptyProducts");

    const filterToggle = document.getElementById("filterToggle");
    const filterClose = document.getElementById("filterClose");
    const filterOverlay = document.getElementById("filterOverlay");
    const shopFilters = document.getElementById("shopFilters");

    const clearAllFilters = document.getElementById("clearAllFilters");
    const emptyClearFilters = document.getElementById("emptyClearFilters");
    if (typeof selectedCategory !== "undefined" && selectedCategory) {
    const categoryCheckbox = [...document.querySelectorAll("[data-filter-category]")]
        .find(input => input.value === selectedCategory);

    if (categoryCheckbox) {
        categoryCheckbox.checked = true;
    }
}

    let currentPage = 1;
    const pageSize = 6;

    const getCategoryFilters = () =>
        [...document.querySelectorAll("[data-filter-category]:checked")].map(input => input.value);

    const getAvailabilityFilters = () =>
        [...document.querySelectorAll("[data-filter-availability]:checked")].map(input => input.value);

    const getRatingFilter = () =>
        Number(document.querySelector("input[name='ratingFilter']:checked")?.value || 0);

    const getFilteredProducts = () => {
        const search = searchInput?.value.trim().toLowerCase() || "";
        const categories = getCategoryFilters();
        const availability = getAvailabilityFilters();
        const maxPrice = Number(priceFilter?.value || 10000);
        const minRating = getRatingFilter();

        let filtered = shopProducts.filter(product => {
            const matchesSearch =
                !search ||
                product.Name.toLowerCase().includes(search) ||
                product.Brand.toLowerCase().includes(search) ||
                product.Category.toLowerCase().includes(search);

            const matchesCategory =
                categories.length === 0 ||
                categories.includes(product.Category);

            const matchesAvailability =
                availability.length === 0 ||
                availability.includes(product.Availability);

            const matchesPrice = Number(product.Price) <= maxPrice;

            const matchesRating = Number(product.Rating) >= minRating;

            return matchesSearch &&
                matchesCategory &&
                matchesAvailability &&
                matchesPrice &&
                matchesRating;
        });

        const sort = sortSelect?.value || "featured";

        if (sort === "price-low") {
            filtered.sort((a, b) => Number(a.Price) - Number(b.Price));
        }

        if (sort === "price-high") {
            filtered.sort((a, b) => Number(b.Price) - Number(a.Price));
        }

        if (sort === "rating") {
            filtered.sort((a, b) => Number(b.Rating) - Number(a.Rating));
        }

        if (sort === "name") {
            filtered.sort((a, b) => a.Name.localeCompare(b.Name));
        }

        return filtered;
    };

    const getAvailabilityClass = availability => {
        if (availability === "In Stock") {
            return "in-stock";
        }

        if (availability === "Low Stock") {
            return "low-stock";
        }

        return "out-stock";
    };

    const renderProducts = () => {
        const filtered = getFilteredProducts();
        const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));

        if (currentPage > totalPages) {
            currentPage = totalPages;
        }

        const start = (currentPage - 1) * pageSize;
        const visibleProducts = filtered.slice(start, start + pageSize);

        grid.innerHTML = "";

        productCount.textContent = `${filtered.length} ${filtered.length === 1 ? "product" : "products"}`;

        if (filtered.length === 0) {
            emptyProducts.classList.add("is-visible");
            pagination.innerHTML = "";
            renderActiveFilters();
            return;
        }

        emptyProducts.classList.remove("is-visible");

        visibleProducts.forEach(product => {
            const card = document.createElement("article");
            card.className = "ss-shop-product-card";
            card.dataset.productId = product.Id;

            const oldPrice = product.OldPrice
                ? `<del>₹${Number(product.OldPrice).toLocaleString("en-IN")}</del>`
                : "";

            const disabled = product.Availability === "Out of Stock" ? "disabled" : "";

            card.innerHTML = `
                <div class="ss-shop-product-media">
                    ${product.Id <= 5 ? `<span class="ss-shop-product-tag">Featured</span>` : ""}
                    <button type="button" class="ss-shop-wishlist" aria-label="Add ${product.Name} to wishlist">
                        <svg viewBox="0 0 24 24" aria-hidden="true">
                            <path d="m12 19-1.4-1.2C6 13.8 4 11.9 4 9.5 4 7.3 5.8 5.5 8 5.5c1.3 0 2.6.6 3.4 1.7C12.2 6.1 13.5 5.5 15 5.5c2.2 0 4 1.8 4 4 0 2.4-2 4.3-6.6 8.3z" />
                        </svg>
                    </button>
                    <img src="${product.Image}" alt="${product.Name}" loading="lazy">
                </div>

                <div class="ss-shop-product-info">
                    <span class="ss-shop-product-category">${product.Category}</span>
                    <h3>${product.Name}</h3>
                    <span class="ss-shop-product-brand">${product.Brand}</span>

                    <div class="ss-shop-product-rating">
                        <span>★★★★★</span>
                        <small>${product.Rating} (${product.ReviewCount})</small>
                    </div>

                    <div class="ss-shop-product-price">
                        <strong>₹${Number(product.Price).toLocaleString("en-IN")}</strong>
                        ${oldPrice}
                    </div>

                    <span class="ss-shop-availability ${getAvailabilityClass(product.Availability)}">
                        ${product.Availability}
                    </span>

                    <div class="ss-shop-product-actions">
                        <a href="#" class="ss-shop-details-btn ss-demo-product">
                            View Details
                        </a>

                        <button type="button" class="ss-shop-cart-btn" ${disabled}>
                            ${product.Availability === "Out of Stock" ? "Unavailable" : "Add to Cart"}
                        </button>
                    </div>
                </div>
            `;

            grid.appendChild(card);

            const wishlistButton = card.querySelector(".ss-shop-wishlist");

            wishlistButton.addEventListener("click", () => {
                wishlistButton.classList.toggle("is-active");

                const active = wishlistButton.classList.contains("is-active");

                if (typeof window.showToast === "function") {
                    window.showToast(
                        "Wishlist",
                        active
                            ? `${product.Name} added to your wishlist.`
                            : `${product.Name} removed from your wishlist.`
                    );
                }
            });

            const cartButton = card.querySelector(".ss-shop-cart-btn");

            cartButton.addEventListener("click", () => {
                if (cartButton.disabled) {
                    return;
                }

                if (typeof window.showToast === "function") {
                    window.showToast(
                        "Added to Cart",
                        `${product.Name} was added to your cart.`
                    );
                }
            });

           card.querySelector(".ss-demo-product")?.addEventListener("click", event => {
    event.preventDefault();

    window.location.href = `/Product/Details/${product.Id}`;
});
        });

        renderPagination(totalPages);
        renderActiveFilters();
    };

    const renderPagination = totalPages => {
        pagination.innerHTML = "";

        if (totalPages <= 1) {
            return;
        }

        const previous = document.createElement("button");
        previous.textContent = "‹";
        previous.disabled = currentPage === 1;

        previous.addEventListener("click", () => {
            currentPage--;
            renderProducts();
        });

        pagination.appendChild(previous);

        for (let page = 1; page <= totalPages; page++) {
            const button = document.createElement("button");
            button.textContent = page;

            if (page === currentPage) {
                button.classList.add("is-active");
            }

            button.addEventListener("click", () => {
                currentPage = page;
                renderProducts();
                window.scrollTo({
                    top: document.querySelector(".ss-shop-page").offsetTop - 90,
                    behavior: "smooth"
                });
            });

            pagination.appendChild(button);
        }

        const next = document.createElement("button");
        next.textContent = "›";
        next.disabled = currentPage === totalPages;

        next.addEventListener("click", () => {
            currentPage++;
            renderProducts();
        });

        pagination.appendChild(next);
    };

    const renderActiveFilters = () => {
        activeFilters.innerHTML = "";

        const categories = getCategoryFilters();
        const availability = getAvailabilityFilters();
        const rating = getRatingFilter();
        const price = Number(priceFilter?.value || 10000);

        const addFilter = (label, callback) => {
            const element = document.createElement("span");
            element.className = "ss-active-filter";
            element.innerHTML = `
                ${label}
                <button type="button" aria-label="Remove filter">×</button>
            `;

            element.querySelector("button").addEventListener("click", callback);

            activeFilters.appendChild(element);
        };

        categories.forEach(category => {
            addFilter(category, () => {
                const checkbox = [...document.querySelectorAll("[data-filter-category]")]
                    .find(input => input.value === category);

                if (checkbox) {
                    checkbox.checked = false;
                }

                currentPage = 1;
                renderProducts();
            });
        });

        availability.forEach(value => {
            addFilter(value, () => {
                const checkbox = [...document.querySelectorAll("[data-filter-availability]")]
                    .find(input => input.value === value);

                if (checkbox) {
                    checkbox.checked = false;
                }

                currentPage = 1;
                renderProducts();
            });
        });

        if (rating > 0) {
            addFilter(`${rating}+ stars`, () => {
                const anyRating = document.querySelector("input[name='ratingFilter'][value='0']");

                if (anyRating) {
                    anyRating.checked = true;
                }

                currentPage = 1;
                renderProducts();
            });
        }

        if (price < 10000) {
            addFilter(`Under ₹${price.toLocaleString("en-IN")}`, () => {
                priceFilter.value = 10000;
                priceValue.textContent = "₹10,000";
                currentPage = 1;
                renderProducts();
            });
        }
    };

    const clearFilters = () => {
        document.querySelectorAll("[data-filter-category]").forEach(input => {
            input.checked = false;
        });

        document.querySelectorAll("[data-filter-availability]").forEach(input => {
            input.checked = false;
        });

        const anyRating = document.querySelector("input[name='ratingFilter'][value='0']");

        if (anyRating) {
            anyRating.checked = true;
        }

        if (searchInput) {
            searchInput.value = "";
        }

        if (priceFilter) {
            priceFilter.value = 10000;
        }

        if (priceValue) {
            priceValue.textContent = "₹10,000";
        }

        if (sortSelect) {
            sortSelect.value = "featured";
        }

        currentPage = 1;
        renderProducts();
    };

    searchInput?.addEventListener("input", () => {
        currentPage = 1;
        renderProducts();
    });

    sortSelect?.addEventListener("change", () => {
        currentPage = 1;
        renderProducts();
    });

    priceFilter?.addEventListener("input", () => {
        priceValue.textContent = `₹${Number(priceFilter.value).toLocaleString("en-IN")}`;
        currentPage = 1;
        renderProducts();
    });

    document.querySelectorAll("[data-filter-category]").forEach(input => {
        input.addEventListener("change", () => {
            currentPage = 1;
            renderProducts();
        });
    });

    document.querySelectorAll("[data-filter-availability]").forEach(input => {
        input.addEventListener("change", () => {
            currentPage = 1;
            renderProducts();
        });
    });

    document.querySelectorAll("input[name='ratingFilter']").forEach(input => {
        input.addEventListener("change", () => {
            currentPage = 1;
            renderProducts();
        });
    });

    document.querySelectorAll(".ss-clear-filter").forEach(button => {
        button.addEventListener("click", () => {
            const filterType = button.dataset.clear;

            if (filterType === "category") {
                document.querySelectorAll("[data-filter-category]").forEach(input => {
                    input.checked = false;
                });
            }

            currentPage = 1;
            renderProducts();
        });
    });

    clearAllFilters?.addEventListener("click", clearFilters);
    emptyClearFilters?.addEventListener("click", clearFilters);

    filterToggle?.addEventListener("click", () => {
        shopFilters?.classList.add("is-open");
        filterOverlay?.classList.add("is-visible");
    });

    filterClose?.addEventListener("click", () => {
        shopFilters?.classList.remove("is-open");
        filterOverlay?.classList.remove("is-visible");
    });

    filterOverlay?.addEventListener("click", () => {
        shopFilters?.classList.remove("is-open");
        filterOverlay?.classList.remove("is-visible");
    });

    renderProducts();
})();
(() => {
    const mainImage = document.getElementById("mainProductImage");
    const thumbnails = document.querySelectorAll(".ss-product-thumb");

    if (mainImage && thumbnails.length) {
        thumbnails.forEach(thumbnail => {
            thumbnail.addEventListener("click", () => {
                const image = thumbnail.querySelector("img");

                if (!image) {
                    return;
                }

                mainImage.src = image.src;

                thumbnails.forEach(item => {
                    item.classList.remove("is-active");
                });

                thumbnail.classList.add("is-active");
            });
        });
    }

    const quantityInput = document.getElementById("productQuantity");
    const quantityMinus = document.getElementById("quantityMinus");
    const quantityPlus = document.getElementById("quantityPlus");

    quantityMinus?.addEventListener("click", () => {
        const current = Number(quantityInput.value || 1);

        if (current > 1) {
            quantityInput.value = current - 1;
        }
    });

    quantityPlus?.addEventListener("click", () => {
        const current = Number(quantityInput.value || 1);

        if (current < 10) {
            quantityInput.value = current + 1;
        }
    });

    quantityInput?.addEventListener("change", () => {
        let value = Number(quantityInput.value || 1);

        if (value < 1) {
            value = 1;
        }

        if (value > 10) {
            value = 10;
        }

        quantityInput.value = value;
    });

    const wishlistButton = document.getElementById("detailWishlist");

    wishlistButton?.addEventListener("click", () => {
        wishlistButton.classList.toggle("is-active");

        const active = wishlistButton.classList.contains("is-active");

        if (typeof window.showToast === "function") {
            window.showToast(
                "Wishlist",
                active
                    ? "Product added to your wishlist."
                    : "Product removed from your wishlist."
            );
        }
    });

    const addCartButton = document.getElementById("detailAddCart");

    addCartButton?.addEventListener("click", () => {
        const quantity = Number(quantityInput?.value || 1);

        if (typeof window.showToast === "function") {
            window.showToast(
                "Added to Cart",
                `${quantity} item${quantity > 1 ? "s" : ""} added to your cart.`
            );
        }
    });

    const buyNowButton = document.getElementById("detailBuyNow");

    buyNowButton?.addEventListener("click", () => {
        if (typeof window.showToast === "function") {
            window.showToast(
                "Buy Now",
                "Checkout will be connected in a later frontend stage."
            );
        }
    });

    const detailTabs = document.querySelectorAll(".ss-detail-tab");
    const detailContents = document.querySelectorAll(".ss-detail-tab-content");

    detailTabs.forEach(tab => {
        tab.addEventListener("click", () => {
            const target = tab.dataset.tab;

            detailTabs.forEach(item => {
                item.classList.remove("is-active");
            });

            detailContents.forEach(content => {
                content.classList.remove("is-active");
            });

            tab.classList.add("is-active");

            document
                .querySelector(`[data-content="${target}"]`)
                ?.classList.add("is-active");
        });
    });
})();

(() => {
    const grid = document.getElementById("searchProductGrid");

    if (!grid || typeof searchProducts === "undefined") {
        return;
    }

    const searchInput = document.getElementById("searchResultsInput");
    const searchButton = document.getElementById("searchResultsButton");
    const sortSelect = document.getElementById("searchSort");

    const priceFilter = document.getElementById("searchPriceFilter");
    const priceValue = document.getElementById("searchPriceValue");

    const resultCount = document.getElementById("searchResultCount");
    const visibleCount = document.getElementById("searchVisibleCount");

    const pagination = document.getElementById("searchPagination");
    const emptyState = document.getElementById("searchEmpty");

    const activeFilters = document.getElementById("searchActiveFilters");

    const filterOpen = document.getElementById("searchFilterOpen");
    const filterClose = document.getElementById("searchFilterClose");
    const filterOverlay = document.getElementById("searchFilterOverlay");
    const filterPanel = document.getElementById("searchFilters");

    const clearFilters = document.getElementById("searchClearFilters");
    const emptyClear = document.getElementById("searchEmptyClear");

    let currentPage = 1;
    const pageSize = 6;

    const getQuery = () => {
        return searchInput?.value.trim().toLowerCase() || "";
    };

    const getCategories = () => {
        return [...document.querySelectorAll("[data-search-category]:checked")]
            .map(input => input.value);
    };

    const getAvailability = () => {
        return [...document.querySelectorAll("[data-search-availability]:checked")]
            .map(input => input.value);
    };

    const getRating = () => {
        return Number(
            document.querySelector("input[name='searchRating']:checked")?.value || 0
        );
    };

    const getResults = () => {
        const query = getQuery();
        const categories = getCategories();
        const availability = getAvailability();
        const maxPrice = Number(priceFilter?.value || 10000);
        const minimumRating = getRating();

        let results = searchProducts.filter(product => {

            const matchesSearch =
                !query ||
                product.Name.toLowerCase().includes(query) ||
                product.Brand.toLowerCase().includes(query) ||
                product.Category.toLowerCase().includes(query);

            const matchesCategory =
                categories.length === 0 ||
                categories.includes(product.Category);

            const matchesAvailability =
                availability.length === 0 ||
                availability.includes(product.Availability);

            const matchesPrice =
                Number(product.Price) <= maxPrice;

            const matchesRating =
                Number(product.Rating) >= minimumRating;

            return (
                matchesSearch &&
                matchesCategory &&
                matchesAvailability &&
                matchesPrice &&
                matchesRating
            );
        });

        const sort = sortSelect?.value || "featured";

        if (sort === "price-low") {
            results.sort((a, b) => Number(a.Price) - Number(b.Price));
        }

        if (sort === "price-high") {
            results.sort((a, b) => Number(b.Price) - Number(a.Price));
        }

        if (sort === "rating") {
            results.sort((a, b) => Number(b.Rating) - Number(a.Rating));
        }

        if (sort === "name") {
            results.sort((a, b) => a.Name.localeCompare(b.Name));
        }

        return results;
    };

    const getAvailabilityClass = value => {
        if (value === "In Stock") {
            return "stock";
        }

        if (value === "Low Stock") {
            return "low";
        }

        return "out";
    };

    const performSearch = () => {
        const query = searchInput?.value.trim() || "";

        window.location.href =
            `/Search?query=${encodeURIComponent(query)}`;
    };

    const renderResults = () => {
        const results = getResults();

        const totalPages = Math.max(
            1,
            Math.ceil(results.length / pageSize)
        );

        if (currentPage > totalPages) {
            currentPage = totalPages;
        }

        const startIndex = (currentPage - 1) * pageSize;

        const visibleProducts = results.slice(
            startIndex,
            startIndex + pageSize
        );

        grid.innerHTML = "";

        resultCount.textContent =
            `${results.length} ${results.length === 1 ? "result" : "results"}`;

        visibleCount.textContent =
            `${results.length} ${results.length === 1 ? "result" : "results"}`;

        if (results.length === 0) {
            emptyState.classList.add("is-visible");
            pagination.innerHTML = "";
            renderActiveFilters();
            return;
        }

        emptyState.classList.remove("is-visible");

        visibleProducts.forEach(product => {

            const oldPrice = product.OldPrice
                ? `<del>₹${Number(product.OldPrice).toLocaleString("en-IN")}</del>`
                : "";

            const disabled =
                product.Availability === "Out of Stock"
                    ? "disabled"
                    : "";

            const card = document.createElement("article");

            card.className = "ss-search-product-card";
            card.dataset.productId = product.Id;

            card.innerHTML = `
    <div class="ss-search-product-media">

        ${
            product.Id <= 5
                ? `<span class="ss-search-product-tag">Featured</span>`
                : ""
        }

        <button
            type="button"
            class="ss-search-wishlist"
            aria-label="Add ${product.Name} to wishlist">

            <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="m12 19-1.4-1.2C6 13.8 4 11.9 4 9.5 4 7.3 5.8 5.5 8 5.5c1.3 0 2.6.6 3.4 1.7C12.2 6.1 13.5 5.5 15 5.5c2.2 0 4 1.8 4 4 0 2.4-2 4.3-6.6 8.3z" />
            </svg>
        </button>

        <img
            src="${product.Image}"
            alt="${product.Name}"
            loading="lazy" />

    </div>

    <div class="ss-search-product-info">

        <span class="ss-search-product-category">
            ${product.Category}
        </span>

        <h3>${product.Name}</h3>

        <span class="ss-search-product-brand">
            ${product.Brand}
        </span>

        <div class="ss-search-product-rating">
            <span>★★★★★</span>
            <small>
                ${product.Rating} (${product.ReviewCount})
            </small>
        </div>

        <div class="ss-search-product-price">
            <strong>
                ₹${Number(product.Price).toLocaleString("en-IN")}
            </strong>
            ${oldPrice}
        </div>

        <span class="ss-search-product-availability ${getAvailabilityClass(product.Availability)}">
            ${product.Availability}
        </span>

        <div class="ss-search-product-actions">

            <a
                href="/Product/Details/${product.Id}"
                class="ss-search-details">
                View Details
            </a>

            <button
                type="button"
                class="ss-search-add-cart"
                ${disabled}>
                ${
                    product.Availability === "Out of Stock"
                        ? "Unavailable"
                        : "Add to Cart"
                }
            </button>

        </div>

    </div>
`;

            grid.appendChild(card);

            const wishlistButton =
                card.querySelector(".ss-search-wishlist");

            wishlistButton.addEventListener("click", () => {

                wishlistButton.classList.toggle("is-active");

                const active =
                    wishlistButton.classList.contains("is-active");

                if (typeof window.showToast === "function") {
                    window.showToast(
                        "Wishlist",
                        active
                            ? `${product.Name} added to your wishlist.`
                            : `${product.Name} removed from your wishlist.`
                    );
                }
            });

            const cartButton =
                card.querySelector(".ss-search-add-cart");

            cartButton.addEventListener("click", () => {

                if (cartButton.disabled) {
                    return;
                }

                if (typeof window.showToast === "function") {
                    window.showToast(
                        "Added to Cart",
                        `${product.Name} was added to your cart.`
                    );
                }
            });
        });

        renderPagination(totalPages);
        renderActiveFilters();
    };

    const renderPagination = totalPages => {

        pagination.innerHTML = "";

        if (totalPages <= 1) {
            return;
        }

        const previous = document.createElement("button");

        previous.textContent = "‹";
        previous.disabled = currentPage === 1;

        previous.addEventListener("click", () => {
            currentPage--;
            renderResults();
        });

        pagination.appendChild(previous);

        for (let page = 1; page <= totalPages; page++) {

            const button = document.createElement("button");

            button.textContent = page;

            if (page === currentPage) {
                button.classList.add("is-active");
            }

            button.addEventListener("click", () => {
                currentPage = page;
                renderResults();

                window.scrollTo({
                    top: document.querySelector(".ss-search-results-page").offsetTop - 90,
                    behavior: "smooth"
                });
            });

            pagination.appendChild(button);
        }

        const next = document.createElement("button");

        next.textContent = "›";
        next.disabled = currentPage === totalPages;

        next.addEventListener("click", () => {
            currentPage++;
            renderResults();
        });

        pagination.appendChild(next);
    };

    const renderActiveFilters = () => {

        activeFilters.innerHTML = "";

        const categories = getCategories();
        const availability = getAvailability();
        const rating = getRating();
        const price = Number(priceFilter?.value || 10000);

        const addChip = (label, callback) => {

            const chip = document.createElement("span");

            chip.className = "ss-search-filter-chip";

            chip.innerHTML = `
                ${label}
                <button type="button">×</button>
            `;

            chip.querySelector("button")
                .addEventListener("click", callback);

            activeFilters.appendChild(chip);
        };

        categories.forEach(category => {

            addChip(category, () => {

                const checkbox =
                    [...document.querySelectorAll("[data-search-category]")]
                        .find(input => input.value === category);

                if (checkbox) {
                    checkbox.checked = false;
                }

                currentPage = 1;
                renderResults();
            });
        });

        availability.forEach(value => {

            addChip(value, () => {

                const checkbox =
                    [...document.querySelectorAll("[data-search-availability]")]
                        .find(input => input.value === value);

                if (checkbox) {
                    checkbox.checked = false;
                }

                currentPage = 1;
                renderResults();
            });
        });

        if (rating > 0) {

            addChip(`${rating}+ stars`, () => {

                const anyRating =
                    document.querySelector(
                        "input[name='searchRating'][value='0']"
                    );

                if (anyRating) {
                    anyRating.checked = true;
                }

                currentPage = 1;
                renderResults();
            });
        }

        if (price < 10000) {

            addChip(
                `Under ₹${price.toLocaleString("en-IN")}`,
                () => {

                    priceFilter.value = 10000;
                    priceValue.textContent = "₹10,000";

                    currentPage = 1;
                    renderResults();
                }
            );
        }
    };

    const clearAllFilters = () => {

        document
            .querySelectorAll("[data-search-category]")
            .forEach(input => {
                input.checked = false;
            });

        document
            .querySelectorAll("[data-search-availability]")
            .forEach(input => {
                input.checked = false;
            });

        const anyRating =
            document.querySelector(
                "input[name='searchRating'][value='0']"
            );

        if (anyRating) {
            anyRating.checked = true;
        }

        priceFilter.value = 10000;
        priceValue.textContent = "₹10,000";

        currentPage = 1;

        renderResults();
    };

    document
        .querySelectorAll("[data-search-category]")
        .forEach(input => {

            input.addEventListener("change", () => {
                currentPage = 1;
                renderResults();
            });

        });

    document
        .querySelectorAll("[data-search-availability]")
        .forEach(input => {

            input.addEventListener("change", () => {
                currentPage = 1;
                renderResults();
            });

        });

    document
        .querySelectorAll("input[name='searchRating']")
        .forEach(input => {

            input.addEventListener("change", () => {
                currentPage = 1;
                renderResults();
            });

        });

    priceFilter?.addEventListener("input", () => {

        priceValue.textContent =
            `₹${Number(priceFilter.value).toLocaleString("en-IN")}`;

        currentPage = 1;

        renderResults();
    });

    sortSelect?.addEventListener("change", () => {

        currentPage = 1;

        renderResults();
    });

    searchButton?.addEventListener("click", performSearch);

    searchInput?.addEventListener("keydown", event => {

        if (event.key === "Enter") {
            performSearch();
        }
    });

    document
        .querySelectorAll("[data-search-term]")
        .forEach(button => {

            button.addEventListener("click", () => {

                const term = button.dataset.searchTerm;

                window.location.href =
                    `/Search?query=${encodeURIComponent(term)}`;
            });

        });

    clearFilters?.addEventListener(
        "click",
        clearAllFilters
    );

    emptyClear?.addEventListener("click", () => {

        window.location.href = "/Search";
    });

    filterOpen?.addEventListener("click", () => {

        filterPanel?.classList.add("is-open");
        filterOverlay?.classList.add("is-visible");

    });

    filterClose?.addEventListener("click", () => {

        filterPanel?.classList.remove("is-open");
        filterOverlay?.classList.remove("is-visible");

    });

    filterOverlay?.addEventListener("click", () => {

        filterPanel?.classList.remove("is-open");
        filterOverlay?.classList.remove("is-visible");

    });

    renderResults();
})();
document.addEventListener("DOMContentLoaded", function () {
    const modal = document.getElementById("addressModal");
    const form = document.getElementById("addressForm");
    const grid = document.getElementById("addressGrid");
    const addButton = document.getElementById("addAddressButton");
    const closeButton = document.getElementById("addressModalClose");
    const backdrop = document.getElementById("addressModalBackdrop");
    const cancelButton = document.getElementById("addressCancel");
    const modalTitle = document.getElementById("addressModalTitle");
    const addressId = document.getElementById("addressId");
    const name = document.getElementById("addressName");
    const phone = document.getElementById("addressPhone");
    const line = document.getElementById("addressLine");
    const city = document.getElementById("addressCity");
    const state = document.getElementById("addressState");
    const pincode = document.getElementById("addressPincode");
    const type = document.getElementById("addressType");
    const isDefault = document.getElementById("addressDefault");

    if (!modal || !form || !grid) return;

    const openModal = (editCard = null) => {
        form.reset();
        addressId.value = "";
        isDefault.checked = false;

        if (editCard) {
            modalTitle.textContent = "Edit Address";
            addressId.value = editCard.dataset.addressId;
            const values = editCard.querySelectorAll(".ss-address-body p");
            const title = editCard.querySelector("h2");
            const person = editCard.querySelector(".ss-address-body strong");
            const phoneValue = editCard.querySelector(".ss-address-phone");

            name.value = person?.textContent.trim() || "";
            phone.value = phoneValue?.textContent.trim() || "";
            line.value = values[0]?.textContent.trim() || "";
            city.value = (values[2]?.textContent || "").split(",")[0].trim();
            state.value = ((values[2]?.textContent || "").split(",")[1] || "").trim();
            pincode.value = ((values[2]?.textContent || "").match(/\d{6}/) || [""])[0];
            type.value = title?.textContent.replace(" Address", "").trim() || "Home";
            isDefault.checked = editCard.classList.contains("ss-address-default");
        } else {
            modalTitle.textContent = "Add New Address";
        }

        modal.classList.add("is-open");
        document.body.style.overflow = "hidden";
    };

    const closeModal = () => {
        modal.classList.remove("is-open");
        document.body.style.overflow = "";
    };

    addButton?.addEventListener("click", () => openModal());
    closeButton?.addEventListener("click", closeModal);
    backdrop?.addEventListener("click", closeModal);
    cancelButton?.addEventListener("click", closeModal);

    document.addEventListener("click", function (event) {
        const editButton = event.target.closest(".ss-edit-address");
        const deleteButton = event.target.closest(".ss-delete-address");
        const defaultButton = event.target.closest(".ss-set-default");

        if (editButton) {
            const card = editButton.closest(".ss-address-card");
            if (card) openModal(card);
        }

        if (deleteButton) {
            const card = deleteButton.closest(".ss-address-card");
            if (!card) return;

            if (confirm("Are you sure you want to delete this address?")) {
                card.remove();
            }
        }

        if (defaultButton) {
            const card = defaultButton.closest(".ss-address-card");
            if (!card) return;

            grid.querySelectorAll(".ss-address-card").forEach(item => {
                item.classList.remove("ss-address-default");

                const badge = item.querySelector(".ss-address-default-badge");
                if (badge) badge.remove();
            });

            card.classList.add("ss-address-default");

            const top = card.querySelector(".ss-address-card-top");
            if (top && !top.querySelector(".ss-address-default-badge")) {
                top.insertAdjacentHTML("beforeend", '<span class="ss-address-default-badge">Default</span>');
            }
        }
    });

    form.addEventListener("submit", function (event) {
        event.preventDefault();

        const id = addressId.value;

        if (id) {
            const card = grid.querySelector(`[data-address-id="${id}"]`);

            if (card) {
                card.querySelector("h2").textContent = `${type.value} Address`;

                const body = card.querySelector(".ss-address-body");
                body.innerHTML = `<strong>${name.value}</strong><p>${line.value}</p><p>${city.value}</p><p>${state.value}, India ${pincode.value}</p><span class="ss-address-phone">${phone.value}</span>`;
            }

            if (isDefault.checked && card) {
                grid.querySelectorAll(".ss-address-card").forEach(item => {
                    item.classList.remove("ss-address-default");
                    item.querySelector(".ss-address-default-badge")?.remove();
                });

                card.classList.add("ss-address-default");
                card.querySelector(".ss-address-card-top").insertAdjacentHTML("beforeend", '<span class="ss-address-default-badge">Default</span>');
            }
        } else {
            const newId = Date.now().toString();

            const card = document.createElement("article");
            card.className = "ss-address-card";
            card.dataset.addressId = newId;

            card.innerHTML = `
                <div class="ss-address-card-top">
                    <div>
                        <span class="ss-address-type">${type.value.toUpperCase()}</span>
                        <h2>${type.value} Address</h2>
                    </div>
                    ${isDefault.checked ? '<span class="ss-address-default-badge">Default</span>' : ""}
                </div>
                <div class="ss-address-body">
                    <strong>${name.value}</strong>
                    <p>${line.value}</p>
                    <p>${city.value}</p>
                    <p>${state.value}, India ${pincode.value}</p>
                    <span class="ss-address-phone">${phone.value}</span>
                </div>
                <div class="ss-address-actions">
                    ${isDefault.checked ? "" : '<button type="button" class="ss-address-action ss-set-default">Set as Default</button>'}
                    <button type="button" class="ss-address-action ss-edit-address" data-address-id="${newId}">
                        <svg viewBox="0 0 24 24" aria-hidden="true">
                            <path d="m4 16 9.5-9.5 4 4L8 20H4v-4Z"></path>
                            <path d="m14 6 2-2a2 2 0 0 1 3 3l-2 2"></path>
                        </svg>
                        Edit
                    </button>
                    <button type="button" class="ss-address-action ss-delete-address" data-address-id="${newId}">
                        <svg viewBox="0 0 24 24" aria-hidden="true">
                            <path d="M5 7h14M10 11v5M14 11v5"></path>
                            <path d="m9 7 1-3h4l1 3M7 7l1 14h8l1-14"></path>
                        </svg>
                        Delete
                    </button>
                </div>
            `;

            if (isDefault.checked) {
                grid.querySelectorAll(".ss-address-card").forEach(item => {
                    item.classList.remove("ss-address-default");
                    item.querySelector(".ss-address-default-badge")?.remove();
                });

                card.classList.add("ss-address-default");
            }

            grid.appendChild(card);
        }

        closeModal();
    });
});
document.addEventListener("DOMContentLoaded", function () {
    const grid = document.getElementById("wishlistGrid");
    const empty = document.getElementById("wishlistEmpty");
    const count = document.getElementById("wishlistCount");

    if (!grid || typeof wishlistProducts === "undefined") return;

    let storedWishlist = JSON.parse(localStorage.getItem("ssWishlist") || "null");

    if (!Array.isArray(storedWishlist)) {
        storedWishlist = wishlistProducts.map(product => product.Id);
        localStorage.setItem("ssWishlist", JSON.stringify(storedWishlist));
    }

    const getAvailabilityClass = value => {
        if (value === "In Stock") return "stock";
        if (value === "Low Stock") return "low";
        return "out";
    };

    const renderWishlist = () => {
        const products = wishlistProducts.filter(product => storedWishlist.includes(product.Id));

        grid.innerHTML = "";

        count.textContent = `${products.length} ${products.length === 1 ? "item" : "items"} saved`;

        if (products.length === 0) {
            empty.classList.add("is-visible");
            return;
        }

        empty.classList.remove("is-visible");

        products.forEach(product => {
            const card = document.createElement("article");

            card.className = "ss-wishlist-card";
            card.dataset.productId = product.Id;

            const disabled = product.Availability === "Out of Stock" ? "disabled" : "";

            card.innerHTML = `
                <div class="ss-wishlist-media">
                    <button type="button" class="ss-wishlist-remove" aria-label="Remove ${product.Name}">
                        <svg viewBox="0 0 24 24" aria-hidden="true">
                            <path d="M6 6l12 12M18 6 6 18"></path>
                        </svg>
                    </button>
                    <img src="${product.Image}" alt="${product.Name}" loading="lazy">
                </div>

                <div class="ss-wishlist-info">
                    <span class="ss-wishlist-category">${product.Category}</span>
                    <h2>${product.Name}</h2>
                    <span class="ss-wishlist-brand">${product.Brand}</span>

                    <div class="ss-wishlist-rating">
                        <span>★★★★★</span>
                        <small>${product.Rating} (${product.Reviews})</small>
                    </div>

                    <div class="ss-wishlist-price">
                        <strong>₹${Number(product.Price).toLocaleString("en-IN")}</strong>
                        <del>₹${Number(product.OldPrice).toLocaleString("en-IN")}</del>
                    </div>

                    <span class="ss-wishlist-availability ${getAvailabilityClass(product.Availability)}">
                        ${product.Availability}
                    </span>

                    <div class="ss-wishlist-actions">
                        <a href="/Product/Details/${product.Id}" class="ss-wishlist-view">
                            View Details
                        </a>

                        <button type="button" class="ss-wishlist-cart" ${disabled}>
                            ${product.Availability === "Out of Stock" ? "Unavailable" : "Add to Cart"}
                        </button>
                    </div>
                </div>
            `;

            grid.appendChild(card);

            card.querySelector(".ss-wishlist-remove").addEventListener("click", () => {
                storedWishlist = storedWishlist.filter(id => id !== product.Id);
                localStorage.setItem("ssWishlist", JSON.stringify(storedWishlist));
                renderWishlist();

                if (typeof window.showToast === "function") {
                    window.showToast("Wishlist", `${product.Name} removed from your wishlist.`);
                }
            });

            card.querySelector(".ss-wishlist-cart").addEventListener("click", event => {
                if (event.currentTarget.disabled) return;

                if (typeof window.showToast === "function") {
                    window.showToast("Added to Cart", `${product.Name} was added to your cart.`);
                }
            });
        });
    };

    renderWishlist();
});
document.addEventListener("click", function (event) {
    const button = event.target.closest(".ss-shop-wishlist, .ss-search-wishlist");

    if (!button) return;

    const card = button.closest("[data-product-id]");
    if (!card) return;

    const productId = Number(card.dataset.productId);
    if (!productId) return;

    let wishlist = JSON.parse(localStorage.getItem("ssWishlist") || "[]");

    if (button.classList.contains("is-active")) {
        if (!wishlist.includes(productId)) {
            wishlist.push(productId);
        }
    } else {
        wishlist = wishlist.filter(id => id !== productId);
    }

    localStorage.setItem("ssWishlist", JSON.stringify(wishlist));
});
document.addEventListener("DOMContentLoaded", function () {
    const cartItems = document.getElementById("cartItems");
    const cartEmpty = document.getElementById("cartEmpty");
    const cartCount = document.getElementById("cartItemCount");
    const subtotalElement = document.getElementById("cartSubtotal");
    const deliveryElement = document.getElementById("cartDelivery");
    const totalElement = document.getElementById("cartTotal");
    const checkoutButton = document.getElementById("cartCheckout");

    if (!cartItems || typeof cartProducts === "undefined") return;

    let cart = JSON.parse(localStorage.getItem("ssCart") || "[]");

    if (!Array.isArray(cart)) {
        cart = [];
    }

    const formatPrice = value => `₹${Number(value).toLocaleString("en-IN")}`;

    const renderCart = () => {
        cartItems.innerHTML = "";

        const items = cart
            .map(item => {
                const product = cartProducts.find(product => Number(product.Id) === Number(item.id));

                if (!product) return null;

                return {
                    product,
                    quantity: Math.max(1, Number(item.quantity) || 1)
                };
            })
            .filter(Boolean);

        const itemQuantity = items.reduce((sum, item) => sum + item.quantity, 0);

        const subtotal = items.reduce(
            (sum, item) => sum + Number(item.product.Price) * item.quantity,
            0
        );

        const delivery = items.length === 0 ? 0 : subtotal >= 999 ? 0 : 99;
        const total = subtotal + delivery;

        cartCount.textContent = `${itemQuantity} ${itemQuantity === 1 ? "item" : "items"}`;

        subtotalElement.textContent = formatPrice(subtotal);
        deliveryElement.textContent = delivery === 0 ? "Free" : formatPrice(delivery);
        totalElement.textContent = formatPrice(total);

        checkoutButton.disabled = items.length === 0;

        if (items.length === 0) {
            cartEmpty.classList.add("is-visible");
            return;
        }

        cartEmpty.classList.remove("is-visible");

        items.forEach(item => {
            const product = item.product;

            const element = document.createElement("article");
            element.className = "ss-cart-item";
            element.dataset.productId = product.Id;

            element.innerHTML = `
                <div class="ss-cart-item-image">
                    <img src="${product.Image}" alt="${product.Name}">
                </div>

                <div class="ss-cart-item-info">
                    <span class="ss-cart-item-category">${product.Category}</span>
                    <h3>${product.Name}</h3>
                    <span class="ss-cart-item-brand">${product.Brand}</span>
                    <div class="ss-cart-item-price">${formatPrice(product.Price)}</div>

                    <button type="button" class="ss-cart-remove">
                        <svg viewBox="0 0 24 24" aria-hidden="true">
                            <path d="M5 7h14M10 11v5M14 11v5"></path>
                            <path d="m9 7 1-3h4l1 3M7 7l1 14h8l1-14"></path>
                        </svg>
                        Remove
                    </button>
                </div>

                <div class="ss-cart-item-controls">
                    <div class="ss-cart-quantity">
                        <button type="button" class="ss-cart-decrease">−</button>
                        <span>${item.quantity}</span>
                        <button type="button" class="ss-cart-increase">+</button>
                    </div>

                    <div class="ss-cart-item-subtotal">
                        ${formatPrice(Number(product.Price) * item.quantity)}
                    </div>
                </div>
            `;

            cartItems.appendChild(element);
        });
    };

    cartItems.addEventListener("click", function (event) {
        const itemElement = event.target.closest(".ss-cart-item");

        if (!itemElement) return;

        const productId = Number(itemElement.dataset.productId);
        const item = cart.find(cartItem => Number(cartItem.id) === productId);

        if (!item) return;

        if (event.target.closest(".ss-cart-increase")) {
            item.quantity = Number(item.quantity) + 1;
        }

        if (event.target.closest(".ss-cart-decrease")) {
            item.quantity = Math.max(1, Number(item.quantity) - 1);
        }

        if (event.target.closest(".ss-cart-remove")) {
            cart = cart.filter(cartItem => Number(cartItem.id) !== productId);
        }

        localStorage.setItem("ssCart", JSON.stringify(cart));
        renderCart();
    });

    checkoutButton.addEventListener("click", function () {
        if (cart.length === 0) return;

        window.location.href = "/Checkout";
    });

    renderCart();
});

//  demo values Pre-fill the cart with two products if it's empty and there are at least two products available 
document.addEventListener("DOMContentLoaded", function () {
    if (window.location.pathname.toLowerCase() !== "/cart") return;

    const existingCart = JSON.parse(localStorage.getItem("ssCart") || "[]");

    if (existingCart.length === 0 && typeof cartProducts !== "undefined" && cartProducts.length >= 2) {
        localStorage.setItem("ssCart", JSON.stringify([
            { id: Number(cartProducts[0].Id), quantity: 1 },
            { id: Number(cartProducts[1].Id), quantity: 2 }
        ]));

        window.location.reload();
    }
});
document.addEventListener("DOMContentLoaded", function () {
    const checkoutProductsElement = document.getElementById("checkoutProducts");
    const checkoutSubtotal = document.getElementById("checkoutSubtotal");
    const checkoutDelivery = document.getElementById("checkoutDelivery");
    const checkoutTotal = document.getElementById("checkoutTotal");
    const checkoutSummaryCount = document.getElementById("checkoutSummaryCount");
    const placeOrderButton = document.getElementById("placeOrderButton");
    const checkoutSuccess = document.getElementById("checkoutSuccess");
    const checkoutSuccessText = document.getElementById("checkoutSuccessText");

    if (!checkoutProductsElement || typeof checkoutProducts === "undefined") return;

    let cart = JSON.parse(localStorage.getItem("ssCart") || "[]");

    if (!Array.isArray(cart)) {
        cart = [];
    }

    const formatPrice = value => `₹${Number(value).toLocaleString("en-IN")}`;

    const renderCheckout = () => {
        checkoutProductsElement.innerHTML = "";

        const items = cart
            .map(item => {
                const product = checkoutProducts.find(
                    product => Number(product.Id) === Number(item.id)
                );

                if (!product) return null;

                return {
                    product,
                    quantity: Math.max(1, Number(item.quantity) || 1)
                };
            })
            .filter(Boolean);

        const itemQuantity = items.reduce(
            (sum, item) => sum + item.quantity,
            0
        );

        const subtotal = items.reduce(
            (sum, item) =>
                sum + Number(item.product.Price) * item.quantity,
            0
        );

        const delivery = items.length === 0
            ? 0
            : subtotal >= 999
                ? 0
                : 99;

        const total = subtotal + delivery;

        checkoutSummaryCount.textContent =
            `${itemQuantity} ${itemQuantity === 1 ? "item" : "items"}`;

        checkoutSubtotal.textContent = formatPrice(subtotal);
        checkoutDelivery.textContent =
            delivery === 0 ? "Free" : formatPrice(delivery);
        checkoutTotal.textContent = formatPrice(total);

        placeOrderButton.disabled = items.length === 0;

        if (items.length === 0) {
            checkoutProductsElement.innerHTML = `
                <div class="ss-checkout-empty">
                    <strong>Your cart is empty.</strong>
                    <span>Add products to continue to checkout.</span>
                </div>
            `;
            return;
        }

        items.forEach(item => {
            const product = item.product;

            const element = document.createElement("div");
            element.className = "ss-checkout-product";

            element.innerHTML = `
                <div class="ss-checkout-product-image">
                    <img src="${product.Image}" alt="${product.Name}">
                </div>
                <div class="ss-checkout-product-info">
                    <strong>${product.Name}</strong>
                    <span>Qty: ${item.quantity}</span>
                </div>
                <div class="ss-checkout-product-price">
                    ${formatPrice(Number(product.Price) * item.quantity)}
                </div>
            `;

            checkoutProductsElement.appendChild(element);
        });
    };

    document.querySelectorAll('input[name="checkoutAddress"]').forEach(input => {
        input.addEventListener("change", function () {
            document.querySelectorAll(".ss-address-choice").forEach(option => {
                option.classList.remove("is-selected");
            });

            this.closest(".ss-address-choice").classList.add("is-selected");
        });
    });

    document.querySelectorAll('input[name="paymentMethod"]').forEach(input => {
        input.addEventListener("change", function () {
            document.querySelectorAll(".ss-payment-option").forEach(option => {
                option.classList.remove("is-selected");
            });

            this.closest(".ss-payment-option").classList.add("is-selected");
        });
    });

    placeOrderButton.addEventListener("click", function () {
        if (cart.length === 0) return;

        const name = document.getElementById("checkoutName").value.trim();
        const email = document.getElementById("checkoutEmail").value.trim();
        const phone = document.getElementById("checkoutPhone").value.trim();

        if (!name || !email || !phone) {
            if (typeof showToast === "function") {
                showToast("Please complete your customer information.");
            }
            return;
        }

        const orderId = `SS-${Date.now().toString().slice(-6)}`;
        const selectedPayment = document.querySelector(
            'input[name="paymentMethod"]:checked'
        );

        const orders = JSON.parse(
            localStorage.getItem("ssOrders") || "[]"
        );

       const order = {
    id: orderId,
    date: new Date().toISOString(),
    customerName: name,
    email,
    phone,
    payment: selectedPayment
        ? selectedPayment.value
        : "cod",
    status: "Confirmed",
    items: cart,
    total: Number(total)
};

        orders.unshift(order);

        localStorage.setItem(
            "ssOrders",
            JSON.stringify(orders)
        );

        localStorage.removeItem("ssCart");

        checkoutSuccessText.textContent =
            `Order ${orderId} has been created successfully for ${name}.`;

        checkoutSuccess.classList.add("is-visible");
        placeOrderButton.disabled = true;

        renderCheckout();

        window.scrollTo({
            top: checkoutSuccess.offsetTop - 100,
            behavior: "smooth"
        });
    });

    renderCheckout();
});
document.addEventListener("DOMContentLoaded", function () {
    const ordersList = document.getElementById("ordersList");
    const ordersEmpty = document.getElementById("ordersEmpty");
    const ordersCount = document.getElementById("ordersCount");
    const statusFilter = document.getElementById("orderStatusFilter");

    if (!ordersList || !ordersEmpty) return;

    const demoOrders = [
        {
            id: "SS-248531",
            date: "2026-09-27T11:30:00",
            itemCount: 2,
            total: 2498,
            payment: "Cash on Delivery",
            status: "Delivered"
        },
        {
            id: "SS-247918",
            date: "2026-09-21T15:10:00",
            itemCount: 1,
            total: 1299,
            payment: "Demo Payment",
            status: "Shipped"
        },
        {
            id: "SS-246744",
            date: "2026-09-14T09:45:00",
            itemCount: 3,
            total: 4297,
            payment: "Cash on Delivery",
            status: "Confirmed"
        },
        {
            id: "SS-245981",
            date: "2026-09-05T18:25:00",
            itemCount: 1,
            total: 899,
            payment: "Demo Payment",
            status: "Cancelled"
        }
    ];

    const getOrders = () => {
        let orders = JSON.parse(localStorage.getItem("ssOrders") || "[]");

        if (!Array.isArray(orders)) {
            orders = [];
        }

        if (orders.length === 0) {
            return demoOrders;
        }

        return orders.map(order => {
            const items = Array.isArray(order.items)
                ? order.items
                : [];

            return {
                id: order.id || "SS-000000",
                date: order.date || new Date().toISOString(),
                itemCount: items.reduce(
                    (sum, item) => sum + Math.max(1, Number(item.quantity) || 1),
                    0
                ),
                total: Number(order.total) || 0,
                payment: order.payment === "demo"
                    ? "Demo Payment"
                    : "Cash on Delivery",
                status: order.status || "Confirmed"
            };
        });
    };

    const formatPrice = value =>
        `₹${Number(value).toLocaleString("en-IN")}`;

    const formatDate = value => {
        const date = new Date(value);

        return date.toLocaleDateString("en-IN", {
            day: "2-digit",
            month: "short",
            year: "numeric"
        });
    };

    const statusClass = status =>
        status
            .toLowerCase()
            .replace(/\s+/g, "-");

    const renderOrders = () => {
        const orders = getOrders();
        const selectedStatus = statusFilter.value;

        const filteredOrders = selectedStatus === "all"
            ? orders
            : orders.filter(order => order.status === selectedStatus);

        ordersList.innerHTML = "";

        ordersCount.textContent =
            `${filteredOrders.length} ${filteredOrders.length === 1 ? "order" : "orders"}`;

        if (filteredOrders.length === 0) {
            ordersEmpty.classList.add("is-visible");
            return;
        }

        ordersEmpty.classList.remove("is-visible");

        filteredOrders.forEach(order => {
            const element = document.createElement("article");

            element.className = "ss-order-card";

            element.innerHTML = `
                <div class="ss-order-top">
                    <div class="ss-order-reference">
                        <span>Order ID</span>
                        <strong>${order.id}</strong>
                    </div>

                    <span class="ss-order-status ${statusClass(order.status)}">
                        ${order.status}
                    </span>
                </div>

                <div class="ss-order-content">
                    <div class="ss-order-details-grid">
                        <div class="ss-order-detail">
                            <span>Order Date</span>
                            <strong>${formatDate(order.date)}</strong>
                        </div>

                        <div class="ss-order-detail">
                            <span>Products</span>
                            <strong>${order.itemCount} ${order.itemCount === 1 ? "product" : "products"}</strong>
                        </div>

                        <div class="ss-order-detail ss-order-total">
                            <span>Total</span>
                            <strong>${formatPrice(order.total)}</strong>
                        </div>

                        <div class="ss-order-detail">
                            <span>Payment</span>
                            <strong>${order.payment}</strong>
                        </div>
                    </div>

                    <div class="ss-order-actions">
                        <a href="/account/orders/details?orderId=${encodeURIComponent(order.id)}" class="ss-order-view-btn">
                            <svg viewBox="0 0 24 24" aria-hidden="true">
                                <path d="M2.5 12s3.5-6 9.5-6 9.5 6 9.5 6-3.5 6-9.5 6-9.5-6-9.5-6Z"></path>
                                <circle cx="12" cy="12" r="2.5"></circle>
                            </svg>
                            View Details
                        </a>

                        <a href="/account/orders/tracking?orderId=${encodeURIComponent(order.id)}" class="ss-order-track-btn">
                            <svg viewBox="0 0 24 24" aria-hidden="true">
                                <path d="M3 6h11v11H3z"></path>
                                <path d="M14 10h4l3 3v4h-7"></path>
                                <circle cx="7" cy="19" r="1.5"></circle>
                                <circle cx="18" cy="19" r="1.5"></circle>
                            </svg>
                            Track Order
                        </a>
                    </div>
                </div>
            `;

            ordersList.appendChild(element);
        });
    };

    statusFilter.addEventListener("change", renderOrders);

    renderOrders();
});
document.addEventListener("DOMContentLoaded", function () {
    const orderItemsElement = document.getElementById("orderItems");
    const orderDetailsId = document.getElementById("orderDetailsId");
    const orderDetailsDate = document.getElementById("orderDetailsDate");
    const orderDetailsPayment = document.getElementById("orderDetailsPayment");
    const orderDetailsStatus = document.getElementById("orderDetailsStatus");
    const orderItemsCount = document.getElementById("orderItemsCount");
    const orderSubtotal = document.getElementById("orderSubtotal");
    const orderDelivery = document.getElementById("orderDelivery");
    const orderTotal = document.getElementById("orderTotal");
    const orderTrackButton = document.getElementById("orderTrackButton");
    const orderCustomerName = document.getElementById("orderCustomerName");
    const orderCustomerEmail = document.getElementById("orderCustomerEmail");
    const orderCustomerPhone = document.getElementById("orderCustomerPhone");
    const orderSupportButton = document.getElementById("orderSupportButton");

    if (!orderItemsElement || typeof orderDetailsProducts === "undefined") return;

    const params = new URLSearchParams(window.location.search);
    const requestedOrderId = params.get("orderId");

    let storedOrders = JSON.parse(
        localStorage.getItem("ssOrders") || "[]"
    );

    if (!Array.isArray(storedOrders)) {
        storedOrders = [];
    }

    const formatPrice = value =>
        `₹${Number(value).toLocaleString("en-IN")}`;

    const formatDate = value => {
        const date = new Date(value);

        return date.toLocaleDateString("en-IN", {
            day: "2-digit",
            month: "short",
            year: "numeric"
        });
    };

    const statusClass = status =>
        status
            .toLowerCase()
            .replace(/\s+/g, "-");

    const createDemoOrder = () => {
        const firstProduct = orderDetailsProducts[0];
        const secondProduct = orderDetailsProducts[1];

        const items = [];

        if (firstProduct) {
            items.push({
                id: Number(firstProduct.Id),
                quantity: 1
            });
        }

        if (secondProduct) {
            items.push({
                id: Number(secondProduct.Id),
                quantity: 2
            });
        }

        return {
            id: requestedOrderId || "SS-248531",
            date: "2026-09-27T11:30:00",
            customerName: "Veerendra Kadiyala",
            email: "veerendra@example.com",
            phone: "+91 98765 43210",
            payment: "cod",
            status: "Delivered",
            items
        };
    };

    const order =
        storedOrders.find(item => item.id === requestedOrderId) ||
        createDemoOrder();

    let items = Array.isArray(order.items)
        ? order.items
        : [];

    const resolvedItems = items
        .map(item => {
            const product = orderDetailsProducts.find(
                product => Number(product.Id) === Number(item.id)
            );

            if (!product) return null;

            return {
                product,
                quantity: Math.max(1, Number(item.quantity) || 1)
            };
        })
        .filter(Boolean);

    const subtotal = resolvedItems.reduce(
        (sum, item) =>
            sum + Number(item.product.Price) * item.quantity,
        0
    );

    const delivery = subtotal === 0
        ? 0
        : subtotal >= 999
            ? 0
            : 99;

    const total = Number(order.total) > 0
        ? Number(order.total)
        : subtotal + delivery;

    const payment =
        order.payment === "demo"
            ? "Demo Payment"
            : "Cash on Delivery";

    orderDetailsId.textContent =
        order.id || "SS-000000";

    orderDetailsDate.textContent =
        formatDate(order.date);

    orderDetailsPayment.textContent =
        payment;

    orderDetailsStatus.textContent =
        order.status || "Confirmed";

    orderDetailsStatus.className =
        `ss-order-status ${statusClass(order.status || "Confirmed")}`;

    orderCustomerName.textContent =
        order.customerName || "Veerendra Kadiyala";

    orderCustomerEmail.textContent =
        order.email || "veerendra@example.com";

    orderCustomerPhone.textContent =
        order.phone || "+91 98765 43210";

    orderItemsCount.textContent =
        `${resolvedItems.reduce((sum, item) => sum + item.quantity, 0)} items`;

    orderSubtotal.textContent =
        formatPrice(subtotal);

    orderDelivery.textContent =
        delivery === 0 ? "Free" : formatPrice(delivery);

    orderTotal.textContent =
        formatPrice(total);

    orderTrackButton.href =
        `/account/orders/tracking?orderId=${encodeURIComponent(order.id)}`;

    if (resolvedItems.length === 0) {
        orderItemsElement.innerHTML = `
            <div class="ss-order-missing">
                <strong>Order items are not available.</strong>
                <span>This demo order does not contain detailed item data.</span>
            </div>
        `;
    } else {
        resolvedItems.forEach(item => {
            const product = item.product;
            const itemSubtotal =
                Number(product.Price) * item.quantity;

            const element = document.createElement("article");

            element.className = "ss-order-item";

            element.innerHTML = `
                <div class="ss-order-item-image">
                    <img src="${product.Image}" alt="${product.Name}">
                </div>

                <div class="ss-order-item-info">
                    <span class="ss-order-item-category">${product.Category}</span>
                    <h3>${product.Name}</h3>
                    <span>${product.Brand} · Qty ${item.quantity}</span>
                </div>

                <div class="ss-order-item-price">
                    <span>${formatPrice(product.Price)} × ${item.quantity}</span>
                    <strong>${formatPrice(itemSubtotal)}</strong>
                </div>
            `;

            orderItemsElement.appendChild(element);
        });
    }

    orderSupportButton.addEventListener("click", function () {
        if (typeof showToast === "function") {
            showToast("Support contact is available in the full application.");
        }
    });
});
document.addEventListener("DOMContentLoaded", function () {
    const trackingOrderId = document.getElementById("trackingOrderId");
    const trackingOrderDate = document.getElementById("trackingOrderDate");
    const trackingPayment = document.getElementById("trackingPayment");
    const trackingTotal = document.getElementById("trackingTotal");
    const trackingStatus = document.getElementById("trackingStatus");
    const trackingHeading = document.getElementById("trackingHeading");
    const trackingMessageTitle = document.getElementById("trackingMessageTitle");
    const trackingMessageText = document.getElementById("trackingMessageText");
    const trackingDetailsButton = document.getElementById("trackingDetailsButton");
    const trackingCustomerName = document.getElementById("trackingCustomerName");
    const trackingAddress = document.getElementById("trackingAddress");
    const trackingPhone = document.getElementById("trackingPhone");
    const trackingException = document.getElementById("trackingException");
    const trackingExceptionTitle = document.getElementById("trackingExceptionTitle");
    const trackingExceptionText = document.getElementById("trackingExceptionText");
    const trackingSupportButton = document.getElementById("trackingSupportButton");
    const trackingLineActive = document.getElementById("trackingLineActive");
    const trackingSteps = document.querySelectorAll(".ss-tracking-step");

    if (!trackingOrderId) return;

    const params = new URLSearchParams(window.location.search);
    const requestedOrderId = params.get("orderId");

    let orders = JSON.parse(
        localStorage.getItem("ssOrders") || "[]"
    );

    if (!Array.isArray(orders)) {
        orders = [];
    }

    const demoOrder = {
        id: requestedOrderId || "SS-248531",
        date: "2026-09-27T11:30:00",
        customerName: "Veerendra Kadiyala",
        email: "veerendra@example.com",
        phone: "+91 98765 43210",
        payment: "cod",
        status: "Delivered",
        total: 2498
    };

    const order =
        orders.find(item => item.id === requestedOrderId) ||
        demoOrder;

    const formatPrice = value =>
        `₹${Number(value || 0).toLocaleString("en-IN")}`;

    const formatDate = value => {
        const date = new Date(value);

        return date.toLocaleDateString("en-IN", {
            day: "2-digit",
            month: "short",
            year: "numeric"
        });
    };

    const payment =
        order.payment === "demo"
            ? "Demo Payment"
            : "Cash on Delivery";

    const status =
        order.status || "Confirmed";

    const statusSteps = [
        "Confirmed",
        "Packed",
        "Shipped",
        "Out for Delivery",
        "Delivered"
    ];

    trackingOrderId.textContent =
        order.id || "SS-000000";

    trackingOrderDate.textContent =

        formatDate(order.date);

    trackingPayment.textContent =
        payment;

    trackingTotal.textContent =
        formatPrice(order.total);

    trackingStatus.textContent =
        status;

    trackingStatus.className =
        `ss-order-status ${status.toLowerCase().replace(/\s+/g, "-")}`;

    trackingDetailsButton.href =
        `/account/orders/details?orderId=${encodeURIComponent(order.id)}`;

    trackingCustomerName.textContent =
        order.customerName || "Veerendra Kadiyala";

    trackingPhone.textContent =
        order.phone || "+91 98765 43210";

    trackingAddress.textContent =
        order.address || "21 Lake View Road, Rajkot, Gujarat 360001";

    const exceptionStatuses = ["Cancelled", "Failed"];

    if (exceptionStatuses.includes(status)) {
        trackingException.classList.add("is-visible");

        trackingExceptionTitle.textContent =
            status === "Cancelled"
                ? "Order cancelled"
                : "Payment or order failed";

        trackingExceptionText.textContent =
            status === "Cancelled"
                ? "This order has been cancelled and will not continue through the delivery process."
                : "This order could not be completed successfully.";
    } else {
        trackingException.classList.remove("is-visible");
    }

    trackingSteps.forEach(step => {
        step.classList.remove("is-complete");
        step.classList.remove("is-current");
    });

    if (status === "Cancelled" || status === "Failed") {
        trackingHeading.textContent =
            status === "Cancelled"
                ? "This order was cancelled"
                : "This order could not be completed";

        trackingMessageTitle.textContent =
            status === "Cancelled"
                ? "Order cancelled"
                : "Order failed";

        trackingMessageText.textContent =
            status === "Cancelled"
                ? "The delivery timeline has stopped because this order was cancelled."
                : "The delivery timeline has stopped because this order failed.";

        trackingLineActive.style.width = "0%";
        return;
    }

    const currentIndex =
        statusSteps.indexOf(status);

    const safeIndex =
        currentIndex < 0 ? 0 : currentIndex;

    trackingSteps.forEach((step, index) => {
        if (index < safeIndex) {
            step.classList.add("is-complete");
        }

        if (index === safeIndex) {
            step.classList.add("is-current");
        }
    });

    const progress =
        safeIndex === 0
            ? 0
            : (safeIndex / (statusSteps.length - 1)) * 100;

    trackingLineActive.style.width =
        `${progress}%`;

    const statusMessages = {
        "Confirmed": {
            heading: "Your order is confirmed",
            title: "Order confirmed",
            text: "Your order has been received successfully and is being prepared."
        },
        "Packed": {
            heading: "Your order is packed",
            title: "Order packed",
            text: "Your items have been packed and are ready to leave the fulfillment center."
        },
        "Shipped": {
            heading: "Your order is on the way",
            title: "Order shipped",
            text: "Your package has been shipped and is currently in transit."
        },
        "Out for Delivery": {
            heading: "Your order is arriving today",
            title: "Out for delivery",
            text: "Your package is with the delivery team and is expected to arrive today."
        },
        "Delivered": {
            heading: "Your order has been delivered",
            title: "Order delivered",
            text: "Your order has been successfully delivered."
        }
    };

    const message =
        statusMessages[status] ||
        statusMessages["Confirmed"];

    trackingHeading.textContent =
        message.heading;

    trackingMessageTitle.textContent =
        message.title;

    trackingMessageText.textContent =
        message.text;

    trackingSupportButton.addEventListener("click", function () {
        if (typeof showToast === "function") {
            showToast("Support contact is available in the full application.");
        }
    });
});
document.addEventListener("DOMContentLoaded", function () {
    const reviewsList = document.getElementById("reviewsList");
    const reviewsEmpty = document.getElementById("reviewsEmpty");
    const statusFilter = document.getElementById("reviewStatusFilter");
    const reviewModal = document.getElementById("reviewModal");
    const reviewModalBackdrop = document.getElementById("reviewModalBackdrop");
    const reviewModalClose = document.getElementById("reviewModalClose");
    const reviewProduct = document.getElementById("reviewProduct");
    const reviewText = document.getElementById("reviewText");
    const submitReviewButton = document.getElementById("submitReviewButton");
    const writeReviewButton = document.getElementById("writeReviewButton");
    const emptyWriteReviewButton = document.getElementById("emptyWriteReviewButton");
    const reviewTotalCount = document.getElementById("reviewTotalCount");
    const reviewPublishedCount = document.getElementById("reviewPublishedCount");
    const reviewAverageRating = document.getElementById("reviewAverageRating");
    const ratingPicker = document.getElementById("ratingPicker");
    const ratingLabel = document.getElementById("ratingLabel");
    const productReviewGrid = document.getElementById("productReviewGrid");

    if (!reviewsList || typeof reviewProducts === "undefined") return;

    let savedReviews = JSON.parse(
        localStorage.getItem("ssReviews") || "null"
    );

    if (!Array.isArray(savedReviews)) {
        const first = reviewProducts[0];
        const second = reviewProducts[1];
        const third = reviewProducts[2];

        savedReviews = [
            {
                id: Date.now() - 3000,
                productId: first ? Number(first.Id) : 0,
                rating: 5,
                text: "Excellent quality and a smooth overall shopping experience.",
                date: "2026-09-26T10:30:00",
                status: "Published"
            },
            {
                id: Date.now() - 2000,
                productId: second ? Number(second.Id) : 0,
                rating: 4,
                text: "The product looks great and arrived in excellent condition.",
                date: "2026-09-21T14:15:00",
                status: "Published"
            },
            {
                id: Date.now() - 1000,
                productId: third ? Number(third.Id) : 0,
                rating: 5,
                text: "Very happy with the purchase. Would recommend this product.",
                date: "2026-09-16T09:20:00",
                status: "Pending"
            }
        ].filter(review => review.productId);

        localStorage.setItem(
            "ssReviews",
            JSON.stringify(savedReviews)
        );
    }

    let selectedRating = 0;

    const formatDate = value => {
        const date = new Date(value);

        return date.toLocaleDateString("en-IN", {
            day: "2-digit",
            month: "short",
            year: "numeric"
        });
    };

    const stars = rating =>
        "★★★★★".split("").map((star, index) =>
            index < Number(rating) ? "★" : "☆"
        ).join("");

    const getProduct = productId =>
        reviewProducts.find(
            product => Number(product.Id) === Number(productId)
        );

    const openModal = () => {
        reviewModal.classList.add("is-visible");
        document.body.style.overflow = "hidden";
    };

    const closeModal = () => {
        reviewModal.classList.remove("is-visible");
        document.body.style.overflow = "";
    };

    const updateRatingPicker = value => {
        selectedRating = Number(value);

        ratingPicker.querySelectorAll("button").forEach(button => {
            button.classList.toggle(
                "is-selected",
                Number(button.dataset.rating) <= selectedRating
            );
        });

        const labels = {
            1: "Poor",
            2: "Fair",
            3: "Good",
            4: "Very Good",
            5: "Excellent"
        };

        ratingLabel.textContent =
            labels[selectedRating] || "Select a rating";
    };

    const populateProducts = () => {
        reviewProduct.innerHTML = "";

        reviewProducts.forEach(product => {
            const option = document.createElement("option");

            option.value = product.Id;
            option.textContent = product.Name;

            reviewProduct.appendChild(option);
        });
    };

    const renderStats = () => {
        const published = savedReviews.filter(
            review => review.status === "Published"
        );

        const average =
            savedReviews.length === 0
                ? 0
                : savedReviews.reduce(
                    (sum, review) => sum + Number(review.rating),
                    0
                ) / savedReviews.length;

        reviewTotalCount.textContent =
            savedReviews.length;

        reviewPublishedCount.textContent =
            published.length;

        reviewAverageRating.textContent =
            average.toFixed(1);
    };

    const renderProductReviews = () => {
        const publicReviews = savedReviews
            .filter(review => review.status === "Published")
            .slice(0, 3);

        productReviewGrid.innerHTML = "";

        if (publicReviews.length === 0) {
            productReviewGrid.innerHTML = `
                <div class="ss-order-missing">
                    <strong>No published reviews yet.</strong>
                    <span>Be the first to share your experience.</span>
                </div>
            `;
            return;
        }

        publicReviews.forEach(review => {
            const product = getProduct(review.productId);

            if (!product) return;

            const element = document.createElement("article");

            element.className = "ss-product-review-card";

            element.innerHTML = `
                <div class="ss-product-review-top">
                    <div class="ss-product-review-avatar">VK</div>

                    <div class="ss-product-review-user">
                        <strong>Veerendra Kadiyala</strong>
                        <span>${formatDate(review.date)}</span>
                    </div>
                </div>

                <div class="ss-review-stars">${stars(review.rating)}</div>

                <h3>${product.Name}</h3>

                <p>${review.text}</p>
            `;

            productReviewGrid.appendChild(element);
        });
    };

    const renderReviews = () => {
        const selectedStatus = statusFilter.value;

        const filteredReviews =
            selectedStatus === "all"
                ? savedReviews
                : savedReviews.filter(
                    review => review.status === selectedStatus
                );

        reviewsList.innerHTML = "";

        if (filteredReviews.length === 0) {
            reviewsEmpty.classList.add("is-visible");
            return;
        }

        reviewsEmpty.classList.remove("is-visible");

        filteredReviews.forEach(review => {
            const product = getProduct(review.productId);

            if (!product) return;

            const element = document.createElement("article");

            element.className = "ss-review-card";

            element.innerHTML = `
                <div class="ss-review-product-image">
                    <img src="${product.Image}" alt="${product.Name}">
                </div>

                <div class="ss-review-content">
                    <span>${product.Category}</span>
                    <h3>${product.Name}</h3>

                    <div class="ss-review-stars">
                        ${stars(review.rating)}
                    </div>

                    <p class="ss-review-text">
                        ${review.text}
                    </p>

                    <div class="ss-review-meta">
                        <span>${formatDate(review.date)}</span>
                        <span>Veerendra Kadiyala</span>
                    </div>

                    <div class="ss-review-card-actions">
                        <button type="button" class="ss-review-delete" data-review-id="${review.id}">
                            Remove Review
                        </button>
                    </div>
                </div>

                <span class="ss-review-status ${review.status.toLowerCase()}">
                    ${review.status}
                </span>
            `;

            reviewsList.appendChild(element);
        });
    };

    ratingPicker.querySelectorAll("button").forEach(button => {
        button.addEventListener("click", function () {
            updateRatingPicker(this.dataset.rating);
        });
    });

    writeReviewButton.addEventListener("click", openModal);
    emptyWriteReviewButton.addEventListener("click", openModal);
    reviewModalBackdrop.addEventListener("click", closeModal);
    reviewModalClose.addEventListener("click", closeModal);

    document.addEventListener("keydown", function (event) {
        if (event.key === "Escape" && reviewModal.classList.contains("is-visible")) {
            closeModal();
        }
    });

    reviewText.addEventListener("input", function () {
        this.value = this.value.slice(0, 500);
    });

    submitReviewButton.addEventListener("click", function () {
        const productId = Number(reviewProduct.value);
        const text = reviewText.value.trim();

        if (!productId) {
            if (typeof showToast === "function") {
                showToast("Please select a product.");
            }
            return;
        }

        if (!selectedRating) {
            if (typeof showToast === "function") {
                showToast("Please select a rating.");
            }
            return;
        }

        if (text.length < 10) {
            if (typeof showToast === "function") {
                showToast("Please write at least 10 characters.");
            }
            return;
        }

        savedReviews.unshift({
            id: Date.now(),
            productId,
            rating: selectedRating,
            text,
            date: new Date().toISOString(),
            status: "Pending"
        });

        localStorage.setItem(
            "ssReviews",
            JSON.stringify(savedReviews)
        );

        reviewText.value = "";
        selectedRating = 0;
        updateRatingPicker(0);
        closeModal();
        renderStats();
        renderReviews();
        renderProductReviews();

        if (typeof showToast === "function") {
            showToast("Review submitted for approval.");
        }
    });

    reviewsList.addEventListener("click", function (event) {
        const button = event.target.closest(".ss-review-delete");

        if (!button) return;

        const reviewId = Number(button.dataset.reviewId);

        savedReviews = savedReviews.filter(
            review => Number(review.id) !== reviewId
        );

        localStorage.setItem(
            "ssReviews",
            JSON.stringify(savedReviews)
        );

        renderStats();
        renderReviews();
        renderProductReviews();

        if (typeof showToast === "function") {
            showToast("Review removed.");
        }
    });

    statusFilter.addEventListener("change", renderReviews);

    populateProducts();
    renderStats();
    renderReviews();
    renderProductReviews();
});
document.addEventListener("DOMContentLoaded", function () { const list = document.getElementById("notificationsList"); if (!list) return; const empty = document.getElementById("notificationsEmpty"); const filter = document.getElementById("notificationFilter"); const markAll = document.getElementById("markAllNotifications"); const total = document.getElementById("notificationTotal"); const unread = document.getElementById("notificationUnread"); const read = document.getElementById("notificationRead"); const statusText = document.getElementById("notificationStatusText"); const defaultNotifications = [{ id: "n1", title: "Order Confirmed", message: "Your order SS-248531 has been confirmed successfully.", date: "2026-09-30T10:30:00", type: "order", isRead: false }, { id: "n2", title: "Order Shipped", message: "Your order SS-247918 has been shipped and is on the way.", date: "2026-09-29T15:20:00", type: "shipping", isRead: false }, { id: "n3", title: "Order Delivered", message: "Your order SS-246744 has been delivered successfully.", date: "2026-09-28T12:10:00", type: "delivery", isRead: true }, { id: "n4", title: "Wishlist Item Back in Stock", message: "A product from your wishlist is available again.", date: "2026-09-27T09:45:00", type: "wishlist", isRead: false }, { id: "n5", title: "Order Confirmed", message: "Your order SS-245981 has been confirmed successfully.", date: "2026-09-25T17:35:00", type: "order", isRead: true }]; let notifications = JSON.parse(localStorage.getItem("ssNotifications") || "null"); if (!Array.isArray(notifications)) { notifications = defaultNotifications; localStorage.setItem("ssNotifications", JSON.stringify(notifications)) } function icon(type) { if (type === "shipping") return '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 6h11v11H3z"></path><path d="M14 9h4l3 3v5h-7z"></path><circle cx="7" cy="18" r="1.7"></circle><circle cx="18" cy="18" r="1.7"></circle></svg>'; if (type === "delivery") return '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m5 12 4 4L19 6"></path><circle cx="12" cy="12" r="9"></circle></svg>'; if (type === "wishlist") return '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m12 19-1.4-1.2C6 13.8 4 11.9 4 9.5 4 7.3 5.8 5.5 8 5.5c1.3 0 2.6.6 3.4 1.7C12.2 6.1 13.5 5.5 15 5.5c2.2 0 4 1.8 4 4 0 2.4-2 4.3-6.6 8.3z"></path></svg>'; return '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9"></path><path d="M10 21h4"></path></svg>' } function formatDate(value) { const date = new Date(value); return date.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) } function save() { localStorage.setItem("ssNotifications", JSON.stringify(notifications)) } function render() { const mode = filter.value; const filtered = notifications.filter(item => mode === "all" || (mode === "unread" && !item.isRead) || (mode === "read" && item.isRead)); total.textContent = notifications.length; unread.textContent = notifications.filter(item => !item.isRead).length; read.textContent = notifications.filter(item => item.isRead).length; statusText.textContent = mode === "all" ? "Your latest account activity appears here." : mode === "unread" ? "Showing unread notifications." : "Showing notifications you have already read."; list.innerHTML = filtered.map(item => '<article class="ss-notification-item ' + (item.isRead ? "ss-notification-read" : "ss-notification-unread") + '"><div class="ss-notification-dot"></div><div class="ss-notification-icon">' + icon(item.type) + '</div><div class="ss-notification-content"><div class="ss-notification-top"><h3 class="ss-notification-title">' + item.title + '</h3><span class="ss-notification-time">' + formatDate(item.date) + '</span></div><p class="ss-notification-message">' + item.message + '</p><div class="ss-notification-actions">' + (!item.isRead ? '<button type="button" class="ss-notification-read-btn" data-notification-id="' + item.id + '">Mark as read</button>' : '<span class="ss-notification-time">Read</span>') + '</div></div></article>').join(""); empty.hidden = filtered.length !== 0; list.querySelectorAll("[data-notification-id]").forEach(button => { button.addEventListener("click", function () { const item = notifications.find(notification => notification.id === button.dataset.notificationId); if (item) { item.isRead = true; save(); render(); showToast("Notifications", "Notification marked as read.") } }) }) } filter.addEventListener("change", render); markAll.addEventListener("click", function () { notifications.forEach(item => item.isRead = true); save(); render(); showToast("Notifications", "All notifications marked as read.") }); render() });
document.addEventListener("DOMContentLoaded", function () { const form = document.getElementById("securityForm"); if (!form) return; const current = document.getElementById("currentPassword"); const next = document.getElementById("newPassword"); const confirm = document.getElementById("confirmPassword"); const currentError = document.getElementById("currentPasswordError"); const nextError = document.getElementById("newPasswordError"); const confirmError = document.getElementById("confirmPasswordError"); const success = document.getElementById("securitySuccess"); document.querySelectorAll(".ss-password-toggle").forEach(button => { button.addEventListener("click", function () { const input = document.getElementById(button.dataset.target); input.type = input.type === "password" ? "text" : "password" }) }); form.addEventListener("submit", function (event) { event.preventDefault(); currentError.textContent = ""; nextError.textContent = ""; confirmError.textContent = ""; success.hidden = true; let valid = true; if (!current.value.trim()) { currentError.textContent = "Current password is required."; valid = false } if (!next.value.trim()) { nextError.textContent = "New password is required."; valid = false } else if (next.value.length < 8) { nextError.textContent = "Password must be at least 8 characters."; valid = false } if (!confirm.value.trim()) { confirmError.textContent = "Please confirm your new password."; valid = false } else if (confirm.value !== next.value) { confirmError.textContent = "Passwords do not match."; valid = false } if (!valid) return; success.hidden = false; form.reset(); showToast("Security", "Password updated successfully.") }) });
