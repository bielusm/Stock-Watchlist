import React from 'react';
import { Table, Card, CardHeader, CardBody } from 'reactstrap';
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
                <th></th>
              </tr>
            </thead>
            <tbody></tbody>
          </Table>
        </CardBody>
      </Card>
    </>
  );
};

export default WatchList;
