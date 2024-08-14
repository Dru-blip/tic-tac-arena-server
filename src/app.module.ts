import { Module } from '@nestjs/common';
import { RoomsModule } from './rooms/rooms.module';
import { PlayersModule } from './players/players.module';


@Module({
  imports: [RoomsModule, PlayersModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
