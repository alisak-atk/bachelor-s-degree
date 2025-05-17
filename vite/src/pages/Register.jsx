import { useState, useEffect } from "react";
import { PageTitle } from "@/hooks/PageTitle";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/utils/AuthProvider";
import { LoadingOutlined, LockOutlined, UserOutlined } from "@ant-design/icons";
import { Button, Spin, Input, Form, message } from "antd";
import { apiUrl } from "@/utils/config";

const Register = () => {
  PageTitle("Register");
  const { isAuthenticated } = useAuth();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [confirmPasswordVisible, setConfirmPasswordVisible] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
          const changeBackground = () => {
              const red = Math.floor(Math.random() * 256);
              const green = Math.floor(Math.random() * 256);
              const blue = Math.floor(Math.random() * 256);
              document.documentElement.style.setProperty("--dynamic-bg", `rgb(${red}, ${green}, ${blue})`);
          };
      
          changeBackground(); 
          const interval = setInterval(changeBackground, 3000);
      
          return () => clearInterval(interval); 
      }, []);

  const onFinish = async (values) => {
    setLoading(true);

    try {
      
      const response = await fetch(`${apiUrl}/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: values.email,
          password: values.password,
        }),
      });

      if (response.ok) {
        message.success("ສະໝັກສະມາຊິກສຳເລັດ!"); 
        navigate("/login"); 
      } else {
        message.error("ສະໝັກສະມາຊິກຜິດພາດ"); 
      }
    } catch (error) {
      console.error("Register failed:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      navigate("/dashboard");
    }
  }, [isAuthenticated, navigate]);

  return (
    <section className="bg-gray-200 dark:bg-gray-900 items-center flex sm:items-center pt-14 justify-center h-screen">
      <div className="box dark:bg-gray-800 dark:border-gray-700">
        <div className="p-6 space-y-4 md:space-y-6 sm:p-8">
          <Form
            form={form}
            name="register"
            layout="vertical"
            onFinish={onFinish}
            className="format-form"
          >
            <h2 className="text-2xl font-bold leading-tight text-center tracking-tight text-gray-900 dark:text-white font-lao p-6">
              ສະໝັກສະມາຊິກ
            </h2>
            <Form.Item
              name="email"
              rules={[
                { required: true, message: "ກະລຸນາປ້ອນອີເມວຜູ້ໃຊ້!" },
                { type: "email", message: "ກະລຸນາປ້ອນອີເມວທີ່ຖືກຕ້ອງ!" }
              ]}
            >
              <Input
                size="large"
                placeholder="ອີເມວຜູ້ໃຊ້"
                prefix={<UserOutlined />}
              />
            </Form.Item>
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
                maxLength={8}
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
                {loading ? <Spin indicator={<LoadingOutlined spin />} size="medium" style={{ color: "#FFF" }} /> : <h1 className="font-lao">ຢືນຢັນ</h1>}
              </Button>
            </Form.Item>
          </Form>
        </div>
      </div>
    </section>
  );
};

export default Register;
