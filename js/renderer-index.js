// Initialise available shopping items.
let availableItems = [];

// Initialise shopping list to add items.
let shoppingList = [];

// Request the available items data from the main process
async function getData() {
    
    // Retreive the available items data and store in array
    const data = await window.electronAPI.sendWeeklyData();
    availableItems.push(...data);

    // Filter the available items data for weekly purchased items and add to the shopping list 
    const weeklyItems = availableItems.filter((item) => {
        return item.frequency == 'Weekly';
    });
    shoppingList.push(...weeklyItems);
}

// Get the data from the main proces
getData();

// Use the preload script to listen for the save event.
window.electronAPI.listenForSave();

// Get the search box element and search icon.
const searchBox = document.querySelector('.search-container input');
const searchIcon = document.querySelector('.search');
const selectedItem = document.querySelector('.item');
const itemFrequency = document.querySelector('.freq');
const addToList = document.querySelector('.select_button');
const searchList = document.querySelector('.search-list');

// Change the cursor to pointer when mouse is over the button
addToList.addEventListener('mouseover', hoverPointer);

function hoverPointer() {
    this.style.cursor = 'pointer';
};

// Add current selected item to the current shopping list. 
addToList.addEventListener('click', () => {
    const selection = selectedItem.textContent;
    const selectionLowerCase = selection.toLowerCase();
    const itemNames = shoppingList.map((item) => {
        return item.name;
    })
    if (!itemNames.includes(selectionLowerCase)) {
        const newItemEntry = availableItems.find((item) => {
            return item.name == selectionLowerCase;
        });
        // Add the new item details to the shopping list 
        shoppingList.push(newItemEntry);

        // Set the empty text values in the circle
        selectedItem.textContent = '----';
        itemFrequency.textContent = '----';
        
        // Alert the user that item has been added to the shooping list
        alert(`${selection} has been added to the shopping list`);

    }
    else {
        alert('This item has already been added to the list');
    }
});

// Update the selection list base on search input
searchBox.addEventListener('keyup', updateSearchList)

function updateSearchList() {
    const searchInput = this.value;
    
    if (searchInput.length > 0) {
        searchList.style.display = 'block';
    } 
    else {
        searchList.style.display = 'none';
    }
    const regex = new RegExp(`${searchInput}`, 'ig');
    const matchedItems = availableItems.filter((item) => {
        return item.name.includes(searchInput);
    });
    const searchListTitle = `<li class="list-titles"><span>Item Name</span><span>Frequency</span></li>`;
    const searchListEntries = matchedItems.map((item) => {
        return `<li class="listItem"><span>${capitaliseFirstLetter(item.name)}</span><span>${item.frequency}</span></li>`;
    }).join('');
     
    searchList.innerHTML = searchListTitle + searchListEntries;

    let listItem = searchList.querySelectorAll('.listItem');

    listItem.forEach((item) => {
        // Listen for click events and change background on hover over list items
        item.addEventListener('click', selectListItem);
        item.addEventListener('mouseover', highlightBackground);
        item.addEventListener('mouseout', removeHighlight);
    });
};

// Get the information from selected item
function selectListItem(event) {
    const listElement = event.target.parentElement;
    const itemAttributes = listElement.querySelectorAll('span'); 
    const name = itemAttributes[0].textContent;
    const frequency = itemAttributes[1].textContent;

    // Set the text values in the circle
    selectedItem.textContent = name;
    itemFrequency.textContent = frequency;

    // Remove the search list and search text when item selected
    searchList.style.display = 'none';
    searchBox.value = '';
};

// Highlight list items when hovered
function highlightBackground() {
    this.style.backgroundColor = '#9ea2f1';
    this.style.fontWeight = 'bold';
};

// Function remove highlight
function removeHighlight() {
    this.style.backgroundColor = 'white';
    this.style.fontWeight = 'normal';
};

// Capitalise the first letter of each word
function capitaliseFirstLetter(words) {
    const wordsArray = words.split(' ');
    const newWords = wordsArray.map((word) => {
        const firstLetter = word.slice(0,1).toUpperCase();
        const remainingLetters = word.slice(1);
        return firstLetter + remainingLetters;
    }).join(' ');

    return newWords
} 

// Close search list if clicked outside
window.addEventListener('click', closeSearchList);

function closeSearchList(event) {
    if (event.target.parentElement.tagName != 'LI' && searchList.style.display == 'block') {
        searchList.style.display = 'none';
        searchBox.value = '';
    }
};


// JS for modal form for shopping list
const categories = ['Fresh Produce','Dairy','Grains & Cereals','Baking','Frozen','Oils & Seasoning','Snacks, Spreads & Drink',
'Cleaning & Household'];

