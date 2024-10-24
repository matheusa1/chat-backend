import { Socket } from 'socket.io'

export class Room {
  id: string
  name: string
  description: string
  clients: {
    name: string
    socketId: string
  }[]
  messages: TMessage[]
}

export type TMessage = {
  content: string
  sender: {
    id: string
    name: string
  }
  date: Date
}
