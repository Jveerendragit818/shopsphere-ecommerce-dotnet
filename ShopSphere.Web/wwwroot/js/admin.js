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