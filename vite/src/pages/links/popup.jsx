import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import io from "socket.io-client";
import { apiUrl, websocketUrl } from "@/utils/config";

const DonationPopup = () => {
  const { userid } = useParams();
  const navigate = useNavigate();
  const [id, setId] = useState(null);
  const [donationQueue, setDonationQueue] = useState([]);
  const [currentDonation, setCurrentDonation] = useState(null);
  const isProcessing = useRef(false);
  // const gifs = ["arisu.gif", "arisu1.gif", "arisu2.gif", "arisu3.gif"];

  // const getRandomGif = () => gifs[Math.floor(Math.random() * gifs.length)];

  const speakText = (text) => {
    if (!("speechSynthesis" in window)) return;
    const speak = () => {
      const voices = window.speechSynthesis.getVoices();
      const voice = voices.find((v) => v.lang === "th-TH") || voices[0];
      const utterance = new SpeechSynthesisUtterance(text || "No comment provided.");
      utterance.voice = voice;
      utterance.onend = () => processNextDonation();
      window.speechSynthesis.cancel();
      window.speechSynthesis.speak(utterance);
    };
    if (window.speechSynthesis.getVoices().length > 0) {
      speak();
    } else {
      window.speechSynthesis.onvoiceschanged = () => speak();
    }
  };

  const typeEffect = (text, callback) => {
    const textEffectElement = document.querySelector(".texteffect");
    let typedText = "";
    let x = 0;
    const animate = () => {
      if (x < text.length) {
        typedText += text.charAt(x);
        textEffectElement.innerHTML = typedText;
        x++;
        setTimeout(animate, 50);
      } else if (callback) {
        callback();
      }
    };
    animate();
  };

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

  const handleDonation = ({ user, comment, amount }) => {
    const notificationElement = document.getElementById("notification");
    // const gifElement = document.getElementById("gif");
    const effectElement = document.getElementById("effect");
    effectElement.innerHTML = `
      <span class="font-lao" style="color: #60a5fa; font-weight: bold; font-size: 1.125rem;">${user || "Anonymous"}</span>
      <span class="font-lao" style="color: #FFF; font-size: 1.125rem;"> ໂດເນດ </span>
      <span class="font-lao" style="color: #60a5fa; font-weight: bold; font-size: 1.125rem;">${amount || "0"} ກີບ</span><br>
      <span class="texteffect"></span>
    `;
    // gifElement.src = `gif/${getRandomGif()}`;
    notificationElement.classList.remove("hidden");
    notificationElement.classList.add("flex");
    const sound = new Audio("/mp3/sound.mp3");
    sound.play().catch((error) => {
      console.error("Error playing audio:", error);
    });
    sound.volume = 0.2;
    sound.play();
    sound.onended = () => {
      typeEffect(comment || "#########", () => {
        setTimeout(() => speakText(comment), 500);
      });
    };
    setTimeout(() => {
      notificationElement.classList.add("hidden");
      notificationElement.classList.remove("flex");
    }, 10000);
  };

  const processNextDonation = () => {
    setCurrentDonation(null);
    isProcessing.current = false;
    if (donationQueue.length > 0) {
      const nextDonation = donationQueue.shift();
      setDonationQueue([...donationQueue]);
      processDonation(nextDonation);
    }
  };

  const processDonation = (donation) => {
    if (isProcessing.current) return;
    isProcessing.current = true;
    setCurrentDonation(donation);
    handleDonation(donation);
  };

  useEffect(() => {
    const socket = io(websocketUrl);
    socket.emit("joinRoom", id);
    socket.on("Overlay", (data) => {
      setDonationQueue((prevQueue) => [...prevQueue, data]);
    });
    return () => socket.disconnect();
  }, [id]);

  useEffect(() => {
    if (donationQueue.length > 0 && !currentDonation) {
      const nextDonation = donationQueue.shift();
      setDonationQueue([...donationQueue]);
      processDonation(nextDonation);
    }
  }, [donationQueue, currentDonation]);

  return (
    <div id="notification" className="hidden flex-col items-center justify-center h-screen px-5 transition-opacity duration-2000">
      <div className="flex flex-col items-center">
        {/* <img id="gif" src="" alt="Random GIF" className="w-52 h-auto mb-4 rounded-lg" /> */}
      </div>
      <p id="effect" className="text-center text-white text-lg"></p>
    </div>
  );
};

export default DonationPopup;
