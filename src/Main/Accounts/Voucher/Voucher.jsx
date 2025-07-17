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
  getAllVoucherType,
  getLedgerById,
} from "../../../Toolkit/Slices/AccountSlice";
import CreateVoucher from "./CreateVoucher";
const { Text } = Typography;

const Voucher = () => {
  const dispatch = useDispatch();
  const voucherList = useSelector((state) => state.account.voucherList);
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
    dispatch(getAllLedger());
    dispatch(getAllVoucher());
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
      render: (info) => (info ? info : "NA"),
    },
    {
      dataIndex: "debitAmount",
      title: "Debit amount",
      render: (info) => (info ? info : "NA"),
    },
    {
      dataIndex: "sgst",
      title: "Sgst",
      render: (info) => (info ? info : "NA"),
    },
    {
      dataIndex: "cgst",
      title: "Cgst",
      render: (info) => (info ? info : "NA"),
    },
    {
      dataIndex: "igst",
      title: "Igst",
      render: (info) => (info ? info : "NA"),
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
          <Button
            type="primary"
            onClick={() => {
              setOpenModal(true);
            }}
          >
            Create voucher
          </Button>
        </Flex>
        <CommonTable
          data={filteredData}
          columns={columns}
          scroll={{ y: "70vh" }}
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
