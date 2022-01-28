import React from "react";
import Form from "react-bootstrap/Form";
import classNames from "classnames";
import { Container, Button } from "react-bootstrap";
import NavBar from "./Navbar";
import axios from "axios";
import { withRouter } from "react-router-dom";
import VenueManagementItem from "../VenueManagementItem";
import "../../App.css";

var backendRoot = "https://lonelyweddings.herokuapp.com";
//var backendRoot = "http://localhost:5000"

class VenueManagementContent extends React.Component {
  constructor(props){
      super(props);
      this.state = {
           venues: [],
           reservations: new Object()
      };
    }

  componentDidMount(){
    this.getUsersVenues();
  }

  getUsersVenues(){
    var self = this;
    axios
    .get(backendRoot + `/api/user/venues`, {
        headers: {
        Authorization: `${localStorage.getItem("token")}`,
        },
    })
    .then(function (response) {
        let newState = Object.assign({}, self.state);
        if (response.status == 200){
            for (var i = 0; i < response.data.venues.length; i++) {
              let v = response.data.venues[i];
              self.getVenueReservations(v.vid)
            }
            newState.venues = response.data.venues;
        }
        self.setState(newState);
    })
    .catch(function (error) {
        console.log(error);
    });
  }

  getVenueReservations(vid){
    var self = this;
    axios
      .get(backendRoot + `/api/venue/${vid}/reservations?mode=future`, {
          headers: {
          Authorization: `${localStorage.getItem("token")}`,
          },
      })
      .then(function (response) {
        let newState = Object.assign({}, self.state);
        newState.reservations[vid] = response.data.reservations;
        self.setState(newState);
      })
      .catch(function (error) {
        console.log(error);
      });
  }

  render() {
    return (
      <Container
        fluid
        className={classNames("content", { "is-open": this.props.isOpen })}
      >
        <NavBar toggle={this.props.toggle} />

        <Container>
          <div>
            <h1>Your Venues</h1>
            {this.state.venues.length > 0 ? 
              <div align="center" className="bRow">
                {this.state.venues.map((v) => {
                  return <VenueManagementItem 
                            name={v.name} 
                            street={v.street_address} 
                            city={v.city} 
                            state={v.state} 
                            zipcode={v.zipcode} 
                            reservations={this.state.reservations[v.vid]} 
                          />
                })}

              </div> 
              : <div align="center">
                  <p>You have no venues, would you like to create one?</p>
                  <Button
                    onClick={() => (
                      this.props.history.push({pathname: '/AddVenue'})
                    )}
                  >
                    Create Venue
                  </Button>
                </div>}
          </div>
        </Container>
      </Container>
    );
  }
}
export default withRouter(VenueManagementContent);
