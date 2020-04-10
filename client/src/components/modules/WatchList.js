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
            <InputGroup className="w-50">
              <InputGroupAddon addonType="prepend">
                <Input type="select">
                  <option>TSE</option>
                  <option>NYSE</option>
                </Input>
              </InputGroupAddon>
              <Input
                placeholder="symbol"
                data-testid="symbolInput"
                value={newSymbol}
                className="d-inline-block"
                onChange={(e) => onChange(e)}
              ></Input>
            </InputGroup>
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
