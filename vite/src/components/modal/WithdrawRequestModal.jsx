import { Modal, Input, Button, Spin, Select, message } from "antd";
import { useEffect, useState } from "react";
import { apiUrl } from "@/utils/config";

const WithdrawRequestModal = ({ open, onClose, withdrawalId }) => {
    const [requestData, setRequestData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [adminNote, setAdminNote] = useState("");
    const [sendMoneyID, setSendMoneyID] = useState("");
    const [status, setStatus] = useState("");

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
                    setSendMoneyID(result.sendMoneyID || "");
                    setAdminNote(result.adminNote || "");
                    setStatus(result.status);
                } catch (error) {
                    message.error("Error fetching withdrawal request data:", error);
                } finally {
                    setLoading(false);
                }
            };
            fetchRequestData();
        }
    }, [withdrawalId]);

    const handleSubmit = async () => {
        try {
            const response = await fetch(
                `${apiUrl}/bank/withdraw/update/${withdrawalId}`,
                {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ status, adminNote, sendMoneyID }),
                    credentials: "include",
                }
            );

            const result = await response.json();
            if (result.success) {
                message.success("ອັບເດດຄຳຮ້ອງຂໍການຖອນເງິນສຳເລັດແລ້ວ")
                onClose();
            } else {
                message.error("ຜິດພາດໃນການແກ້ໄຂຄຳຮ້ອງຂໍການຖອນເງິນ")
            }
        } catch (error) {
            console.error("Error updating withdrawal request:", error);
        }
    };

    return (
        <Modal title="ລາຍລະອຽດຄຳຮ້ອງຂໍການຖອນເງິນ" open={open} onCancel={onClose} footer={null} width={600}>
            {loading ? (
                <Spin />
            ) : requestData ? (
                <div>
                    <div className="mb-4 font-lao text-base sm:text-2xs text-gray-700 dark:text-white"><strong>ຊື່:</strong> {requestData.username}</div>
                    <div className="mb-4 font-lao text-base sm:text-2xs text-gray-700 dark:text-white"><strong>ຈໍານວນທີ່ຮ້ອງຂໍ:</strong> {Number(requestData.amount).toLocaleString()} ກີບ</div>
                    <div className="mb-4 font-lao text-base sm:text-2xs text-gray-700 dark:text-white"><strong>ສະຖານະ:</strong> {requestData.status}</div>
                    <div className="mb-4 font-lao text-base sm:text-2xs text-gray-700 dark:text-white"><strong>ຊື່ທະນາຄານ:</strong> {requestData.bankAccount.bankName || "—"}</div>
                    <div className="mb-4 font-lao text-base sm:text-2xs text-gray-700 dark:text-white"><strong>ຊື່ບັນຊີ:</strong> {requestData.bankAccount.accountName || "—"}</div>
                    <div className="mb-4 font-lao text-base sm:text-2xs text-gray-700 dark:text-white"><strong>ເລກບັນຊີ:</strong> {requestData.bankAccount.accountNumber || "—"}</div>
                    <div className="mb-4 font-lao text-base sm:text-2xs text-gray-700 dark:text-white"><strong>ວັນທີ່ຮ້ອງຂໍ:</strong> {requestData.requestedAt}</div>
                    <div className="mb-4 font-lao text-base sm:text-2xs text-gray-700 dark:text-white"><strong>ອັບເດດລ່າສຸດ:</strong> {requestData.processAt || ""}</div>
                    <div className="mb-4 font-lao text-base sm:text-2xs text-gray-700 dark:text-white"><strong>ເລກທຸລະກຳ:</strong>

                        <Input value={sendMoneyID} onChange={(e) => setSendMoneyID(e.target.value)} />
                    </div>
                    <div className="mb-4 font-lao text-base sm:text-2xs text-gray-700 dark:text-white">
                        <strong>ປ່ຽນສະຖານະ:</strong>
                        <Select value={status} onChange={setStatus} className="w-full font-lao text-base sm:text-2xs text-gray-700 dark:text-white">
                            <Select.Option value="approved" className="font-lao text-base sm:text-2xs text-gray-700 dark:text-white">Approved</Select.Option>
                            <Select.Option value="rejected" className="font-lao text-base sm:text-2xs text-gray-700 dark:text-white">Rejected</Select.Option>
                        </Select>
                    </div>

                    <div className="mb-4 font-lao text-base sm:text-2xs text-gray-700 dark:text-white">
                        <strong className="mb-2">ໝາຍເຫດ:</strong>
                        <Input.TextArea value={adminNote} onChange={(e) => setAdminNote(e.target.value)} rows={4} />
                    </div>

                    <div className="mt-4 flex justify-end">
                        <Button type="primary" onClick={handleSubmit} disabled={!status}>
                            Update Request
                        </Button>
                    </div>

                </div>
            ) : (
                <div>No data available</div>
            )}
        </Modal>
    );
};

export default WithdrawRequestModal;
