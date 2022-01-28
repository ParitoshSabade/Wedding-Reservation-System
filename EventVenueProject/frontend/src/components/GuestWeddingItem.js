import React from "react";
import "./content/UserProfileContent.css";
import { useHistory } from "react-router";
import axios from "axios";
function GuestWeddingItem({ name, id, starttime, backendRoot }) {
  var history = useHistory();
  return (
    <div className="checkoutProduct">
      <div className="checkoutProduct__info">

        <p className="checkoutProduct__title">{name}</p>

        <p className="checkoutProduct__price">
        <small>{starttime}</small>
        </p>

        <button
          onClick={() => {
            history.push(`/wedding/${id}`);
          }}
        >
          View Wedding
        </button>
        <button
             onClick={() => {
                axios
                  .post(backendRoot + `/api/togglersvp/${id}`, {}, {
                    headers: {
                      Authorization: `${localStorage.getItem("token")}`
                    },
                  })
                  .then(function (response) {
                    if (response.data.message === "rescind RSVP"){
                      {window.location.reload(false)}
                    }
                  })
                  .catch(function (error) {
                    console.log(error);
                  });
              }}
        >
            Unattend
        </button>
      </div>
    </div>
  );
}

export default GuestWeddingItem;
