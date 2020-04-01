import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Alert } from 'reactstrap';

const Alerts = ({ alerts }) => {
  return (
    <>
      {alerts.map(alert => (
        <Alert key={alert.id} color={alert.color}>
          {alert.message}
        </Alert>
      ))}
    </>
  );
};

Alerts.propTypes = {
  alerts: PropTypes.array.isRequired
};

const mapStateToProps = state => ({
  alerts: state.alert.alerts
});

export default connect(mapStateToProps)(Alerts);
