import { useState, useEffect } from 'react';
import { Trophy, Star, Plus, Users, Download, BarChart3, UserCircle, UserPlus, ArrowLeft } from 'lucide-react';

const ChampionshipTracker = () => {
  const STAR_BANK_ID = 'B000';

  const initialParticipants = [
    { id: STAR_BANK_ID, name: 'Banco', nome: 'Banco', sobrenome: '', dataNascimento: '', stars: 999 }
  ];

  const gameTypes = [
    { id: 'M001', name: 'FIFA', category: 'Eletrônico' },
    { id: 'M002', name: 'Tetris', category: 'Eletrônico' },
    { id: 'M007', name: 'Finalização', category: 'Esporte' },
    { id: 'M006', name: 'Rouba Bandeira', category: 'Esporte' },
    { id: 'M004', name: 'Pebolim', category: 'Mesa' },
    { id: 'M003', name: 'Sinuca', category: 'Mesa' },
    { id: 'M005', name: 'Tênis de Mesa', category: 'Mesa' },
    { id: 'M010', name: 'Dama', category: 'Tabuleiro' },
    { id: 'M011', name: 'Dominó', category: 'Tabuleiro' },
    { id: 'M009', name: 'Ludo', category: 'Tabuleiro' },
    { id: 'M008', name: 'Xadrez', category: 'Tabuleiro' }
  ];

  const [participants, setParticipants] = useState(() => {
    const saved = localStorage.getItem('championship_participants');
    if (!saved) return initialParticipants;

    const savedList = JSON.parse(saved);
    // Se algum participante (exceto o banco) não tem campo sobrenome, é formato antigo — reinicia
    const hasOldFormat = savedList.some(p => p.id !== STAR_BANK_ID && p.sobrenome === undefined);
    if (hasOldFormat) return initialParticipants;

    return savedList;
  });

  const [games, setGames] = useState(() => {
    const saved = localStorage.getItem('championship_games');
    return saved ? JSON.parse(saved) : [];
  });

  const [selectedGame, setSelectedGame] = useState('');
  const [inputText, setInputText] = useState('');

  // Estados da tela de inscrição
  const [regNome, setRegNome] = useState('');
  const [regSobrenome, setRegSobrenome] = useState('');
  const [regDataNascimento, setRegDataNascimento] = useState('');

  const urlParams = new URLSearchParams(window.location.search);
  const isDisplayMode = urlParams.get('display') === 'true';
  const [view, setView] = useState(isDisplayMode ? 'display' : 'control');

  useEffect(() => {
    localStorage.setItem('championship_participants', JSON.stringify(participants));
  }, [participants]);

  useEffect(() => {
    localStorage.setItem('championship_games', JSON.stringify(games));
  }, [games]);

  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === 'championship_participants') {
        setParticipants(JSON.parse(e.newValue || '[]'));
      } else if (e.key === 'championship_games') {
        setGames(JSON.parse(e.newValue || '[]'));
      }
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const registerParticipant = () => {
    if (!regNome.trim() || !regSobrenome.trim() || !regDataNascimento) {
      alert('Preencha todos os campos: Nome, Sobrenome e Data de Nascimento.');
      return;
    }

    const nomeFull = `${regNome.trim()} ${regSobrenome.trim()}`;

    // Verificar duplicidade de nome completo
    const jaExiste = participants.some(
      p => p.id !== STAR_BANK_ID && p.name.toLowerCase() === nomeFull.toLowerCase()
    );
    if (jaExiste) {
      alert('Já existe um participante com esse nome!');
      return;
    }

    const existingPlayers = participants.filter(p => p.id !== STAR_BANK_ID);
    const nextNum = existingPlayers.length + 1;
    const id = `P${String(nextNum).padStart(3, '0')}`;

    const newParticipant = {
      id,
      nome: regNome.trim(),
      sobrenome: regSobrenome.trim(),
      dataNascimento: regDataNascimento,
      name: nomeFull,
      stars: 10
    };

    setParticipants(prev => [...prev, newParticipant]);
    setRegNome('');
    setRegSobrenome('');
    setRegDataNascimento('');
  };

  const removeParticipant = (id) => {
    if (!window.confirm('Tem certeza que deseja remover este participante?')) return;
    setParticipants(prev => prev.filter(p => p.id !== id));
  };

  const processMatch = () => {
    if (!selectedGame) {
      alert('Selecione a modalidade do jogo!');
      return;
    }

    const [rawWinner, rawLoser] = inputText.split('>');
    if (!rawWinner || !rawLoser) {
      alert('Formato inválido! Use: Nome Vencedor > Nome Perdedor');
      return;
    }

    const winnerName = rawWinner.trim();
    const loserName = rawLoser.trim();

    if (!winnerName || !loserName) {
      alert('Informe os dois nomes para registrar a partida.');
      return;
    }

    const winnerParticipant = participants.find(p =>
      p.name.toLowerCase() === winnerName.toLowerCase()
    );
    const loserParticipant = participants.find(p =>
      p.name.toLowerCase() === loserName.toLowerCase()
    );

    if (!winnerParticipant || !loserParticipant) {
      alert('Participante não encontrado!');
      return;
    }

    if (winnerParticipant.stars <= 0) {
      alert(`${winnerParticipant.name.toUpperCase()} ESTÁ SEM ESTRELAS!`);
      return;
    }

    if (loserParticipant.stars <= 0) {
      alert(`${loserParticipant.name.toUpperCase()} ESTÁ SEM ESTRELAS!`);
      return;
    }

    const updatedParticipants = participants.map(p => {
      if (p.id === winnerParticipant.id) return { ...p, stars: p.stars + 1 };
      if (p.id === loserParticipant.id) return { ...p, stars: p.stars - 1 };
      return p;
    });

    const gameInfo = gameTypes.find(g => g.id === selectedGame);

    const newGame = {
      id: `G${String(games.length + 1).padStart(3, '0')}`,
      gameType: gameInfo.name,
      gameCategory: gameInfo.category,
      winner: winnerParticipant.name,
      loser: loserParticipant.name,
      timestamp: new Date().toLocaleString('pt-BR')
    };

    setParticipants(updatedParticipants);
    setGames([newGame, ...games]);
    setInputText('');
    setSelectedGame('');
  };

  const exportToCSV = () => {
    const participantsCSV = [
      'ID,Nome,Sobrenome,Data_Nascimento,Estrelas',
      ...participants.map(p => `${p.id},${p.nome || p.name},${p.sobrenome || ''},${p.dataNascimento || ''},${p.stars}`)
    ].join('\n');

    const gamesCSV = [
      'ID_Jogo,Modalidade,Categoria,Vencedor,Perdedor,Data_Hora',
      ...games.map(g => `${g.id},${g.gameType},${g.gameCategory},${g.winner},${g.loser},${g.timestamp}`)
    ].join('\n');

    const modalitiesCSV = [
      'ID_Modalidade,Nome,Categoria',
      ...gameTypes.map(g => `${g.id},${g.name},${g.category}`)
    ].join('\n');

    const fullCSV = `PARTICIPANTES\n${participantsCSV}\n\nJOGOS\n${gamesCSV}\n\nMODALIDADES\n${modalitiesCSV}`;
    const blob = new Blob([fullCSV], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `campeonato_${new Date().getTime()}.csv`;
    link.click();
  };

  const resetChampionship = () => {
    if (window.confirm('Tem certeza que deseja resetar o campeonato? Todos os dados serão perdidos!')) {
      localStorage.removeItem('championship_participants');
      localStorage.removeItem('championship_games');
      setParticipants(initialParticipants);
      setGames([]);
      alert('Campeonato resetado!');
    }
  };

  const sortedParticipants = [...participants].sort((a, b) => b.stars - a.stars);
  const podiumParticipants = sortedParticipants.filter(p => p.id !== STAR_BANK_ID);

  const getGameStats = () => {
    const totalGames = games.length;
    const gamesByModality = {};
    games.forEach(game => {
      if (!gamesByModality[game.gameType]) {
        gamesByModality[game.gameType] = { count: 0, category: game.gameCategory };
      }
      gamesByModality[game.gameType].count++;
    });
    return { totalGames, gamesByModality };
  };

  const getPlayerStats = () => {
    const playerStats = {};
    participants.forEach(p => {
      if (p.id !== STAR_BANK_ID) {
        playerStats[p.name] = { totalWins: 0, winsByModality: {}, totalLosses: 0 };
      }
    });
    games.forEach(game => {
      if (playerStats[game.winner]) {
        playerStats[game.winner].totalWins++;
        if (!playerStats[game.winner].winsByModality[game.gameType]) {
          playerStats[game.winner].winsByModality[game.gameType] = 0;
        }
        playerStats[game.winner].winsByModality[game.gameType]++;
      }
      if (playerStats[game.loser]) {
        playerStats[game.loser].totalLosses++;
      }
    });
    return playerStats;
  };

  // ── TELA DE INSCRIÇÃO ──────────────────────────────────────────────────────
  if (view === 'register') {
    const registeredPlayers = participants.filter(p => p.id !== STAR_BANK_ID);

    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-8">
        <div className="max-w-3xl mx-auto">
          <div className="flex items-center gap-4 mb-8">
            <button
              onClick={() => setView('control')}
              className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition"
            >
              <ArrowLeft className="w-4 h-4" />
              Voltar ao Controle
            </button>
            <div>
              <h1 className="text-3xl font-bold text-slate-800 flex items-center gap-3">
                <UserPlus className="w-8 h-8 text-purple-600" />
                Inscrição de Participantes
              </h1>
              <p className="text-slate-500 text-sm mt-1">{registeredPlayers.length} participante(s) inscrito(s)</p>
            </div>
          </div>

          {/* Formulário de inscrição */}
          <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
            <h2 className="text-xl font-bold text-slate-800 mb-4">Novo Participante</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Nome *</label>
                <input
                  type="text"
                  value={regNome}
                  onChange={e => setRegNome(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && registerParticipant()}
                  placeholder="Ex: João"
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Sobrenome *</label>
                <input
                  type="text"
                  value={regSobrenome}
                  onChange={e => setRegSobrenome(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && registerParticipant()}
                  placeholder="Ex: Silva"
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-slate-700 mb-1">Data de Nascimento *</label>
              <input
                type="date"
                value={regDataNascimento}
                onChange={e => setRegDataNascimento(e.target.value)}
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>
            <button
              onClick={registerParticipant}
              className="w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 rounded-lg transition flex items-center justify-center gap-2"
            >
              <UserPlus className="w-5 h-5" />
              Inscrever Participante
            </button>
          </div>

          {/* Lista de inscritos */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-bold text-slate-800 mb-4">Participantes Inscritos</h2>
            {registeredPlayers.length === 0 ? (
              <p className="text-slate-500 text-center py-8">Nenhum participante inscrito ainda.</p>
            ) : (
              <div className="space-y-3">
                {registeredPlayers.map(p => (
                  <div key={p.id} className="flex items-center justify-between bg-slate-50 rounded-lg p-4 border border-slate-200">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-purple-100 text-purple-700 rounded-full flex items-center justify-center font-bold text-sm">
                        {p.id}
                      </div>
                      <div>
                        <div className="font-bold text-slate-800">{p.name}</div>
                        <div className="text-sm text-slate-500">
                          Nascimento: {p.dataNascimento
                            ? new Date(p.dataNascimento + 'T00:00:00').toLocaleDateString('pt-BR')
                            : '—'}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-1 bg-yellow-50 px-3 py-1 rounded-lg border border-yellow-200">
                        <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                        <span className="font-bold text-slate-800">{p.stars}</span>
                      </div>
                      <button
                        onClick={() => removeParticipant(p.id)}
                        className="text-red-500 hover:text-red-700 text-sm font-medium transition"
                      >
                        Remover
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // ── ESTATÍSTICAS DOS JOGOS ─────────────────────────────────────────────────
  if (view === 'stats-games') {
    const { totalGames, gamesByModality } = getGameStats();
    const sortedModalities = Object.entries(gamesByModality).sort((a, b) => b[1].count - a[1].count);

    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-8">
        <div className="max-w-6xl mx-auto">
          <div className="flex gap-4 mb-6">
            <button
              onClick={() => setView('control')}
              className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition"
            >
              Voltar ao Controle
            </button>
            <button
              onClick={exportToCSV}
              className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition flex items-center gap-2"
            >
              <Download className="w-5 h-5" />
              Exportar CSV
            </button>
          </div>

          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-slate-800 mb-2 flex items-center justify-center gap-3">
              <BarChart3 className="w-10 h-10 text-blue-600" />
              Estatísticas dos Jogos
            </h1>
            <p className="text-slate-600">Análise completa das partidas realizadas</p>
          </div>

          <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl shadow-lg p-8 mb-8 text-center">
            <h2 className="text-2xl font-bold text-white mb-2">Total de Jogos Realizados</h2>
            <p className="text-7xl font-black text-white">{totalGames}</p>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-2xl font-bold text-slate-800 mb-6">Jogos por Modalidade</h2>
            {sortedModalities.length === 0 ? (
              <p className="text-slate-500 text-center py-8">Nenhum jogo registrado ainda</p>
            ) : (
              <div className="space-y-4">
                {sortedModalities.map(([modality, data], index) => (
                  <div
                    key={modality}
                    className={`flex items-center justify-between p-5 rounded-lg border-2 transition ${
                      index === 0
                        ? 'bg-gradient-to-r from-yellow-50 to-yellow-100 border-yellow-400'
                        : 'bg-slate-50 border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <div className={`text-2xl font-bold w-12 h-12 flex items-center justify-center rounded-full ${
                        index === 0 ? 'bg-yellow-400 text-white' : 'bg-slate-300 text-slate-700'
                      }`}>
                        {index + 1}º
                      </div>
                      <div>
                        <div className="font-bold text-slate-800 text-xl">{modality}</div>
                        <div className="text-sm text-slate-500">{data.category}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-right mr-2">
                        <div className="text-3xl font-black text-blue-600">{data.count}</div>
                        <div className="text-sm text-slate-500">
                          {((data.count / totalGames) * 100).toFixed(1)}%
                        </div>
                      </div>
                      <div className="w-32 bg-slate-200 rounded-full h-3">
                        <div
                          className="bg-blue-600 h-3 rounded-full transition-all"
                          style={{ width: `${(data.count / totalGames) * 100}%` }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // ── ESTATÍSTICAS DOS JOGADORES ─────────────────────────────────────────────
  if (view === 'stats-players') {
    const playerStats = getPlayerStats();
    const sortedPlayers = Object.entries(playerStats).sort((a, b) => b[1].totalWins - a[1].totalWins);

    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex gap-4 mb-6">
            <button
              onClick={() => setView('control')}
              className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition"
            >
              Voltar ao Controle
            </button>
            <button
              onClick={exportToCSV}
              className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition flex items-center gap-2"
            >
              <Download className="w-5 h-5" />
              Exportar CSV
            </button>
          </div>

          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-slate-800 mb-2 flex items-center justify-center gap-3">
              <UserCircle className="w-10 h-10 text-green-600" />
              Estatísticas dos Jogadores
            </h1>
            <p className="text-slate-600">Vitórias totais e por modalidade</p>
          </div>

          {sortedPlayers.length === 0 || games.length === 0 ? (
            <div className="bg-white rounded-xl shadow-lg p-12 text-center">
              <p className="text-slate-500 text-xl">Nenhum jogo registrado ainda</p>
            </div>
          ) : (
            <div className="space-y-6">
              {sortedPlayers.map(([playerName, stats], index) => {
                const sortedModalityWins = Object.entries(stats.winsByModality).sort((a, b) => b[1] - a[1]);
                const totalGamesPlayed = stats.totalWins + stats.totalLosses;
                const winRate = totalGamesPlayed > 0 ? ((stats.totalWins / totalGamesPlayed) * 100).toFixed(1) : 0;
                return (
                  <div
                    key={playerName}
                    className={`bg-white rounded-xl shadow-lg p-6 border-2 transition ${
                      index === 0 ? 'border-yellow-400 bg-gradient-to-r from-yellow-50/50 to-white'
                      : index === 1 ? 'border-gray-300'
                      : index === 2 ? 'border-orange-300'
                      : 'border-slate-200'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-4 pb-4 border-b-2 border-slate-100">
                      <div className="flex items-center gap-4">
                        <div className={`text-2xl font-bold w-14 h-14 flex items-center justify-center rounded-full ${
                          index === 0 ? 'bg-yellow-400 text-white'
                          : index === 1 ? 'bg-gray-300 text-gray-700'
                          : index === 2 ? 'bg-orange-300 text-orange-900'
                          : 'bg-slate-200 text-slate-600'
                        }`}>
                          {index + 1}º
                        </div>
                        <div>
                          <h3 className="text-2xl font-bold text-slate-800">{playerName}</h3>
                          <p className="text-sm text-slate-500">
                            {totalGamesPlayed} jogos • {winRate}% de vitórias
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-4xl font-black text-green-600">{stats.totalWins}</div>
                        <div className="text-sm text-slate-500">vitórias</div>
                        <div className="text-sm text-red-500 mt-1">{stats.totalLosses} derrotas</div>
                      </div>
                    </div>
                    {sortedModalityWins.length > 0 && (
                      <div>
                        <h4 className="text-sm font-semibold text-slate-600 mb-3 uppercase">Vitórias por Modalidade</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                          {sortedModalityWins.map(([modality, wins]) => (
                            <div key={modality} className="bg-slate-50 rounded-lg p-3 border border-slate-200">
                              <div className="font-semibold text-slate-700 text-sm mb-1">{modality}</div>
                              <div className="text-2xl font-bold text-green-600">{wins}</div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    );
  }

  // ── TELÃO ──────────────────────────────────────────────────────────────────
  if (view === 'display') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 p-8">
        <div className="text-center mb-12">
          <h1 className="text-7xl font-bold text-white mb-4 flex items-center justify-center gap-4">
            <Trophy className="w-20 h-20 text-yellow-400" />
            TOP 3
            <Trophy className="w-20 h-20 text-yellow-400" />
          </h1>
          <p className="text-2xl text-white/80">Líderes do Campeonato</p>
        </div>

        <div className="max-w-4xl mx-auto space-y-6">
          {podiumParticipants.slice(0, 3).map((p, index) => (
            <div key={p.id} className={`transform transition-all duration-500 ${index === 0 ? 'scale-105' : ''}`}>
              <div className={`rounded-xl p-6 border-4 shadow-2xl ${
                index === 0 ? 'bg-gradient-to-r from-yellow-400 to-yellow-600 border-yellow-300 shadow-yellow-500/50'
                : index === 1 ? 'bg-gradient-to-r from-gray-300 to-gray-500 border-gray-200 shadow-gray-500/50'
                : 'bg-gradient-to-r from-orange-400 to-orange-600 border-orange-300 shadow-orange-500/50'
              }`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-5">
                    <div className={`text-5xl font-black w-20 h-20 flex items-center justify-center rounded-full shadow-xl ${
                      index === 0 ? 'bg-yellow-600 text-yellow-50'
                      : index === 1 ? 'bg-gray-600 text-gray-50'
                      : 'bg-orange-700 text-orange-50'
                    }`}>
                      {index + 1}º
                    </div>
                    <div>
                      <div className={`text-4xl font-black ${
                        index === 0 ? 'text-yellow-950' : index === 1 ? 'text-gray-900' : 'text-orange-950'
                      }`}>
                        {p.name}
                      </div>
                      <div className={`text-lg font-semibold mt-1 ${
                        index === 0 ? 'text-yellow-800' : index === 1 ? 'text-gray-700' : 'text-orange-800'
                      }`}>
                        {p.id}
                      </div>
                    </div>
                  </div>
                  <div className={`flex items-center gap-3 px-6 py-4 rounded-xl shadow-xl ${
                    index === 0 ? 'bg-yellow-50' : index === 1 ? 'bg-gray-50' : 'bg-orange-50'
                  }`}>
                    <Star className={`w-12 h-12 ${
                      index === 0 ? 'text-yellow-500 fill-yellow-500'
                      : index === 1 ? 'text-gray-500 fill-gray-500'
                      : 'text-orange-500 fill-orange-500'
                    }`} />
                    <span className={`text-5xl font-black ${
                      index === 0 ? 'text-yellow-600' : index === 1 ? 'text-gray-600' : 'text-orange-600'
                    }`}>
                      {p.stars}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {games.length > 0 && (
          <div className="mt-12 max-w-3xl mx-auto bg-white/10 backdrop-blur-sm rounded-xl p-6 border-2 border-white/20">
            <h2 className="text-2xl font-bold text-white mb-4 text-center">Última Partida</h2>
            <div className="bg-white/20 rounded-xl p-5 backdrop-blur-sm">
              <div className="text-center mb-3">
                <span className="text-xl font-bold text-yellow-300">{games[0].gameType}</span>
                <span className="text-white/60 text-base ml-3">({games[0].gameCategory})</span>
              </div>
              <div className="text-white text-2xl text-center font-bold">
                <span className="text-green-400">{games[0].winner}</span>
                {' > '}
                <span className="text-red-400">{games[0].loser}</span>
              </div>
              <div className="text-base text-white/60 mt-3 text-center">{games[0].timestamp}</div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // ── PAINEL DE CONTROLE ─────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-slate-800 mb-2 flex items-center justify-center gap-3">
            <Trophy className="w-10 h-10 text-purple-600" />
            Controle do Campeonato
          </h1>
          <p className="text-slate-600">Sistema de gerenciamento de estrelas em tempo real</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Painel de Controle */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
                <Plus className="w-5 h-5" />
                Registrar Resultado
              </h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Modalidade do Jogo
                  </label>
                  <select
                    value={selectedGame}
                    onChange={e => setSelectedGame(e.target.value)}
                    className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  >
                    <option value="">Selecione a modalidade...</option>
                    {gameTypes.map(game => (
                      <option key={game.id} value={game.id}>
                        {game.name} ({game.category})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Resultado: Vencedor &gt; Perdedor
                  </label>
                  <input
                    type="text"
                    value={inputText}
                    onChange={e => setInputText(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && processMatch()}
                    placeholder="Ex: João Silva > Maria Lima"
                    className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>

                <button
                  onClick={processMatch}
                  className="w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 rounded-lg transition"
                >
                  Registrar Partida
                </button>

                <button
                  onClick={() => setView('register')}
                  className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 rounded-lg transition flex items-center justify-center gap-2"
                >
                  <UserPlus className="w-5 h-5" />
                  Inscrições
                </button>

                <button
                  onClick={() => window.open('?display=true', '_blank')}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition"
                >
                  Ver Telão (Nova Aba)
                </button>

                <button
                  onClick={() => setView('stats-games')}
                  className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-3 rounded-lg transition flex items-center justify-center gap-2"
                >
                  <BarChart3 className="w-5 h-5" />
                  Dados Jogos
                </button>

                <button
                  onClick={() => setView('stats-players')}
                  className="w-full bg-green-500 hover:bg-green-600 text-white font-semibold py-3 rounded-lg transition flex items-center justify-center gap-2"
                >
                  <UserCircle className="w-5 h-5" />
                  Dados Jogadores
                </button>

                <button
                  onClick={exportToCSV}
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-3 rounded-lg transition flex items-center justify-center gap-2"
                >
                  <Download className="w-5 h-5" />
                  Exportar CSV
                </button>

                <button
                  onClick={resetChampionship}
                  className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-3 rounded-lg transition"
                >
                  Resetar Campeonato
                </button>
              </div>
            </div>

            {/* Histórico de Jogos */}
            <div className="bg-white rounded-xl shadow-lg p-6 max-h-96 overflow-y-auto">
              <h2 className="text-xl font-bold text-slate-800 mb-4">Histórico</h2>
              <div className="space-y-3">
                {games.length === 0 ? (
                  <p className="text-slate-500 text-center py-4">Nenhum jogo registrado</p>
                ) : (
                  games.map(game => (
                    <div key={game.id} className="bg-slate-50 rounded-lg p-3 border-l-4 border-purple-500">
                      <div className="text-sm font-semibold text-purple-700 mb-1">
                        {game.gameType} • {game.gameCategory}
                      </div>
                      <div className="font-medium text-slate-800">
                        <span className="text-green-600">{game.winner}</span>
                        {' > '}
                        <span className="text-red-600">{game.loser}</span>
                      </div>
                      <div className="text-xs text-slate-500 mt-1">{game.timestamp}</div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Ranking */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-2xl font-bold text-slate-800 mb-6 flex items-center gap-2">
                <Users className="w-6 h-6" />
                Ranking Atual
              </h2>

              <div className="space-y-3">
                {sortedParticipants.map((p, index) => (
                  <div
                    key={p.id}
                    className={`flex items-center justify-between p-4 rounded-lg transition ${
                      index === 0
                        ? 'bg-gradient-to-r from-yellow-100 to-yellow-50 border-2 border-yellow-400'
                        : 'bg-slate-50 hover:bg-slate-100'
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <div className={`text-2xl font-bold w-12 h-12 flex items-center justify-center rounded-full ${
                        index === 0 ? 'bg-yellow-400 text-white'
                        : index === 1 ? 'bg-slate-300 text-slate-700'
                        : index === 2 ? 'bg-orange-300 text-orange-900'
                        : 'bg-slate-200 text-slate-600'
                      }`}>
                        {index + 1}
                      </div>
                      <div>
                        <div className="font-bold text-slate-800 text-lg">{p.name}</div>
                        <div className="text-sm text-slate-500">{p.id}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-lg shadow-sm">
                      <Star className="w-6 h-6 text-yellow-500 fill-yellow-500" />
                      <span className="text-2xl font-bold text-slate-800">{p.stars}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChampionshipTracker;
