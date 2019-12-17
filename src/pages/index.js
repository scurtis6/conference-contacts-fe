import React, { Fragment } from 'react';
import { Router } from '@reach/router';

import NavBar from '../containers/navbar';
import Profile from './profile';
import Settings from './settings';
import Home from './home';
import ScanQr from './scanqr';

// const Home = () => <p>Home Page</p>;

export default function Pages() {
  return (
    <Fragment>
      <NavBar />
      <Router>
        <Home path="/" />
        <Profile path="profile" />
        <Settings path="settings" />
        <ScanQr path="scanqr" />
      </Router>
    </Fragment>
  );
}
