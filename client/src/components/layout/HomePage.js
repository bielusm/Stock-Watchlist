import React from 'react';
import { Card, CardHeader, CardBody, Button } from 'reactstrap';
import { Redirect } from 'react-router-dom';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';

const HomePage = ({ history, authenticated }) => {
  if (authenticated) return <Redirect to="/dashboard" />;

  return (
    <>
      <div
        style={{
          position: 'fixed',
          left: '0',
          top: '0',
          width: '100%',
          height: '100%',
          backgroundImage: "url('./')",
          filter: 'grayscale(100%)',
        }}
      ></div>
      <Card
        className="m-auto"
        style={{
          position: 'fixed',
          left: '50%',
          top: '50%',
          transform: 'translate(-50%, -50%)',
          border: '1px solid black',
        }}
      >
        <CardHeader tag="h4">Stock Watchlist / Trends</CardHeader>
        <CardBody>
          <div className="mx-auto">
            <Button
              color="primary"
              block
              size="lg"
              className="d-block mx-auto my-2"
              onClick={() => {
                history.push('/register');
              }}
            >
              Register
            </Button>
            <Button
              block
              size="lg"
              color="primary"
              className="d-block mx-auto my-2"
              onClick={() => {
                history.push('/login');
              }}
            >
              Login
            </Button>
          </div>
        </CardBody>
      </Card>
    </>
  );
};

const mapStateToProps = (state) => ({
  authenticated: state.user.authenticated,
});

HomePage.propTypes = {
  authenticated: PropTypes.bool.isRequired,
};

export default connect(mapStateToProps)(HomePage);
