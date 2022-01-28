from contextlib import nullcontext
import re
import json
from uuid import UUID
import uuid
from flask import Flask, send_from_directory, request
from flask.signals import request_tearing_down
from sqlalchemy.sql.elements import Null
from sqlalchemy.sql.expression import true
from sqlalchemy.sql.operators import like_op
from sqlalchemy.sql.selectable import Values
from sqlalchemy.sql.sqltypes import JSON, String
from sqlalchemy.util.langhelpers import MemoizedSlots
from werkzeug import useragents
from flask_restful import Api
from flask_cors import CORS, cross_origin #comment this on deployment
from api.HelloApiHandler import HelloApiHandler
from flask_sqlalchemy import SQLAlchemy
from flask_praetorian import Praetorian, auth_required, current_user
from psycopg2.extras import DateRange, register_uuid
from datetime import datetime, date
from dateutil.parser import isoparse


app = Flask(__name__, static_url_path='/', static_folder='frontend/build')

CORS(app) #comment this on deployment

api = Api(app)

# Configure JWT
app.config['SECRET_KEY'] = 'group8secret'
app.config['JWT_ACCESS_LIFESPAN'] = {'hours': 24}
app.config['JWT_REFRESH_LIFESPAN'] = {'days': 30}
guard = Praetorian()

# Configure database
app.config['SQLALCHEMY_DATABASE_URI'] = 'postgresql+psycopg2://huggcxzybmdegm:401d28ec5d40d5a1924bf74add6adde719115f7e3276fc4a16a4c69db1aca1d0@ec2-52-207-47-210.compute-1.amazonaws.com:5432/d49i5f0i3s50ib'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
db = SQLAlchemy(app)

# Initialize flask-praetorian and create database
from models import Guestlist, Reservation, User, Venue, VenueBookmark, Wedding, WeddingBookmark
with app.app_context():
    guard.init_app(app, User)
db.create_all()


@app.route("/", defaults={'path':''})
@cross_origin()
def serve(path):
    return send_from_directory(app.static_folder,'index.html')

@app.errorhandler(404)
def not_found(e):
    return send_from_directory(app.static_folder,'index.html')

@app.route("/api/test", methods=['GET'])
def test():
    """
    Used to test if the server is running
    """
    return "Hello!", 200

@app.route("/api/auth/register", methods=['POST'])
def register():
    """
    Registers a new user. 
    POST Request must contain form with "first_name", "last_name", "email", and "password" fields
    """
    if request.form["first_name"] and request.form["last_name"] and request.form["email"] and request.form["password"]:
        if db.session.query(User).filter_by(email=request.form["email"]).count() < 1:
            new_user = User(request.form["first_name"], request.form["last_name"], request.form["email"], guard.hash_password(request.form["password"]))
            db.session.add(new_user)
            db.session.commit()
            print(new_user)
            return {"message": f"User {request.form['email']}"}, 201
        else:
            return {"error": "Email already in use"}, 400
    else:
        return {"error": "Form requires first_name, last_name, email, and password."}, 400

@app.route("/api/auth/login", methods=['POST'])
def login():
    """
    Returns the JWT token if the given user is authenticated.
    Requires "email" and "password" fields in POST request.
    """
    if request.form["email"] and request.form["password"]:
        user = guard.authenticate(request.form["email"], request.form["password"])
        ret = {'access_token': guard.encode_jwt_token(user)}
        return ret, 200
    else:
        return {"error": "Request must contain email and password"}, 400

@app.route("/api/myprofile", methods=['GET'])
@auth_required
def myprofile():
    """
    Returns the logged-in user's information
    """
    user = db.session.query(User).filter_by(email=current_user().username).one_or_none()
    return {"email":user.email, "first_name": user.first_name, "last_name":user.last_name}, 200

