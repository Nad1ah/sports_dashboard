from src.main import db
from datetime import datetime

class Match(db.Model):
    __tablename__ = 'matches'
    
    id = db.Column(db.Integer, primary_key=True)
    date = db.Column(db.DateTime, nullable=False)
    home_team_id = db.Column(db.Integer, db.ForeignKey('teams.id'), nullable=False)
    away_team_id = db.Column(db.Integer, db.ForeignKey('teams.id'), nullable=False)
    home_score = db.Column(db.Integer, default=0)
    away_score = db.Column(db.Integer, default=0)
    season = db.Column(db.String(20), nullable=False)
    competition = db.Column(db.String(100), nullable=False)
    venue = db.Column(db.String(100))
    status = db.Column(db.String(20), default='scheduled')  # scheduled, live, completed, postponed, cancelled
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    # Relacionamentos
    statistics = db.relationship('Statistic', backref='match', lazy=True)
    
    def __repr__(self):
        return f'<Match {self.home_team_id} vs {self.away_team_id} on {self.date}>'
    
    def to_dict(self):
        return {
            'id': self.id,
            'date': self.date.isoformat(),
            'home_team_id': self.home_team_id,
            'away_team_id': self.away_team_id,
            'home_score': self.home_score,
            'away_score': self.away_score,
            'season': self.season,
            'competition': self.competition,
            'venue': self.venue,
            'status': self.status,
            'created_at': self.created_at.isoformat()
        }
