import React from 'react';
import PropTypes from 'prop-types';

export const WatchListEntry = (stock) => {
  return (
    <>
      <tr>
        <th>Symbol</th>
        <th>Current Value</th>
        <th>52 Week Max</th>
        <th>52 Week Min</th>
        <th>Delete</th>
      </tr>
    </>
  );
};

WatchListEntry.propTypes = {
  stock: PropTypes.object.isRequired,
};

export default WatchListEntry;
