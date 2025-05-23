from flask import Blueprint, jsonify, request
from flask_jwt_extended import jwt_required, get_jwt_identity
from src.models import Team, Player, Match, Statistic
import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
import seaborn as sns
import io
import base64
from datetime import datetime, timedelta
import os

bp = Blueprint('analytics', __name__, url_prefix='/api/analytics')

@bp.route('/dashboard', methods=['GET'])
@jwt_required()
def get_dashboard_data():
    """
    Endpoint para obter dados gerais para o dashboard principal.
    Inclui estatísticas resumidas de equipas, jogadores e jogos.
    """
    # Contar totais
    total_teams = Team.query.count()
    total_players = Player.query.count()
    total_matches = Match.query.count()
    
    # Obter jogos recentes
    recent_matches = Match.query.order_by(Match.date.desc()).limit(5).all()
    
    # Obter jogadores com mais gols
    top_scorers_stats = (
        Statistic.query
        .with_entities(
            Statistic.player_id,
            db.func.sum(Statistic.goals).label('total_goals')
        )
        .group_by(Statistic.player_id)
        .order_by(db.func.sum(Statistic.goals).desc())
        .limit(5)
        .all()
    )
    
    top_scorers = []
    for stat in top_scorers_stats:
        player = Player.query.get(stat.player_id)
        if player:
            top_scorers.append({
                'player_id': player.id,
                'player_name': player.name,
                'team_id': player.team_id,
                'team_name': Team.query.get(player.team_id).name if Team.query.get(player.team_id) else 'Unknown',
                'goals': stat.total_goals
            })
    
    # Obter distribuição de jogadores por posição
    positions = (
        Player.query
        .with_entities(
            Player.position,
            db.func.count(Player.id).label('count')
        )
        .group_by(Player.position)
        .all()
    )
    
    position_distribution = [
        {'position': pos.position, 'count': pos.count}
        for pos in positions
    ]
    
    return jsonify({
        'summary': {
            'total_teams': total_teams,
            'total_players': total_players,
            'total_matches': total_matches
        },
        'recent_matches': [match.to_dict() for match in recent_matches],
        'top_scorers': top_scorers,
        'position_distribution': position_distribution
    }), 200

@bp.route('/team-comparison', methods=['GET'])
@jwt_required()
def compare_teams():
    """
    Endpoint para comparar estatísticas entre duas equipas.
    """
    team1_id = request.args.get('team1_id', type=int)
    team2_id = request.args.get('team2_id', type=int)
    
    if not team1_id or not team2_id:
        return jsonify({'error': 'IDs das duas equipas são obrigatórios.'}), 400
    
    team1 = Team.query.get(team1_id)
    team2 = Team.query.get(team2_id)
    
    if not team1 or not team2:
        return jsonify({'error': 'Uma ou ambas as equipas não foram encontradas.'}), 404
    
    # Obter jogos entre as duas equipas
    head_to_head = Match.query.filter(
        ((Match.home_team_id == team1_id) & (Match.away_team_id == team2_id)) |
        ((Match.home_team_id == team2_id) & (Match.away_team_id == team1_id))
    ).order_by(Match.date.desc()).all()
    
    # Calcular estatísticas para cada equipa
    team1_stats = calculate_team_stats(team1_id)
    team2_stats = calculate_team_stats(team2_id)
    
    # Preparar dados para comparação
    comparison = {
        'goals_scored': {
            team1.name: team1_stats['goals_scored'],
            team2.name: team2_stats['goals_scored']
        },
        'goals_conceded': {
            team1.name: team1_stats['goals_conceded'],
            team2.name: team2_stats['goals_conceded']
        },
        'win_percentage': {
            team1.name: team1_stats['win_percentage'],
            team2.name: team2_stats['win_percentage']
        },
        'possession': {
            team1.name: team1_stats['avg_possession'],
            team2.name: team2_stats['avg_possession']
        },
        'pass_accuracy': {
            team1.name: team1_stats['avg_pass_accuracy'],
            team2.name: team2_stats['avg_pass_accuracy']
        }
    }
    
    return jsonify({
        'team1': {
            'id': team1.id,
            'name': team1.name,
            'stats': team1_stats
        },
        'team2': {
            'id': team2.id,
            'name': team2.name,
            'stats': team2_stats
        },
        'comparison': comparison,
        'head_to_head': [match.to_dict() for match in head_to_head]
    }), 200