@app.route("/api/postvenue", methods=['POST'])
@auth_required
def postvenue():
    """
    Posts Venue to Platform
    Post requiest requires "name", "description", "street_address", "city", "state", "zipcode", "pictures" 
    """
    if request.form["name"] and request.form["description"] and request.form["street_address"] and request.form["city"] and request.form["state"] and request.form["zipcode"]:
        if db.session.query(Venue).filter_by(name=request.form["name"], street_address=request.form["street_address"], zipcode=request.form["zipcode"]).count() < 1:
            if request.form["pictures"]:
                new_Venue = Venue(current_user().id,request.form["name"],request.form["description"], request.form["street_address"], request.form["city"], request.form["state"], request.form["zipcode"], request.form["pictures"])
                db.session.add(new_Venue)
                db.session.commit()
                return {"message": f"Venue {request.form['name']} with no picutures"}, 201
            else:
                new_Venue = Venue(current_user().id,request.form["name"],request.form["description"], request.form["street_address"], request.form["city"], request.form["state"], request.form["zipcode"], Null)
                db.session.add(new_Venue)
                db.session.commit()
                return {"message": f"Venue {request.form['name']}"}, 201
        else:
            ven = db.session.query(Venue).filter_by(name=request.form["name"]).first()
            return {"error": ven.vid}, 400
    else:
        return {"error": "Form requires name, description, street_address, city, state, zipcode, pictures."}, 400

@app.route("/api/venue/<vid>", methods=['GET'])
@auth_required
def getvenue(vid):
    """
    Given a venue id as a path argument, returns all information on that venue
    """
    venue = db.session.query(Venue).filter_by(vid=vid).one_or_none()
    if venue is None:
        return {"error": f"Venue {vid} does not exist"}, 404
    return {"venue" : venue.serialize()}, 200

@app.route("/api/user/venues", methods=['GET'])
@auth_required
def getUsersVenues():
    """
    Returns all venues owned by the user along with their reservations
    """
    venues = db.session.query(Venue).filter_by(owner=current_user().id).all()
    return {"venues": [venue.serialize() for venue in venues]}, 200

def create_reservation(start_date:str, end_date:str, venue_id:UUID, user_id:UUID) -> bool:
    """
    Reserves a venue for a given date range if it is available
    Returns true on success, returns false otherwise
    """
    # Must call before working with UUIDs in sqlachemy
    register_uuid()

    start_date = isoparse(start_date)
    end_date = isoparse(end_date)
    date_range = DateRange(lower=start_date.date(), upper=end_date.date(), bounds='[]')
    if db.session.query(Reservation).filter( Reservation.res_venue==venue_id, Reservation.res_dates.op("&&")(date_range)).count() > 0:
        return False
    reservation = Reservation(res_dates=date_range, res_venue=venue_id, holder=user_id)
    db.session.add(reservation)
    db.session.commit()
    return True

@app.route("/api/venue/<vid>/reserve", methods=['POST'])
@auth_required
def reserve_venue(vid):
    """
    Reserves the venue for the given daterange
    Expects start date and end_date in form, venue id in address
    Dates should be ISO-8601 date strings
    """
    if request.form["start_date"] and request.form["end_date"]:
        if create_reservation(request.form["start_date"], request.form["end_date"], uuid.UUID(vid), current_user().id):
            return {"message": "Reservation created"}, 201
        else:
            print("Error: unable to add resevation to DB")
            return {"error": "Timeslot unavailable"}, 400
    else:
        print("Error: Invalid form")
        return {"error": "Form requires start_date and end_date"}, 400

@app.route("/api/user/reservations/<rid>", methods=['DELETE'])
@auth_required
def deleteReservation(rid):
    """
    Deletes the user's given reservation
    """
    reservation = db.session.query(Reservation).filter_by(rid=rid).filter_by(holder=current_user().id).one_or_none()
    if reservation is None:
        return {"message": "User does not have the given reservation"}, 200
    db.session.delete(reservation)
    db.session.commit()
    return {"message": "Reservation erased"}, 200



