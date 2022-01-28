import React from "react";
import "./SearchVenueItem.css";
import { useHistory } from "react-router";
import randomvenueimg from "./randomweddingvenue.jpg";

function SearchWeddingItem({ wid, venue, host, city, state, date}) {
  var history = useHistory();
  return (
    <div className="checkoutProduct">
      <img className="checkoutProduct__image" src={randomvenueimg} />

      <div className="checkoutProduct__info">
        <p className="checkoutProduct__title">{host + "\'s Wedding"}</p>
        <p className="checkoutProduct__price">
          Date: <small>{date}</small>
        </p>
        <p className="checkoutProduct__price">
          <small>{venue}</small>
        </p>
        <p className="checkoutProduct__price">
          <small>{city}, {state}</small>
        </p>

        <button
          onClick={() => {
            history.push(`/wedding/${wid}`);
          }}
        >
          More Info>>
        </button>
      </div>
    </div>
  );
}

export default SearchWeddingItem;
