import React, {useState} from "react";
import "./content/UserProfileContent.css";
import { useHistory } from "react-router";
import axios from "axios";

function HostWeddingItem({ vName, id, starttime, backendRoot }) {
  var history = useHistory();
  
  const [guests, setGuests] = useState(false)
  const [guestList, setGuestList] = useState([])

  return (
    <div className="checkoutProduct">
      <div className="checkoutProduct__info">

        <p className="checkoutProduct__title">{vName}</p>

        <p className="checkoutProduct__price">
        <small>{starttime}</small>
        </p>

        {!guests ? null : (guestList.length > 0) ?  
        
        guestList.map((g) => (

          <p className="checkoutProduct__price">
          <small>{g.first_name} {g.last_name} {g.email}</small>
          </p>

        )) : 
        
        <p className="checkoutProduct__price">
        <small>No guests are attending</small>
        </p>}

        <button
          onClick={() => {
            if (!guests) {
              axios
              .get(backendRoot + `/api/wedding/${id}/guests`, {
                headers: {
                  Authorization: `${localStorage.getItem("token")}`
                },
              })
              .then(function (response) {
                if (response.data.message === "Wedding does not exist"){
                  setGuests(false)
                }
                else {
                  setGuests(true)
                  setGuestList(response.data.guests)
                }
              })
              .catch(function (error) {
                console.log(error);
              });
            }
          else {
            setGuests(false)
          }
            
          }}
        >
          {guests ? "Hide Guests" : "View Guests"}
        </button>
        <button
          onClick={() => {
            axios
              .delete(backendRoot + `/api/wedding/${id}`, {}, {
                headers: {
                  Authorization: `${localStorage.getItem("token")}`
                },
              })
              .then(function (response) {
                if (response.data.message === "Wedding erased"){
                  {window.location.reload(false)}
                }
              })
              .catch(function (error) {
                console.log(error);
              });
          }}
        >
          Delete Wedding
        </button>
      </div>
    </div>
  );
}

export default HostWeddingItem;
