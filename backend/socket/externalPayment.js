const ioClient = require("socket.io-client");
const { activeTransactions } = require("../services/payment.service");

function externalPaymentsocket(io) {
  const externalSocket = ioClient(`https://payment-gateway.lailaolab.com/?key=${process.env.PAYMENT_Support_SECRET}`);

  externalSocket.on("connect", () => {
    externalSocket.on("join::" + process.env.PAYMENT_Support_SECRET, (data) => {
      if (
        data.status === "PAYMENT_COMPLETED" &&
        data.message === "SUCCESS" &&
        activeTransactions.has(data.transactionId)
      ) {
        activeTransactions.delete(data.transactionId);
        io.emit("paymentStatus", { success: true, ...data });
      }
    });
  });

  externalSocket.on("connect_error", (error) => console.error("Connection failed:", error));
  externalSocket.on("disconnect", (reason) => console.log("External socket disconnected:", reason));
}

module.exports = externalPaymentsocket;
