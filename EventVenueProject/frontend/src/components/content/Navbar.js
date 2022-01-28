import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faAlignLeft,
  faLongArrowAltUp,
} from "@fortawesome/free-solid-svg-icons";
import { Navbar, Button, Nav, ListGroupItem } from "react-bootstrap";
import { withRouter } from "react-router-dom";

class NavBar extends React.Component {
  logout() {
    const { history } = this.props;
    localStorage.removeItem("token");
    history.push("/login");
  }
  render() {
    return (
      <Navbar
        bg="light"
        className="navbar shadow-sm p-3 mb-5 bg-white rounded"
        expand
      >
        <Button variant="outline-info" onClick={this.props.toggle}>
          <FontAwesomeIcon icon={faAlignLeft} />
        </Button>
        <Navbar.Toggle aria-controls="responsive-navbar-nav" />
        <Navbar.Collapse id="responsive-navbar-nav">
          <Nav
            className="ml-auto p-2"
            style={{ marginLeft: "auto", marginRight: 0 }}
            navbar
          >
            <Nav.Link onClick={() => this.logout()}>Logout</Nav.Link>
          </Nav>
        </Navbar.Collapse>
      </Navbar>
    );
  }
}

export default withRouter(NavBar);
