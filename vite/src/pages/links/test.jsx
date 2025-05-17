import socketIOClient from "socket.io-client";
import { websocketUrl } from "@/utils/config";

const socket = socketIOClient(`${websocketUrl}`);

const DonationButton = () => {

    const handleMultipleDonations = () => {
        for (let i = 0; i < 2; i++) {
            setTimeout(() => {
                const iduser = "67e3ce20bf739cabf83df938";
                const user = `Anonymous`;
                const comment = `สะบายดี`; 
                const parsedAmount = 1000 + i * 10; 
                const transactionID = `uniqueTransactionID${i + 1}`;
                const paymentMethod = "bcel";
                const dateTime = new Date().toLocaleString();

                socket.emit("donationReceived", {
                    donor: user,
                    id: iduser,
                    message: comment,
                    amount: parsedAmount,
                    dateTime: dateTime,
                    paymentMethod: paymentMethod,
                    transactionId: transactionID,
                });

            }, i * 1000);
        }

        setDonationStatus("Donations sent successfully!");
    };

    const handleDonations2 = () => {
        const user1 = "67e28254f1f62102ea7bac4b";
        const user2 = "67db7c1c71ad4cde8b067012"; 
        const totalDonations = 10;
        const donationsPerUser = totalDonations / 2;

        for (let i = 0; i < totalDonations; i++) {
            setTimeout(() => {
                const currentUser = i < donationsPerUser ? user1 : user2;
                const user = `${currentUser === user1 ? "Anonymous AA" : "Anonymous BB"} ${i + 1}`; 
                const comment = `สะบายดี ${i + 1}`; 
                const parsedAmount = 1000 + i * 10; 
                const transactionID = `uniqueTransactionID${i + 1}`; 
                const paymentMethod = "bcel";
                const dateTime = new Date().toLocaleString();

                socket.emit("donationReceived", {
                    donor: user,
                    id: currentUser,
                    message: comment,
                    amount: parsedAmount,
                    dateTime: dateTime,
                    paymentMethod: paymentMethod,
                    transactionId: transactionID,
                });

                console.log(`Sent donation from ${user}: ${parsedAmount} for transaction ${transactionID}`);
            }, i * 1000); 
        }

        setDonationStatus("Donations sent successfully!");
    };


    return (
        <div className="flex flex-col items-center">
            <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded " onClick={handleMultipleDonations}>Send 10 Donations</button>
            <button className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded mt-3" onClick={handleDonations2}>Send 5 Donations Split</button>
        </div>
    );
};

export default DonationButton;