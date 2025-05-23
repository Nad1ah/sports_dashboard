import os
import sys
sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))  # Configuração necessária para imports

from flask import Flask, jsonify, request
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
from flask_jwt_extended import JWTManager, jwt_required, create_access_token, get_jwt_identity
import pandas as pd
import numpy as np
import datetime

# Inicializar aplicação Flask
app = Flask(__name__)

# Configuração
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///sports_analytics.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['JWT_SECRET_KEY'] = 'sports_dashboard_secret_key'
app.config['JWT_ACCESS_TOKEN_EXPIRES'] = datetime.timedelta(days=1)

# Inicializar extensões
db = SQLAlchemy(app)
jwt = JWTManager(app)
CORS(app)

# Importar modelos e rotas (serão implementados em seguida)
from src.models import User, Team, Player, Match, Statistic
from src.routes import auth_routes, team_routes, player_routes, match_routes, analytics_routes

# Registrar blueprints
app.register_blueprint(auth_routes.bp)
app.register_blueprint(team_routes.bp)
app.register_blueprint(player_routes.bp)
app.register_blueprint(match_routes.bp)
app.register_blueprint(analytics_routes.bp)

# Rota de teste
@app.route('/')
def index():
    return jsonify({"message": "API do Dashboard de Análise de Dados Desportivos está funcionando!"})

# Criar tabelas do banco de dados
@app.before_first_request
def create_tables():
    db.create_all()

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)
