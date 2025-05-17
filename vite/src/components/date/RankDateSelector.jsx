import { useState } from "react";
import { DatePicker, Button, message } from "antd";
import { PlusOutlined } from "@ant-design/icons";
import { format } from "date-fns";

const RankDateSelector = ({ baseTopPath, onGenerate }) => {
    const [startDate, setStartDate] = useState(null);
    const [endDate, setEndDate] = useState(null);

    const handleGenerate = () => {
        if (!startDate || !endDate) {
            return message.warning("ກະລຸນາເລືອກເວລາ");
        }

        const formattedStart = format(startDate.toDate(), "dd-MM-yyyy");
        const formattedEnd = format(endDate.toDate(), "dd-MM-yyyy");

        const url = `${baseTopPath}/timestart/${formattedStart}/timeend/${formattedEnd}`;
        onGenerate(url);
    };

    const disabledEndDate = (current) => {
        return startDate && current < startDate.startOf("day");
    };

    return (
        <div className="flex flex-col gap-2">
            <DatePicker
                className="w-full"
                placeholder="ເລີ່ມ"
                value={startDate}
                onChange={setStartDate}
                format="DD-MM-YYYY"
            />
            <DatePicker
                className="w-full"
                placeholder="ສິ້ນສຸດ"
                value={endDate}
                onChange={setEndDate}
                format="DD-MM-YYYY"
                disabledDate={disabledEndDate}
                disabled={!startDate} 
            />
            <div className="flex gap-2 mb-4">
                <Button
                    type="primary"
                    icon={<PlusOutlined />}
                    onClick={handleGenerate}
                >
                    <span className="font-lao">ສ້າງທອບໂດເນດ</span>
                </Button>
            </div>
        </div>
    );
};

export default RankDateSelector;