@bp.route('/player-comparison', methods=['GET'])
@jwt_required()
def compare_players():
    """
    Endpoint para comparar estatísticas entre dois jogadores.
    """
    player1_id = request.args.get('player1_id', type=int)
    player2_id = request.args.get('player2_id', type=int)
    
    if not player1_id or not player2_id:
        return jsonify({'error': 'IDs dos dois jogadores são obrigatórios.'}), 400
    
    player1 = Player.query.get(player1_id)
    player2 = Player.query.get(player2_id)
    
    if not player1 or not player2:
        return jsonify({'error': 'Um ou ambos os jogadores não foram encontrados.'}), 404
    
    # Calcular estatísticas para cada jogador
    player1_stats = calculate_player_stats(player1_id)
    player2_stats = calculate_player_stats(player2_id)
    
    # Preparar dados para comparação
    comparison = {
        'goals': {
            player1.name: player1_stats['goals'],
            player2.name: player2_stats['goals']
        },
        'assists': {
            player1.name: player1_stats['assists'],
            player2.name: player2_stats['assists']
        },
        'shots_on_target': {
            player1.name: player1_stats['shots_on_target'],
            player2.name: player2_stats['shots_on_target']
        },
        'pass_accuracy': {
            player1.name: player1_stats['pass_accuracy'],
            player2.name: player2_stats['pass_accuracy']
        },
        'tackles': {
            player1.name: player1_stats['tackles'],
            player2.name: player2_stats['tackles']
        }
    }
    
    return jsonify({
        'player1': {
            'id': player1.id,
            'name': player1.name,
            'team': Team.query.get(player1.team_id).name if Team.query.get(player1.team_id) else 'Unknown',
            'position': player1.position,
            'stats': player1_stats
        },
        'player2': {
            'id': player2.id,
            'name': player2.name,
            'team': Team.query.get(player2.team_id).name if Team.query.get(player2.team_id) else 'Unknown',
            'position': player2.position,
            'stats': player2_stats
        },
        'comparison': comparison
    }), 200

@bp.route('/league-table', methods=['GET'])
@jwt_required()
def get_league_table():
    """
    Endpoint para obter a tabela classificativa de uma liga.
    """
    league = request.args.get('league')
    season = request.args.get('season')
    
    if not league or not season:
        return jsonify({'error': 'Liga e temporada são obrigatórios.'}), 400
    
    # Obter todas as equipas da liga
    teams = Team.query.filter_by(league=league).all()
    
    if not teams:
        return jsonify({'error': 'Nenhuma equipa encontrada para esta liga.'}), 404
    
    # Calcular pontos e estatísticas para cada equipa
    table = []
    
    for team in teams:
        # Obter jogos da equipa na temporada especificada
        home_matches = Match.query.filter_by(
            home_team_id=team.id,
            season=season,
            status='completed'
        ).all()
        
        away_matches = Match.query.filter_by(
            away_team_id=team.id,
            season=season,
            status='completed'
        ).all()
        
        # Calcular estatísticas
        played = len(home_matches) + len(away_matches)
        wins = 0
        draws = 0
        losses = 0
        goals_for = 0
        goals_against = 0
        
        for match in home_matches:
            goals_for += match.home_score
            goals_against += match.away_score
            
            if match.home_score > match.away_score:
                wins += 1
            elif match.home_score == match.away_score:
                draws += 1
            else:
                losses += 1
        
        for match in away_matches:
            goals_for += match.away_score
            goals_against += match.home_score
            
            if match.away_score > match.home_score:
                wins += 1
            elif match.away_score == match.home_score:
                draws += 1
            else:
                losses += 1
        
        # Calcular pontos (3 por vitória, 1 por empate)
        points = wins * 3 + draws
        
        table.append({
            'team_id': team.id,
            'team_name': team.name,
            'played': played,
            'wins': wins,
            'draws': draws,
            'losses': losses,
            'goals_for': goals_for,
            'goals_against': goals_against,
            'goal_difference': goals_for - goals_against,
            'points': points
        })
    
    # Ordenar tabela por pontos (decrescente) e depois por diferença de gols
    table.sort(key=lambda x: (x['points'], x['goal_difference']), reverse=True)
    
    # Adicionar posição na tabela
    for i, team in enumerate(table):
        team['position'] = i + 1
    
    return jsonify({
        'league': league,
        'season': season,
        'table': table
    }), 200

