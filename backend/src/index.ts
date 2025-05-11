import { WebSocket, WebSocketServer } from "ws";

const wss = new WebSocketServer({ port: 8080 })

let receiverSocket: null | WebSocket = null
let senderSocket: null | WebSocket = null

wss.on("connection", function connection(socket) {
  console.log("WS Connectoin Started")
  wss.on("error", (error) => {
    console.log(error)
  })

  socket.on("message", (data: any) => {
    const message = JSON.parse(data)
    if (message.type === "sender") {
      console.log("Sender arrived")
      senderSocket = socket
    } else if (message.type === "receiver") {
      console.log("receiver arrived")
      receiverSocket = socket;
    } else if (message.type === "createOffer") {
      console.log("sending offer")
      if (socket !== senderSocket) {
        return;
      }
      receiverSocket?.send(JSON.stringify({ type: "createOffer", sdp: message.sdp }))
    } else if (message.type === "createAnswer") {
      console.log("sending answer")
      if (socket !== receiverSocket) {
        return
      }
      senderSocket?.send(JSON.stringify({ type: "createAnswer", sdp: message.sdp }))
    } else if (message.type === "iceCandidate") {
      if (socket === senderSocket) {
        console.log("ice candidate sent")
        receiverSocket?.send(JSON.stringify({ type: "iceCandidate", candidate: message.candidate }))
      } else if (socket === receiverSocket) {
        console.log("ice candidate sent")
        senderSocket?.send(JSON.stringify({ type: "iceCandidate", candidate: message.candidate }))
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

