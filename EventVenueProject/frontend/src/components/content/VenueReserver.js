import React, { Component } from 'react';
import 'react-date-range/dist/styles.css'; // main css file
import 'react-date-range/dist/theme/default.css'; // theme css file
import { DateRange } from 'react-date-range';
import { Container, Button } from 'react-bootstrap';
import axios from "axios";


class VenueReserver extends Component {

  constructor (props) {
    super(props)
    this.state = {
      selectionRange: {
        startDate: new Date(),
        endDate: new Date(),
        key: 'selection'
      },
      reservedDates: []
    };
    this.handleSelect = this.handleSelect.bind(this);
    this.reserveVenue = this.reserveVenue.bind(this);
  }

  componentDidMount() {
    var self = this;
    axios
      .get(this.props.backendRoot + `/api/venue/${this.props.vid}/reservations?mode=future`, {
        headers: {
          Authorization: `${localStorage.getItem("token")}`,
        },
      })
      .then(function (response) {
        var reservations = response.data["reservations"];
        var resDates = []
        for (const res of reservations) {
          // Convert to date
          const startEpoch = Date.parse(res["start_date"]);
          const endEpoch = Date.parse(res["end_date"]);
          const startDate = new Date(startEpoch);
          const endDate = new Date(endEpoch);
          // Add start+end dates and dates inbetween to reservedDates
          if (startDate == endDate){
            resDates = resDates.concat([startDate])
          }
          else {
            let dates = []
            var date = new Date(startDate);
            while (date < endDate){
              dates.push(new Date(date));
              date.setDate(date.getDate() + 1);
            }
            resDates = resDates.concat(dates)
          }
        }
        self.state.reservedDates = resDates;
        console.log(self.state.reservedDates)
      })
      .catch(function (error) {
        console.log(error);
      });
  }

  handleSelect (ranges) {
    this.state.selectionRange.startDate =ranges.selection.startDate;
    this.state.selectionRange.endDate = ranges.selection.endDate;
  }
  
  reserveVenue() {
    var data = new FormData()
    data.append("start_date", this.state.selectionRange.startDate.toISOString());
    data.append("end_date", this.state.selectionRange.endDate.toISOString());
    for (var key of data.entries()) {
      console.log(key[0] + ', ' + key[1]);
    }

    var self = this;
    axios
      .post(this.props.backendRoot + `/api/venue/${self.props.vid}/reserve`, data, {
        headers: {
          Authorization: `${localStorage.getItem("token")}`
        },
      })
      .then(function (response) {

      })
      .catch(function (error) {
        console.log(error);
      });
  }

 
  render() {
    return (
      <Container>
        <DateRange
          editableDateInputs={true}
          onChange={this.handleSelect}
          moveRangeOnFirstSelection={false}
          ranges={[this.state.selectionRange]}
          minDate = {new Date()}
          disabledDates = {this.state.reservedDates}
        />
        <Button 
          variant="primary" 
          onClick={this.reserveVenue}>
         Reserve
        </Button>
      </Container>
    );
  }
  
}

export default VenueReserver;

// very important comment