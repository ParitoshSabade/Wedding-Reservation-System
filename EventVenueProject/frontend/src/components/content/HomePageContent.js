import React from "react";
import Form from "react-bootstrap/Form";
import classNames from "classnames";
import { Container, Button } from "react-bootstrap";
import NavBar from "./Navbar";
import { DialogTitle, InputAdornment, TextField } from "@material-ui/core";
import axios from "axios";
import SearchIcon from "@material-ui/icons/Search";
import SearchVenueItem from "../SearchVenueItem";
import SearchWeddingItem from "../SearchWeddingItem";
import { withRouter } from "react-router-dom";
import Tabs from "../Tabs";
import "../SearchVenueItem.css";

var backendRoot = "https://lonelyweddings.herokuapp.com";
//var backendRoot = "http://localhost:5000"

var resdata = {};

// var formData1 = new FormData();
class HomePageContent extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      data: [],
      isLoading: false,
    };

    this.handleSearch = this.handleSearch.bind(this);
    this.handleSearchWedding = this.handleSearchWedding.bind(this);
  }

  handleSearch = (event) => {
    event.preventDefault();

    console.log(localStorage.getItem("token"));
    this.setState({ isLoading: true });
    axios
      .get(
        backendRoot + `/api/venuesearch/${event.target.query.value}`,

        {
          headers: {
            Authorization: `${localStorage.getItem("token")}`,
          },
        }
      )
      .then((response) => {
        console.log(response.data);
        this.setState({ data: response.data, isLoading: false });
      })
      .catch((error) => {
        console.log(error);
        //setError("Failed to login");
      });
  };
  handleSearchWedding = (event) => {
    event.preventDefault();

    console.log(localStorage.getItem("token"));
    this.setState({ isLoading: true });
    axios
      .get(
        backendRoot + `/api/weddingsearch/${event.target.wedding_query.value}`,

        {
          headers: {
            Authorization: `${localStorage.getItem("token")}`,
          },
        }
      )
      .then((response) => {
        console.log(response.data);
        this.setState({ data: response.data.search_results, isLoading: false });
      })
      .catch((error) => {
        console.log(error);
        //setError("Failed to login");
      });
  };
  render() {
    return (
      <Container
        fluid
        className={classNames("content", { "is-open": this.props.isOpen })}
      >
        <NavBar toggle={this.props.toggle} />

        <Tabs>
          <div label="Search Venues">
            <form onSubmit={this.handleSearch} className="search-bar">
              <TextField
                className="search-bar"
                autoFocus={true}
                name="query"
                id="outlined-full-width"
                label="Search Venues"
                style={{ margin: 8 }}
                placeholder="Search Venues by keywords"
                required={true}
                fullWidth
                margin="normal"
                InputLabelProps={{ shrink: true }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <Button className="go" variant="contained" type="submit">
                        GO
                      </Button>
                    </InputAdornment>
                  ),
                }}
                variant="outlined"
              />
            </form>
            <div>
              {this.state.data.map((dt) => (
                <SearchVenueItem
                  vid={dt.vid}
                  name={dt.name}
                  city={dt.city}
                  state={dt.state}
                  zipcode={dt.zipcode}
                />
              ))}
            </div>
          </div>
          <div label="Search Weddings">
            <form onSubmit={this.handleSearchWedding} className="search-bar">
              <TextField
                className="search-bar"
                autoFocus={true}
                name="wedding_query"
                id="outlined-full-width"
                label="Search Weddings"
                style={{ margin: 8 }}
                placeholder="Search Weddings by keywords"
                required={true}
                fullWidth
                margin="normal"
                InputLabelProps={{ shrink: true }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <Button className="go" variant="contained" type="submit">
                        GO
                      </Button>
                    </InputAdornment>
                  ),
                }}
                variant="outlined"
              />
            </form>
            <div>
              {this.state.data.map((dt) => (
                <SearchWeddingItem
                  wid={dt.wid}
                  host={dt.first_name + " " + dt.last_name}
                  description={dt.description}
                  date={dt.date}
                  venue={dt.name}
                  city={dt.city}
                  state={dt.state}
                />
              ))}
            </div>
          </div>
        </Tabs>
      </Container>
    );
  }
}

export default withRouter(HomePageContent);
// very important comment