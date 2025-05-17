import { Modal, Spin, message } from "antd";
import { useEffect, useState } from "react";
import { apiUrl } from "@/utils/config";

const WithdrawModal = ({ open, onClose, withdrawalId }) => {
    const [requestData, setRequestData] = useState(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (withdrawalId) {
            const fetchRequestData = async () => {
                setLoading(true);
                try {
                    const response = await fetch(
                        `${apiUrl}/bank/withdraw/details/${withdrawalId}`,
                        {
                            method: "GET",
                            credentials: "include",
                        }
                    );
                    const result = await response.json();
                    setRequestData(result);
                } catch (error) {
                    message.error("Error fetching withdrawal request data:", error);
                } finally {
                    setLoading(false);
                }
            };
            fetchRequestData();
        }
    }, [withdrawalId]);

    return (
        <Modal title="ລາຍລະອຽດຄຳຮ້ອງຂໍການຖອນເງິນ" open={open} onCancel={onClose} footer={null} width={600}>
            {loading ? (
                <Spin />
            ) : requestData ? (
                <div>
                    <div className="mb-4 font-lao text-base sm:text-2xs text-gray-700 dark:text-white"><strong>ຈໍານວນທີ່ຮ້ອງຂໍ:</strong> {Number(requestData.amount).toLocaleString()} ກີບ</div>
                    <div className="mb-4 font-lao text-base sm:text-2xs text-gray-700 dark:text-white"><strong>ສະຖານະ:</strong> {requestData.status}</div>
                    <div className="mb-4 font-lao text-base sm:text-2xs text-gray-700 dark:text-white"><strong>ວັນທີ່ຮ້ອງຂໍ:</strong> {requestData.requestedAt}</div>
                    <div className="mb-4 font-lao text-base sm:text-2xs text-gray-700 dark:text-white"><strong>ອັບເດດລ່າສຸດ:</strong> {requestData.processAt}</div>
                    <div className="mb-4 font-lao text-base sm:text-2xs text-gray-700 dark:text-white"><strong>ເລກທຸລະກຳ:</strong> {requestData.sendMoneyID}</div>
                    <div className="mb-4 font-lao text-base sm:text-2xs text-gray-700 dark:text-white"><strong>ໝາຍເຫດ:</strong> {requestData.adminNote}</div>


                </div>
            ) : (
                <div>No data available</div>
            )}
        </Modal>
    );
};

export default WithdrawModal;
