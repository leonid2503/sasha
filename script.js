// Placeholder for JavaScript functionality

document.addEventListener('DOMContentLoaded', () => {
    console.log('PaperSwitch website loaded');
    updateNavigation(); // Update nav on every page load

    // Add interactivity for Build page
    if (document.title.includes('Build Your Notebook')) {
        setupBuildPage();
    }

    // Add interactivity for Constructor page
    if (document.title.includes('Constructor')) {
        setupConstructorPage();
    }

    // Add interactivity for Shopping Cart page
    if (document.title.includes('Shopping Cart')) {
        setupCartPage();
    }

    // Add interactivity for Feedback page
    if (document.title.includes('Feedback')) {
        setupFeedbackPage();
    }

    // Add interactivity for Home page
    if (document.title.includes('Home')) {
        displayHomepageFeedback();
    }

    // Add interactivity for Login page
    if (document.title.includes('Login')) {
        setupLoginPage();
    }

    // Add interactivity for Sign Up page
    if (document.title.includes('Sign Up')) {
        setupSignupPage();
    }

    // Add interactivity for My Profile page
    if (document.title.includes('My Profile')) {
        setupProfilePage();
    }

    // Add interactivity for Reorder Inserts page
    if (document.title.includes('Reorder Inserts')) {
        setupReorderPage();
    }

    // Add interactivity for other pages if needed
    // e.g., form handling for feedback/reorder
});

