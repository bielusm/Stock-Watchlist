import React, { useState, useEffect } from 'react';
import {
  Table,
  Card,
  CardHeader,
  CardBody,
  Input,
  Button,
  InputGroup,
  InputGroupAddon,
} from 'reactstrap';
import WatchListEntry from './WatchListEntry';
import {
  addToWatchlist,
  getWatchlist,
  getStockStats,
  getStockStatsForAllStocks,
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
  loading,
}) => {
  useEffect(() => {
    getWatchlist();
  }, []);

  useEffect(() => {
    if (!loading) {
      getStockStatsForAllStocks(mappedStocks);
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
          <Table>
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
              {Object.keys(mappedStocks).map((key, index) => {
                return <WatchListEntry stock={mappedStocks[key]} key={index} />;
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
})(WatchList);
