import { Col, Flex, InputNumber, Row, Select, Typography } from "antd";
import React, { useEffect, useState } from "react";
import "../Accounts.scss";
import { getLedgerById } from "../../../Toolkit/Slices/AccountSlice";
import { useDispatch, useSelector } from "react-redux";
const { Text } = Typography;

const CreateVoucher = ({
  setVoucherData,
  voucherData,
  setRenderedGstData,
  renderedGSTData,
}) => {
  const dispatch = useDispatch();
  const ledgerList = useSelector((state) => state.account.ledgerList);
  const voucherTypeList = useSelector((state) => state.account.voucherTypeList);
  const ledgerDetail = useSelector((state) => state.account.ledgerDetail);

  const handlePressEnter = (e) => {
    const creditCgstAmount =
      (voucherData?.creditAmount * ledgerDetail?.cgst) / 100;
    const creditSgstAmount =
      (voucherData?.creditAmount * ledgerDetail?.sgst) / 100;
    const creditIgstAmount =
      (voucherData?.creditAmount * ledgerDetail?.igst) / 100;
    const debitCgstAmount =
      (voucherData?.debitAmount * ledgerDetail?.cgst) / 100;
    const debitSgstAmount =
      (voucherData?.debitAmount * ledgerDetail?.sgst) / 100;
    const debitIgstAmount =
      (voucherData?.debitAmount * ledgerDetail?.igst) / 100;
    if (ledgerDetail?.cgstSgstPresent) {
      setRenderedGstData([
        {
          idx: 2,
          perticulars: "CGST",
          rate: ledgerDetail?.cgst,
          debitAmount: debitCgstAmount || 0,
          creditAmount: creditCgstAmount || 0,
        },
        {
          idx: 3,
          perticulars: "SGST",
          rate: ledgerDetail?.sgst,
          debitAmount: debitSgstAmount || 0,
          creditAmount: creditSgstAmount || 0,
        },
        {
          idx: "",
          perticulars: "Total amount",
          rate: "",
          debitAmount:
            debitCgstAmount + debitSgstAmount + voucherData?.debitAmount || 0,
          creditAmount:
            creditCgstAmount + creditSgstAmount + voucherData?.creditAmount ||
            0,
        },
      ]);
    }
    if (ledgerDetail?.igstPresent) {
      setRenderedGstData([
        {
          idx: 2,
          perticulars: "IGST",
          rate: ledgerDetail?.igst,
          debitAmount: debitIgstAmount === "" ? 0 : debitIgstAmount,
          creditAmount: creditIgstAmount === "" ? 0 : creditIgstAmount,
        },
        {
          idx: "",
          perticulars: "Total amount",
          rate: "",
          debitAmount:
            debitIgstAmount + voucherData?.debitAmount === ""
              ? 0
              : debitIgstAmount + voucherData?.debitAmount,
          creditAmount:
            creditIgstAmount + voucherData?.creditAmount === ""
              ? 0
              : creditIgstAmount + voucherData?.creditAmount,
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

  console.log("dsjhjdgjdg", voucherData);

  return (
    <>
      <Flex vertical gap={12} style={{ height: "80vh", overflow: "auto" }}>
        <Flex gap={12}>
          <Select
            placeholder="Select voucher type"
            options={
              voucherTypeList?.length > 0
                ? voucherTypeList?.map((item) => ({
                    label: item?.name,
                    value: item?.id,
                  }))
                : []
            }
            value={voucherData?.voucherTypeId}
            filterOption={(input, option) =>
              option.label.toLowerCase().includes(input.toLowerCase())
            }
            onChange={(e) =>
              setVoucherData((prev) => ({ ...prev, voucherTypeId: e }))
            }
            style={{ width: "25%" }}
          />{" "}
          <Select
            placeholder="Select ledger"
            options={
              ledgerList?.length > 0
                ? ledgerList?.map((item) => ({
                    label: item?.name,
                    value: item?.id,
                  }))
                : []
            }
            value={voucherData?.ledgerId}
            filterOption={(input, option) =>
              option.label.toLowerCase().includes(input.toLowerCase())
            }
            onChange={(e) => {
              dispatch(getLedgerById(e));
              setVoucherData((prev) => ({ ...prev, ledgerId: e }));
            }}
            style={{ width: "25%" }}
          />
          <Select
            placeholder="Payment type"
            style={{ width: "25%" }}
            value={voucherData?.paymentType}
            options={[
              { label: "Cash", value: "Cash" },
              { label: "UPI", value: "UPI" },
              { label: "NetBanking", value: "NetBanking" },
            ]}
            onChange={(e) => {
              setVoucherData((prev) => ({ ...prev, paymentType: e }));
            }}
          />
        </Flex>

        <Flex gap={8} align="center">
          <Text className="table-head-heading">Party A/C name</Text>{" "}
          <Text className="table-head-heading">:</Text>
          <Text strong>{ledgerDetail?.accountHolderName}</Text>
        </Flex>
        <Flex vertical>
          <Row
            style={{
              width: "100%",
              border: "1px solid black",
              padding: "2px 4px",
              borderRight: 0,
              borderLeft: 0,
            }}
          >
            <Col span={2}>
              <Text className="table-head-heading">S.No</Text>
            </Col>
            <Col span={13}>
              <Text className="table-head-heading">Perticulars</Text>
            </Col>
            <Col span={3}>
              <Text className="table-head-heading">Rate %</Text>
            </Col>
            <Col span={3}>
              <Text className="table-head-heading">Credit amount</Text>
            </Col>
            <Col span={3}>
              <Text className="table-head-heading">Debit amount</Text>
            </Col>
          </Row>
          <Row style={{ width: "100%", padding: "2px 4px", margin: "2px 0px" }}>
            <Col span={2}>
              <Text>1.</Text>
            </Col>
            <Col span={13}>
              <Select
                placeholder="Select ledger"
                size="small"
                variant="filled"
                options={
                  ledgerList?.length > 0
                    ? ledgerList?.map((item) => ({
                        label: item?.name,
                        value: item?.id,
                      }))
                    : []
                }
                value={voucherData?.productId}
                filterOption={(input, option) =>
                  option.label.toLowerCase().includes(input.toLowerCase())
                }
                onChange={(e) => {
                  setVoucherData((prev) => ({ ...prev, productId: e }));
                }}
                style={{ width: "70%" }}
              />
            </Col>
            <Col span={3}></Col>
            <Col span={3}>
              <InputNumber
                variant="filled"
                controls={false}
                size="small"
                style={{ width: "90%" }}
                value={voucherData?.creditAmount}
                onChange={(e) => {
                  setVoucherData((prev) => ({ ...prev, creditAmount: e }));
                }}
                onPressEnter={handlePressEnter}
              />
            </Col>
            <Col span={3}>
              <InputNumber
                variant="filled"
                style={{ width: "90%" }}
                size="small"
                controls={false}
                value={voucherData?.debitAmount}
                onChange={(e) =>
                  setVoucherData((prev) => ({ ...prev, debitAmount: e }))
                }
                onPressEnter={handlePressEnter}
              />
            </Col>
          </Row>
          {renderedGSTData?.map((item, idx) => (
            <Row
              style={{
                width: "100%",
                padding: "2px 4px",
                margin: "2px 0px",
                borderTop:
                  renderedGSTData?.length - 1 === idx
                    ? "rgba(5, 5, 5, 0.06)"
                    : "",
              }}
            >
              <Col span={2}>
                <Text>{item?.idx}</Text>
              </Col>
              <Col span={13}>
                <Text
                  className={
                    idx === renderedGSTData?.length - 1
                      ? "table-head-heading"
                      : ""
                  }
                >
                  {item?.perticulars}
                </Text>
              </Col>
              <Col span={3} style={{ padding: "0px 8px" }}>
                <Text>{item?.rate} </Text>
              </Col>
              <Col span={3} style={{ padding: "0px 8px" }}>
                <Text
                  className={
                    idx === renderedGSTData?.length - 1
                      ? "table-head-heading"
                      : ""
                  }
                >
                  {item?.creditAmount}
                </Text>
              </Col>
              <Col span={3} style={{ padding: "0px 8px" }}>
                <Text
                  className={
                    idx === renderedGSTData?.length - 1
                      ? "table-head-heading"
                      : ""
                  }
                >
                  {item?.debitAmount}
                </Text>
              </Col>
            </Row>
          ))}
        </Flex>
      </Flex>
    </>
  );
};

export default CreateVoucher;
