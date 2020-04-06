import React from 'react';
import PropTypes from 'prop-types';
import { Input, Button } from 'reactstrap';

export const WatchListEntry = ({
  stock: {
    symbol,
    currentValue,
    stats: { highest, lowest },
  },
}) => {
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
