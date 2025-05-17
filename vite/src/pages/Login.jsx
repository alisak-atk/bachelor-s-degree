import { useState, useEffect } from "react";
import { PageTitle } from "@/hooks/PageTitle";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/utils/AuthProvider";
import { LoadingOutlined, UserOutlined, LockOutlined } from "@ant-design/icons";
import { Button, Spin, Input, Form, message } from "antd";
import { apiUrl } from "@/utils/config";

const Login = () => {
    PageTitle("Login");
    const { login, isAuthenticated } = useAuth();
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const onFinish = async (values) => {
        setLoading(true);
        try {
            const response = await fetch(`${apiUrl}/login`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(values),
            });
            if (response.ok) {
                const data = await response.json();
                login(data.token);
                navigate("/dashboard");
            } else {
                message.error("ເຂົ້າສູ່ລະບົບຜິດພາດ")
            }
        } catch (error) {
            console.error("Login failed:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const changeBackground = () => {
            const colors = [
                "rgb(255, 0, 0)",   
                "rgb(60, 179, 113)",  
                "rgb(0, 0, 255)"   
            ];
            const randomColor = colors[Math.floor(Math.random() * colors.length)];
            document.documentElement.style.setProperty("--dynamic-bg", randomColor);
        };
    
        changeBackground();
        const interval = setInterval(changeBackground, 1000);
    
        return () => clearInterval(interval);
    }, []);
    
    

    useEffect(() => {
        if (isAuthenticated) {
            navigate("/dashboard");
        }
    }, [isAuthenticated, navigate]);
    

    return (
        <section className="bg-gray-200 dark:bg-gray-900 flex items-center sm:items-center pt-14 justify-center h-screen">
            <div className="box dark:bg-gray-800 dark:border-gray-700">
                <div className="p-6 space-y-4 md:space-y-6 sm:p-8">
                    <Form
                        form={form}
                        name="login"
                        layout="vertical"
                        onFinish={onFinish}
                        className="format-form"
                    >
                        <h2 className="text-2xl font-bold leading-tight text-center tracking-tight text-gray-900 dark:text-white font-lao p-6">
                            ຍິນດີຕ້ອນຮັບເຂົ້າສູ່ລະບົບ
                        </h2>
                        <Form.Item
                            name="email"
                            rules={[{ required: true, message: "ກະລຸນາປ້ອນອີເມວຜູ້ໃຊ້!" }]}
                        >
                            <Input
                                size="large"
                                placeholder="ອີເມວຜູ້ໃຊ້"
                                prefix={<UserOutlined />}
                            />
                        </Form.Item>
                        <Form.Item
                            name="password"
                            rules={[{ required: true, message: "ກະລຸນາປ້ອນລະຫັດຜ່ານ!" }]}
                        >
                            <Input.Password
                                size="large"
                                placeholder="ລະຫັດຜ່ານ"
                                prefix={<LockOutlined />}
                                maxLength={8}
                            />
                        </Form.Item>
                        <Form.Item>
                            <Button
                                color="default"
                                variant="outlined"
                                type="primary"
                                htmlType="submit"
                                className="w-full focus:outline-none font-medium rounded-lg text-sm text-center"
                            >
                                {loading ? <Spin indicator={<LoadingOutlined spin />} size="medium" style={{ color: "black" }} /> : <h1 className="font-lao">ເຂົ້າສູ່ລະບົບ</h1>}
                            </Button>
                        </Form.Item>
                    </Form>
                </div>
            </div>
        </section>

    );
};


export default Login;
