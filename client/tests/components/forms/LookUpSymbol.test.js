import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { LookUpSymbol } from '../../../src/components/forms/LookUpSymbol';

describe('LookUpSymbol tests', () => {
  let getStockStats = jest.fn();
  let stocks = {};
  const value = 'ibm';
  beforeAll(() => {
    render(<LookUpSymbol getStockStats={getStockStats} stocks={stocks} />);
  });

  it('should submit form', () => {
    const input = screen.getByLabelText('Symbol');
    fireEvent.change(input, { target: { value } });

    const submitBtn = screen.getByText('Look Up Stock');
    fireEvent.click(submitBtn, { preventDefault: () => {} });
    expect(getStockStats).toHaveBeenCalledWith(value);
  });
});
