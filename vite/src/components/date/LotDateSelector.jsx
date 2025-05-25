import { useState } from "react";
import { InputNumber, message, Button, DatePicker } from "antd";
import { PlusOutlined } from "@ant-design/icons";
import { format } from "date-fns";

const LotDateSelector = ({ baseLotPath, onGenerate }) => {
  const [startAmount, setStartAmount] = useState(0);
  const [goalAmount, setGoalAmount] = useState(null);
  const [endDate, setEndDate] = useState(null);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const disabledDate = (current) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return current && current.toDate() <= today;
  };


  const handleGenerate = () => {
    if (startAmount === null || goalAmount === null || isNaN(startAmount) || isNaN(goalAmount) || !endDate) {
      message.warning("ກະລຸນາໃສ່ຂໍ້ມູນໃຫ້ຄົບຖ້ວນ");
      return;
    }

    if (startAmount >= goalAmount) {
      message.warning("ຄ່າເລີ່ມຕົ້ນຕ້ອງນ້ອຍກວ່າເປົ້າໝາຍ");
      return;
    }

    const startDateFormatted = format(today, "dd-MM-yyyy");
    const endDateFormatted = format(endDate.toDate(), "dd-MM-yyyy");

    const url = `${baseLotPath}/start/${startAmount}/goal/${goalAmount}/timestart/${startDateFormatted}/timeend/${endDateFormatted}`;
    onGenerate(url);
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex gap-4 mb-2 justify-between">
        <InputNumber
          placeholder="ເລີ່ມ"
          style={{ width: 200 }}
          value={startAmount}
          onChange={setStartAmount}
        />
        <InputNumber
          placeholder="ເປົ້າໝາຍ"
          style={{ width: 200 }}
          value={goalAmount}
          onChange={setGoalAmount}
        />
      </div>

      <div className="flex flex-col gap-2">
        <DatePicker
          placeholder="ວັນທີສິ້ນສຸດ"
          value={endDate}
          onChange={setEndDate}
          format="DD-MM-YYYY"
          disabledDate={disabledDate}
        />
        <div className="flex gap-2 mb-4">
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={handleGenerate}
          >
            <span className="font-lao">ສ້າງລອດໂດເນດ</span>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default LotDateSelector;
