import { Injectable } from '@nestjs/common'
import { CreateRoomDto } from './dto/create-room.dto'
import { Room, TMessage } from './entities/room.entity'
import { v4 as uuidv4 } from 'uuid'
import { Socket } from 'socket.io'
import { faker } from '@faker-js/faker'
@Injectable()
export class RoomService {
  private rooms: Room[] = []

  leaveRoomByClientId(id: string) {
    const newRooms = this.rooms.map((room) => ({
      ...room,
      clients: room.clients.filter((client) => client.socketId !== id),
    }))

    const userRooms = this.rooms.filter((room) =>
      room.clients.find((client) => client.socketId === id),
    )

    this.rooms = newRooms

    return userRooms
  }

  leaveRoom(id: string, userId: Socket) {
    const room = this.rooms.find((room) => room.id === id)

    if (!room) {
      throw new Error('Sala não encontrada')
    }

    const newClients = room.clients.filter(
      (client) => client.socketId !== userId.id,
    )

    room.clients = newClients

    this.rooms = this.rooms.map((r) => (r.id === id ? room : r))

    return { error: false, data: room }
  }

  enterRoom(id: string, userId: Socket) {
    const room = this.rooms.find((room) => room.id === id)

    if (!room) {
      throw new Error('Sala não encontrada')
    }

    const randomName = faker.person.fullName()

    const client = { socketId: userId.id, name: randomName }

    room.clients.push(client)

    this.rooms = this.rooms.map((r) => (r.id === id ? room : r))

    return { error: false, data: room }
  }

  create(createRoomDto: CreateRoomDto) {
    const { name, description } = createRoomDto

    if (!name || !description) {
      return { error: true, data: 'Name and description are required' }
    }

    const room = new Room()
    room.id = uuidv4()
    room.clients = []
    room.messages = []
    room.name = name
    room.description = description

    this.rooms.push(room)

    return { error: false, data: room }
  }

  findAll() {
    return this.rooms
  }

  findOne(id: string) {
    return this.rooms.find((room) => room.id === id)
  }

  sendMessage(clientId: string, data: { content: string; roomId: string }) {
    const room = this.rooms.find((room) => room.id === data.roomId)

    if (!room) {
      throw new Error('Sala não encontrada')
    }

    const messageData: TMessage = {
      content: data.content,
      date: new Date(),
      sender: {
        id: room.clients.find((client) => client.socketId === clientId)
          .socketId,
        name: room.clients.find((client) => client.socketId === clientId).name,
      },
    }

    room.messages.push(messageData)

    this.rooms = this.rooms.map((r) => (r.id === room.id ? room : r))

    return { response: { error: false, data: room }, message: messageData }
  }

  changeName(clientId: string, data: { name: string; roomId: string }) {
    const room = this.rooms.find((room) => room.id === data.roomId)

    if (!room) {
      throw new Error('Sala não encontrada')
    }

    const newClients = room.clients.map((client) =>
      client.socketId === clientId ? { ...client, name: data.name } : client,
    )

    room.clients = newClients

    this.rooms = this.rooms.map((r) => (r.id === room.id ? room : r))

    return { error: false, data: room }
  }

  deleteRoom(id: string) {
    this.rooms = this.rooms.filter((room) => room.id !== id)
  }
}
