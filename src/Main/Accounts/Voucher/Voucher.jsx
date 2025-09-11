import { Button, Flex, Input, Modal, notification, Typography } from "antd";
import React, { useCallback, useEffect, useState } from "react";
import "../Accounts.scss";
import { useDispatch, useSelector } from "react-redux";
import { Icon } from "@iconify/react";
import CommonTable from "../../../components/CommonTable";
import {
  createVoucher,
  getAllLedger,
  getAllVoucher,
  getAllVouchersForExport,
  getAllVoucherType,
  getLedgerById,
} from "../../../Toolkit/Slices/AccountSlice";
import CreateVoucher from "./CreateVoucher";
import { CSVLink } from "react-csv";
import { BTN_ICON_HEIGHT, BTN_ICON_WIDTH } from "../../../components/Constants";
import dayjs from "dayjs";
const { Text } = Typography;

const Voucher = () => {
  const dispatch = useDispatch();
  const voucherList = useSelector((state) => state.account.voucherList);
  const voucherListForExport = useSelector(
    (state) => state.account.voucherListForExport
  );
  const [searchText, setSearchText] = useState("");
  const [filteredData, setFilteredData] = useState([]);
  const [openModal, setOpenModal] = useState(false);
  const [editData, setEditData] = useState(null);
  const [renderedGSTData, setRenderedGstData] = useState([]);
  const [voucherData, setVoucherData] = useState({
    companyName: "",
    ledgerId: null,
    ledgerTypeId: null,
    voucherTypeId: null,
    productId: null,
    creditAmount: "",
    debitAmount: "",
    createDate: "",
    paymentType: null,
    igst: "",
    cgst: "",
    sgst: "",
    cgstsgst: false,
    creditDebit: true,
  });

  useEffect(() => {
    dispatch(getAllVoucherType());
    dispatch(getAllLedger({ page: 1, size: 100 }));
    dispatch(getAllVoucher());
    dispatch(getAllVouchersForExport());
  }, [dispatch]);

  useEffect(() => {
    setFilteredData(voucherList);
  }, [voucherList]);

  const handleSetGst = (ledgerDetail, voucherData) => {
    console.log("asdkjsdbkjdsahb", ledgerDetail, voucherData);
    const creditCgstAmount =
      (Number(voucherData?.creditAmount) * Number(ledgerDetail?.cgst)) / 100;
    const creditSgstAmount =
      (Number(voucherData?.creditAmount) * Number(ledgerDetail?.sgst)) / 100;
    const creditIgstAmount =
      (Number(voucherData?.creditAmount) * Number(ledgerDetail?.igst)) / 100;
    const debitCgstAmount =
      (Number(voucherData?.debitAmount) * Number(ledgerDetail?.cgst)) / 100;
    const debitSgstAmount =
      (Number(voucherData?.debitAmount) * Number(ledgerDetail?.sgst)) / 100;
    const debitIgstAmount =
      (Number(voucherData?.debitAmount) * Number(ledgerDetail?.igst)) / 100;
    if (ledgerDetail?.cgstSgstPresent) {
      setRenderedGstData([
        {
          idx: 2,
          perticulars: "CGST",
          rate: ledgerDetail?.cgst,
          debitAmount: debitCgstAmount,
          creditAmount: creditCgstAmount,
        },
        {
          idx: 3,
          perticulars: "SGST",
          rate: ledgerDetail?.sgst,
          debitAmount: debitSgstAmount,
          creditAmount: creditSgstAmount,
        },
        {
          idx: "",
          perticulars: "Total amount",
          rate: "",
          debitAmount:
            debitCgstAmount +
            debitSgstAmount +
            Number(voucherData?.debitAmount),
          creditAmount:
            creditCgstAmount +
            creditSgstAmount +
            Number(voucherData?.creditAmount),
        },
      ]);
    }
    if (ledgerDetail?.igstPresent) {
      setRenderedGstData([
        {
          idx: 2,
          perticulars: "IGST",
          rate: ledgerDetail?.igst,
          debitAmount: debitIgstAmount,
          creditAmount: creditIgstAmount,
        },
        {
          idx: "",
          perticulars: "Total amount",
          rate: "",
          debitAmount: debitIgstAmount + Number(voucherData?.debitAmount),
          creditAmount: creditIgstAmount + Number(voucherData?.creditAmount),
        },
      ]);
    }
    setVoucherData((prev) => ({
      ...prev,
      companyName: ledgerDetail?.name,
      igst: ledgerDetail?.igst,
      sgst: ledgerDetail?.sgst,
      cgst: ledgerDetail?.sgst,
    }));
  };

  const handleEditVoucher = (value) => {
    setEditData(value);
    setOpenModal(true);
    dispatch(getLedgerById(value?.productId)).then((resp) => {
      if (resp.meta.requestStatus === "fulfilled") {
        handleSetGst(resp.payload, { ...voucherData, ...value });
      }
    });
    setVoucherData((prev) => ({ ...prev, ...value }));
  };

  const handleSearch = (e) => {
    const value = e.target.value;
    setSearchText(value);
    const filtered = voucherList?.filter((item) =>
      Object.values(item)?.some((val) =>
        String(val)?.toLowerCase()?.includes(value?.toLowerCase())
      )
    );
    setFilteredData(filtered);
  };

  const handleSubmit = useCallback(() => {
    dispatch(
      createVoucher({
        ...voucherData,
        igstCreditAmount:
          renderedGSTData?.[0]?.perticulars === "IGST"
            ? renderedGSTData?.[0]?.creditAmount
            : 0,
        igstDebitAmount:
          renderedGSTData?.[0]?.perticulars === "IGST"
            ? renderedGSTData?.[0]?.debitAmount
            : 0,
        cgstCreditAmount:
          renderedGSTData?.[0]?.perticulars === "CGST"
            ? renderedGSTData?.[0]?.creditAmount
            : 0,
        cgstDebitAmount:
          renderedGSTData?.[0]?.perticulars === "CGST"
            ? renderedGSTData?.[0]?.debitAmount
            : 0,
        sgstCreditAmount:
          renderedGSTData?.[1]?.perticulars === "SGST"
            ? renderedGSTData?.[1]?.creditAmount
            : 0,
        sgstDebitAmount:
          renderedGSTData?.[1]?.perticulars === "SGST"
            ? renderedGSTData?.[1]?.debitAmount
            : 0,
        totalAmount:
          renderedGSTData?.[1]?.perticulars === "Total amount"
            ? renderedGSTData?.[1]?.creditAmount -
              renderedGSTData?.[1]?.debitAmount
            : 0 || renderedGSTData?.[2]?.perticulars === "Total amount"
            ? renderedGSTData?.[2]?.creditAmount -
              renderedGSTData?.[2]?.debitAmount
            : 0,
      })
    )
      .then((resp) => {
        if (resp.meta.requestStatus === "fulfilled") {
          notification.success({ message: "Voucher created successfully !." });
          dispatch(getAllVoucher());
          setOpenModal(false);
          setRenderedGstData([]);
          setVoucherData({
            companyName: "",
            ledgerId: null,
            ledgerTypeId: null,
            voucherTypeId: null,
            productId: null,
            creditAmount: 0,
            debitAmount: 0,
            createDate: 0,
            paymentType: null,
            igst: "",
            cgst: "",
            sgst: "",
            cgstsgst: false,
            creditDebit: true,
          });
        } else {
          notification.error({ message: "Something went wrong !." });
        }
      })
      .catch(() => notification.error({ message: "Something went wrong !." }));
  }, [dispatch, voucherData, renderedGSTData]);

  const columns = [
    {
      dataIndex: "id",
      title: "Id",
      width: 80,
    },
    {
      dataIndex: "ledgerName",
      title: "Ledger",
    },
    {
      dataIndex: "voucherType",
      title: "Voucher type",
      render: (info) => <Text>{info?.name}</Text>,
    },
    {
      dataIndex: "creditAmount",
      title: "Credit amount",
      render: (info) => (info ? info : "0"),
    },
    {
      dataIndex: "debitAmount",
      title: "Debit amount",
      render: (info) => (info ? info : "0"),
    },
    {
      dataIndex: "sgst",
      title: "Sgst",
      render: (info) => (info ? info : "0"),
    },
    {
      dataIndex: "cgst",
      title: "Cgst",
      render: (info) => (info ? info : "0"),
    },
    {
      dataIndex: "igst",
      title: "Igst",
      render: (info) => (info ? info : "0"),
    },
    {
      dataIndex: "totalAmount",
      title: "Total amount",
      render: (info) => (info ? info : "0"),
    },
    {
      dataIndex: "paymentType",
      title: "Payment type",
    },
    {
      dataIndex: "product",
      title: "Product",
    },
    {
      dataIndex: "edit",
      title: "Edit",
      render: (_, data) => (
        <Button size="small" onClick={() => handleEditVoucher(data)}>
          Edit
        </Button>
      ),
    },
  ];

  const exportData = voucherListForExport?.map((row) => ({
    Id: row?.id,
    Ledger: row?.ledgerName,
    "Ledger type": row?.ledgerType?.name,
    "Voucher type": row?.voucherType?.name,
    Group: row?.group,
    "Credit amount": row?.creditAmount,
    "Debit amount": row?.debitAmount,
    SGST: row?.sgst,
    "SGST Credit amount": row?.sgstCreditAmount,
    "SGST Debit amount": row?.sgstDebitAmount,
    CGST: row?.cgst,
    "CGST Credit amount": row?.cgstCreditAmount,
    "CGST Debit amount": row?.cgstDebitAmount,
    IGST: row?.igst,
    "IGST Credit amount": row?.igstCreditAmount,
    "IGST Debit amount": row?.igstDebitAmount,
    "Payment type": row?.paymentType,
    Product: row?.product,
    "Total amount": row?.totalAmount,
    Date: dayjs(row?.createDate).format("DD-MM-YYYY"),
  }));

  const headers = [
    "Id",
    "Ledger",
    "Ledger type",
    "Voucher type",
    "Group",
    "Credit amount",
    "Debit amount",
    "SGST",
    "SGST Credit amount",
    "SGST Debit amount",
    "CGST",
    "CGST Credit amount",
    "CGST Debit amount",
    "IGST",
    "IGST Credit amount",
    "IGST Debit amount",
    "Payment type",
    "Product",
    "Total amount",
    "Date",
  ];

  return (
    <>
      <Flex vertical gap={12}>
        <Flex className="vouchers-header">
          <Text className="heading-text">Voucher</Text>
        </Flex>

        <Flex
          justify="space-between"
          align="center"
          className="vouchers-header"
        >
          <Input
            prefix={<Icon icon="fluent:search-24-regular" />}
            value={searchText}
            size="small"
            onChange={handleSearch}
            placeholder="search"
            style={{ width: "25%" }}
          />
          <Flex gap={6}>
            <CSVLink
              className="text-white"
              data={exportData}
              headers={headers}
              filename={"voucher.csv"}
            >
              <Button>
                <Icon
                  icon="fluent:arrow-upload-16-filled"
                  height={BTN_ICON_HEIGHT}
                  width={BTN_ICON_WIDTH}
                />{" "}
                Export
              </Button>
            </CSVLink>
            <Button
              type="primary"
              onClick={() => {
                setOpenModal(true);
              }}
            >
              Create voucher
            </Button>
          </Flex>
        </Flex>
        <CommonTable
          data={filteredData}
          columns={columns}
          scroll={{ y: "70vh", x: 1500 }}
        />
      </Flex>
      <Modal
        title={editData ? "Edit voucher" : "Create voucher"}
        open={openModal}
        centered
        width={"80%"}
        onCancel={() => setOpenModal(false)}
        onClose={() => setOpenModal(false)}
        okText="Submit"
        onOk={handleSubmit}
      >
        <CreateVoucher
          setVoucherData={setVoucherData}
          voucherData={voucherData}
          setRenderedGstData={setRenderedGstData}
          renderedGSTData={renderedGSTData}
        />
      </Modal>
    </>
  );
};

export default Voucher;
