import React, { useRef, useState } from "react";
import { Form, Button, Card, Alert, Container } from "react-bootstrap";
import { Link, useHistory } from "react-router-dom";
import axios from "axios";

import background from "./background3.jpg";

var backendRoot = "https://lonelyweddings.herokuapp.com";
//var backendRoot = "http://localhost:5000";

export default function Signup() {
  const emailRef = useRef();
  const passwordRef = useRef();
  const passwordConfirmRef = useRef();
  const firstName = useRef();
  const lastName = useRef();

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const history = useHistory();

  var formData = new FormData();

  async function handleSubmit(e) {
    e.preventDefault();
    if (passwordRef.current.value !== passwordConfirmRef.current.value) {
      return setError("Passwords do not match");
    }
    formData.append("first_name", firstName.current.value);
    formData.append("last_name", lastName.current.value);
    formData.append("email", emailRef.current.value);
    formData.append("password", passwordRef.current.value);

    setError("");
    setLoading(true);
    axios
      .post(backendRoot + "/api/auth/register", formData)
      .then(function (response) {
        console.log(response);
        history.push("/login");
      })
      .catch(function (error) {
        console.log(error);
        setError("Failed to create an account");
      });
  }
  return (
    <>
      <body
        style={{
          backgroundImage: `url(${background})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
          width: "100vw",
          height: "100vh",
        }}
      >
        <h1>Lonely Weddings</h1>
        <Container>
          <div
            style={{
              maxWidth: "400px",
              marginTop: "100px",
            }}
          >
            <Card>
              <Card.Body>
                <h2 className="text-center mb-4">Sign Up</h2>
                {error && <Alert variant="danger">{error}</Alert>}
                <Form onSubmit={handleSubmit}>
                  <Form.Group id="first name">
                    <Form.Label>First Name</Form.Label>
                    <Form.Control type="text" ref={firstName}></Form.Control>
                  </Form.Group>
                  <Form.Group id="last name">
                    <Form.Label>Last Name</Form.Label>
                    <Form.Control type="text" ref={lastName}></Form.Control>
                  </Form.Group>
                  <Form.Group id="email">
                    <Form.Label>Email</Form.Label>
                    <Form.Control
                      type="email"
                      ref={emailRef}
                      required
                    ></Form.Control>
                  </Form.Group>
                  <Form.Group id="password">
                    <Form.Label>Password</Form.Label>
                    <Form.Control
                      type="password"
                      ref={passwordRef}
                      required
                    ></Form.Control>
                  </Form.Group>
                  <Form.Group id="password-confirm">
                    <Form.Label>Password Confirmation</Form.Label>
                    <Form.Control
                      type="password"
                      ref={passwordConfirmRef}
                      required
                    ></Form.Control>
                  </Form.Group>
                  <Button
                    style={{ marginTop: "20px" }}
                    disabled={loading}
                    className="w-100"
                    type="submit"
                  >
                    Sign Up
                  </Button>
                </Form>
              </Card.Body>
            </Card>
            <div className="w-100 text-center mt-2">
              Already have an account? <Link to="/login">Log In</Link>
            </div>
          </div>
        </Container>
      </body>
    </>
  );
}
