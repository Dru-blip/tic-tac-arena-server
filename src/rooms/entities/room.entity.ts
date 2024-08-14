import { Player } from 'src/players/entities/player.entity';
import { Board } from './board.entity';

interface Players {
  [key: string]: Player;
}

export default class Room {
  players: Players;
  totalPlayers: number = 0;
  gameStarted: boolean = false;
  gameEnded: boolean = false;
  board: Board;
  draws: number = 0;
  turn: 'X' | 'O' = 'X';
  winner: string|null=null;
  rounds:number=0
  constructor(private id: string) {
    this.players = {};
    this.board = new Board(this.id);
  }

  addPlayer(player:Player) {
    this.totalPlayers++;
    this.players[player.id] = player;
    return this;
  }

  removePlayer(playerId:string){
    // const room = this..get(player.roomId)
    this.totalPlayers--;

    delete this.players[playerId]
  }

  getId(): string {
    return this.id;
  }

  getPlayers(): Players {
    return this.players;
  }

  getPlayersIds(): string[] {
     return Object.keys(this.players)
  }

  getTotalPlayers() {
    return this.totalPlayers;
  }

  roundReset() {
    this.rounds++;
    this.winner = null;
    this.board.reset();
  }

  getPlayer(playerId: string): Player {
    return this.players[playerId];
  }
}
