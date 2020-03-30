const moment = require('moment');

//Takes a weekly time series and returns an array of keys sorted by date
//in order of most recent to furthest
//adapted from https://stackoverflow.com/a/31102605
const getSortedKeysByDate = weeklyTimeSeries => {
  const sortedKeys = Object.keys(weeklyTimeSeries).sort((a, b) => {
    const dateA = moment(a);
    const dateB = moment(b);
    if (dateA.isBefore(dateB)) return 1;
    else if (dateA.isSame(dateB)) return 0;
    else return -1;
  });

  return sortedKeys;
};

//Takes a weekly time series and returns an array of objects containing the highest weekly value and date
//Sorted by date, in order of most recent to furthest
getLast52Data = weeklyTimeSeries => {
  const sortedKeys = getSortedKeysByDate(weeklyTimeSeries);
  const last52 = [];
  for (let i = 0; i < 52; i++) {
    let date = sortedKeys[i];
    last52[i] = { date, high: weeklyTimeSeries[date]['2. high'] };
  }
  return last52;
};

module.exports = { getLast52Data };
