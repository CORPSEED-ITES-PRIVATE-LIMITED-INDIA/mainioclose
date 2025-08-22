import {
  Button,
  DatePicker,
  Flex,
  Form,
  Input,
  InputNumber,
  Modal,
  notification,
  Typography,
} from "antd";
import React, { useCallback, useEffect, useState } from "react";
import CommonTable from "../../../components/CommonTable";
import { Icon } from "@iconify/react";
import { useDispatch, useSelector } from "react-redux";
import {
  addBankDetails,
  getAllBankStatements,
} from "../../../Toolkit/Slices/AccountSlice";
import dayjs from "dayjs";
const { Text } = Typography;

const BankStatement = () => {
  const dispatch = useDispatch();
  const [form] = Form.useForm();
  const bankStatementList = useSelector(
    (state) => state.account.bankStatementList
  );
  const [searchText, setSearchText] = useState("");
  const [filteredData, setFilteredData] = useState([]);
  const [editData, setEditData] = useState(null);
  const [openModal, setOpenModal] = useState(false);

  useEffect(() => {
    dispatch(getAllBankStatements());
  }, [dispatch]);

  useEffect(() => {
    setFilteredData(bankStatementList);
  }, [bankStatementList]);

  const handleSearch = (e) => {
    const value = e.target.value?.trim();
    setSearchText(value);
    const filtered = bankStatementList?.filter((item) =>
      Object.values(item)?.some((val) =>
        String(val)?.toLowerCase()?.includes(value?.toLowerCase())
      )
    );
    setFilteredData(filtered);
  };



  const columns = [
    {
      dataIndex: "id",
      title: "Id",
      width: 80,
    },
    {
      dataIndex: "transaction",
      title: "Transaction id",
    },
    {
      dataIndex: "name",
      title: "Transaction name",
    },
    {
      dataIndex: "totalAmount",
      title: "Total amount",
    },
    {
      dataIndex: "leftAmount",
      title: "Left amount",
    },
    
    {
      dataIndex: "paymentDate",
      title: "Payment date",
      render: (data) => <Text>{dayjs(data).format("DD-MM-YYYY")}</Text>,
    },
  ];

  const handleSubmit = useCallback(
    (values) => {
      dispatch(addBankDetails(values))
        .then((resp) => {
          if (resp.meta.requestStatus === "fulfilled") {
            notification.success({
              message: "Voucher created successfully !.",
            });
            dispatch(getAllBankStatements());
            setOpenModal(false);
          } else {
            notification.error({ message: "Something went wrong !." });
          }
        })
        .catch(() =>
          notification.error({ message: "Something went wrong !." })
        );
    },
    [dispatch]
  );

  return (
    <>
      <Flex vertical gap={12}>
        <Flex className="vouchers-header">
          <Text className="heading-text">Bank statements</Text>
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
            Create statement
          </Button>
        </Flex>
        <CommonTable
          data={filteredData}
          columns={columns}
          scroll={{ y: "70vh" }}
        />
      </Flex>
      <Modal
        title={editData ? "Edit Bank details" : "Add bank details"}
        open={openModal}
        centered
        onCancel={() => setOpenModal(false)}
        onClose={() => setOpenModal(false)}
        okText="Submit"
        onOk={() => form.submit()}
      >
        <Form layout="vertical" onFinish={handleSubmit} form={form}>
          <Form.Item
            label="Transaction Id"
            name="transactionId"
            rules={[{ required: true, message: "please enter transaction id" }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            label="Transaction name"
            name="name"
            rules={[
              { required: true, message: "please enter transaction name" },
            ]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            label="Total amount"
            name="totalAmount"
            rules={[{ required: true, message: "please enter total amount" }]}
          >
            <InputNumber style={{ width: "100%" }} />
          </Form.Item>
          <Form.Item
            label="Left amount"
            name="leftAmount"
            rules={[{ required: true, message: "please enter left amount" }]}
          >
            <InputNumber style={{ width: "100%" }} />
          </Form.Item>
          <Form.Item
            label="Payment date"
            name="paymentDate"
            rules={[{ required: true, message: "please select payment date" }]}
          >
            <DatePicker style={{ width: "100%" }} />
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
};

export default BankStatement;