@bp.route('/performance-trends', methods=['GET'])
@jwt_required()
def get_performance_trends():
    """
    Endpoint para obter tendências de desempenho ao longo do tempo.
    Pode ser para uma equipa ou jogador específico.
    """
    team_id = request.args.get('team_id', type=int)
    player_id = request.args.get('player_id', type=int)
    
    if not team_id and not player_id:
        return jsonify({'error': 'ID da equipa ou do jogador é obrigatório.'}), 400
    
    # Período de análise (padrão: últimos 10 jogos)
    limit = request.args.get('limit', default=10, type=int)
    
    if team_id:
        # Análise de tendência para equipa
        team = Team.query.get(team_id)
        
        if not team:
            return jsonify({'error': 'Equipa não encontrada.'}), 404
        
        # Obter jogos da equipa
        home_matches = Match.query.filter_by(
            home_team_id=team_id,
            status='completed'
        ).order_by(Match.date.desc()).limit(limit).all()
        
        away_matches = Match.query.filter_by(
            away_team_id=team_id,
            status='completed'
        ).order_by(Match.date.desc()).limit(limit).all()
        
        # Combinar e ordenar por data
        all_matches = home_matches + away_matches
        all_matches.sort(key=lambda x: x.date, reverse=True)
        all_matches = all_matches[:limit]
        
        # Calcular métricas de desempenho por jogo
        performance_data = []
        
        for match in all_matches:
            is_home = match.home_team_id == team_id
            
            # Obter estatísticas do jogo
            match_stats = Statistic.query.filter_by(match_id=match.id).all()
            
            # Filtrar estatísticas da equipa
            team_players = Player.query.filter_by(team_id=team_id).all()
            team_player_ids = [player.id for player in team_players]
            team_stats = [stat for stat in match_stats if stat.player_id in team_player_ids]
            
            # Calcular métricas
            goals_scored = match.home_score if is_home else match.away_score
            goals_conceded = match.away_score if is_home else match.home_score
            
            shots = sum(stat.shots for stat in team_stats)
            shots_on_target = sum(stat.shots_on_target for stat in team_stats)
            passes = sum(stat.passes for stat in team_stats)
            passes_completed = sum(stat.passes_completed for stat in team_stats)
            
            shot_accuracy = (shots_on_target / shots * 100) if shots > 0 else 0
            pass_accuracy = (passes_completed / passes * 100) if passes > 0 else 0
            
            # Determinar resultado
            if is_home:
                result = 'W' if match.home_score > match.away_score else ('D' if match.home_score == match.away_score else 'L')
            else:
                result = 'W' if match.away_score > match.home_score else ('D' if match.away_score == match.home_score else 'L')
            
            performance_data.append({
                'match_id': match.id,
                'date': match.date.isoformat(),
                'opponent': Team.query.get(match.away_team_id if is_home else match.home_team_id).name,
                'is_home': is_home,
                'result': result,
                'goals_scored': goals_scored,
                'goals_conceded': goals_conceded,
                'shots': shots,
                'shots_on_target': shots_on_target,
                'shot_accuracy': shot_accuracy,
                'pass_accuracy': pass_accuracy
            })
        
        return jsonify({
            'team_id': team_id,
            'team_name': team.name,
            'performance_data': performance_data
        }), 200
    
    elif player_id:
        # Análise de tendência para jogador
        player = Player.query.get(player_id)
        
        if not player:
            return jsonify({'error': 'Jogador não encontrado.'}), 404
        
        # Obter estatísticas do jogador
        player_stats = Statistic.query.filter_by(
            player_id=player_id
        ).order_by(Match.date.desc()).limit(limit).all()
        
        # Calcular métricas de desempenho por jogo
        performance_data = []
        
        for stat in player_stats:
            match = Match.query.get(stat.match_id)
            
            if not match or match.status != 'completed':
                continue
            
            is_home = match.home_team_id == player.team_id
            
            performance_data.append({
                'match_id': match.id,
                'date': match.date.isoformat(),
                'opponent': Team.query.get(match.away_team_id if is_home else match.home_team_id).name,
                'is_home': is_home,
                'minutes_played': stat.minutes_played,
                'goals': stat.goals,
                'assists': stat.assists,
                'shots': stat.shots,
                'shots_on_target': stat.shots_on_target,
                'shot_accuracy': (stat.shots_on_target / stat.shots * 100) if stat.shots > 0 else 0,
                'pass_accuracy': stat.pass_accuracy
            })
        
        return jsonify({
            'player_id': player_id,
            'player_name': player.name,
            'team_name': Team.query.get(player.team_id).name if Team.query.get(player.team_id) else 'Unknown',
            'performance_data': performance_data
        }), 200