function setupBuildPage() {
    console.log('Setting up Build page...');
    let currentMix = [];
    let notebookConfig = {
        size: null,       // 48 or 96
        basePrice: 0,
        sections: [],     // Array of strings (standard) or objects (custom)
        totalPrice: 0
    };

    // --- DOM Elements --- //
    const addSectionBtn = document.getElementById('add-section-btn');
    const removeSectionBtn = document.getElementById('remove-section-btn');
    const mixContainer = document.getElementById('mix-container');
    const addToCartBtn = document.getElementById('add-mix-to-cart-btn');
    const sectionCards = document.querySelectorAll('.section-options .card');
    const sizeOptions = document.querySelectorAll('input[name="notebook-size"]');
    const sectionOptionsContainer = document.getElementById('section-options-container');
    const constructorLinkContainer = document.getElementById('constructor-link-container');

    // --- Event Listeners --- //
    sizeOptions.forEach(radio => {
        radio.addEventListener('change', () => {
            notebookConfig.size = parseInt(radio.value);
            notebookConfig.basePrice = parseFloat(radio.dataset.price);
            notebookConfig.totalPrice = notebookConfig.basePrice; // Start with base price
            console.log('Selected Size:', notebookConfig.size, 'Base Price:', notebookConfig.basePrice);
            // Enable next steps
            sectionOptionsContainer.style.opacity = '1';
            sectionOptionsContainer.style.pointerEvents = 'auto';
            constructorLinkContainer.style.opacity = '1';
            constructorLinkContainer.style.pointerEvents = 'auto';
            updateMixDisplay(); // Update display to show size/price
            // Store size temporarily for constructor page
            localStorage.setItem('currentNotebookSize', notebookConfig.size);
            localStorage.setItem('currentNotebookBasePrice', notebookConfig.basePrice);
        });
    });

    // Check if returning from constructor with saved design
    const pendingDesignJSON = localStorage.getItem('pendingCustomDesign');
    if (pendingDesignJSON) {
        console.log('Found pending design...');
        const pendingDesign = JSON.parse(pendingDesignJSON);
        // Need to retrieve size/basePrice that *were* selected before going to constructor
        const savedSize = localStorage.getItem('currentNotebookSize');
        const savedBasePrice = localStorage.getItem('currentNotebookBasePrice');

        if (savedSize && savedBasePrice && parseInt(savedSize) === pendingDesign.size) {
            // Restore config and add the custom design
            notebookConfig.size = parseInt(savedSize);
            notebookConfig.basePrice = parseFloat(savedBasePrice);
            notebookConfig.sections.push({ type: 'custom', design: pendingDesign });
            notebookConfig.totalPrice = pendingDesign.price; // Price already calculated by constructor

            // Re-enable steps and update display
            sectionOptionsContainer.style.opacity = '1';
            sectionOptionsContainer.style.pointerEvents = 'auto';
            constructorLinkContainer.style.opacity = '1';
            constructorLinkContainer.style.pointerEvents = 'auto';
            // Re-select the radio button visually
            document.querySelector(`input[name="notebook-size"][value="${notebookConfig.size}"]`).checked = true;

            console.log('Added custom design to mix:', pendingDesign);
        } else {
            console.error('Mismatch between saved size and pending design size, or size not found.');
            alert('Error loading custom design. Please select size again.');
        }
        localStorage.removeItem('pendingCustomDesign'); // Clear after processing
        // Keep size/base price in storage until mix is cleared or added to cart
    }

    // --- Section Selection Logic --- //
    let selectedSection = null;
    sectionCards.forEach(card => {
        card.addEventListener('click', () => {
            sectionCards.forEach(c => c.classList.remove('selected'));
            card.classList.add('selected');
            selectedSection = card.dataset.sectionType;
            console.log('Selected section:', selectedSection);
        });
    });

    addSectionBtn.addEventListener('click', () => {
        if (!notebookConfig.size) {
            alert('Please select a notebook size first!');
            return;
        }
        if (selectedSection) {
            notebookConfig.sections.push(selectedSection); // Add standard section
            // Note: Standard sections don't change the price in this model
            updateMixDisplay();
            selectedSection = null; // Reset selection
            sectionCards.forEach(c => c.classList.remove('selected')); // Reset visual selection
        } else {
            alert('Please select a section type to add.');
        }
    });

    removeSectionBtn.addEventListener('click', () => {
        if (notebookConfig.sections.length > 0) {
            const removedSection = notebookConfig.sections.pop();
            // Recalculate price if a custom section was removed
            if (typeof removedSection === 'object' && removedSection.type === 'custom') {
                console.log('Removed custom section. Resetting price to base.');
                notebookConfig.totalPrice = notebookConfig.basePrice;
                // TODO: Add logic to sum prices if multiple custom sections are allowed later
            } else {
                // Standard section removed, price doesn't change
            }
            updateMixDisplay();
        }
    });

    function updateMixDisplay() {
        mixContainer.innerHTML = ''; // Clear current display

        if (!notebookConfig.size) {
            mixContainer.innerHTML = '<p><i>Select size to begin.</i></p>';
            addToCartBtn.disabled = true;
            return;
        }

        // Display chosen size
        const sizeDiv = document.createElement('div');
        sizeDiv.innerHTML = `<b>Size:</b> ${notebookConfig.size} Pages (€${notebookConfig.basePrice.toFixed(2)})`;
        mixContainer.appendChild(sizeDiv);

        if (notebookConfig.sections.length === 0) {
             mixContainer.innerHTML += '<p><i>No sections added yet.</i></p>';
        }

        notebookConfig.sections.forEach((section, index) => {
            const sectionDiv = document.createElement('div');
            if (typeof section === 'string') {
                // Standard Section
                sectionDiv.textContent = `${index + 1}. ${section}`;
            } else if (typeof section === 'object' && section.type === 'custom') {
                // Custom Section from Constructor
                const design = section.design;
                let pageDetails = `Style: ${design.style}, Color: ${design.color}`;
                if (design.image) pageDetails += ', Custom Image';
                if (design.inserts && design.inserts.length > 0) pageDetails += `, ${design.inserts.length} Insert(s)`;

                let coverDetails = `Cover: ${design.coverMaterial}`;
                if (design.coverImage) coverDetails += ', Custom Image';

                sectionDiv.innerHTML = `${index + 1}. <b>Custom Design</b> (<small>Pages: ${pageDetails} | ${coverDetails}</small>) - <i>Price: €${design.price.toFixed(2)}</i>`;
                // Update total price JUST IN CASE (should be set when custom is added)
                notebookConfig.totalPrice = design.price;
            }
            mixContainer.appendChild(sectionDiv);
        });

        // Display Total Price
        const totalDiv = document.createElement('div');
        totalDiv.innerHTML = `<hr><b>Total Mix Price: €${notebookConfig.totalPrice.toFixed(2)}</b>`;
        totalDiv.style.fontWeight = 'bold';
        totalDiv.style.marginTop = '10px';
        mixContainer.appendChild(totalDiv);

        // Enable/disable Add to Cart button
        addToCartBtn.disabled = notebookConfig.sections.length === 0;
        console.log('Current Mix Config:', notebookConfig);
    }

    // --- Add to Cart Logic --- //
    addToCartBtn.addEventListener('click', () => {
        if (notebookConfig.sections.length === 0) {
            alert('Cannot add an empty mix to the cart.');
            return;
        }

        const user = getCurrentUser();
        let shouldSaveDesign = false;
        if (user && notebookConfig.sections.some(s => typeof s === 'object' && s.type === 'custom')) {
             // Ask logged-in user if they want to save this custom design
            shouldSaveDesign = confirm("Do you want to save this custom design to your profile before adding to cart?");
        }

        if (shouldSaveDesign) {
            saveCurrentUserDesign(notebookConfig);
        }

        // --- Add to Cart (existing logic) --- //
        let cart = JSON.parse(localStorage.getItem('shoppingCart') || '[]');
        const cartItem = JSON.parse(JSON.stringify(notebookConfig));
        cartItem.id = `notebook_${Date.now()}`;
        cart.push(cartItem);
        localStorage.setItem('shoppingCart', JSON.stringify(cart));
        console.log('Added to cart:', cartItem);
        alert('Notebook mix added to cart!');

        // --- Reset Build Config (existing logic) --- //
        resetBuildConfig();
    });

    // --- Reset Function --- //
    function resetBuildConfig() {
         notebookConfig = {
            size: null, basePrice: 0, sections: [], totalPrice: 0
        };
        sizeOptions.forEach(radio => radio.checked = false);
        sectionOptionsContainer.style.opacity = '0.5';
        sectionOptionsContainer.style.pointerEvents = 'none';
        constructorLinkContainer.style.opacity = '0.5';
        constructorLinkContainer.style.pointerEvents = 'none';
        localStorage.removeItem('currentNotebookSize');
        localStorage.removeItem('currentNotebookBasePrice');
        localStorage.removeItem('pendingCustomDesign'); // Clear any pending design
        updateMixDisplay();
    }

    // Helper to save design for current user (simulation)
    function saveCurrentUserDesign(designData) {
        const user = getCurrentUser();
        if (!user) return; // Should not happen if prompt was shown

        const allDesigns = JSON.parse(localStorage.getItem('userDesigns') || '{}');
        if (!allDesigns[user.email]) {
            allDesigns[user.email] = [];
        }

        const designToSave = JSON.parse(JSON.stringify(designData)); // Clone
        designToSave.savedAt = new Date().toISOString();
        // Optional: Add a name/label?

        allDesigns[user.email].push(designToSave);
        localStorage.setItem('userDesigns', JSON.stringify(allDesigns));
        console.log('Saved design for user:', user.email, designToSave);
        alert('Design saved to your profile!');
    }

    // Initial setup call
    updateMixDisplay();
}

