import React, { Component } from 'react';
import { google, geocoder, LoadScript, maps} from 'google-maps-react';



export class MapContainer extends Component {

  constructor (props) {
    super(props)
    this.state = {
      address: new String,
      INITIAL_LOCATION: {
        latitude: 29.532804,
        longitude: -55.491477
      } 
    };
  }
  
  geocodeAddress(address) {
    var ATLANTIC_OCEAN = {
      latitude: 29.532804,
      longitude: -55.491477
    }
    
    this.geocoder.geocode({ 'address': address }, function handleResults(results, status) {
  
      if (status === google.maps.GeocoderStatus.OK) {
        this.state.INITIAL_LOCATION.latitude = results[0].geometry.location.lat
        this.state.INITIAL_LOCATION.longitude = results[0].geometry.location.lng
        return;
      }
        this.state.INITIAL_LOCATION.latitude = ATLANTIC_OCEAN.latitude
        this.state.INITIAL_LOCATION.longitude = ATLANTIC_OCEAN.longitude
    }.bind(this))
  }

  componentDidMount() {   
    this.state.address = this.props.street_address + " " + this.props.city + " " + this.props.state + " " + this.props.zipcode
    
    
    console.log(this.state.address)
    console.log(this.state.INITIAL_LOCATION)
    
    this.mapp = new google.maps.Map(this.mapElement, {
      zoom: 8,
      center: {
        lat: this.state.INITIAL_LOCATION.latitude,
        lng: this.state.INITIAL_LOCATION.longitude
      }
    });

    this.marker = new google.maps.Marker({
      map: this.mapps,
      position: {
        lat: this.state.INITIAL_LOCATION.latitude,
        lng: this.state.INITIAL_LOCATION.longitude
      }
    });
    geocoder = new google.maps.Geocoder();
    this.geocodeAddress(encodeURIComponent(this.state.address))
    console.log(this.state.address)
    console.log(this.state.INITIAL_LOCATION)
  }

  setMapElementReference(mapElementReference){
    this.mapElement = mapElementReference
  }

  render(){
    return(
    <div
    className="MapContainer" ref={this.setMapElementReference(this.mapp)}>
         <LoadScript
        googleMapsApiKey="AIzaSyBlSErvF35FIXJ2K6XG7hN7BJtrEplUHEA"/>
     </div>
     
    )
  }
}
export default MapContainer
// very important comment