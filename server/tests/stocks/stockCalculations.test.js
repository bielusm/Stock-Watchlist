const { getLast52Data } = require('../../stocks/stockCalculations');
const ibmData = require('../fixtures/stocks/ibmStocks.json');

describe('stockCalculation tests', () => {
  describe('getLast52Data', () => {
    test('should get last 52 datapoints', () => {
      const last52 = getLast52Data(ibmData['Weekly Time Series']);
      expect(last52).toHaveLength(52);
      expect(last52).toMatchSnapshot();
    });
  });
});
