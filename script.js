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
        sizeDiv.innerHTML = `<b>Size:</b> ${notebookConfig.size} Pages (£${notebookConfig.basePrice.toFixed(2)})`;
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

                sectionDiv.innerHTML = `${index + 1}. <b>Custom Design</b> (<small>Pages: ${pageDetails} | ${coverDetails}</small>) - <i>Price: £${design.price.toFixed(2)}</i>`;
                // Update total price JUST IN CASE (should be set when custom is added)
                notebookConfig.totalPrice = design.price;
            }
            mixContainer.appendChild(sectionDiv);
        });

        // Display Total Price
        const totalDiv = document.createElement('div');
        totalDiv.innerHTML = `<hr><b>Total Mix Price: £${notebookConfig.totalPrice.toFixed(2)}</b>`;
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

    // Window elements
    const previewWindow = document.getElementById('floating-preview-window');
    const previewHeader = document.getElementById('preview-window-header');
    const minimizeBtn = document.getElementById('preview-minimize');
    const maximizeBtn = document.getElementById('preview-maximize');

    // Other elements
    const submitBtn = document.getElementById('submit-design-btn');
    const notebookPreview = document.getElementById('notebook-preview');
    const previewImageLayer = document.getElementById('preview-image-layer');
    const previewStyleLayer = document.getElementById('preview-style-layer'); // Layer for lines/grids
    const pageColorInput = document.getElementById('page-color');
    const styleInputs = document.querySelectorAll('input[name="page-style"]');
    const albumToggle = document.getElementById('album-toggle');
    const imageUpload = document.getElementById('image-upload');
    const opacitySlider = document.getElementById('opacity-slider');
    const opacityValueSpan = document.getElementById('opacity-value');
    const draggableItems = document.querySelectorAll('.draggable-item');

    // New elements for Cover Design & View Toggle
    const viewPageBtn = document.getElementById('view-page-btn');
    const viewCoverBtn = document.getElementById('view-cover-btn');
    const pageControlsGroup = document.getElementById('page-controls-group');
    const coverControlsGroup = document.getElementById('cover-controls-group');
    const coverMaterialInputs = document.querySelectorAll('input[name="cover-material"]');
    const coverImageUpload = document.getElementById('cover-image-upload');
    const previewCoverLayer = document.getElementById('preview-cover-layer');
    const previewPageContent = document.getElementById('preview-page-content');

    // --- State Variables --- //
    let currentView = 'page'; // 'page' or 'cover'

    let currentDesign = {
        // Page design
        color: pageColorInput.value,
        style: document.querySelector('input[name="page-style"]:checked').value,
        albumView: albumToggle.checked,
        image: null, // Page image Data URL
        imageOpacity: opacitySlider.value,
        inserts: [],
        // Cover design
        coverMaterial: document.querySelector('input[name="cover-material"]:checked').value,
        coverImage: null // Cover image Data URL
    };

    // --- Shared state for window --- //
    let isDragging = false;
    let offsetX, offsetY;
    let originalHeight = previewWindow.style.height || '50vh'; // Store original size for minimize/restore
    let isMaximized = false;
    let originalSize = { width: previewWindow.style.width, height: previewWindow.style.height, top: previewWindow.style.top, left: previewWindow.style.left };

    // --- Get Base Config from Build Page --- //
    const notebookSize = parseInt(localStorage.getItem('currentNotebookSize') || '0');
    const notebookBasePrice = parseFloat(localStorage.getItem('currentNotebookBasePrice') || '0');

    if (!notebookSize || !notebookBasePrice) {
        alert('Error: Notebook size not selected. Please go back to the Build page.');
        // Optionally disable controls or redirect
        previewWindow.innerHTML = '<p style="color: red; padding: 20px;">Configuration Error. Please return to Build page.</p>';
        return; // Stop setup if config is missing
    }
    console.log(`Constructor loaded for Size: ${notebookSize}, Base Price: £${notebookBasePrice}`);

    function updatePreview() {
        console.log('Updating preview for view:', currentView, 'with:', currentDesign);

        if (currentView === 'page') {
            // --- Show Page Content, Hide Cover --- //
            previewCoverLayer.style.display = 'none';
            previewPageContent.style.display = 'block';
            notebookPreview.style.backgroundColor = 'transparent'; // Let page content handle bg

            // --- Apply styles directly to previewPageContent --- //
            previewPageContent.innerHTML = ''; // Clear previous diary header/inserts but keep image layer
            previewPageContent.appendChild(previewImageLayer); // Ensure image layer stays
            previewPageContent.appendChild(document.createElement('p')).textContent = 'Your design will appear here'; // Re-add placeholder if needed
            previewPageContent.querySelector('p').style.display = 'none'; // Hide placeholder for actual content

            // Update page background color
            previewPageContent.style.backgroundColor = currentDesign.color;

            // Update page image and opacity (already targets the separate layer)
            if (currentDesign.image) {
                previewImageLayer.style.backgroundImage = `url(${currentDesign.image})`;
            } else {
                previewImageLayer.style.backgroundImage = 'none';
            }
            previewImageLayer.style.opacity = currentDesign.imageOpacity;

            // Update page style (lines, grid, etc.) applied to previewPageContent
            previewPageContent.style.backgroundImage = 'none'; // Reset background image style
            previewPageContent.style.backgroundSize = 'auto';   // Reset background size

            if (currentDesign.style === 'lined') {
                previewPageContent.style.backgroundImage = 'repeating-linear-gradient(to bottom, transparent, transparent 29px, #ccc 29px, #ccc 30px)';
                previewPageContent.style.backgroundSize = '100% 30px';
            } else if (currentDesign.style === 'grid') {
                previewPageContent.style.backgroundImage = 'linear-gradient(#ccc 1px, transparent 1px), linear-gradient(to right, #ccc 1px, transparent 1px)';
                previewPageContent.style.backgroundSize = '20px 20px';
            } else if (currentDesign.style === 'dotted') {
                previewPageContent.style.backgroundImage = 'radial-gradient(#aaa 2px, transparent 2px)';
                previewPageContent.style.backgroundSize = '20px 20px';
            } else if (currentDesign.style === 'diary') {
                // Apply lined style *first*
                previewPageContent.style.backgroundImage = 'repeating-linear-gradient(to bottom, transparent, transparent 29px, #ccc 29px, #ccc 30px)';
                previewPageContent.style.backgroundSize = '100% 30px';
                // Add the date header
                const diaryHeader = document.createElement('div');
                diaryHeader.innerHTML = 'Date: ____________________';
                diaryHeader.style.position = 'absolute'; // Position relative to previewPageContent
                diaryHeader.style.top = '5px';
                diaryHeader.style.left = '10px';
                diaryHeader.style.right = '10px';
                diaryHeader.style.paddingBottom = '5px';
                diaryHeader.style.borderBottom = '1px solid #ccc';
                diaryHeader.style.fontSize = '0.9em';
                diaryHeader.style.color = '#666';
                previewPageContent.appendChild(diaryHeader);
            }

            // Force reflow/repaint after applying background styles
            void previewPageContent.offsetHeight; // Reading offsetHeight triggers reflow

            // Update Album View for Page
            if (currentDesign.albumView) {
                previewPageContent.style.aspectRatio = '16 / 9';
                notebookPreview.style.aspectRatio = '16 / 9'; // Apply to outer container too
                previewPageContent.querySelector('p').textContent = 'Your design (Album View)';
            } else {
                previewPageContent.style.aspectRatio = 'auto';
                notebookPreview.style.aspectRatio = 'auto';
                previewPageContent.querySelector('p').textContent = 'Your design will appear here';
            }
            // Show/hide placeholder based on content (optional)
            if (currentDesign.image || currentDesign.style !== 'blank' || currentDesign.inserts.length > 0) {
                 previewPageContent.querySelector('p').style.display = 'none';
            } else {
                 previewPageContent.querySelector('p').style.display = 'block';
            }

            // Render dropped inserts directly onto previewPageContent
             currentDesign.inserts.forEach(insert => {
                const droppedElement = document.createElement('div');
                droppedElement.textContent = insert.type;
                droppedElement.style.position = 'absolute';
                droppedElement.style.left = `${insert.x}px`;
                droppedElement.style.top = `${insert.y}px`;
                droppedElement.style.background = 'rgba(150, 112, 219, 0.7)';
                droppedElement.style.color = 'white';
                droppedElement.style.padding = '2px 5px';
                droppedElement.style.borderRadius = '3px';
                droppedElement.style.cursor = 'move';
                droppedElement.style.transform = 'translate(-50%, -50%)';
                droppedElement.style.zIndex = '10'; // Ensure inserts are above background styles
                previewPageContent.appendChild(droppedElement);
            });

        } else { // currentView === 'cover'
            // --- Show Cover, Hide Page Content --- //
            previewCoverLayer.style.display = 'block';
            previewPageContent.style.display = 'none';
            notebookPreview.style.backgroundColor = 'transparent'; // Let cover layer handle bg
            notebookPreview.style.aspectRatio = 'auto'; // Cover usually portrait

            // Update cover material style
            previewCoverLayer.classList.remove('leather', 'wood'); // Remove old classes
            previewCoverLayer.style.backgroundColor = '#ccc'; // Default plastic look
             if (currentDesign.coverMaterial === 'leather') {
                 previewCoverLayer.classList.add('leather');
             } else if (currentDesign.coverMaterial === 'wood') {
                 previewCoverLayer.classList.add('wood');
             }

            // Update cover image
            if (currentDesign.coverImage) {
                previewCoverLayer.style.backgroundImage = `url(${currentDesign.coverImage})`;
                 previewCoverLayer.style.backgroundColor = 'transparent'; // Hide bg color if image exists
            } else {
                previewCoverLayer.style.backgroundImage = 'none';
                // Restore background color if needed based on material
                if (currentDesign.coverMaterial === 'leather') previewCoverLayer.style.backgroundColor = '#8B4513';
                else if (currentDesign.coverMaterial === 'wood') previewCoverLayer.style.backgroundColor = '#DEB887';
                else previewCoverLayer.style.backgroundColor = '#ccc';

            }
        }
    }

    // --- Event Listeners --- //

    // View Toggle
    viewPageBtn.addEventListener('click', () => {
        currentView = 'page';
        viewPageBtn.classList.add('active');
        viewCoverBtn.classList.remove('active');
        pageControlsGroup.style.display = 'block';
        coverControlsGroup.style.display = 'none';
        updatePreview();
    });
    viewCoverBtn.addEventListener('click', () => {
        currentView = 'cover';
        viewCoverBtn.classList.add('active');
        viewPageBtn.classList.remove('active');
        pageControlsGroup.style.display = 'none';
        coverControlsGroup.style.display = 'block';
        updatePreview();
    });

    // --- Page Controls Listeners --- //
    pageColorInput.addEventListener('input', (e) => {
        currentDesign.color = e.target.value;
        updatePreview();
    });

    styleInputs.forEach(input => {
        input.addEventListener('change', (e) => {
            if (e.target.checked) {
                currentDesign.style = e.target.value;
                updatePreview();
            }
        });
    });

    albumToggle.addEventListener('change', (e) => {
        currentDesign.albumView = e.target.checked;
        updatePreview();
    });

    opacitySlider.addEventListener('input', (e) => {
        currentDesign.imageOpacity = e.target.value;
        opacityValueSpan.textContent = parseFloat(e.target.value).toFixed(2);
        updatePreview();
    });

    imageUpload.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function(event) {
                currentDesign.image = event.target.result;
                updatePreview();
            }
            reader.readAsDataURL(file);
            console.log('Image selected:', file.name);
        } else {
            currentDesign.image = null;
            updatePreview();
        }
    });

    // --- Cover Controls Listeners --- //
    coverMaterialInputs.forEach(input => {
        input.addEventListener('change', (e) => {
            if (e.target.checked) {
                currentDesign.coverMaterial = e.target.value;
                updatePreview();
            }
        });
    });

    coverImageUpload.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function(event) {
                currentDesign.coverImage = event.target.result;
                updatePreview(); // Update preview immediately
            }
            reader.readAsDataURL(file);
            console.log('Cover image selected:', file.name);
        } else {
            currentDesign.coverImage = null;
            updatePreview(); // Update preview immediately
        }
    });

    // --- Basic Drag and Drop --- //
    draggableItems.forEach(item => {
        item.addEventListener('dragstart', (e) => {
            e.dataTransfer.setData('text/plain', e.target.dataset.itemType);
            e.target.style.opacity = '0.5';
            console.log('Dragging:', e.target.dataset.itemType);
        });

        item.addEventListener('dragend', (e) => {
            e.target.style.opacity = '1';
        });
    });

    notebookPreview.addEventListener('dragover', (e) => {
        e.preventDefault(); // Necessary to allow dropping
        notebookPreview.style.border = '2px dashed var(--primary-color)'; // Indicate drop target
    });

     notebookPreview.addEventListener('dragleave', (e) => {
        notebookPreview.style.border = '1px dashed var(--secondary-color)'; // Revert border
    });

    notebookPreview.addEventListener('drop', (e) => {
        e.preventDefault();
        const itemType = e.dataTransfer.getData('text/plain');
        notebookPreview.style.border = '1px dashed var(--secondary-color)'; // Revert border
        console.log('Dropped:', itemType);

        // Get drop coordinates relative to the preview area
        const rect = notebookPreview.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        // Add item to design data (basic)
        currentDesign.inserts.push({ type: itemType, x, y });

        // TODO: Visually add the dropped element to the previewStyleLayer or another layer
        // Example: create a div, position it using x, y, and append it.
        const droppedElement = document.createElement('div');
        droppedElement.textContent = itemType;
        droppedElement.style.position = 'absolute';
        droppedElement.style.left = `${x}px`;
        droppedElement.style.top = `${y}px`;
        droppedElement.style.background = 'rgba(150, 112, 219, 0.7)'; // Semi-transparent purple
        droppedElement.style.color = 'white';
        droppedElement.style.padding = '2px 5px';
        droppedElement.style.borderRadius = '3px';
        droppedElement.style.cursor = 'move'; // Indicate it might be movable later
        droppedElement.style.transform = 'translate(-50%, -50%)'; // Center on drop point
        previewStyleLayer.appendChild(droppedElement);

        updatePreview(); // Re-render if needed, or just log current design
        console.log("Current design with inserts:", currentDesign);
    });

    // --- Submit --- //
    submitBtn.addEventListener('click', () => {
        // Calculate final price based on current design and base price
        const finalPrice = calculatePrice(currentDesign, notebookBasePrice);
        const designName = document.getElementById('design-name').value.trim();

        // Gather final design data, including size and calculated price
        const finalDesignData = {
            ...currentDesign,
            name: designName || `Custom Design ${new Date().toLocaleTimeString()}`, // Add name, default if empty
            size: notebookSize,
            price: finalPrice
        };

        console.log('Saving Final Design:', finalDesignData);
        localStorage.setItem('pendingCustomDesign', JSON.stringify(finalDesignData));
        window.location.href = 'build.html'; // Navigate back
    });

    // Initial preview render
    updatePreview();

    // --- Floating Window Logic --- //

    // --- Dragging Logic --- //
    function onDragStart(e) {
        // Prevent dragging from buttons or resize handle
        if (e.target.classList.contains('window-btn') || getComputedStyle(e.target).cursor === 'nwse-resize') return;
        console.log("Drag Start Fired"); // DEBUG

        isDragging = true;
        offsetX = e.clientX - previewWindow.offsetLeft;
        offsetY = e.clientY - previewWindow.offsetTop;
        previewWindow.style.cursor = 'grabbing';
        previewWindow.style.userSelect = 'none';

        // Add move/up listeners to the document *only* when dragging starts
        document.addEventListener('mousemove', onDragging);
        document.addEventListener('mouseup', onDragEnd);
    }

    function onDragging(e) {
        if (!isDragging) return;
        console.log("Dragging..."); // DEBUG

        let newX = e.clientX - offsetX;
        let newY = e.clientY - offsetY;

        // Constrain window within viewport boundaries
        const PADDING = 10; // Prevent dragging fully off-screen
        newX = Math.max(PADDING, Math.min(newX, window.innerWidth - previewWindow.offsetWidth - PADDING));
        newY = Math.max(PADDING, Math.min(newY, window.innerHeight - previewWindow.offsetHeight - PADDING));

        previewWindow.style.left = `${newX}px`;
        previewWindow.style.top = `${newY}px`;
    }

    function onDragEnd() {
        if (isDragging) {
            console.log("Drag End Fired"); // DEBUG
            isDragging = false;
            previewWindow.style.cursor = 'move';
            previewWindow.style.removeProperty('user-select');
            // Remove move/up listeners from the document
            document.removeEventListener('mousemove', onDragging);
            document.removeEventListener('mouseup', onDragEnd);
        }
    }

    // Attach the initial mousedown listener to the header
    previewHeader.addEventListener('mousedown', onDragStart);

    // --- Window Controls --- //
    minimizeBtn.addEventListener('click', () => {
        const currentHeight = previewWindow.offsetHeight;
        const headerHeight = previewHeader.offsetHeight;
        if (currentHeight > headerHeight + 20) { // If not already minimized
            originalHeight = previewWindow.style.height; // Store current height
            previewWindow.style.height = `${headerHeight}px`;
            previewWindow.style.minHeight = `${headerHeight}px`;
            previewWindow.style.resize = 'none'; // Disable resize when minimized
            minimizeBtn.textContent = '+'; // Change button symbol
        } else { // Restore
            previewWindow.style.height = originalHeight || '50vh';
            previewWindow.style.minHeight = `300px`; // Restore min-height
            previewWindow.style.resize = 'both'; // Re-enable resize
            minimizeBtn.textContent = '_';
        }
    });

    // Basic Maximize/Restore
    maximizeBtn.addEventListener('click', () => {
        if (!isMaximized) {
            // Store current state before maximizing
            originalSize = {
                width: previewWindow.style.width || `${previewWindow.offsetWidth}px`,
                height: previewWindow.style.height || `${previewWindow.offsetHeight}px`,
                top: previewWindow.style.top || `${previewWindow.offsetTop}px`,
                left: previewWindow.style.left || `${previewWindow.offsetLeft}px`
            };
            // Maximize (leave small padding)
            previewWindow.style.top = '85px'; // Adjust padding from top (header height)
            previewWindow.style.left = '10px';
            previewWindow.style.width = 'calc(100% - 20px)';
            previewWindow.style.height = 'calc(100vh - 95px)'; // Adjust padding from bottom
            previewWindow.style.resize = 'none'; // Disable resize when maximized
            isMaximized = true;
             maximizeBtn.textContent = '❐'; // Change symbol
        } else {
            // Restore
            previewWindow.style.top = originalSize.top;
            previewWindow.style.left = originalSize.left;
            previewWindow.style.width = originalSize.width;
            previewWindow.style.height = originalSize.height;
            previewWindow.style.resize = 'both'; // Re-enable resize
            isMaximized = false;
             maximizeBtn.textContent = '□'; // Restore symbol
        }
    });
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
                        if(section.design.inserts.length > 0) pageDetailsList += ", Inserts";
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
                    <span>£${item.totalPrice.toFixed(2)}</span>
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
        console.log(`Price Calc: Added £${CUSTOM_IMAGE_PRICE} for page image.`);
    }
    // Page inserts
    if (design.inserts && design.inserts.length > 0) {
        price += CUSTOM_INSERT_PRICE;
        console.log(`Price Calc: Added £${CUSTOM_INSERT_PRICE} for page inserts.`);
    }

    // --- Cover Costs --- //
    // Cover material
    const materialCost = COVER_MATERIAL_PRICES[design.coverMaterial] || 0;
    if (materialCost > 0) {
        price += materialCost;
        console.log(`Price Calc: Added £${materialCost} for ${design.coverMaterial} cover.`);
    }
    // Cover image
    if (design.coverImage) {
        price += COVER_IMAGE_PRICE;
        console.log(`Price Calc: Added £${COVER_IMAGE_PRICE} for cover image.`);
    }

    console.log(`Price Calc: Final Price: £${price.toFixed(2)}`);
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