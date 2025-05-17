import { useState, useEffect } from "react";
import { PageTitle } from "@/hooks/PageTitle";
import { Form, Input, Button, Radio, Upload, message, Steps, Row, Col, Image } from "antd";
import { useAuth } from "@/utils/AuthProvider";
import { UploadOutlined } from "@ant-design/icons";
import imageCompression from "browser-image-compression";
import { apiUrl } from "@/utils/config";

const { Step } = Steps;

const Verify = () => {
    PageTitle("Verify");
    const { user } = useAuth();
    const [isMobile, setIsMobile] = useState(false); 
    const [current, setCurrent] = useState(0);
    const [formData, setFormData] = useState({
        firstname: "",
        lastname: "",
        phonenumber: "",
        cardType: "",
        idFront: null,
        idBack: null,
        selfie: null,
        bankName: "",
        accountName: "",
        accountNumber: "",
    });

    const [verificationStatus, setVerificationStatus] = useState(null);
    const [isFormSubmitted, setIsFormSubmitted] = useState(false);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        
        const updateIsMobile = () => {
            setIsMobile(window.innerWidth < 768);
        };

        updateIsMobile(); 
        window.addEventListener("resize", updateIsMobile); 

        return () => window.removeEventListener("resize", updateIsMobile);
    }, []);

    const handleNext = () => {
        if (current === 0 && !validateStep1()) {
            return;
        }
        if (current === 1 && !validateStep2()) {
            return;
        }
        if (current === 2 && !validateStep3()) {
            return;
        }
        setCurrent(current + 1);
    };

    const validateStep1 = () => {
        if (!formData.firstname || !formData.lastname || !formData.phonenumber) {
            message.error("ກະລຸນາຕື່ມຂໍ້ມູນໃສ່ໃນທຸກຊ່ອງຂໍ້ມູນ.");
            return false;
        }
        return true;
    };

    const validateStep2 = () => {
        if (!formData.cardType || !formData.idFront || !formData.idBack || !formData.selfie) {
            message.error("ກະລຸນາອັບໂຫຼດຮູບທີ່ຕ້ອງການທັງໝົດ ແລະ ເລືອກປະເພດ.");
            return false;
        }
        return true;
    };

    const validateStep3 = () => {
        if (!formData.bankName || !formData.accountName || !formData.accountNumber) {
            message.error("ກະລຸນາຕື່ມຂໍ້ມູນໃສ່ໃນທຸກຊ່ອງຂໍ້ມູນ.");
            return false;
        }
        return true;
    };

    useEffect(() => {
        if (verificationStatus !== "pending" && verificationStatus !== "approved") {
            setFormData({
                firstname: "",
                lastname: "",
                phonenumber: "",
                cardType: "",
                idFront: null,
                idBack: null,
                selfie: null,
                bankName: "",
                accountName: "",
                accountNumber: "",
            });
        }
    }, [verificationStatus]);


    useEffect(() => {
        if (!user?.id) return;

        const fetchVerificationData = async () => {
            setLoading(true);
            try {
                const response = await fetch(`${apiUrl}/upload/verification?userId=${user.id}`, {
                    method: "GET",
                    credentials: "include",
                });
                const data = await response.json();

                if (response.ok && data) {
                    setVerificationStatus(data.status || null);

                    if (data.status === "pending" || data.status === "approved" || data.status === "rejected") {

                        setIsFormSubmitted(true);
                        setFormData(prev => ({
                            ...prev,
                            firstname: data.firstname || "",
                            lastname: data.lastname || "",
                            phonenumber: data.phonenumber || "",
                            cardType: data.cardType || "",
                            bankName: data.bankAccount.bankName || "",
                            accountName: data.bankAccount.accountName || "",
                            accountNumber: data.bankAccount.accountNumber || "",
                        }));

                        
                        const idFrontUrl = await fetchVerificationImage(user.id, "idfront");
                        const idBackUrl = await fetchVerificationImage(user.id, "idback");
                        const selfieUrl = await fetchVerificationImage(user.id, "selfie");

                        setFormData(prev => ({
                            ...prev,
                            idFront: idFrontUrl,
                            idBack: idBackUrl,
                            selfie: selfieUrl,
                        }));
                    } else {
                        setIsFormSubmitted(false);
                    }
                } else {
                    console.error("Failed to fetch verification data.");
                }
            } catch (error) {
                console.error("Error fetching verification data:", error);
            }
            finally {
                setLoading(false);
            }
        };

        fetchVerificationData();
    }, [user?.id]);


    const fetchVerificationImage = async (userId, imageType) => {
        try {
            const response = await fetch(`${apiUrl}/upload/get-verification-image?userId=${userId}&imageType=${imageType}`, {
                method: "GET",
                credentials: "include",
            });
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


    const handleConfirm = async () => {

        if (!formData.firstname || !formData.lastname || !formData.phonenumber || !formData.cardType || !formData.idFront || !formData.idBack || !formData.selfie || !formData.bankName || !formData.accountName || !formData.accountNumber) {
            message.error("ກະລຸນາກວດສອບວ່າທຸກຊ່ອງຕ້ອງໃສ່ທັງໝົດ.");
            return;
        }
        setLoading(true);
        try {
            const formDataToSubmit = new FormData();
            formDataToSubmit.append("userId", user?.id);
            formDataToSubmit.append("firstname", formData.firstname);
            formDataToSubmit.append("lastname", formData.lastname);
            formDataToSubmit.append("phonenumber", formData.phonenumber);
            formDataToSubmit.append("cardType", formData.cardType);

            formDataToSubmit.append("bankName", formData.bankName);
            formDataToSubmit.append("accountName", formData.accountName);
            formDataToSubmit.append("accountNumber", formData.accountNumber);


            formDataToSubmit.append("idFront", formData.idFront);
            formDataToSubmit.append("idBack", formData.idBack);
            formDataToSubmit.append("selfie", formData.selfie);

            const response = await fetch("${apiUrl}/upload/verify", {
                method: "POST",
                body: formDataToSubmit,
                credentials: "include",
            });

            const result = await response.json();

            if (response.ok) {
                message.success("ອັບໂຫຼດຂໍ້ມູນສຳເລັດ!");
                setVerificationStatus("pending");
                setIsFormSubmitted(true);
            } else {
                message.error(result.message || "ອັບໂຫຼດຜິດພາດ!");
                setVerificationStatus("failed");
            }
        } catch (error) {
            console.error("Error uploading image:", error);
            message.error("ຜິດພາດໃນການອັບໂຫຼດ");
            setVerificationStatus("failed");
        }
        finally {
            setLoading(false);
        };

    };


    const handleInputChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    const handleUpload = async (file, fieldName) => {
        const options = {
            maxSizeMB: 0.5, 
            maxWidthOrHeight: 800, 
            useWebWorker: true,
        };

        try {
            const compressedFile = await imageCompression(file, options);

            
            if (compressedFile && compressedFile instanceof Blob) {
                setFormData(prevState => ({
                    ...prevState,
                    [fieldName]: compressedFile
                }));
            } else {
                message.error("Compressed file is invalid.");
            }
        } catch (error) {
            console.error("Error compressing image:", error);
            message.error("Failed to compress image.");
        }

        return false; 
    };


    const handleImagePreview = (image) => {
        if (image instanceof Blob) {
            const imageUrl = URL.createObjectURL(image);
            setFormData({
                ...formData,
                previewImage: imageUrl,
                previewVisible: true,
            });
        } else {
            console.error("Invalid image type");
            message.error("Failed to preview image.");
        }
    };

    if (loading) {
        return <div>Loading...</div>;
    }


    return (
        <div style={{ maxWidth: 600, margin: "auto", padding: 10 }}>

            {isFormSubmitted && (
                <div>
                    <p className="flex items-center gap-2 text-lg font-semibold font-lao sm:text-lg text-gray-700 dark:text-white ">
                        <strong>Status:</strong>
                        {verificationStatus === "pending" ? (
                            <span className="relative flex items-center gap-1">
                                <span className="animate-spin inline-block w-4 h-4 border-2 border-current border-t-transparent rounded-full"></span>
                                <span className="text-yellow-500 font-bold">Pending</span>
                            </span>
                        ) : verificationStatus === "approved" ? (
                            <span className="text-green-500 font-bold">Approved</span>
                        ) : (
                            <span className="text-red-500 font-bold">Rejected ກະລຸນາຕິດຕໍ່ຫາ admin</span>
                        )}
                    
                    </p>
                    <p className="font-lao text-base sm:text-lg text-gray-700 dark:text-white"><strong>ຊື່:</strong> {formData.firstname}</p>
                    <p className="font-lao text-base sm:text-lg text-gray-700 dark:text-white"><strong>ນາມສະກຸນ:</strong> {formData.lastname}</p>
                    <p className="font-lao text-base sm:text-lg text-gray-700 dark:text-white"><strong>ເບີໂທລະສັບ:</strong> {formData.phonenumber}</p>
                    <p className="font-lao text-base sm:text-lg text-gray-700 dark:text-white"><strong>ຊື່ທະນາຄານ:</strong> {formData.bankName}</p>
                    <p className="font-lao text-base sm:text-lg text-gray-700 dark:text-white"><strong>ຊື່ບັນຊີ:</strong> {formData.accountName}</p>
                    <p className="font-lao text-base sm:text-lg text-gray-700 dark:text-white"><strong>ເລກບັນຊີ:</strong> {formData.accountNumber}</p>
                    <p className="font-lao text-base sm:text-lg text-gray-700 dark:text-white"><strong>ປະເພດເອກະສານຢັ້ງຢືນ:</strong> {formData.cardType}</p>

                    <div className="mt-4">
                        <div className="grid grid-cols-3 gap-4 mt-2">
                            {formData.idFront && (
                                <div>
                                    <p className="font-lao text-[13px] sm:text-lg text-gray-700 dark:text-white"><strong>ຮູບບັດດ້ານໜ້າ:</strong></p>
                                    <img src={formData.idFront} alt="ID Front" className="w-full max-w-xs rounded-lg shadow-md" />
                                </div>
                            )}
                            {formData.idBack && (
                                <div>
                                    <p className="font-lao text-[13px] sm:text-lg text-gray-700 dark:text-white"><strong>ຮູບບັດດ້ານຫຼັງ:</strong></p>
                                    <img src={formData.idBack} alt="ID Back" className="w-full max-w-xs rounded-lg shadow-md" />
                                </div>
                            )}
                            {formData.selfie && (
                                <div>
                                    <p className="font-lao text-[13px] sm:text-lg text-gray-700 dark:text-white"><strong>ຮູບໃບໜ້າຄູ່ກັບບັດ:</strong></p>
                                    <img src={formData.selfie} alt="Selfie" className="w-full max-w-xs rounded-lg shadow-md" />
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}




            {!isFormSubmitted && <Steps current={current} onChange={setCurrent} type={isMobile ? "default" : "navigation"}>
                <Step title="ຂໍ້ມູນສ່ວນຕົວ" className="font-lao" />
                <Step title="ເອກະສານຢັ້ງຢືນ" className="font-lao" />
                <Step title="ບັນຊີທະນາຄານ" className="font-lao" />
                <Step title="ລາຍລະອຽດຂໍ້ມູນທັງໝົດ" className="font-lao" />
            </Steps>
            }

            <div style={{ marginTop: 20 }}>
                {current === 0 && !isFormSubmitted && (
                    <Form layout="vertical">
                        <Row gutter={[16, 16]}>
                            <Col xs={24} sm={12}>
                                <Form.Item label="ຊື່ແທ້" required
                                    className="font-lao">
                                    <Input
                                        name="firstname"
                                        value={formData.firstname}
                                        onChange={handleInputChange}
                                    />
                                </Form.Item>
                            </Col>
                            <Col xs={24} sm={12}>
                                <Form.Item label="ນາມສະກຸນ" required
                                    className="font-lao">
                                    <Input
                                        name="lastname"
                                        value={formData.lastname}
                                        onChange={handleInputChange}
                                    />
                                </Form.Item>
                            </Col>
                        </Row>

                        <Form.Item label="ເບີໂທລະສັບ" required
                            className="font-lao">
                            <Input
                                name="phonenumber"
                                value={formData.phonenumber}
                                onChange={handleInputChange}
                                maxLength={8}
                                type="tel"
                            />
                        </Form.Item>
                    </Form>
                )}

                {current === 1 && !isFormSubmitted && (
                    <Form layout="vertical">
                        
                        <Form.Item label="ປະເພດເອກະສານຢັ້ງຢືນ" required
                            className="font-lao">
                            <Radio.Group
                                name="cardType"
                                value={formData.cardType}
                                onChange={handleInputChange}
                                className="flex flex-col"
                            >
                                <Radio value="passport">Passport</Radio>
                                <Radio value="citizenId">Citizen ID</Radio>
                                <Radio value="driverLicense">Driver License</Radio>
                            </Radio.Group>
                        </Form.Item>
                        <Form.Item label="ຮູບບັດດ້ານໜ້າ" required
                            className="font-lao">
                            <Upload
                                accept="image/*"
                                beforeUpload={(file) => handleUpload(file, "idFront")}
                                showUploadList={false}
                            >
                                {!formData.idFront && (
                                    <Button icon={<UploadOutlined />}>
                                        <h1 className="font-lao">ອັບໂຫຼດຮູບ</h1>
                                    </Button>
                                )}
                            </Upload>
                            {formData.idFront && formData.idFront instanceof Blob && (
                                <Image
                                    src={URL.createObjectURL(formData.idFront)}
                                    alt="ID Front"
                                    width={50}
                                    onClick={() => handleImagePreview(formData.idFront)}
                                />
                            )}
                        </Form.Item>

                        
                        <Form.Item label="ຮູບບັດດ້ານຫຼັງ" required
                            className="font-lao">
                            <Upload
                                accept="image/*"
                                beforeUpload={(file) => handleUpload(file, "idBack")}
                                showUploadList={false}
                            >
                                {!formData.idBack && (
                                    <Button icon={<UploadOutlined />}>
                                        <h1 className="font-lao">ອັບໂຫຼດຮູບ</h1>
                                    </Button>
                                )}
                            </Upload>
                            {formData.idBack && formData.idBack instanceof Blob && (
                                <Image
                                    src={URL.createObjectURL(formData.idBack)}
                                    alt="ID Back"
                                    width={50}
                                    onClick={() => handleImagePreview(formData.idBack)}
                                />
                            )}
                        </Form.Item>

                        <Form.Item label="ຮູບໃບໜ້າຄູ່ກັບບັດ" required
                            className="font-lao">
                            <Upload
                                accept="image/*"
                                beforeUpload={(file) => handleUpload(file, "selfie")}
                                showUploadList={false}
                            >
                                {!formData.selfie && (
                                    <Button icon={<UploadOutlined />}>
                                        <h1 className="font-lao">ອັບໂຫຼດຮູບ</h1>
                                    </Button>
                                )}
                            </Upload>
                            {formData.selfie && (
                                <Image
                                    src={URL.createObjectURL(formData.selfie)}
                                    alt="Selfie"
                                    width={50}
                                    onClick={() => handleImagePreview(formData.selfie)}
                                />
                            )}
                        </Form.Item>
                    </Form>
                )}
                
                {current === 2 && !isFormSubmitted && (
                    <Form layout="vertical">
                    <Form.Item label="ຊື່ທະນາຄານ" required className="font-lao">
                        <Input
                            name="bankName"
                            value={formData.bankName}
                            onChange={handleInputChange}
                        />
                    </Form.Item>
                
                    <Row gutter={[16, 16]}>
                        <Col xs={24} sm={12}>
                            <Form.Item label="ຊື່ບັນຊີທະນາຄານ" required className="font-lao">
                                <Input
                                    name="accountName"
                                    value={formData.accountName}
                                    onChange={handleInputChange}
                                />
                            </Form.Item>
                        </Col>
                        <Col xs={24} sm={12}>
                            <Form.Item label="ເລກບັນຊີທະນາຄານ" required className="font-lao">
                                <Input
                                    name="accountNumber"
                                    value={formData.accountNumber}
                                    onChange={handleInputChange}
                                />
                            </Form.Item>
                        </Col>
                    </Row>
                </Form>
                
                )}


                {current === 3 && !isFormSubmitted && (
                    <div className="font-lao text-black dark:text-white">
                        <p><strong>ຊື່ແທ້:</strong> {formData.firstname}</p>
                        <p><strong>ນາມສະກຸນ:</strong> {formData.lastname}</p>
                        <p><strong>ເບີໂທລະສັບ:</strong> {formData.phonenumber}</p>
                        <p><strong>ປະເພດເອກະສານຢັ້ງຢືນ:</strong> {formData.cardType}</p>
                        <p><strong>ຊື່ທະນາຄານ:</strong> {formData.bankName}</p>
                        <p><strong>ຊື່ບັນຊີທະນາຄານ:</strong> {formData.accountName}</p>
                        <p><strong>ເລກບັນຊີທະນາຄານ:</strong> {formData.accountNumber}</p>

                        <p><strong>ຮູບບັດດ້ານໜ້າ:</strong></p>
                        {formData.idFront ? (
                            <Image src={URL.createObjectURL(formData.idFront)} alt="ID Front" width={50} />
                        ) : (
                            <p className="text-red-500 dark:text-red-400">ບໍ່ມີການອັບໂຫຼດ</p>
                        )}

                        <p><strong>ຮູບບັດດ້ານຫຼັງ:</strong></p>
                        {formData.idBack ? (
                            <Image src={URL.createObjectURL(formData.idBack)} alt="ID Back" width={50} />
                        ) : (
                            <p className="text-red-500 dark:text-red-400">ບໍ່ມີການອັບໂຫຼດ</p>
                        )}

                        <p><strong>ຮູບໃບໜ້າຄູ່ກັບບັດ:</strong></p>
                        {formData.selfie ? (
                            <Image src={URL.createObjectURL(formData.selfie)} alt="Selfie with ID" width={50} />
                        ) : (
                            <p className="text-red-500 dark:text-red-400">ບໍ່ມີການອັບໂຫຼດ</p>
                        )}
                    </div>

                )}

                <div style={{ marginTop: 20, textAlign: "center" }}>
                    {current === 0 && !isFormSubmitted && (
                        <Button type="primary" onClick={handleNext} block
                            color="default"
                            variant="outlined"
                            htmlType="submit"
                            className="w-full text-white bg-secondary-700 hover:bg-secondary-900 focus:outline-none font-medium rounded-lg text-sm text-center"
                            loading={loading}
                        >
                            <h1 className="font-lao">ຕໍ່ໄປ</h1>
                        </Button>
                    )}
                    {current === 1 && !isFormSubmitted && (
                        <>
                            <Button type="primary" onClick={handleNext} block
                                color="default"
                                variant="outlined"
                                htmlType="submit"
                                className="w-full text-white bg-secondary-700 hover:bg-secondary-900 focus:outline-none font-medium rounded-lg text-sm text-center"
                                loading={loading}>
                                <h1 className="font-lao">ຕໍ່ໄປ</h1>
                            </Button>
                        </>
                    )}
                    {current === 2 && !isFormSubmitted && (
                        <>
                            <Button type="primary" onClick={handleNext} block
                                color="default"
                                variant="outlined"
                                htmlType="submit"
                                className="w-full text-white bg-secondary-700 hover:bg-secondary-900 focus:outline-none font-medium rounded-lg text-sm text-center"
                                loading={loading}>
                                <h1 className="font-lao">ຕໍ່ໄປ</h1>
                            </Button>
                        </>
                    )}
                    {current === 3 && !isFormSubmitted && (
                        <>
                            <Button type="primary" onClick={handleConfirm} block
                                color="default"
                                variant="outlined"
                                htmlType="submit"
                                className="w-full text-white bg-secondary-700 hover:bg-secondary-900 focus:outline-none font-medium rounded-lg text-sm text-center"
                                loading={loading}>
                                <h1 className="font-lao">ຕົກລົງ</h1>
                            </Button>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Verify;
