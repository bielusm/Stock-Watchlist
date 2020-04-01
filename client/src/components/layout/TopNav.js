import React from 'react';
import PropTypes from 'prop-types';
import { Navbar, NavbarBrand, NavItem, NavLink, Nav, Button } from 'reactstrap';
import { Link, withRouter } from 'react-router-dom';
import { connect } from 'react-redux';
import { logout } from '../../actions/auth';

export const TopNav = ({ authenticated, logout }) => {
  const authLinks = (
    <>
      <NavItem>
        <NavLink tag={Link} to="/dashboard">
          Dashboard
        </NavLink>
      </NavItem>
      <NavItem>
        <Button color="danger" onClick={logout}>
          Logout <i className="fas fa-sign-out-alt"></i>
        </Button>
      </NavItem>
    </>
  );

  const guestLinks = (
    <>
      <NavItem>
        <NavLink tag={Link} to="/register">
          Register
        </NavLink>
      </NavItem>
      <NavItem>
        <NavLink tag={Link} to="/login">
          Login
        </NavLink>
      </NavItem>
    </>
  );

  return (
    <Navbar color="light">
      <NavbarBrand>Stock Watchlist / Trends</NavbarBrand>
      <Nav>{authenticated ? authLinks : guestLinks}</Nav>
    </Navbar>
  );
};

TopNav.propTypes = {
  authenticated: PropTypes.bool.isRequired
};

const mapStateToProps = state => ({
  authenticated: state.user.authenticated,
  logout: PropTypes.func.isRequired
});

export default connect(mapStateToProps, { logout })(withRouter(TopNav));