# Funções auxiliares

def calculate_team_stats(team_id):
    """Calcula estatísticas agregadas para uma equipa."""
    team = Team.query.get(team_id)
    
    if not team:
        return {}
    
    # Obter jogos da equipa
    home_matches = Match.query.filter_by(
        home_team_id=team_id,
        status='completed'
    ).all()
    
    away_matches = Match.query.filter_by(
        away_team_id=team_id,
        status='completed'
    ).all()
    
    # Calcular estatísticas básicas
    total_matches = len(home_matches) + len(away_matches)
    
    if total_matches == 0:
        return {
            'total_matches': 0,
            'wins': 0,
            'draws': 0,
            'losses': 0,
            'goals_scored': 0,
            'goals_conceded': 0,
            'win_percentage': 0,
            'avg_possession': 0,
            'avg_pass_accuracy': 0
        }
    
    # Calcular vitórias, empates e derrotas
    wins = 0
    draws = 0
    losses = 0
    goals_scored = 0
    goals_conceded = 0
    
    for match in home_matches:
        goals_scored += match.home_score
        goals_conceded += match.away_score
        
        if match.home_score > match.away_score:
            wins += 1
        elif match.home_score == match.away_score:
            draws += 1
        else:
            losses += 1
    
    for match in away_matches:
        goals_scored += match.away_score
        goals_conceded += match.home_score
        
        if match.away_score > match.home_score:
            wins += 1
        elif match.away_score == match.home_score:
            draws += 1
        else:
            losses += 1
    
    # Calcular percentagem de vitórias
    win_percentage = (wins / total_matches * 100) if total_matches > 0 else 0
    
    # Calcular posse média e precisão de passes (simulado)
    # Em uma implementação real, estes valores viriam das estatísticas detalhadas dos jogos
    avg_possession = 50.0  # Valor padrão
    avg_pass_accuracy = 80.0  # Valor padrão
    
    return {
        'total_matches': total_matches,
        'wins': wins,
        'draws': draws,
        'losses': losses,
        'goals_scored': goals_scored,
        'goals_conceded': goals_conceded,
        'win_percentage': win_percentage,
        'avg_possession': avg_possession,
        'avg_pass_accuracy': avg_pass_accuracy
    }

def calculate_player_stats(player_id):
    """Calcula estatísticas agregadas para um jogador."""
    player = Player.query.get(player_id)
    
    if not player:
        return {}
    
    # Obter estatísticas do jogador
    stats = Statistic.query.filter_by(player_id=player_id).all()
    
    if not stats:
        return {
            'matches_played': 0,
            'minutes_played': 0,
            'goals': 0,
            'assists': 0,
            'shots': 0,
            'shots_on_target': 0,
            'shot_accuracy': 0,
            'passes': 0,
            'pass_accuracy': 0,
            'tackles': 0,
            'interceptions': 0
        }
    
    # Calcular estatísticas agregadas
    matches_played = len(stats)
    minutes_played = sum(stat.minutes_played for stat in stats)
    goals = sum(stat.goals for stat in stats)
    assists = sum(stat.assists for stat in stats)
    shots = sum(stat.shots for stat in stats)
    shots_on_target = sum(stat.shots_on_target for stat in stats)
    passes = sum(stat.passes for stat in stats)
    passes_completed = sum(stat.passes_completed for stat in stats)
    tackles = sum(stat.tackles for stat in stats)
    interceptions = sum(stat.interceptions for stat in stats)
    
    # Calcular médias e percentagens
    shot_accuracy = (shots_on_target / shots * 100) if shots > 0 else 0
    pass_accuracy = (passes_completed / passes * 100) if passes > 0 else 0
    
    return {
        'matches_played': matches_played,
        'minutes_played': minutes_played,
        'goals': goals,
        'assists': assists,
        'shots': shots,
        'shots_on_target': shots_on_target,
        'shot_accuracy': shot_accuracy,
        'passes': passes,
        'pass_accuracy': pass_accuracy,
        'tackles': tackles,
        'interceptions': interceptions
    }

# Importar db do contexto principal
from src.main import db
