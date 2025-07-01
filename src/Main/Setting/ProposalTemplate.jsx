import React, { useEffect, useRef, useState } from "react";
import TextEditor from "../Common/TextEditor";
import { Button, Flex, Input, Modal, notification, Typography } from "antd";
import { useDispatch, useSelector } from "react-redux";
import {
  createProposalTemplate,
  editProposalAndEmailTemplate,
  getAllProposalAndEmailTemplates,
} from "../../Toolkit/Slices/LeadSlice";
import CommonTable from "../../components/CommonTable";
import MainHeading from "../../components/design/MainHeading";
const { Text } = Typography;

const ProposalTemplate = () => {
  const dispatch = useDispatch();
  const editorInstanceRef = useRef(null);
  const dataList = useSelector((state) => state.leads.templateAndMailList);
  const [viewData, setViewData] = useState({ type: "", preView: "" });
  const [openModal, setOpenModal] = useState(false);
  const [createTemplate, setCreateTemplate] = useState(false);
  const [editData, setEditData] = useState(null);
  const [data, setData] = useState({
    name: "",
    description: "",
    body: "",
  });

  useEffect(() => {
    dispatch(getAllProposalAndEmailTemplates());
  }, [dispatch]);

  const columns = [
    {
      dataIndex: "id",
      title: "Id",
      width: 80,
    },
    {
      dataIndex: "name",
      title: "Name",
    },
    {
      dataIndex: "body",
      title: "E-mail body",
      render: (data) => (
        <Button
          size="small"
          type="text"
          onClick={() => {
            setViewData({ type: "E-mail body preview", preView: data });
            setOpenModal(true);
          }}
        >
          Preview
        </Button>
      ),
    },
    {
      dataIndex: "description",
      title: "Description",
      render: (data) => (
        <Button
          size="small"
          type="text"
          onClick={() => {
            setViewData({ type: "Template preview", preView: data });
            setOpenModal(true);
          }}
        >
          Preview
        </Button>
      ),
    },
    {
      dataIndex: "edit",
      title: "Edit",
      render: (_, data) => (
        <Button
          onClick={() => {
            setData({
              name: data?.name,
              description: data?.name,
              body: data?.body,
            });
            setEditData(data?.id);
            setCreateTemplate(true);
          }}
        >
          {" "}
          Edit
        </Button>
      ),
    },
  ];

  const handleSubmit = () => {
    if (editData) {
      dispatch(editProposalAndEmailTemplate({ id: editData, ...data }))
        .then((resp) => {
          if (resp.meta.requestStatus === "fulfilled") {
            notification.success({
              message: "Template updated successfully !.",
            });
            setEditData(null);
            setData({
              name: "",
              description: "",
              body: "",
            });
            setCreateTemplate(false)
          } else {
            notification.error({ message: "Something went wrong !." });
          }
        })
        .catch(() =>
          notification.error({ message: "Something went wrong !." })
        );
    } else {
      dispatch(createProposalTemplate(data))
        .then((resp) => {
          if (resp.meta.requestStatus === "fulfilled") {
            notification.success({
              message: "Template created successfully !.",
            });
            setEditData(null);
            setData({
              name: "",
              description: "",
              body: "",
            });
            setCreateTemplate(false)
          } else {
            notification.error({ message: "Something went wrong !." });
          }
        })
        .catch(() =>
          notification.error({ message: "Something went wrong !." })
        );
    }
  };

  return (
    <>
      <div
        style={{
          width: "100%",
          marginBottom: "12px",
          display: "flex",
          justifyContent: "space-between",
        }}
      >
        <MainHeading
          data={createTemplate ? "Create template" : `Templates and email body`}
        />{" "}
        <Button
          type="primary"
          onClick={() => setCreateTemplate((prev) => !prev)}
        >
          {" "}
          {createTemplate ? "Cancel" : "Add template"}
        </Button>
      </div>
      {!createTemplate ? (
        <CommonTable
          columns={columns}
          data={dataList}
          scroll={{ y: "85vh" }}
          rowKey={(row) => row?.id}
        />
      ) : (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 8,
            maxHeight: "86vh",
            overflow: "auto",
          }}
        >
          <Input
            value={data?.name}
            placeholder="Template name"
            onChange={(e) =>
              setData((prev) => ({ ...prev, name: e.target.value }))
            }
          />
          <Flex vertical gap={8} style={{ margin: "8px 0px" }}>
            <Text strong>E-Mail body</Text>
            <TextEditor
              editorInstanceRef={editorInstanceRef}
              onChange={(e, x) =>
                setData((prev) => ({ ...prev, body: x?.getData() }))
              }
              menu={true}
              data={data?.body}
            />
          </Flex>
          <Flex vertical gap={8} style={{ margin: "8px 0px" }}>
            <Text strong>Proposal template</Text>
            <TextEditor
              editorInstanceRef={editorInstanceRef}
              onChange={(e, x) =>
                setData((prev) => ({ ...prev, description: x?.getData() }))
              }
              menu={true}
              data={data?.description}
            />
          </Flex>
          <Button
            disabled={data?.name === ""}
            onClick={handleSubmit}
            style={{ padding: "8px 0px" }}
          >
            Submit
          </Button>
        </div>
      )}
      <Modal
        title={viewData?.type}
        open={openModal}
        onCancel={() => setOpenModal(false)}
        onClose={() => setOpenModal(false)}
        footer={false}
        width={"80%"}
      >
        <div
          style={{ maxHeight: "70vh", overflow: "auto" }}
          dangerouslySetInnerHTML={{ __html: viewData?.preView }}
        />
      </Modal>
    </>
  );
};

export default ProposalTemplate;
