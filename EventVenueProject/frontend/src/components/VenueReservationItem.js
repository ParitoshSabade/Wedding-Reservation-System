import React from "react";
import "./content/UserProfileContent.css";
import { useHistory } from "react-router";
import axios from "axios";

function VenueReservationItem({ name, city, state, vid, rid, type, startDate, endDate, backendRoot }) {
  var history = useHistory();
  return (
    <div className="checkoutProduct">
      <div className="checkoutProduct__info">
        
        <p className="checkoutProduct__title">{name}</p>

        <p className="checkoutProduct__price">
        <small>Start: {startDate}</small>
        </p>
        <p className="checkoutProduct__price">
        <small>End: {endDate}</small>
        </p>

        <button
          onClick={() => {
            history.push(`/venue/${vid}`);
          }}
        >
          View Venue
        </button>
        <button
          onClick={() => {
            axios
              .delete(backendRoot + `/api/user/reservations/${rid}`, {}, {
                headers: {
                  Authorization: `${localStorage.getItem("token")}`
                },
              })
              .then(function (response) {
                if (response.data.message === "Reservation erased"){
                  {window.location.reload(false)}
                }
              })
              .catch(function (error) {
                console.log(error);
              });
          }}
        >
          Unreserve
        </button>
        <button
          onClick={() => {
            history.push(`/Reservations/${rid}`);
          }}
        >
          Create Wedding
        </button>
      </div>
    </div>
  );
}

export default VenueReservationItem;
