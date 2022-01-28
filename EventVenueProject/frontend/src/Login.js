import React, { useRef, useState } from "react";
import { Form, Button, Card, Alert, Image } from "react-bootstrap";
import { Typography } from "@material-ui/core";

import { Link, useHistory } from "react-router-dom";

import { Container } from "react-bootstrap";
import background from "./background3.jpg";

import "./App.css";

import axios from "axios";

var backendRoot = "https://lonelyweddings.herokuapp.com";
//var backendRoot = "http://localhost:5000"

export default function Login() {
  const emailRef = useRef();
  const passwordRef = useRef();
  const history = useHistory();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  var formData1 = new FormData();
  async function handleSubmit(e) {
    e.preventDefault();

    //console.log(emailRef.current.value);
    //console.log(passwordRef.current.value);

    formData1.append("email", emailRef.current.value);
    formData1.append("password", passwordRef.current.value);

    setError("");
    setLoading(true);
    axios
      .post(backendRoot + "/api/auth/login", formData1)
      .then(function (response) {
        console.log(response.data["access_token"]);
        // Store the JWT in localStorage
        localStorage.setItem(
          "token",
          `Bearer ${response.data["access_token"]}`
        );

        history.push("/HomePage");
      })
      .catch(function (error) {
        console.log(error);
        setError("Failed to login");
      });
    setLoading(false);
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
                <h2 className="text-center mb-4">Log In</h2>
                {error && <Alert variant="danger">{error}</Alert>}
                <Form onSubmit={handleSubmit}>
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
                  <Button
                    style={{ marginTop: "20px" }}
                    disabled={loading}
                    className="w-100"
                    type="submit"
                  >
                    Log In
                  </Button>
                </Form>
              </Card.Body>
            </Card>
            <div className="w-100 text-center mt-2">
              Need an account? <Link to="/signup">Sign Up</Link>
            </div>
          </div>
        </Container>
      </body>
    </>
  );
}
