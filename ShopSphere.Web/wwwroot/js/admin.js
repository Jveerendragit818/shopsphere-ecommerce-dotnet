document.addEventListener("DOMContentLoaded", function () {
    const toggle = document.getElementById("adminMenuToggle");
    const sidebar = document.getElementById("adminSidebar");
    const close = document.getElementById("adminSidebarClose");
    const overlay = document.getElementById("adminSidebarOverlay");
    const collapse = document.getElementById("adminSidebarCollapse");

    if (!sidebar) return;

    toggle?.addEventListener("click", function () {
        if (window.innerWidth <= 800) {
            sidebar.classList.add("ss-admin-open");
            overlay?.classList.add("ss-admin-visible");
        } else {
            document.body.classList.toggle("ss-admin-collapsed");
        }
    });

    close?.addEventListener("click", function () {
        sidebar.classList.remove("ss-admin-open");
        overlay?.classList.remove("ss-admin-visible");
    });

    overlay?.addEventListener("click", function () {
        sidebar.classList.remove("ss-admin-open");
        overlay.classList.remove("ss-admin-visible");
    });

    collapse?.addEventListener("click", function () {
        if (window.innerWidth > 800) {
            document.body.classList.toggle("ss-admin-collapsed");
        }
    });

    document.querySelectorAll(".ss-admin-demo-link").forEach(link => {
        link.addEventListener("click", function (event) {
            event.preventDefault();
            showToast("ShopSphere Admin", "This admin module will be connected in the next stage.");
        });
    });

    window.addEventListener("resize", function () {
        if (window.innerWidth > 800) {
            sidebar.classList.remove("ss-admin-open");
            overlay?.classList.remove("ss-admin-visible");
        }
    });
});

document.addEventListener("DOMContentLoaded", function () {
    const salesCanvas = document.getElementById("adminSalesChart");
    const monthlyChart = document.getElementById("adminMonthlySalesChart");
    const statusChart = document.getElementById("adminOrderStatusChart");
    const productsChart = document.getElementById("adminTopProducts");
    const categoryChart = document.getElementById("adminCategoryChart");

    if (!salesCanvas && !monthlyChart && !statusChart) return;

    const dashboardData = {
        months: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
        sales: [120, 145, 132, 168, 190, 214, 205, 238, 252, 276, 298, 326],
        orders: [
            { name: "Delivered", value: 96 },
            { name: "Confirmed", value: 42 },
            { name: "Packed", value: 24 },
            { name: "Shipped", value: 18 },
            { name: "Cancelled", value: 7 },
            { name: "Failed", value: 3 }
        ],
        products: [
            { name: "Nova Wireless Headphones", units: 184, revenue: "₹4.82L" },
            { name: "Aero Smart Watch", units: 162, revenue: "₹4.27L" },
            { name: "Pulse Mechanical Keyboard", units: 138, revenue: "₹3.91L" },
            { name: "Echo Bluetooth Speaker", units: 121, revenue: "₹3.18L" },
            { name: "Orbit Gaming Mouse", units: 109, revenue: "₹2.76L" }
        ],
        categories: [
            { name: "Electronics", value: 88 },
            { name: "Audio", value: 76 },
            { name: "Accessories", value: 64 },
            { name: "Smart Devices", value: 58 },
            { name: "Gaming", value: 49 }
        ]
    };

    function drawSales() {
        if (!salesCanvas) return;

        const rect = salesCanvas.getBoundingClientRect();
        const dpr = window.devicePixelRatio || 1;
        const width = Math.max(rect.width, 300);
        const height = Math.max(rect.height, 220);

        salesCanvas.width = width * dpr;
        salesCanvas.height = height * dpr;

        const ctx = salesCanvas.getContext("2d");

        ctx.scale(dpr, dpr);
        ctx.clearRect(0, 0, width, height);

        const pad = {
            top: 18,
            right: 18,
            bottom: 18,
            left: 18
        };

        const max = Math.max(...dashboardData.sales) + 30;
        const step = (width - pad.left - pad.right) / (dashboardData.sales.length - 1);

        ctx.lineWidth = 1;
        ctx.strokeStyle = "#E4DFD4";

        for (let i = 0; i < 5; i++) {
            const y = pad.top + (height - pad.top - pad.bottom) * (i / 4);

            ctx.beginPath();
            ctx.moveTo(pad.left, y);
            ctx.lineTo(width - pad.right, y);
            ctx.stroke();
        }

        const points = dashboardData.sales.map((value, index) => {
            const x = pad.left + index * step;
            const y = pad.top + (height - pad.top - pad.bottom) * (1 - value / max);

            return { x, y };
        });

        ctx.beginPath();

        points.forEach((point, index) => {
            if (index === 0) {
                ctx.moveTo(point.x, point.y);
            } else {
                ctx.lineTo(point.x, point.y);
            }
        });

        ctx.strokeStyle = "#2A6BC9";
        ctx.lineWidth = 3;
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(points[0].x, height - pad.bottom);

        points.forEach(point => {
            ctx.lineTo(point.x, point.y);
        });

        ctx.lineTo(points[points.length - 1].x, height - pad.bottom);
        ctx.closePath();

        ctx.globalAlpha = 0.12;
        ctx.fillStyle = "#2A6BC9";
        ctx.fill();
        ctx.globalAlpha = 1;

        points.forEach(point => {
            ctx.beginPath();
            ctx.arc(point.x, point.y, 4, 0, Math.PI * 2);
            ctx.fillStyle = "#FFFFFF";
            ctx.fill();

            ctx.beginPath();
            ctx.arc(point.x, point.y, 2.5, 0, Math.PI * 2);
            ctx.fillStyle = "#2A6BC9";
            ctx.fill();
        });
    }

    function renderMonthly() {
        if (!monthlyChart) return;

        const max = Math.max(...dashboardData.sales);

        monthlyChart.innerHTML = dashboardData.sales.map((value, index) => {
            return '<div class="ss-admin-month-bar"><span style="height:' +
                Math.round(value / max * 88) +
                '%"></span><small>' +
                dashboardData.months[index] +
                '</small></div>';
        }).join("");
    }

    function renderStatus() {
        if (!statusChart) return;

        const max = Math.max(...dashboardData.orders.map(item => item.value));

        statusChart.innerHTML = dashboardData.orders.map(item => {
            return '<div class="ss-admin-status-row">' +
                '<span class="ss-admin-status-label">' + item.name + '</span>' +
                '<div class="ss-admin-status-track">' +
                '<div class="ss-admin-status-fill" style="width:' + item.value / max * 100 + '%"></div>' +
                '</div>' +
                '<span class="ss-admin-status-value">' + item.value + '</span>' +
                '</div>';
        }).join("");
    }

    function renderProducts() {
        if (!productsChart) return;

        productsChart.innerHTML = dashboardData.products.map((item, index) => {
            return '<div class="ss-admin-product-row">' +
                '<span class="ss-admin-product-rank">' + (index + 1) + '</span>' +
                '<div>' +
                '<div class="ss-admin-product-name">' + item.name + '</div>' +
                '<div class="ss-admin-product-meta">' + item.units + ' units sold</div>' +
                '</div>' +
                '<span class="ss-admin-product-revenue">' + item.revenue + '</span>' +
                '</div>';
        }).join("");
    }

    function renderCategories() {
        if (!categoryChart) return;

        const max = Math.max(...dashboardData.categories.map(item => item.value));

        categoryChart.innerHTML = dashboardData.categories.map(item => {
            return '<div class="ss-admin-category-row">' +
                '<span class="ss-admin-category-label">' + item.name + '</span>' +
                '<div class="ss-admin-category-track">' +
                '<div class="ss-admin-category-fill" style="width:' + item.value / max * 100 + '%"></div>' +
                '</div>' +
                '<span class="ss-admin-category-value">' + item.value + '%</span>' +
                '</div>';
        }).join("");
    }

    function renderDate() {
        const date = document.getElementById("adminDashboardDate");

        if (date) {
            date.textContent = new Date().toLocaleDateString("en-IN", {
                day: "2-digit",
                month: "short",
                year: "numeric"
            });
        }
    }

    drawSales();
    renderMonthly();
    renderStatus();
    renderProducts();
    renderCategories();
    renderDate();

    window.addEventListener("resize", drawSales);

    document.getElementById("adminExportButton")?.addEventListener("click", function () {
        showToast("ShopSphere Admin", "Report export is available in the next admin stage.");
    });
});

document.addEventListener("DOMContentLoaded", function () {
    const table = document.getElementById("adminProductsTableBody");

    if (!table) return;

    const search = document.getElementById("adminProductSearch");
    const categoryFilter = document.getElementById("adminCategoryFilter");
    const statusFilter = document.getElementById("adminStatusFilter");
    const sortFilter = document.getElementById("adminSortFilter");
    const pagination = document.getElementById("adminProductsPagination");
    const empty = document.getElementById("adminProductsEmpty");
    const pageInfo = document.getElementById("adminProductsPageInfo");
    const total = document.getElementById("adminProductTotal");
    const active = document.getElementById("adminProductActive");
    const low = document.getElementById("adminProductLowStock");
    const out = document.getElementById("adminProductOutStock");
    const addButton = document.getElementById("adminAddProductButton");

    let products = [];
    let currentPage = 1;

    const pageSize = 8;

    function value(item, ...keys) {
        for (const key of keys) {
            if (item && item[key] !== undefined && item[key] !== null && item[key] !== "") {
                return item[key];
            }
        }

        return "";
    }

    function normalize(item, index) {
        const stockNumber = Number(
            value(item, "stock", "Stock", "quantity", "Quantity") || 0
        );

        const rawStatus = String(
            value(item, "status", "Status") || ""
        ).toLowerCase();

        const status = stockNumber <= 0
            ? "out"
            : rawStatus === "inactive"
                ? "inactive"
                : "active";

        return {
            id: value(item, "id", "Id", "productId", "ProductId") || index + 1,
            name: value(item, "name", "Name", "productName", "ProductName") || "Unnamed Product",
            description: value(item, "description", "Description") || "",
            category: value(item, "category", "Category") || "General",
            brand: value(item, "brand", "Brand") || "ShopSphere",
            price: Number(value(item, "price", "Price") || 0),
            stock: stockNumber,
            rating: Number(value(item, "rating", "Rating") || 0),
            status: status,
            image: value(item, "image", "Image", "imagePath", "ImagePath") || "",
            created: value(item, "createdDate", "CreatedDate", "createdAt", "CreatedAt") || "",
            updated: value(item, "updatedDate", "UpdatedDate", "updatedAt", "UpdatedAt") || ""
        };
    }

    function readArray(key) {
        try {
            const data = JSON.parse(localStorage.getItem(key) || "[]");

            return Array.isArray(data) ? data : [];
        } catch {
            return [];
        }
    }

    function readObject(key) {
        try {
            const data = JSON.parse(localStorage.getItem(key) || "{}");

            return data && typeof data === "object" && !Array.isArray(data)
                ? data
                : {};
        } catch {
            return {};
        }
    }

    function buildProductList(source) {
        const baseProducts = source.map(normalize);
        const addedProducts = readArray("ssAdminProducts").map(normalize);
        const overrides = readObject("ssAdminProductOverrides");
        const deletedProducts = readArray("ssAdminDeletedProducts").map(String);

        const filteredBase = baseProducts
            .filter(item => !deletedProducts.includes(String(item.id)))
            .map(item => {
                const override = overrides[String(item.id)];

                return override
                    ? normalize({ ...item, ...override })
                    : item;
            });

        const filteredAdded = addedProducts.filter(
            item => !deletedProducts.includes(String(item.id))
        );

        return filteredBase.concat(filteredAdded);
    }

    async function loadProducts() {
        let source = [];

        try {
            const response = await fetch("/admin/products-data");

            if (!response.ok) {
                throw new Error("Unable to load products");
            }

            const data = await response.json();

            source = Array.isArray(data)
                ? data
                : Array.isArray(data.products)
                    ? data.products
                    : [];
        } catch (error) {
            source = [];
        }

        products = buildProductList(source);

        renderCategoryOptions();
        render();
    }

    function renderCategoryOptions() {
        const categories = [
            ...new Set(
                products
                    .map(item => item.category)
                    .filter(Boolean)
            )
        ].sort();

        categoryFilter.innerHTML =
            '<option value="all">All Categories</option>' +
            categories.map(category => {
                return '<option value="' +
                    escapeHtml(category) +
                    '">' +
                    escapeHtml(category) +
                    '</option>';
            }).join("");
    }

    function escapeHtml(value) {
        return String(value).replace(/[&<>"']/g, function (char) {
            return {
                "&": "&amp;",
                "<": "&lt;",
                ">": "&gt;",
                "\"": "&quot;",
                "'": "&#039;"
            }[char];
        });
    }

    function filteredProducts() {
        const query = search.value.trim().toLowerCase();
        const category = categoryFilter.value;
        const status = statusFilter.value;

        let result = products.filter(item => {
            const matchText =
                !query ||
                [
                    item.name,
                    item.brand,
                    item.category,
                    item.description
                ].some(value =>
                    String(value).toLowerCase().includes(query)
                );

            const matchCategory =
                category === "all" ||
                item.category === category;

            const matchStatus =
                status === "all" ||
                (
                    status === "out"
                        ? item.stock <= 0
                        : status === "active"
                            ? item.status === "active" && item.stock > 0
                            : item.status === "inactive"
                );

            return matchText && matchCategory && matchStatus;
        });

        const sort = sortFilter.value;

        result.sort((a, b) => {
            if (sort === "nameAsc") {
                return a.name.localeCompare(b.name);
            }

            if (sort === "nameDesc") {
                return b.name.localeCompare(a.name);
            }

            if (sort === "priceLow") {
                return a.price - b.price;
            }

            if (sort === "priceHigh") {
                return b.price - a.price;
            }

            if (sort === "stockLow") {
                return a.stock - b.stock;
            }

            if (sort === "stockHigh") {
                return b.stock - a.stock;
            }

            const da = new Date(a.updated || a.created || 0).getTime();
            const db = new Date(b.updated || b.created || 0).getTime();

            return sort === "oldest"
                ? da - db
                : db - da;
        });

        return result;
    }

    function statusHtml(item) {
        if (item.stock <= 0) {
            return '<span class="ss-admin-product-status ss-admin-product-status-out">Out of Stock</span>';
        }

        if (item.status === "inactive") {
            return '<span class="ss-admin-product-status ss-admin-product-status-inactive">Inactive</span>';
        }

        return '<span class="ss-admin-product-status ss-admin-product-status-active">Active</span>';
    }

    function imageHtml(item) {
        if (item.image) {
            return '<div class="ss-admin-product-image">' +
                '<img src="' + escapeHtml(item.image) +
                '" alt="' + escapeHtml(item.name) + '">' +
                '</div>';
        }

        return '<div class="ss-admin-product-image">' +
            '<span class="ss-admin-product-image-placeholder">' +
            '<svg viewBox="0 0 24 24" aria-hidden="true">' +
            '<path d="M5 7h14l-1 12H6z"></path>' +
            '<path d="M9 7a3 3 0 0 1 6 0"></path>' +
            '</svg>' +
            '</span>' +
            '</div>';
    }

    function render() {
        const result = filteredProducts();
        const pageCount = Math.max(
            1,
            Math.ceil(result.length / pageSize)
        );

        if (currentPage > pageCount) {
            currentPage = pageCount;
        }

        const start = (currentPage - 1) * pageSize;

        const pageItems = result.slice(
            start,
            start + pageSize
        );

        table.innerHTML = pageItems.map(item => {
            return '<tr>' +
                '<td>' +
                '<div class="ss-admin-product-cell">' +
                imageHtml(item) +
                '<div>' +
                '<div class="ss-admin-product-name">' +
                escapeHtml(item.name) +
                '</div>' +
                '<div class="ss-admin-product-id">' +
                'ID: ' + escapeHtml(item.id) +
                '</div>' +
                '</div>' +
                '</div>' +
                '</td>' +

                '<td>' +
                escapeHtml(item.category) +
                '</td>' +

                '<td>' +
                escapeHtml(item.brand) +
                '</td>' +

                '<td>' +
                '<strong>₹' +
                item.price.toLocaleString("en-IN") +
                '</strong>' +
                '</td>' +

                '<td>' +
                '<span class="ss-admin-stock ' +
                (
                    item.stock <= 0
                        ? "ss-admin-stock-out-text"
                        : item.stock <= 10
                            ? "ss-admin-stock-low-text"
                            : ""
                ) +
                '">' +
                item.stock +
                '</span>' +
                '</td>' +

                '<td>' +
                '<span class="ss-admin-product-rating">' +
                '<svg viewBox="0 0 24 24" aria-hidden="true">' +
                '<path d="m12 4 2.2 4.6 5 .7-3.6 3.5.9 5-4.5-2.4-4.5 2.4.9-5L4.8 9.3l5-.7z"></path>' +
                '</svg>' +
                item.rating.toFixed(1) +
                '</span>' +
                '</td>' +

                '<td>' +
                statusHtml(item) +
                '</td>' +

                '<td>' +
                formatAdminDate(item.updated || item.created) +
                '</td>' +

                '<td>' +
                '<div class="ss-admin-product-actions-cell">' +

                '<button type="button" class="ss-admin-product-action ss-admin-edit" data-id="' +
                escapeHtml(item.id) +
                '" aria-label="Edit product">' +
                '<svg viewBox="0 0 24 24" aria-hidden="true">' +
                '<path d="m4 16-.8 4.8L8 20l11-11-4-4z"></path>' +
                '<path d="m13 6 4 4"></path>' +
                '</svg>' +
                '</button>' +

                '<button type="button" class="ss-admin-product-action ss-admin-delete" data-id="' +
                escapeHtml(item.id) +
                '" aria-label="Delete product">' +
                '<svg viewBox="0 0 24 24" aria-hidden="true">' +
                '<path d="M5 7h14M10 11v6M14 11v6M9 7V4h6v3M7 7l1 13h8l1-13"></path>' +
                '</svg>' +
                '</button>' +

                '</div>' +
                '</td>' +

                '</tr>';
        }).join("");

        empty.hidden = pageItems.length !== 0;

        const from = result.length
            ? start + 1
            : 0;

        const to = Math.min(
            start + pageSize,
            result.length
        );

        pageInfo.textContent =
            "Showing " +
            from +
            "-" +
            to +
            " of " +
            result.length +
            " products";

        renderPagination(pageCount);
        updateStats();

        table.querySelectorAll(".ss-admin-edit").forEach(button => {
            button.addEventListener("click", function () {
                window.location.href =
                    "/admin/products/edit?id=" +
                    encodeURIComponent(button.dataset.id);
            });
        });

        table.querySelectorAll(".ss-admin-delete").forEach(button => {
            button.addEventListener("click", function () {
                const product = products.find(
                    item =>
                        String(item.id) ===
                        String(button.dataset.id)
                );

                if (!product) return;

                const confirmed = window.confirm(
                    'Delete "' +
                    product.name +
                    '"?'
                );

                if (!confirmed) return;

                const addedProducts =
                    readArray("ssAdminProducts");

                const addedIndex =
                    addedProducts.findIndex(
                        item =>
                            String(item.id ?? item.Id) ===
                            String(product.id)
                    );

                if (addedIndex !== -1) {
                    addedProducts.splice(addedIndex, 1);

                    localStorage.setItem(
                        "ssAdminProducts",
                        JSON.stringify(addedProducts)
                    );
                } else {
                    const overrides =
                        readObject("ssAdminProductOverrides");

                    delete overrides[String(product.id)];

                    localStorage.setItem(
                        "ssAdminProductOverrides",
                        JSON.stringify(overrides)
                    );

                    const deletedProducts =
                        readArray("ssAdminDeletedProducts")
                            .map(String);

                    if (!deletedProducts.includes(String(product.id))) {
                        deletedProducts.push(
                            String(product.id)
                        );
                    }

                    localStorage.setItem(
                        "ssAdminDeletedProducts",
                        JSON.stringify(deletedProducts)
                    );
                }

                products = products.filter(
                    item =>
                        String(item.id) !==
                        String(product.id)
                );

                renderCategoryOptions();
                render();

                showToast(
                    "ShopSphere Admin",
                    "Product removed from the frontend catalog."
                );
            });
        });
    }

    function renderPagination(pageCount) {
        pagination.innerHTML = "";

        for (let page = 1; page <= pageCount; page++) {
            const button =
                document.createElement("button");

            button.type = "button";
            button.className =
                "ss-admin-page-btn" +
                (
                    page === currentPage
                        ? " ss-active"
                        : ""
                );

            button.textContent = page;

            button.addEventListener("click", function () {
                currentPage = page;
                render();
            });

            pagination.appendChild(button);
        }
    }

    function updateStats() {
        total.textContent = products.length;

        active.textContent =
            products.filter(
                item =>
                    item.status === "active" &&
                    item.stock > 0
            ).length;

        low.textContent =
            products.filter(
                item =>
                    item.stock > 0 &&
                    item.stock <= 10
            ).length;

        out.textContent =
            products.filter(
                item => item.stock <= 0
            ).length;
    }

    function formatAdminDate(value) {
        if (!value) return "—";

        const date = new Date(value);

        if (Number.isNaN(date.getTime())) {
            return String(value);
        }

        return date.toLocaleDateString("en-IN", {
            day: "2-digit",
            month: "short",
            year: "numeric"
        });
    }

    search.addEventListener("input", function () {
        currentPage = 1;
        render();
    });

    categoryFilter.addEventListener("change", function () {
        currentPage = 1;
        render();
    });

    statusFilter.addEventListener("change", function () {
        currentPage = 1;
        render();
    });

    sortFilter.addEventListener("change", function () {
        currentPage = 1;
        render();
    });

    addButton?.addEventListener("click", function () {
        window.location.href = "/admin/products/add";
    });

    loadProducts();
});

