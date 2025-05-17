import { useState, useEffect } from "react";
import { Table, Input } from "antd";
import { useAuth } from "@/utils/AuthProvider";
import { EyeOutlined } from "@ant-design/icons";
import Pagination from "@/components/Pagination";
import WithdrawRequestModal from "@/components/modal/WithdrawRequestModal";
import { apiUrl } from "@/utils/config";

const WithdrawRequestTable = () => {
    const [searchText, setSearchText] = useState("");
    const { user } = useAuth();
    const [currentPage, setCurrentPage] = useState(1);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [selectedWithdrawalId, setSelectedWithdrawalId] = useState(null);
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(false);
    const pageSize = 8;

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);

            try {
                const response = await fetch(`${apiUrl}/bank/withdraw/get?role=${user.role}&id=${user.id}`, {
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
                console.error("Error fetching history data:", error);
                setData([]);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const filteredData = data.filter(
        (item) =>
            item.username.toLowerCase().includes(searchText.toLowerCase()) ||
            item.amount.toString().includes(searchText) ||
            item.date.toLowerCase().includes(searchText.toLowerCase()) ||
            item.status.toLowerCase().includes(searchText.toLowerCase())
    );

    const totalPages = Math.ceil(filteredData.length / pageSize);
    const startIndex = (currentPage - 1) * pageSize;
    const currentData = filteredData.slice(startIndex, startIndex + pageSize).map((item, index) => ({
        ...item,
        key: startIndex + index + 1,
    }));

    const handlePageChange = (page) => {
        if (page >= 1 && page <= totalPages) {
            setCurrentPage(page);
        }
    };

    const handleShow = async (withdrawalId) => {
        setSelectedWithdrawalId(withdrawalId);
        setIsModalVisible(true);
    };

    const columns = [
        { title: "ລຳດັບ", dataIndex: "key", key: "key", className: "text-sm font-lao" },
        { title: "ຊື່", dataIndex: "username", key: "username", className: "text-sm font-lao" },
        {
            title: "ຈໍານວນທີ່ຮ້ອງຂໍ",
            dataIndex: "amount",
            key: "amount",
            className: "text-sm font-lao",
            render: (amount) => `${Number(amount).toLocaleString()} ກີບ`
        },
        {
            title: "ວັນທິຮ້ອງຂໍ",
            dataIndex: "date",
            key: "date",
            className: "text-sm font-lao"
        },
        {
            title: "ສະຖານະ",
            dataIndex: "status",
            key: "status",
            className: "text-sm font-lao",
        },
        {
            title: "Action",
            key: "action",
            render: (_, record) =>
                <button onClick={() => handleShow(record.withdrawalId)}
                    className="text-blue-500 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300">
                    <EyeOutlined />
                </button>
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

            <WithdrawRequestModal
                open={isModalVisible}
                onClose={() => setIsModalVisible(false)}
                withdrawalId={selectedWithdrawalId}
            />

        </div>
    );
};

export default WithdrawRequestTable;
