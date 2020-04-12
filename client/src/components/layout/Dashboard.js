import React from 'react';
import LookUpSymbol from '../modules/LookUpSymbol';
import WatchList from '../modules/WatchList.js';

import Idle from 'react-idle';
import { connect } from 'react-redux';
import { logout } from '../../actions/auth';

export const Dashboard = ({ logout }) => {
  return (
    <>
      <Idle
        timeout={30 * 60 * 1000}
        onChange={({ idle }) => {
          if (idle) logout();
        }}
      />
      <WatchList />
      <LookUpSymbol />
    </>
  );
};

export default connect(undefined, { logout })(Dashboard);
