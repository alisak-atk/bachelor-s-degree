import { useState, useEffect } from "react";
import { PageTitle } from "@/hooks/PageTitle";
import { useAuth } from "@/utils/AuthProvider";
import { Button, Divider, message, Input } from "antd";
import VerifyPasswordModal from "@/components/modal/VerifyPasswordModal";
import ProfileModal from "@/components/modal/ProfileModal";
import imageCompression from "browser-image-compression";
import { apiUrl } from "@/utils/config";

const Profile = () => {
    PageTitle("Profile");
    const { user } = useAuth();
    const [verifyModalVisible, setVerifyModalVisible] = useState(false);
    const [profileModalVisible, setProfileModalVisible] = useState(false);
    const [emailVisible, setEmailVisible] = useState(false);
    const [usernameEditable, setUsernameEditable] = useState(false);
    const [compressedImage, setCompressedImage] = useState(null); 
    const [imageFile, setImageFile] = useState(null); 
    const [imageUrl, setImageUrl] = useState(null);
    const [newUsername, setNewUsername] = useState("");
    const [username, setUsername] = useState(null);

    useEffect(() => {
        if (!user?.id) return; 

        const fetchImage = async () => {
            try {
                const response = await fetch(`${apiUrl}/upload/get-image?userId=${user.id}&cacheBuster=${Date.now()}`, {
                    method: "GET",
                    credentials: "include",
                });

                if (response.ok) {
                    setImageUrl(response.url);
                } else if (response.status === 404) {
                    setImageUrl(null);
                }
            } catch (error) {
                setImageUrl(null);
            }
        };

        const fetchUsername = async () => {
            try {
                const response = await fetch(`${apiUrl}/profile/get-username`, {
                    method: "GET",
                    credentials: "include", 
                });

                if (response.ok) {
                    const data = await response.json();
                    setUsername(data.username); 
                } else {
                    console.log("Error fetching username:", response.statusText);
                }
            } catch (error) {
                console.error("Error fetching username:", error);
            }
        };

        fetchImage();
        fetchUsername();
    }, [user?.id]);

    const changeUsername = async () => {
        if (!newUsername) {
            message.warning("ກະລຸນາປ້ອນຊື່ຜູ້ໃຊ້");
            return;
        }

        try {
            const response = await fetch(`${apiUrl}/profile/change-username`, {
                method: "POST",
                credentials: "include",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ username: newUsername }),
            });

            const data = await response.json();
            if (response.ok) {
                message.success("ຊື່ຜູ້ໃຊ້ຖືກປ່ຽນສຳເລັດ!");
                setNewUsername("");
                setUsernameEditable(false);
            } else {
                message.error(data.message || "ບໍ່ສາมາດປ່ຽນຊື່ໄດ້");
            }
        } catch (error) {
            console.error("Error changing username:", error);
            message.error("ຜິດພາດໃນການປ່ຽນຊື່");
        }
    };

    const handleImageUpload = async (event) => {
        const file = event.target.files[0];
        if (!file) return;

        try {
            
            const options = {
                maxSizeMB: 1, 
                maxWidthOrHeight: 1024, 
                useWebWorker: true, 
            };

            
            const compressedFile = await imageCompression(file, options);

            
            const previewUrl = URL.createObjectURL(compressedFile);
            setCompressedImage(previewUrl); 
            setImageFile(compressedFile); 
        } catch (error) {
            console.error("Error compressing image:", error);
            message.error("ຜິດພາດໃນການອັບໂຫຼດຮູບ");
        }
    };

    const handleImageUploadToBackend = async () => {
        if (!imageFile) {
            message.warning("ກະລຸນາເລືອກຮູບກ່ອນ!");
            return;
        }

        try {
            const formData = new FormData();
            formData.append("image", imageFile);
            formData.append("userId", user?.id); 

            const response = await fetch(`${apiUrl}/upload`, {
                method: "POST",
                body: formData,
                credentials: "include",
            });

            const result = await response.json();

            if (response.ok) {
                message.success("ອັບໂຫຼດຮູບສຳເລັດ!");
            } else {
                message.error(result.message || "ອັບໂຫຼດຜິດພາດ!");
            }
        } catch (error) {
            console.error("Error uploading image:", error);
            message.error("ຜິດພາດໃນການອັບໂຫຼດ");
        }
    };

    const handleVerified = () => {
        setProfileModalVisible(true); 
    };

    const toggleEmailVisibility = () => {
        setEmailVisible(!emailVisible); 
    };

    
    const maskEmail = (email) => {
        const [localPart, domainPart] = email.split("@");

        
        const maskedLocal =
            localPart.length > 2 ? localPart.slice(0, 2) + "******" : localPart; 

        
        const maskedDomain =
            domainPart.length > 3
                ? domainPart.slice(0, 2) + "****" + domainPart.slice(-3)
                : domainPart; 

        return `${maskedLocal}@${maskedDomain}`;
    };



    return (
        <div className="flex flex-col items-center justify-center">
            <div className="p-6 w-full dark:bg-gray-700 dark:border-gray-700">
                <h2 className="text-2xl font-bold text-left font-lao text-gray-900 dark:text-white">
                    ຂໍ້ມູນຜູ້ໃຊ້
                </h2>
                <div className="flex items-center mt-4">
                    
                    {compressedImage || imageUrl ? (
                        <img
                            src={compressedImage || imageUrl}
                            alt="Profile"
                            className="rounded-full w-32 h-32 object-cover border-4 border-gray-400 cursor-pointer"
                            onClick={() => document.getElementById("imageInput").click()}
                        />
                    ) : (
                        <div
                            onClick={() => document.getElementById("imageInput").click()}
                            className="rounded-full w-32 h-32 flex items-center justify-center bg-gray-200 cursor-pointer"
                        >
                            <span className="text-xl text-secondary-700">+</span>
                        </div>
                    )}

                    <input
                        type="file"
                        id="imageInput"
                        style={{ display: "none" }}
                        onChange={handleImageUpload}
                        accept="image/*"
                    />

                    {compressedImage && (
                        <Button
                            onClick={handleImageUploadToBackend}
                            type="primary"
                            color="default"
                            variant="outlined"
                            className="text-white bg-secondary-700 hover:bg-secondary-900 focus:outline-none font-medium rounded-lg text-sm text-center ml-10"
                        >
                            <h1 className="font-lao">ອັບໂຫຼດຮູບ</h1>
                        </Button>
                    )}
                </div>

                
                <div className="dark:text-white bg-secondary-700 dark:bg-secondary-800 rounded-lg mt-4">
                    <b>Email:</b> {emailVisible ? user?.email : maskEmail(user?.email || "N/A")}
                    <Button
                        type="link"
                        onClick={toggleEmailVisibility}
                        className="ml-2 text-sm underline"
                    >
                        {emailVisible ? "Hide" : "Show"}
                    </Button>
                </div>


                <div className="dark:text-white bg-secondary-700 dark:bg-secondary-800 rounded-lg mt-4">
                    <b>Username: </b>
                    {usernameEditable ? (
                        <Input
                            value={newUsername}
                            onChange={(e) => setNewUsername(e.target.value)}
                            placeholder="ເລືອກຊື່ຜູ້ໃຊ້"
                            style={{ width: "120px" }}
                            maxLength={36}
                        />
                    ) : (
                        <span className="font-lao">
                            {username || "ກະລຸນາຕັ້ງຊຶ່ username ຂອງທ່ານ"}
                        </span>
                    )}

                    <Button
                        type="primary"
                        className="text-white bg-secondary-700 hover:bg-secondary-900 focus:outline-none font-medium rounded-lg text-sm text-center ml-2"
                        color="default"
                        variant="outlined"
                        htmlType="submit"
                        onClick={() => {
                            if (usernameEditable) {
                                changeUsername(); 
                            }
                            setUsernameEditable(!usernameEditable); 
                        }}
                    >
                        <span className="font-lao">
                            {usernameEditable ? "ບັນທຶກ" : "ປ່ຽນຊື່"}
                        </span>
                    </Button>
                </div>

                <Divider style={{ borderTopColor: "#d5d5d5" }} />
                <h2 className="text-2xl font-bold text-left font-lao text-gray-900 dark:text-white">
                    ຄວາມປອດໄພ
                </h2>

                
                <div className="flex justify-left items-center font-lao dark:text-white bg-secondary-700 dark:bg-secondary-800 rounded-lg mt-4">
                    <b>ລະຫັດ</b>
                    <Button
                        type="primary"
                        className="text-white bg-secondary-700 hover:bg-secondary-900 focus:outline-none font-medium rounded-lg text-sm text-center ml-40"
                        color="default"
                        variant="outlined"
                        htmlType="submit"
                        onClick={() => setVerifyModalVisible(true)}
                    >
                        <h1 className="font-lao">ປ່ຽນລະຫັດ</h1>
                    </Button>
                </div>

                <VerifyPasswordModal
                    open={verifyModalVisible}
                    onVerified={handleVerified}
                    onClose={() => setVerifyModalVisible(false)}
                />

                <ProfileModal
                    open={profileModalVisible}
                    onClose={() => setProfileModalVisible(false)}
                    user={user}
                />
            </div>
        </div>
    );
};

export default Profile;
