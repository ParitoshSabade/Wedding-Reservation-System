import React from "react";
import "./SearchVenueItem.css";
import { useHistory } from "react-router";
import randomvenueimg from "./randomweddingvenue.jpg";

function SearchVenueItem({ vid, name, city, state, zipcode }) {
  var history = useHistory();
  return (
    <div className="checkoutProduct">
      <img className="checkoutProduct__image" src={randomvenueimg} />

      <div className="checkoutProduct__info">
        <p className="checkoutProduct__title">{name}</p>
        <p className="checkoutProduct__price">
          <small>{city}</small>
        </p>
        <p className="checkoutProduct__price">
          <small>{state}</small>
        </p>
        <p className="checkoutProduct__price">
          <small>{zipcode}</small>
        </p>
        <button
          onClick={() => {
            history.push(`/venue/${vid}`);
          }}
        >
          More Info>>
        </button>
      </div>
    </div>
  );
}

export default SearchVenueItem;