function setupConstructorPage() {
    console.log('Setting up Constructor page...');
    // --- State --- //
    let currentDesign = {
        coverMaterial: 'blue-plastic',
        coverImage: null,
        pageColor: '#ffffff',
        name: '',
        pages: [] // Will be built from pageList
    };
    let pageList = [];
    let totalPages = 48; // Default total pages
    let currentView = 'cover';
    let spreadIndex = 0;

    // --- DOM Elements --- //
    const notebook3d = document.getElementById('notebook-3d');
    const pageListElement = document.getElementById('page-list');
    const addPageBtn = document.getElementById('add-page-btn');
    const addPageType = document.getElementById('add-page-type');
    const pageCountInput = document.getElementById('page-count');
    const totalPagesInput = document.getElementById('total-pages');
    const viewCoverBtn = document.getElementById('view-cover-btn');
    const viewPagesBtn = document.getElementById('view-pages-btn');
    const coverControlsGroup = document.getElementById('cover-controls-group');
    const pageControlsGroup = document.getElementById('page-controls-group');
    const coverMaterialInputs = document.querySelectorAll('input[name="cover-material"]');
    const coverImageUpload = document.getElementById('cover-image-upload');
    const pageColorInput = document.getElementById('page-color');
    const designNameInput = document.getElementById('design-name');
    const totalPriceSpan = document.getElementById('total-price');
    const submitBtn = document.getElementById('submit-design-btn');

    // --- Cover images --- //
    const coverImages = {
        'blue-plastic': '/images/photo_5255816145599066963_y.jpg',
        'black-plastic': '/images/photo_5255816145599066964_y.jpg'
    };

    // --- Event Listeners --- //
    totalPagesInput.addEventListener('change', () => {
        totalPages = parseInt(totalPagesInput.value);
        enforceTotalPages();
        updatePriceDisplay();
    });

    addPageBtn.addEventListener('click', () => {
        const type = addPageType.value;
        const count = parseInt(pageCountInput.value);
        if (count < 1) {
            alert('Please enter a valid number of pages (minimum 1)');
            return;
        }
        const currentTotal = pageList.reduce((sum, page) => sum + page.count, 0);
        if (currentTotal + count > totalPages) {
            alert(`Cannot add ${count} pages. Total pages would exceed ${totalPages}.`);
            return;
        }
        pageList.push({ type, count });
        updateCurrentDesignPages();
        renderPageList();
        renderNotebook();
        updatePriceDisplay();
    });

    function updateCurrentDesignPages() {
        // Flatten pageList into an array of page objects for preview
        currentDesign.pages = [];
        pageList.forEach(page => {
            for (let i = 0; i < page.count; i++) {
                currentDesign.pages.push({ type: page.type });
            }
        });
    }

    function renderPageList() {
        pageListElement.innerHTML = '';
        pageList.forEach((page, index) => {
            const li = document.createElement('li');
            li.draggable = true;
            li.dataset.index = index;
            const pageInfo = document.createElement('span');
            pageInfo.textContent = `${capitalize(page.type)} (${page.count} pages)`;
            const deleteBtn = document.createElement('button');
            deleteBtn.textContent = '×';
            deleteBtn.className = 'delete-page-btn';
            deleteBtn.onclick = (e) => {
                e.stopPropagation();
                pageList.splice(index, 1);
                updateCurrentDesignPages();
                renderPageList();
                renderNotebook();
                updatePriceDisplay();
            };
            li.appendChild(pageInfo);
            li.appendChild(deleteBtn);
            pageListElement.appendChild(li);
        });
        setupDragAndDrop();
    }

    function setupDragAndDrop() {
        const items = pageListElement.getElementsByTagName('li');
        Array.from(items).forEach(item => {
            item.addEventListener('dragstart', handleDragStart);
            item.addEventListener('dragover', handleDragOver);
            item.addEventListener('drop', handleDrop);
            item.addEventListener('dragend', handleDragEnd);
        });
    }
    function handleDragStart(e) {
        e.dataTransfer.setData('text/plain', e.target.dataset.index);
        e.target.classList.add('dragging');
    }
    function handleDragOver(e) { e.preventDefault(); }
    function handleDrop(e) {
        e.preventDefault();
        const fromIndex = parseInt(e.dataTransfer.getData('text/plain'));
        const toIndex = parseInt(e.target.closest('li').dataset.index);
        if (fromIndex !== toIndex) {
            const [movedItem] = pageList.splice(fromIndex, 1);
            pageList.splice(toIndex, 0, movedItem);
            updateCurrentDesignPages();
            renderPageList();
            renderNotebook();
        }
    }
    function handleDragEnd(e) { e.target.classList.remove('dragging'); }

    function enforceTotalPages() {
        const currentTotal = pageList.reduce((sum, page) => sum + page.count, 0);
        if (currentTotal > totalPages) {
            // Remove excess pages from the end
            let remaining = totalPages;
            pageList = pageList.filter(page => {
                if (remaining >= page.count) {
                    remaining -= page.count;
                    return true;
                }
                return false;
            });
            updateCurrentDesignPages();
            renderPageList();
            renderNotebook();
            updatePriceDisplay();
        }
    }

    // --- Cover/Color Controls --- //
    coverMaterialInputs.forEach(input => {
        input.addEventListener('change', (e) => {
            if (e.target.checked) {
                currentDesign.coverMaterial = e.target.value;
                renderNotebook();
            }
        });
    });
    coverImageUpload.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function(event) {
                currentDesign.coverImage = event.target.result;
                renderNotebook();
            }
            reader.readAsDataURL(file);
        } else {
            currentDesign.coverImage = null;
            renderNotebook();
        }
    });
    pageColorInput.addEventListener('input', (e) => {
        currentDesign.pageColor = e.target.value;
        renderNotebook();
    });
    designNameInput.addEventListener('input', (e) => {
        currentDesign.name = e.target.value;
    });

    // --- View Toggle --- //
    viewCoverBtn.addEventListener('click', () => {
        currentView = 'cover';
        viewCoverBtn.classList.add('active');
        viewPagesBtn.classList.remove('active');
        coverControlsGroup.style.display = 'block';
        pageControlsGroup.style.display = 'none';
        renderNotebook();
    });
    viewPagesBtn.addEventListener('click', () => {
        currentView = 'pages';
        viewPagesBtn.classList.add('active');
        viewCoverBtn.classList.remove('active');
        coverControlsGroup.style.display = 'none';
        pageControlsGroup.style.display = 'block';
        renderNotebook();
    });

    // --- 3D Notebook Two-Page Spread --- //
    function renderNotebook() {
        notebook3d.className = 'notebook-3d spread-view';
        notebook3d.innerHTML = '';
        if (currentView === 'cover') {
            const coverDiv = document.createElement('div');
            coverDiv.className = 'notebook-cover';
            let coverBg = coverImages[currentDesign.coverMaterial] || coverImages['blue-plastic'];
            if (currentDesign.coverImage) {
                coverDiv.style.backgroundImage = `url(${currentDesign.coverImage})`;
            } else {
                coverDiv.style.backgroundImage = `url(${coverBg})`;
            }
            coverDiv.style.width = '440px';
            coverDiv.style.height = '95%';
            coverDiv.style.margin = 'auto';
            coverDiv.style.borderRadius = '12px';
            coverDiv.style.boxShadow = '0 4px 16px rgba(0,0,0,0.12)';
            notebook3d.appendChild(coverDiv);
            return;
        }
        // Page spread view
        const spread = document.createElement('div');
        spread.className = 'spread-pages';
        // Left and right page indices
        const leftIdx = spreadIndex;
        const rightIdx = spreadIndex + 1;
        // Left page
        spread.appendChild(renderSpreadPage(leftIdx, 'Left'));
        // Spine
        const spine = document.createElement('div');
        spine.className = 'notebook-spine';
        spread.appendChild(spine);
        // Right page
        spread.appendChild(renderSpreadPage(rightIdx, 'Right'));
        notebook3d.appendChild(spread);
        // Controls
        const controls = document.createElement('div');
        controls.className = 'spread-controls';
        const prevBtn = document.createElement('button');
        prevBtn.textContent = '⟨';
        prevBtn.disabled = spreadIndex <= 0;
        prevBtn.addEventListener('click', () => {
            if (spreadIndex > 0) {
                spreadIndex -= 2;
                if (spreadIndex < 0) spreadIndex = 0;
                renderNotebook();
            }
        });
        const nextBtn = document.createElement('button');
        nextBtn.textContent = '⟩';
        nextBtn.disabled = spreadIndex + 2 >= currentDesign.pages.length;
        nextBtn.addEventListener('click', () => {
            if (spreadIndex + 2 < currentDesign.pages.length) {
                spreadIndex += 2;
                renderNotebook();
            }
        });
        controls.appendChild(prevBtn);
        controls.appendChild(nextBtn);
        notebook3d.appendChild(controls);
    }
    function renderSpreadPage(idx, label) {
        const page = document.createElement('div');
        page.className = 'spread-page';
        if (idx < currentDesign.pages.length) {
            const type = currentDesign.pages[idx].type;
            page.innerHTML = `<span class="page-label">${capitalize(type)} Page (${idx + 1})</span>`;
            page.style.background = currentDesign.pageColor;
            // Simple style overlays
            if (type === 'lined') {
                page.style.backgroundImage = 'repeating-linear-gradient(to bottom, transparent, transparent 29px, #ccc 29px, #ccc 30px)';
                page.style.backgroundSize = '100% 30px';
            } else if (type === 'grid') {
                page.style.backgroundImage = 'linear-gradient(#ccc 1px, transparent 1px), linear-gradient(to right, #ccc 1px, transparent 1px)';
                page.style.backgroundSize = '20px 20px';
            } else if (type === 'diary') {
                page.style.backgroundImage = 'repeating-linear-gradient(to bottom, transparent, transparent 29px, #ccc 29px, #ccc 30px)';
                page.style.backgroundSize = '100% 30px';
                const diaryHeader = document.createElement('div');
                diaryHeader.innerHTML = 'Date: ____________________';
                diaryHeader.style.position = 'absolute';
                diaryHeader.style.top = '28px';
                diaryHeader.style.left = '10px';
                diaryHeader.style.right = '10px';
                diaryHeader.style.paddingBottom = '5px';
                diaryHeader.style.borderBottom = '1px solid #ccc';
                diaryHeader.style.fontSize = '0.9em';
                diaryHeader.style.color = '#666';
                page.appendChild(diaryHeader);
            }
        } else {
            page.innerHTML = `<span class="page-label">Blank Page</span>`;
            page.style.background = '#fff';
        }
        return page;
    }

    // --- Price Calculation (Euros) --- //
    function calculatePrice() {
        let price = 0;
        if (currentDesign.coverImage) price += 2;
        const n = currentDesign.pages.length;
        if (n === 48) price += 10;
        else if (n === 55) price += 12;
        else if (n === 96) price += 16;
        else price += n * 0.20;
        return price;
    }
    function updatePriceDisplay() {
        const price = calculatePrice();
        totalPriceSpan.textContent = `€${price.toFixed(2)}`;
    }

    submitBtn.addEventListener('click', () => {
        // Save design to localStorage and redirect (simulate)
        localStorage.setItem('pendingCustomDesign', JSON.stringify({
            ...currentDesign,
            size: currentDesign.pages.length,
            price: calculatePrice()
        }));
        window.location.href = 'build.html';
    });

    // --- Initial State --- //
    enforceTotalPages();
    updateCurrentDesignPages();
    renderPageList();
    renderNotebook();
    updatePriceDisplay();
    // Update price whenever relevant
    [coverImageUpload, totalPagesInput, pageColorInput, addPageBtn].forEach(el => {
        el.addEventListener('input', updatePriceDisplay);
        el.addEventListener('change', updatePriceDisplay);
    });
    function capitalize(str) {
        return str.charAt(0).toUpperCase() + str.slice(1);
    }
}

