import { Button, Form, Input, Modal, notification, Select, Upload } from "antd";
import React, { useCallback, useState } from "react";
import { Icon } from "@iconify/react";
import { useDispatch } from "react-redux";
import {
  addDocsInProduct,
  addDocumentProduct,
  getSingleProductByProductId,
} from "../../../../Toolkit/Slices/ProductSlice";

const DocsModal = ({ data }) => {
  const dispatch = useDispatch();
  const [form] = Form.useForm();
  const [openModal, setOpenModal] = useState(false);

  const storageData = localStorage.getItem("userDetail");
  let localData = null;
  if (storageData) {
    try {
      localData = JSON.parse(storageData);
    } catch (error) {
      console.error("Error parsing JSON:", error);
    }
  } else {
    console.warn("user detail not found in localStorage");
  }

  const normFile = (e) => {
    if (Array.isArray(e)) {
      return e;
    }
    return e?.fileList;
  };

  const handleFinish = useCallback(
    (values) => {
      values.productId = data?.id;
      values.name = values?.name?.[0]?.response;
      dispatch(addDocsInProduct(values))
        .then((resp) => {
          if (resp.meta.requestStatus === "fulfilled") {
            notification.success({
              message: "Document is added successfully.",
            });
            dispatch(getSingleProductByProductId(data?.id));
            setOpenModal(false);
            form.resetFields();
          } else {
            notification.error({ message: "Something went wrong !." });
          }
        })
        .catch(() =>
          notification.error({ message: "Something went wrong !." })
        );
    },
    [dispatch, form, data]
  );

  return (
    <>
      <Button size="small" onClick={() => setOpenModal(true)}>
        <Icon icon="fluent:add-24-filled" /> Add
      </Button>
      <Modal
        title="Document details"
        open={openModal}
        centered
        onCancel={() => setOpenModal(false)}
        onClose={() => setOpenModal(false)}
        onOk={() => form.submit()}
        okText="Submit"
      >
        <Form
          layout="vertical"
          size="small"
          form={form}
          onFinish={handleFinish}
        >
          <Form.Item
            label="Description"
            name="description"
            rules={[
              { required: true, message: "please enter the description" },
            ]}
          >
            <Input.TextArea />
          </Form.Item>

          <Form.Item
            label="Type"
            name="type"
            rules={[{ required: true, message: "please select type" }]}
          >
            <Select
              options={[
                { label: "Client", value: "client" },
                { label: "Agent", value: "agent" },
              ]}
            />
          </Form.Item>

          <Form.Item
            label="Document attachement"
            name="name"
            getValueFromEvent={normFile}
            valuePropName="fileList"
          >
            <Upload
              action="/leadService/api/v1/upload/uploadimageToFileSystem"
              listType="text"
              headers={{ Authorization: `Bearer ${localData?.jwt}` }}
            >
              <Button size="small">
                <Icon icon="fluent:arrow-upload-20-filled" />
                Upload
              </Button>
            </Upload>
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
};

export default DocsModal;
