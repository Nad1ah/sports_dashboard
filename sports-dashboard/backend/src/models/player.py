from src.main import db
from datetime import datetime

class Player(db.Model):
    __tablename__ = 'players'
    
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    position = db.Column(db.String(50), nullable=False)
    nationality = db.Column(db.String(50), nullable=False)
    birth_date = db.Column(db.Date)
    height = db.Column(db.Float)  # em cm
    weight = db.Column(db.Float)  # em kg
    jersey_number = db.Column(db.Integer)
    team_id = db.Column(db.Integer, db.ForeignKey('teams.id'), nullable=False)
    photo_url = db.Column(db.String(255))
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    # Relacionamentos
    statistics = db.relationship('Statistic', backref='player', lazy=True)
    
    def __repr__(self):
        return f'<Player {self.name}>'
    
    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'position': self.position,
            'nationality': self.nationality,
            'birth_date': self.birth_date.isoformat() if self.birth_date else None,
            'height': self.height,
            'weight': self.weight,
            'jersey_number': self.jersey_number,
            'team_id': self.team_id,
            'photo_url': self.photo_url,
            'created_at': self.created_at.isoformat()
        }
