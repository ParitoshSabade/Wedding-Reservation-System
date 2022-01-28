from sqlalchemy.sql.expression import desc
from app import db
from sqlalchemy.dialects.postgresql import UUID, ARRAY, DATERANGE
from sqlalchemy import ForeignKey
import uuid
from psycopg2.extras import DateRange
from datetime import datetime

class User(db.Model):
    __tablename__ = 'users'

    id = db.Column(UUID(as_uuid=True), primary_key=True)
    first_name = db.Column(db.String(), nullable=False)
    last_name = db.Column(db.String(), nullable=False)
    email = db.Column(db.String(), unique=True, nullable=False)
    password_hash = db.Column(db.String(), nullable=False)
    is_active = db.Column(db.Boolean(), default=True, server_default='true')

    def __init__(self, first_name, last_name, email, password_hash):
        self.id = uuid.uuid4()
        self.first_name = first_name
        self.last_name = last_name
        self.email = email
        self.password_hash = password_hash

    def __repr__(self) -> str:
        return f'<User {self.id}>'

    def __str__(self) -> str:
        return self.first_name + " " + self.last_name

    def serialize(self) -> dict:
        return {
            "id": str(self.id),
            "first_name": self.first_name,
            "last_name": self.last_name,
            "email": self.email
        }        

    @classmethod
    def lookup(cls, email):
        """
        Used by Flask-Praetorian
        """
        return cls.query.filter_by(email=email).one_or_none()

    @classmethod
    def identify(cls, id):
        """
        Used by Flask-Praetorian
        """
        return cls.query.get(id)

    @property
    def identity(self):
        """
        Used by Flask-Praetorian
        """
        return str(self.id)

    @property
    def username(self):
        """
        Username property that is used by Flask-Praetorian.
        Enables authentication with email instead of a separate username.
        """
        return self.email

    @property
    def password(self):
        """
        Password property that is used by Flask-Praetorian.
        Enables authentication without renaming our password_hash column.
        """
        return self.password_hash

    @property
    def rolenames(self):
        """
        Flask-Praetorian requires the rolenames property, but no roles are needed.
        It is possible to disable this requirement in Flask-Praetorian, which should
        be done at some point.
        """
        return []

    def is_valid(self):
        return self.is_active

class Venue(db.Model):
    __tablename__ = 'venues'

    vid = db.Column(UUID(as_uuid=True), primary_key=True)
    owner = db.Column(UUID(as_uuid=True),ForeignKey('users.id'), nullable=False)
    name = db.Column(db.String(), unique=True, nullable=False)
    description = db.Column(db.String(), nullable=False)
    street_address = db.Column(db.String(), nullable=False)
    city = db.Column(db.String(), nullable=False)
    state = db.Column(db.String(), nullable=False)
    zipcode = db.Column(db.Integer(), nullable=False)
    pictures = db.Column(ARRAY(db.String()), nullable=False)

    def __init__(self, owner:UUID, name:str, description:str, street_address:str, city:str, state:str, zipcode:int, pictures:'list[str]'):
        self.vid = uuid.uuid4()
        self.owner = owner
        self.name = name
        self.description = description
        self.street_address = street_address
        self.city = city
        self.state = state
        self.zipcode = zipcode
        self.pictures = pictures

    def serialize(self) -> dict:
        details_dict = {
            "vid": str(self.vid),
            "owner" : str(self.owner),
            "name" : self.name,
            "description" : self.description,
            "street_address" : self.street_address,
            "city" : self.city,
            "state" : self.state,
            "zipcode" : self.zipcode,
            "pictures" : self.pictures
        }
        return details_dict

    def __repr__(self) -> str:
        return f'<Venue {self.vid}>'

    def __str__(self) -> str:
        return self.name + " - " + self.owner