@app.route("/api/venue/<vid>/reservations", methods=['GET'])
@auth_required
def get_venue_reservations(vid):
    """
    Returns the list of reservations for the given venue
    Accepts "mode" query parameter with values "all", "future", or "past"
    """
    results = db.session.query(Reservation, User).join(User, User.id == Reservation.holder).filter(Reservation.res_venue == vid).all()
    if not request.args["mode"]:
        # return all reservations for the venue
        return {"reservations" : [{**res.Reservation.serialize(), **res.User.serialize()} for res in results]}, 200
    elif request.args["mode"] == "all":
        # return all reservations for the venue
        return {"reservations" : [{**res.Reservation.serialize(), **res.User.serialize()} for res in results]}, 200
    elif request.args["mode"] == "future":
        # return reservations whose end date is in the future
        return {"reservations" : [{**res.Reservation.serialize(), **res.User.serialize()} for res in results if res.Reservation.res_dates.lower >= datetime.today().date() ]}, 200
    elif request.args["mode"] == "past":
        # return reservations whose end date has passed
        return {"reservations" : [{**res.Reservation.serialize(), **res.User.serialize()} for res in results if res.Reservation.res_dates.lower < datetime.today().date() ]}, 200
    else:
        return {"error": f"{request.args['mode']} is an invalid mode"}, 400

@app.route("/api/user/reservations", methods=['GET'])
@auth_required
def get_users_reservations():
    """
    Returns the list of the given user's reservations
    Accepts "mode" query parameter with values "all", "future", or "past"
    """
    results = db.session.query(Reservation, Venue).filter(Reservation.res_venue == Venue.vid).filter(Reservation.holder==current_user().id).all()
    if not request.args["mode"]:
        # return all reservations for the venue
        return {"reservations" : [{**res.Reservation.serialize(), **res.Venue.serialize()} for res in results]}, 200
    elif request.args["mode"] == "all":
        # return all reservations for the venue
        return {"reservations" : [{**res.Reservation.serialize(), **res.Venue.serialize()} for res in results]}, 200
    elif request.args["mode"] == "future":
        # return reservations whose end date is in the future
        return {"reservations" : [{**res.Reservation.serialize(), **res.Venue.serialize()} for res in results if res.Reservation.res_dates.upper >= datetime.today().date() ]}, 200
    elif request.args["mode"] == "past":
        # return reservations whose end date has passed
        return {"reservations" : [{**res.Reservation.serialize(), **res.Venue.serialize()} for res in results if res.Reservation.res_dates.upper < datetime.today().date() ]}, 200
    else:
        return {"error": f"{request.args['mode']} is an invalid mode"}, 400

@app.route("/api/postwedding", methods=['POST'])
@auth_required
def postwedding():
    """
    Posts Wedding to Platform
    Post request requires "description", "is_public", "wedding_reservation", "wedding_datetime"
    """
    if request.form["description"] and request.form["is_public"] and request.form["wedding_reservation"] and request.form["wedding_datetime"]:
        if db.session.query(Reservation).filter_by(rid=UUID(request.form["wedding_reservation"])).count() == 1: 
            new_wedding = Wedding(host=current_user().id, description=request.form["description"], is_public=bool(request.form["is_public"]), wedding_reservation=UUID(request.form["wedding_reservation"]), wedding_datetime=isoparse(request.form["wedding_datetime"]))
            db.session.add(new_wedding)
            db.session.commit()
            return {"message": f"Wedding {request.form['description']}"}, 202
        else:
            return {"error": "reservation does not exist"}, 400
    else:
        return {"error": "Form requires description, description, is_public, wedding_reservation, wedding_datetime."}, 400

@app.route("/api/wedding/<wid>", methods=['GET'])
@auth_required
def getwedding(wid):
    """
    Given a wedding id as a path argument, 
    returns location, date, description, and host of the wedding
    """
    result = db.session.query(Wedding, User, Venue)\
        .join(User, User.id==Wedding.host)\
        .join(Reservation, Reservation.rid == Wedding.wedding_reservation and\
                Reservation.holder == User.id)\
        .join(Venue, Venue.vid == Reservation.res_venue)\
        .filter(User.id == current_user().id).filter(Wedding.wid == wid).one_or_none()
    if result is None:
        return {"error":f"Wedding {wid} does not exist"}, 404
    return {"wedding": result.Wedding.serialize(),
            "user": result.User.serialize(),
            "venue": result.Venue.serialize()}, 200

