import React from 'react';
import { render } from '@testing-library/react';
import { WatchList } from '../../../src/components/modules/WatchList';
jest.mock('../../../src/components/modules/WatchListEntry');

beforeEach(() => {
  jest.resetAllMocks();
});

describe('WatchList tests', () => {
  let addToWatchlist = jest.fn();
  let getWatchlist = jest.fn();
  let getStockStats = jest.fn();
  let getStockStatsForAllStocks = jest.fn();
  let refreshCurrentForWatchlist = jest.fn();
  let stocks = {};

  test('should call getStockStats for each stock', () => {
    const stocks = {
      'tse:BMO': { symbol: 'tse:BMO', loading: true },
      'nyse:BMO': { symbol: 'nyse:BMO', loading: true },
      aapl: { symbol: 'aapl', loading: true },
      'TSE:GWO': { symbol: 'TSE:GWO', loading: true },
    };
    render(
      <WatchList
        mappedStocks={stocks}
        addToWatchlist={addToWatchlist}
        getWatchlist={getWatchlist}
        getStockStats={getStockStats}
        getStockStatsForAllStocks={getStockStatsForAllStocks}
        refreshCurrentForWatchlist={refreshCurrentForWatchlist}
        loading={false}
      />
    );
    const keys = Object.keys(stocks);
    for (const key of keys) {
      expect(getStockStatsForAllStocks).toHaveBeenCalledWith(stocks);
    }
    expect(getStockStatsForAllStocks).toHaveBeenCalledTimes(1);
  });

  test('should call getWatchlist once', () => {
    render(
      <WatchList
        mappedStocks={stocks}
        addToWatchlist={addToWatchlist}
        getWatchlist={getWatchlist}
        getStockStats={getStockStats}
        getStockStatsForAllStocks={getStockStatsForAllStocks}
        refreshCurrentForWatchlist={refreshCurrentForWatchlist}
        loading={true}
      />
    );

    expect(getWatchlist).toHaveBeenCalledTimes(1);
  });
});
