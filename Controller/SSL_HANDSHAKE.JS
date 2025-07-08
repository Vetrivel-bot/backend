/**
 * SSL/TLS Handshake Example in Node.js
 *
 * Prerequisites:
 * - OpenSSL installed (to generate cert/key)
 * - Node.js installed (v10+)
 *
 * Steps to run:
 * 1. Generate a self-signed certificate and private key:
 *      openssl req -x509 -newkey rsa:2048 -nodes -keyout key.pem -out cert.pem -days 365
 *
 * 2. Run the TLS server:
 *      node server.js
 *
 * 3. In a separate terminal, run the TLS client:
 *      node client.js
 *
 * You should see handshake details and message exchange logs in both consoles.
 */

// === server.js ===
const tls = require("tls");
const fs = require("fs");

const options = {
  key: fs.readFileSync("key.pem"),       // Private key
  cert: fs.readFileSync("cert.pem"),     // Certificate
  requestCert: true,                      // Request client cert
  rejectUnauthorized: false               // Allow self-signed clients
};

const server = tls.createServer(options, (socket) => {
  console.log("Server: secure connection established");
  console.log("Cipher:", socket.getCipher());
  console.log("Peer CN:", socket.getPeerCertificate().subject.CN);
  socket.write("Hello from TLS server!");
  socket.setEncoding("utf8");
  socket.on("data", (data) => {
    console.log("Server received:", data);
    socket.end();
  });
});

server.listen(8000, () => {
  console.log("TLS server listening on port 8000");
});

// === client.js ===
const tlsClient = require("tls");
const fsClient = require("fs");

const clientOptions = {
  host: "localhost",
  port: 8000,
  ca: [fsClient.readFileSync("cert.pem")] // Trust this CA
};

const client = tlsClient.connect(clientOptions, () => {
  console.log("Client: connected, authorized =", client.authorized);
  console.log("Cipher:", client.getCipher());
  client.write("Hello from TLS client!");
});

client.setEncoding("utf8");
client.on("data", (data) => {
  console.log("Client received:", data);
  client.end();
});

client.on("error", (err) => {
  console.error("Client error:", err);
});