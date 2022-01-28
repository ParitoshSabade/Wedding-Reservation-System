import React, {useState} from "react";
import "./content/UserProfileContent.css";
import { useHistory } from "react-router";
import axios from "axios";

function VenueManagementItem({ name, street, city, state, zipcode, reservations }) {
  const [showRes, setReservations] = useState(false);


  return (
    <div className="checkoutProduct">
      <div className="checkoutProduct__info">
        
        <p className="checkoutProduct__title">{name}</p>

        <p className="checkoutProduct__price">
        <small>{street} {city},</small><br />
        <small>{state} {zipcode}</small>
        </p>

        {!showRes ? null : (reservations.length > 0) ?
        reservations.map((r) => (
            <div style={{border: "1px solid rgba(0, 0, 0, 0.1)"}}>
            <p className="checkoutProduct__price">
            <small>{r.first_name} {r.last_name} {r.email}</small><br />
            <small>Start: {r.start_date}</small><br />
            <small>End: {r.end_date}</small>
            </p>
            </div>
        )) :
        <p className="checkoutProduct__price">
        <small>No Reservations</small>
        </p>}
        
        <button
            onClick={() => {setReservations(!showRes);}}
        >
            {showRes ? "Hide Reservations" : "Show Reservations"}
        </button>
      </div>
    </div>
  );
}

export default VenueManagementItem;