function setupCartPage() {
    console.log('Setting up Cart page...');
    const cartItemsContainer = document.getElementById('cart-items');
    const cartTotalSpan = document.getElementById('cart-total');
    const checkoutBtn = document.getElementById('checkout-btn');
    let cart = JSON.parse(localStorage.getItem('shoppingCart') || '[]');

    function renderCart() {
        cartItemsContainer.innerHTML = ''; // Clear previous items
        let total = 0;

        if (cart.length === 0) {
            cartItemsContainer.innerHTML = '<p>Your cart is currently empty.</p>';
            checkoutBtn.style.display = 'none';
            cartTotalSpan.textContent = '0.00';
            return;
        }

        cart.forEach((item, index) => {
            total += item.totalPrice;
            const itemDiv = document.createElement('div');
            itemDiv.classList.add('cart-item');
            let description = 'Unknown Item';
            let detailsHTML = '';

            // Handle Notebooks
            if (item.size && item.sections) {
                 description = `PaperSwitch Notebook (${item.size} Pages)`;
                 let pageDetailsList = '';
                 let hasCustom = false;
                 let coverDesc = 'Plastic Cover'; // Default

                 item.sections.forEach(section => {
                    if (typeof section === 'string') {
                        pageDetailsList += `<li>${section} Section</li>`;
                    } else if (section.type === 'custom') {
                        hasCustom = true;
                        pageDetailsList += `<li><b>Custom Pages:</b> Style ${section.design.style}, Color ${section.design.color}`;
                        if(section.design.image) pageDetailsList += ", Image";
                        if(section.design.inserts && section.design.inserts.length > 0) pageDetailsList += ", Inserts";
                        pageDetailsList += `</li>`;
                        coverDesc = `Cover: ${section.design.coverMaterial}`;
                        if(section.design.coverImage) coverDesc += ", Image";
                    }
                });
                 if (!hasCustom && item.sections.length > 0) {
                    pageDetailsList = `<li>Standard Sections (${item.sections.length})</li>`;
                 } else if (item.sections.length === 0) {
                    pageDetailsList = '<li>Base Notebook Only</li>';
                 }
                 detailsHTML = `<p><small>${coverDesc}</small></p><ul>${pageDetailsList}</ul>`;
            }
            // Handle Standard Inserts
            else if (item.type === 'standard-insert') {
                 description = item.name || 'Standard Insert Pack';
                 detailsHTML = `<p><small>Replenishment Pack</small></p>`;
            }
            // Handle Custom Inserts
            else if (item.type === 'custom-insert') {
                description = item.name || 'Custom Insert Pack';
                 detailsHTML = `<p><small>Replenishment Pack - Custom Design</small></p>`;
                // Optionally add design details here too
            }

            itemDiv.innerHTML = `
                <div class="cart-item-details">
                    <h4>${description}</h4>
                    ${detailsHTML}
                </div>
                <div class="cart-item-price">
                    <span>€${item.totalPrice.toFixed(2)}</span>
                </div>
                <div class="cart-item-remove">
                    <button class="remove-item-btn" data-index="${index}">Remove</button>
                </div>
            `;
            cartItemsContainer.appendChild(itemDiv);
        });

        cartTotalSpan.textContent = total.toFixed(2);
        checkoutBtn.style.display = 'inline-block';

        // Add event listeners to remove buttons
        document.querySelectorAll('.remove-item-btn').forEach(button => {
            button.addEventListener('click', (e) => {
                const itemIndex = parseInt(e.target.dataset.index);
                removeItemFromCart(itemIndex);
            });
        });
    }

    function removeItemFromCart(index) {
        if (index >= 0 && index < cart.length) {
            cart.splice(index, 1); // Remove item from array
            localStorage.setItem('shoppingCart', JSON.stringify(cart)); // Update localStorage
            renderCart(); // Re-render the cart display
            console.log('Removed item at index', index, 'New cart:', cart);
        }
    }

    // Initial render
    renderCart();
}

