from flask import Blueprint, jsonify, request
from flask_jwt_extended import jwt_required, get_jwt_identity
from src.models import User
from werkzeug.security import generate_password_hash, check_password_hash
from flask_jwt_extended import create_access_token

bp = Blueprint('auth', __name__, url_prefix='/api/auth')

@bp.route('/register', methods=['POST'])
def register():
    data = request.get_json()
    
    # Verificar se os campos obrigatórios estão presentes
    if not data or not data.get('username') or not data.get('email') or not data.get('password'):
        return jsonify({'error': 'Dados incompletos. Username, email e password são obrigatórios.'}), 400
    
    # Verificar se o utilizador já existe
    if User.query.filter_by(username=data['username']).first():
        return jsonify({'error': 'Username já está em uso.'}), 400
    
    if User.query.filter_by(email=data['email']).first():
        return jsonify({'error': 'Email já está em uso.'}), 400
    
    # Criar novo utilizador
    hashed_password = generate_password_hash(data['password'])
    new_user = User(
        username=data['username'],
        email=data['email'],
        password=hashed_password
    )
    
    try:
        from src.main import db
        db.session.add(new_user)
        db.session.commit()
        
        # Gerar token de acesso
        access_token = create_access_token(identity=new_user.id)
        
        return jsonify({
            'message': 'Utilizador registado com sucesso!',
            'user': new_user.to_dict(),
            'access_token': access_token
        }), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': f'Erro ao registar utilizador: {str(e)}'}), 500

@bp.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    
    # Verificar se os campos obrigatórios estão presentes
    if not data or not data.get('email') or not data.get('password'):
        return jsonify({'error': 'Dados incompletos. Email e password são obrigatórios.'}), 400
    
    # Verificar se o utilizador existe
    user = User.query.filter_by(email=data['email']).first()
    if not user or not check_password_hash(user.password, data['password']):
        return jsonify({'error': 'Credenciais inválidas.'}), 401
    
    # Gerar token de acesso
    access_token = create_access_token(identity=user.id)
    
    return jsonify({
        'message': 'Login efetuado com sucesso!',
        'user': user.to_dict(),
        'access_token': access_token
    }), 200

@bp.route('/me', methods=['GET'])
@jwt_required()
def get_profile():
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    
    if not user:
        return jsonify({'error': 'Utilizador não encontrado.'}), 404
    
    return jsonify({
        'user': user.to_dict()
    }), 200

@bp.route('/me', methods=['PATCH'])
@jwt_required()
def update_profile():
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    
    if not user:
        return jsonify({'error': 'Utilizador não encontrado.'}), 404
    
    data = request.get_json()
    
    # Atualizar campos permitidos
    if data.get('username'):
        # Verificar se o novo username já está em uso
        existing_user = User.query.filter_by(username=data['username']).first()
        if existing_user and existing_user.id != user.id:
            return jsonify({'error': 'Username já está em uso.'}), 400
        user.username = data['username']
    
    try:
        from src.main import db
        db.session.commit()
        return jsonify({
            'message': 'Perfil atualizado com sucesso!',
            'user': user.to_dict()
        }), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': f'Erro ao atualizar perfil: {str(e)}'}), 500