document.addEventListener("DOMContentLoaded", function () {
    const form = document.getElementById("adminAddProductForm");

    if (!form) return;

    const name = document.getElementById("productName");
    const description = document.getElementById("productDescription");
    const category = document.getElementById("productCategory");
    const brand = document.getElementById("productBrand");
    const price = document.getElementById("productPrice");
    const stock = document.getElementById("productStock");
    const rating = document.getElementById("productRating");
    const status = document.getElementById("productStatus");
    const created = document.getElementById("productCreatedDate");
    const updated = document.getElementById("productUpdatedDate");
    const imageInput = document.getElementById("productImage");
    const chooseImage = document.getElementById("chooseProductImage");
    const imagePreview = document.getElementById("adminImagePreview");
    const liveImage = document.getElementById("adminLiveImage");
    const liveName = document.getElementById("adminLiveName");
    const liveBrand = document.getElementById("adminLiveBrand");
    const livePrice = document.getElementById("adminLivePrice");
    const liveStock = document.getElementById("adminLiveStock");

    const today =
        new Date().toISOString().split("T")[0];

    created.value = today;
    updated.value = today;

    let imageData = "";

    function error(id, message) {
        const element =
            document.getElementById(id + "Error");

        if (element) {
            element.textContent = message;
        }
    }

    function clearErrors() {
        [
            "productName",
            "productDescription",
            "productCategory",
            "productBrand",
            "productPrice",
            "productStock",
            "productRating",
            "productImage"
        ].forEach(id => error(id, ""));
    }

    function updatePreview() {
        liveName.textContent =
            name.value.trim() ||
            "Product Name";

        liveBrand.textContent =
            brand.value.trim() ||
            "Brand";

        livePrice.textContent =
            "₹" +
            (Number(price.value) || 0)
                .toLocaleString("en-IN");

        liveStock.textContent =
            (Number(stock.value) || 0) +
            " in stock";
    }

    [name, brand, price, stock].forEach(input => {
        input.addEventListener(
            "input",
            updatePreview
        );
    });

    chooseImage.addEventListener(
        "click",
        () => imageInput.click()
    );

    imageInput.addEventListener(
        "change",
        function () {
            const file =
                imageInput.files[0];

            if (!file) return;

            const allowed = [
                "image/jpeg",
                "image/png",
                "image/webp"
            ];

            if (!allowed.includes(file.type)) {
                error(
                    "productImage",
                    "Only JPG, PNG and WEBP images are allowed."
                );

                imageInput.value = "";
                return;
            }

            if (file.size > 2 * 1024 * 1024) {
                error(
                    "productImage",
                    "Image size must be 2 MB or less."
                );

                imageInput.value = "";
                return;
            }

            error("productImage", "");

            const reader =
                new FileReader();

            reader.onload = function (event) {
                imageData =
                    event.target.result;

                imagePreview.innerHTML =
                    '<img src="' +
                    imageData +
                    '" alt="Product Preview">' +
                    '<strong>' +
                    file.name +
                    '</strong>' +
                    '<span>Image selected for frontend preview</span>';

                liveImage.innerHTML =
                    '<img src="' +
                    imageData +
                    '" alt="Product Preview">';
            };

            reader.readAsDataURL(file);
        }
    );

    form.addEventListener(
        "submit",
        function (event) {
            event.preventDefault();

            clearErrors();

            let valid = true;

            if (!name.value.trim()) {
                error(
                    "productName",
                    "Product name is required."
                );

                valid = false;
            }

            if (!description.value.trim()) {
                error(
                    "productDescription",
                    "Description is required."
                );

                valid = false;
            }

            if (!category.value) {
                error(
                    "productCategory",
                    "Select a category."
                );

                valid = false;
            }

            if (!brand.value.trim()) {
                error(
                    "productBrand",
                    "Brand is required."
                );

                valid = false;
            }

            if (
                !price.value ||
                Number(price.value) <= 0
            ) {
                error(
                    "productPrice",
                    "Enter a valid positive price."
                );

                valid = false;
            }

            if (
                !stock.value ||
                Number(stock.value) < 0
            ) {
                error(
                    "productStock",
                    "Enter a valid stock value."
                );

                valid = false;
            }

            if (
                rating.value === "" ||
                Number(rating.value) < 0 ||
                Number(rating.value) > 5
            ) {
                error(
                    "productRating",
                    "Rating must be between 0 and 5."
                );

                valid = false;
            }

            if (!valid) return;

            const products =
                JSON.parse(
                    localStorage.getItem("ssAdminProducts") ||
                    "[]"
                );

            const product = {
                id: "ADM-" + Date.now(),
                name: name.value.trim(),
                description: description.value.trim(),
                category: category.value,
                brand: brand.value.trim(),
                price: Number(price.value),
                stock: Number(stock.value),
                rating: Number(rating.value),
                status: status.value,
                image: imageData,
                createdDate: created.value,
                updatedDate: updated.value
            };

            products.push(product);

            localStorage.setItem(
                "ssAdminProducts",
                JSON.stringify(products)
            );

            showToast(
                "ShopSphere Admin",
                "Product added to the frontend catalog."
            );

            setTimeout(() => {
                window.location.href =
                    "/admin/products";
            }, 500);
        }
    );

    updatePreview();
});