function setupFeedbackPage() {
    console.log('Setting up Feedback page...');
    const feedbackForm = document.getElementById('feedback-form');
    const feedbackChartContainer = document.getElementById('feedback-chart-container');

    feedbackForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const feedbackText = e.target.feedback.value;
        const ratingInput = e.target.rating;
        const feedbackRating = ratingInput.value;

        if (!feedbackRating) {
            alert('Please select a star rating.');
            return;
        }

        const user = getCurrentUser(); // Get logged-in user

        console.log('Feedback submitted:', feedbackText, 'Rating:', feedbackRating, 'User:', user ? user.email : 'Guest');

        let allFeedback = JSON.parse(localStorage.getItem('siteFeedback') || '[]');
        allFeedback.push({
            text: feedbackText,
            rating: parseInt(feedbackRating),
            date: new Date().toISOString(),
            userEmail: user ? user.email : null, // Associate with user if logged in
            username: user ? user.username : 'Anonymous'
        });
        localStorage.setItem('siteFeedback', JSON.stringify(allFeedback));

        alert('Thank you for your feedback!');
        feedbackForm.reset();
        displayFeedbackChart(feedbackChartContainer, allFeedback);
    });

    // Initial chart display
    let currentFeedback = JSON.parse(localStorage.getItem('siteFeedback') || '[]');
    displayFeedbackChart(feedbackChartContainer, currentFeedback);
}

