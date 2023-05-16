const { DateTime } = require("luxon");

function getEndDate() {
    const currentDate = DateTime.now();
    const dayOfWeek = currentDate.weekday;
    let daysElapsed;

    // Shift the day of week so Tuesday is 1
    if (dayOfWeek == 1) {
        daysElapsed = 6;
    }
    else {
        daysElapsed = dayOfWeek - 2;
    }

    // Get number of days until end of shopping week and add to current date.
    const daysToEnd = 6 - daysElapsed;
    const dateEnd = currentDate.plus({days: daysToEnd});
    return dateEnd;
}

function generateArrayData(finalArray, list) {
    const categories = ['Fresh Produce','Dairy','Grains & Cereals','Baking','Frozen','Oils & Seasoning','Snacks, Spreads & Drink',
    'Cleaning & Household'];
    const shoppingList = JSON.parse(list);
    categories.forEach((category) => {
      const classAttribute = category.toLowerCase().replace('& ','').replace(/\s/g,'-').replace(',','');
      const categoryItems = shoppingList.filter((item) => {
        return item.category == category;
      }).map((item) => {
        return item.name;
      }).join(', ');
      
      // If category has at least one item then push to the final array
      if (categoryItems.length > 0) {
        finalArray.push({classAtt: classAttribute, category: category, selectedItems: categoryItems});
      }
    });
}

module.exports = {getEndDate, generateArrayData}