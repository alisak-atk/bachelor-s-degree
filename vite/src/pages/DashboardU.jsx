import { useState, useEffect } from "react";
import { PageTitle } from "@/hooks/PageTitle";
import { useAuth } from "@/utils/AuthProvider";
import { Card, Row, Col, DatePicker, Select } from "antd";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import dayjs from "dayjs";
import { apiUrl } from "@/utils/config";

const { Option } = Select;
const { RangePicker } = DatePicker;

const DashboardU = () => {
  PageTitle("Dashboard");
  const { user } = useAuth();
  const [isMobile, setIsMobileState] = useState(window.innerWidth < 768);
  const [selectedFilter, setSelectedFilter] = useState("all"); 
  const [startDate, setStartDate] = useState(null); 
  const [endDate, setEndDate] = useState(null); 
  const [barChartData, setBarChartData] = useState([]);
  const [donationSummary, setDonationSummary] = useState({
    donorCount: "-",
    totalDonationsAfterTax: "-",
    withdrawalCount: "-",
    remainingAmount: "-",
  });

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobileState(mobile);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [setIsMobileState]);

  const fetchDonationSummary = async () => {
    try {
      const params = new URLSearchParams();

      if (user?.id) {
        params.append("userId", user.id);
      }

      if (startDate) {
        params.append("startDate", startDate.toISOString());
      }

      if (endDate) {
        params.append("endDate", endDate.toISOString());
      }


      const response = await fetch(`${apiUrl}/dashboard/total?${params.toString()}`, {
        method: "GET",
        credentials: "include",
      });

      if (response.ok) {
        const data = await response.json();
        setDonationSummary({
          donorCount: `${data.donorCount.toLocaleString()} ຄົນ`,
          totalDonationsAfterTax: `${data.totalDonationsAfterTax.toLocaleString()} ກີບ`,
          withdrawalCount: `${data.withdrawalCount.toLocaleString()} ກີບ`,
          remainingAmount: `${data.remainingAmount.toLocaleString()} ກີບ`,
        });
      } else {
        console.error("Failed to fetch donation summary");
      }
    } catch (error) {
      console.error("Error fetching donation summary:", error);
    }
  };

  const fetchMonthlyDonations = async () => {
    try {
      const response = await fetch(`${apiUrl}/dashboard/monthly-total`, {
        method: "GET",
        credentials: "include",
      });

      if (response.ok) {
        const data = await response.json();

        
        const formatted = data.map(item => ({
          name: item.month,
          ຈຳນວນ: item.total
        }));

        setBarChartData(formatted);
      } else {
        console.error("Failed to fetch monthly donation data");
      }
    } catch (error) {
      console.error("Error fetching monthly donation data:", error);
    }
  };


  useEffect(() => {
    if (!user?.id) return;

    fetchDonationSummary();
    fetchMonthlyDonations();
  }, [selectedFilter, startDate, endDate]);



  const handleDateRangeChange = (dates) => {
    if (dates && dates.length === 2) {
      setStartDate(dates[0]);
      setEndDate(dates[1]);


    } else {
      setStartDate(null);
      setEndDate(null);
    }
  };

  
  const handleFilterChange = (value) => {
    setSelectedFilter(value);

    if (value === "thisMonth") {
      const currentDate = dayjs();
      const startOfMonth = currentDate.startOf("month");
      const endOfMonth = currentDate.endOf("month");

      setStartDate(startOfMonth);
      setEndDate(endOfMonth);
    } else {
      setStartDate(null);
      setEndDate(null);
    }
  };


  
  const donationData = [
    { title: "ຜູ້ສະໜັບສະໜູນທັງໝົດ", value: donationSummary.donorCount },
    { title: "ການສະໜັບສະໜູນທັງໝົດ", value: donationSummary.totalDonationsAfterTax },
    { title: "ຈໍານວນທີ່ຮ້ອງຂໍທັງໝົດ", value: donationSummary.withdrawalCount },
    { title: "ຍອດຄົງເຫຼືອທັງໝົດ", value: donationSummary.remainingAmount },
  ];

  const currentYear = dayjs().year();
  const cardTitle = `ການສະໜັບສະໜູນທັງໝົດ ປີ ${currentYear}`;


  return (
    <div className="w-full px-4 max-w-full sm:px-0 sm:max-w-none">

      <Row className="mb-4 mt-4" gutter={[16, 16]}>
        <Col xs={24} sm={12} lg={6}>
          <Select
            value={selectedFilter}
            onChange={handleFilterChange}
            className="w-full"
          >
            <Option value="all" className="font-lao">ທັງໝົດ</Option>
            <Option value="thisMonth" className="font-lao">ເດືອນນີ້</Option>
            <Option value="dateRange" className="font-lao">ກຳນົດເອງ</Option>
          </Select>
        </Col>

        {selectedFilter === "dateRange" && (
          <Col xs={24} sm={12} lg={8}>
            <RangePicker
              format="DD/MM/YYYY"
              onChange={handleDateRangeChange}
              className="w-full"
              placeholder={["ເລີ່ມຕົ້ນ", "ສິ້ນສຸດ"]}
            />
          </Col>
        )}
      </Row>


      
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {donationData.map((data, index) => (
          <div key={index} className="w-full">
            <Card
              title={
                <div className="text-[10px] sm:text-base lg:text-base font-lao font-semibold dark:text-white">
                  {data.title}
                </div>
              }
              className="bg-white text-black dark:bg-white-800 dark:text-white font-lao"
            >
              <div className="font-semibold text-[14px] dark:text-white lg:text-base">{data.value}</div>
            </Card>
          </div>
        ))}
      </div>

      <Row className="mt-8 mb-3" gutter={16}>
        <Col span={24}>
          <Card
            title={cardTitle}
            className="bg-white text-black dark:bg-gray-800 dark:text-white font-lao"
          >
            <ResponsiveContainer
              width="100%"
              height={window.innerWidth < 640 ? 250 : 500}
            >
              <BarChart
                data={barChartData}
                margin={{ top: 20, right: 20, left: 0, bottom: 20 }} 
                barCategoryGap={window.innerWidth < 640 ? 2 : 12} 
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} /> 
                <XAxis
                  dataKey="name"
                  interval={0}
                  angle={isMobile ? -90 : 0}
                  textAnchor={isMobile ? "end" : "middle"}
                  height={isMobile ? 60 : 40}
                />
                <YAxis
                  tickFormatter={(value) => value.toLocaleString("lo-LA")}
                  width={70}
                />
                <Bar dataKey="ຈຳນວນ" fill="#4D96FF" />
                <Tooltip formatter={(value) => `${value.toLocaleString("lo-LA")} ກີບ`} cursor={false} />
                <Legend />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </Col>
      </Row>



    </div>
  );
};

export default DashboardU;
