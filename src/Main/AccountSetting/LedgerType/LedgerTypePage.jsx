import {
  Button,
  Flex,
  Form,
  Input,
  Modal,
  notification,
  Select,
  Typography,
} from "antd";
import React, { useEffect, useState } from "react";
import { Icon } from "@iconify/react";
import { useDispatch, useSelector } from "react-redux";
import {
  createLedgerType,
  getAllLedgerType,
  updateLedgerType,
} from "../../../Toolkit/Slices/AccountSlice";
import CommonTable from "../../../components/CommonTable";
const { Text } = Typography;

const LedgerTypePage = () => {
  const [form] = Form.useForm();
  const dispatch = useDispatch();
  const ledgerTypeList = useSelector((state) => state.account.ledgerTypeList);
  const ledgerGroupList = useSelector((state) => state.account.ledgerTypeList);
  const [openModal, setOpenModal] = useState(false);
  const [editData, setEditData] = useState(null);
  const [searchText, setSearchText] = useState("");
  const [filteredData, setFilteredData] = useState([]);

  useEffect(() => {
    dispatch(getAllLedgerType());
  }, [dispatch]);

  useEffect(() => {
    setFilteredData(ledgerTypeList);
  }, [ledgerTypeList]);

  const handleSearch = (e) => {
    const value = e.target.value?.trim();
    setSearchText(value);
    const filtered = ledgerTypeList?.filter((item) =>
      Object.values(item)?.some((val) =>
        String(val)?.toLowerCase()?.includes(value?.toLowerCase())
      )
    );
    setFilteredData(filtered);
  };

  const handleEdit = (value) => {
    form.setFieldsValue({
      name: value?.name,
      usedForCalculation: value?.usedForCalculation,
      isDebitCredit: value?.debitCredit,
      subLeadger: value?.subLeadger,
      id: value?.ledgerType,
    });
    setOpenModal(true);
    setEditData(value);
  };

  const handleFinish = (values) => {
    if (editData) {
      dispatch(updateLedgerType({ ...values, id: editData?.id }))
        .then((resp) => {
          if (resp.meta.requestStatus === "fulfilled") {
            notification.success({
              message: "Ledger type updated successfully !.",
            });
            setOpenModal(false);
            dispatch(getAllLedgerType());
            form.resetFields();
            setEditData(null);
          } else {
            notification.error({ message: "Something went wrong !." });
          }
        })
        .catch(() =>
          notification.error({ message: "Something went wrong !." })
        );
    } else {
      dispatch(createLedgerType(values))
        .then((resp) => {
          if (resp.meta.requestStatus === "fulfilled") {
            notification.success({
              message: "Ledger type created successfully",
            });
            setOpenModal(false);
            dispatch(getAllLedgerType());
            form.resetFields();
          } else {
            notification.error({ message: "Something went wrong !." });
          }
        })
        .catch(() =>
          notification.error({ message: "Something went wrong !." })
        );
    }
  };

  const columns = [
    {
      dataIndex: "id",
      title: "Id",
      width: 100,
    },
    {
      dataIndex: "name",
      title: "Name",
    },
    {
      dataIndex: "debitCredit",
      title: "Debit credit",
      render: (_, data) =>
        data?.debitCredit ? <Text>True</Text> : <Text>False</Text>,
    },
    {
      dataIndex: "usedForCalculation",
      title: "Used for calculation",
      render: (_, data) =>
        data?.usedForCalculation ? <Text>True</Text> : <Text>False</Text>,
    },
    {
      dataIndex: "subLeadger",
      title: "Sub ledger",
      render: (_, data) =>
        data?.subLeadger ? <Text>True</Text> : <Text>False</Text>,
    },
    {
      dataIndex: "edit",
      title: "Edit",
      render: (_, data) => (
        <Button type="text" size="small" onClick={() => handleEdit(data)}>
          <Icon icon="fluent:edit-16-regular" /> Edit
        </Button>
      ),
    },
  ];

  return (
    <>
      <Flex vertical>
        <Flex className="vouchers-header">
          <Text className="heading-text">Group list</Text>
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
            style={{ width: "30%" }}
          />
          <Button type="primary" onClick={() => setOpenModal(true)}>
            Add group
          </Button>
        </Flex>
        <CommonTable
          data={filteredData}
          columns={columns}
          scroll={{ y: "70vh" }}
        />
      </Flex>
      <Modal
        title={editData ? "Edit group" : "Create group"}
        open={openModal}
        onCancel={() => setOpenModal(false)}
        onClose={() => setOpenModal(false)}
        onOk={() => form.submit()}
        okText="Submit"
      >
        <Form layout="vertical" form={form} onFinish={handleFinish}>
          <Form.Item
            label="Group name"
            name="name"
            rules={[{ required: true, message: "please enter ledger name" }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            label="Ledger group"
            name="id"
            rules={[{ required: true, message: "please select ledger group" }]}
          >
            <Select
              showSearch
              options={[
                { label: "Primary", value: 0 },
                ...(ledgerGroupList?.length > 0
                  ? ledgerGroupList?.map((item) => ({
                      label: item?.name,
                      value: item?.id,
                    }))
                  : []),
              ]}
              filterOption={(input, option) =>
                option.label.toLowerCase().includes(input.toLowerCase())
              }
            />
          </Form.Item>
          <Form.Item
            label="Sub ledger"
            name="subLeadger"
            rules={[{ required: true, message: "please select sub ledger" }]}
          >
            <Select
              options={[
                { label: "True", value: true },
                { label: "False", value: false },
              ]}
            />
          </Form.Item>
          <Form.Item
            label="Debit credit"
            name="isDebitCredit"
            rules={[{ required: true, message: "please select debit credit" }]}
          >
            <Select
              options={[
                { label: "True", value: true },
                { label: "False", value: false },
              ]}
            />
          </Form.Item>
          <Form.Item
            label="For calculation"
            name="usedForCalculation"
            rules={[{ required: true, message: "please select calculation" }]}
          >
            <Select
              options={[
                { label: "True", value: true },
                { label: "False", value: false },
              ]}
            />
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
};

export default LedgerTypePage;