// --- Feedback Chart (Basic Placeholder) --- //
function displayFeedbackChart(container, feedbackData) {
    if (!container) return;

    const ratingCounts = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    let totalRatings = 0;
    feedbackData.forEach(item => {
        if (ratingCounts.hasOwnProperty(item.rating)) {
            ratingCounts[item.rating]++;
            totalRatings++;
        }
    });

    if (totalRatings === 0) {
        container.innerHTML = '<p>(No rating data yet)</p>';
        return;
    }

    // Basic HTML Bar Chart Simulation
    container.innerHTML = ''; // Clear placeholder
    container.style.display = 'flex';
    container.style.alignItems = 'flex-end'; // Align bars at the bottom
    container.style.justifyContent = 'space-around';
    container.style.gap = '5px';
    container.style.padding = '10px';

    const maxCount = Math.max(...Object.values(ratingCounts));

    for (let rating = 1; rating <= 5; rating++) {
        const count = ratingCounts[rating];
        const barHeight = maxCount > 0 ? (count / maxCount) * 90 : 0; // Percentage height (leaving space for label)
        const barDiv = document.createElement('div');
        barDiv.style.width = '15%';
        barDiv.style.height = `${barHeight}%`;
        barDiv.style.backgroundColor = 'var(--secondary-color)';
        barDiv.style.position = 'relative';
        barDiv.style.display = 'flex';
        barDiv.style.alignItems = 'flex-end';
        barDiv.style.justifyContent = 'center';

        // Label inside/below bar
        const label = document.createElement('span');
        label.textContent = `${count} (${rating}★)`;
        label.style.fontSize = '0.8em';
        label.style.color = 'var(--dark-purple)';
        label.style.position = 'absolute';
        label.style.bottom = '-20px'; // Position below bar
        label.style.textAlign = 'center';
        label.style.width = '100%';

        barDiv.title = `${count} ratings of ${rating} stars`; // Tooltip
        barDiv.appendChild(label);
        container.appendChild(barDiv);
    }
}

// --- Homepage Feedback Display --- //
function displayHomepageFeedback() {
    const carousel = document.querySelector('.feedback-carousel');
    if (!carousel) return;

    let allFeedback = JSON.parse(localStorage.getItem('siteFeedback') || '[]');

    if (allFeedback.length === 0) {
        carousel.innerHTML = '<p>No feedback yet. Be the first!</p>';
        return;
    }

    carousel.innerHTML = ''; // Clear loading message
    // Optional: Sort feedback, maybe newest first
    allFeedback.sort((a, b) => new Date(b.date) - new Date(a.date));

    // Limit number of cards shown?
    const feedbackToShow = allFeedback.slice(0, 10); // Show latest 10

    feedbackToShow.forEach(item => {
        const card = document.createElement('div');
        card.classList.add('feedback-card');

        const stars = '★'.repeat(item.rating) + '☆'.repeat(5 - item.rating);
        const userName = item.username || 'Anonymous User'; // Use stored username or default

        card.innerHTML = `
            <div class="stars">${stars}</div>
            <p>"${item.text}"</p>
            <span>- ${userName}</span>
        `;
        carousel.appendChild(card);
    });

    // TODO: Implement spinning/infinite scroll animation if desired
    // Example: Duplicate cards for seamless loop or use animation library
}

// Price calculation function
const CUSTOM_IMAGE_PRICE = 2.00; // For page image
const CUSTOM_INSERT_PRICE = 2.00;
const COVER_IMAGE_PRICE = 2.00;
const COVER_MATERIAL_PRICES = {
    plastic: 0,
    leather: 5.00,
    wood: 7.00
};

function calculatePrice(design, basePrice) {
    let price = basePrice;
    let freePageFeatureUsed = false; // Track if a free page feature was used

    // --- Page Costs --- //
    // Check page color
    if (design.color && design.color !== '#ffffff' && !freePageFeatureUsed) {
        freePageFeatureUsed = true;
        console.log("Price Calc: Free page color feature used.");
    }
    // Check page style
    if (design.style && design.style !== 'lined' && !freePageFeatureUsed) {
        freePageFeatureUsed = true;
        console.log("Price Calc: Free page style feature used.");
    }
    // Page image
    if (design.image) {
        price += CUSTOM_IMAGE_PRICE;
        console.log(`Price Calc: Added €${CUSTOM_IMAGE_PRICE} for page image.`);
    }
    // Page inserts
    if (design.inserts && design.inserts.length > 0) {
        price += CUSTOM_INSERT_PRICE;
        console.log(`Price Calc: Added €${CUSTOM_INSERT_PRICE} for page inserts.`);
    }

    // --- Cover Costs --- //
    // Cover material
    const materialCost = COVER_MATERIAL_PRICES[design.coverMaterial] || 0;
    if (materialCost > 0) {
        price += materialCost;
        console.log(`Price Calc: Added €${materialCost} for ${design.coverMaterial} cover.`);
    }
    // Cover image
    if (design.coverImage) {
        price += COVER_IMAGE_PRICE;
        console.log(`Price Calc: Added €${COVER_IMAGE_PRICE} for cover image.`);
    }

    console.log(`Price Calc: Final Price: €${price.toFixed(2)}`);
    return price;
}

// --- AUTH SIMULATION --- //

// NOTE: This is a basic simulation using localStorage. NOT secure for production.
// Passwords should be hashed in a real application.

// Get users from localStorage or initialize
function getUsers() {
    return JSON.parse(localStorage.getItem('appUsers') || '{}');
}

// Save users to localStorage
function saveUsers(users) {
    localStorage.setItem('appUsers', JSON.stringify(users));
}

// Get current logged-in user session
function getCurrentUserSession() {
    return JSON.parse(localStorage.getItem('currentUserSession') || 'null');
}

// Save current user session
function setCurrentUserSession(session) {
    localStorage.setItem('currentUserSession', JSON.stringify(session));
}

// Check if a user is logged in
function isLoggedIn() {
    return getCurrentUserSession() !== null;
}

// Get current user details (if logged in)
function getCurrentUser() {
    const session = getCurrentUserSession();
    if (!session) return null;
    const users = getUsers();
    return users[session.email] || null; // Retrieve full user object
}

// Simulate Signup
function simulateSignup(username, email, password) {
    const users = getUsers();
    if (users[email]) {
        alert('Email already exists!');
        return false;
    }
    users[email] = { username, email, password }; // Store plain password (BAD PRACTICE!)
    saveUsers(users);
    console.log('User registered:', { username, email });
    return true;
}

