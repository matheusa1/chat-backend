import {
  WebSocketGateway,
  SubscribeMessage,
  WebSocketServer,
} from '@nestjs/websockets'
import { RoomService } from './room.service'
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

    const rooms = this.roomService.leaveRoomByClientId(client.id)
    rooms.forEach((room) => {
      console.log(room.clients)
      if (room.clients.length === 1) {
        this.roomService.deleteRoom(room.id)
        this.logger.verbose(`Room ${room.id} deleted`)
      } else {
        room.clients.forEach((clientRoom) => {
          this.io.to(clientRoom.socketId).emit('userLeave', {
            socketId: client.id,
          })
        })
      }
    })
  }

  @SubscribeMessage('leaveRoom')
  leaveRoom(client: Socket, id: string) {
    try {
      const room = this.roomService.leaveRoom(id, client)
      this.logger.verbose(`Client(${client.id}) leave room ${room.data.id}`)
      console.log(room.data.clients)

      if (room.data.clients.length === 0) {
        this.roomService.deleteRoom(room.data.id)
        this.logger.verbose(`Room ${room.data.id} deleted`)
      } else {
        room.data.clients.forEach((clientRoom) => {
          this.io.to(clientRoom.socketId).emit('userLeave', {
            socketId: client.id,
          })
        })
      }
    } catch (error: unknown) {
      return client.emit('error', error)
    }
  }

  @SubscribeMessage('enterRoom')
  enterRoom(client: Socket, id: string) {
    try {
      const room = this.roomService.enterRoom(id, client)
      this.logger.verbose(`Client(${client.id}) enter in room ${room.data.id}`)

      const userName = room.data.clients.find(
        (clientRoom) => clientRoom.socketId === client.id,
      ).name

      room.data.clients.forEach((clientRoom) => {
        this.io.to(clientRoom.socketId).emit('userEnter', {
          socketId: client.id,
          name: userName,
        })
      })
    } catch (error: unknown) {
      return client.emit('error', error)
    }
  }

  @SubscribeMessage('sendMessage')
  sendMessage(client: Socket, data: { content: string; roomId: string }) {
    try {
      const { response: room, message } = this.roomService.sendMessage(
        client.id,
        data,
      )
      this.logger.verbose(
        `Client(${client.id}) send message in room ${room.data.id}`,
      )

      room.data.clients.forEach((clientRoom) => {
        this.io.to(clientRoom.socketId).emit('newMessage', message)
      })
    } catch (error: unknown) {
      return client.emit('error', error)
    }
  }

  @SubscribeMessage('changeName')
  changeName(client: Socket, data: { name: string; roomId: string }) {
    try {
      this.logger.verbose(
        `Client(${client.id}) change name in room ${data.roomId}`,
      )
      const room = this.roomService.changeName(client.id, data)

      const userName = room.data.clients.find(
        (clientRoom) => clientRoom.socketId === client.id,
      ).name

      room.data.clients.forEach((clientRoom) => {
        this.io.to(clientRoom.socketId).emit('changeName', {
          socketId: client.id,
          name: userName,
        })
      })
    } catch (error: unknown) {
      return client.emit('error', error)
    }
  }
}