document.addEventListener("DOMContentLoaded", function () {
    const form =
        document.getElementById("adminEditProductForm");

    if (!form) return;

    const productId =
        document.getElementById("productId");

    const name =
        document.getElementById("productName");

    const description =
        document.getElementById("productDescription");

    const category =
        document.getElementById("productCategory");

    const brand =
        document.getElementById("productBrand");

    const price =
        document.getElementById("productPrice");

    const stock =
        document.getElementById("productStock");

    const rating =
        document.getElementById("productRating");

    const status =
        document.getElementById("productStatus");

    const created =
        document.getElementById("productCreatedDate");

    const updated =
        document.getElementById("productUpdatedDate");

    const imageInput =
        document.getElementById("productImage");

    const chooseImage =
        document.getElementById("chooseProductImage");

    const imagePreview =
        document.getElementById("adminImagePreview");

    const liveImage =
        document.getElementById("adminLiveImage");

    const liveName =
        document.getElementById("adminLiveName");

    const liveBrand =
        document.getElementById("adminLiveBrand");

    const livePrice =
        document.getElementById("adminLivePrice");

    const liveStock =
        document.getElementById("adminLiveStock");

    let currentImage = "";

    function readArray(key) {
        try {
            const data =
                JSON.parse(
                    localStorage.getItem(key) || "[]"
                );

            return Array.isArray(data)
                ? data
                : [];
        } catch {
            return [];
        }
    }

    function readObject(key) {
        try {
            const data =
                JSON.parse(
                    localStorage.getItem(key) || "{}"
                );

            return data &&
                typeof data === "object" &&
                !Array.isArray(data)
                ? data
                : {};
        } catch {
            return {};
        }
    }

    function error(id, message) {
        const element =
            document.getElementById(
                id + "Error"
            );

        if (element) {
            element.textContent = message;
        }
    }

    function clearErrors() {
        [
            "productName",
            "productDescription",
            "productCategory",
            "productBrand",
            "productPrice",
            "productStock",
            "productRating",
            "productImage"
        ].forEach(id => {
            error(id, "");
        });
    }

    function updatePreview() {
        liveName.textContent =
            name.value.trim() ||
            "Product Name";

        liveBrand.textContent =
            brand.value.trim() ||
            "Brand";

        livePrice.textContent =
            "₹" +
            (Number(price.value) || 0)
                .toLocaleString("en-IN");

        liveStock.textContent =
            (Number(stock.value) || 0) +
            " in stock";
    }

    function displayImage(image, label) {
        currentImage =
            image || "";

        if (image) {
            imagePreview.innerHTML =
                '<img src="' +
                image +
                '" alt="Product Preview">' +
                '<strong>' +
                label +
                '</strong>' +
                '<span>Current product image</span>';

            liveImage.innerHTML =
                '<img src="' +
                image +
                '" alt="Product Preview">';
        } else {
            imagePreview.innerHTML =
                "<span>No product image selected.</span>";

            liveImage.innerHTML =
                "<span>No image</span>";
        }
    }

    function normalize(item, index) {
        const stockNumber =
            Number(
                item.stock ??
                item.Stock ??
                item.quantity ??
                item.Quantity ??
                0
            );

        const rawStatus =
            String(
                item.status ??
                item.Status ??
                "active"
            ).toLowerCase();

        return {
            id:
                item.id ??
                item.Id ??
                item.productId ??
                item.ProductId ??
                index + 1,

            name:
                item.name ??
                item.Name ??
                item.productName ??
                item.ProductName ??
                "",

            description:
                item.description ??
                item.Description ??
                "",

            category:
                item.category ??
                item.Category ??
                "",

            brand:
                item.brand ??
                item.Brand ??
                "",

            price:
                Number(
                    item.price ??
                    item.Price ??
                    0
                ),

            stock:
                stockNumber,

            rating:
                Number(
                    item.rating ??
                    item.Rating ??
                    0
                ),

            status:
                stockNumber <= 0
                    ? "out"
                    : rawStatus === "inactive"
                        ? "inactive"
                        : "active",

            image:
                item.image ??
                item.Image ??
                item.imagePath ??
                item.ImagePath ??
                "",

            createdDate:
                item.createdDate ??
                item.CreatedDate ??
                item.createdAt ??
                item.CreatedAt ??
                "",

            updatedDate:
                item.updatedDate ??
                item.UpdatedDate ??
                item.updatedAt ??
                item.UpdatedAt ??
                ""
        };
    }

    async function loadProduct() {
        const params =
            new URLSearchParams(
                window.location.search
            );

        const id =
            params.get("id");

        if (!id) {
            showToast(
                "ShopSphere Admin",
                "Product ID is missing."
            );

            setTimeout(() => {
                window.location.href =
                    "/admin/products";
            }, 700);

            return;
        }

        productId.value = id;

        let source = [];

        try {
            const response =
                await fetch(
                    "/admin/products-data"
                );

            if (response.ok) {
                const data =
                    await response.json();

                source =
                    Array.isArray(data)
                        ? data
                        : Array.isArray(data.products)
                            ? data.products
                            : [];
            }
        } catch (error) {
            source = [];
        }

        const baseProducts =
            source.map(normalize);

        const addedProducts =
            readArray(
                "ssAdminProducts"
            ).map(normalize);

        const overrides =
            readObject(
                "ssAdminProductOverrides"
            );

        const deletedProducts =
            readArray(
                "ssAdminDeletedProducts"
            ).map(String);

        const filteredBase =
            baseProducts
                .filter(
                    item =>
                        !deletedProducts.includes(
                            String(item.id)
                        )
                )
                .map(item => {
                    const override =
                        overrides[
                        String(item.id)
                        ];

                    return override
                        ? normalize({
                            ...item,
                            ...override
                        })
                        : item;
                });

        const filteredAdded =
            addedProducts.filter(
                item =>
                    !deletedProducts.includes(
                        String(item.id)
                    )
            );

        const products =
            filteredBase.concat(
                filteredAdded
            );

        const product =
            products.find(
                item =>
                    String(item.id) ===
                    String(id)
            );

        if (!product) {
            showToast(
                "ShopSphere Admin",
                "Product not found."
            );

            setTimeout(() => {
                window.location.href =
                    "/admin/products";
            }, 700);

            return;
        }

        name.value =
            product.name;

        description.value =
            product.description;

        category.value =
            product.category;

        brand.value =
            product.brand;

        price.value =
            product.price;

        stock.value =
            product.stock;

        rating.value =
            product.rating;

        status.value =
            product.status === "inactive"
                ? "inactive"
                : "active";

        created.value =
            product.createdDate || "";

        updated.value =
            new Date()
                .toISOString()
                .split("T")[0];

        displayImage(
            product.image,
            product.image
                ? "Current product image"
                : "No image"
        );

        updatePreview();
    }

    [name, brand, price, stock].forEach(input => {
        input.addEventListener(
            "input",
            updatePreview
        );
    });

    chooseImage.addEventListener(
        "click",
        () => imageInput.click()
    );

    imageInput.addEventListener(
        "change",
        function () {
            const file =
                imageInput.files[0];

            if (!file) return;

            const allowed = [
                "image/jpeg",
                "image/png",
                "image/webp"
            ];

            if (!allowed.includes(file.type)) {
                error(
                    "productImage",
                    "Only JPG, PNG and WEBP images are allowed."
                );

                imageInput.value = "";

                return;
            }

            if (
                file.size >
                2 * 1024 * 1024
            ) {
                error(
                    "productImage",
                    "Image size must be 2 MB or less."
                );

                imageInput.value = "";

                return;
            }

            error(
                "productImage",
                ""
            );

            const reader =
                new FileReader();

            reader.onload =
                function (event) {
                    currentImage =
                        event.target.result;

                    imagePreview.innerHTML =
                        '<img src="' +
                        currentImage +
                        '" alt="Product Preview">' +
                        '<strong>' +
                        file.name +
                        '</strong>' +
                        '<span>New image selected</span>';

                    liveImage.innerHTML =
                        '<img src="' +
                        currentImage +
                        '" alt="Product Preview">';
                };

            reader.readAsDataURL(
                file
            );
        }
    );

    form.addEventListener(
        "submit",
        function (event) {
            event.preventDefault();

            clearErrors();

            let valid = true;

            if (!name.value.trim()) {
                error(
                    "productName",
                    "Product name is required."
                );

                valid = false;
            }

            if (!description.value.trim()) {
                error(
                    "productDescription",
                    "Description is required."
                );

                valid = false;
            }

            if (!category.value) {
                error(
                    "productCategory",
                    "Select a category."
                );

                valid = false;
            }

            if (!brand.value.trim()) {
                error(
                    "productBrand",
                    "Brand is required."
                );

                valid = false;
            }

            if (
                !price.value ||
                Number(price.value) <= 0
            ) {
                error(
                    "productPrice",
                    "Enter a valid positive price."
                );

                valid = false;
            }

            if (
                !stock.value ||
                Number(stock.value) < 0
            ) {
                error(
                    "productStock",
                    "Enter a valid stock value."
                );

                valid = false;
            }

            if (
                rating.value === "" ||
                Number(rating.value) < 0 ||
                Number(rating.value) > 5
            ) {
                error(
                    "productRating",
                    "Rating must be between 0 and 5."
                );

                valid = false;
            }

            if (!valid) return;

            const id =
                productId.value;

            const updatedProduct = {
                id: id,
                name: name.value.trim(),
                description: description.value.trim(),
                category: category.value,
                brand: brand.value.trim(),
                price: Number(price.value),
                stock: Number(stock.value),
                rating: Number(rating.value),
                status: status.value,
                image: currentImage,
                createdDate: created.value,
                updatedDate: updated.value
            };

            const addedProducts =
                readArray(
                    "ssAdminProducts"
                );

            const addedIndex =
                addedProducts.findIndex(
                    item =>
                        String(
                            item.id ??
                            item.Id
                        ) ===
                        String(id)
                );

            if (addedIndex !== -1) {
                addedProducts[
                    addedIndex
                ] = updatedProduct;

                localStorage.setItem(
                    "ssAdminProducts",
                    JSON.stringify(
                        addedProducts
                    )
                );
            } else {
                const overrides =
                    readObject(
                        "ssAdminProductOverrides"
                    );

                overrides[
                    String(id)
                ] = updatedProduct;

                localStorage.setItem(
                    "ssAdminProductOverrides",
                    JSON.stringify(
                        overrides
                    )
                );
            }

            const deletedProducts =
                readArray(
                    "ssAdminDeletedProducts"
                )
                    .map(String)
                    .filter(
                        item =>
                            item !==
                            String(id)
                    );

            localStorage.setItem(
                "ssAdminDeletedProducts",
                JSON.stringify(
                    deletedProducts
                )
            );

            showToast(
                "ShopSphere Admin",
                "Product updated successfully."
            );

            setTimeout(() => {
                window.location.href =
                    "/admin/products";
            }, 500);
        }
    );

    loadProduct();
});

document.addEventListener("DOMContentLoaded", function () {
    const tableBody = document.getElementById("categoryTableBody");
    if (!tableBody) return;

    const storageKey = "ssAdminCategories";
    const searchInput = document.getElementById("categorySearch");
    const statusFilter = document.getElementById("categoryStatusFilter");
    const modal = document.getElementById("categoryModalBackdrop");
    const form = document.getElementById("categoryForm");
    const idInput = document.getElementById("categoryId");
    const nameInput = document.getElementById("categoryName");
    const descriptionInput = document.getElementById("categoryDescription");
    const statusInput = document.getElementById("categoryStatus");
    const modalTitle = document.getElementById("categoryModalTitle");
    const saveButton = document.getElementById("saveCategoryBtn");
    const emptyState = document.getElementById("categoryEmpty");
    const resultCount = document.getElementById("categoryResultCount");

    const defaults = [
        { id: "CAT-001", name: "Electronics", description: "Electronic devices and accessories.", status: "active", created: "2026-01-01", updated: "2026-01-01" },
        { id: "CAT-002", name: "Fashion", description: "Clothing and everyday fashion.", status: "active", created: "2026-01-01", updated: "2026-01-01" },
        { id: "CAT-003", name: "Jewellery", description: "Jewellery and premium ornaments.", status: "active", created: "2026-01-01", updated: "2026-01-01" },
        { id: "CAT-004", name: "Shoes", description: "Footwear for different occasions.", status: "active", created: "2026-01-01", updated: "2026-01-01" },
        { id: "CAT-005", name: "Accessories", description: "Useful accessories and essentials.", status: "active", created: "2026-01-01", updated: "2026-01-01" },
        { id: "CAT-006", name: "Home Appliances", description: "Appliances and home essentials.", status: "active", created: "2026-01-01", updated: "2026-01-01" }
    ];

    function readArray(key) {
        try {
            const value = JSON.parse(localStorage.getItem(key) || "[]");
            return Array.isArray(value) ? value : [];
        } catch {
            return [];
        }
    }

    function readObject(key) {
        try {
            const value = JSON.parse(localStorage.getItem(key) || "{}");
            return value && typeof value === "object" && !Array.isArray(value) ? value : {};
        } catch {
            return {};
        }
    }

    function readCategories() {
        try {
            const saved = JSON.parse(localStorage.getItem(storageKey) || "null");
            if (Array.isArray(saved)) return saved;
        } catch {}
        localStorage.setItem(storageKey, JSON.stringify(defaults));
        return defaults.map(item => ({ ...item }));
    }

    let categories = readCategories();
    let productCounts = {};

    function escapeHtml(value) {
        return String(value ?? "").replace(/[&<>"']/g, character => ({
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            '"': "&quot;",
            "'": "&#39;"
        }[character]));
    }

    function notify(message) {
        if (typeof window.showToast === "function") {
            window.showToast("ShopSphere Admin", message);
        } else {
            window.alert(message);
        }
    }

    function saveCategories() {
        localStorage.setItem(storageKey, JSON.stringify(categories));
    }

    function getCategoryCount(name) {
        return productCounts[String(name || "").trim().toLowerCase()] || 0;
    }

    function formatDate(value) {
        if (!value) return "—";
        const date = new Date(value);
        if (Number.isNaN(date.getTime())) return String(value);
        return date.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
    }

    function renderStats() {
        document.getElementById("categoryTotal").textContent = categories.length;
        document.getElementById("categoryActive").textContent = categories.filter(item => item.status === "active").length;
        document.getElementById("categoryInactive").textContent = categories.filter(item => item.status !== "active").length;
        document.getElementById("categoryUsed").textContent = categories.filter(item => getCategoryCount(item.name) > 0).length;
    }

    function render() {
        const query = searchInput.value.trim().toLowerCase();
        const selectedStatus = statusFilter.value;

        const filtered = categories.filter(item => {
            const matchesSearch = [item.name, item.description, item.id].some(value => String(value || "").toLowerCase().includes(query));
            const matchesStatus = selectedStatus === "all" || item.status === selectedStatus;
            return matchesSearch && matchesStatus;
        });

        tableBody.innerHTML = filtered.map(item => {
            const count = getCategoryCount(item.name);
            const active = item.status === "active";
            const initial = escapeHtml(String(item.name || "?").trim().charAt(0).toUpperCase());

            return `<tr>
                <td><div class="ss-category-name"><span class="ss-category-avatar">${initial}</span><div><strong>${escapeHtml(item.name)}</strong><small>${escapeHtml(item.id)}</small></div></div></td>
                <td><div class="ss-category-description">${escapeHtml(item.description || "No description provided.")}</div></td>
                <td><span class="ss-category-product-count">${count}</span></td>
                <td><span class="ss-category-status ${active ? "active" : "inactive"}">${active ? "Active" : "Inactive"}</span></td>
                <td>${escapeHtml(formatDate(item.updated))}</td>
                <td><div class="ss-category-actions">
                    <button type="button" class="ss-category-action" data-category-action="edit" data-id="${escapeHtml(item.id)}">Edit</button>
                    <button type="button" class="ss-category-action" data-category-action="toggle" data-id="${escapeHtml(item.id)}">${active ? "Disable" : "Enable"}</button>
                    <button type="button" class="ss-category-action danger" data-category-action="delete" data-id="${escapeHtml(item.id)}">Delete</button>
                </div></td>
            </tr>`;
        }).join("");

        emptyState.hidden = filtered.length !== 0;
        resultCount.textContent = `${filtered.length} ${filtered.length === 1 ? "category" : "categories"}`;
        renderStats();
    }

    function openModal(category) {
        form.reset();
        document.getElementById("categoryNameError").textContent = "";
        document.getElementById("categoryDescriptionError").textContent = "";
        idInput.value = category ? category.id : "";
        nameInput.value = category ? category.name : "";
        descriptionInput.value = category ? category.description || "" : "";
        statusInput.value = category ? category.status : "active";
        modalTitle.textContent = category ? "Edit Category" : "Add Category";
        saveButton.textContent = category ? "Save Changes" : "Save Category";
        modal.hidden = false;
        document.body.style.overflow = "hidden";
        nameInput.focus();
    }

    function closeModal() {
        modal.hidden = true;
        document.body.style.overflow = "";
    }

    async function loadProductCounts() {
        try {
            const response = await fetch("/admin/products-data");
            if (!response.ok) throw new Error("Could not load products.");

            const data = await response.json();
            const baseProducts = Array.isArray(data) ? data : Array.isArray(data.products) ? data.products : [];
            const addedProducts = readArray("ssAdminProducts");
            const overrides = readObject("ssAdminProductOverrides");
            const deleted = readArray("ssAdminDeletedProducts").map(String);

            const products = baseProducts.map((item, index) => {
                const id = String(item.id ?? item.Id ?? item.productId ?? item.ProductId ?? index + 1);
                const override = overrides[id] || {};
                return {
                    ...item,
                    ...override,
                    id,
                    category: override.category ?? override.Category ?? item.category ?? item.Category ?? ""
                };
            }).filter(item => !deleted.includes(String(item.id)));

            addedProducts.filter(item => !deleted.includes(String(item.id ?? item.Id))).forEach(item => products.push(item));

            productCounts = {};
            products.forEach(item => {
                const category = String(item.category ?? item.Category ?? "").trim().toLowerCase();
                if (category) productCounts[category] = (productCounts[category] || 0) + 1;
            });
        } catch {
            productCounts = {};
        }

        render();
    }

    document.getElementById("addCategoryBtn").addEventListener("click", () => openModal(null));
    document.getElementById("closeCategoryModal").addEventListener("click", closeModal);
    document.getElementById("cancelCategoryBtn").addEventListener("click", closeModal);
    searchInput.addEventListener("input", render);
    statusFilter.addEventListener("change", render);

    modal.addEventListener("click", event => {
        if (event.target === modal) closeModal();
    });

    document.addEventListener("keydown", event => {
        if (event.key === "Escape" && !modal.hidden) closeModal();
    });

    form.addEventListener("submit", function (event) {
        event.preventDefault();

        const id = idInput.value;
        const name = nameInput.value.trim();
        const description = descriptionInput.value.trim();
        const status = statusInput.value;
        const nameError = document.getElementById("categoryNameError");
        const descriptionError = document.getElementById("categoryDescriptionError");

        nameError.textContent = "";
        descriptionError.textContent = "";

        if (!name) {
            nameError.textContent = "Category name is required.";
            nameInput.focus();
            return;
        }

        const duplicate = categories.some(item => item.id !== id && item.name.trim().toLowerCase() === name.toLowerCase());
        if (duplicate) {
            nameError.textContent = "A category with this name already exists.";
            nameInput.focus();
            return;
        }

        if (description.length > 240) {
            descriptionError.textContent = "Description cannot exceed 240 characters.";
            return;
        }

        const today = new Date().toISOString().split("T")[0];

        if (id) {
            const index = categories.findIndex(item => String(item.id) === String(id));
            if (index === -1) return;

            categories[index] = {
                ...categories[index],
                name,
                description,
                status,
                updated: today
            };
        } else {
            categories.push({
                id: "CAT-" + Date.now(),
                name,
                description,
                status,
                created: today,
                updated: today
            });
        }

        saveCategories();
        closeModal();
        render();
        notify(id ? "Category updated successfully." : "Category added successfully.");
    });

    tableBody.addEventListener("click", function (event) {
        const button = event.target.closest("[data-category-action]");
        if (!button) return;

        const category = categories.find(item => String(item.id) === String(button.dataset.id));
        if (!category) return;

        const action = button.dataset.categoryAction;

        if (action === "edit") {
            openModal(category);
            return;
        }

        if (action === "toggle") {
            category.status = category.status === "active" ? "inactive" : "active";
            category.updated = new Date().toISOString().split("T")[0];
            saveCategories();
            render();
            notify(category.status === "active" ? "Category activated." : "Category deactivated.");
            return;
        }

        if (action === "delete") {
            const count = getCategoryCount(category.name);

            if (count > 0) {
                notify("This category has assigned products. Reassign those products before deleting it.");
                return;
            }

            if (!window.confirm(`Delete the "${category.name}" category? This cannot be undone.`)) return;

            categories = categories.filter(item => String(item.id) !== String(category.id));
            saveCategories();
            render();
            notify("Category deleted.");
        }
    });

    loadProductCounts();
});

