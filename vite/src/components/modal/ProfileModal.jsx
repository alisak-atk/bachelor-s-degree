import { useState } from "react";
import { apiUrl } from "@/utils/config";
import { Modal, Form, Input, Button, message, Spin } from "antd";
import { LockOutlined, LoadingOutlined } from "@ant-design/icons";

const ProfileModal = ({ open, onClose, user }) => {
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);
    const [confirmPasswordVisible, setConfirmPasswordVisible] = useState(false);

    const onFinish = async (values) => {
        setLoading(true);
        try {
            const response = await fetch(`${apiUrl}/profile/reset-password`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({
                    password: values.password,
                }),
            });

            if (response.ok) {
                message.success("ການປັບປຸງຂໍ້ມູນສຳເລັດ!");
                form.resetFields(); 
                onClose(); 
            } else {
                message.error("ຜິດພາດໃນການປັບປຸງຂໍ້ມູນ");
            }
        } catch (error) {
            console.error("Profile update failed:", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal
            title="ແກ້ໄຂຂໍ້ມູນຜູ້ໃຊ້"
            open={open}
            onCancel={onClose}
            footer={null}
            centered
        >
            <Form form={form} layout="vertical" onFinish={onFinish}>
                <Form.Item
                    name="password"
                    rules={[
                        { required: true, message: "ກະລຸນາປ້ອນລະຫັດຜ່ານ!" },
                        { min: 8, message: "ລະຫັດຕ້ອງມີຢ່າງໜ້ອຍ 8 ຕົວອັກສອນ!" }
                    ]}
                >
                    <Input.Password
                        size="large"
                        placeholder="ລະຫັດຜ່ານ"
                        prefix={<LockOutlined />}
                    />
                </Form.Item>
                <Form.Item
                    name="confirmpassword"
                    dependencies={["password"]}
                    rules={[
                        { required: true, message: "ກະລຸນາປ້ອນລະຫັດຢືນຢັນຜ່ານຂອງທ່ານ!" },
                        ({ getFieldValue }) => ({
                            validator(_, value) {
                                if (!value || getFieldValue("password") === value) {
                                    return Promise.resolve();
                                }
                                return Promise.reject(new Error("ລະຫັດຜ່ານບໍ່ກົງກັນ!"));
                            },
                        }),
                    ]}
                >
                    <Input.Password
                        size="large"
                        placeholder="ຢືນຢັນລະຫັດຜ່ານ"
                        prefix={<LockOutlined />}
                        visibilityToggle={{
                            visible: confirmPasswordVisible,
                            onClick: () => setConfirmPasswordVisible(!confirmPasswordVisible)
                        }}
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
                        {loading ? <Spin indicator={<LoadingOutlined spin />} size="medium" style={{ color: "#FFF" }} /> : <h1 className="font-lao">ແກ້ໄຂຂໍ້ມູນ</h1>}
                    </Button>
                </Form.Item>
            </Form>
        </Modal>
    );
};

export default ProfileModal;
