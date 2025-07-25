import React from 'react';
import { render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import { store } from './app/store';
import App from './App';

test('renders learn react link', () => {
  render(
    <Provider store={store}>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </Provider>
  );
  
  // Update this test to match actual content in your app
  const appElement = screen.getByTestId('app');
  expect(appElement).toBeInTheDocument();
});