document.addEventListener("DOMContentLoaded", function () {
    const tableBody = document.getElementById("inventoryTableBody");
    if (!tableBody) return;

    const searchInput = document.getElementById("inventorySearch");
    const categoryFilter = document.getElementById("inventoryCategoryFilter");
    const statusFilter = document.getElementById("inventoryStatusFilter");
    const emptyState = document.getElementById("inventoryEmpty");
    const resultCount = document.getElementById("inventoryResultCount");
    const modal = document.getElementById("inventoryModal");
    const form = document.getElementById("inventoryAdjustForm");
    const productIdInput = document.getElementById("inventoryProductId");
    const productNameLabel = document.getElementById("inventoryProductName");
    const currentStockLabel = document.getElementById("inventoryCurrentStock");
    const adjustmentType = document.getElementById("inventoryAdjustmentType");
    const quantityInput = document.getElementById("inventoryAdjustmentQty");
    const quantityLabel = document.getElementById("inventoryQuantityLabel");
    const adjustmentError = document.getElementById("inventoryAdjustmentError");
    const newStockPreview = document.getElementById("inventoryNewStockPreview");

    let products = [];
    let selectedProduct = null;

    function readArray(key) {
        try {
            const value = JSON.parse(localStorage.getItem(key) || "[]");
            return Array.isArray(value) ? value : [];
        } catch {
            return [];
        }
    }

    function readObject(key) {
        try {
            const value = JSON.parse(localStorage.getItem(key) || "{}");
            return value && typeof value === "object" && !Array.isArray(value) ? value : {};
        } catch {
            return {};
        }
    }

    function notify(message) {
        if (typeof window.showToast === "function") {
            window.showToast("ShopSphere Admin", message);
        } else {
            window.alert(message);
        }
    }

    function escapeHtml(value) {
        return String(value ?? "").replace(/[&<>"']/g, character => ({
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            '"': "&quot;",
            "'": "&#39;"
        }[character]));
    }

    function normalize(item, index) {
        const stock = Math.max(0, Number(item.stock ?? item.Stock ?? item.quantity ?? item.Quantity ?? 0) || 0);
        const rawStatus = String(item.status ?? item.Status ?? "active").toLowerCase();

        return {
            id: String(item.id ?? item.Id ?? item.productId ?? item.ProductId ?? index + 1),
            name: item.name ?? item.Name ?? item.productName ?? item.ProductName ?? "Unnamed Product",
            category: item.category ?? item.Category ?? "",
            brand: item.brand ?? item.Brand ?? "",
            price: Number(item.price ?? item.Price ?? 0) || 0,
            stock,
            status: stock <= 0 ? "out" : rawStatus === "inactive" ? "inactive" : "active",
            createdDate: item.createdDate ?? item.CreatedDate ?? item.createdAt ?? item.CreatedAt ?? "",
            updatedDate: item.updatedDate ?? item.UpdatedDate ?? item.updatedAt ?? item.UpdatedAt ?? ""
        };
    }

    function stockStatus(product) {
        if (product.stock <= 0) return { label: "Out of Stock", className: "out" };
        if (product.stock <= 10) return { label: "Low Stock", className: "low" };
        return { label: "In Stock", className: "healthy" };
    }

    function formatPrice(value) {
        return "₹" + Number(value || 0).toLocaleString("en-IN", { maximumFractionDigits: 2 });
    }

    function formatDate(value) {
        if (!value) return "—";
        const date = new Date(value);
        if (Number.isNaN(date.getTime())) return String(value);
        return date.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
    }

    function renderStats() {
        document.getElementById("inventoryTotal").textContent = products.length;
        document.getElementById("inventoryHealthy").textContent = products.filter(product => product.stock > 10).length;
        document.getElementById("inventoryLow").textContent = products.filter(product => product.stock > 0 && product.stock <= 10).length;
        document.getElementById("inventoryOut").textContent = products.filter(product => product.stock <= 0).length;
    }

    function renderCategoryFilter() {
        const selected = categoryFilter.value;
        const categories = [...new Set(products.map(product => String(product.category || "").trim()).filter(Boolean))].sort((a, b) => a.localeCompare(b));

        categoryFilter.replaceChildren(new Option("All Categories", "all"));

        categories.forEach(category => {
            categoryFilter.add(new Option(category, category));
        });

        categoryFilter.value = categories.includes(selected) ? selected : "all";
    }

    function render() {
        const query = searchInput.value.trim().toLowerCase();
        const selectedCategory = categoryFilter.value;
        const selectedStatus = statusFilter.value;

        const filtered = products.filter(product => {
            const matchesSearch = [product.id, product.name, product.brand, product.category].some(value => String(value || "").toLowerCase().includes(query));
            const matchesCategory = selectedCategory === "all" || product.category === selectedCategory;
            const matchesStatus = selectedStatus === "all" ||
                (selectedStatus === "in-stock" && product.stock > 10) ||
                (selectedStatus === "low-stock" && product.stock > 0 && product.stock <= 10) ||
                (selectedStatus === "out-of-stock" && product.stock <= 0);

            return matchesSearch && matchesCategory && matchesStatus;
        });

        tableBody.innerHTML = filtered.map(product => {
            const status = stockStatus(product);
            const initial = escapeHtml(String(product.name).trim().charAt(0).toUpperCase());

            return `<tr>
                <td><div class="ss-inventory-product-cell"><span class="ss-inventory-product-avatar">${initial}</span><div><strong>${escapeHtml(product.name)}</strong><small>${escapeHtml(product.id)}${product.brand ? " · " + escapeHtml(product.brand) : ""}</small></div></div></td>
                <td>${escapeHtml(product.category || "Uncategorized")}</td>
                <td>${formatPrice(product.price)}</td>
                <td><span class="ss-inventory-stock-number">${product.stock}</span><span class="ss-inventory-stock-unit">units</span></td>
                <td><span class="ss-inventory-status ${status.className}">${status.label}</span></td>
                <td>${escapeHtml(formatDate(product.updatedDate || product.createdDate))}</td>
                <td><button type="button" class="ss-inventory-adjust-btn" data-inventory-adjust="${escapeHtml(product.id)}">Adjust Stock</button></td>
            </tr>`;
        }).join("");

        emptyState.hidden = filtered.length !== 0;
        resultCount.textContent = `${filtered.length} ${filtered.length === 1 ? "product" : "products"}`;
        renderStats();
    }

    async function loadProducts() {
        let baseProducts = [];

        try {
            const response = await fetch("/admin/products-data");

            if (!response.ok) {
                throw new Error("The products endpoint returned an error.");
            }

            const data = await response.json();
            baseProducts = Array.isArray(data) ? data : Array.isArray(data.products) ? data.products : [];
        } catch {
            notify("Base products could not be loaded. Check the Products page and try again.");
        }

        const overrides = readObject("ssAdminProductOverrides");
        const deleted = readArray("ssAdminDeletedProducts").map(String);

        const normalizedBase = baseProducts.map((item, index) => {
            const base = normalize(item, index);
            const override = overrides[String(base.id)];

            return override ? normalize({ ...base, ...override }, index) : base;
        }).filter(product => !deleted.includes(String(product.id)));

        const addedProducts = readArray("ssAdminProducts")
            .map((item, index) => normalize(item, index))
            .filter(product => !deleted.includes(String(product.id)));

        products = normalizedBase.concat(addedProducts);

        renderCategoryFilter();
        render();
    }

    function updatePreview() {
        if (!selectedProduct) return;

        const amount = Number(quantityInput.value);
        const quantity = Number.isFinite(amount) ? Math.max(0, amount) : 0;
        const current = selectedProduct.stock;
        let next = current;

        if (adjustmentType.value === "increase") next = current + quantity;
        if (adjustmentType.value === "decrease") next = current - quantity;
        if (adjustmentType.value === "set") next = quantity;

        quantityLabel.textContent = adjustmentType.value === "increase" ? "Quantity to Add" :
            adjustmentType.value === "decrease" ? "Quantity to Remove" : "New Total Quantity";

        newStockPreview.textContent = `${Math.max(0, next)} units`;
        adjustmentError.textContent = "";
    }

    function openModal(product) {
        selectedProduct = product;
        form.reset();

        productIdInput.value = product.id;
        productNameLabel.textContent = product.name;
        currentStockLabel.textContent = `${product.stock} units`;
        adjustmentType.value = "increase";
        quantityInput.value = "1";
        quantityInput.min = "0";
        adjustmentError.textContent = "";

        updatePreview();
        modal.hidden = false;
        document.body.style.overflow = "hidden";
        quantityInput.focus();
    }

    function closeModal() {
        modal.hidden = true;
        document.body.style.overflow = "";
        selectedProduct = null;
    }

    function saveStock(product, nextStock) {
        const addedProducts = readArray("ssAdminProducts");
        const addedIndex = addedProducts.findIndex(item => String(item.id ?? item.Id ?? item.productId ?? item.ProductId) === String(product.id));
        const nextStatus = nextStock <= 0 ? "out" : product.status === "inactive" ? "inactive" : "active";
        const today = new Date().toISOString().split("T")[0];

        if (addedIndex >= 0) {
            addedProducts[addedIndex].stock = nextStock;
            addedProducts[addedIndex].status = nextStatus;
            addedProducts[addedIndex].updatedDate = today;
            localStorage.setItem("ssAdminProducts", JSON.stringify(addedProducts));
        } else {
            const overrides = readObject("ssAdminProductOverrides");
            const previous = overrides[String(product.id)] || {};

            overrides[String(product.id)] = {
                ...previous,
                stock: nextStock,
                status: nextStatus,
                updatedDate: today
            };

            localStorage.setItem("ssAdminProductOverrides", JSON.stringify(overrides));
        }

        product.stock = nextStock;
        product.status = nextStatus;
        product.updatedDate = today;
    }

    tableBody.addEventListener("click", function (event) {
        const button = event.target.closest("[data-inventory-adjust]");
        if (!button) return;

        const product = products.find(item => String(item.id) === String(button.dataset.inventoryAdjust));
        if (product) openModal(product);
    });

    searchInput.addEventListener("input", render);
    categoryFilter.addEventListener("change", render);
    statusFilter.addEventListener("change", render);
    adjustmentType.addEventListener("change", updatePreview);
    quantityInput.addEventListener("input", updatePreview);

    document.getElementById("inventoryCloseBtn").addEventListener("click", closeModal);
    document.getElementById("inventoryCancelBtn").addEventListener("click", closeModal);

    modal.addEventListener("click", function (event) {
        if (event.target === modal) closeModal();
    });

    document.addEventListener("keydown", function (event) {
        if (event.key === "Escape" && !modal.hidden) closeModal();
    });

    form.addEventListener("submit", function (event) {
        event.preventDefault();

        const product = products.find(item => String(item.id) === String(productIdInput.value));
        if (!product) {
            adjustmentError.textContent = "The selected product could not be found.";
            return;
        }

        const amount = Number(quantityInput.value);
        const type = adjustmentType.value;

        if (!Number.isInteger(amount) || amount < 0 || quantityInput.value.trim() === "") {
            adjustmentError.textContent = "Enter a valid whole number of units.";
            return;
        }

        if (type !== "set" && amount <= 0) {
            adjustmentError.textContent = "Enter a quantity greater than zero.";
            return;
        }

        if (type === "decrease" && amount > product.stock) {
            adjustmentError.textContent = "You cannot remove more units than are currently in stock.";
            return;
        }

        let nextStock = product.stock;

        if (type === "increase") nextStock += amount;
        if (type === "decrease") nextStock -= amount;
        if (type === "set") nextStock = amount;

        if (!Number.isSafeInteger(nextStock) || nextStock < 0) {
            adjustmentError.textContent = "Enter a valid stock quantity.";
            return;
        }

        try {
            saveStock(product, nextStock);
            closeModal();
            renderCategoryFilter();
            render();
            notify(`Stock updated for ${product.name}.`);
        } catch {
            adjustmentError.textContent = "Stock could not be saved. Check browser storage and try again.";
        }
    });

    loadProducts();
});

