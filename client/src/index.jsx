import React from 'react';
import ReactDOM from 'react-dom/client';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import store from './store';
import { DateProvider } from './context/DateContext';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const queryClient = new QueryClient();

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <Provider store={store}>
      <BrowserRouter>
        <DateProvider>
          <QueryClientProvider client={queryClient}>
            <App />
          </QueryClientProvider>
        </DateProvider>
      </BrowserRouter>
    </Provider>
  </React.StrictMode>
);