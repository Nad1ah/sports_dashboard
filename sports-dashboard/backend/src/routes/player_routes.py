from flask import Blueprint, jsonify, request
from flask_jwt_extended import jwt_required, get_jwt_identity
from src.models import Player, Team, Statistic
import pandas as pd

bp = Blueprint('player', __name__, url_prefix='/api/players')

@bp.route('/', methods=['GET'])
@jwt_required()
def get_players():
    # Suporte para filtros
    team_id = request.args.get('team_id', type=int)
    position = request.args.get('position')
    nationality = request.args.get('nationality')
    
    query = Player.query
    
    if team_id:
        query = query.filter_by(team_id=team_id)
    if position:
        query = query.filter_by(position=position)
    if nationality:
        query = query.filter_by(nationality=nationality)
    
    players = query.all()
    
    return jsonify({
        'players': [player.to_dict() for player in players]
    }), 200

@bp.route('/<int:player_id>', methods=['GET'])
@jwt_required()
def get_player(player_id):
    player = Player.query.get(player_id)
    
    if not player:
        return jsonify({'error': 'Jogador não encontrado.'}), 404
    
    return jsonify({
        'player': player.to_dict()
    }), 200

@bp.route('/', methods=['POST'])
@jwt_required()
def create_player():
    data = request.get_json()
    
    # Verificar se os campos obrigatórios estão presentes
    if not data or not data.get('name') or not data.get('position') or not data.get('nationality') or not data.get('team_id'):
        return jsonify({'error': 'Dados incompletos. Nome, posição, nacionalidade e ID da equipa são obrigatórios.'}), 400
    
    # Verificar se a equipa existe
    team = Team.query.get(data['team_id'])
    if not team:
        return jsonify({'error': 'Equipa não encontrada.'}), 404
    
    # Criar novo jogador
    new_player = Player(
        name=data['name'],
        position=data['position'],
        nationality=data['nationality'],
        team_id=data['team_id'],
        birth_date=data.get('birth_date'),
        height=data.get('height'),
        weight=data.get('weight'),
        jersey_number=data.get('jersey_number'),
        photo_url=data.get('photo_url')
    )
    
    try:
        from src.main import db
        db.session.add(new_player)
        db.session.commit()
        
        return jsonify({
            'message': 'Jogador criado com sucesso!',
            'player': new_player.to_dict()
        }), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': f'Erro ao criar jogador: {str(e)}'}), 500

@bp.route('/<int:player_id>', methods=['PUT', 'PATCH'])
@jwt_required()
def update_player(player_id):
    player = Player.query.get(player_id)
    
    if not player:
        return jsonify({'error': 'Jogador não encontrado.'}), 404
    
    data = request.get_json()
    
    # Atualizar campos permitidos
    if data.get('name'):
        player.name = data['name']
    if data.get('position'):
        player.position = data['position']
    if data.get('nationality'):
        player.nationality = data['nationality']
    if data.get('team_id'):
        # Verificar se a equipa existe
        team = Team.query.get(data['team_id'])
        if not team:
            return jsonify({'error': 'Equipa não encontrada.'}), 404
        player.team_id = data['team_id']
    if 'birth_date' in data:
        player.birth_date = data['birth_date']
    if 'height' in data:
        player.height = data['height']
    if 'weight' in data:
        player.weight = data['weight']
    if 'jersey_number' in data:
        player.jersey_number = data['jersey_number']
    if 'photo_url' in data:
        player.photo_url = data['photo_url']
    
    try:
        from src.main import db
        db.session.commit()
        return jsonify({
            'message': 'Jogador atualizado com sucesso!',
            'player': player.to_dict()
        }), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': f'Erro ao atualizar jogador: {str(e)}'}), 500

@bp.route('/<int:player_id>', methods=['DELETE'])
@jwt_required()
def delete_player(player_id):
    player = Player.query.get(player_id)
    
    if not player:
        return jsonify({'error': 'Jogador não encontrado.'}), 404
    
    try:
        from src.main import db
        db.session.delete(player)
        db.session.commit()
        return jsonify({
            'message': 'Jogador eliminado com sucesso!'
        }), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': f'Erro ao eliminar jogador: {str(e)}'}), 500

