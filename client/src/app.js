import React from 'react';
import ReactDOM from 'react-dom';

import configureStore from './store';
import { Provider } from 'react-redux';

import Routes from './components/routes/Routes';
import HomePage from './components/layout/HomePage';

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
        <Route exact path="/" component={HomePage} />
        <Route component={Routes} />
      </Switch>
    </Router>
  </Provider>
);

ReactDOM.render(jsx, document.getElementById('app'));
