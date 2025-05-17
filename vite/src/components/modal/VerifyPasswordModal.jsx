import { useState } from "react";
import { apiUrl } from "@/utils/config";
import { Modal, Form, Input, Button, Spin, message } from "antd";
import { LockOutlined, LoadingOutlined } from "@ant-design/icons";

const VerifyPasswordModal = ({ open, onVerified, onClose }) => {
    const [loading, setLoading] = useState(false);
    const [form] = Form.useForm();

    const handleVerify = async (values) => {
        setLoading(true);
        try {
            const response = await fetch(`${apiUrl}/profile/verify-password`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({ password: values.verifiedpassword }),
            });

            if (response.ok) {
                message.success("ລະຫັດຖືກຢືນຢັນສຳເລັດ!");
                form.resetFields();
                onVerified(); 
                onClose(); 
            } else {
                message.error("ລະຫັດຜ່ານຜິດ!");
            }
        } catch (error) {
            console.error("Verification failed:", error);
            message.error("ຜິດພາດໃນການຢືນຢັນລະຫັດ!");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal
            title="ຢືນຢັນລະຫັດກ່ອນ"
            open={open}
            onCancel={onClose}
            footer={null}
            centered
            className="font-lao"
        >
            <Form form={form} layout="vertical" onFinish={handleVerify}>
                <Form.Item
                    name="verifiedpassword"
                    rules={[{ required: true, message: "ປ້ອນລະຫັດຜ່ານ!" }]}
                >
                    <Input.Password
                        size="large"
                        prefix={<LockOutlined />}
                        placeholder="ລະຫັດຜ່ານ"
                    />
                </Form.Item>

                <Form.Item>
                    <Button
                        color="default"
                        variant="outlined"
                        type="primary"
                        htmlType="submit"
                        className="w-full text-white bg-secondary-700 hover:bg-secondary-900 focus:outline-none font-medium rounded-lg text-sm text-center"
                    >
                        {loading ? <Spin indicator={<LoadingOutlined spin />} size="medium" style={{ color: "#FFF" }} /> : <h1 className="font-lao">ຢືນຢັນ</h1>}
                    </Button>
                </Form.Item>
            </Form>
        </Modal>
    );
};

export default VerifyPasswordModal;
