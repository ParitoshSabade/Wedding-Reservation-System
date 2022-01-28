import React from "react";
import Form from "react-bootstrap/Form";
import classNames from "classnames";
import { Container, Button } from "react-bootstrap";
import NavBar from "./Navbar";
import axios from "axios";
import { withRouter } from "react-router-dom";
import "../../App.css";
import { DateTimePickerComponent } from "@syncfusion/ej2-react-calendars";

var backendRoot = "https://lonelyweddings.herokuapp.com";
//var backendRoot = "http://localhost:5000"

var formData1 = new FormData();
class AddWedding extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      data: [],
      startDate: new Date(),
      endDate: new Date(),
      rid: " ",
      flg: 0,
      startDate_str: " ",
      endDate_str: " ",
    };

    this.handleSubmit = this.handleSubmit.bind(this);
  }
  handleSubmit = (event) => {
    event.preventDefault();
    const { history } = this.props;
    console.log(event.target.group1.value);
    console.log(event.target.description.value);
    //console.log(event.target.DateTime.value);

    var wedding_date = new Date(event.target.DateTime.value);
    console.log(wedding_date.toISOString());
    formData1.append("description", event.target.description.value);
    formData1.append("is_public", event.target.group1.value);
    formData1.append("wedding_reservation", this.props.rid);
    formData1.append("wedding_datetime", wedding_date.toISOString());

    axios
      .post(backendRoot + "/api/postwedding", formData1, {
        headers: {
          Authorization: `${localStorage.getItem("token")}`,
        },
      })
      .then(function (response) {
        console.log(response);
        alert("The Wedding is registered.");
        history.push("/HomePage");
      })
      .catch(function (error) {
        console.log(error);
        //setError("Failed to login");
      });
  };

  componentDidMount() {
    const { history } = this.props;
    axios
      .get(
        backendRoot + `/api/user/reservations?mode=future`,

        {
          headers: {
            Authorization: `${localStorage.getItem("token")}`,
          },
        }
      )
      .then((response) => {
        //console.log(response.data);
        this.setState({ data: response.data });
        console.log(this.state.data);
        var reservations = this.state.data["reservations"];
        console.log(this.props.rid);
        //this.setState({ flg: 0 });
        for (const res of reservations) {
          if (res["rid"] === this.props.rid) {
            this.setState({ startDate: new Date(res["start_date"]) });
            this.setState({ endDate: new Date(res["end_date"]) });

            this.setState({
              startDate_str: String(
                this.state.startDate.getMonth() +
                  1 +
                  "/" +
                  (this.state.startDate.getDate() + 1) +
                  "/" +
                  this.state.startDate.getFullYear() +
                  " 12:00 AM"
              ),
            });
            this.setState({
              endDate_str: String(
                this.state.endDate.getMonth() +
                  1 +
                  "/" +
                  (this.state.endDate.getDate() + 1) +
                  "/" +
                  this.state.endDate.getFullYear() +
                  " 12:00 AM"
              ),
            });

            this.setState({ rid: res["rid"] });
            this.setState({ flg: 1 });
            console.log(this.state.startDate.getDate());
            console.log(this.state.startDate.getFullYear());
            console.log(this.state.startDate.getMonth());
            //console.log(this.state.endDate.getDate());
          }
        }
        if (this.state.flg === 0) {
          alert("The User does not not have access to this reservation");
          history.push("/HomePage");
        }
      })
      .catch((error) => {
        console.log(error);
        //setError("Failed to login");
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
          <Form onSubmit={this.handleSubmit}>
            <Form.Group controlId="form.Radio">
              <Form.Label>Is the Wedding public or private?</Form.Label>
              {["radio"].map((type) => (
                <div key={`inline-${type}`} className="mb-3">
                  <Form.Check
                    inline
                    label="public"
                    name="group1"
                    type={type}
                    id={`inline-${type}-1`}
                    value={"True"}
                  />
                  <Form.Check
                    inline
                    label="private"
                    name="group1"
                    type={type}
                    id={`inline-${type}-2`}
                    value={"False"}
                  />
                </div>
              ))}
            </Form.Group>

            <Form.Group controlId="form.Description">
              <Form.Label>wedding Description</Form.Label>
              <Form.Control
                as="textarea"
                rows={5}
                required
                name="description"
              />
            </Form.Group>

            <Form.Group controlId="form.Date">
              <Form.Label>Enter Wedding Date and Start Time</Form.Label>
              <DateTimePickerComponent
                id="datetimepicker"
                placeholder="Select a date and time"
                name="DateTime"
                min={this.state.startDate_str}
                max={this.state.endDate_str}
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
export default withRouter(AddWedding);
