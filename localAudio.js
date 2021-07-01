import Discord from 'discord.js'
import fs from 'fs'

const queue = []
let songNumber = 0
let dispatcher
let broadcast

const checkIfAudioFile = (fileName) => {
  const allowedFormats = ['mp3', 'webm', 'wav', 'ogg', 'm4a']
  const extension = fileName.split('.').pop()
  return allowedFormats.includes(extension)
}

const broadcastAudio = async (broadcastInput) => {
  broadcast = broadcastInput
  fs.readdirSync('./audio').forEach((file) => {
    if (checkIfAudioFile(file)) {
      queue.push(`./audio/${file}`)
    }
  })
  const startBroadcast = () => {
    if (queue[0]) {
      dispatcher = broadcast.play(fs.createReadStream(queue[songNumber]))
      dispatcher.on('finish', () => {
        if (songNumber + 1 === queue.length) {
          songNumber = 0
        } else {
          songNumber++
        }
        startBroadcast()
      })
    }
  }
  startBroadcast()
}

const playBroadcast = async (broadcast, message) => {
  const myMessage = message
  const connection = await myMessage.member.voice.channel.join()
  const dispatcher = await connection.play(broadcast, {
    bitrate: myMessage.member.voice.channel.bitrate
  })
  dispatcher.on('start', () => {
    console.log(queue[songNumber])
  })
}

const skipFile = () => {
  if (songNumber + 1 === queue.length) {
    songNumber = 0
  } else {
    songNumber++
  }
  broadcastAudio(broadcast)
}

export {
  broadcastAudio,
  playBroadcast,
  skipFile
}