// Simulate Login
function simulateLogin(email, password) {
    const users = getUsers();
    const user = users[email];
    if (user && user.password === password) { // Direct password check (BAD PRACTICE!)
        const session = { email: user.email, username: user.username }; // Create session data
        setCurrentUserSession(session);
        console.log('User logged in:', session);
        return true;
    } else {
        alert('Invalid email or password.');
        return false;
    }
}

// Logout
function logout() {
    setCurrentUserSession(null); // Clear session
    console.log('User logged out');
    // Redirect to home or login page
    window.location.href = 'index.html';
}

// --- Navigation Update --- //
function updateNavigation() {
    const nav = document.getElementById('main-nav');
    if (!nav) return;

    const loggedIn = isLoggedIn();
    let navHTML = '<ul>';

    // Common links
    navHTML += '<li><a href="index.html">Home</a></li>';
    navHTML += '<li><a href="about.html">About</a></li>';
    navHTML += '<li><a href="build.html">Build</a></li>';
    navHTML += '<li><a href="reorder.html">Reorder Inserts</a></li>';
    navHTML += '<li><a href="feedback.html">Feedback</a></li>';
    navHTML += '<li><a href="contact.html">Contact</a></li>';
    navHTML += '<li><a href="cart.html">Cart</a></li>';

    if (loggedIn) {
        // Links for logged-in users
        navHTML += '<li><a href="profile.html">My Profile</a></li>';
        navHTML += '<li><a href="#" id="logout-link">Logout</a></li>';
    } else {
        // Links for guests
        navHTML += '<li><a href="login.html">Login</a></li>';
        navHTML += '<li><a href="signup.html">Sign Up</a></li>';
    }

    navHTML += '</ul>';
    nav.innerHTML = navHTML;

    // Add logout listener if the link exists
    const logoutLink = document.getElementById('logout-link');
    if (logoutLink) {
        logoutLink.addEventListener('click', (e) => {
            e.preventDefault();
            logout();
        });
    }
}

// --- Page Specific Setup --- //

function setupLoginPage() {
    const loginForm = document.getElementById('login-form');
    if (!loginForm) return;

    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const email = e.target.email.value;
        const password = e.target.password.value;
        if (simulateLogin(email, password)) {
            window.location.href = 'profile.html'; // Redirect to profile on success
        }
    });
}

function setupSignupPage() {
    const signupForm = document.getElementById('signup-form');
    if (!signupForm) return;

    signupForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const username = e.target.username.value;
        const email = e.target.email.value;
        const password = e.target.password.value;
        const confirmPassword = e.target['confirm-password'].value;

        if (password !== confirmPassword) {
            alert('Passwords do not match!');
            return;
        }

        if (simulateSignup(username, email, password)) {
            alert('Signup successful! Please log in.');
            window.location.href = 'login.html'; // Redirect to login after signup
        }
    });
}

function setupProfilePage() {
    const profileUsername = document.getElementById('profile-username');
    const profileEmail = document.getElementById('profile-email');
    const savedDesignsList = document.getElementById('saved-designs-list');
    const logoutBtn = document.getElementById('logout-btn');

    const user = getCurrentUser();

    if (!user) {
        alert('You must be logged in to view this page.');
        window.location.href = 'login.html';
        return;
    }

    if (profileUsername) profileUsername.textContent = user.username;
    if (profileEmail) profileEmail.textContent = user.email;
    if (logoutBtn) logoutBtn.addEventListener('click', logout);

    if (savedDesignsList) {
        const allDesigns = JSON.parse(localStorage.getItem('userDesigns') || '{}');
        const userDesigns = allDesigns[user.email] || [];
        renderSavedDesigns(userDesigns, allDesigns, user, savedDesignsList);
    }
}

function renderSavedDesigns(userDesigns, allDesigns, user, container) {
    container.innerHTML = ''; // Clear previous items
    if (userDesigns.length === 0) {
        container.innerHTML = '<p>You have no saved designs yet.</p>';
    } else {
        userDesigns.forEach((designData, index) => {
            const itemDiv = document.createElement('div');
            itemDiv.classList.add('saved-design-item');
            let name = designData.name || `Design ${index + 1}`;
            let description = `Notebook (${designData.size} Pages, ${designData.coverMaterial} Cover)`;
            if(designData.coverImage) description += ", Custom Cover Img";
            if(designData.image) description += ", Custom Page Img";
            const savedDate = designData.savedAt ? new Date(designData.savedAt).toLocaleDateString() : 'Unknown Date';

            itemDiv.innerHTML = `
                <span class="design-details">
                    <strong class="design-name">${name}</strong><br>
                    <small>${description} - Saved on ${savedDate}</small>
                </span>
                 <div class="design-actions">
                    <button class="edit-name-btn" data-index="${index}" title="Edit Name">✏️</button>
                    <button class="reorder-design-btn" data-index="${index}">Reorder</button>
                </div>
            `;
            container.appendChild(itemDiv);
        });

        // Re-attach listeners after rendering
        attachSavedDesignListeners(userDesigns, allDesigns, user, container);
    }
}