class Reservation(db.Model):
    __tablename__ = 'reservations'

    rid = db.Column(UUID(as_uuid=True), primary_key=True)
    res_dates = db.Column(DATERANGE, nullable=False)
    res_venue = db.Column(UUID(as_uuid=True), ForeignKey('venues.vid'), nullable=False)
    holder = db.Column(UUID(as_uuid=True), ForeignKey('users.id'), nullable=False)

    def __init__(self, res_dates:DateRange, res_venue:UUID, holder:UUID):
        self.rid = uuid.uuid4()
        self.res_dates = res_dates
        self.res_venue = res_venue
        self.holder = holder

    def serialize(self) -> dict:
        return {
            "rid" : self.rid,
            "start_date" : self.res_dates.lower,
            "end_date" : self.res_dates.upper,
            "venue" : self.res_venue,
            "holder" : self.holder
        }
    def __repr__(self) -> str:
        return f'<Reservation {self.rid}>'

    def __str__(self) -> str:
        return str(self.res_dates) + " " + str(self.res_venue) + " " + str(self.holder)

class Wedding(db.Model):
    __tablename__ = 'weddings'

    wid = db.Column(UUID(as_uuid=True), primary_key=True)
    host = db.Column(UUID(as_uuid=True),ForeignKey('users.id'), nullable=False)
    description = db.Column(db.String(), nullable=False)
    is_public = db.Column(db.Boolean(), nullable=False, default=False)
    wedding_reservation = db.Column(UUID(as_uuid=True), ForeignKey('reservations.rid'), nullable=False)
    wedding_datetime = db.Column(db.DateTime(), nullable=False)

    def __init__(self, host:UUID, description:str, is_public:bool, wedding_reservation:UUID, wedding_datetime:datetime):
        self.wid = uuid.uuid4()
        self.host = host
        self.description = description
        self.is_public = is_public
        self.wedding_reservation = wedding_reservation
        self.wedding_datetime = wedding_datetime

    def __repr__(self) -> str:
        return f'<Wedding {self.wid}>'

    def __str__(self) -> str:
        return str(self.host) + " " + str(self.res_venue) + " " + str(self.holder)

    def serialize(self):
        return {"wid": str(self.wid),
                "host": str(self.host),
                "description": self.description,
                "date": str(self.wedding_datetime),
                "is_public": str(self.is_public)}
                
class Guestlist(db.Model):
    __tablename__ = 'guestlist'

    gid = db.Column(UUID(as_uuid=True), primary_key=True)
    guest_id = db.Column(UUID(as_uuid=True), ForeignKey('users.id', ondelete="cascade"), nullable=False)
    wedding_id = db.Column(UUID(as_uuid=True), ForeignKey('weddings.wid', ondelete="cascade"), nullable=False)

    def __init__(self, guest_id:UUID, wedding_id:UUID):
        self.gid = uuid.uuid4()
        self.guest_id = guest_id
        self.wedding_id = wedding_id
                        
    def serialize(self) -> dict:
        return {
            "gid" : str(self.gid),
            "guest_id" : str(self.guest_id),
            "wedding_id" : str(self.wedding_id)}

    def __repr__(self) -> str:
        return f'<Guestlist {self.gid}>'

class VenueBookmark(db.Model):
    bookmarked_venue = db.Column(UUID(as_uuid=True), ForeignKey('venues.vid', ondelete="cascade"),primary_key=True)
    user_id = db.Column(UUID(as_uuid=True), ForeignKey('users.id', ondelete="cascade"), primary_key=True)


    def __init__(self, bookmarked_venue:UUID, user_id:UUID):
        self.bookmarked_venue = bookmarked_venue
        self.user_id = user_id

class WeddingBookmark(db.Model):
    bookmarked_wedding = db.Column(UUID(as_uuid=True), ForeignKey('weddings.wid', ondelete="cascade"),primary_key=True)
    user_id = db.Column(UUID(as_uuid=True), ForeignKey('users.id', ondelete="cascade"), primary_key=True)

    def __init__(self, bookmarked_wedding:UUID, user_id:UUID):
        self.bookmarked_wedding = bookmarked_wedding
        self.user_id = user_id