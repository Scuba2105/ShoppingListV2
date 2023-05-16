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

module.exports = {getEndDate}