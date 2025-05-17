import { useState, useEffect } from "react";
import { Modal, Spin, message, Button } from "antd";
import { apiUrl } from "@/utils/config";

const fetchVerificationImage = async (userId, imageType) => {
    try {
        const response = await fetch(
            `${apiUrl}/upload/get-verification-image?userId=${userId}&imageType=${imageType}`,
            {
                method: "GET",
                credentials: "include",
            }
        );
        if (response.ok) {
            const blob = await response.blob();
            return URL.createObjectURL(blob);
        } else {
            console.error("Image not found!");
            return null;
        }
    } catch (error) {
        console.error("Error fetching image:", error);
        return null;
    }
};

const VerifyRequestModal = ({ open, onClose, userId }) => {
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState(null); 
    const [verificationStatus, setVerificationStatus] = useState(""); 
    const [isFormSubmitted, setIsFormSubmitted] = useState(false); 
    const [idFrontUrl, setIdFrontUrl] = useState(null);
    const [idBackUrl, setIdBackUrl] = useState(null);
    const [selfieUrl, setSelfieUrl] = useState(null);

    
    useEffect(() => {
        if (open && userId) {
            setLoading(true);
            fetch(`${apiUrl}/upload/verification/admin/${userId}`, {
                method: "GET",
                credentials: "include",
            })
                .then((response) => response.json())
                .then(async (data) => {
                    setFormData(data); 
                    setVerificationStatus(data.status); 
                    setIsFormSubmitted(true); 

                    
                    const fetchedIdFrontUrl = await fetchVerificationImage(userId, "idfront");
                    const fetchedIdBackUrl = await fetchVerificationImage(userId, "idback");
                    const fetchedSelfieUrl = await fetchVerificationImage(userId, "selfie");

                    
                    setIdFrontUrl(fetchedIdFrontUrl);
                    setIdBackUrl(fetchedIdBackUrl);
                    setSelfieUrl(fetchedSelfieUrl);

                    setLoading(false);
                })
                .catch((error) => {
                    console.error("Error fetching user data:", error);
                    message.error("Failed to fetch user data");
                    setLoading(false);
                });
        }
    }, [open, userId]);

    
    const handleImagePreview = (imageUrl) => {
        window.open(imageUrl, "_blank");
    };

    
    const handleApprove = () => {
        Modal.confirm({
            title: "ທ່ານແນ່ໃຈບໍ່ວ່າຕ້ອງການອະນຸມັດຄຳຮ້ອງຂໍນີ້?",
            content: "ເມື່ອໄດ້ຮັບການອະນຸມັດ, ຜູ້ໃຊ້ຈະ verified.",
            okText: "Approve",
            cancelText: "Cancel",
            onOk() {
                
                fetch(`${apiUrl}/upload/verification/admin/update/${userId}`, {
                    method: "PATCH",
                    credentials: "include",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        status: "approved",
                        isVerified: true,
                    }),
                })
                    .then((response) => response.json())
                    .then((updatedUser) => {
                        setFormData(updatedUser); 
                        setVerificationStatus(updatedUser.status); 
                        message.success("ອະນຸມັດຜູ້ໃຊ້ສຳເລັດ!");
                        setTimeout(() => {
                            location.reload();
                        }, "1000");

                    })
                    .catch((error) => {
                        console.error("Error updating user status:", error);
                        message.error("Failed to approve user");
                    });
            },
            onCancel() {
                message.info("ຍົກເລີກການອະນຸມັດ");
            },
        });
    };

    const handleReject = () => {
        Modal.confirm({
            title: "ທ່ານແນ່ໃຈບໍ່ວ່າຕ້ອງການປະຕິເສດຄຳຮ້ອງຂໍນີ້?",
            content: "ເມື່ອຖືກປະຕິເສດ, ສະຖານະການຢັ້ງຢືນຂອງຜູ້ໃຊ້ຈະບໍ່ປ່ຽນແປງ.",
            okText: "Reject",
            cancelText: "Cancel",
            onOk() {
                
                fetch(`${apiUrl}/upload/verification/admin/update/${userId}`, {
                    method: "PATCH",
                    credentials: "include",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        status: "rejected",
                        isVerified: false,
                    }),
                })
                    .then((response) => response.json())
                    .then((updatedUser) => {
                        setFormData(updatedUser); 
                        setVerificationStatus(updatedUser.status); 
                        message.success("ປະຕິເສດຜູ້ໃຊ້ສຳເລັດ!");
                        setTimeout(() => {
                            location.reload();
                        }, "1000");
                    })
                    .catch((error) => {
                        console.error("Error updating user status:", error);
                        message.error("Failed to reject user");
                    });
            },
            onCancel() {
                message.info("ຍົກເລີກການປະຕິເສດ");
            },
        });
    };

    return (
        <Modal
            title="ຢືນຢັນຂໍ້ມູນຜູ້ໃຊ້"
            open={open}
            onCancel={onClose}
            footer={null}
            centered
        >
            {loading ? (
                <Spin size="large" />
            ) : isFormSubmitted && formData ? (
                <div>
                    <p className="flex items-center gap-2 text-lg font-semibold font-lao sm:text-lg text-gray-700 dark:text-white">
                        <strong>ສະຖານະ:</strong>
                        {verificationStatus === "pending" ? (
                            <span className="relative flex items-center gap-1">
                                <span className="animate-spin inline-block w-4 h-4 border-2 border-current border-t-transparent rounded-full"></span>
                                <span className="text-yellow-500 font-bold">Pending</span>
                            </span>
                        ) : verificationStatus === "approved" ? (
                            <span className="text-green-500 font-bold">Approved</span>
                        ) : verificationStatus === "rejected" ? (
                            <span className="text-red-500 font-bold">Rejected</span>
                        ) : (
                            <span className="text-gray-500 font-bold">Unknown Status</span>
                        )}
                    </p>

                    
                    <p className="font-lao text-base sm:text-lg text-gray-700 dark:text-white">
                        <strong>ຊື່:</strong> {formData.firstname}
                    </p>
                    <p className="font-lao text-base sm:text-lg text-gray-700 dark:text-white">
                        <strong>ນາມສະກຸນ:</strong> {formData.lastname}
                    </p>
                    <p className="font-lao text-base sm:text-lg text-gray-700 dark:text-white ">
                        <strong>ເບີໂທລະສັບ:</strong> {formData.phonenumber}
                    </p>
                    <p className="font-lao text-base sm:text-lg text-gray-700 dark:text-white ">
                        <strong>ຊື່ທະນາຄານ:</strong> {formData.bankAccount?.bankName}
                    </p>
                    <p className="font-lao text-base sm:text-lg text-gray-700 dark:text-white ">
                        <strong>ຊື່ບັນຊີ:</strong> {formData.bankAccount?.accountName}
                    </p>
                    <p className="font-lao text-base sm:text-lg text-gray-700 dark:text-white ">
                        <strong>ເລກບັນຊີ:</strong> {formData.bankAccount?.accountNumber}
                    </p>
                    <p className="font-lao text-base sm:text-lg text-gray-700 dark:text-white ">
                        <strong>ປະເພດເອກະສານຢັ້ງຢືນ:</strong> {formData.cardType}
                    </p>


                    
                    <div className="mt-4">
                        <div className="grid grid-cols-3 gap-4 mt-2">
                            {idFrontUrl && (
                                <div>
                                    <p className="font-lao text-[13px] sm:text-lg text-gray-700 dark:text-white">
                                        <strong>ຮູບບັດດ້ານໜ້າ:</strong>
                                    </p>
                                    <img
                                        src={idFrontUrl}
                                        alt="ID Front"
                                        className="w-full max-w-xs rounded-lg shadow-md cursor-pointer"
                                        onClick={() => handleImagePreview(idFrontUrl)}
                                    />
                                </div>
                            )}
                            {idBackUrl && (
                                <div>
                                    <p className="font-lao text-[13px] sm:text-lg text-gray-700 dark:text-white">
                                        <strong>ຮູບບັດດ້ານຫຼັງ:</strong>
                                    </p>
                                    <img
                                        src={idBackUrl}
                                        alt="ID Back"
                                        className="w-full max-w-xs rounded-lg shadow-md cursor-pointer"
                                        onClick={() => handleImagePreview(idBackUrl)}
                                    />
                                </div>
                            )}
                            {selfieUrl && (
                                <div>
                                    <p className="font-lao text-[13px] sm:text-lg text-gray-700 dark:text-white">
                                        <strong>ຮູບໃບໜ້າຄູ່ກັບບັດ:</strong>
                                    </p>
                                    <img
                                        src={selfieUrl}
                                        alt="Selfie"
                                        className="w-full max-w-xs rounded-lg shadow-md cursor-pointer"
                                        onClick={() => handleImagePreview(selfieUrl)}
                                    />
                                </div>
                            )}
                        </div>
                    </div>

                    
                    <div className="mt-4 flex justify-end gap-2">
                        <Button onClick={handleReject}>
                            Reject
                        </Button>
                        <Button type="primary"
                            onClick={handleApprove}>
                            Approve
                        </Button>

                    </div>
                </div>
            ) : (
                <p className="text-center text-gray-700 dark:text-white">No data available</p>
            )}
        </Modal>
    );
};

export default VerifyRequestModal;
