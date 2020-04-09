import React, { lazy } from 'react';
import { Route, Switch } from 'react-router-dom';

import TopNav from '../layout/TopNav';
const Login = lazy(() => import('../forms/Login'));
const Register = lazy(() => import('../forms/Register'));
import Alerts from '../layout/Alerts';
const Dashboard = lazy(() => import('../layout/Dashboard'));
import PrivateRoute from './PrivateRoute';

import { Container } from 'reactstrap';

const Routes = () => {
  return (
    <>
      <TopNav />
      <Container className="pt-2 mx-auto">
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