@bp.route('/<int:player_id>/statistics', methods=['GET'])
@jwt_required()
def get_player_statistics(player_id):
    player = Player.query.get(player_id)
    
    if not player:
        return jsonify({'error': 'Jogador não encontrado.'}), 404
    
    # Obter todas as estatísticas do jogador
    statistics = Statistic.query.filter_by(player_id=player_id).all()
    
    if not statistics:
        return jsonify({
            'player_id': player_id,
            'player_name': player.name,
            'total_matches': 0,
            'total_minutes': 0,
            'goals': 0,
            'assists': 0,
            'shots': 0,
            'shots_on_target': 0,
            'shot_accuracy': 0,
            'passes': 0,
            'pass_accuracy': 0,
            'tackles': 0,
            'interceptions': 0,
            'match_statistics': []
        }), 200
    
    # Calcular estatísticas agregadas
    total_matches = len(statistics)
    total_minutes = sum(stat.minutes_played for stat in statistics)
    total_goals = sum(stat.goals for stat in statistics)
    total_assists = sum(stat.assists for stat in statistics)
    total_shots = sum(stat.shots for stat in statistics)
    total_shots_on_target = sum(stat.shots_on_target for stat in statistics)
    total_passes = sum(stat.passes for stat in statistics)
    total_passes_completed = sum(stat.passes_completed for stat in statistics)
    total_tackles = sum(stat.tackles for stat in statistics)
    total_interceptions = sum(stat.interceptions for stat in statistics)
    
    # Calcular médias e percentagens
    shot_accuracy = (total_shots_on_target / total_shots * 100) if total_shots > 0 else 0
    pass_accuracy = (total_passes_completed / total_passes * 100) if total_passes > 0 else 0
    
    # Estatísticas por jogo
    match_statistics = []
    for stat in statistics:
        match_stat = {
            'match_id': stat.match_id,
            'minutes_played': stat.minutes_played,
            'goals': stat.goals,
            'assists': stat.assists,
            'shots': stat.shots,
            'shots_on_target': stat.shots_on_target,
            'passes': stat.passes,
            'pass_accuracy': stat.pass_accuracy,
            'tackles': stat.tackles,
            'interceptions': stat.interceptions
        }
        match_statistics.append(match_stat)
    
    return jsonify({
        'player_id': player_id,
        'player_name': player.name,
        'total_matches': total_matches,
        'total_minutes': total_minutes,
        'goals': total_goals,
        'assists': total_assists,
        'shots': total_shots,
        'shots_on_target': total_shots_on_target,
        'shot_accuracy': shot_accuracy,
        'passes': total_passes,
        'pass_accuracy': pass_accuracy,
        'tackles': total_tackles,
        'interceptions': total_interceptions,
        'match_statistics': match_statistics
    }), 200

@bp.route('/<int:player_id>/performance', methods=['GET'])
@jwt_required()
def get_player_performance(player_id):
    player = Player.query.get(player_id)
    
    if not player:
        return jsonify({'error': 'Jogador não encontrado.'}), 404
    
    # Obter todas as estatísticas do jogador
    statistics = Statistic.query.filter_by(player_id=player_id).all()
    
    if not statistics:
        return jsonify({
            'player_id': player_id,
            'player_name': player.name,
            'performance_rating': 0,
            'strengths': [],
            'weaknesses': [],
            'form': []
        }), 200
    
    # Calcular rating de performance (exemplo simplificado)
    # Na prática, usaríamos algoritmos mais complexos baseados em múltiplos fatores
    performance_scores = []
    form = []  # últimos 5 jogos
    
    for stat in statistics:
        # Cálculo simplificado de pontuação por jogo
        score = 0
        
        # Contribuições ofensivas
        score += stat.goals * 3  # Gols valem mais
        score += stat.assists * 2
        score += stat.shots_on_target * 0.5
        
        # Contribuições defensivas
        score += stat.tackles * 0.5
        score += stat.interceptions * 0.5
        
        # Contribuições de posse
        score += (stat.pass_accuracy / 100) * 5 if stat.pass_accuracy > 0 else 0
        
        # Normalizar pela quantidade de minutos jogados
        if stat.minutes_played > 0:
            score = score / (stat.minutes_played / 90)  # Normalizar para 90 minutos
        
        performance_scores.append(score)
        form.append(score)
    
    # Calcular média de performance
    avg_performance = sum(performance_scores) / len(performance_scores) if performance_scores else 0
    
    # Identificar pontos fortes e fracos
    strengths = []
    weaknesses = []
    
    # Exemplo de lógica para identificar pontos fortes/fracos
    total_goals = sum(stat.goals for stat in statistics)
    total_matches = len(statistics)
    goals_per_match = total_goals / total_matches if total_matches > 0 else 0
    
    if goals_per_match > 0.5 and player.position in ['Forward', 'Striker', 'Winger']:
        strengths.append('Finalização')
    elif goals_per_match < 0.1 and player.position in ['Forward', 'Striker']:
        weaknesses.append('Finalização')
    
    total_assists = sum(stat.assists for stat in statistics)
    assists_per_match = total_assists / total_matches if total_matches > 0 else 0
    
    if assists_per_match > 0.3:
        strengths.append('Criação de jogadas')
    
    avg_pass_accuracy = sum(stat.pass_accuracy for stat in statistics) / len(statistics) if statistics else 0
    
    if avg_pass_accuracy > 85:
        strengths.append('Precisão de passes')
    elif avg_pass_accuracy < 70:
        weaknesses.append('Precisão de passes')
    
    # Obter apenas os últimos 5 jogos para o form
    form = form[-5:]
    
    return jsonify({
        'player_id': player_id,
        'player_name': player.name,
        'performance_rating': round(avg_performance, 2),
        'strengths': strengths,
        'weaknesses': weaknesses,
        'form': form
    }), 200
