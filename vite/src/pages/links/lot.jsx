import { useState, useEffect } from "react";
import Swal from "sweetalert2";
import { useParams, useNavigate } from "react-router-dom";
import { apiUrl } from "@/utils/config";

const DonationLot = () => {
    const { userid, from, to, timestart, timeend } = useParams();
    const navigate = useNavigate();
    const [id, setId] = useState(null);
    const [donationAmount, setDonationAmount] = useState(0);
    const [timeLeft, setTimeLeft] = useState("");
    const startAmount = Number(from) || 0;
    const totalAmount = Number(to) || 1000000;

    
    useEffect(() => {
        const fetchUserData = async () => {
            try {
                const response = await fetch(`${apiUrl}/user/get-id/${userid}`);
                if (!response.ok) {
                    throw new Error("User not found.");
                }
                const data = await response.json();
                setId(data._id);

            } catch (error) {
                Swal.fire({
                    title: "ຜິດພາດ",
                    text: "ເກິດຂໍ້ຜິດພາດ",
                    icon: "error",
                    confirmButtonText: "ຕົກລົງ",
                }).then(() => {
                    navigate("/");
                });
            }
        };

        fetchUserData();
    }, [userid, navigate]);

    const parseDate = (dateStr) => {
        const [day, month, year] = dateStr.split("-");
        return new Date(`${month}-${day}-${year}`);
    };

    useEffect(() => {
        const start = parseInt(from);
        const goal = parseInt(to);
      
        if (start >= goal) {
          Swal.fire({
            title: "ຜິດພາດ",
            text: "ຄ່າເລີ່ມຕົ້ນຕ້ອງນ້ອຍກວ່າເປົ້າໝາຍ",
            icon: "error",
            confirmButtonText: "ຕົກລົງ",
          }).then(() => {
            navigate("/");
          });
        }
      }, [from, to, navigate]);

    useEffect(() => {
        if (!timestart || !timeend) return;

        const startDate = parseDate(timestart);
        const endDate = parseDate(timeend);

        startDate.setHours(0, 0, 0, 0);
        endDate.setHours(0, 0, 0, 0);

        const calculateTimeLeft = () => {
            const now = new Date();
            now.setHours(0, 0, 0, 0);
            const timeDifference = endDate - now;

            if (timeDifference <= 0) {
                setTimeLeft("ໄລຍະເວລາໄດ້ສິ້ນສຸດແລ້ວ.");
            } else {
                const days = Math.floor(timeDifference / (1000 * 60 * 60 * 24));

                setTimeLeft(`${days} ມື້`);
            }
        };

        calculateTimeLeft(); 
        const intervalId = setInterval(calculateTimeLeft, 6000000); 

        return () => clearInterval(intervalId);
    }, [timestart, timeend]);



    
    useEffect(() => {
        if (!id) return;

        
        const fetchDonationAmount = async () => {
            try {
                const res = await fetch(
                    `${apiUrl}/api/total/${id}?timestart=${timestart}&timeend=${timeend}`
                );
                const data = await res.json();
                setDonationAmount(data.amount);
            } catch (err) {
                console.error("Failed to fetch donation amount:", err);
            }
        };

        fetchDonationAmount();

        const intervalId = setInterval(() => {
            fetchDonationAmount();
        }, 10000);


        return () => clearInterval(intervalId);
    }, [id, timestart, timeend]);

    const percentage = Math.min((donationAmount / totalAmount) * 100, 100);

    return (
        <div className="show-container">
            <div className="progress" id="progressBar">
                <div className="progress-text font-lao" id="progressText">
                    {donationAmount.toLocaleString()} ກີບ ({percentage.toFixed(1)}%)
                </div>
                <div className="rounded">
                    <div
                        className="progress-bar"
                        style={{ width: `${percentage}%` }}
                        aria-valuenow={donationAmount}
                        aria-valuemin="0"
                        aria-valuemax="100"
                    ></div>
                </div>
            </div>

            <div className="progress-labels">
                <div className="progress-label-left">{startAmount.toLocaleString()}</div>
                <div className="progress-label-center"><h3 className="font-lao">{timeLeft}</h3></div>
                <div className="progress-label-right">{totalAmount.toLocaleString()}</div>
            </div>
        </div>
    );
};

export default DonationLot;
