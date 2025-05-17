import { useState, useEffect } from "react";
import { Table, Input } from "antd";
import { useAuth } from "@/utils/AuthProvider";
import Pagination from "@/components/Pagination";
import { apiUrl } from "@/utils/config";

const HistoryTable = () => {
    const [searchText, setSearchText] = useState("");
    const { user } = useAuth();
    const [currentPage, setCurrentPage] = useState(1);
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(false);
    const pageSize = 8;

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);

            try {
                const response = await fetch(`${apiUrl}/history?role=${user.role}&id=${user.id}`, {
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
            item.name.toLowerCase().includes(searchText.toLowerCase()) ||
            item.amount.toString().includes(searchText) ||
            item.date.toLowerCase().includes(searchText.toLowerCase()) ||
            item.bank.toLowerCase().includes(searchText.toLowerCase()) ||
            item.message.toLowerCase().includes(searchText.toLowerCase())
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

    const columns = [
        { title: "ລຳດັບ", dataIndex: "key", key: "key", className: "text-sm font-lao" },
        { title: "ຊື່", dataIndex: "name", key: "name", className: "text-sm font-lao" },
        {
            title: "ຈຳນວນ",
            dataIndex: "amount",
            key: "amount",
            className: "text-sm font-lao",
            render: (amount) => `${Number(amount).toLocaleString()} ກີບ`,
        },
        { title: "ວັນທີ", dataIndex: "date", key: "date", className: "text-sm font-lao" },
        { title: "ທະນາຄານ", dataIndex: "bank", key: "bank", className: "text-sm font-lao" },
        { title: "ຂໍ້ຄວາມ", dataIndex: "message", key: "message", className: "text-sm font-lao" },
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
                    loading={loading}
                    size="small"
                    className="w-full"
                />
            </div>

            {totalPages > 1 && (
                <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={handlePageChange}
                />
            )}

        </div>
    );
};

export default HistoryTable;
