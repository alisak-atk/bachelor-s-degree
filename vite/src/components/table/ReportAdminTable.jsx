import { useEffect, useState, useRef } from "react";
import { Table, Select, DatePicker, Input, message, Button } from "antd";
import { useAuth } from "@/utils/AuthProvider";
import Pagination from "@/components/Pagination";
import { PrinterFilled, FilePdfFilled, FileExcelOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import isBetween from "dayjs/plugin/isBetween";
import { useReactToPrint } from "react-to-print";
import utc from "dayjs/plugin/utc";
import { exportToExcelAdmin, exportToCSVAdmin, exportToPDFAdmin } from "@/hooks/print";
import { apiUrl } from "@/utils/config";
dayjs.extend(isBetween);
dayjs.extend(utc);

const { Option } = Select;
const { RangePicker } = DatePicker;

const ReportAdminTable = () => {
    const [reportType, setReportType] = useState("user");
    const [data, setData] = useState([]);
    const [filteredData, setFilteredData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [dateRange, setDateRange] = useState([null, null]);
    const [searchText, setSearchText] = useState("");
    const { user } = useAuth();
    const [currentPage, setCurrentPage] = useState(1);
    const pageSize = 8;
    const componentRef = useRef();

    const handlePrint = useReactToPrint({
        documentTitle: "Report",
        contentRef: componentRef,
    })

    const fetchReport = async (type, role) => {
        try {
            setLoading(true);

            const res = await fetch(
                `${apiUrl}/report/admin?type=${type}&role=${role}`,
                { credentials: "include" }
            );
            const result = await res.json();
            setData(result.data || []);
            setFilteredData(result.data || []);
        } catch (err) {
            console.error("Fetch error:", err);
            message.error("Failed to fetch report");
        } finally {
            setLoading(false);
        }
    };


    useEffect(() => {
        fetchReport(reportType, user.role);
    }, [reportType, user]);


    const filterData = () => {
        if (!dateRange[0] || !dateRange[1]) {
            setFilteredData(data);
            return;
        }

        const start = dayjs(dateRange[0]).startOf("day");
        const end = dayjs(dateRange[1]).endOf("day");

        const filtered = data.filter((item) => {

            let isInDateRange = false;

            if (reportType === "user") {
                if (item.timestamps) {
                    const itemDate = dayjs(item.timestamps);
                    isInDateRange = itemDate.isBetween(start, end, null, "[]");
                }
            }

            if (reportType === "donation") {
                if (item.dateTime) {
                    const itemDate = dayjs(item.dateTime, "DD/MM/YYYY HH:mm:ss");
                    isInDateRange = itemDate.isBetween(start, end, null, "[]");
                }
            }

            if (reportType === "withdraw") {
                const requestedAtDate = dayjs(item.requestedAt, "DD/MM/YYYY HH:mm:ss");
                const processAtDate = dayjs(item.processAt, "DD/MM/YYYY HH:mm:ss");

                const isRequestedInRange = requestedAtDate.isBetween(start, end, null, "[]");
                const isProcessInRange = processAtDate.isBetween(start, end, null, "[]");

                isInDateRange = isRequestedInRange || isProcessInRange;
            }

            if (reportType === "verifyRequest") {
                if (item.timestamps) {
                    const itemDate = dayjs(item.timestamps);
                    isInDateRange = itemDate.isBetween(start, end, null, "[]");
                }
            }


            return isInDateRange;
        });

        setFilteredData(filtered);
    };

    useEffect(() => {
        filterData();
    }, [dateRange, data]);


    const handleDateRangeChange = (dates) => {
        setDateRange(dates || [null, null]);
    };

    const handleSearch = (e) => {
        setSearchText(e.target.value);
        setCurrentPage(1);
    };

    const filteredSearchData = filteredData.filter((item) => {
        let fields = [];

        switch (reportType) {
            case "user":
                fields = [
                    item.firstname,
                    item.lastname,
                    item.username,
                    item.role,
                    item.timestamps,
                ];
                break;
            case "donation":
                fields = [
                    item.donor,
                    item.receiverID?.username,
                    item.amount?.toString(),
                    item.dateTime,
                    item.paymentMethod,
                    item.transactionId,
                ];
                break;
            case "verifyRequest":
                fields = [
                    item.firstname,
                    item.lastname,
                    item.timestamps,
                    item.status,
                    item.cardType,
                    item.bankAccount?.bankName,
                    item.bankAccount?.accountName,
                    item.bankAccount?.accountNumber,
                ];
                break;
            case "withdraw":
                fields = [
                    item.userID?.username,
                    item.amount?.toString(),
                    item.requestedAt,
                    item.processAt,
                    item.status,
                    item.sendMoneyID,
                    item.adminNote,
                ];
                break;
            default:
                break;
        }

        return fields
            .filter(Boolean)
            .some((field) =>
                field?.toLowerCase?.().includes(searchText.toLowerCase())
            );
    });


    const totalPages = Math.ceil(filteredSearchData.length / pageSize);
    const startIndex = (currentPage - 1) * pageSize;

    const currentData = filteredSearchData.slice(startIndex, startIndex + pageSize).map((item, index) => ({
        ...item,
        key: startIndex + index + 1,
    }));

    const handlePageChange = (page) => {
        setCurrentPage(page);
    };

    const userColumns = [
        { title: "ລຳດັບ", dataIndex: "key", key: "key", className: "text-sm font-lao" },
        { title: "ຊື່", dataIndex: "firstname", key: "firstname", className: "text-sm font-lao" },
        { title: "ນາມສະກຸນ", dataIndex: "lastname", key: "lastname", className: "text-sm font-lao" },
        { title: "ຊຶ່ຜູ້ໃຊ້", dataIndex: "username", key: "username", className: "text-sm font-lao" },
        { title: "ສິດ", dataIndex: "role", key: "role", className: "text-sm font-lao" },
        { title: "ອັບເດດລ່າສຸດ", dataIndex: "timestamps", key: "timestamps", className: "text-sm font-lao" },
    ];

    const donationColumns = [
        { title: "ລຳດັບ", dataIndex: "key", key: "key", className: "text-sm font-lao" },
        {
            title: "ຊື່",
            dataIndex: ["receiverID", "username"],
            key: "username",
            className: "text-sm font-lao"
        },
        { title: "ຄົນໂດເນດ", dataIndex: "donor", key: "donor", className: "text-sm font-lao" },
        {
            title: "ຈຳນວນ",
            dataIndex: "amount",
            key: "amount",
            className: "text-sm font-lao",
            render: (amount) => `${Number(amount).toLocaleString()} ກີບ`,
        },
        { title: "ວັນທີ", dataIndex: "dateTime", key: "date", className: "text-sm font-lao" },
        { title: "ທະນາຄານ", dataIndex: "paymentMethod", key: "paymentMethod", className: "text-sm font-lao" },
        { title: "ເລກທຸລະກຳ", dataIndex: "transactionId", key: "transactionId", className: "text-sm font-lao" },
    ];

    const verifyRequestColumns = [
        { title: "ລຳດັບ", dataIndex: "key", key: "key", className: "text-sm font-lao" },
        { title: "ຊື່", dataIndex: "firstname", key: "firstname", className: "text-sm font-lao" },
        { title: "ນາມສະກຸນ", dataIndex: "lastname", key: "lastname", className: "text-sm font-lao" },
        { title: "ອັບເດດລ່າສຸດ", dataIndex: "timestamps", key: "timestamps", className: "text-sm font-lao" },
        { title: "ຊື່ທະນາຄານ", dataIndex: "bankName", key: "bankName", className: "text-sm font-lao" },
        { title: "ຊື່ບັນຊີ", dataIndex: "accountName", key: "accountName", className: "text-sm font-lao" },
        { title: "ເລກບັນຊີ", dataIndex: "accountNumber", key: "accountNumber", className: "text-sm font-lao" },
        { title: "ປະເພດເອກະສານຢັ້ງຢືນ", dataIndex: "cardType", key: "cardType", className: "text-sm font-lao" },
        { title: "ສະຖານະ", dataIndex: "status", key: "status", className: "text-sm font-lao" },
    ];


    const withdrawColumns = [
        { title: "ລຳດັບ", dataIndex: "key", key: "key", className: "text-sm font-lao" },
        {
            title: "ຊື່",
            dataIndex: ["userID", "username"],
            key: "username",
            className: "text-sm font-lao"
        },
        {
            title: "ຈໍານວນທີ່ຮ້ອງຂໍ",
            dataIndex: "amount",
            key: "amount",
            className: "text-sm font-lao",
            render: (amount) => `${Number(amount).toLocaleString()} ກີບ`,
        },
        {
            title: "ວັນທິຮ້ອງຂໍ",
            dataIndex: "requestedAt",
            key: "requestedAt",
            className: "text-sm font-lao"
        },
        {
            title: "ອັບເດດລ່າສຸດ",
            dataIndex: "processAt",
            key: "processAt",
            className: "text-sm font-lao"
        },
        { title: "ສະຖານະ", dataIndex: "status", key: "status", className: "text-sm font-lao" },
        { title: "ເລກທຸລະກຳ", dataIndex: "sendMoneyID", key: "sendMoneyID", className: "text-sm font-lao" },
        { title: "ໝາຍເຫດ", dataIndex: "adminNote", key: "adminNote", className: "text-sm font-lao" },
    ];


    const columnsMap = {
        user: userColumns,
        donation: donationColumns,
        withdraw: withdrawColumns,
        verifyRequest: verifyRequestColumns,
    };


    return (
        <div className="p-4">
            <Input.Search
                placeholder="Search..."
                onChange={handleSearch}
                className="mb-4 w-full md:w-1/3 p-1"
            />

            <div className="flex flex-col gap-2 md:flex-row md:justify-between">

                <Select
                    defaultValue={reportType}
                    style={{ width: 200, marginBottom: 16 }}
                    onChange={setReportType}
                >
                    <Option value="user" className="font-lao">ລາຍງານຜູ້ໃຊ້</Option>
                    <Option value="donation" className="font-lao">ລາຍງານທຸລະກຳ</Option>
                    <Option value="verifyRequest" className="font-lao">ລາຍງານຢືນຢັນຕົວຕົນ</Option>
                    <Option value="withdraw" className="font-lao">ລາຍງານຮ້ອງຂໍການຖອນເງິນ</Option>
                </Select>

                <RangePicker
                    format="DD/MM/YYYY"
                    onChange={handleDateRangeChange}
                    style={{ marginBottom: 16 }}
                    placeholder={["ເລີ່ມຕົ້ນ", "ສິ້ນສຸດ"]}
                />
            </div>

            <div className="flex justify-end mb-4">
                <Button onClick={() => handlePrint()} icon={<PrinterFilled />} color="pink" variant="outlined" size="small">
                    Print
                </Button>
                <Button onClick={() => exportToPDFAdmin(filteredSearchData, reportType)} className="ml-2" icon={<FilePdfFilled />} color="red" variant="outlined" size="small">
                    PDF
                </Button>
                <Button onClick={() => exportToCSVAdmin(filteredSearchData, reportType)} className="ml-2" icon={<FileExcelOutlined />} color="cyan" variant="outlined" size="small">
                    CSV
                </Button>
                <Button onClick={() => exportToExcelAdmin(filteredSearchData, reportType)} className="ml-2" icon={<FileExcelOutlined />} color="green" variant="outlined" size="small">Excel</Button>

            </div>

            <div ref={componentRef}>
                <div className="overflow-x-auto">
                    <Table
                        dataSource={currentData}
                        columns={columnsMap[reportType]}
                        rowKey={(record) => record._id}
                        loading={loading}
                        pagination={false}
                        size="small"
                        className="w-full"
                    />
                </div>
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

export default ReportAdminTable;
