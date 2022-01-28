import React, { useEffect } from "react";
import classNames from "classnames";
import { Container, Button } from "react-bootstrap";
import axios from "axios";
import NavBar from "./Navbar";
import VenueReserver from "./VenueReserver"
import { MapContainer } from "./MapContainer";



var backendRoot = "https://lonelyweddings.herokuapp.com";
//var backendRoot = "http://localhost:5000"


class VenuePageContent extends React.Component {
  constructor(props){
    super(props);
    this.state = {
      name: "",
      city: "",
      state: "",
      street_address: "",
      zipcode: 0,
      description: "",
      owner: "",
      pictures: [],
      bookmarkButton: "Bookmark"
    }
    this.getBookmarkStatus = this.getBookmarkStatus.bind(this);
    this.toggleBookmark = this.toggleBookmark.bind(this);

  }
  getBookmarkStatus() {
    var self = this;
    axios
      .get(backendRoot + `/api/bookmarkvenue/${self.props.vid}`, {
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
      .post(backendRoot + `/api/bookmarkvenue/${self.props.vid}`, {}, {
        headers: {
          Authorization: `${localStorage.getItem("token")}`
        },
      })
      .then(function (response) {
        if (response.data.message === "Venue bookmarked") {
          let newState = Object.assign({}, self.state)
         newState.bookmarkButton = "Unbookmark"
         self.setState(newState)
        }
        else if (response.data.message === "Venue unbookmarked"){
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

  componentDidMount() {
    var self = this;
    axios
      .get(backendRoot + `/api/venue/${this.props.vid}`, {
        headers: {
          Authorization: `${localStorage.getItem("token")}`,
        },
      })
      .then(function (response) {
        self.setState({
          name: response.data.venue.name,
          city: response.data.venue.city,
          state: response.data.venue.state,
          street_address: response.data.venue.street_address,
          zipcode: response.data.venue.zipcode,
          description: response.data.venue.description,
          owner: response.data.venue.owner,
          pictures: response.data.venue.pictures,
          bookmarkButton: self.state.bookmarkButton
        })
      })
      .catch(function (error) {
        console.log(error);
      });
    this.getBookmarkStatus()
  }

  maps() {

  }

  render() {
    return (
      <Container
        fluid
        className={classNames("content", { "is-open": this.props.isOpen })}
      >
        <NavBar toggle={this.props.toggle} />
        <h2>{ this.state.name }</h2>
        <div style={{float: "right;"}} >
          <Button 
            variant="primary" 
            onClick={this.toggleBookmark}>
            {this.state.bookmarkButton}
          </Button>
        </div>
        <div>{ this.state.description }</div>
        <div>Located at { this.state.street_address } { this.state.city }, { this.state.state} { this.state.zipcode } </div>
        
        <VenueReserver vid={this.props.vid} backendRoot={backendRoot}/>
        {/*<MapContainer street_address={this.state.street_address} city={this.state.city} state={this.state.state} zipcode={this.state.zipcode}/>*/}
        

      </Container>
    );
  }
}

export default VenuePageContent;

// very important comment