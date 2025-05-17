import { useState, useEffect } from "react";
import { PageTitle } from "@/hooks/PageTitle";
import { Input, Button, message, Modal } from "antd";
import { useAuth } from "@/utils/AuthProvider";
import WithdrawTable from "@/components/table/WithdrawTable";
import { apiUrl } from "@/utils/config";

const Withdraw = () => {
  PageTitle("Withdraw");
  const { user } = useAuth();
  const [userTotals, setUserTotals] = useState({});
  const [withdrawAmount, setWithdrawAmount] = useState(0);
  const [pendingRequests, setPendingRequests] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (user?.id) {
      const fetchUserTotals = async () => {
        try {
          const response = await fetch(`${apiUrl}/bank/withdraw/total?id=${user.id}`, {
            method: "GET",
            credentials: "include",
          });

          if (response.ok) {
            const result = await response.json();
            setUserTotals(result);
          } else {
            setError("Failed to fetch data");
          }
        } catch (error) {
          console.error("Error fetching user totals:", error);
          setError("Error fetching data");
        }
      };

      fetchUserTotals();
    }
  }, [user]);

  const handleWithdraw = async () => {
    if (!withdrawAmount || withdrawAmount < 100000) {
      message.error("ກະລຸນາໃສ່ຈໍານວນທີ່ຖືກຕ້ອງເພື່ອຖອນ!");
      return;
    }

    if (withdrawAmount > userTotals.remainingAmount) {
      message.error("ຈຳນວນເງິນຖອນເກີນຍອດເງິນທີ່ຖອນໄດ້ທັງໝົດ.");
      return;
    }

    try {
      const response = await fetch(`${apiUrl}/bank/withdraw/request`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user.id,
          withdrawAmount,
          remainingAmount: userTotals.remainingAmount,
        }),
      });

      const result = await response.json();

      if (response.ok) {
        message.success("ສົ່ງຄຳຮ້ອງຂໍຖອນເງິນແລ້ວ!");
        setPendingRequests([...pendingRequests, { withdrawAmount }]);
        setTimeout(() => {
          location.reload();
        }
          , 2000);
      } else {
        message.error("ການຮ້ອງຂໍຖອນຕົວລົ້ມເຫຼວ.");
      }
    } catch (error) {
      message.error("ລອງໃໝ່ອີກຄັ້ງ.");
    }
  };

  return (
    <div className="bg-white text-black p-4 shadow-md rounded-lg transition-colors dark:bg-gray-900 dark:text-white">
      <h2 className="text-2xl font-semibold text-center mb-6 font-lao">ຖອນເງິນ</h2>

      <div>
        <h3 className="text-lg font-medium font-lao">ຮ້ອງຂໍການຖອນເງິນ</h3>

        <div className="mt-4">
          <label className="block text-sm font-medium font-lao">ຈຳນວນເງິນທີ່ຖອນໄດ້ທັງໝົດ</label>
          <Input value={`${(userTotals.remainingAmount ?? 0).toLocaleString()} ກີບ`} readOnly className="mt-1" />
        </div>

        <div className="mt-4">
          <label className="block text-sm font-medium font-lao">ຈໍານວນທີ່ຈະຖອນ</label>
          <Input
            placeholder="ຂັ້ນຕໍ່າ 100,000 ກີບ"
            type="number"
            onChange={(e) => setWithdrawAmount(Number(e.target.value))}
            className="mt-1"
          />
        </div>

        <div className="mt-5">
          <Button
            type="default"
            onClick={() => setIsModalVisible(true)}
            block
            size="large"
            disabled={withdrawAmount < 100000}
          >
            <h1 className="font-lao">ສົ່ງຄໍາຮ້ອງຂໍຖອນເງິນ</h1>
          </Button>
        </div>


        <Modal
          title="ຢືນຢັນການຖອນເງິນ"
          open={isModalVisible}
          onOk={() => {
            handleWithdraw();
            setIsModalVisible(false);
          }}
          onCancel={() => setIsModalVisible(false)}
          okText="ຕົກລົງ"
          cancelText="ຍົກເລີກ"
          centered
        >
          <p className="font-lao dark:text-white">
            ທ່ານກຳລັງຈະຖອນເງິນຈໍານວນ:{" "}
            <strong>{withdrawAmount.toLocaleString()} ກີບ</strong>
          </p>
        </Modal>

      </div>

      <div className="overflow-x-auto mt-6">
        <WithdrawTable />
      </div>
    </div>
  );
};

export default Withdraw;
