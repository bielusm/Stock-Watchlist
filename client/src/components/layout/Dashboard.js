import React from 'react';
import LookUpSymbol from '../modules/LookUpSymbol';
import WatchList from '../modules/WatchList.js';

export const Dashboard = (props) => {
  return (
    <>
      <WatchList />
      <LookUpSymbol />
    </>
  );
};

export default Dashboard;
