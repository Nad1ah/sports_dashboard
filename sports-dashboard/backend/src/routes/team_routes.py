from flask import Blueprint, jsonify, request
from flask_jwt_extended import jwt_required, get_jwt_identity
from src.models import Team
import pandas as pd

bp = Blueprint('team', __name__, url_prefix='/api/teams')

@bp.route('/', methods=['GET'])
@jwt_required()
def get_teams():
    teams = Team.query.all()
    return jsonify({
        'teams': [team.to_dict() for team in teams]
    }), 200

@bp.route('/<int:team_id>', methods=['GET'])
@jwt_required()
def get_team(team_id):
    team = Team.query.get(team_id)
    
    if not team:
        return jsonify({'error': 'Equipa não encontrada.'}), 404
    
    return jsonify({
        'team': team.to_dict()
    }), 200

@bp.route('/', methods=['POST'])
@jwt_required()
def create_team():
    data = request.get_json()
    
    # Verificar se os campos obrigatórios estão presentes
    if not data or not data.get('name') or not data.get('country') or not data.get('league'):
        return jsonify({'error': 'Dados incompletos. Nome, país e liga são obrigatórios.'}), 400
    
    # Criar nova equipa
    new_team = Team(
        name=data['name'],
        country=data['country'],
        league=data['league'],
        founded_year=data.get('founded_year'),
        logo_url=data.get('logo_url')
    )
    
    try:
        from src.main import db
        db.session.add(new_team)
        db.session.commit()
        
        return jsonify({
            'message': 'Equipa criada com sucesso!',
            'team': new_team.to_dict()
        }), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': f'Erro ao criar equipa: {str(e)}'}), 500

@bp.route('/<int:team_id>', methods=['PUT', 'PATCH'])
@jwt_required()
def update_team(team_id):
    team = Team.query.get(team_id)
    
    if not team:
        return jsonify({'error': 'Equipa não encontrada.'}), 404
    
    data = request.get_json()
    
    # Atualizar campos permitidos
    if data.get('name'):
        team.name = data['name']
    if data.get('country'):
        team.country = data['country']
    if data.get('league'):
        team.league = data['league']
    if 'founded_year' in data:
        team.founded_year = data['founded_year']
    if 'logo_url' in data:
        team.logo_url = data['logo_url']
    
    try:
        from src.main import db
        db.session.commit()
        return jsonify({
            'message': 'Equipa atualizada com sucesso!',
            'team': team.to_dict()
        }), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': f'Erro ao atualizar equipa: {str(e)}'}), 500

@bp.route('/<int:team_id>', methods=['DELETE'])
@jwt_required()
def delete_team(team_id):
    team = Team.query.get(team_id)
    
    if not team:
        return jsonify({'error': 'Equipa não encontrada.'}), 404
    
    try:
        from src.main import db
        db.session.delete(team)
        db.session.commit()
        return jsonify({
            'message': 'Equipa eliminada com sucesso!'
        }), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': f'Erro ao eliminar equipa: {str(e)}'}), 500

@bp.route('/<int:team_id>/players', methods=['GET'])
@jwt_required()
def get_team_players(team_id):
    team = Team.query.get(team_id)
    
    if not team:
        return jsonify({'error': 'Equipa não encontrada.'}), 404
    
    return jsonify({
        'players': [player.to_dict() for player in team.players]
    }), 200

@bp.route('/<int:team_id>/matches', methods=['GET'])
@jwt_required()
def get_team_matches(team_id):
    team = Team.query.get(team_id)
    
    if not team:
        return jsonify({'error': 'Equipa não encontrada.'}), 404
    
    # Combinar jogos em casa e fora
    all_matches = team.home_matches + team.away_matches
    
    # Ordenar por data (mais recente primeiro)
    all_matches.sort(key=lambda x: x.date, reverse=True)
    
    return jsonify({
        'matches': [match.to_dict() for match in all_matches]
    }), 200

@bp.route('/<int:team_id>/statistics', methods=['GET'])
@jwt_required()
def get_team_statistics(team_id):
    team = Team.query.get(team_id)
    
    if not team:
        return jsonify({'error': 'Equipa não encontrada.'}), 404
    
    # Combinar jogos em casa e fora
    home_matches = team.home_matches
    away_matches = team.away_matches
    all_matches = home_matches + away_matches
    
    # Calcular estatísticas básicas
    total_matches = len(all_matches)
    
    if total_matches == 0:
        return jsonify({
            'team_id': team_id,
            'team_name': team.name,
            'total_matches': 0,
            'wins': 0,
            'draws': 0,
            'losses': 0,
            'goals_scored': 0,
            'goals_conceded': 0,
            'win_percentage': 0,
            'form': []
        }), 200
    
    # Calcular vitórias, empates e derrotas
    wins = 0
    draws = 0
    losses = 0
    goals_scored = 0
    goals_conceded = 0
    form = []  # últimos 5 jogos: W (vitória), D (empate), L (derrota)
    
    for match in all_matches:
        if match.status != 'completed':
            continue
            
        if match.home_team_id == team_id:
            goals_scored += match.home_score
            goals_conceded += match.away_score
            
            if match.home_score > match.away_score:
                wins += 1
                form.append('W')
            elif match.home_score == match.away_score:
                draws += 1
                form.append('D')
            else:
                losses += 1
                form.append('L')
        else:  # away_team_id == team_id
            goals_scored += match.away_score
            goals_conceded += match.home_score
            
            if match.away_score > match.home_score:
                wins += 1
                form.append('W')
            elif match.away_score == match.home_score:
                draws += 1
                form.append('D')
            else:
                losses += 1
                form.append('L')
    
    # Calcular percentagem de vitórias
    completed_matches = wins + draws + losses
    win_percentage = (wins / completed_matches * 100) if completed_matches > 0 else 0
    
    # Obter apenas os últimos 5 jogos para o form
    form = form[:5]
    
    return jsonify({
        'team_id': team_id,
        'team_name': team.name,
        'total_matches': total_matches,
        'wins': wins,
        'draws': draws,
        'losses': losses,
        'goals_scored': goals_scored,
        'goals_conceded': goals_conceded,
        'win_percentage': win_percentage,
        'form': form
    }), 200
