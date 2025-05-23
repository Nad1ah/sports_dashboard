from flask import Blueprint, jsonify, request
from flask_jwt_extended import jwt_required, get_jwt_identity
from src.models import Match, Team, Player, Statistic
import pandas as pd
from datetime import datetime

bp = Blueprint('match', __name__, url_prefix='/api/matches')

@bp.route('/', methods=['GET'])
@jwt_required()
def get_matches():
    # Suporte para filtros
    team_id = request.args.get('team_id', type=int)
    status = request.args.get('status')
    competition = request.args.get('competition')
    season = request.args.get('season')
    
    query = Match.query
    
    if team_id:
        query = query.filter((Match.home_team_id == team_id) | (Match.away_team_id == team_id))
    if status:
        query = query.filter_by(status=status)
    if competition:
        query = query.filter_by(competition=competition)
    if season:
        query = query.filter_by(season=season)
    
    # Ordenar por data (mais recente primeiro)
    matches = query.order_by(Match.date.desc()).all()
    
    return jsonify({
        'matches': [match.to_dict() for match in matches]
    }), 200

@bp.route('/<int:match_id>', methods=['GET'])
@jwt_required()
def get_match(match_id):
    match = Match.query.get(match_id)
    
    if not match:
        return jsonify({'error': 'Jogo não encontrado.'}), 404
    
    return jsonify({
        'match': match.to_dict()
    }), 200

@bp.route('/', methods=['POST'])
@jwt_required()
def create_match():
    data = request.get_json()
    
    # Verificar se os campos obrigatórios estão presentes
    if not data or not data.get('date') or not data.get('home_team_id') or not data.get('away_team_id') or not data.get('season') or not data.get('competition'):
        return jsonify({'error': 'Dados incompletos. Data, IDs das equipas, temporada e competição são obrigatórios.'}), 400
    
    # Verificar se as equipas existem
    home_team = Team.query.get(data['home_team_id'])
    away_team = Team.query.get(data['away_team_id'])
    
    if not home_team or not away_team:
        return jsonify({'error': 'Uma ou ambas as equipas não foram encontradas.'}), 404
    
    # Criar novo jogo
    new_match = Match(
        date=datetime.fromisoformat(data['date']),
        home_team_id=data['home_team_id'],
        away_team_id=data['away_team_id'],
        home_score=data.get('home_score', 0),
        away_score=data.get('away_score', 0),
        season=data['season'],
        competition=data['competition'],
        venue=data.get('venue'),
        status=data.get('status', 'scheduled')
    )
    
    try:
        from src.main import db
        db.session.add(new_match)
        db.session.commit()
        
        return jsonify({
            'message': 'Jogo criado com sucesso!',
            'match': new_match.to_dict()
        }), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': f'Erro ao criar jogo: {str(e)}'}), 500

@bp.route('/<int:match_id>', methods=['PUT', 'PATCH'])
@jwt_required()
def update_match(match_id):
    match = Match.query.get(match_id)
    
    if not match:
        return jsonify({'error': 'Jogo não encontrado.'}), 404
    
    data = request.get_json()
    
    # Atualizar campos permitidos
    if data.get('date'):
        match.date = datetime.fromisoformat(data['date'])
    if data.get('home_team_id'):
        # Verificar se a equipa existe
        home_team = Team.query.get(data['home_team_id'])
        if not home_team:
            return jsonify({'error': 'Equipa da casa não encontrada.'}), 404
        match.home_team_id = data['home_team_id']
    if data.get('away_team_id'):
        # Verificar se a equipa existe
        away_team = Team.query.get(data['away_team_id'])
        if not away_team:
            return jsonify({'error': 'Equipa visitante não encontrada.'}), 404
        match.away_team_id = data['away_team_id']
    if 'home_score' in data:
        match.home_score = data['home_score']
    if 'away_score' in data:
        match.away_score = data['away_score']
    if data.get('season'):
        match.season = data['season']
    if data.get('competition'):
        match.competition = data['competition']
    if 'venue' in data:
        match.venue = data['venue']
    if data.get('status'):
        match.status = data['status']
    
    try:
        from src.main import db
        db.session.commit()
        return jsonify({
            'message': 'Jogo atualizado com sucesso!',
            'match': match.to_dict()
        }), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': f'Erro ao atualizar jogo: {str(e)}'}), 500

