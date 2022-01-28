import "./App.css";
import React, { useEffect, useState } from "react";
import axios from "axios";

import Signup from "./Signup";
import { Container } from "react-bootstrap";
import { HashRouter as Router, Switch, Route } from "react-router-dom";
import Login from "./Login";
import ForgotPassword from "./ForgotPassword";
import HomePage from "./HomePage";
import AddVenuePage from "./AddVenuePage";
import PrivateRoute from "./PrivateRoute";
import AddWedding from "./components/content/AddWedding";
import AddWeddingPage from "./AddWeddingPage";
import VenueManagement from "./VenueManagement";
import AddContactPage from "./AddContactPage";
import WeddingPage from "./WeddingPage";
import VenuePage from "./VenuePage";
import UserProfilePage from "./UserProfilePage";

var backendRoot = "https://lonelyweddings.herokuapp.com";
//var backendRoot = "http://localhost:5000"

function App() {
  const isAuthenticated = localStorage.getItem("token");

  return (
    <Router>
      <Switch>
        <Route path="/login" component={Login} />
        <Route path="/signup" component={Signup} />
        <Route path="/forgot-password" component={ForgotPassword} />
        <PrivateRoute path="/HomePage" component={HomePage} />
        <PrivateRoute path="/AddVenue" component={AddVenuePage} />
        <PrivateRoute path="/Reservations/:rid" component={AddWeddingPage} />
        <PrivateRoute path="/VenueManagement" component={VenueManagement} />
        <PrivateRoute path="/Contact" component={AddContactPage} />
        <PrivateRoute path="/wedding/:wid" component={WeddingPage} />
        <PrivateRoute path="/venue/:vid" component={VenuePage} />
        <PrivateRoute path="/user" component={UserProfilePage} />
      </Switch>
    </Router>
  );
}

export default App;
