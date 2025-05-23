from src.main import db
from src.models.user import User
from src.models.team import Team
from src.models.player import Player
from src.models.match import Match
from src.models.statistic import Statistic

# Exportar todos os modelos para facilitar importação
__all__ = ['User', 'Team', 'Player', 'Match', 'Statistic']
