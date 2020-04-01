import React from 'react';
import { Route, Switch } from 'react-router-dom';

import TopNav from '../layout/TopNav';
import Login from '../forms/Login';
import Register from '../forms/Register';
import Alerts from '../layout/Alerts';
import Dashboard from '../layout/Dashboard';
import PrivateRoute from './PrivateRoute';

import { Container } from 'reactstrap';

const Routes = () => {
  return (
    <>
      <TopNav />
      <Container className="pt-2">
        <Alerts />
        <Switch>
          <Route exact path="/login" component={Login} />
          <Route exact path="/register" component={Register} />
          <PrivateRoute
            exact
            path={['/', '/dashboard']}
            component={Dashboard}
          />
        </Switch>
      </Container>
    </>
  );
};

export default Routes;
