import { useState, useEffect } from "react";
import { Modal, Input, Select, Button, message } from "antd";
import { apiUrl } from "@/utils/config";

const { Option } = Select;

const ManageUserModal = ({ open, onClose, userId }) => {
    const [formData, setFormData] = useState({
        firstname: "",
        lastname: "",
        username: "",
        phonenumber: "",
        role: "user",
        bankAccount: {
            bankName: "",
            accountName: "",
            accountNumber: "",
        },
    });
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        if (userId) {
            const fetchUserData = async () => {
                try {
                    const response = await fetch(`${apiUrl}/manageuser/${userId}`, {
                        method: "GET",
                        credentials: "include",
                    });
                    const user = await response.json();
                    if (response.ok) {
                        setFormData({
                            firstname: user.firstname || "",
                            lastname: user.lastname || "",
                            username: user.username || "",
                            phonenumber: user.phonenumber || "",
                            role: user.role || "user",
                            bankAccount: {
                                bankName: user.bankAccount?.bankName || "",
                                accountName: user.bankAccount?.accountName || "",
                                accountNumber: user.bankAccount?.accountNumber || "",
                            },
                        });
                    } else {
                        message.error("ບໍ່ພົບຜູ້ໃຊ້");
                    }
                } catch (error) {
                    message.error("Error fetching user data");
                }
            };
            fetchUserData();
        }
    }, [userId]);


    const handleChange = (key, value) => {
        setFormData((prevState) => ({ ...prevState, [key]: value }));
    };

    const handleBankChange = (key, value) => {
        setFormData((prevState) => ({
            ...prevState,
            bankAccount: { ...prevState.bankAccount, [key]: value },
        }));
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            const response = await fetch(`${apiUrl}/manageuser/${userId}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
                credentials: "include",
            });
            const result = await response.json();
            if (response.ok) {
                message.success("ອັບເດດຜູ້ໃຊ້ສຳເລັດ");
                onClose();
            } else {
                message.error(result.error || "Failed to update user");
            }
        } catch (error) {
            message.error("Error saving user data");
        } finally {
            setSaving(false);
        }
    };

    return (
        <Modal
            title="ແກ້ໄຂລາຍລະອຽດຜູ້ໃຊ້"
            open={open}
            onCancel={onClose}
            footer={null}
            width={600}
        >
            <div className="mb-4 font-lao text-base sm:text-2xs text-gray-700 dark:text-white w-full">
                <strong>ຊື່:</strong>
                <Input
                    value={formData.firstname}
                    onChange={(e) => handleChange("firstname", e.target.value)}
                />
            </div>
            <div className="mb-4 font-lao text-base sm:text-2xs text-gray-700 dark:text-white w-full">
                <strong>ນາມສະກຸນ:</strong>
                <Input
                    value={formData.lastname}
                    onChange={(e) => handleChange("lastname", e.target.value)}
                />
            </div>
            <div className="mb-4 font-lao text-base sm:text-2xs text-gray-700 dark:text-white w-full">
                <strong>ຊື່ຜູ້ໃຊ້:</strong>
                <Input
                    value={formData.username}
                    onChange={(e) => handleChange("username", e.target.value)}
                />
            </div>

            <div className="mb-4 font-lao text-base sm:text-2xs text-gray-700 dark:text-white w-full">
                <strong>ເບີໂທ:</strong>
                <Input
                    value={formData.phonenumber}
                    onChange={(e) => handleChange("phonenumber", e.target.value)}
                />
            </div>
            <div className="mb-4 font-lao text-base sm:text-2xs text-gray-700 dark:text-white w-full">
                <strong>ສິດ:</strong>
                <Select
                    value={formData.role}
                    onChange={(value) => handleChange("role", value)}
                    className="w-full font-lao text-base sm:text-2xs text-gray-700 dark:text-white"
                >
                    <Option value="user">User</Option>
                    <Option value="admin">Admin</Option>
                </Select>
            </div>
            <div className="mb-4 font-lao text-base sm:text-2xs text-gray-700 dark:text-white w-full ">
                <strong>ຊື່ທະນາຄານ:</strong>
                <Input
                    value={formData.bankAccount?.bankName || ""}
                    onChange={(e) => handleBankChange("bankName", e.target.value)}
                />
            </div>
            <div className="mb-4 font-lao text-base sm:text-2xs text-gray-700 dark:text-white w-full">
                <strong>ຊື່ບັນຊີ:</strong>
                <Input
                    value={formData.bankAccount?.accountName || ""}
                    onChange={(e) => handleBankChange("accountName", e.target.value)}
                />
            </div>
            <div className="font-lao text-base sm:text-2xs text-gray-700 dark:text-white w-full">
                <strong>ເລກບັນຊີ:</strong>
                <Input
                    value={formData.bankAccount?.accountNumber || ""}
                    onChange={(e) => handleBankChange("accountNumber", e.target.value)}
                />
            </div>

            <div className="flex justify-end gap-4 pt-4">
                <Button type="primary" onClick={handleSave} loading={saving}>

                    <h1 className="font-lao">ບັນທືກ</h1>
                </Button>
            </div>

        </Modal >
    );
};

export default ManageUserModal;