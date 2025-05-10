import { WebSocket, WebSocketServer } from "ws";

const wss = new WebSocketServer({ port: 8080 })

let receiverSocket: null | WebSocket = null
let senderSocket: null | WebSocket = null

wss.on("connection", function connection(socket) {
  wss.on("error", (error) => {
    console.log(error)
  })

  socket.on("message", (data: any) => {
    const message = JSON.parse(data)
    if (message.type === "sender") {
      senderSocket = socket
    } else if (message.type === "receiver") {
      receiverSocket = socket;
    } else if (message.type === "createOffer") {
      if (socket !== senderSocket) {
        return;
      }
      receiverSocket?.send(JSON.stringify({ type: "createOffer", sdp: message.sdp }))
    } else if (message.type === "createAnswer") {
      if (socket !== receiverSocket) {
        return
      }
      senderSocket?.send(JSON.stringify({ type: "createAnswer", sdp: message.sdp }))
    } else if (message.type === "iceCandidate") {
      if (socket === senderSocket) {
        receiverSocket?.send(JSON.stringify({ type: "iceCandidate", candidate: message.iceCandidate }))
      } else if (socket === receiverSocket) {
        senderSocket?.send(JSON.stringify({ type: "iceCandidate", candidate: message.iceCandidate }))
      }
    }
  })

  socket.on("error", (error) => {
    console.log(error)
  })

  // socket.on("close", () => {
  //   console.log("Connectoin closed")
  // })
})