@app.route("/api/wedding/<wid>", methods=['DELETE'])
@auth_required
def deleteWedding(wid):
    """
    Deletes the user's given wedding
    """
    wedding = db.session.query(Wedding).filter_by(wid=wid).filter_by(host=current_user().id).one_or_none()
    if wedding is None:
        return {"message": "User does not have the given wedding"}, 200
    db.session.delete(wedding)
    db.session.commit()
    return {"message": "Wedding erased"}, 200

@app.route("/api/user/weddings", methods=['GET'])
@auth_required
def get_users_upcoming_weddings():
    """
    Returns the list of weddings the logged-in user is attending
    """
    results = db.session.query(Wedding, User)\
                        .join(User, Wedding.host==User.id)\
                        .join(Guestlist, Wedding.wid==Guestlist.wedding_id)\
                        .filter(current_user().id==Guestlist.guest_id)\
                        .filter(Wedding.wedding_datetime >= date.today()).all()
    if results is None :
        return {"status": "none"}, 200
    return {"status": "some", "weddings":[{**result.User.serialize(), **result.Wedding.serialize()} for result in results]}

@app.route("/api/bookmarkvenue/<vid>", methods=['POST'])
@auth_required
def bookmarkvenue(vid):
    """
    Adds venue to user's bookmarked venues
    """
    # Determine if Venue Exists 
    if db.session.query(Venue).filter_by(vid=vid).first():
        # Determine if venue is bookmarked or not
        bookmark_status = db.session.query(VenueBookmark).filter_by(bookmarked_venue=vid, user_id=current_user().id).one_or_none()
        if bookmark_status is None:
            # Bookmark Venue 
            new_bookmarked_venue = VenueBookmark(bookmarked_venue = vid, user_id = current_user().id)
            db.session.add(new_bookmarked_venue)
            db.session.commit()
            return {"message": "Venue bookmarked"}, 201
        else:
            # Delete Bookmark 
            db.session.query(VenueBookmark).filter_by(bookmarked_venue=vid).delete()
            db.session.commit()
            return {"message": "Venue unbookmarked"}, 201
    else:
        return {"message": "Venue does not exist"}, 400

@app.route("/api/bookmarkvenue/<vid>", methods=['GET'])
@auth_required
def getVenueBookmarkStatus(vid):
    """
    Returns if the user has bookmarked the venue or not
    """
    # Determine if Venue Exists 
    if db.session.query(Venue).filter_by(vid=vid).first():
        # Determine if venue is bookmarked or not
        bookmark_status = db.session.query(VenueBookmark).filter_by(bookmarked_venue=vid, user_id=current_user().id).one_or_none()
        if bookmark_status is None:
            return {"status": "false"}, 200
        else:
            return {"status": "true"}, 200
    else:
        return {"message": "Venue does not exist"}, 400

@app.route("/api/user/venuebookmarks", methods=["GET"])
@auth_required
def get_users_venue_bookmarks():
    """
    Returns the list of venues the logged in user has bookmarked
    """
    venues = db.session.query(Venue).join(VenueBookmark, VenueBookmark.bookmarked_venue==Venue.vid).filter_by(user_id=current_user().id).all()
    return {"venue_bookmarks": [v.serialize() for v in venues]}, 200

@app.route("/api/bookmarkwedding/<wid>", methods=['POST'])
@auth_required
def bookmark_wedding(wid):
    """
    Toggles whether or not a user has bookmarked the given wedding
    The wedding's wid should be given as a url parameter
    """

    # determine if the user has already bookmarked the wedding
    bookmark_status = db.session.query(WeddingBookmark).filter_by(bookmarked_wedding=wid, user_id=current_user().id).one_or_none()
    if bookmark_status is None:
        # Bookmark the wedding
        bookmark = WeddingBookmark(bookmarked_wedding=wid, user_id=current_user().id)
        db.session.add(bookmark)
        db.session.commit()
        return {"message":"Wedding bookmarked"}, 201
    else:
        # Delete their bookmark
        db.session.query(WeddingBookmark).filter_by(bookmarked_wedding=wid, user_id=current_user().id).delete()
        db.session.commit()
        return {"message":"Wedding unbookmarked"}, 201