document.addEventListener("DOMContentLoaded", function () {
    const tableBody = document.getElementById("adminOrdersTableBody");
    if (!tableBody) return;

    const storageKey = "ssAdminOrders";
    const searchInput = document.getElementById("adminOrdersSearch");
    const statusFilter = document.getElementById("adminOrdersStatus");
    const paymentFilter = document.getElementById("adminOrdersPayment");
    const emptyState = document.getElementById("adminOrdersEmpty");
    const resultCount = document.getElementById("adminOrdersCount");
    const pageInfo = document.getElementById("adminOrdersPageInfo");
    const pagination = document.getElementById("adminOrdersPagination");
    const modal = document.getElementById("adminOrderModal");
    const statusForm = document.getElementById("adminOrderStatusForm");
    const selectedIdInput = document.getElementById("adminOrderSelectedId");
    const newStatusInput = document.getElementById("adminOrderNewStatus");
    const statusError = document.getElementById("adminOrderStatusError");
    const pageSize = 6;

    let orders = [];
    let currentPage = 1;

    const defaults = [
        { id: "ORD-1048", customer: "Aman Sharma", date: "2026-10-20", items: 2, total: 3299, payment: "UPI", status: "Shipped", address: "Ahmedabad, Gujarat" },
        { id: "ORD-1047", customer: "Priya Patel", date: "2026-10-20", items: 1, total: 1599, payment: "Card", status: "Confirmed", address: "Surat, Gujarat" },
        { id: "ORD-1046", customer: "Rohan Mehta", date: "2026-10-19", items: 3, total: 8299, payment: "UPI", status: "Packed", address: "Rajkot, Gujarat" },
        { id: "ORD-1045", customer: "Neha Shah", date: "2026-10-19", items: 1, total: 2499, payment: "Cash on Delivery", status: "Out for Delivery", address: "Vadodara, Gujarat" },
        { id: "ORD-1044", customer: "Arjun Rao", date: "2026-10-18", items: 2, total: 4199, payment: "Cash on Delivery", status: "Delivered", address: "Hyderabad, Telangana" },
        { id: "ORD-1043", customer: "Diya Patel", date: "2026-10-18", items: 4, total: 11200, payment: "Card", status: "Delivered", address: "Mumbai, Maharashtra" },
        { id: "ORD-1042", customer: "Kiran Das", date: "2026-10-17", items: 1, total: 799, payment: "UPI", status: "Cancelled", address: "Pune, Maharashtra" },
        { id: "ORD-1041", customer: "Sana Khan", date: "2026-10-17", items: 2, total: 5899, payment: "Cash on Delivery", status: "Failed", address: "Jaipur, Rajasthan" }
    ];

    const allowedStatuses = ["Confirmed", "Packed", "Shipped", "Out for Delivery", "Delivered", "Cancelled", "Failed"];

    function escapeHtml(value) {
        return String(value ?? "").replace(/[&<>"']/g, character => ({
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            '"': "&quot;",
            "'": "&#39;"
        }[character]));
    }

    function notify(message) {
        if (typeof window.showToast === "function") {
            window.showToast("ShopSphere Admin", message);
        } else {
            window.alert(message);
        }
    }

    function readOrders() {
        try {
            const saved = localStorage.getItem(storageKey);

            if (saved === null) {
                localStorage.setItem(storageKey, JSON.stringify(defaults));
                return defaults.map(order => ({ ...order }));
            }

            const data = JSON.parse(saved);
            return Array.isArray(data) ? data : [];
        } catch {
            notify("Orders could not be loaded from browser storage.");
            return [];
        }
    }

    function saveOrders() {
        localStorage.setItem(storageKey, JSON.stringify(orders));
    }

    function normalizeOrder(order) {
        const status = allowedStatuses.includes(order.status) ? order.status : "Confirmed";
        const paymentAliases = {
            COD: "Cash on Delivery",
            "Cash On Delivery": "Cash on Delivery"
        };

        return {
            id: String(order.id ?? ""),
            customer: String(order.customer ?? "Guest Customer"),
            date: String(order.date ?? ""),
            items: Math.max(0, Number(order.items) || 0),
            total: Math.max(0, Number(order.total) || 0),
            payment: paymentAliases[order.payment] || String(order.payment || "UPI"),
            status,
            address: String(order.address || "Address not provided")
        };
    }

    function statusClass(status) {
        return status.toLowerCase().replace(/\s+/g, "-");
    }

    function formatPrice(value) {
        return "₹" + Number(value || 0).toLocaleString("en-IN", { maximumFractionDigits: 2 });
    }

    function formatDate(value) {
        if (!value) return "—";

        const parts = String(value).split("-");
        if (parts.length === 3 && parts.every(part => /^\d+$/.test(part))) {
            return `${parts[2]} ${new Date(Number(parts[0]), Number(parts[1]) - 1, 1).toLocaleString("en-IN", { month: "short" })} ${parts[0]}`;
        }

        const date = new Date(value);
        return Number.isNaN(date.getTime()) ? String(value) : date.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
    }

    function renderStats() {
        document.getElementById("adminOrderTotal").textContent = orders.length;
        document.getElementById("adminOrderPending").textContent = orders.filter(order => ["Confirmed", "Packed"].includes(order.status)).length;
        document.getElementById("adminOrderTransit").textContent = orders.filter(order => ["Shipped", "Out for Delivery"].includes(order.status)).length;

        const revenue = orders.filter(order => order.status === "Delivered").reduce((total, order) => total + order.total, 0);
        document.getElementById("adminOrderRevenue").textContent = formatPrice(revenue);
    }

    function filteredOrders() {
        const query = searchInput.value.trim().toLowerCase();
        const selectedStatus = statusFilter.value;
        const selectedPayment = paymentFilter.value;

        return orders.filter(order => {
            const matchesSearch = [order.id, order.customer].some(value => value.toLowerCase().includes(query));
            const matchesStatus = selectedStatus === "all" || order.status === selectedStatus;
            const matchesPayment = selectedPayment === "all" || order.payment === selectedPayment;

            return matchesSearch && matchesStatus && matchesPayment;
        });
    }

    function renderPagination(pageCount) {
        pagination.replaceChildren();

        const previous = document.createElement("button");
        previous.type = "button";
        previous.className = "ss-admin-orders-page-btn";
        previous.textContent = "‹";
        previous.setAttribute("aria-label", "Previous page");
        previous.disabled = currentPage <= 1;
        previous.addEventListener("click", function () {
            if (currentPage > 1) {
                currentPage--;
                render();
            }
        });
        pagination.appendChild(previous);

        for (let page = 1; page <= pageCount; page++) {
            const button = document.createElement("button");
            button.type = "button";
            button.className = "ss-admin-orders-page-btn" + (page === currentPage ? " active" : "");
            button.textContent = page;
            button.setAttribute("aria-label", "Page " + page);
            button.setAttribute("aria-current", page === currentPage ? "page" : "false");
            button.addEventListener("click", function () {
                currentPage = page;
                render();
            });
            pagination.appendChild(button);
        }

        const next = document.createElement("button");
        next.type = "button";
        next.className = "ss-admin-orders-page-btn";
        next.textContent = "›";
        next.setAttribute("aria-label", "Next page");
        next.disabled = currentPage >= pageCount;
        next.addEventListener("click", function () {
            if (currentPage < pageCount) {
                currentPage++;
                render();
            }
        });
        pagination.appendChild(next);
    }

    function render() {
        const result = filteredOrders();
        const pageCount = Math.max(1, Math.ceil(result.length / pageSize));

        if (currentPage > pageCount) currentPage = pageCount;

        const start = (currentPage - 1) * pageSize;
        const visibleOrders = result.slice(start, start + pageSize);

        tableBody.innerHTML = visibleOrders.map(order => `
            <tr>
                <td><span class="ss-admin-order-id">${escapeHtml(order.id)}</span><small class="ss-admin-order-subtext">ShopSphere order</small></td>
                <td><span class="ss-admin-order-customer">${escapeHtml(order.customer)}</span></td>
                <td>${escapeHtml(formatDate(order.date))}</td>
                <td>${order.items}</td>
                <td><span class="ss-admin-order-total">${formatPrice(order.total)}</span></td>
                <td>${escapeHtml(order.payment)}</td>
                <td><span class="ss-admin-order-status ${statusClass(order.status)}">${escapeHtml(order.status)}</span></td>
                <td><button type="button" class="ss-admin-order-view-btn" data-order-view="${escapeHtml(order.id)}">View / Update</button></td>
            </tr>
        `).join("");

        emptyState.hidden = result.length !== 0;
        resultCount.textContent = `${result.length} ${result.length === 1 ? "order" : "orders"}`;
        pageInfo.textContent = result.length
            ? `Showing ${start + 1}–${Math.min(start + pageSize, result.length)} of ${result.length} orders`
            : "Showing 0 orders";

        renderPagination(pageCount);
        renderStats();
    }

    function openOrderModal(order) {
        document.getElementById("adminOrderModalTitle").textContent = order.id;
        document.getElementById("adminOrderModalSubtitle").textContent = "Review the order and update its status.";
        document.getElementById("adminOrderDetailCustomer").textContent = order.customer;
        document.getElementById("adminOrderDetailDate").textContent = formatDate(order.date);
        document.getElementById("adminOrderDetailItems").textContent = order.items + (order.items === 1 ? " item" : " items");
        document.getElementById("adminOrderDetailTotal").textContent = formatPrice(order.total);
        document.getElementById("adminOrderDetailPayment").textContent = order.payment;
        document.getElementById("adminOrderDetailAddress").textContent = order.address;
        selectedIdInput.value = order.id;
        newStatusInput.value = order.status;
        statusError.textContent = "";
        modal.hidden = false;
        document.body.style.overflow = "hidden";
        newStatusInput.focus();
    }

    function closeOrderModal() {
        modal.hidden = true;
        document.body.style.overflow = "";
    }

    tableBody.addEventListener("click", function (event) {
        const button = event.target.closest("[data-order-view]");
        if (!button) return;

        const order = orders.find(item => item.id === button.dataset.orderView);
        if (order) openOrderModal(order);
    });

    function applyFilters() {
        currentPage = 1;
        render();
    }

    searchInput.addEventListener("input", applyFilters);
    statusFilter.addEventListener("change", applyFilters);
    paymentFilter.addEventListener("change", applyFilters);

    document.getElementById("adminOrdersRefresh").addEventListener("click", function () {
        orders = readOrders().map(normalizeOrder);
        currentPage = 1;
        render();
        notify("Order list refreshed.");
    });

    document.getElementById("adminOrderModalClose").addEventListener("click", closeOrderModal);
    document.getElementById("adminOrderCancelBtn").addEventListener("click", closeOrderModal);

    modal.addEventListener("click", function (event) {
        if (event.target === modal) closeOrderModal();
    });

    document.addEventListener("keydown", function (event) {
        if (event.key === "Escape" && !modal.hidden) closeOrderModal();
    });

    statusForm.addEventListener("submit", function (event) {
        event.preventDefault();
        statusError.textContent = "";

        const order = orders.find(item => item.id === selectedIdInput.value);
        const nextStatus = newStatusInput.value;

        if (!order) {
            statusError.textContent = "Order could not be found.";
            return;
        }

        if (!allowedStatuses.includes(nextStatus)) {
            statusError.textContent = "Select a valid order status.";
            return;
        }

        const previousStatus = order.status;

        if (previousStatus === nextStatus) {
            closeOrderModal();
            return;
        }

        order.status = nextStatus;

        try {
            saveOrders();
            closeOrderModal();
            render();
            notify(`${order.id} status updated to ${nextStatus}.`);
        } catch {
            order.status = previousStatus;
            statusError.textContent = "Could not save the status. Check browser storage and try again.";
        }
    });

    orders = readOrders().map(normalizeOrder);
    render();
});

