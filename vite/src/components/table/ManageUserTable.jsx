import { useState, useEffect } from "react";
import { Table, Input, message, Modal } from "antd";
import { EyeOutlined, DeleteOutlined } from "@ant-design/icons";
import Pagination from "@/components/Pagination";
import ManageUserModal from "@/components/modal/ManageUserModal";
import { apiUrl } from "@/utils/config";

const ManageUserTable = () => {
    const [searchText, setSearchText] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [selectedUserId, setSelectedUserId] = useState(null);
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(false);
    const pageSize = 8;

    const fetchUsers = async () => {
        setLoading(true);
        try {
            const response = await fetch(`${apiUrl}/manageuser`, {
                method: "GET",
                credentials: "include",
            });
            const result = await response.json();
            if (Array.isArray(result)) {
                setData(result);
            } else {
                setData([]);
            }
        } catch (error) {
            console.error("Error fetching users:", error);
            setData([]);
        } finally {
            setLoading(false);
        }
    };


    useEffect(() => {
        fetchUsers();
    }, []);

    const handleDelete = (userId) => {
        Modal.confirm({
            title: "ຢືນຢັນການລຶບ",
            content: "ທ່ານແນ່ໃຈບໍທີ່ຈະລຶບຜູ້ໃຊ້ນີ້?",
            okText: "ຢືນຢັນ",
            cancelText: "ຍົກເລີກ",
            okButtonProps: { danger: true },
            onOk: async () => {
                try {
                    const res = await fetch(`${apiUrl}/manageuser/${userId}`, {
                        method: "DELETE",
                        credentials: "include",
                    });
                    const result = await res.json();
                    if (res.ok) {
                        message.success("ລຶບຜູ້ໃຊ້ສຳເລັດ");
                        fetchUsers();
                    } else {
                        message.error(result.error || "ລຶບຜູ້ໃຊ້ບໍ່ສຳເລັດ");
                    }
                } catch (err) {
                    console.error("Delete failed:", err);
                    message.error("ມີຂໍ້ຜິດພາດໃນການລຶບ");
                }
            },
        });
    };



    const filteredData = searchText
        ? data.filter((item) => {

            return (
                item.username?.toLowerCase().includes(searchText.toLowerCase()) ||
                item.firstname?.toLowerCase().includes(searchText.toLowerCase()) ||
                item.lastname?.toLowerCase().includes(searchText.toLowerCase()) ||
                item.role?.toLowerCase().includes(searchText.toLowerCase()) ||
                item.timestamps?.toLowerCase().includes(searchText.toLowerCase())
                
            );
        })
        : data;


    const totalPages = Math.ceil(filteredData.length / pageSize);
    const startIndex = (currentPage - 1) * pageSize;
    const currentData = filteredData.slice(startIndex, startIndex + pageSize).map((item, index) => ({
        ...item,
        key: startIndex + index + 1,
        name: `${item.firstname || ""} ${item.lastname || ""}`.trim(),
    }));

    const handlePageChange = (page) => {
        if (page >= 1 && page <= totalPages) {
            setCurrentPage(page);
        }
    };

    const handleShow = (userId) => {
        setSelectedUserId(userId);
        setIsModalVisible(true);
    };

    const columns = [
        { title: "ລຳດັບ", dataIndex: "key", key: "key", className: "text-sm font-lao" },
        {
            title: "ຊື່ ແລະ ນາມສະກຸນ",
            dataIndex: "name",
            key: "name",
            className: "text-sm font-lao",
        },
        {
            title: "ຊື່ຜູ້ໃຊ້",
            dataIndex: "username",
            key: "username",
            className: "text-sm font-lao",
        },
        {
            title: "ສິດ",
            dataIndex: "role",
            key: "role",
            className: "text-sm font-lao",
        },
        {
            title: "ອັບເດດລ່າສຸດ",
            dataIndex: "timestamps",
            key: "timestamps",
            className: "text-sm font-lao",
        },
        {
            title: "Action",
            key: "action",
            render: (_, record) => (
                <div className="flex space-x-2">
                    <button
                        className="text-blue-500 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300"
                        onClick={() => handleShow(record._id)}
                    >
                        <EyeOutlined className="text-lg" />
                    </button>
                    <button
                        className="text-red-500 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300"
                        onClick={() => handleDelete(record._id)}
                    >
                        <DeleteOutlined className="text-lg" />
                    </button>
                </div>
            ),
        },

    ];

    return (
        <div className="bg-white text-black p-4 shadow-md rounded-lg transition-colors dark:bg-gray-900 dark:text-white">
            <Input.Search
                placeholder="Search..."
                allowClear
                onChange={(e) => {
                    setSearchText(e.target.value);
                    setCurrentPage(1);
                }}
                className="mb-4 w-full md:w-1/3 p-1 dark:bg-gray-800 dark:border-gray-700 dark:placeholder-gray-400"
            />

            <div className="overflow-x-auto">
                <Table
                    columns={columns}
                    dataSource={currentData}
                    pagination={false}
                    size="small"
                    className="w-full"
                    loading={loading}
                />
            </div>

            {totalPages > 1 && (
                <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={handlePageChange}
                />
            )}

            <ManageUserModal
                open={isModalVisible}
                onClose={() => {
                    setIsModalVisible(false);
                    fetchUsers();
                }}
                userId={selectedUserId}
            />

        </div>
    );
};

export default ManageUserTable;
