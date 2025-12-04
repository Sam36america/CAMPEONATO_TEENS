import React, { useState, useEffect } from 'react';
import { Trophy, Star, Plus, Users, Download } from 'lucide-react';

const ChampionshipTracker = () => {
  const initialParticipants = [
    { id: 'P001', name: 'Ezequiel', stars: 4 },
    { id: 'P002', name: 'Paulo', stars: 4 },
    { id: 'P003', name: 'Marina', stars: 4 },
    { id: 'P004', name: 'Carlos', stars: 4 },
    { id: 'P005', name: 'Ana', stars: 4 },
    { id: 'P006', name: 'Roberto', stars: 4 },
    { id: 'P007', name: 'Julia', stars: 4 },
    { id: 'P008', name: 'Fernando', stars: 4 },
    { id: 'P009', name: 'Beatriz', stars: 4 },
    { id: 'P010', name: 'Diego', stars: 4 },
    { id: 'P011', name: 'Lucas', stars: 4 }
  ];

  const gameTypes = [
    { id: 'M001', name: 'FIFA 24', category: 'Esporte' },
    { id: 'M002', name: 'Truco', category: 'Cartas' },
    { id: 'M003', name: 'Just Dance', category: 'Dança' },
    { id: 'M004', name: 'Sinuca', category: 'Mesa' },
    { id: 'M005', name: 'Tênis de Mesa', category: 'Esporte' },
    { id: 'M006', name: 'Mario Kart', category: 'Corrida' },
    { id: 'M007', name: 'Uno', category: 'Cartas' },
    { id: 'M008', name: 'Pebolim', category: 'Mesa' },
    { id: 'M009', name: 'Damas', category: 'Tabuleiro' },
    { id: 'M010', name: 'Street Fighter', category: 'Luta' }
  ];

  // Carregar dados salvos ou usar dados iniciais
  const [participants, setParticipants] = useState(() => {
    const saved = localStorage.getItem('championship_participants');
    return saved ? JSON.parse(saved) : initialParticipants;
  });

  const [games, setGames] = useState(() => {
    const saved = localStorage.getItem('championship_games');
    return saved ? JSON.parse(saved) : [];
  });

  const [selectedGame, setSelectedGame] = useState('');
  const [winner, setWinner] = useState('');
  const [loser, setLoser] = useState('');
  const [inputText, setInputText] = useState('');
  const [view, setView] = useState('control');

  // Salvar dados sempre que mudarem
  useEffect(() => {
    localStorage.setItem('championship_participants', JSON.stringify(participants));
  }, [participants]);

  useEffect(() => {
    localStorage.setItem('championship_games', JSON.stringify(games));
  }, [games]);

  const processMatch = () => {
    if (!selectedGame) {
      alert('Selecione a modalidade do jogo!');
      return;
    }

    const match = inputText.trim().match(/^(\w+)\s*>\s*(\w+)$/i);
    
    if (!match) {
      alert('Formato inválido! Use: NomeVencedor > NomePerdedor');
      return;
    }

    const winnerName = match[1].trim();
    const loserName = match[2].trim();

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

    if (loserParticipant.stars <= 0) {
      alert(`${loserParticipant.name} não tem estrelas para apostar!`);
      return;
    }

    // Atualizar estrelas
    const updatedParticipants = participants.map(p => {
      if (p.id === winnerParticipant.id) {
        return { ...p, stars: p.stars + 1 };
      }
      if (p.id === loserParticipant.id) {
        return { ...p, stars: p.stars - 1 };
      }
      return p;
    });

    const gameInfo = gameTypes.find(g => g.id === selectedGame);

    // Registrar jogo
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
    setWinner('');
    setLoser('');
  };

  const exportToCSV = () => {
    const participantsCSV = [
      'ID,Nome,Estrelas',
      ...participants.map(p => `${p.id},${p.name},${p.stars}`)
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

  if (view === 'display') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 p-8">
        <div className="flex gap-4 mb-6">
          <button
            onClick={() => setView('control')}
            className="px-4 py-2 bg-white/20 hover:bg-white/30 text-white rounded-lg transition"
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
        
        <div className="text-center mb-12">
          <h1 className="text-7xl font-bold text-white mb-4 flex items-center justify-center gap-4">
            <Trophy className="w-20 h-20 text-yellow-400" />
            TOP 3
            <Trophy className="w-20 h-20 text-yellow-400" />
          </h1>
          <p className="text-2xl text-white/80">Líderes do Campeonato</p>
        </div>

        <div className="max-w-4xl mx-auto space-y-6">
          {sortedParticipants.slice(0, 3).map((p, index) => (
            <div
              key={p.id}
              className={`transform transition-all duration-500 ${
                index === 0 ? 'scale-105' : ''
              }`}
            >
              <div
                className={`rounded-xl p-6 border-4 shadow-2xl ${
                  index === 0
                    ? 'bg-gradient-to-r from-yellow-400 to-yellow-600 border-yellow-300 shadow-yellow-500/50'
                    : index === 1
                    ? 'bg-gradient-to-r from-gray-300 to-gray-500 border-gray-200 shadow-gray-500/50'
                    : 'bg-gradient-to-r from-orange-400 to-orange-600 border-orange-300 shadow-orange-500/50'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-5">
                    <div
                      className={`text-5xl font-black w-20 h-20 flex items-center justify-center rounded-full ${
                        index === 0
                          ? 'bg-yellow-600 text-yellow-50'
                          : index === 1
                          ? 'bg-gray-600 text-gray-50'
                          : 'bg-orange-700 text-orange-50'
                      } shadow-xl`}
                    >
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
                    index === 0
                      ? 'bg-yellow-50'
                      : index === 1
                      ? 'bg-gray-50'
                      : 'bg-orange-50'
                  }`}>
                    <Star className={`w-12 h-12 ${
                      index === 0
                        ? 'text-yellow-500 fill-yellow-500'
                        : index === 1
                        ? 'text-gray-500 fill-gray-500'
                        : 'text-orange-500 fill-orange-500'
                    }`} />
                    <span className={`text-5xl font-black ${
                      index === 0
                        ? 'text-yellow-600'
                        : index === 1
                        ? 'text-gray-600'
                        : 'text-orange-600'
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
            <h2 className="text-2xl font-bold text-white mb-4 text-center">🎮 Última Partida</h2>
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
                    onChange={(e) => setSelectedGame(e.target.value)}
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
                    onChange={(e) => setInputText(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && processMatch()}
                    placeholder="Ex: Ezequiel > Paulo"
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
                  onClick={() => setView('display')}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition"
                >
                  Ver Telão
                </button>

                <button
                  onClick={exportToCSV}
                  className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 rounded-lg transition flex items-center justify-center gap-2"
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
                      <div
                        className={`text-2xl font-bold w-12 h-12 flex items-center justify-center rounded-full ${
                          index === 0
                            ? 'bg-yellow-400 text-white'
                            : index === 1
                            ? 'bg-slate-300 text-slate-700'
                            : index === 2
                            ? 'bg-orange-300 text-orange-900'
                            : 'bg-slate-200 text-slate-600'
                        }`}
                      >
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
