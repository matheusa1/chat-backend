import { Body, Controller, Get, Param, Post } from '@nestjs/common'
import { RoomService } from './room.service'
import { CreateRoomDto } from './dto/create-room.dto'

@Controller('room')
export class RoomController {
  constructor(private readonly roomService: RoomService) {}

  @Post()
  createRoom(@Body() payload: CreateRoomDto) {
    return this.roomService.create(payload)
  }

  @Get()
  getRooms() {
    return this.roomService.findAll()
  }

  @Get(':id')
  getRoomById(@Param('id') id: string) {
    return this.roomService.findOne(id)
  }
}
