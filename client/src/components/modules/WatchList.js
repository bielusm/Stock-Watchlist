import React from 'react';
import { Table, Card, CardHeader, CardBody } from 'reactstrap';
import WatchListEntry from './WatchListEntry';
import { ibm, AAPL } from '../../../tests/fixtures/stats';
export const WatchList = () => {
  return (
    <>
      <Card>
        <CardHeader tag="h4"> WatchList </CardHeader>
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
            </tbody>
          </Table>
        </CardBody>
      </Card>
    </>
  );
};

export default WatchList;
