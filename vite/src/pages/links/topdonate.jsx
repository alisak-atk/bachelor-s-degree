import { useEffect, useState } from "react";
import Swal from "sweetalert2";
import { useParams, useNavigate } from "react-router-dom";
import { apiUrl } from "@/utils/config";

const TopDonators = () => {
  const { userid, timestart, timeend } = useParams();
  const [id, setId] = useState(null);
  const navigate = useNavigate();
  const [topDonators, setTopDonators] = useState([]); 


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

  useEffect(() => {
    if (!id) return;

    const fetchTopDonators = async () => {
      try {

        const res = await fetch(`${apiUrl}/api/topdonators/${id}?timestart=${timestart}&timeend=${timeend}`);

        const data = await res.json();
        setTopDonators(data);
      } catch (error) {
        console.error(error.message);
      }
    };
    fetchTopDonators();


    const intervalId = setInterval(() => {
      fetchTopDonators();
    }, 10000);


    return () => clearInterval(intervalId);
  }, [id, timestart, timeend]);

  const getOrdinal = (n) => {
    const s = ["th", "st", "nd", "rd"];
    const v = n % 100;
    return n + (s[(v - 20) % 10] || s[v] || s[0]);
  };
  const getRankColorClass = (rank) => {
    switch (rank) {
      case 1:
        return "rank-gold";   
      case 2:
        return "rank-silver";  
      case 3:
        return "rank-bronze"; 
      default:
        return "rank-default";
    }
  };
  

  return (
    <div className="topdonator-container">
      <h2 className="topdonator-title">5 ອັນດັບຜູ້ສະໜັບສະໜູນ</h2>

      <div className="topdonator-list">
        {topDonators && topDonators.length > 0 ? (
          topDonators.map((donator, index) => (
            <div key={index} className="topdonator-row">
              <div className={`topdonator-name ${getRankColorClass(index + 1)}`}>
                <span className="rank">{getOrdinal(index + 1)}</span> {donator.donor}
              </div>
              <div className="topdonator-amount">
                {donator.amount.toLocaleString()} ກີບ
              </div>
            </div>
          ))
        ) : (
          <div className="topdonator-empty"></div>
        )}
      </div>
    </div>
  );



}

export default TopDonators;