@bp.route('/<int:match_id>', methods=['DELETE'])
@jwt_required()
def delete_match(match_id):
    match = Match.query.get(match_id)
    
    if not match:
        return jsonify({'error': 'Jogo não encontrado.'}), 404
    
    try:
        from src.main import db
        db.session.delete(match)
        db.session.commit()
        return jsonify({
            'message': 'Jogo eliminado com sucesso!'
        }), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': f'Erro ao eliminar jogo: {str(e)}'}), 500

@bp.route('/<int:match_id>/statistics', methods=['GET'])
@jwt_required()
def get_match_statistics(match_id):
    match = Match.query.get(match_id)
    
    if not match:
        return jsonify({'error': 'Jogo não encontrado.'}), 404
    
    # Obter todas as estatísticas do jogo
    statistics = Statistic.query.filter_by(match_id=match_id).all()
    
    # Preparar dados para análise
    home_team = Team.query.get(match.home_team_id)
    away_team = Team.query.get(match.away_team_id)
    
    home_players = Player.query.filter_by(team_id=match.home_team_id).all()
    away_players = Player.query.filter_by(team_id=match.away_team_id).all()
    
    home_player_ids = [player.id for player in home_players]
    away_player_ids = [player.id for player in away_players]
    
    # Separar estatísticas por equipa
    home_stats = [stat for stat in statistics if stat.player_id in home_player_ids]
    away_stats = [stat for stat in statistics if stat.player_id in away_player_ids]
    
    # Calcular estatísticas agregadas por equipa
    home_team_stats = {
        'goals': match.home_score,
        'shots': sum(stat.shots for stat in home_stats),
        'shots_on_target': sum(stat.shots_on_target for stat in home_stats),
        'possession': 0,  # Será calculado abaixo
        'passes': sum(stat.passes for stat in home_stats),
        'pass_accuracy': 0,  # Será calculado abaixo
        'tackles': sum(stat.tackles for stat in home_stats),
        'interceptions': sum(stat.interceptions for stat in home_stats),
        'fouls': sum(stat.fouls_committed for stat in home_stats),
        'yellow_cards': sum(stat.yellow_cards for stat in home_stats),
        'red_cards': sum(stat.red_cards for stat in home_stats)
    }
    
    away_team_stats = {
        'goals': match.away_score,
        'shots': sum(stat.shots for stat in away_stats),
        'shots_on_target': sum(stat.shots_on_target for stat in away_stats),
        'possession': 0,  # Será calculado abaixo
        'passes': sum(stat.passes for stat in away_stats),
        'pass_accuracy': 0,  # Será calculado abaixo
        'tackles': sum(stat.tackles for stat in away_stats),
        'interceptions': sum(stat.interceptions for stat in away_stats),
        'fouls': sum(stat.fouls_committed for stat in away_stats),
        'yellow_cards': sum(stat.yellow_cards for stat in away_stats),
        'red_cards': sum(stat.red_cards for stat in away_stats)
    }
    
    # Calcular posse de bola
    total_passes = home_team_stats['passes'] + away_team_stats['passes']
    if total_passes > 0:
        home_team_stats['possession'] = round(home_team_stats['passes'] / total_passes * 100, 1)
        away_team_stats['possession'] = round(100 - home_team_stats['possession'], 1)
    
    # Calcular precisão de passes
    home_passes_completed = sum(stat.passes_completed for stat in home_stats)
    away_passes_completed = sum(stat.passes_completed for stat in away_stats)
    
    if home_team_stats['passes'] > 0:
        home_team_stats['pass_accuracy'] = round(home_passes_completed / home_team_stats['passes'] * 100, 1)
    
    if away_team_stats['passes'] > 0:
        away_team_stats['pass_accuracy'] = round(away_passes_completed / away_team_stats['passes'] * 100, 1)
    
    # Estatísticas de jogadores
    player_statistics = []
    for stat in statistics:
        player = Player.query.get(stat.player_id)
        player_stat = {
            'player_id': stat.player_id,
            'player_name': player.name,
            'team_id': player.team_id,
            'team_name': home_team.name if player.team_id == match.home_team_id else away_team.name,
            'minutes_played': stat.minutes_played,
            'goals': stat.goals,
            'assists': stat.assists,
            'shots': stat.shots,
            'shots_on_target': stat.shots_on_target,
            'passes': stat.passes,
            'pass_accuracy': stat.pass_accuracy,
            'tackles': stat.tackles,
            'interceptions': stat.interceptions,
            'yellow_cards': stat.yellow_cards,
            'red_cards': stat.red_cards
        }
        player_statistics.append(player_stat)
    
    return jsonify({
        'match_id': match_id,
        'home_team': {
            'id': match.home_team_id,
            'name': home_team.name,
            'score': match.home_score,
            'statistics': home_team_stats
        },
        'away_team': {
            'id': match.away_team_id,
            'name': away_team.name,
            'score': match.away_score,
            'statistics': away_team_stats
        },
        'player_statistics': player_statistics
    }), 200

