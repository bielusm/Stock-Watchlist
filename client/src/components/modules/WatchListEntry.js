import React from 'react';
import PropTypes from 'prop-types';
import { Input, Button } from 'reactstrap';

export const WatchListEntry = ({ stock }) => {
  const { loading, symbol } = stock;
  if (loading)
    return (
      <tr>
        <th>{symbol}</th>
        <th>Loading</th>
        <th></th>
        <th></th>
        <th></th>
        <th></th>
      </tr>
    );

  const {
    currentValue,
    stats: { highest, lowest },
  } = stock;
  return (
    <>
      <tr>
        <th>{symbol}</th>
        <th>{currentValue}</th>
        <th>
          <Input placeholder={highest}></Input>
        </th>
        <th>
          <Input placeholder={lowest}></Input>
        </th>
        <th>20%</th>
        <th>
          <Button color="link">
            <i className="fas fa-trash fa-lg"></i>
          </Button>
        </th>
      </tr>
    </>
  );
};

WatchListEntry.propTypes = {
  stock: PropTypes.object.isRequired,
};

export default WatchListEntry;
