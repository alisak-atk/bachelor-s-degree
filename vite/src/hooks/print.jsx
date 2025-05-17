import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

import { registerNotoSansLao } from "@/assets/fonts/NotoSansLao-Regular";
import Papa from "papaparse";

import ExcelJS from "exceljs";


export const exportToExcel = (filteredSearchData, reportType) => {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet("Report");

  const now = new Date();
  const formattedDate = now.toLocaleDateString("en-GB").split("/").join("-");

  if (reportType === "donation") {

    worksheet.columns = [
      { header: "ລຳດັບ", key: "index", width: 10 },
      { header: "ຊື່", key: "donor", width: 20 },
      { header: "ຈຳນວນ", key: "amount", width: 15 },
      { header: "ວັນທີ", key: "dateTime", width: 20 },
      { header: "ທະນາຄານ", key: "paymentMethod", width: 20 },
      { header: "ຂໍ້ຄວາມ", key: "message", width: 30 },
    ];

    filteredSearchData.forEach((item, index) => {
      worksheet.addRow({
        index: index + 1,
        donor: item.donor,
        amount: `${Number(item.amount).toLocaleString()} ກີບ`,
        dateTime: item.dateTime,
        paymentMethod: item.paymentMethod,
        message: item.message,
      });
    });

  } else if (reportType === "withdraw") {

    worksheet.columns = [
      { header: "ລຳດັບ", key: "index", width: 10 },
      { header: "ຈໍານວນທີ່ຮ້ອງຂໍ", key: "amount", width: 20 },
      { header: "ວັນທິຮ້ອງຂໍ", key: "requestedAt", width: 20 },
      { header: "ອັບເດດລ່າສຸດ", key: "processAt", width: 20 },
      { header: "ສະຖານະ", key: "status", width: 15 },
      { header: "ເລກທຸລະກຳ", key: "sendMoneyID", width: 20 },
      { header: "ໝາຍເຫດ", key: "adminNote", width: 30 },
    ];

    filteredSearchData.forEach((item, index) => {
      worksheet.addRow({
        index: index + 1,
        amount: `${Number(item.amount).toLocaleString()} ກີບ`,
        requestedAt: item.requestedAt,
        processAt: item.processAt,
        status: item.status,
        sendMoneyID: item.sendMoneyID,
        adminNote: item.adminNote,
      });
    });
  }


  workbook.xlsx.writeBuffer().then((buffer) => {
    const blob = new Blob(
      [buffer],
      { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" }
    );
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `${reportType}_report_${formattedDate}.xlsx`;
    link.click();
  });
};

export const exportToCSV = (filteredSearchData, reportType) => {
  const now = new Date();
  const formattedDate = now.toLocaleDateString("en-GB").split("/").join("-");

  let cleanedData = [];

  if (reportType === "donation") {
    cleanedData = filteredSearchData.map((item, index) => ({
      "ລຳດັບ": index + 1,
      "ຊື່": item.donor,
      "ຈຳນວນ": `${Number(item.amount).toLocaleString()} ກີບ`,
      "ວັນທີ": item.dateTime,
      "ທະນາຄານ": item.paymentMethod,
      "ຂໍ້ຄວາມ": item.message,
    }));
  } else if (reportType === "withdraw") {
    cleanedData = filteredSearchData.map((item, index) => ({
      "ລຳດັບ": index + 1,
      "ຈໍານວນທີ່ຮ້ອງຂໍ": `${Number(item.amount).toLocaleString()} ກີບ`,
      "ວັນທິຮ້ອງຂໍ": item.requestedAt,
      "ອັບເດດລ່າສຸດ": item.processAt,
      "ສະຖານະ": item.status,
      "ເລກທຸລະກຳ": item.sendMoneyID,
      "ໝາຍເຫດ": item.adminNote,
    }));
  }

  const csv = Papa.unparse(cleanedData);
  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${reportType}_report_${formattedDate}.csv`;
  a.click();
};

export const exportToPDF = (filteredSearchData, reportType) => {
  const doc = new jsPDF();

  registerNotoSansLao(doc);
  doc.addFont("NotoSansLao-Regular.ttf", "NotoSansLao-Regular", "normal");
  doc.setFont("NotoSansLao-Regular");

  const now = new Date();
  const formattedDate = now.toLocaleDateString("en-GB").split("/").join("-");

  let headers = [];
  let rows = [];

  if (reportType === "donation") {
    headers = ["ລຳດັບ", "ຊື່", "ຈຳນວນ", "ວັນທີ", "ທະນາຄານ", "ຂໍ້ຄວາມ"];
    rows = filteredSearchData.map((item, index) => [
      index + 1,
      item.donor || "",
      `${Number(item.amount).toLocaleString()} ກີບ`,
      item.dateTime || "",
      item.paymentMethod || "",
      item.message || "",
    ]);
  } else if (reportType === "withdraw") {
    headers = ["ລຳດັບ", "ຈໍານວນທີ່ຮ້ອງຂໍ", "ວັນທິຮ້ອງຂໍ", "ອັບເດດລ່າສຸດ", "ສະຖານະ", "ເລກທຸລະກຳ", "ໝາຍເຫດ"];
    rows = filteredSearchData.map((item, index) => [
      index + 1,
      `${Number(item.amount).toLocaleString()} ກີບ`,
      item.requestedAt || "",
      item.processAt || "",
      item.status || "",
      item.sendMoneyID || "",
      item.adminNote || "",
    ]);

  }

  doc.setFontSize(16);
  doc.text("ລາຍງານຂໍ້ມູນ", 14, 20);

  autoTable(doc, {
    startY: 30,
    head: [headers],
    body: rows,
    styles: {
      font: "NotoSansLao-Regular",
      fontSize: 10,
      fontStyle: "normal",
    },
    headStyles: {
      fillColor: [220, 220, 220],
      fontStyle: "normal",
    },
    margin: { left: 14, right: 14 },
  });



  doc.save(`${reportType}_report_${formattedDate}.pdf`);
};

export const exportToExcelAdmin = (filteredSearchData, reportType) => {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet("Report");

  const now = new Date();
  const formattedDate = now.toLocaleDateString("en-GB").split("/").join("-");

  if (reportType === "user") {

    worksheet.columns = [
      { header: "ລຳດັບ", key: "index", width: 10 },
      { header: "ຊື່", key: "firstname", width: 20 },
      { header: "ນາມສະກຸນ", key: "lastname", width: 15 },
      { header: "ຊຶ່ຜູ້ໃຊ້", key: "username", width: 20 },
      { header: "ສິດ", key: "role", width: 20 },
      { header: "ອັບເດດລ່າສຸດ", key: "timestamps", width: 30 },
    ];

    filteredSearchData.forEach((item, index) => {
      worksheet.addRow({
        index: index + 1,
        firstname: item.firstname,
        lastname: item.lastname,
        username: item.username,
        role: item.role,
        timestamps: item.timestamps,
      });
    });

  } else if (reportType === "donation") {

    worksheet.columns = [
      { header: "ລຳດັບ", key: "index", width: 10 },
      { header: "ຊື່", key: "username", width: 20 },
      { header: "ຄົນໂດເນດ", key: "donor", width: 20 },
      { header: "ຈຳນວນ", key: "amount", width: 20 },
      { header: "ວັນທີ", key: "dateTime", width: 15 },
      { header: "ທະນາຄານ", key: "paymentMethod", width: 20 },
      { header: "ເລກທຸລະກຳ", key: "transactionId", width: 30 },
    ];

    filteredSearchData.forEach((item, index) => {
      worksheet.addRow({
        index: index + 1,
        username: item.receiverID.username,
        donor: item.donor,
        amount: `${Number(item.amount).toLocaleString()} ກີບ`,
        dateTime: item.dateTime,
        paymentMethod: item.paymentMethod,
        transactionId: item.transactionId,
      });
    });
  }
  else if (reportType === "verifyRequest") {

    worksheet.columns = [
      { header: "ລຳດັບ", key: "index", width: 10 },
      { header: "ຊື່", key: "firstname", width: 20 },
      { header: "ນາມສະກຸນ", key: "lastname", width: 20 },
      { header: "ອັບເດດລ່າສຸດ", key: "timestamps", width: 20 },
      { header: "ຊື່ທະນາຄານ", key: "bankName", width: 15 },
      { header: "ຊື່ບັນຊີ", key: "accountName", width: 20 },
      { header: "ເລກບັນຊີ", key: "accountNumber", width: 30 },
      { header: "ປະເພດເອກະສານຢັ້ງຢືນ", key: "cardType", width: 20 },
      { header: "ສະຖານະ", key: "status", width: 10 },
    ];

    filteredSearchData.forEach((item, index) => {
      worksheet.addRow({
        index: index + 1,
        firstname: item.firstname,
        lastname: item.lastname,
        timestamps: item.timestamps,
        bankName: item.bankName,
        accountName: item.accountName,
        accountNumber: item.accountNumber,
        cardType: item.cardType,
        status: item.status,
      });
    });
  }
  else if (reportType === "withdraw") {

    worksheet.columns = [
      { header: "ລຳດັບ", key: "index", width: 10 },
      { header: "ຊື່", key: "username", width: 20 },
      { header: "ຈໍານວນທີ່ຮ້ອງຂໍ", key: "amount", width: 20 },
      { header: "ວັນທິຮ້ອງຂໍ", key: "requestedAt", width: 20 },
      { header: "ອັບເດດລ່າສຸດ", key: "processAt", width: 20 },
      { header: "ສະຖານະ", key: "status", width: 15 },
      { header: "ເລກທຸລະກຳ", key: "sendMoneyID", width: 20 },
      { header: "ໝາຍເຫດ", key: "adminNote", width: 30 },
    ];

    filteredSearchData.forEach((item, index) => {
      worksheet.addRow({
        index: index + 1,
        username: item.userID.username,
        amount: `${Number(item.amount).toLocaleString()} ກີບ`,
        requestedAt: item.requestedAt,
        processAt: item.processAt,
        status: item.status,
        sendMoneyID: item.sendMoneyID,
        adminNote: item.adminNote,
      });
    });
  }


  workbook.xlsx.writeBuffer().then((buffer) => {
    const blob = new Blob(
      [buffer],
      { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" }
    );
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `${reportType}_report_${formattedDate}.xlsx`;
    link.click();
  });
};

export const exportToCSVAdmin = (filteredSearchData, reportType) => {
  const now = new Date();
  const formattedDate = now.toLocaleDateString("en-GB").split("/").join("-");

  let cleanedData = [];

  if (reportType === "user") {
    cleanedData = filteredSearchData.map((item, index) => ({
      "ລຳດັບ": index + 1,
      "ຊື່": item.firstname,
      "ນາມສະກຸນ": item.lastname,
      "ຊຶ່ຜູ້ໃຊ້": item.username,
      "ສິດ": item.role,
      "ອັບເດດລ່າສຸດ": item.timestamps,
    }));
  }

  else if (reportType === "donation") {
    cleanedData = filteredSearchData.map((item, index) => ({
      "ລຳດັບ": index + 1,
      "ຊື່": item.receiverID.username,
      "ຄົນໂດເນດ": item.donor,
      "ຈຳນວນ": `${Number(item.amount).toLocaleString()} ກີບ`,
      "ວັນທີ": item.dateTime,
      "ທະນາຄານ": item.paymentMethod,
      "ເລກທຸລະກຳ": item.transactionId,
    }));
  }

  else if (reportType === "verifyRequest") {
    cleanedData = filteredSearchData.map((item, index) => ({
      "ລຳດັບ": index + 1,
      "ຊື່": item.firstname,
      "ນາມສະກຸນ": item.lastname,
      "ອັບເດດລ່າສຸດ": item.timestamps,
      "ຊື່ທະນາຄານ": item.bankName,
      "ຊື່ບັນຊີ": item.accountName,
      "ເລກບັນຊີ": item.accountNumber,
      "ປະເພດເອກະສານຢັ້ງຢືນ": item.cardType,
      "ສະຖານະ": item.status,
    }));
  }

  else if (reportType === "withdraw") {
    cleanedData = filteredSearchData.map((item, index) => ({
      "ລຳດັບ": index + 1,
      "ຊື່": item.userID.username,
      "ຈໍານວນທີ່ຮ້ອງຂໍ": `${Number(item.amount).toLocaleString()} ກີບ`,
      "ວັນທິຮ້ອງຂໍ": item.requestedAt,
      "ອັບເດດລ່າສຸດ": item.processAt,
      "ສະຖານະ": item.status,
      "ເລກທຸລະກຳ": item.sendMoneyID,
      "ໝາຍເຫດ": item.adminNote,
    }));
  }

  const csv = Papa.unparse(cleanedData);
  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${reportType}_report_${formattedDate}.csv`;
  a.click();
};

export const exportToPDFAdmin = (filteredSearchData, reportType) => {
  const doc = new jsPDF();

  registerNotoSansLao(doc);
  doc.addFont("NotoSansLao-Regular.ttf", "NotoSansLao-Regular", "normal");
  doc.setFont("NotoSansLao-Regular");

  const now = new Date();
  const formattedDate = now.toLocaleDateString("en-GB").split("/").join("-");

  let headers = [];
  let rows = [];

  if (reportType === "user") {
    headers = ["ລຳດັບ", "ຊື່", "ນາມສະກຸນ", "ຊຶ່ຜູ້ໃຊ້", "ສິດ", "ອັບເດດລ່າສຸດ"];
    rows = filteredSearchData.map((item, index) => [
      index + 1,
      item.firstname || "",
      item.lastname || "",
      item.username || "",
      item.role || "",
      item.timestamps || "",
    ]);
  }

  else if (reportType === "donation") {
    headers = ["ລຳດັບ", "ຊື່", "ຄົນໂດເນດ", "ຈຳນວນ", "ວັນທີ", "ທະນາຄານ", "ເລກທຸລະກຳ"];
    rows = filteredSearchData.map((item, index) => [
      index + 1,
      item.receiverID.username || "",
      item.donor || "",
      `${Number(item.amount).toLocaleString()} ກີບ`,
      item.dateTime || "",
      item.paymentMethod || "",
      item.transactionId || "",
    ]);
  }

  else if (reportType === "verifyRequest") {
    headers = ["ລຳດັບ", "ຊື່", "ນາມສະກຸນ", "ອັບເດດລ່າສຸດ", "ຊື່ທະນາຄານ", "ຊື່ບັນຊີ", "ເລກບັນຊີ", "ປະເພດເອກະສານ", "ສະຖານະ"];
    rows = filteredSearchData.map((item, index) => [
      index + 1,
      item.firstname || "",
      item.lastname || "",
      item.timestamps || "",
      item.bankName || "",
      item.accountName || "",
      item.accountNumber || "",
      item.cardType || "",
      item.status || "",
    ]);
  }

  else if (reportType === "withdraw") {
    headers = ["ລຳດັບ", "ຊື່", "ຈໍານວນທີ່ຮ້ອງຂໍ", "ວັນທິຮ້ອງຂໍ", "ອັບເດດລ່າສຸດ", "ສະຖານະ", "ເລກທຸລະກຳ", "ໝາຍເຫດ"];
    rows = filteredSearchData.map((item, index) => [
      index + 1,
      item.userID.username || "",
      `${Number(item.amount).toLocaleString()} ກີບ`,
      item.requestedAt || "",
      item.processAt || "",
      item.status || "",
      item.sendMoneyID || "",
      item.adminNote || "",
    ]);
  }

  autoTable(doc, {
    head: [headers],
    body: rows,
    styles: {
      fontSize: 9,
      fontStyle: "normal",
    },
    headStyles: {
      fillColor: [220, 220, 220],
      textColor: [0, 0, 0],
      fontStyle: "normal",     
    },
    margin: { left: 14, right: 14 },

    didParseCell: function (data) {
      const text = data.cell.text.join('');
      const laoRegex = /[\u0E80-\u0EFF]/;

      if (laoRegex.test(text)) {
        data.cell.styles.font = "NotoSansLao-Regular";
      } else {
        data.cell.styles.font = "helvetica";
      }
    }
  });




  doc.save(`${reportType}_report_${formattedDate}.pdf`);
};


