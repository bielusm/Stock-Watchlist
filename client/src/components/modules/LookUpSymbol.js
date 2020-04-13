import React, { useState } from 'react';
import {
  Card,
  CardBody,
  CardHeader,
  Label,
  Form,
  FormGroup,
  Input,
  Button,
  Table,
} from 'reactstrap';
import { getStockStats } from '../../actions/stocks';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import WatchListEntry from './WatchListEntry';
import AddStock from './AddStock';

export const LookUpSymbol = ({ getStockStats, stocks }) => {
  const [symbol, setSymbol] = useState('');

  const addStock = (newSymbol) => {
    setSymbol(newSymbol);
    getStockStats(newSymbol);
  };

  return (
    <>
      <Card className="my-3">
        <CardHeader>
          <h4 className="d-inline-block">Look Up Stock By Symbol</h4>
          <AddStock addStock={addStock} />
        </CardHeader>
        <CardBody className="p-0">
          <Table styles={{ minHeight: '10px' }}>
            <thead>
              <tr>
                <th>Symbol</th>
                <th>Current Value</th>
                <th>52 Week Max</th>
                <th>% Change</th>
                <th>52 Week Min</th>
                <th>% Change</th>
              </tr>
            </thead>
            <tbody>
              {stocks[symbol] && (
                <WatchListEntry stock={stocks[symbol]} deleteBtn={false} />
              )}
            </tbody>
          </Table>
        </CardBody>
      </Card>
    </>
  );
};

LookUpSymbol.propTypes = {
  getStockStats: PropTypes.func.isRequired,
  stocks: PropTypes.object.isRequired,
};

const mapStateToProps = (state) => ({
  stocks: state.stocks.miscStocks,
});
export default connect(mapStateToProps, { getStockStats })(LookUpSymbol);