@app.route("/api/bookmarkwedding/<wid>", methods=['GET'])
@auth_required
def getWeddingBookmarkStatus(wid):
    """
    Returns if the user has bookmarked the wedding or not
    """
    # Determine if wedding Exists 
    if db.session.query(Wedding).filter_by(wid=wid).first():
        # Determine if wedding is bookmarked or not
        bookmark_status = db.session.query(WeddingBookmark).filter_by(bookmarked_wedding=wid, user_id=current_user().id).one_or_none()
        if bookmark_status is None:
            return {"status": "false"}, 200
        else:
            return {"status": "true"}, 200
    else:
        return {"message": "Wedding does not exist"}, 400

@app.route("/api/user/weddingbookmarks", methods=["GET"])
@auth_required
def get_users_wedding_bookmarks():
    """
    Returns the list of weddings the logged in user has bookmarked
    """
    results = db.session.query(Wedding, User).join(User, User.id==Wedding.host).join(WeddingBookmark, WeddingBookmark.bookmarked_wedding==Wedding.wid).filter_by(user_id=current_user().id).all()
    return {"wedding_bookmarks": [{**result.Wedding.serialize(), **result.User.serialize()} for result in results]}, 200

@app.route("/api/wedding/<wid>/guests", methods=['GET'])
@auth_required
def getWeddingGuests(wid):
    """
    Returns if the list of users attending the given wedding
    """
    # Determine if Wedding Exists 
    if db.session.query(Wedding).filter_by(wid=wid).first():
        # Determine if venue is bookmarked or not
        guests = db.session.query(User).join(Guestlist).filter_by(guest_id=User.id, wedding_id=wid).all()
        return {"guests": [guest.serialize() for guest in guests]}, 200
    else:
        return {"message": "Wedding does not exist"}, 400

@app.route("/api/user/wedding", methods=['GET'])
@auth_required
def getUsersWedding():
    """
    Returns the list of weddings the logged in user is hosting
    """
    results = db.session.query(Wedding, User, Venue)\
                        .join(User, Wedding.host==User.id)\
                        .join(Reservation, Reservation.rid==Wedding.wedding_reservation)\
                        .join(Venue, Venue.vid==Reservation.res_venue)\
                        .filter(current_user().id==User.id)\
                        .filter(Wedding.wedding_datetime >= date.today()).all()
    if results is None :
        return {"status": "none"}, 200
    return {"status": "some", "weddings":[{**result.User.serialize(), **result.Wedding.serialize(), **result.Venue.serialize()} for result in results]}


@app.route("/api/wedding/<wid>/guests/status", methods=['GET'])
@auth_required
def checkAttendanceStatus(wid):
    """
    Returns if the logged-in user is attending the given wedding
    """
    # Determine if Wedding Exists 
    if db.session.query(Wedding).filter_by(wid=wid).first():
        # Determine if venue is bookmarked or not
        attendanceStatus = db.session.query(Guestlist).filter_by(wedding_id=wid, guest_id=current_user().id).one_or_none()
        if attendanceStatus is None:
            return {"status": "false"}, 200
        else:
            return {"status": "true"}, 200
    else:
        return {"message": "Wedding does not exist"}, 400

