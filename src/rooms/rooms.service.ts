import { Injectable } from '@nestjs/common';
import { Server } from 'socket.io';
import { StartGameDto } from 'src/games/dto/start-game-dto';
import { Player } from 'src/players/entities/player.entity';
import { v4 as uuid4 } from 'uuid';
import { PlayerMoveDto } from './dto/player-move.dto';
import Room from './entities/room.entity';
import { checkForDraw, checkWinner } from './util';

@Injectable()
export class RoomsService {
  constructor() {}

  private rooms: Map<string, Room> = new Map();
  private players:Map<string,Player> =new Map();

  createRoom(): string {
    const id = uuid4();
    const newRoom = new Room(id);
    this.rooms.set(id, newRoom);
    return id;
  }

  getRoom(id: string): Room {
    // console.log(this.rooms)
    return this.rooms.get(id);
  }

  startGame(data: StartGameDto) {
    const room = this.rooms.get(data.roomId);
    const players = room.getPlayers();
    const [player1, player2] = data.playerIds;
    room.gameStarted = true;
    room.rounds=1;
    room.draws=0;
    players[player1].score = 0;
    players[player2].score=0;
    players[player1].symbol = 'X';
    players[player2].symbol = 'O';
  }

  getPlayer(playerId: string): Player {
    return this.players.get(playerId);
  }

  removePlayer(player:Player){
    const room = this.rooms.get(player.roomId)
    room.removePlayer(player.id)
    this.players.delete(player.id)
  }

  deleteRoom(roomId:string){
    this.rooms.delete(roomId)
  }

  addPlayer(playerId: string, roomId: string) {
    const room = this.rooms.get(roomId);
    const player=new Player(playerId,roomId)
    this.players.set(playerId,player)
    room.addPlayer(player);
    return room;
  }

  makeMove(server: Server, data: PlayerMoveDto) {
    const room = this.rooms.get(data.roomId);
    room.board.setCell(data.position, data.symbol);
    room.turn = room.turn === 'X' ? 'O' : 'X';
    return room;
  }

  checkForDrawOrWinner(server: Server, data: PlayerMoveDto, room: Room) {
    const isDraw = checkForDraw(room.board.getCells());
    if (isDraw) {
      room.draws++;
      room.board.reset();
      server.to(room.getId()).emit('roundDraw', room);
      setTimeout(() => {
        room.roundReset();
        server.to(room.getId()).emit('roundStart', room);
      }, 2000);
      return;
    } else {
      const winner = checkWinner(room.board.getCells());
      if (winner === 'X' || winner === 'O') {
        room.winner = room.players[data.playerId].symbol;
        room.getPlayer(data.playerId).score++;
        room.board.reset();
        server.to(room.getId()).emit('roundWin', room);
        setTimeout(() => {
          room.roundReset();
          server.to(room.getId()).emit('roundStart', room);
        }, 2000);
      }
    }
  }
}