document.addEventListener("DOMContentLoaded", function() {
    const tableBody = document.getElementById("adminCustomersTableBody");
    if (!tableBody) return;

    const storageKey = "ssAdminCustomers";
    const searchInput = document.getElementById("adminCustomersSearch");
    const statusFilter = document.getElementById("adminCustomersStatusFilter");
    const emptyState = document.getElementById("adminCustomersEmpty");
    const countLabel = document.getElementById("adminCustomersCount");
    const pageInfo = document.getElementById("adminCustomersPageInfo");
    const pagination = document.getElementById("adminCustomersPagination");
    const modal = document.getElementById("adminCustomerModal");
    const form = document.getElementById("adminCustomerForm");
    const idInput = document.getElementById("adminCustomerId");
    const nameInput = document.getElementById("adminCustomerName");
    const emailInput = document.getElementById("adminCustomerEmail");
    const phoneInput = document.getElementById("adminCustomerPhone");
    const addressInput = document.getElementById("adminCustomerAddress");
    const statusInput = document.getElementById("adminCustomerStatus");
    const modalTitle = document.getElementById("adminCustomerModalTitle");
    const saveButton = document.getElementById("adminCustomerSaveBtn");
    const pageSize = 6;

    const defaults = [
        { id: "CUS-1001", name: "Aman Sharma", email: "aman.sharma@example.com", phone: "+91 98765 10001", address: "Ahmedabad, Gujarat", joined: "2026-01-12", status: "active" },
        { id: "CUS-1002", name: "Priya Patel", email: "priya.patel@example.com", phone: "+91 98765 10002", address: "Surat, Gujarat", joined: "2026-02-08", status: "active" },
        { id: "CUS-1003", name: "Rohan Mehta", email: "rohan.mehta@example.com", phone: "+91 98765 10003", address: "Rajkot, Gujarat", joined: "2026-02-21", status: "active" },
        { id: "CUS-1004", name: "Neha Shah", email: "neha.shah@example.com", phone: "+91 98765 10004", address: "Vadodara, Gujarat", joined: "2026-03-14", status: "active" },
        { id: "CUS-1005", name: "Arjun Rao", email: "arjun.rao@example.com", phone: "+91 98765 10005", address: "Hyderabad, Telangana", joined: "2026-04-03", status: "active" },
        { id: "CUS-1006", name: "Diya Patel", email: "diya.patel@example.com", phone: "+91 98765 10006", address: "Mumbai, Maharashtra", joined: "2026-04-19", status: "active" },
        { id: "CUS-1007", name: "Kiran Das", email: "kiran.das@example.com", phone: "+91 98765 10007", address: "Pune, Maharashtra", joined: "2026-05-11", status: "inactive" },
        { id: "CUS-1008", name: "Sana Khan", email: "sana.khan@example.com", phone: "+91 98765 10008", address: "Jaipur, Rajasthan", joined: "2026-06-02", status: "active" }
    ];

    const sampleOrders = [
        { customer: "Aman Sharma", total: 3299, status: "Shipped" },
        { customer: "Priya Patel", total: 1599, status: "Confirmed" },
        { customer: "Rohan Mehta", total: 8299, status: "Packed" },
        { customer: "Neha Shah", total: 2499, status: "Out for Delivery" },
        { customer: "Arjun Rao", total: 4199, status: "Delivered" },
        { customer: "Diya Patel", total: 11200, status: "Delivered" },
        { customer: "Kiran Das", total: 799, status: "Cancelled" },
        { customer: "Sana Khan", total: 5899, status: "Failed" }
    ];

    let customers = [];
    let currentPage = 1;

    function escapeHtml(value) {
        return String(value ?? "").replace(/[&<>"']/g, character => ({
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            '"': "&quot;",
            "'": "&#39;"
        }[character]));
    }

    function notify(message) {
        if (typeof window.showToast === "function") {
            window.showToast("ShopSphere Admin", message);
        } else {
            window.alert(message);
        }
    }

    function readCustomers() {
        try {
            const saved = localStorage.getItem(storageKey);

            if (saved === null) {
                localStorage.setItem(storageKey, JSON.stringify(defaults));
                return defaults.map(customer => ({ ...customer }));
            }

            const data = JSON.parse(saved);
            if (!Array.isArray(data)) throw new Error("Invalid customer data.");

            return data.map((item, index) => ({
                id: String(item.id ?? "CUS-" + (Date.now() + index)),
                name: String(item.name ?? ""),
                email: String(item.email ?? ""),
                phone: String(item.phone ?? ""),
                address: String(item.address ?? ""),
                joined: String(item.joined ?? ""),
                status: item.status === "inactive" ? "inactive" : "active"
            }));
        } catch {
            notify("Customer records could not be loaded. Check browser storage.");
            return [];
        }
    }

    function saveCustomers() {
        localStorage.setItem(storageKey, JSON.stringify(customers));
    }

    function readOrders() {
        try {
            const saved = localStorage.getItem("ssAdminOrders");
            if (saved === null) return sampleOrders;

            const parsed = JSON.parse(saved);
            return Array.isArray(parsed) ? parsed : [];
        } catch {
            return [];
        }
    }

    function getMetrics(customer) {
        const customerOrders = readOrders().filter(order =>
            String(order.customer ?? order.customerName ?? "").trim().toLowerCase() === customer.name.trim().toLowerCase()
        );

        const spending = customerOrders
            .filter(order => String(order.status || "").toLowerCase() === "delivered")
            .reduce((sum, order) => sum + Math.max(0, Number(order.total ?? order.totalAmount ?? 0) || 0), 0);

        return { count: customerOrders.length, spending };
    }

    function formatPrice(value) {
        return "₹" + Number(value || 0).toLocaleString("en-IN", { maximumFractionDigits: 2 });
    }

    function formatDate(value) {
        if (!value) return "—";
        const parts = String(value).split("-");

        if (parts.length === 3 && parts.every(part => /^\d+$/.test(part))) {
            const date = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
            if (!Number.isNaN(date.getTime())) {
                return date.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
            }
        }

        const date = new Date(value);
        return Number.isNaN(date.getTime()) ? String(value) : date.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
    }

    function renderStats() {
        document.getElementById("adminCustomersTotal").textContent = customers.length;
        document.getElementById("adminCustomersActive").textContent = customers.filter(customer => customer.status === "active").length;
        document.getElementById("adminCustomersInactive").textContent = customers.filter(customer => customer.status === "inactive").length;
        document.getElementById("adminCustomersWithOrders").textContent = customers.filter(customer => getMetrics(customer).count > 0).length;
    }

    function getFilteredCustomers() {
        const query = searchInput.value.trim().toLowerCase();
        const status = statusFilter.value;

        return customers.filter(customer => {
            const matchesSearch = [customer.id, customer.name, customer.email, customer.phone].some(value =>
                String(value || "").toLowerCase().includes(query)
            );
            const matchesStatus = status === "all" || customer.status === status;

            return matchesSearch && matchesStatus;
        });
    }

    function renderPagination(pageCount) {
        pagination.replaceChildren();

        const previous = document.createElement("button");
        previous.type = "button";
        previous.className = "ss-admin-customers-page-btn";
        previous.textContent = "‹";
        previous.disabled = currentPage <= 1;
        previous.setAttribute("aria-label", "Previous page");
        previous.addEventListener("click", function() {
            if (currentPage > 1) {
                currentPage--;
                render();
            }
        });
        pagination.appendChild(previous);

        for (let page = 1; page <= pageCount; page++) {
            const button = document.createElement("button");
            button.type = "button";
            button.className = "ss-admin-customers-page-btn" + (page === currentPage ? " active" : "");
            button.textContent = page;
            button.setAttribute("aria-label", "Page " + page);
            button.addEventListener("click", function() {
                currentPage = page;
                render();
            });
            pagination.appendChild(button);
        }

        const next = document.createElement("button");
        next.type = "button";
        next.className = "ss-admin-customers-page-btn";
        next.textContent = "›";
        next.disabled = currentPage >= pageCount;
        next.setAttribute("aria-label", "Next page");
        next.addEventListener("click", function() {
            if (currentPage < pageCount) {
                currentPage++;
                render();
            }
        });
        pagination.appendChild(next);
    }

    function render() {
        const result = getFilteredCustomers();
        const pageCount = Math.max(1, Math.ceil(result.length / pageSize));

        if (currentPage > pageCount) currentPage = pageCount;

        const start = (currentPage - 1) * pageSize;
        const visibleCustomers = result.slice(start, start + pageSize);

        tableBody.innerHTML = visibleCustomers.map(customer => {
            const metrics = getMetrics(customer);
            const initials = customer.name.trim().split(/\s+/).slice(0, 2).map(part => part.charAt(0)).join("").toUpperCase() || "?";

            return `<tr>
                <td><div class="ss-admin-customer-cell"><span class="ss-admin-customer-avatar">${escapeHtml(initials)}</span><div><strong>${escapeHtml(customer.name)}</strong><small>${escapeHtml(customer.id)}</small></div></div></td>
                <td><div class="ss-admin-customer-contact"><span>${escapeHtml(customer.email)}</span><small>${escapeHtml(customer.phone || "Phone not provided")}</small></div></td>
                <td><span class="ss-admin-customer-orders">${metrics.count}</span></td>
                <td><strong style="color:var(--text)">${formatPrice(metrics.spending)}</strong></td>
                <td>${escapeHtml(formatDate(customer.joined))}</td>
                <td><span class="ss-admin-customer-status ${customer.status}">${customer.status === "active" ? "Active" : "Inactive"}</span></td>
                <td>
                    <div class="ss-admin-customer-actions">
                        <button type="button" class="ss-admin-customer-action" data-customer-action="view" data-id="${escapeHtml(customer.id)}">View Details</button>
                        <button type="button" class="ss-admin-customer-action" data-customer-action="edit" data-id="${escapeHtml(customer.id)}">Edit</button>
                        <button type="button" class="ss-admin-customer-action" data-customer-action="toggle" data-id="${escapeHtml(customer.id)}">${customer.status === "active" ? "Deactivate" : "Activate"}</button>
                    </div>
                </td>
            </tr>`;
        }).join("");

        emptyState.hidden = result.length > 0;
        countLabel.textContent = `${result.length} ${result.length === 1 ? "customer" : "customers"}`;
        pageInfo.textContent = result.length
            ? `Showing ${start + 1}–${Math.min(start + pageSize, result.length)} of ${result.length} customers`
            : "Showing 0 customers";

        renderPagination(pageCount);
        renderStats();
    }

    function clearErrors() {
        ["adminCustomerNameError", "adminCustomerEmailError", "adminCustomerPhoneError"].forEach(id => {
            document.getElementById(id).textContent = "";
        });
    }

    function openModal(customer) {
        form.reset();
        clearErrors();

        idInput.value = customer ? customer.id : "";
        nameInput.value = customer ? customer.name : "";
        emailInput.value = customer ? customer.email : "";
        phoneInput.value = customer ? customer.phone : "";
        addressInput.value = customer ? customer.address : "";
        statusInput.value = customer ? customer.status : "active";
        modalTitle.textContent = customer ? "Edit Customer" : "Add Customer";
        saveButton.textContent = customer ? "Save Changes" : "Save Customer";

        modal.hidden = false;
        document.body.style.overflow = "hidden";
        nameInput.focus();
    }

    function closeModal() {
        modal.hidden = true;
        document.body.style.overflow = "";
    }

    document.getElementById("adminAddCustomerBtn").addEventListener("click", function() {
        openModal(null);
    });

    document.getElementById("adminCustomerCloseBtn").addEventListener("click", closeModal);
    document.getElementById("adminCustomerCancelBtn").addEventListener("click", closeModal);

    modal.addEventListener("click", function(event) {
        if (event.target === modal) closeModal();
    });

    document.addEventListener("keydown", function(event) {
        if (event.key === "Escape" && !modal.hidden) closeModal();
    });

    searchInput.addEventListener("input", function() {
        currentPage = 1;
        render();
    });

    statusFilter.addEventListener("change", function() {
        currentPage = 1;
        render();
    });

    tableBody.addEventListener("click", function(event) {
        const button = event.target.closest("[data-customer-action]");
        if (!button) return;

        const customer = customers.find(item => String(item.id) === String(button.dataset.id));
        if (!customer) return;


        if (button.dataset.customerAction === "view") {
            window.location.href = "/admin/customers/details?id=" + encodeURIComponent(customer.id);
            return;
        }


        if (button.dataset.customerAction === "edit") {
            openModal(customer);
            return;
        }

        if (button.dataset.customerAction === "toggle") {
            customer.status = customer.status === "active" ? "inactive" : "active";

            try {
                saveCustomers();
                render();
                notify(`${customer.name}'s account is now ${customer.status}.`);
            } catch {
                customer.status = customer.status === "active" ? "inactive" : "active";
                notify("Could not save the customer status. Check browser storage.");
            }
        }
    });

    form.addEventListener("submit", function(event) {
        event.preventDefault();
        clearErrors();

        const id = idInput.value;
        const name = nameInput.value.trim();
        const email = emailInput.value.trim().toLowerCase();
        const phone = phoneInput.value.trim();
        const address = addressInput.value.trim();
        const status = statusInput.value;
        const nameError = document.getElementById("adminCustomerNameError");
        const emailError = document.getElementById("adminCustomerEmailError");
        const phoneError = document.getElementById("adminCustomerPhoneError");

        if (!name) {
            nameError.textContent = "Full name is required.";
            nameInput.focus();
            return;
        }

        if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            emailError.textContent = "Enter a valid email address.";
            emailInput.focus();
            return;
        }

        if (customers.some(customer => String(customer.id) !== String(id) && customer.email.toLowerCase() === email)) {
            emailError.textContent = "A customer with this email already exists.";
            emailInput.focus();
            return;
        }

        if (phone && !/^[+()\-\s\d.]+$/.test(phone)) {
            phoneError.textContent = "Enter a valid phone number.";
            phoneInput.focus();
            return;
        }

        const today = new Date().toISOString().split("T")[0];

        if (id) {
            const index = customers.findIndex(customer => String(customer.id) === String(id));
            if (index < 0) return;

            customers[index] = {
                ...customers[index],
                name,
                email,
                phone,
                address,
                status
            };
        } else {
            customers.push({
                id: "CUS-" + Date.now(),
                name,
                email,
                phone,
                address,
                joined: today,
                status
            });
        }

        try {
            saveCustomers();
            closeModal();
            currentPage = 1;
            render();
            notify(id ? "Customer information updated." : "Customer added successfully.");
        } catch {
            notify("Customer information could not be saved. Check browser storage.");
        }
    });

    customers = readCustomers();
    render();


    const requestedEditId = new URLSearchParams(window.location.search).get("edit");
    if (requestedEditId) {
        const customerToEdit = customers.find(item => String(item.id) === requestedEditId);
        if (customerToEdit) openModal(customerToEdit);
    }

});

document.addEventListener("DOMContentLoaded", function() {
    const content = document.getElementById("adminCustomerDetailsContent");
    if (!content) return;

    const notFound = document.getElementById("customerDetailsNotFound");
    const orderTable = document.getElementById("customerDetailsOrderTable");
    const noOrders = document.getElementById("customerDetailsNoOrders");
    const editLink = document.getElementById("adminCustomerDetailsEdit");

    const defaultCustomers = [
        { id: "CUS-1001", name: "Aman Sharma", email: "aman.sharma@example.com", phone: "+91 98765 10001", address: "Ahmedabad, Gujarat", joined: "2026-01-12", status: "active" },
        { id: "CUS-1002", name: "Priya Patel", email: "priya.patel@example.com", phone: "+91 98765 10002", address: "Surat, Gujarat", joined: "2026-02-08", status: "active" },
        { id: "CUS-1003", name: "Rohan Mehta", email: "rohan.mehta@example.com", phone: "+91 98765 10003", address: "Rajkot, Gujarat", joined: "2026-02-21", status: "active" },
        { id: "CUS-1004", name: "Neha Shah", email: "neha.shah@example.com", phone: "+91 98765 10004", address: "Vadodara, Gujarat", joined: "2026-03-14", status: "active" },
        { id: "CUS-1005", name: "Arjun Rao", email: "arjun.rao@example.com", phone: "+91 98765 10005", address: "Hyderabad, Telangana", joined: "2026-04-03", status: "active" },
        { id: "CUS-1006", name: "Diya Patel", email: "diya.patel@example.com", phone: "+91 98765 10006", address: "Mumbai, Maharashtra", joined: "2026-04-19", status: "active" },
        { id: "CUS-1007", name: "Kiran Das", email: "kiran.das@example.com", phone: "+91 98765 10007", address: "Pune, Maharashtra", joined: "2026-05-11", status: "inactive" },
        { id: "CUS-1008", name: "Sana Khan", email: "sana.khan@example.com", phone: "+91 98765 10008", address: "Jaipur, Rajasthan", joined: "2026-06-02", status: "active" }
    ];

    const defaultOrders = [
        { id: "ORD-1048", customer: "Aman Sharma", date: "2026-10-20", items: 2, total: 3299, payment: "UPI", status: "Shipped", address: "Ahmedabad, Gujarat" },
        { id: "ORD-1047", customer: "Priya Patel", date: "2026-10-20", items: 1, total: 1599, payment: "Card", status: "Confirmed", address: "Surat, Gujarat" },
        { id: "ORD-1046", customer: "Rohan Mehta", date: "2026-10-19", items: 3, total: 8299, payment: "UPI", status: "Packed", address: "Rajkot, Gujarat" },
        { id: "ORD-1045", customer: "Neha Shah", date: "2026-10-19", items: 1, total: 2499, payment: "Cash on Delivery", status: "Out for Delivery", address: "Vadodara, Gujarat" },
        { id: "ORD-1044", customer: "Arjun Rao", date: "2026-10-18", items: 2, total: 4199, payment: "Cash on Delivery", status: "Delivered", address: "Hyderabad, Telangana" },
        { id: "ORD-1043", customer: "Diya Patel", date: "2026-10-18", items: 4, total: 11200, payment: "Card", status: "Delivered", address: "Mumbai, Maharashtra" },
        { id: "ORD-1042", customer: "Kiran Das", date: "2026-10-17", items: 1, total: 799, payment: "UPI", status: "Cancelled", address: "Pune, Maharashtra" },
        { id: "ORD-1041", customer: "Sana Khan", date: "2026-10-17", items: 2, total: 5899, payment: "Cash on Delivery", status: "Failed", address: "Jaipur, Rajasthan" }
    ];

    function readArray(key, fallback) {
        try {
            const saved = localStorage.getItem(key);
            if (saved === null) return fallback.map(item => ({ ...item }));
            const parsed = JSON.parse(saved);
            return Array.isArray(parsed) ? parsed : [];
        } catch {
            return [];
        }
    }

    function escapeHtml(value) {
        return String(value ?? "").replace(/[&<>"']/g, character => ({
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            '"': "&quot;",
            "'": "&#39;"
        }[character]));
    }

    function setText(id, value) {
        document.getElementById(id).textContent = value ?? "—";
    }

    function formatPrice(value) {
        return "₹" + Number(value || 0).toLocaleString("en-IN", { maximumFractionDigits: 2 });
    }

    function formatDate(value) {
        if (!value) return "—";
        const parts = String(value).split("-");

        if (parts.length === 3 && parts.every(part => /^\d+$/.test(part))) {
            const date = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
            if (!Number.isNaN(date.getTime())) {
                return date.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
            }
        }

        const date = new Date(value);
        return Number.isNaN(date.getTime()) ? String(value) : date.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
    }

    function normalizeOrder(order, index) {
        const itemCount = Array.isArray(order.items) ? order.items.length : Number(order.items ?? order.numberOfProducts ?? 0) || 0;

        return {
            id: String(order.id ?? order.orderId ?? order.orderNumber ?? "ORD-" + index),
            customer: String(order.customer ?? order.customerName ?? ""),
            date: order.date ?? order.orderDate ?? order.createdAt ?? "",
            items: itemCount,
            total: Number(order.total ?? order.totalAmount ?? order.amount ?? 0) || 0,
            payment: String(order.payment ?? order.paymentMethod ?? "—"),
            status: String(order.status ?? "Confirmed"),
            address: String(order.address ?? order.shippingAddress ?? "Address not provided")
        };
    }

    function render() {
        const customerId = new URLSearchParams(window.location.search).get("id");

        if (!customerId) {
            content.hidden = true;
            notFound.hidden = false;
            return;
        }

        const customers = readArray("ssAdminCustomers", defaultCustomers);
        const customer = customers.find(item => String(item.id ?? item.Id) === customerId);

        if (!customer) {
            content.hidden = true;
            notFound.hidden = false;
            return;
        }

        const orders = readArray("ssAdminOrders", defaultOrders)
            .map(normalizeOrder)
            .filter(order => order.customer.trim().toLowerCase() === String(customer.name ?? customer.Name ?? "").trim().toLowerCase())
            .sort((a, b) => String(b.date).localeCompare(String(a.date)));

        const name = String(customer.name ?? customer.Name ?? "Customer");
        const status = String(customer.status ?? customer.Status ?? "active").toLowerCase() === "inactive" ? "inactive" : "active";
        const delivered = orders.filter(order => order.status.toLowerCase() === "delivered");
        const inProgress = orders.filter(order => ["confirmed", "packed", "shipped", "out for delivery"].includes(order.status.toLowerCase()));
        const spending = delivered.reduce((sum, order) => sum + order.total, 0);
        const initials = name.trim().split(/\s+/).slice(0, 2).map(part => part.charAt(0)).join("").toUpperCase();

        content.hidden = false;
        notFound.hidden = true;

        setText("customerDetailsAvatar", initials || "C");
        setText("customerDetailsName", name);
        setText("customerDetailsId", customer.id ?? customer.Id);
        setText("customerDetailsFullName", name);
        setText("customerDetailsEmail", customer.email ?? customer.Email ?? "Not provided");
        setText("customerDetailsPhone", customer.phone ?? customer.Phone ?? "Not provided");
        setText("customerDetailsAddress", customer.address ?? customer.Address ?? "Not provided");
        setText("customerDetailsAccountId", customer.id ?? customer.Id);
        setText("customerDetailsJoined", formatDate(customer.joined ?? customer.registrationDate ?? customer.createdAt));
        setText("customerDetailsAccountStatus", status === "active" ? "Active" : "Inactive");
        setText("customerDetailsActivity", orders.length ? "Has order history" : "No orders yet");
        setText("customerDetailsOrders", orders.length);
        setText("customerDetailsSpending", formatPrice(spending));
        setText("customerDetailsDelivered", delivered.length);
        setText("customerDetailsPending", inProgress.length);
        setText("customerDetailsOrderCount", `${orders.length} ${orders.length === 1 ? "order" : "orders"}`);

        const statusBadge = document.getElementById("customerDetailsStatus");
        statusBadge.className = "ss-admin-customer-details-status " + status;
        statusBadge.textContent = status === "active" ? "Active Account" : "Inactive Account";

        editLink.href = "/admin/customers?edit=" + encodeURIComponent(customer.id ?? customer.Id);

        orderTable.innerHTML = orders.map(order => `
            <tr>
                <td><span class="ss-admin-customer-order-id">${escapeHtml(order.id)}</span></td>
                <td>${escapeHtml(formatDate(order.date))}</td>
                <td>${order.items}</td>
                <td>${escapeHtml(order.payment)}</td>
                <td><span class="ss-admin-customer-order-total">${formatPrice(order.total)}</span></td>
                <td><span class="ss-admin-customer-order-status ${escapeHtml(order.status.toLowerCase().replace(/\s+/g, "-"))}">${escapeHtml(order.status)}</span></td>
            </tr>
        `).join("");

        noOrders.hidden = orders.length > 0;
    }

    render();
});

