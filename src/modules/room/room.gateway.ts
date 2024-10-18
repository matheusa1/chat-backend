import {
  WebSocketGateway,
  SubscribeMessage,
  MessageBody,
  WebSocketServer,
  ConnectedSocket,
} from '@nestjs/websockets'
import { RoomService } from './room.service'
import { CreateRoomDto } from './dto/create-room.dto'
import { UpdateRoomDto } from './dto/update-room.dto'
import { Logger } from '@nestjs/common'
import { Server, Socket } from 'socket.io'

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class RoomGateway {
  constructor(private readonly roomService: RoomService) {}

  private readonly logger = new Logger(RoomGateway.name)

  @WebSocketServer() io: Server

  afterInit() {
    this.logger.log('Initialized')
  }

  handleConnection(client: Socket) {
    const { sockets } = this.io.sockets

    this.logger.log(`Client id: ${client.id} connected`)
    this.logger.debug(`Number of connected clients: ${sockets.size}`)
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Cliend id:${client.id} disconnected`)
  }

  @SubscribeMessage('createRoom')
  create(
    @ConnectedSocket() client: Socket,
    @MessageBody() createRoomDto: CreateRoomDto,
  ) {
    const res = this.roomService.create(createRoomDto)

    if (res.error) {
      client.emit('error', res)
    }

    return this.io.emit('roomCreated', res)
  }

  @SubscribeMessage('findAllRoom')
  findAll() {
    return this.roomService.findAll()
  }

  @SubscribeMessage('findOneRoom')
  findOne(@MessageBody() id: number) {
    return this.roomService.findOne(id)
  }

  @SubscribeMessage('updateRoom')
  update(@MessageBody() updateRoomDto: UpdateRoomDto) {
    return this.roomService.update(updateRoomDto.id, updateRoomDto)
  }

  @SubscribeMessage('removeRoom')
  remove(@MessageBody() id: number) {
    return this.roomService.remove(id)
  }
}