function attachSavedDesignListeners(userDesigns, allDesigns, user, container) {
    // Edit Name listeners
    container.querySelectorAll('.edit-name-btn').forEach(button => {
        button.addEventListener('click', (e) => {
            const designIndex = parseInt(e.target.dataset.index);
            const currentName = userDesigns[designIndex].name || '';
            const newName = prompt("Enter a new name for this design:", currentName);

            if (newName !== null && newName.trim() !== currentName) {
                userDesigns[designIndex].name = newName.trim() || `Design ${designIndex + 1}`; // Update name, add default if empty
                allDesigns[user.email] = userDesigns;
                localStorage.setItem('userDesigns', JSON.stringify(allDesigns));
                renderSavedDesigns(userDesigns, allDesigns, user, container); // Re-render
                console.log(`Renamed design at index ${designIndex} to: ${userDesigns[designIndex].name}`);
            }
        });
    });

    // Reorder listeners
    container.querySelectorAll('.reorder-design-btn').forEach(button => {
        button.addEventListener('click', (e) => {
            const designIndex = parseInt(e.target.dataset.index);
            const designToReorder = userDesigns[designIndex];
            let cart = JSON.parse(localStorage.getItem('shoppingCart') || '[]');
            const cartItem = JSON.parse(JSON.stringify(designToReorder));
            cartItem.id = `notebook_${Date.now()}`;
            cart.push(cartItem);
            localStorage.setItem('shoppingCart', JSON.stringify(cart));
            alert('Saved design added to your cart!');
            window.location.href = 'cart.html';
        });
    });
}

function setupReorderPage() {
    console.log('Setting up Reorder page...');
    const customInsertsSection = document.getElementById('custom-inserts-section');
    const customInsertsList = document.getElementById('custom-inserts-list');
    const reorderForm = document.getElementById('reorder-form');

    if (isLoggedIn()) {
        customInsertsSection.style.display = 'block';
        const user = getCurrentUser();
        const allDesigns = JSON.parse(localStorage.getItem('userDesigns') || '{}');
        const userDesigns = allDesigns[user.email] || [];

        customInsertsList.innerHTML = ''; // Clear loading message

        if (userDesigns.length === 0) {
            customInsertsList.innerHTML = '<p>You haven\'t saved any custom notebook designs yet.</p>';
        } else {
            const uniquePageDesigns = new Map(); // Use a Map to store unique page designs

            // Extract unique page designs from saved notebooks
            userDesigns.forEach(notebookDesign => {
                // Find the custom section within the notebook design
                const customSection = notebookDesign.sections.find(s => typeof s === 'object' && s.type === 'custom');
                if (customSection && customSection.design) {
                    const pageDesign = {
                        style: customSection.design.style,
                        color: customSection.design.color,
                        image: customSection.design.image, // Store image presence/URL for summary
                        inserts: customSection.design.inserts || [] // Store inserts for summary
                        // We don't need cover, size, price here, just page attributes
                    };
                    // Create a unique key based on page attributes to avoid duplicates
                    const designKey = JSON.stringify({ style: pageDesign.style, color: pageDesign.color, image: !!pageDesign.image, inserts: pageDesign.inserts.length });
                    
                    if (!uniquePageDesigns.has(designKey)) {
                         uniquePageDesigns.set(designKey, pageDesign);
                    }
                }
            });

            if (uniquePageDesigns.size === 0) {
                 customInsertsList.innerHTML = '<p>No custom page designs found in your saved notebooks.</p>';
            } else {
                 uniquePageDesigns.forEach((pageDesign, key) => {
                    const label = document.createElement('label');
                    const checkbox = document.createElement('input');
                    checkbox.type = 'checkbox';
                    checkbox.name = 'custom-insert';
                    // Store the actual design details needed for the cart item
                    const valueData = { style: pageDesign.style, color: pageDesign.color, image: pageDesign.image, inserts: pageDesign.inserts };
                    checkbox.value = JSON.stringify(valueData);

                    // Create a user-friendly description
                    let description = `Style: ${pageDesign.style}, Color: ${pageDesign.color}`;
                    if (pageDesign.image) description += ", Custom Image";
                    if (pageDesign.inserts.length > 0) description += `, ${pageDesign.inserts.length} Insert(s)`;

                    label.appendChild(checkbox);
                    label.appendChild(document.createTextNode(` ${description}`));
                    customInsertsList.appendChild(label);
                    customInsertsList.appendChild(document.createElement('br'));
                });
            }
        }
    } else {
        customInsertsSection.style.display = 'none';
    }

    // Handle form submission
    reorderForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const selectedStandard = Array.from(e.target.querySelectorAll('input[name="insert"]:checked')).map(cb => cb.value);
        const selectedCustom = Array.from(e.target.querySelectorAll('input[name="custom-insert"]:checked')).map(cb => JSON.parse(cb.value));

        if (selectedStandard.length === 0 && selectedCustom.length === 0) {
            alert('Please select at least one insert type to add.');
            return;
        }

        console.log('Selected Standard Inserts:', selectedStandard);
        console.log('Selected Custom Page Designs:', selectedCustom);

        // Simulate adding to cart
        // In a real app, these would likely be distinct product types with prices
        let cart = JSON.parse(localStorage.getItem('shoppingCart') || '[]');

        selectedStandard.forEach(type => {
            cart.push({ id: `insert_${type}_${Date.now()}`, type: 'standard-insert', name: `${type} Insert Pack`, totalPrice: 5.00 }); // Example price
        });

        selectedCustom.forEach(design => {
            let name = `Custom Insert Pack (Style: ${design.style}, Color: ${design.color})`;
            if (design.image) name += ", Img";
            if (design.inserts.length > 0) name += ", Inserts";
             cart.push({ id: `custom_insert_${Date.now()}`, type: 'custom-insert', name: name, design: design, totalPrice: 8.00 }); // Example price for custom
        });

        localStorage.setItem('shoppingCart', JSON.stringify(cart));
        alert('Selected inserts added to cart!');
        reorderForm.reset();
        // Maybe redirect to cart page?
        // window.location.href = 'cart.html';
    });

}

// Add form submission handlers if needed (e.g., for feedback/reorder)
// const feedbackForm = document.getElementById('feedback-form');
// if (feedbackForm) {
//     feedbackForm.addEventListener('submit', (e) => {
//         e.preventDefault(); // Prevent default page reload
//         console.log('Feedback submitted:', e.target.feedback.value);
//         alert('Thank you for your feedback!');
//         // Potentially send data to a server here
//         feedbackForm.reset();
//     });
// } 