import { useState, useEffect } from "react";
import axios from "axios";
import QRCode from "qrcode";
import { io } from "socket.io-client";
import { useParams, useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import Loading from "./loading";
import { apiUrl, websocketUrl } from "@/utils/config";

const DonateForm = () => {
    const { username } = useParams();
    const navigate = useNavigate();
    const [user, setUser] = useState("Anonymous");
    const [iduser, setId] = useState(null);
    const [amount, setAmount] = useState("3000");
    const [comment, setComment] = useState("");
    const [loading, setLoading] = useState(false);
    const [qrCodeData, setQrCodeData] = useState(() => localStorage.getItem("qrCodeData"));
    const [paymentLink, setPaymentLink] = useState(() => localStorage.getItem("paymentLink"));
    const [transactionID, setTransactionID] = useState(() => localStorage.getItem("transactionID"));
    const [paymentMethod, setPaymentMethod] = useState("bcel");
    const [socket, setSocket] = useState(null);
    const [progress, setProgress] = useState(0);
    const [load, setLoad] = useState(false);

    const maxWords = 150;

    const EXPIRATION_TIME = 180000;

    useEffect(() => {
        const savedTimestamp = localStorage.getItem("timestamp");
        const currentTime = Date.now();

        if (savedTimestamp && currentTime - savedTimestamp > EXPIRATION_TIME) {
            clearLocalStorage();
        }
    }, []);

    useEffect(() => {
        const fetchUserData = async () => {
            setLoad(true);
            try {
                const response = await fetch(`${apiUrl}/user/get-user/${username}`);
                if (!response.ok) {
                    throw new Error("User not found.");
                }
                const data = await response.json();
                setId(data._id);
            } catch (error) {
                Swal.fire({
                    title: "Error",
                    text: error.message,
                    icon: "error",
                    confirmButtonText: "OK",
                }).then(() => {
                    navigate("/");
                });
            } finally {
                setTimeout(() => {
                    setLoad(false);
                }, 1000);
            }
        };

        fetchUserData();
    }, [username, navigate]);




    useEffect(() => {
        const newSocket = io(websocketUrl);
        setSocket(newSocket);

        return () => {
            newSocket.disconnect();
        };
    }, []);

    useEffect(() => {
        if (socket && iduser) {
            socket.emit("joinRoom", iduser);
        }
    }, [socket, iduser]);


    const handleSubmit = async (e) => {
        e.preventDefault();
        const parsedAmount = parseInt(amount, 10);

        if (!user || !parsedAmount || parsedAmount < 1) {
            Swal.fire({
                title: "ຜິດພາດ",
                text: "ກະລຸນາປ້ອນຈໍານວນຢ່າງໜ້ອຍຕ້ອງ 1000 ກີບ",
                icon: "warning",
                confirmButtonText: "ຕົກລົງ",
            });
            return;
        }

        setLoading(true);
        setProgress(0);

        let progress = 0;
        const progressInterval = setInterval(() => {
            progress += 10;
            setProgress(progress);
            if (progress >= 100) {
                clearInterval(progressInterval);
            }
        }, 100);

        try {
            await submitPayment();
        } catch (error) {
            Swal.fire({
                title: "ຜິດພາດ",
                text: "ບໍ່ສາມາດ Donate ໄດ້ກະລຸນາລອງໃໝ່ອີກຄັ້ງ",
                icon: "error",
                confirmButtonText: "ຕົກລົງ",
            });
        } finally {
            clearInterval(progressInterval);
            setLoading(false);
            setProgress(0);
        }
    };

    const submitPayment = async () => {
        const parsedAmount = parseInt(amount, 10);
        try {
            const response = await Promise.race([
                axios.post(`${apiUrl}/api/submit-payment`, { amount: parsedAmount, description: username, paymentMethod }),
                new Promise((_, reject) =>
                    setTimeout(() => reject(new Error("Request timed out")), 10000)
                ),
            ]);

            const { qrCode, link, transactionId } = response.data;

            const timestamp = Date.now();
            localStorage.setItem("qrCodeData", qrCode);
            localStorage.setItem("paymentLink", link);
            localStorage.setItem("transactionID", transactionId);
            localStorage.setItem("timestamp", timestamp);

            setQrCodeData(qrCode);
            setPaymentLink(link);
            setTransactionID(transactionId);
        } catch (error) {
            Swal.fire({
                title: "ຜິດພາດ",
                text: "ບໍ່ສາມາດ Donate ໄດ້ກະລຸນາລອງໃໝ່ອີກຄັ້ງ",
                icon: "error",
                confirmButtonText: "ຕົກລົງ",
            });
        }
    };


    const clearLocalStorage = () => {
        localStorage.removeItem("qrCodeData");
        localStorage.removeItem("paymentLink");
        localStorage.removeItem("transactionID");
        localStorage.removeItem("timestamp");
        setUser("Anonymous");
        setAmount("1000");
        setComment("");
        setQrCodeData(null);
        setPaymentLink(null);
        setTransactionID(null);
    };


    useEffect(() => {
        if (socket && transactionID && iduser) {
            socket.on("paymentStatus", (data) => {
                const parsedAmount = parseInt(amount, 10);
                const DateNow = new Date();
                if (data.transactionId === transactionID) {
                    if (data.success) {

                        socket.emit("donationReceived", {
                            donor: user,
                            id: iduser,
                            message: comment,
                            amount: parsedAmount,
                            dateTime: DateNow,
                            paymentMethod: data.paymentMethod,
                            transactionId: transactionID,
                        })

                        socket.emit("PaymentReceived", {
                            transactionId: transactionID,
                            id: iduser,
                            amount: data.txnAmount,
                            status: data.status,
                            paymentMethod: data.paymentMethod,
                            dateTime: data.txnDateTime,
                            memo: data.memo,
                            merchantName: data.merchantName,
                            billNumber: data.billNumber,
                        })

                        Swal.fire({
                            title: "ສຳເລັດ!",
                            text: "ຂອບໃຈສໍາລັບການໂດເນດ!",
                            icon: "success",
                            confirmButtonText: "ຕົກລົງ",
                        })

                        handleCancel();
                    } else {
                        Swal.fire({
                            title: "ຜິດພາດ",
                            text: "ບໍ່ສາມາດ Donate ໄດ້ກະລຸນາລອງໃໝ່ອີກຄັ້ງ",
                            icon: "error",
                            confirmButtonText: "ຕົກລົງ",
                        }).then(() => handleCancel());
                    }
                } else {
                    console.warn("Transaction ID mismatch. Ignoring the payment status.");
                }
            });
        }
    }, [socket, transactionID]);

    useEffect(() => {
        if (qrCodeData) {
            const canvas = document.getElementById("qrcodeCanvas");
            if (canvas) {
                QRCode.toCanvas(canvas, qrCodeData, function (error) {
                    if (error) console.error("Error generating QR code:", error);
                });
            }
        }
    }, [qrCodeData]);


    const handleCommentChange = (e) => {
        const value = e.target.value;
        const visibleChars = value.match(/[\u0000-\uFFFF]/gu) || [];
        if (visibleChars.length <= maxWords) {
            setComment(value);
        }
    };

    const handleCancel = () => {
        clearLocalStorage();
    };


    return (
        <>
            {load ? (
                <div className="flex justify-center items-center h-screen bg-black">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-blue-500"></div>
                </div>
            ) : (
                <div className={`transition-opacity duration-700 ${load ? "opacity-0" : "opacity-100"} font-lao bg-cover bg-center-top-80 bg-no-repeat bg-[url("/img/blue.jpg")] min-h-screen flex justify-center items-center`}>
                    <div className="bg-[rgb(0,0,0,0.7)]/50 p-8 sm:p-8 rounded-xl shadow-xl w-full max-w-[100%] sm:max-w-md lg:max-w-lg">
                        <div className="text-center mb-6">

                            <h3
                                key={qrCodeData ? "qrcode" : "donate"}
                                className="font-lao animate-typing-caret mx-auto text-white text-2xl mb-3 md:text-3xl"
                            >
                                {qrCodeData ? "ຍິນດີຕ້ອນຮັບສູ່ໜ້າຊຳລະ " : "ຍິນດີຕ້ອນຮັບສູ່ໜ້າໂດເນດຂອງ "}
                                {username}
                            </h3>
                        </div>
                        {!qrCodeData ? (
                            <form onSubmit={handleSubmit} className="flex flex-col w-full">
                                <label htmlFor="user" className="text-white mb-2">ຊື່:</label>
                                <input
                                    type="text"
                                    id="user"
                                    name="user"
                                    value={user}
                                    onChange={(e) => setUser(e.target.value)}
                                    placeholder="ຊື່"
                                    required
                                    maxLength={20}
                                    className="bg-white p-3 mb-4 border border-gray-300 rounded-md text-black outline-none"
                                />
                                <label htmlFor="paymentMethod" className="text-white mb-2">ວິທີການຊຳລະ:</label>
                                <select
                                    id="paymentMethod"
                                    value={paymentMethod}
                                    onChange={(e) => setPaymentMethod(e.target.value)}
                                    required
                                    className="bg-white p-3 mb-4 border border-gray-300 rounded-md text-black outline-none"
                                >
                                    <option value="bcel">BCEL</option>
                                    <option value="jdb">JDB</option>
                                </select>

                                <label htmlFor="amount" className="text-white mb-2">ຈຳນວນເງິນ:</label>
                                <input
                                    type="number"
                                    id="amount"
                                    name="amount"
                                    value={amount}
                                    onChange={(e) => setAmount(e.target.value)}
                                    placeholder="ຂັ້ນຕໍ່າ 3000 ກີບ"
                                    required
                                    className="bg-white p-3 mb-4 border border-gray-300 rounded-md text-black outline-none"
                                />

                                <label htmlFor="comment" className="text-white mb-2">ຂໍ້ຄວາມ:</label>
                                <textarea
                                    id="comment"
                                    name="comment"
                                    value={comment}
                                    onChange={handleCommentChange}
                                    rows="4"
                                    placeholder="ໃສ່ຂໍ້ຄວາມ"
                                    className="bg-white p-3 mb-4 border border-gray-300 rounded-md text-black outline-none"
                                ></textarea>
                                <div className="text-sm text-white mb-4 ml-auto">
                                    {comment.length}/{maxWords} ໂຕອັກສອນ
                                </div>

                                <button
                                    type="submit"
                                    disabled={loading}
                                    className={`p-3 ${loading ? "bg-gray-400" : "bg-blue-600 hover:bg-blue-700"
                                        } text-white rounded-md transition-all duration-300`}
                                >
                                    ໂດເນດ
                                </button>
                            </form>
                        ) : (
                            <div className="flex flex-col items-center justify-center">
                                <canvas id="qrcodeCanvas" className="mx-auto mb-4"></canvas>
                                <a href={paymentLink} target="_blank" rel="noopener noreferrer">
                                    <img
                                        src={paymentMethod === "bcel" ? "img/bcel.webp" : "img/jdb.png"}
                                        alt="Payment Link Image"
                                        className="h-48 cursor-pointer rounded-md"
                                    />
                                </a>
                                <button
                                    onClick={handleCancel}
                                    className="p-3 bg-red-600 text-white rounded-md hover:bg-red-700 transition-all duration-300 mt-4"
                                >
                                    ຍົກເລີກ
                                </button>
                            </div>
                        )}

                        {loading && <Loading progress={progress} />}
                    </div>
                </div>
            )}
        </>

    );
};

export default DonateForm;