document.addEventListener("DOMContentLoaded", function () {
    const table = document.getElementById("adminReviewsTable");
    if (!table) return;

    const STORAGE_KEY = "ssAdminReviews";
    const pageSize = 6;

    const defaultReviews = [
        { id: "REV-1001", customer: "Aman Sharma", product: "Premium Wireless Headphones", rating: 5, review: "Excellent sound quality and comfortable for long hours. Highly recommended.", date: "2026-10-25", status: "Published", featured: true },
        { id: "REV-1002", customer: "Priya Patel", product: "Classic Leather Handbag", rating: 4, review: "Beautiful design and good quality. The delivery was also quick.", date: "2026-10-24", status: "Published", featured: false },
        { id: "REV-1003", customer: "Rohan Mehta", product: "Smart Fitness Watch", rating: 5, review: "Great features, accurate tracking and impressive battery life.", date: "2026-10-23", status: "Pending", featured: false },
        { id: "REV-1004", customer: "Neha Shah", product: "Gold Plated Necklace", rating: 3, review: "The product looks good, but the packaging could be improved.", date: "2026-10-22", status: "Published", featured: false },
        { id: "REV-1005", customer: "Arjun Rao", product: "Running Sports Shoes", rating: 2, review: "The size was slightly different from what I expected.", date: "2026-10-21", status: "Pending", featured: false },
        { id: "REV-1006", customer: "Diya Patel", product: "Ceramic Coffee Mug Set", rating: 5, review: "Lovely mugs with excellent finishing. Worth purchasing.", date: "2026-10-20", status: "Published", featured: true },
        { id: "REV-1007", customer: "Kiran Das", product: "Bluetooth Speaker", rating: 1, review: "I was not satisfied with the product performance.", date: "2026-10-19", status: "Hidden", featured: false },
        { id: "REV-1008", customer: "Sana Khan", product: "Women's Casual Watch", rating: 4, review: "Elegant watch and comfortable to wear every day.", date: "2026-10-18", status: "Published", featured: false },
        { id: "REV-1009", customer: "Aman Sharma", product: "Cotton Casual Shirt", rating: 5, review: "Excellent fabric and perfect fitting. Great value for money.", date: "2026-10-17", status: "Pending", featured: false },
        { id: "REV-1010", customer: "Priya Patel", product: "Diamond Style Earrings", rating: 4, review: "Very attractive design and good finishing.", date: "2026-10-16", status: "Published", featured: false }
    ];

    function readReviews() {
        try {
            const stored = JSON.parse(localStorage.getItem(STORAGE_KEY));
            return Array.isArray(stored) ? stored : defaultReviews.map(item => ({ ...item }));
        } catch {
            return defaultReviews.map(item => ({ ...item }));
        }
    }

    let reviews = readReviews();
    let currentPage = 1;

    const searchInput = document.getElementById("adminReviewSearch");
    const ratingFilter = document.getElementById("adminReviewRatingFilter");
    const statusFilter = document.getElementById("adminReviewStatusFilter");
    const emptyState = document.getElementById("adminReviewsEmpty");
    const pagination = document.getElementById("adminReviewsPagination");

    function saveReviews() {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(reviews));
    }

    function escapeHtml(value) {
        return String(value ?? "").replace(/[&<>"']/g, char => ({
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            '"': "&quot;",
            "'": "&#39;"
        })[char]);
    }

    function formatDate(value) {
        const date = new Date(value + "T00:00:00");
        return Number.isNaN(date.getTime()) ? escapeHtml(value) : date.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
    }

    function getFilteredReviews() {
        const search = searchInput.value.trim().toLowerCase();
        const rating = ratingFilter.value;
        const status = statusFilter.value;

        return reviews.filter(review => {
            const matchesSearch = `${review.customer} ${review.product} ${review.review} ${review.id}`.toLowerCase().includes(search);
            const matchesRating = rating === "all" || String(review.rating) === rating;
            const matchesStatus = status === "all" || review.status === status;
            return matchesSearch && matchesRating && matchesStatus;
        });
    }

    function renderStats() {
        const published = reviews.filter(item => item.status === "Published").length;
        const pending = reviews.filter(item => item.status === "Pending").length;
        const average = reviews.length ? reviews.reduce((sum, item) => sum + Number(item.rating || 0), 0) / reviews.length : 0;

        document.getElementById("adminReviewTotal").textContent = reviews.length;
        document.getElementById("adminReviewPublished").textContent = published;
        document.getElementById("adminReviewPending").textContent = pending;
        document.getElementById("adminReviewAverage").textContent = average.toFixed(1);
    }

    function getStatusClass(status) {
        return String(status).toLowerCase();
    }

    function renderPagination(totalPages) {
        pagination.innerHTML = "";

        if (totalPages <= 1) return;

        const previous = document.createElement("button");
        previous.type = "button";
        previous.className = "ss-admin-page-btn";
        previous.textContent = "‹";
        previous.disabled = currentPage === 1;
        previous.addEventListener("click", () => {
            currentPage--;
            render();
        });
        pagination.appendChild(previous);

        for (let page = 1; page <= totalPages; page++) {
            const button = document.createElement("button");
            button.type = "button";
            button.className = "ss-admin-page-btn" + (page === currentPage ? " ss-active" : "");
            button.textContent = page;
            button.addEventListener("click", () => {
                currentPage = page;
                render();
            });
            pagination.appendChild(button);
        }

        const next = document.createElement("button");
        next.type = "button";
        next.className = "ss-admin-page-btn";
        next.textContent = "›";
        next.disabled = currentPage === totalPages;
        next.addEventListener("click", () => {
            currentPage++;
            render();
        });
        pagination.appendChild(next);
    }

    function render() {
        renderStats();

        const filtered = getFilteredReviews();
        const totalPages = Math.ceil(filtered.length / pageSize);
        currentPage = Math.max(1, Math.min(currentPage, totalPages || 1));

        const start = (currentPage - 1) * pageSize;
        const visible = filtered.slice(start, start + pageSize);

        document.getElementById("adminReviewResultCount").textContent = `${filtered.length} reviews`;
        document.getElementById("adminReviewShowing").textContent = filtered.length ? `Showing ${start + 1}-${start + visible.length} of ${filtered.length} reviews` : "Showing 0 reviews";

        table.innerHTML = visible.map(review => `
            <tr>
                <td><div class="ss-admin-review-customer">${escapeHtml(review.customer)}</div><small>${escapeHtml(review.id)}</small></td>
                <td><div class="ss-admin-review-product">${escapeHtml(review.product)}</div></td>
                <td><span class="ss-admin-review-stars">${"★".repeat(Number(review.rating) || 0)}${"☆".repeat(5 - (Number(review.rating) || 0))}</span></td>
                <td><div class="ss-admin-review-text">${escapeHtml(review.review)}</div></td>
                <td>${formatDate(review.date)}</td>
                <td><span class="ss-admin-review-status ${getStatusClass(review.status)}">${escapeHtml(review.status)}</span>${review.featured ? '<small class="ss-admin-review-featured">Featured</small>' : ""}</td>
                <td>
                    <div class="ss-admin-review-actions">
                        ${review.status === "Pending" ? `<button type="button" class="ss-admin-review-action approve" data-action="approve" data-id="${escapeHtml(review.id)}" title="Approve">✓</button>` : ""}
                        ${review.status === "Published" ? `<button type="button" class="ss-admin-review-action hide" data-action="hide" data-id="${escapeHtml(review.id)}" title="Hide">◉</button>` : ""}
                        ${review.status === "Hidden" ? `<button type="button" class="ss-admin-review-action approve" data-action="approve" data-id="${escapeHtml(review.id)}" title="Publish">↗</button>` : ""}
                        ${review.status === "Published" ? `<button type="button" class="ss-admin-review-action feature" data-action="feature" data-id="${escapeHtml(review.id)}" title="${review.featured ? "Unfeature" : "Feature"}">${review.featured ? "★" : "☆"}</button>` : ""}
                        <button type="button" class="ss-admin-review-action delete" data-action="delete" data-id="${escapeHtml(review.id)}" title="Delete">×</button>
                    </div>
                </td>
            </tr>
        `).join("");

        emptyState.hidden = filtered.length > 0;
        renderPagination(totalPages);
    }

    table.addEventListener("click", function (event) {
        const button = event.target.closest("[data-action]");
        if (!button) return;

        const review = reviews.find(item => item.id === button.dataset.id);
        if (!review) return;

        const action = button.dataset.action;

        if (action === "approve") {
            review.status = "Published";
            review.featured = false;
        } else if (action === "hide") {
            review.status = "Hidden";
            review.featured = false;
        } else if (action === "feature") {
            review.featured = !review.featured;
        } else if (action === "delete") {
            if (!confirm("Are you sure you want to delete this review?")) return;
            reviews = reviews.filter(item => item.id !== review.id);
        }

        saveReviews();
        render();
    });

    searchInput.addEventListener("input", () => {
        currentPage = 1;
        render();
    });

    ratingFilter.addEventListener("change", () => {
        currentPage = 1;
        render();
    });

    statusFilter.addEventListener("change", () => {
        currentPage = 1;
        render();
    });

    render();
});

document.addEventListener("DOMContentLoaded", function () {
    const page = document.querySelector(".ss-admin-reports-page");
    if (!page) return;

    const periodSelect = document.getElementById("adminReportPeriod");
    const canvas = document.getElementById("adminSalesChart");
    const ctx = canvas.getContext("2d");

    const datasets = {
        7: {
            labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
            sales: [12500, 18200, 14800, 22500, 19600, 28400, 32100],
            revenue: 148100,
            orders: 42,
            customers: 28
        },
        30: {
            labels: ["Week 1", "Week 2", "Week 3", "Week 4"],
            sales: [125000, 158000, 142000, 186000],
            revenue: 611000,
            orders: 186,
            customers: 124
        },
        90: {
            labels: ["Month 1", "Month 2", "Month 3"],
            sales: [425000, 518000, 611000],
            revenue: 1554000,
            orders: 486,
            customers: 312
        },
        365: {
            labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
            sales: [320000, 355000, 410000, 385000, 460000, 490000, 520000, 485000, 550000, 611000, 0, 0],
            revenue: 4586000,
            orders: 1428,
            customers: 824
        }
    };

    const orderStatuses = [
        { name: "Delivered", count: 112, percent: 60 },
        { name: "Shipped", count: 32, percent: 17 },
        { name: "Processing", count: 24, percent: 13 },
        { name: "Cancelled", count: 18, percent: 10 }
    ];

    const topProducts = [
        { name: "Premium Wireless Headphones", category: "Electronics", units: 186, revenue: 558000 },
        { name: "Classic Leather Handbag", category: "Fashion", units: 152, revenue: 380000 },
        { name: "Gold Plated Necklace", category: "Jewellery", units: 128, revenue: 320000 },
        { name: "Running Sports Shoes", category: "Shoes", units: 105, revenue: 262500 },
        { name: "Smart Fitness Watch", category: "Electronics", units: 94, revenue: 235000 }
    ];

    const categories = [
        { name: "Electronics", revenue: 185000, percent: 34 },
        { name: "Fashion", revenue: 142000, percent: 26 },
        { name: "Jewellery", revenue: 108000, percent: 20 },
        { name: "Shoes", revenue: 76000, percent: 14 },
        { name: "Accessories", revenue: 33000, percent: 6 }
    ];

    const customers = [
        { name: "Aman Sharma", orders: 12, spending: 28500, activity: "01 Nov 2026", status: "Active" },
        { name: "Priya Patel", orders: 9, spending: 22400, activity: "31 Oct 2026", status: "Active" },
        { name: "Rohan Mehta", orders: 7, spending: 18600, activity: "30 Oct 2026", status: "Active" },
        { name: "Neha Shah", orders: 5, spending: 14200, activity: "28 Oct 2026", status: "Active" },
        { name: "Arjun Rao", orders: 3, spending: 8900, activity: "25 Oct 2026", status: "Inactive" }
    ];

    function formatCurrency(value) {
        return "₹" + Number(value).toLocaleString("en-IN");
    }

    function escapeHtml(value) {
        return String(value ?? "").replace(/[&<>"']/g, char => ({
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            '"': "&quot;",
            "'": "&#39;"
        })[char]);
    }

    function renderStats(data) {
        document.getElementById("reportTotalRevenue").textContent = formatCurrency(data.revenue);
        document.getElementById("reportTotalOrders").textContent = data.orders.toLocaleString("en-IN");
        document.getElementById("reportAverageOrder").textContent = formatCurrency(data.orders ? Math.round(data.revenue / data.orders) : 0);
        document.getElementById("reportTotalCustomers").textContent = data.customers.toLocaleString("en-IN");
    }

    function renderSalesChart(data) {
        const width = canvas.clientWidth;
        const height = 280;
        const ratio = window.devicePixelRatio || 1;

        canvas.width = width * ratio;
        canvas.height = height * ratio;
        canvas.style.height = height + "px";
        ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
        ctx.clearRect(0, 0, width, height);

        const padding = { top: 20, right: 18, bottom: 38, left: 62 };
        const chartWidth = width - padding.left - padding.right;
        const chartHeight = height - padding.top - padding.bottom;
        const maxValue = Math.max(...data.sales, 1) * 1.2;
        const points = data.sales.map((value, index) => ({
            x: padding.left + (data.sales.length === 1 ? chartWidth / 2 : index * chartWidth / (data.sales.length - 1)),
            y: padding.top + chartHeight - value / maxValue * chartHeight
        }));

        ctx.font = "10px Manrope, Arial";
        ctx.textAlign = "right";
        ctx.textBaseline = "middle";
        ctx.fillStyle = "#777168";

        for (let i = 0; i <= 4; i++) {
            const y = padding.top + chartHeight * i / 4;
            const value = maxValue * (4 - i) / 4;
            ctx.beginPath();
            ctx.strokeStyle = "#e9e5dc";
            ctx.lineWidth = 1;
            ctx.moveTo(padding.left, y);
            ctx.lineTo(width - padding.right, y);
            ctx.stroke();
            ctx.fillText("₹" + Math.round(value / 1000) + "k", padding.left - 10, y);
        }

        ctx.textAlign = "center";
        ctx.textBaseline = "top";

        data.labels.forEach((label, index) => {
            const x = points[index].x;
            ctx.fillStyle = "#777168";
            ctx.fillText(label, x, height - padding.bottom + 14);
        });

        if (!points.length) return;

        ctx.beginPath();
        ctx.moveTo(points[0].x, padding.top + chartHeight);
        points.forEach(point => ctx.lineTo(point.x, point.y));
        ctx.lineTo(points[points.length - 1].x, padding.top + chartHeight);
        ctx.closePath();
        ctx.fillStyle = "rgba(42,107,201,.10)";
        ctx.fill();

        ctx.beginPath();
        points.forEach((point, index) => {
            if (index === 0) ctx.moveTo(point.x, point.y);
            else ctx.lineTo(point.x, point.y);
        });
        ctx.strokeStyle = "#2A6BC9";
        ctx.lineWidth = 3;
        ctx.lineJoin = "round";
        ctx.lineCap = "round";
        ctx.stroke();

        points.forEach(point => {
            ctx.beginPath();
            ctx.arc(point.x, point.y, 4, 0, Math.PI * 2);
            ctx.fillStyle = "#2A6BC9";
            ctx.fill();
            ctx.strokeStyle = "#FFFFFF";
            ctx.lineWidth = 2;
            ctx.stroke();
        });
    }

    function renderOrderStatuses() {
        const container = document.getElementById("adminOrderStatusChart");
        container.innerHTML = orderStatuses.map(item => `
            <div class="ss-admin-report-status-row">
                <div class="ss-admin-report-status-info">
                    <span>${escapeHtml(item.name)}</span>
                    <strong>${item.count}</strong>
                </div>
                <div class="ss-admin-report-status-track">
                    <span style="width:${item.percent}%"></span>
                </div>
                <small>${item.percent}%</small>
            </div>
        `).join("");
    }

    function renderTopProducts() {
        const container = document.getElementById("adminTopProducts");
        container.innerHTML = topProducts.map((product, index) => `
            <div class="ss-admin-report-product-row">
                <span class="ss-admin-report-product-rank">${index + 1}</span>
                <div class="ss-admin-report-product-info">
                    <strong>${escapeHtml(product.name)}</strong>
                    <small>${escapeHtml(product.category)} · ${product.units} units sold</small>
                </div>
                <strong class="ss-admin-report-product-revenue">${formatCurrency(product.revenue)}</strong>
            </div>
        `).join("");
    }

    function renderCategories() {
        const container = document.getElementById("adminCategoryRevenue");
        container.innerHTML = categories.map(item => `
            <div class="ss-admin-report-category-row">
                <div class="ss-admin-report-category-info">
                    <strong>${escapeHtml(item.name)}</strong>
                    <span>${formatCurrency(item.revenue)}</span>
                </div>
                <div class="ss-admin-report-category-track">
                    <span style="width:${item.percent}%"></span>
                </div>
                <small>${item.percent}%</small>
            </div>
        `).join("");
    }

    function renderCustomers() {
        const container = document.getElementById("adminReportCustomers");
        container.innerHTML = customers.map(customer => `
            <tr>
                <td><strong>${escapeHtml(customer.name)}</strong></td>
                <td>${customer.orders}</td>
                <td><strong>${formatCurrency(customer.spending)}</strong></td>
                <td>${escapeHtml(customer.activity)}</td>
                <td><span class="ss-admin-report-customer-status ${customer.status.toLowerCase()}">${customer.status}</span></td>
            </tr>
        `).join("");
    }

    function render() {
        const data = datasets[periodSelect.value] || datasets[30];
        renderStats(data);
        renderSalesChart(data);
        renderOrderStatuses();
        renderTopProducts();
        renderCategories();
        renderCustomers();
    }

    function exportCSV() {
        const data = datasets[periodSelect.value] || datasets[30];
        const rows = [
            ["ShopSphere Sales Report"],
            ["Period", periodSelect.options[periodSelect.selectedIndex].text],
            ["Total Revenue", data.revenue],
            ["Total Orders", data.orders],
            ["Average Order Value", Math.round(data.revenue / data.orders)],
            ["Total Customers", data.customers],
            [],
            ["Top Selling Products"],
            ["Product", "Category", "Units Sold", "Revenue"],
            ...topProducts.map(item => [item.name, item.category, item.units, item.revenue]),
            [],
            ["Revenue by Category"],
            ["Category", "Revenue", "Percentage"],
            ...categories.map(item => [item.name, item.revenue, item.percent + "%"]),
            [],
            ["Customer Activity"],
            ["Customer", "Total Orders", "Total Spending", "Last Activity", "Status"],
            ...customers.map(item => [item.name, item.orders, item.spending, item.activity, item.status])
        ];

        const csv = rows.map(row => row.map(value => {
            const safeValue = String(value ?? "").replace(/"/g, '""');
            return `"${safeValue}"`;
        }).join(",")).join("\r\n");

        const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = "ShopSphere-Reports-" + periodSelect.value + "-Days.csv";
        link.click();
        URL.revokeObjectURL(url);
    }

    periodSelect.addEventListener("change", render);
    document.getElementById("adminReportExport").addEventListener("click", exportCSV);

    let resizeTimer;
    window.addEventListener("resize", function () {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(render, 150);
    });

    render();
});

