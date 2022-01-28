import React from "react";
import "./content/UserProfileContent.css";
import { useHistory } from "react-router";
import axios from "axios";

function BookmarkItem({ name, city, state, id, type, starttime, backendRoot }) {
  var history = useHistory();
  return (
    <div className="checkoutProduct">
      <div className="checkoutProduct__info">
        <p className="checkoutProduct__title">{name}</p>
        {type === "venue" ? 
        <p className="checkoutProduct__price">
          <small>{city}, {state}</small>
        </p> : 
        <p className="checkoutProduct__price">
        <small>{starttime}</small>
      </p>}
        <button
          onClick={() => {
            history.push(`/${type}/${id}`);
          }}
        >
          View {type === "venue" ? "Venue" : "Wedding"}
        </button>
        <button
            onClick={() => {
              axios
                .post(backendRoot + (type === "wedding" ? `/api/bookmarkwedding/${id}` : `/api/bookmarkvenue/${id}`), {}, {
                  headers: {
                    Authorization: `${localStorage.getItem("token")}`
                  },
                })
                .then(function (response) {
                  if (response.data.message === "Wedding unbookmarked" || response.data.message === "Venue unbookmarked"){
                    {window.location.reload(false)}
                  }
                })
                .catch(function (error) {
                  console.log(error);
                });
            }}
        >
            Unbookmark
        </button>
      </div>
    </div>
  );
}

export default BookmarkItem;
