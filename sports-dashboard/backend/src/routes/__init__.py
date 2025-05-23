from flask import Blueprint, jsonify, request
from flask_jwt_extended import jwt_required, get_jwt_identity
import os

# Importar todos os blueprints
from src.routes.auth_routes import bp as auth_bp
from src.routes.team_routes import bp as team_bp
from src.routes.player_routes import bp as player_bp
from src.routes.match_routes import bp as match_bp
from src.routes.analytics_routes import bp as analytics_bp

# Exportar todos os blueprints para facilitar importação
__all__ = ['auth_bp', 'team_bp', 'player_bp', 'match_bp', 'analytics_bp']
