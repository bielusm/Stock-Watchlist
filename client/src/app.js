import React, { Suspense, lazy } from 'react';
import ReactDOM from 'react-dom';

import configureStore from './store';
import { Provider } from 'react-redux';

import Routes from './components/routes/Routes';
const HomePage = lazy(() => import('./components/layout/HomePage'));

import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';

import 'bootstrap/dist/css/bootstrap.css';
import '../docs/assets/styles.css';

import { setToken } from './actions/auth';

const store = configureStore;

const token = window.localStorage.getItem('token');
if (token) store.dispatch(setToken(token));

const jsx = (
  <Provider store={store}>
    <Router>
      <Switch>
        <Suspense fallback={<>Loading...</>}>
          <Route exact path="/" component={HomePage} />
          <Route component={Routes} />
        </Suspense>
      </Switch>
    </Router>
  </Provider>
);

ReactDOM.render(jsx, document.getElementById('app'));