document.addEventListener("DOMContentLoaded", function () {
    const list = document.getElementById("adminNotificationList");
    if (!list) return;

    const STORAGE_KEY = "ssAdminNotifications";
    const pageSize = 7;

    const defaultNotifications = [
        { id: "NOT-1001", type: "Order", title: "New order received", message: "Order ORD-1049 has been placed by Aman Sharma.", date: "2026-11-02T09:30:00", read: false },
        { id: "NOT-1002", type: "Inventory", title: "Low stock alert", message: "Premium Wireless Headphones has only 5 units remaining.", date: "2026-11-02T08:45:00", read: false },
        { id: "NOT-1003", type: "Payment", title: "Payment received", message: "Payment of ₹4,999 was received for order ORD-1048.", date: "2026-11-01T17:20:00", read: false },
        { id: "NOT-1004", type: "Customer", title: "New customer registered", message: "A new customer account was created by Rahul Verma.", date: "2026-11-01T15:10:00", read: true },
        { id: "NOT-1005", type: "Order", title: "Order delivered", message: "Order ORD-1045 was successfully delivered.", date: "2026-11-01T12:30:00", read: true },
        { id: "NOT-1006", type: "Inventory", title: "Out of stock warning", message: "Gold Plated Necklace is currently out of stock.", date: "2026-10-31T18:00:00", read: false },
        { id: "NOT-1007", type: "System", title: "System backup completed", message: "The scheduled system backup completed successfully.", date: "2026-10-31T10:00:00", read: true },
        { id: "NOT-1008", type: "Payment", title: "Payment failed", message: "Payment for order ORD-1042 could not be processed.", date: "2026-10-30T16:15:00", read: false },
        { id: "NOT-1009", type: "Customer", title: "New customer review", message: "Priya Patel submitted a new product review.", date: "2026-10-30T11:40:00", read: true },
        { id: "NOT-1010", type: "Order", title: "Order cancelled", message: "Order ORD-1041 was cancelled by the customer.", date: "2026-10-29T14:25:00", read: true },
        { id: "NOT-1011", type: "System", title: "Admin settings updated", message: "Store settings were successfully updated.", date: "2026-10-28T09:15:00", read: true }
    ];

    function readNotifications() {
        try {
            const stored = JSON.parse(localStorage.getItem(STORAGE_KEY));
            return Array.isArray(stored) ? stored : defaultNotifications.map(item => ({ ...item }));
        } catch {
            return defaultNotifications.map(item => ({ ...item }));
        }
    }

    let notifications = readNotifications();
    let currentPage = 1;

    const search = document.getElementById("adminNotificationSearch");
    const typeFilter = document.getElementById("adminNotificationType");
    const statusFilter = document.getElementById("adminNotificationStatus");
    const empty = document.getElementById("adminNotificationsEmpty");
    const pagination = document.getElementById("adminNotificationPagination");

    function save() {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(notifications));
    }

    function escapeHtml(value) {
        return String(value ?? "").replace(/[&<>"']/g, char => ({
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            '"': "&quot;",
            "'": "&#39;"
        })[char]);
    }

    function formatDate(value) {
        const date = new Date(value);
        if (Number.isNaN(date.getTime())) return "Unknown date";
        return date.toLocaleString("en-IN", {
            day: "2-digit",
            month: "short",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit"
        });
    }

    function getIcon(type) {
        const icons = {
            Order: "▤",
            Customer: "♙",
            Inventory: "▦",
            Payment: "₹",
            System: "⚙"
        };
        return icons[type] || "•";
    }

    function renderStats() {
        document.getElementById("adminNotificationTotal").textContent = notifications.length;
        document.getElementById("adminNotificationUnread").textContent = notifications.filter(item => !item.read).length;
        document.getElementById("adminNotificationRead").textContent = notifications.filter(item => item.read).length;
        document.getElementById("adminNotificationOrders").textContent = notifications.filter(item => item.type === "Order").length;
    }

    function getFiltered() {
        const query = search.value.trim().toLowerCase();
        const type = typeFilter.value;
        const status = statusFilter.value;

        return notifications.filter(item => {
            const matchesSearch = `${item.title} ${item.message} ${item.id} ${item.type}`.toLowerCase().includes(query);
            const matchesType = type === "all" || item.type === type;
            const matchesStatus = status === "all" || (status === "Read" ? item.read : !item.read);
            return matchesSearch && matchesType && matchesStatus;
        }).sort((a, b) => new Date(b.date) - new Date(a.date));
    }

    function renderPagination(totalPages) {
        pagination.innerHTML = "";
        if (totalPages <= 1) return;

        const addButton = (label, page, disabled, active) => {
            const button = document.createElement("button");
            button.type = "button";
            button.className = "ss-admin-page-btn" + (active ? " ss-active" : "");
            button.textContent = label;
            button.disabled = disabled;
            button.addEventListener("click", () => {
                currentPage = page;
                render();
            });
            pagination.appendChild(button);
        };

        addButton("‹", currentPage - 1, currentPage === 1, false);

        for (let i = 1; i <= totalPages; i++) {
            addButton(String(i), i, false, i === currentPage);
        }

        addButton("›", currentPage + 1, currentPage === totalPages, false);
    }

    function render() {
        renderStats();

        const filtered = getFiltered();
        const totalPages = Math.ceil(filtered.length / pageSize);
        currentPage = Math.max(1, Math.min(currentPage, totalPages || 1));

        const start = (currentPage - 1) * pageSize;
        const visible = filtered.slice(start, start + pageSize);

        document.getElementById("adminNotificationCount").textContent = `${filtered.length} notifications`;
        document.getElementById("adminNotificationShowing").textContent = filtered.length
            ? `Showing ${start + 1}-${start + visible.length} of ${filtered.length} notifications`
            : "Showing 0 notifications";

        list.innerHTML = visible.map(item => `
            <article class="ss-admin-notification-item ${item.read ? "read" : "unread"}">
                <div class="ss-admin-notification-icon ${escapeHtml(item.type.toLowerCase())}">${getIcon(item.type)}</div>
                <div class="ss-admin-notification-content">
                    <div class="ss-admin-notification-title-row">
                        <h3>${escapeHtml(item.title)}</h3>
                        <span class="ss-admin-notification-type ${escapeHtml(item.type.toLowerCase())}">${escapeHtml(item.type)}</span>
                    </div>
                    <p>${escapeHtml(item.message)}</p>
                    <small>${formatDate(item.date)}</small>
                </div>
                <div class="ss-admin-notification-actions">
                    <button type="button" data-action="toggle" data-id="${escapeHtml(item.id)}" title="${item.read ? "Mark unread" : "Mark read"}">${item.read ? "○" : "✓"}</button>
                    <button type="button" class="delete" data-action="delete" data-id="${escapeHtml(item.id)}" title="Delete">×</button>
                </div>
            </article>
        `).join("");

        empty.hidden = filtered.length > 0;
        renderPagination(totalPages);
    }

    list.addEventListener("click", function (event) {
        const button = event.target.closest("[data-action]");
        if (!button) return;

        const notification = notifications.find(item => item.id === button.dataset.id);
        if (!notification) return;

        if (button.dataset.action === "toggle") {
            notification.read = !notification.read;
        } else if (button.dataset.action === "delete") {
            notifications = notifications.filter(item => item.id !== notification.id);
        }

        save();
        render();
    });

    document.getElementById("adminMarkAllRead").addEventListener("click", function () {
        notifications.forEach(item => item.read = true);
        save();
        render();
    });

    document.getElementById("adminClearNotifications").addEventListener("click", function () {
        if (!notifications.length) return;
        if (!confirm("Are you sure you want to clear all notifications?")) return;
        notifications = [];
        save();
        render();
    });

    search.addEventListener("input", () => {
        currentPage = 1;
        render();
    });

    typeFilter.addEventListener("change", () => {
        currentPage = 1;
        render();
    });

    statusFilter.addEventListener("change", () => {
        currentPage = 1;
        render();
    });

    render();
});
(() => {
    const form = document.getElementById("adminSettingsForm");
    if (!form) return;

    const storageKey = "ssAdminSettings";

    const defaults = {
        storeName: "ShopSphere",
        storeEmail: "support@shopsphere.com",
        storePhone: "",
        storeAddress: "",
        currency: "INR",
        language: "English",
        timezone: "Asia/Kolkata",
        newOrderAlerts: true,
        lowStockAlerts: true,
        customerAlerts: false,
        lowStockThreshold: 5,
        shippingFee: 50,
        freeShipping: 999,
        returnDays: 7,
        maintenanceMode: false
    };

    const fields = {
        storeName: "settingsStoreName",
        storeEmail: "settingsStoreEmail",
        storePhone: "settingsStorePhone",
        storeAddress: "settingsStoreAddress",
        currency: "settingsCurrency",
        language: "settingsLanguage",
        timezone: "settingsTimezone",
        newOrderAlerts: "settingsNewOrderAlerts",
        lowStockAlerts: "settingsLowStockAlerts",
        customerAlerts: "settingsCustomerAlerts",
        lowStockThreshold: "settingsLowStockThreshold",
        shippingFee: "settingsShippingFee",
        freeShipping: "settingsFreeShipping",
        returnDays: "settingsReturnDays",
        maintenanceMode: "settingsMaintenanceMode"
    };

    const getSettings = () => {
        try {
            return { ...defaults, ...JSON.parse(localStorage.getItem(storageKey) || "{}") };
        } catch {
            return { ...defaults };
        }
    };

    const showMessage = message => {
        if (typeof window.showToast === "function") {
            window.showToast(message);
        } else {
            alert(message);
        }
    };

    const updateMaintenanceStatus = () => {
        const status = document.getElementById("settingsMaintenanceStatus");
        const enabled = document.getElementById("settingsMaintenanceMode").checked;
        status.textContent = enabled ? "Maintenance Enabled" : "Store Active";
        status.classList.toggle("is-maintenance", enabled);
    };

    const loadSettings = () => {
        const settings = getSettings();

        Object.entries(fields).forEach(([key, id]) => {
            const element = document.getElementById(id);
            if (element.type === "checkbox") {
                element.checked = Boolean(settings[key]);
            } else {
                element.value = settings[key] ?? "";
            }
        });

        updateMaintenanceStatus();
    };

    const saveSettings = () => {
        if (!form.reportValidity()) return;

        const settings = {};

        Object.entries(fields).forEach(([key, id]) => {
            const element = document.getElementById(id);
            settings[key] = element.type === "checkbox"
                ? element.checked
                : element.type === "number"
                    ? Number(element.value)
                    : element.value.trim();
        });

        localStorage.setItem(storageKey, JSON.stringify(settings));
        updateMaintenanceStatus();
        showMessage("Settings saved successfully.");
    };

    form.addEventListener("submit", event => {
        event.preventDefault();
        saveSettings();
    });

    document.getElementById("adminSettingsSave").addEventListener("click", saveSettings);

    document.getElementById("adminSettingsReset").addEventListener("click", () => {
        if (!confirm("Reset all settings to their default values?")) return;
        localStorage.removeItem(storageKey);
        loadSettings();
        showMessage("Settings restored to defaults.");
    });

    document.getElementById("settingsMaintenanceMode").addEventListener("change", updateMaintenanceStatus);

    loadSettings();
})();