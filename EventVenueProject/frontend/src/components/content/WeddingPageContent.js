import React, { useEffect } from "react";
import classNames from "classnames";
import { Container, Button } from "react-bootstrap";
import axios from "axios";
import NavBar from "./Navbar";
import {Link} from "react-router-dom";

var backendRoot = "https://lonelyweddings.herokuapp.com";
//var backendRoot = "http://localhost:5000"


class WeddingPageContent extends React.Component {
  constructor(props){
    super(props);
    this.state = {
          description: "",
          date: "",
          bookmarkButton: "",
          attendButton: "",
          hostFirst: "",
          hostLast: "",
          venueCity: "",
          venueState: "",
          venueStreet: "",
          venueZipcode: "",
          vid: ""
    }
    this.getBookmarkStatus = this.getBookmarkStatus.bind(this);
    this.toggleBookmark = this.toggleBookmark.bind(this);
    this.getAttendanceStatus = this.getAttendanceStatus.bind(this);
    this.toggleAttendance = this.toggleAttendance.bind(this);

  }
  getBookmarkStatus() {
    var self = this;
    axios
      .get(backendRoot + `/api/bookmarkwedding/${self.props.wid}`, {
        headers: {
          Authorization: `${localStorage.getItem("token")}`,
        },
      })
      .then(function (response) {
       if (response.data.status === 'true'){
         let newState = Object.assign({}, self.state)
         newState.bookmarkButton = "Unbookmark"
         self.setState(newState)
       }
       else{
        let newState = Object.assign({}, self.state)
        newState.bookmarkButton = "Bookmark"
        self.setState(newState)
       };
      })
      .catch(function (error) {
        console.log(error);
      });
  }

  toggleBookmark() {
    var self = this;
    axios
      .post(backendRoot + `/api/bookmarkwedding/${self.props.wid}`, {}, {
        headers: {
          Authorization: `${localStorage.getItem("token")}`
        },
      })
      .then(function (response) {
        if (response.data.message === "Wedding bookmarked") {
          let newState = Object.assign({}, self.state)
         newState.bookmarkButton = "Unbookmark"
         self.setState(newState)
        }
        else if (response.data.message === "Wedding unbookmarked"){
          let newState = Object.assign({}, self.state)
         newState.bookmarkButton = "Bookmark"
         self.setState(newState)
        }
        //console.log("Button text: " + self.state.bookmarkButton)
      })
      .catch(function (error) {
        console.log(error);
      });
  }

  getAttendanceStatus() {
    var self = this;
    axios
      .get(backendRoot + `/api/wedding/${self.props.wid}/guests/status`, {
        headers: {
          Authorization: `${localStorage.getItem("token")}`,
        },
      })
      .then(function (response) {
       if (response.data.status === 'true'){
         let newState = Object.assign({}, self.state)
         newState.attendButton = "Unattend"
         self.setState(newState)
       }
       else{
        let newState = Object.assign({}, self.state)
        newState.attendButton = "Attend"
        self.setState(newState)
       };
      })
      .catch(function (error) {
        console.log(error);
      });
  }

  toggleAttendance() {
    var self = this;
    axios
      .post(backendRoot + `/api/togglersvp/${self.props.wid}`, {}, {
        headers: {
          Authorization: `${localStorage.getItem("token")}`
        },
      })
      .then(function (response) {
        if (response.data.message === "RSVP") {
          let newState = Object.assign({}, self.state)
         newState.attendButton = "Unattend"
         self.setState(newState)
        }
        else if (response.data.message === "rescind RSVP"){
          let newState = Object.assign({}, self.state)
         newState.attendButton = "Attend"
         self.setState(newState)
        }
        //console.log("Button text: " + self.state.bookmarkButton)
      })
      .catch(function (error) {
        console.log(error);
      });
  }


  componentDidMount() {
    var self = this;
    axios
      .get(backendRoot + `/api/wedding/${this.props.wid}`, {
        headers: {
          Authorization: `${localStorage.getItem("token")}`,
        },
      })
      .then(function (response) {
        console.log(response.data)
        self.setState({
          description: response.data.wedding.description,
          date: response.data.wedding.date,
          bookmarkButton: self.state.bookmarkButton,
          attendButton: self.state.attendButton,
          hostFirst: response.data.user.first_name,
          hostLast: response.data.user.last_name,
          venueCity: response.data.venue.city,
          venueState: response.data.venue.state,
          venueStreet: response.data.venue.street_address,
          venueZipcode: response.data.venue.zipcode,
          vid: response.data.venue.vid
        })
        console.log(self.state)
      })
      .catch(function (error) {
        console.log(error);
      });
    this.getBookmarkStatus()
    this.getAttendanceStatus()
  }


  render() {
    return (
      <Container
        fluid
        className={classNames("content", { "is-open": this.props.isOpen })}
      >
        <NavBar toggle={this.props.toggle} />
        <h2>{ this.state.hostFirst } { this.state.hostLast}'s Wedding</h2>
        <div style={{float: "right;"}} >
          <Button 
            variant="primary" 
            onClick={this.toggleBookmark}>
            {this.state.bookmarkButton}
          </Button> <br />
        </div>
        <div>
          <p>{ this.state.description }</p>
          <p>Occurring on {this.state.date} at {this.state.venueStreet} {this.state.venueCity}, {this.state.venueState} {this.state.venueZipcode}.</p>
          <Link to={`/venue/${this.state.vid}`}>View Venue</Link>
          </div> <br />
        <div>
            <Button
                variant="primary"
                onClick={this.toggleAttendance}>
                {this.state.attendButton}
            </Button>
        </div>

      </Container>
    );
  }
}

export default WeddingPageContent;

// very important comment