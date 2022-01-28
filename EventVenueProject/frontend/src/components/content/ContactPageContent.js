import React from "react";
import Form from "react-bootstrap/Form";
import classNames from "classnames";
import { Container, Button } from "react-bootstrap";
import NavBar from "./Navbar";
import axios from "axios";
import { withRouter } from "react-router-dom";
import "../../App.css";

class ContactPageContent extends React.Component {
  render() {
    return (
      <Container
        fluid
        className={classNames("content", { "is-open": this.props.isOpen })}
      >
        <NavBar toggle={this.props.toggle} />
        <Container>
          <h3>Contact Details: </h3>
          <div>Ryan Oostland : ryoost@iu.edu</div>
          <div>Isira Perera : iaperera@iu.edu</div>
          <div>Paritosh Sabade : psabade@iu.edu</div>
        </Container>
      </Container>
    );
  }
}
export default withRouter(ContactPageContent);
