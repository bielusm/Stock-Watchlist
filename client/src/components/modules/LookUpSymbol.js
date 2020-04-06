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

export const LookUpSymbol = ({ getStockStats, stocks }) => {
  const [symbol, setSymbol] = useState('');

  const onChange = (e) => {
    setSymbol(e.target.value);
  };

  const onSubmit = (e) => {
    e.preventDefault();
    getStockStats(symbol);
  };

  return (
    <>
      <Card>
        <CardHeader tag="h4">Look Up Stock By Symbol</CardHeader>
        <CardBody>
          <Form onSubmit={(e) => onSubmit(e)}>
            <FormGroup>
              <Label for="symbol">Symbol</Label>
              <Input
                id="symbol"
                type="text"
                name="symbol"
                required
                value={symbol}
                className="symbol"
                onChange={(e) => onChange(e)}
              ></Input>
            </FormGroup>
            <FormGroup>
              <Button>Look Up Stock</Button>
            </FormGroup>
          </Form>
          {stocks[symbol] && (
            <Table>
              <thead>
                <tr>
                  <th>Current Value</th>
                  <th>52 Week Max</th>
                  <th>52 Week Min</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>{stocks[symbol].currentValue}</td>
                  <td>{stocks[symbol].stats.highest}</td>
                  <td>{stocks[symbol].stats.lowest}</td>
                </tr>
              </tbody>
            </Table>
          )}
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
