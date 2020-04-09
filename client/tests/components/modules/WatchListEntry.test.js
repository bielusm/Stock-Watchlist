import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { WatchListEntry } from '../../../src/components/modules/WatchListEntry';
import { Table } from 'reactstrap';

const stock = {
  symbol: 'bmo',
  currentValue: 30,
  stats: { highest: 40, lowest: 10 },
};
const deleteFromWatchlist = jest.fn();

beforeEach(() => {
  jest.resetAllMocks();
});

describe('WatchListEntry Tests', () => {
  test('should calculate new value on changed high/low', () => {
    render(
      <Table>
        <tbody>
          <WatchListEntry
            stock={stock}
            deleteFromWatchlist={deleteFromWatchlist}
          />
        </tbody>
      </Table>
    );
    const highChange = screen.getByTestId('highChange');
    expect(highChange).toHaveTextContent(
      ((stock.stats.highest / stock.currentValue) * 100 - 100).toFixed(2) + '%'
    );
    fireEvent.change(screen.getByTestId('highValInput'), {
      target: { value: 50 },
    });
    expect(highChange).toHaveTextContent(
      ((50 / stock.currentValue) * 100 - 100).toFixed(2) + '%'
    );

    const lowChange = screen.getByTestId('lowChange');
    expect(lowChange).toHaveTextContent(
      ((stock.currentValue / stock.stats.lowest) * 100 - 100).toFixed(2) + '%'
    );
    fireEvent.change(screen.getByTestId('lowValInput'), {
      target: { value: 5 },
    });
    expect(lowChange).toHaveTextContent(
      ((stock.currentValue / 5) * 100 - 100).toFixed(2) + '%'
    );
  });

  test('should call deleteFromWatchList', () => {
    render(
      <Table>
        <tbody>
          <WatchListEntry
            stock={stock}
            deleteFromWatchlist={deleteFromWatchlist}
          />
        </tbody>
      </Table>
    );

    const deleteBtn = screen.getByTestId('deleteBtn');
    fireEvent.click(deleteBtn);
    expect(deleteFromWatchlist).toHaveBeenCalledWith(stock.symbol);
    expect(deleteFromWatchlist).toHaveBeenCalledTimes(1);
  });
});
