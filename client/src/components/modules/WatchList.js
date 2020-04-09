import React, { useState, useEffect } from 'react';
import { Table, Card, CardHeader, CardBody, Input, Button } from 'reactstrap';
import WatchListEntry from './WatchListEntry';
import {
  addToWatchlist,
  getWatchlist,
  getStockStats,
} from '../../actions/stocks';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';

export const WatchList = ({
  mappedStocks,
  addToWatchlist,
  getWatchlist,
  getStockStats,
  loading,
}) => {
  useEffect(() => {
    getWatchlist();
  }, []);

  useEffect(() => {
    const keys = Object.keys(mappedStocks);
    if (!loading && keys.length !== 0) {
      for (const key of keys) {
        getStockStats(mappedStocks[key].symbol, false);
      }
    }
  }, [loading]);

  const [newSymbol, setNewSymbol] = useState('');

  const onChange = (e) => {
    setNewSymbol(e.target.value.trim());
  };

  const onClick = (e) => {
    if (newSymbol) {
      addToWatchlist(newSymbol);
      getStockStats(newSymbol, false);
    }
  };

  return (
    <>
      <Card>
        <CardHeader>
          <h4 className="d-inline-block">WatchList</h4>
          <div className="inputSection float-right d-inline-block d-flex justify-content-end">
            <Input
              data-testid="symbolInput"
              value={newSymbol}
              className="d-inline-block w-75"
              onChange={(e) => onChange(e)}
            ></Input>
            <Button
              data-testid="symbolInputBtn"
              color="link"
              onClick={(e) => onClick(e)}
            >
              <i className="fas fa-plus fa-lg"></i>
            </Button>
          </div>
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
};

const mapStateToProps = (state) => ({
  mappedStocks: state.stocks.mappedStocks,
  loading: state.stocks.mappedStocksLoading,
});

export default connect(mapStateToProps, {
  addToWatchlist,
  getWatchlist,
  getStockStats,
})(WatchList);
