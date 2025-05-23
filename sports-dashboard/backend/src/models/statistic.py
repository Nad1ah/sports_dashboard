from src.main import db
from datetime import datetime

class Statistic(db.Model):
    __tablename__ = 'statistics'
    
    id = db.Column(db.Integer, primary_key=True)
    match_id = db.Column(db.Integer, db.ForeignKey('matches.id'), nullable=False)
    player_id = db.Column(db.Integer, db.ForeignKey('players.id'), nullable=False)
    
    # Estatísticas gerais
    minutes_played = db.Column(db.Integer, default=0)
    
    # Estatísticas ofensivas
    goals = db.Column(db.Integer, default=0)
    assists = db.Column(db.Integer, default=0)
    shots = db.Column(db.Integer, default=0)
    shots_on_target = db.Column(db.Integer, default=0)
    key_passes = db.Column(db.Integer, default=0)
    dribbles_completed = db.Column(db.Integer, default=0)
    
    # Estatísticas defensivas
    tackles = db.Column(db.Integer, default=0)
    interceptions = db.Column(db.Integer, default=0)
    clearances = db.Column(db.Integer, default=0)
    blocks = db.Column(db.Integer, default=0)
    
    # Estatísticas de posse
    passes = db.Column(db.Integer, default=0)
    passes_completed = db.Column(db.Integer, default=0)
    pass_accuracy = db.Column(db.Float, default=0.0)  # em percentagem
    
    # Estatísticas disciplinares
    yellow_cards = db.Column(db.Integer, default=0)
    red_cards = db.Column(db.Integer, default=0)
    fouls_committed = db.Column(db.Integer, default=0)
    fouls_suffered = db.Column(db.Integer, default=0)
    
    # Estatísticas específicas por posição
    # Guarda-redes
    saves = db.Column(db.Integer, default=0)
    goals_conceded = db.Column(db.Integer, default=0)
    clean_sheets = db.Column(db.Boolean, default=False)
    
    # Avançados
    expected_goals = db.Column(db.Float, default=0.0)
    conversion_rate = db.Column(db.Float, default=0.0)  # em percentagem
    
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    def __repr__(self):
        return f'<Statistic Player {self.player_id} in Match {self.match_id}>'
    
    def to_dict(self):
        return {
            'id': self.id,
            'match_id': self.match_id,
            'player_id': self.player_id,
            'minutes_played': self.minutes_played,
            'goals': self.goals,
            'assists': self.assists,
            'shots': self.shots,
            'shots_on_target': self.shots_on_target,
            'key_passes': self.key_passes,
            'dribbles_completed': self.dribbles_completed,
            'tackles': self.tackles,
            'interceptions': self.interceptions,
            'clearances': self.clearances,
            'blocks': self.blocks,
            'passes': self.passes,
            'passes_completed': self.passes_completed,
            'pass_accuracy': self.pass_accuracy,
            'yellow_cards': self.yellow_cards,
            'red_cards': self.red_cards,
            'fouls_committed': self.fouls_committed,
            'fouls_suffered': self.fouls_suffered,
            'saves': self.saves,
            'goals_conceded': self.goals_conceded,
            'clean_sheets': self.clean_sheets,
            'expected_goals': self.expected_goals,
            'conversion_rate': self.conversion_rate,
            'created_at': self.created_at.isoformat()
        }
