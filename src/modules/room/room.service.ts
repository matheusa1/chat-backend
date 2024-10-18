import { Injectable } from '@nestjs/common'
import { CreateRoomDto } from './dto/create-room.dto'
import { UpdateRoomDto } from './dto/update-room.dto'
import { Room } from './entities/room.entity'
import { v4 as uuidv4 } from 'uuid'

@Injectable()
export class RoomService {
  private rooms: Room[] = []

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
    return `This action returns all room`
  }

  findOne(id: number) {
    return `This action returns a #${id} room`
  }

  update(id: number, updateRoomDto: UpdateRoomDto) {
    return `This action updates a #${id} room`
  }

  remove(id: number) {
    return `This action removes a #${id} room`
  }
}
