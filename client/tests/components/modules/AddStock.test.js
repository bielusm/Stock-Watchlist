import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import AddStock from '../../../src/components/modules/AddStock';

beforeEach(() => {
  jest.resetAllMocks();
});

describe('AddStock tests', () => {
  test('should call add to watchlist', () => {
    const value = 'ibm';
    const addStock = jest.fn();
    render(<AddStock addStock={addStock} />);

    const input = screen.getByPlaceholderText('symbol');
    fireEvent.change(input, { target: { value } });

    const btn = screen.getByTestId('symbolInputBtn');
    fireEvent.click(btn);

    expect(addStock).toHaveBeenLastCalledWith('TSE:' + value);
    const select = screen.getByDisplayValue('TSE');
    fireEvent.change(select, { target: { value: 'NYSE' } });

    fireEvent.change(input, { target: { value } });
    fireEvent.click(btn);

    expect(addStock).toHaveBeenLastCalledWith('NYSE:' + value);
  });
});