@bp.route('/<int:match_id>/timeline', methods=['GET'])
@jwt_required()
def get_match_timeline(match_id):
    match = Match.query.get(match_id)
    
    if not match:
        return jsonify({'error': 'Jogo não encontrado.'}), 404
    
    # Em uma implementação real, teríamos uma tabela separada para eventos do jogo
    # Aqui, vamos simular alguns eventos baseados nas estatísticas
    
    # Obter todas as estatísticas do jogo
    statistics = Statistic.query.filter_by(match_id=match_id).all()
    
    # Simular timeline de eventos
    timeline = []
    
    # Adicionar gols (simulados)
    for stat in statistics:
        if stat.goals > 0:
            player = Player.query.get(stat.player_id)
            team = Team.query.get(player.team_id)
            
            # Simular minutos para os gols
            for i in range(stat.goals):
                # Gerar um minuto aleatório dentro do tempo jogado pelo jogador
                minute = min(90, max(1, int(stat.minutes_played * (i+1) / (stat.goals+1))))
                
                timeline.append({
                    'minute': minute,
                    'type': 'goal',
                    'player_id': player.id,
                    'player_name': player.name,
                    'team_id': team.id,
                    'team_name': team.name
                })
    
    # Adicionar cartões (simulados)
    for stat in statistics:
        if stat.yellow_cards > 0 or stat.red_cards > 0:
            player = Player.query.get(stat.player_id)
            team = Team.query.get(player.team_id)
            
            # Simular minutos para cartões amarelos
            for i in range(stat.yellow_cards):
                # Gerar um minuto aleatório
                minute = min(90, max(1, int(30 + i * 20)))
                
                timeline.append({
                    'minute': minute,
                    'type': 'yellow_card',
                    'player_id': player.id,
                    'player_name': player.name,
                    'team_id': team.id,
                    'team_name': team.name
                })
            
            # Simular minutos para cartões vermelhos
            for i in range(stat.red_cards):
                # Gerar um minuto aleatório (geralmente mais tarde no jogo)
                minute = min(90, max(1, int(60 + i * 15)))
                
                timeline.append({
                    'minute': minute,
                    'type': 'red_card',
                    'player_id': player.id,
                    'player_name': player.name,
                    'team_id': team.id,
                    'team_name': team.name
                })
    
    # Ordenar timeline por minuto
    timeline.sort(key=lambda x: x['minute'])
    
    return jsonify({
        'match_id': match_id,
        'home_team': {
            'id': match.home_team_id,
            'name': Team.query.get(match.home_team_id).name,
            'score': match.home_score
        },
        'away_team': {
            'id': match.away_team_id,
            'name': Team.query.get(match.away_team_id).name,
            'score': match.away_score
        },
        'timeline': timeline
    }), 200