@app.route("/api/venuesearch/<search_terms>", methods=['GET'])
@auth_required
def venuesearch(search_terms):
    """
    Returns List of Compatible Venues
    searches in "name", "description", "state", or "city"
    
    """
    noreps = []
    results = db.session.query(Venue).filter(Venue.name.ilike("%" + search_terms + "%")).all()
    if not results:
        results = (db.session.query(Venue).filter(Venue.description.ilike("%" + search_terms + "%")).all())
        if not results:
            results = (db.session.query(Venue).filter(Venue.state.ilike("%" + search_terms + "%")).all())
            if not results: 
                results = (db.session.query(Venue).filter(Venue.city.ilike("%" + search_terms + "%")).all())
                if not results:
                    return {"message": "No venues found"}, 400 
                else:
                    for res in results:
                        if res not in noreps:
                            noreps.append(res)
                    return json.dumps([res.serialize() for res in noreps]), 201
            else:
                results+=(db.session.query(Venue).filter(Venue.city.ilike("%" + search_terms + "%")).all())
                for res in results:
                    if res not in noreps:
                        noreps.append(res)
                return json.dumps([res.serialize() for res in noreps]), 201
        else:
            results+=(db.session.query(Venue).filter(Venue.state.ilike("%" + search_terms + "%")).all())
            results+=(db.session.query(Venue).filter(Venue.city.ilike("%" + search_terms + "%")).all())
            for res in results:
                if res not in noreps:
                    noreps.append(res)
            return json.dumps([res.serialize() for res in noreps]), 201
    else:
        results+=(db.session.query(Venue).filter(Venue.description.ilike("%" + search_terms + "%")).all())
        results+=(db.session.query(Venue).filter(Venue.state.ilike("%" + search_terms + "%")).all())
        results+=(db.session.query(Venue).filter(Venue.city.ilike("%" + search_terms + "%")).all())
        for res in results:
                if res not in noreps:
                    noreps.append(res)
        return json.dumps([res.serialize() for res in noreps]), 201

