import React, { useState } from 'react';
import { Table, Card, CardHeader, CardBody, Input, Button } from 'reactstrap';
import WatchListEntry from './WatchListEntry';
import { ibm, AAPL } from '../../../tests/fixtures/stats';
export const WatchList = () => {
  const [newSymbol, setNewSymbol] = useState('');

  const onChange = (e) => {
    setNewSymbol(e.target.value);
  };

  return (
    <>
      <Card>
        <CardHeader>
          <h4 className="d-inline-block">WatchList</h4>
          <div className="inputSection float-right d-inline-block d-flex justify-content-end">
            <Input
              value={newSymbol}
              className="d-inline-block w-75"
              onChange={(e) => onChange(e)}
            ></Input>
            <Button color="link">
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
                <th>52 Week Min</th>
                <th>Change</th>
                <th>Delete</th>
              </tr>
            </thead>
            <tbody>
              <WatchListEntry stock={ibm} />
              <WatchListEntry stock={AAPL} />
              <WatchListEntry stock={{ symbol: 'aaa', loading: true }} />
            </tbody>
          </Table>
        </CardBody>
      </Card>
    </>
  );
};

export default WatchList;
