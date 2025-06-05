import React, { useCallback, useEffect, useState } from "react";
import TableOutlet from "../../../components/design/TableOutlet";
import MainHeading from "../../../components/design/MainHeading";
import { Button, Form, Input, Modal, notification, Select } from "antd";
import { Icon } from "@iconify/react";
import TableScalaton from "../../../components/TableScalaton";
import SomethingWrong from "../../../components/usefulThings/SomethingWrong";
import CommonTable from "../../../components/CommonTable";
import { useDispatch, useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import {
  getAllProposalByUserIdForManager,
  getAllPropsalListCount,
  proposalApprovalByManager,
} from "../../../Toolkit/Slices/LeadSlice";
import dayjs from "dayjs";

const ProposalsPage = () => {
  const { userid } = useParams();
  const dispatch = useDispatch();
  const [form] = Form.useForm();
  const proposalList = useSelector((state) => state.leads.proposalList);
  const proposalLoading = useSelector((state) => state.leads.proposalLoading);
  const totalCount = useSelector((state) => state.leads.proposalCount);
  const [searchText, setSearchText] = useState("");
  const [filteredData, setFilteredData] = useState([]);
  const [proposalData, setProposalData] = useState("");
  const [openModal, setOpenModal] = useState(false);
  const [openApproveModal, setOpenApproveModal] = useState(false);
  const [data, setData] = useState(null);
  const [status, setStatus] = useState("all");
  const [paginationData, setPaginationData] = useState({
    page: 1,
    size: 50,
  });

  console.log("xchjbaksdvckshvskhv", proposalList);

  useEffect(() => {
    dispatch(
      getAllProposalByUserIdForManager({
        id: userid,
        ...paginationData,
        status,
      })
    );
    dispatch(getAllPropsalListCount(userid));
  }, [dispatch, userid]);

  const columns = [
    {
      dataIndex: "id",
      title: "Id",
      width: 80,
      fixed: "left",
    },
    {
      dataIndex: "productName",
      title: "Product name",
      fixed: "left",
    },
    {
      dataIndex: "createDate",
      title: "Created date",
      render: (_, data) => dayjs(data?.createDate).format("YYYY-MM-DD"),
    },
    {
      dataIndex: "createdByEmail",
      title: "Created person email",
    },
    {
      dataIndex: "status",
      title: "Status",
      render: (text) => text?.replace(/\b\w/g, (char) => char.toUpperCase()),
    },
    {
      dataIndex: "proposal",
      title: "Proposal",
      render: (_, data) => (
        <Button
          onClick={() => {
            setProposalData(data?.template);
            setOpenModal(true);
          }}
        >
          View proposal
        </Button>
      ),
    },
    {
      dataIndex: "action",
      title: "Action",
      render: (_, data) => (
        <Button
          onClick={() => {
            setData(data);
            setOpenApproveModal(true);
            form.setFieldsValue({ status: data?.status });
          }}
        >
          Action
        </Button>
      ),
    },
  ];

  useEffect(() => {
    setFilteredData(proposalList);
  }, [proposalList]);

  const handlePagination = useCallback(
    (dataPage, size) => {
      dispatch(
        getAllProposalByUserIdForManager({
          id: userid,
          page: dataPage,
          size,
          status,
        })
      );
      setPaginationData({ size: size, page: dataPage });
    },
    [dispatch, userid, status]
  );

  const handleSearch = (e) => {
    const value = e.target.value;
    setSearchText(value);
    const filtered = proposalList?.filter((item) =>
      Object.values(item)?.some((val) =>
        String(val)?.toLowerCase()?.includes(value?.toLowerCase())
      )
    );
    setFilteredData(filtered);
  };

  const handleFinish = (values) => {
    dispatch(
      proposalApprovalByManager({
        proposalId: data?.id,
        userId: userid,
        ...values,
      })
    )
      .then((resp) => {
        if (resp.meta.requestStatus === "fulfilled") {
          if (values.status === "approved") {
            notification.success({
              message: "Proposal approved suucessfully !.",
            });
          } else {
            notification.success({
              message: "Proposal disapproved suucessfully !.",
            });
          }
          form.resetFields();
          setOpenApproveModal(false);
          setData(null);
          dispatch(
            getAllProposalByUserIdForManager({
              id: userid,
              ...paginationData,
              status,
            })
          );
        } else {
          notification.error({ message: "Something went wrong !." });
        }
      })
      .catch(() => notification.error({ message: "Something went wrong !." }));
  };

  return (
    <TableOutlet>
      <MainHeading data={`All proposal`} />
      <div style={{ margin: "8px 0px", display: "flex", gap: "12px" }}>
        <Input
          value={searchText}
          size="small"
          onChange={handleSearch}
          style={{ width: "25%" }}
          placeholder="search"
          prefix={<Icon icon="fluent:search-24-regular" />}
        />
        <Select
          style={{ width: "20%" }}
          value={status}
          options={[
            { label: "All", value: "all" },
            { label: "Approved", value: "approved" },
            { label: "Disapproved", value: "disapproved" },
          ]}
          onChange={(e) => {
            setStatus(e);
            dispatch(
              getAllProposalByUserIdForManager({
                id: userid,
                ...paginationData,
                status: e,
              })
            );
          }}
        />
      </div>
      <div className="mt-3">
        {proposalLoading === "pending" && <TableScalaton />}
        {proposalLoading === "rejected" && <SomethingWrong />}
        {proposalList && proposalLoading === "success" && (
          <CommonTable
            data={filteredData}
            rowKey={(row) => row?.id}
            columns={columns}
            scroll={{ y: 500 }}
            page={paginationData?.page}
            pageSize={paginationData?.size}
            pagination={true}
            totalCount={totalCount}
            handlePagination={handlePagination}
          />
        )}
      </div>
      <Modal
        title="Proposal"
        width={"80%"}
        centered
        onCancel={() => setOpenModal(false)}
        open={openModal}
        onClose={() => setOpenModal(false)}
        footer={null}
      >
        <div
          dangerouslySetInnerHTML={{ __html: proposalData }}
          style={{ maxHeight: "70vh", overflow: "auto" }}
        />
      </Modal>

      <Modal
        title="Proposal status"
        open={openApproveModal}
        onCancel={() => setOpenApproveModal(false)}
        onClose={() => setOpenApproveModal(false)}
        onOk={() => form.submit()}
        okText="Submit"
      >
        <Form form={form} layout="vertical" onFinish={handleFinish}>
          <Form.Item
            label="Status"
            name="status"
            rules={[{ required: true, message: "please select the status" }]}
          >
            <Select
              options={[
                { label: "Approved", value: "approved" },
                { label: "Disapproved", value: "disapproved" },
              ]}
            />
          </Form.Item>
          <Form.Item
            label="Comment"
            name="comment"
            rules={[{ required: true, message: "please give comment" }]}
          >
            <Input.TextArea />
          </Form.Item>
        </Form>
      </Modal>
    </TableOutlet>
  );
};

export default ProposalsPage;
