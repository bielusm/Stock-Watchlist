import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { Input, Button, Spinner } from 'reactstrap';
import { connect } from 'react-redux';
import { deleteFromWatchlist } from '../../actions/stocks';

export const WatchListEntry = ({
  stock,
  deleteFromWatchlist,
  deleteBtn = true,
}) => {
  const { loading, symbol, invalid } = stock;
  const [high, setHigh] = useState(0);
  const [low, setLow] = useState(0);

  let highChange =
    high !== ''
      ? ((high / stock.currentValue) * 100 - 100).toFixed(2)
      : ((stock.stats.highest / stock.currentValue) * 100 - 100).toFixed(2);
  let lowChange =
    low !== ''
      ? ((stock.currentValue / low) * 100 - 100).toFixed(2)
      : ((stock.currentValue / stock.stats.lowest) * 100 - 100).toFixed(2);

  const changeHigh = (e) => {
    setHigh(e.target.value);
  };

  const changeLow = (e) => {
    setLow(e.target.value);
  };

  useEffect(() => {
    if (!loading && !invalid) {
      setHigh(stock.stats.highest);
      setLow(stock.stats.lowest);
    }
  }, [loading]);
  const deleteSymbol = (e) => {
    deleteFromWatchlist(symbol);
  };

  if (loading || invalid)
    return (
      <tr>
        <th>{symbol}</th>
        <th>
          {loading ? <Spinner color="primary" /> : <>Error symbol invalid</>}
        </th>
        <th></th>
        <th></th>
        <th></th>
        <th></th>
        {deleteBtn && (
          <th>
            <Button color="link" onClick={(e) => deleteSymbol(e)}>
              <i className="fas fa-trash fa-lg"></i>
            </Button>
          </th>
        )}
      </tr>
    );

  const { currentValue } = stock;
  return (
    <>
      <tr>
        <th>{symbol}</th>
        <th>{currentValue}</th>
        <th>
          <Input
            data-testid="highValInput"
            type="number"
            placeholder={stock.stats.highest}
            value={high}
            onChange={(e) => changeHigh(e)}
          ></Input>
        </th>
        <th data-testid="highChange">{highChange}%</th>
        <th>
          <Input
            data-testid="lowValInput"
            type="number"
            value={low}
            onChange={(e) => changeLow(e)}
            placeholder={stock.stats.lowest}
          ></Input>
        </th>
        <th data-testid="lowChange">{lowChange}%</th>
        {deleteBtn && (
          <th>
            <Button
              data-testid="deleteBtn"
              color="link"
              onClick={(e) => deleteSymbol(e)}
            >
              <i className="fas fa-trash fa-lg"></i>
            </Button>
          </th>
        )}
      </tr>
    </>
  );
};

WatchListEntry.propTypes = {
  stock: PropTypes.object.isRequired,
};

export default connect(undefined, { deleteFromWatchlist })(WatchListEntry);