@app.route("/api/weddingsearch/<search_terms>", methods=['GET'])
@auth_required
def weddingsearch(search_terms):
    """
    Returns a list of public weddings 
    searches "description" 
    """

    #.join(User,User.id==Wedding.host).join(Reservation, Reservation.rid==Wedding.wedding_reservation).join(Venue,Venue.vid==Reservation.res_venue)
    noreps = []
    results = db.session.query(Wedding,User,Venue,Reservation).join(User,User.id==Wedding.host).join(Reservation, Reservation.rid==Wedding.wedding_reservation).join(Venue,Venue.vid==Reservation.res_venue).filter(Wedding.description.ilike("%" + search_terms + "%"),Wedding.is_public==True).all()
    if not results:
        results = db.session.query(Wedding,User,Venue,Reservation).join(User,User.id==Wedding.host).join(Reservation, Reservation.rid==Wedding.wedding_reservation).join(Venue,Venue.vid==Reservation.res_venue).filter(User.last_name.ilike("%" + search_terms + "%"),Wedding.is_public==True).all()
        if not results:
            results = db.session.query(Wedding,User,Venue,Reservation).join(User,User.id==Wedding.host).join(Reservation, Reservation.rid==Wedding.wedding_reservation).join(Venue,Venue.vid==Reservation.res_venue).filter(User.first_name.ilike("%" + search_terms + "%"),Wedding.is_public==True).all()
            if not results:
                results = db.session.query(Wedding,User,Venue,Reservation).join(User,User.id==Wedding.host).join(Reservation, Reservation.rid==Wedding.wedding_reservation).join(Venue,Venue.vid==Reservation.res_venue).filter(Venue.name.ilike("%" + search_terms + "%"),Wedding.is_public==True).all()
                if not results:
                    results = db.session.query(Wedding,User,Venue,Reservation).join(User,User.id==Wedding.host).join(Reservation, Reservation.rid==Wedding.wedding_reservation).join(Venue,Venue.vid==Reservation.res_venue).filter(Venue.city.ilike("%" + search_terms + "%"),Wedding.is_public==True).all()
                    if not results: 
                        results = db.session.query(Wedding,User,Venue,Reservation).join(User,User.id==Wedding.host).join(Reservation, Reservation.rid==Wedding.wedding_reservation).join(Venue,Venue.vid==Reservation.res_venue).filter(Venue.state.ilike("%" + search_terms + "%"),Wedding.is_public==True).all()
                        if not results:
                            return {"message": "No weddings found"}, 400 
                        else:
                            for res in results:
                                if res not in noreps:
                                    noreps.append(res)
                            return {"search_results" : [{**res.Wedding.serialize(), **res.User.serialize(), **res.Venue.serialize(), **res.Reservation.serialize()} for res in noreps]}, 201 
                    else:
                        results += db.session.query(Wedding,User,Venue,Reservation).join(User,User.id==Wedding.host).join(Reservation, Reservation.rid==Wedding.wedding_reservation).join(Venue,Venue.vid==Reservation.res_venue).filter(Venue.state.ilike("%" + search_terms + "%"),Wedding.is_public==True).all()
                        for res in results:
                            if res not in noreps:
                                noreps.append(res)
                        return {"search_results" : [{**res.Wedding.serialize(), **res.User.serialize(), **res.Venue.serialize(), **res.Reservation.serialize()} for res in noreps]}, 201 
                else:
                    results += db.session.query(Wedding,User,Venue,Reservation).join(User,User.id==Wedding.host).join(Reservation, Reservation.rid==Wedding.wedding_reservation).join(Venue,Venue.vid==Reservation.res_venue).filter(Venue.city.ilike("%" + search_terms + "%"),Wedding.is_public==True).all()
                    results += db.session.query(Wedding,User,Venue,Reservation).join(User,User.id==Wedding.host).join(Reservation, Reservation.rid==Wedding.wedding_reservation).join(Venue,Venue.vid==Reservation.res_venue).filter(Venue.state.ilike("%" + search_terms + "%"),Wedding.is_public==True).all()
                    for res in results:
                        if res not in noreps:
                            noreps.append(res)
                    return {"search_results" : [{**res.Wedding.serialize(), **res.User.serialize(), **res.Venue.serialize(), **res.Reservation.serialize()} for res in noreps]}, 201 
            else:
                results += db.session.query(Wedding,User,Venue,Reservation).join(User,User.id==Wedding.host).join(Reservation, Reservation.rid==Wedding.wedding_reservation).join(Venue,Venue.vid==Reservation.res_venue).filter(Venue.name.ilike("%" + search_terms + "%"),Wedding.is_public==True).all()                
                results += db.session.query(Wedding,User,Venue,Reservation).join(User,User.id==Wedding.host).join(Reservation, Reservation.rid==Wedding.wedding_reservation).join(Venue,Venue.vid==Reservation.res_venue).filter(Venue.city.ilike("%" + search_terms + "%"),Wedding.is_public==True).all()
                results += db.session.query(Wedding,User,Venue,Reservation).join(User,User.id==Wedding.host).join(Reservation, Reservation.rid==Wedding.wedding_reservation).join(Venue,Venue.vid==Reservation.res_venue).filter(Venue.state.ilike("%" + search_terms + "%"),Wedding.is_public==True).all()
                for res in results:
                    if res not in noreps:
                        noreps.append(res)
                return {"search_results" : [{**res.Wedding.serialize(), **res.User.serialize(), **res.Venue.serialize(), **res.Reservation.serialize()} for res in noreps]}, 201 
        else: 
            results += db.session.query(Wedding,User,Venue,Reservation).join(User,User.id==Wedding.host).join(Reservation, Reservation.rid==Wedding.wedding_reservation).join(Venue,Venue.vid==Reservation.res_venue).filter(User.first_name.ilike("%" + search_terms + "%"),Wedding.is_public==True).all()    
            results += db.session.query(Wedding,User,Venue,Reservation).join(User,User.id==Wedding.host).join(Reservation, Reservation.rid==Wedding.wedding_reservation).join(Venue,Venue.vid==Reservation.res_venue).filter(Venue.name.ilike("%" + search_terms + "%"),Wedding.is_public==True).all()                
            results += db.session.query(Wedding,User,Venue,Reservation).join(User,User.id==Wedding.host).join(Reservation, Reservation.rid==Wedding.wedding_reservation).join(Venue,Venue.vid==Reservation.res_venue).filter(Venue.city.ilike("%" + search_terms + "%"),Wedding.is_public==True).all()
            results += db.session.query(Wedding,User,Venue,Reservation).join(User,User.id==Wedding.host).join(Reservation, Reservation.rid==Wedding.wedding_reservation).join(Venue,Venue.vid==Reservation.res_venue).filter(Venue.state.ilike("%" + search_terms + "%"),Wedding.is_public==True).all()                
            for res in results:
                if res not in noreps:
                    noreps.append(res)
            return {"search_results" : [{**res.Wedding.serialize(), **res.User.serialize(), **res.Venue.serialize(), **res.Reservation.serialize()} for res in noreps]}, 201 
    else:
        results += db.session.query(Wedding,User,Venue,Reservation).join(User,User.id==Wedding.host).join(Reservation, Reservation.rid==Wedding.wedding_reservation).join(Venue,Venue.vid==Reservation.res_venue).filter(User.last_name.ilike("%" + search_terms + "%"),Wedding.is_public==True).all()
        results += db.session.query(Wedding,User,Venue,Reservation).join(User,User.id==Wedding.host).join(Reservation, Reservation.rid==Wedding.wedding_reservation).join(Venue,Venue.vid==Reservation.res_venue).filter(User.first_name.ilike("%" + search_terms + "%"),Wedding.is_public==True).all()    
        results += db.session.query(Wedding,User,Venue,Reservation).join(User,User.id==Wedding.host).join(Reservation, Reservation.rid==Wedding.wedding_reservation).join(Venue,Venue.vid==Reservation.res_venue).filter(Venue.name.ilike("%" + search_terms + "%"),Wedding.is_public==True).all()                
        results += db.session.query(Wedding,User,Venue,Reservation).join(User,User.id==Wedding.host).join(Reservation, Reservation.rid==Wedding.wedding_reservation).join(Venue,Venue.vid==Reservation.res_venue).filter(Venue.city.ilike("%" + search_terms + "%"),Wedding.is_public==True).all()
        results += db.session.query(Wedding,User,Venue,Reservation).join(User,User.id==Wedding.host).join(Reservation, Reservation.rid==Wedding.wedding_reservation).join(Venue,Venue.vid==Reservation.res_venue).filter(Venue.state.ilike("%" + search_terms + "%"),Wedding.is_public==True).all()      
        for res in results:
            if res not in noreps:
                noreps.append(res)
        return {"search_results" : [{**res.Wedding.serialize(), **res.User.serialize(), **res.Venue.serialize(), **res.Reservation.serialize()} for res in noreps]}, 201

