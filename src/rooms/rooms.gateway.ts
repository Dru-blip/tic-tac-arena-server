import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { RoomsService } from './rooms.service';
import { Server, Socket } from 'socket.io';
import { JoinRoomDto } from './dto/join-room-dto';
import { StartGameDto } from 'src/games/dto/start-game-dto';
import { PlayerMoveDto } from './dto/player-move.dto';
import { RoundResetDto } from './dto/round-reset-dto';
import Room from './entities/room.entity';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class RoomsGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  constructor(private readonly roomsService: RoomsService) {}

  handleConnection(client: Socket, ...args: any[]) {
    //  console.log(client.id + " connected")
  }

  handleDisconnect(client: Socket) {
    const player = this.roomsService.getPlayer(client.id);
    if (!player) {
      return;
    }
    const room = this.roomsService.getRoom(player.roomId);
    this.roomsService.removePlayer(player);
    if (room.totalPlayers === 0) {
      this.roomsService.deleteRoom(room.getId());
    }
    this.server
      .to(player.roomId)
      .emit('playerLeft', { room, playerId: client.id });
  }

  @SubscribeMessage('createRoom')
  createRoom(@ConnectedSocket() client: Socket) {
    const roomId = this.roomsService.createRoom();
    client.emit('roomCreated', roomId);
  }

  @SubscribeMessage('joinRoom')
  joinRoom(@ConnectedSocket() client: Socket, @MessageBody() jrd: JoinRoomDto) {
    const room = this.roomsService.addPlayer(jrd?.playerId, jrd?.id);
    client.join(room.getId());
    this.server.to(room.getId()).emit('playerJoined', room);
    if (room.totalPlayers === 2) {
      this.roomsService.startGame({
        roomId: room.getId(),
        playerIds: room.getPlayersIds(),
      });
      this.server.to(jrd.id).emit('gameStarted', room);
    }
  }

  @SubscribeMessage('playerLeaving')
  playerLeaving(@ConnectedSocket() client: Socket) {
    const player = this.roomsService.getPlayer(client.id);
    if (!player) {
      return;
    }
    const room = this.roomsService.getRoom(player.roomId);
    this.roomsService.removePlayer(player);
    if (room.totalPlayers === 0) {
      this.roomsService.deleteRoom(room.getId());
    }
    this.server
      .to(player.roomId)
      .emit('playerLeft', { room, playerId: client.id });
  }

  @SubscribeMessage('startGame')
  startGame(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: StartGameDto,
  ) {
    this.roomsService.startGame(data);
    const room = this.roomsService.getRoom(data.roomId);
    this.server.to(data.roomId).emit('gameStarted', room);
  }

  @SubscribeMessage('roundReset')
  roundReset(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: RoundResetDto,
  ) {
    const room: Room = this.roomsService.getRoom(data.roomId);
    room.roundReset();
    this.server.to(data.roomId).emit('roundStart', room);
  }

  @SubscribeMessage('makingMove')
  makingMove(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: PlayerMoveDto,
  ) {
    const room = this.roomsService.makeMove(this.server, data);
    this.roomsService.getRoom(data.roomId);
    client.broadcast.emit('madeMove', room);
    this.roomsService.checkForDrawOrWinner(this.server, data, room);
  }
}