const categoryColors = {'Fresh Produce': 'rgb(196, 246, 217)','Dairy': 'rgb(249, 249, 250)','Grains & Cereals': 'rgb(247, 226, 198)',
'Baking': 'rgb(238, 243, 197)','Frozen': 'rgb(196, 242, 245)','Oils & Seasoning': 'rgb(250, 215, 211)',
'Snacks, Spreads & Drink': 'rgb(248, 207, 242','Cleaning & Household': 'rgb(206, 212, 248)'};

const viewEditButton = document.querySelector('.review-button1');
const modalForm = document.querySelector('.modal-form');
const itemDisplay = document.querySelector('.item-summary');
const crossIcon = document.querySelector('.cross-icon');

// Close the modal when cross is clicked.
crossIcon.addEventListener('click', closeModal);

function closeModal() {
    modalForm.style.display = 'none';
}

// Open and load the modal when view/edit button clicked.
viewEditButton.addEventListener('click', loadModal) 

function loadModal() {
    const freshProduceItems = shoppingList.filter((item) => {
        return item.category == 'Fresh Produce';
    });
    const itemSummaryHTML = freshProduceItems.map((item) => {
        return `<div class="item-view"><span>${item.name}</span><button class="remove">Remove</button></div>`
    }).sort().join('');
    itemDisplay.innerHTML = itemSummaryHTML;
    modalForm.style.display = 'grid';
    const removeButtons = document.querySelectorAll('.remove');
    removeButtons.forEach((button) => {
        button.addEventListener('click', removeItem);
    });
}

// Highlight categories when clicked
const formOptions = document.querySelectorAll('.categories div');

formOptions.forEach((option) => {
    option.addEventListener('click', updateModalForm);
})

// Format name as html attribute
function formatAsAttribute(category) {
    const categoryNoSpaces = category.toLowerCase().replace(/\s/ig, '-');
    return categoryNoSpaces.replace('&','and').replace(',','');
}

function updateModalForm(event) {
    formOptions.forEach((option) => {
        //Reset all options to default formatting
        const category = option.querySelector('h3').textContent;
        const categoryAttribute = formatAsAttribute(category);
        if (option.classList.contains(`${categoryAttribute}`)) {
            option.classList.remove(`${categoryAttribute}`);
        }
    });
    
    // Add the appropriate class to the selected option   
    const selectedOption = event.target.tagName == 'DIV' ? event.target : event.target.parentElement;
    const categoryTitle = selectedOption.querySelector('h3').textContent;
    const selectedCategoryAttribute = formatAsAttribute(categoryTitle);
    selectedOption.classList.add(`${selectedCategoryAttribute}`);

    // Update to display the items belonging to the selected category
    const currentCategoryItems = shoppingList.filter((items) => {
        return items.category == categoryTitle;
    });

    let itemSummaryHTML;

    if (currentCategoryItems.length > 0) {
        itemSummaryHTML = currentCategoryItems.map((item) => {
            return `<div class="item-view"><span>${item.name}</span><button class="remove">Remove</button></div>`
        }).sort().join('');
        itemDisplay.style.display = 'grid';
        itemDisplay.style.backgroundColor = categoryColors[categoryTitle];
    }
    else {
        itemDisplay.style.display = 'flex';
        itemDisplay.style.justifyContent = 'center';
        itemDisplay.style.alignItems = 'center';
        itemDisplay.style.backgroundColor = categoryColors[categoryTitle];
        itemSummaryHTML = '<div class="no-item-message">No Items Selected From This Category</div>';
    }
    
    itemDisplay.innerHTML = itemSummaryHTML;
    const removeButtons = document.querySelectorAll('.remove');
    removeButtons.forEach((button) => {
        button.addEventListener('click', removeItem);
    });
};

function removeItem(event) {
    const removedItem = event.target.parentElement.querySelector('span').textContent.toLowerCase();
    const removedElement = event.target.parentElement;
    removedElement.remove();

    // Remove from the shopping list
    const removedItemIndex = shoppingList.findIndex((item) => {
        return item.name == removedItem;
    });
    shoppingList.splice(removedItemIndex, 1);
    console.log(shoppingList.length);
};


// Store the current shopping list data when save data is pressed
const saveButton = document.querySelector('.review-button2');

saveButton.addEventListener('click', saveShoppingData) 

async function saveShoppingData() {
    alert('This function is yet to be implemented');
    //const data = await window.electronAPI.saveData(JSON.stringify(shoppingList));
}

// Select the generate list button
const generateButton = document.querySelector('.review-button3') 

// Generate the new shopping list window on button click
generateButton.addEventListener('click', generateFinalList);

async function generateFinalList() {
    const submit = await window.electronAPI.generateList(JSON.stringify(shoppingList));
}