@app.route("/api/togglepublic/<wid>", methods=['POST'])
@auth_required
def togglepublic(wid):
    wedding = db.session.query(Wedding).filter_by(wid=wid).first()
    if wedding:
        if(wedding.is_public):
            wedding.is_public = False
            db.session.commit()
            return wedding.serialize(), 200
        else:
            wedding.is_public = True    
            db.session.commit()
            return wedding.serialize(), 200
    else:
        return {"message": "No such wedding"}, 400
    
@app.route("/api/togglersvp/<wid>", methods=['POST'])
@auth_required
def togglersvp(wid):
    register_uuid() 

    wedding = db.session.query(Wedding).filter_by(wid=wid).first()
    if wedding:
        rsvp = db.session.query(Guestlist).filter_by(guest_id=current_user().id, wedding_id=wid).first() 
        if rsvp:
            rsvp = db.session.query(Guestlist).filter_by(guest_id=current_user().id, wedding_id=wid).delete()
            db.session.commit()
            return {"message": "rescind RSVP"}, 200
        else:
            rsvp = Guestlist(guest_id=current_user().id,wedding_id=wid)
            db.session.add(rsvp)
            db.session.commit()     
            return {"message": "RSVP"}, 200
    else:
        return {"message": "No such wedding"}, 400 

api.add_resource(HelloApiHandler, '/flask/hello')