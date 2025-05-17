import { useState, useEffect } from "react";
import { Table, Input, Modal, message } from "antd";
import { EyeOutlined, DeleteOutlined } from "@ant-design/icons";
import VerifyRequestModal from "@/components/modal/VerifyRequestModal";
import Pagination from "@/components/Pagination"
import { apiUrl } from "@/utils/config";

const VerifyRequestTable = () => {
  const [searchText, setSearchText] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [data, setData] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false); 
  const [selectedUserId, setSelectedUserId] = useState(null); 
  const [loading, setLoading] = useState(false);
  const pageSize = 8;

  
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true); 
      try {
        const response = await fetch(`${apiUrl}/upload/verification/admin`, {
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
        console.error("Error fetching user data:", error);
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

  const handleEdit = async (userId) => {
    setSelectedUserId(userId);
    setIsModalVisible(true);
  };

  const handleDelete = (userId) => {
    Modal.confirm({
      title: "ຢືນຢັນການລຶບ",
      content: "ທ່ານແນ່ໃຈບໍທີ່ຈະລຶບຂໍ້ມູນນິ້?",
      okText: "ຢືນຢັນ",
      cancelText: "ຍົກເລີກ",
      okButtonProps: { danger: true },
      onOk: async () => {
        try {
          const res = await fetch(`${apiUrl}/upload/verification/admin/delete/${userId}`, {
            method: "PATCH",
            credentials: "include",
          });
          const result = await res.json();
          if (res.ok) {
            message.success("ລຶບຂໍ້ມູນສຳເລັດ");
            fetchUsers();
          } else {
            message.error(result.error || "ລຶບຂໍ້ມູນບໍ່ສຳເລັດ");
          }
        } catch (err) {
          console.error("Delete failed:", err);
          message.error("ມີຂໍ້ຜິດພາດໃນການລຶບ");
        }
      },
    });
  };

  const columns = [
    { title: "ລຳດັບ", dataIndex: "key", key: "key", className: "text-sm font-lao" },
    { title: "ຊື່ ແລະ ນາມສະກຸນ", dataIndex: "name", key: "name", className: "text-sm font-lao" },
    { title: "ສະຖານະ", dataIndex: "status", key: "status", className: "text-sm font-lao" },
    {
      title: "Action",
      key: "action",
      render: (_, record) => (
        <div className="flex space-x-2">
          <button
            className="text-blue-500 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300"
            onClick={() => handleEdit(record.userId)}
          >
            <EyeOutlined className="text-lg" />
          </button>
          <button
            className="text-red-500 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300"
            onClick={() => handleDelete(record.userId)}
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

      <VerifyRequestModal
        open={isModalVisible}
        onClose={() => setIsModalVisible(false)}
        userId={selectedUserId} 
      />

    </div>
  );
};

export default VerifyRequestTable;
