import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { NavLink } from "react-router-dom";
import { useLocation } from "react-router-dom";

import {
  faHome,
  faBriefcase,
  faPaperPlane,
  faQuestion,
  faImage,
  faCopy,
  faTimes,
  faUser
} from "@fortawesome/free-solid-svg-icons";
import { Nav, Button } from "react-bootstrap";
import classNames from "classnames";

class SideBar extends React.Component {
  render() {
    const { location } = this.props;

    return (
      <div className={classNames("sidebar", { "is-open": this.props.isOpen })}>
        <div className="sidebar-header">
          <Button
            variant="link"
            onClick={this.props.toggle}
            style={{ color: "#fff" }}
            className="mt-4"
          >
            <FontAwesomeIcon icon={faTimes} pull="right" size="xs" />
          </Button>
          <h3>Lonely Weddings</h3>
        </div>

        <Nav className="flex-column pt-2">
          <p className="ml-3">Features</p>

          <Nav.Item
            className={window.location.pathname === "/HomePage" ? "active" : ""}
          >
            <Nav.Link href="/#/HomePage">
              <FontAwesomeIcon icon={faHome} className="mr-2" />
              Home
            </Nav.Link>
          </Nav.Item>

          <Nav.Item
            className={window.location.pathname === "/user" ? "active" : ""}
          >
            <Nav.Link href="/#/user">
              <FontAwesomeIcon icon={faUser} className="mr-2" />
              My Profile
            </Nav.Link>
          </Nav.Item>

          <Nav.Item
            className={window.location.pathname === "/AddVenue" ? "active" : ""}
          >          
            <Nav.Link href="/#/AddVenue">
              <FontAwesomeIcon icon={faBriefcase} className="mr-2" />
              Add Venue
            </Nav.Link>
          </Nav.Item>

          <Nav.Item
            className={
              window.location.pathname === "/VenueManagement" ? "active" : ""
            }
          >
            <Nav.Link href="/#/VenueManagement">
              <FontAwesomeIcon icon={faImage} className="mr-2" />
              Venue Management
            </Nav.Link>
          </Nav.Item>

          <Nav.Item
            className={window.location.pathname === "/Contact" ? "active" : ""}
          >
            <Nav.Link href="/#/Contact">
              <FontAwesomeIcon icon={faPaperPlane} className="mr-2" />
              Contact
            </Nav.Link>
          </Nav.Item>
        </Nav>
      </div>
    );
  }
}

export default SideBar;
