import React, { useState } from 'react';
import { InputGroup, InputGroupAddon, Button, Input } from 'reactstrap';
import PropTypes from 'prop-types';
const AddStock = ({ addStock }) => {
  const [newSymbol, setNewSymbol] = useState('');
  const [exchange, setExchange] = useState('TSE');

  const onChange = (e) => {
    setNewSymbol(e.target.value.trim());
  };

  const onClick = () => {
    if (newSymbol) {
      const symbol = exchange + ':' + newSymbol;
      addStock(symbol);
    }
  };

  return (
    <div className="inputSection float-right d-inline-block d-flex justify-content-end">
      <InputGroup className="w-50">
        <InputGroupAddon addonType="prepend">
          <Input
            type="select"
            value={exchange}
            onChange={(e) => setExchange(e.target.value)}
          >
            <option value="TSE">TSE</option>
            <option value="NYSE">NYSE</option>
          </Input>
        </InputGroupAddon>
        <Input
          placeholder="symbol"
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
  );
};

AddStock.propTypes = {
  addStock: PropTypes.func.isRequired,
};

export default AddStock;
