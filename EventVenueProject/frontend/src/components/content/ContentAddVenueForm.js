import React from "react";
import Form from "react-bootstrap/Form";
import classNames from "classnames";
import { Container, Button } from "react-bootstrap";
import NavBar from "./Navbar";
import axios from "axios";
import { withRouter } from "react-router-dom";

var backendRoot = "https://lonelyweddings.herokuapp.com";
//var backendRoot = "http://localhost:5000"

var formData1 = new FormData();
class ContentAddVenueForm extends React.Component {
  handleSubmit = (event) => {
    event.preventDefault();
    const { history } = this.props;

    formData1.append("name", event.target.name.value);
    formData1.append("description", event.target.description.value);
    formData1.append("street_address", event.target.street_address.value);
    formData1.append("city", event.target.city.value);
    formData1.append("state", event.target.state.value);
    formData1.append("zipcode", event.target.zipcode.value);
    formData1.append("pictures", "[]");
    console.log(event.target.name.value);
    console.log(event.target.street_address.value);
    console.log(event.target.state.value);
    console.log(event.target.city.value);
    console.log(event.target.zipcode.value);
    console.log(event.target.description.value);

    axios
      .post(backendRoot + "/api/postvenue", formData1, {
        headers: {
          Authorization: `${localStorage.getItem("token")}`,
        },
      })
      .then(function (response) {
        console.log(response);
        history.push("/HomePage");
      })
      .catch(function (error) {
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
        <Container>
          <Form onSubmit={this.handleSubmit}>
            <Form.Group controlId="form.Name">
              <Form.Label>Venue Name</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter name"
                required
                name="name"
              />
            </Form.Group>

            <Form.Group controlId="form.StreetAddress">
              <Form.Label>Street Address</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter Street Address"
                required
                name="street_address"
              />
            </Form.Group>

            <Form.Group controlId="form.State">
              <Form.Label>State</Form.Label>
              <Form.Select aria-label="Select State" required name="state">
                <option>Select State</option>

                <option value="Alabama">Alabama</option>
                <option value="Alaska">Alaska</option>
                <option value="Arizona">Arizona</option>
                <option value="Arkansas">Arkansas</option>
                <option value="California">California</option>
                <option value="Colorado">Colorado</option>
                <option value="Connecticut">Connecticut</option>
                <option value="Delaware">Delaware</option>
                <option value="District of Columbia">
                  District of Columbia
                </option>
                <option value="Florida">Florida</option>
                <option value="Georgia">Georgia</option>
                <option value="Guam">Guam</option>
                <option value="Hawaii">Hawaii</option>
                <option value="Idaho">Idaho</option>
                <option value="Illinois">Illinois</option>
                <option value="Indiana">Indiana</option>
                <option value="Iowa">Iowa</option>
                <option value="Kansas">Kansas</option>
                <option value="Kentucky">Kentucky</option>
                <option value="Louisiana">Louisiana</option>
                <option value="Maine">Maine</option>
                <option value="Maryland">Maryland</option>
                <option value="Massachusetts">Massachusetts</option>
                <option value="Michigan">Michigan</option>
                <option value="Minnesota">Minnesota</option>
                <option value="Mississippi">Mississippi</option>
                <option value="Missouri">Missouri</option>
                <option value="Montana">Montana</option>
                <option value="Nebraska">Nebraska</option>
                <option value="Nevada">Nevada</option>
                <option value="New Hampshire">New Hampshire</option>
                <option value="New Jersey">New Jersey</option>
                <option value="New Mexico">New Mexico</option>
                <option value="New York">New York</option>
                <option value="North Carolina">North Carolina</option>
                <option value="North Dakota">North Dakota</option>
                <option value="Northern Marianas Islands">
                  Northern Marianas Islands
                </option>
                <option value="Ohio">Ohio</option>
                <option value="Oklahoma">Oklahoma</option>
                <option value="Oregon">Oregon</option>
                <option value="Pennsylvania">Pennsylvania</option>
                <option value="Puerto Rico">Puerto Rico</option>
                <option value="Rhode Island">Rhode Island</option>
                <option value="South Carolina">South Carolina</option>
                <option value="South Dakota">South Dakota</option>
                <option value="Tennessee">Tennessee</option>
                <option value="Texas">Texas</option>
                <option value="Utah">Utah</option>
                <option value="Vermont">Vermont</option>
                <option value="Virginia">Virginia</option>
                <option value="Virgin Islands">Virgin Islands</option>
                <option value="Washington">Washington</option>
                <option value="West Virginia">West Virginia</option>
                <option value="Wisconsin">Wisconsin</option>
                <option value="Wyoming">Wyoming</option>
              </Form.Select>
            </Form.Group>
            <Form.Group controlId="form.City">
              <Form.Label>City</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter City"
                required
                name="city"
              />
            </Form.Group>
            <Form.Group controlId="form.Zipcode">
              <Form.Label>Zipcode</Form.Label>
              <Form.Control
                type="number"
                placeholder="Enter Zipcode here (number)"
                required
                name="zipcode"
              />
            </Form.Group>
            <Form.Group controlId="form.Description">
              <Form.Label>Venue Description</Form.Label>
              <Form.Control
                as="textarea"
                rows={5}
                required
                name="description"
              />
            </Form.Group>

            <Button
              style={{ marginTop: "20px" }}
              variant="primary"
              type="submit"
            >
              Submit
            </Button>
          </Form>
        </Container>
      </Container>
    );
  }
}

export default withRouter(ContentAddVenueForm);
// very important comment