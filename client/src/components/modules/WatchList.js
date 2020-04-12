import React, { useEffect } from 'react';
import { Table, Card, CardHeader, CardBody } from 'reactstrap';
import WatchListEntry from './WatchListEntry';
import {
  addToWatchlist,
  getWatchlist,
  getStockStats,
  getStockStatsForAllStocks,
  refreshCurrentForWatchlist,
} from '../../actions/stocks';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import AddStock from './AddStock';

export const WatchList = ({
  mappedStocks,
  addToWatchlist,
  getWatchlist,
  getStockStats,
  getStockStatsForAllStocks,
  refreshCurrentForWatchlist,
  loading,
}) => {
  useEffect(() => {
    getWatchlist();
  }, []);

  useEffect(() => {
    if (!loading) {
      getStockStatsForAllStocks(mappedStocks);

      const interval = 1000 * 60 * 20;
      const updateInterval = setInterval(() => {
        refreshCurrentForWatchlist(mappedStocks);
      }, interval);

      return () => {
        clearInterval(updateInterval);
      };
    }
  }, [loading]);

  const addStock = (symbol) => {
    addToWatchlist(symbol);
    getStockStats(symbol, false);
  };

  return (
    <>
      <Card>
        <CardHeader>
          <h4 className="d-inline-block">WatchList</h4>
          <AddStock addStock={addStock} />
        </CardHeader>
        <CardBody>
          <Table className="watchlistTable">
            <thead>
              <tr>
                <th>Symbol</th>
                <th>Current Value</th>
                <th>52 Week Max</th>
                <th>% Change</th>
                <th>52 Week Min</th>
                <th>% Change</th>
                <th>Delete</th>
              </tr>
            </thead>
            <tbody>
              {Object.keys(mappedStocks).map((key) => {
                return <WatchListEntry stock={mappedStocks[key]} key={key} />;
              })}
            </tbody>
          </Table>
        </CardBody>
      </Card>
    </>
  );
};

WatchList.propTypes = {
  mappedStocks: PropTypes.object.isRequired,
  addToWatchlist: PropTypes.func.isRequired,
  loading: PropTypes.bool.isRequired,
  getStockStatsForAllStocks: PropTypes.func.isRequired,
  getStockStats: PropTypes.func.isRequired,
  getWatchlist: PropTypes.func.isRequired,
  refreshCurrentForWatchlist: PropTypes.func.isRequired,
};

const mapStateToProps = (state) => ({
  mappedStocks: state.stocks.mappedStocks,
  loading: state.stocks.mappedStocksLoading,
});

export default connect(mapStateToProps, {
  addToWatchlist,
  getWatchlist,
  getStockStats,
  getStockStatsForAllStocks,
  refreshCurrentForWatchlist,
})(WatchList);
