import React, { useEffect, useState } from "react";
import TextEditor from "../../Common/TextEditor";
import template from "../../../Images/template.png";
import {
  Button,
  Card,
  Form,
  Input,
  notification,
  Popover,
  Typography,
} from "antd";
import { useDispatch, useSelector } from "react-redux";
import {
  getAllProposalTemplateList,
  sendProposal,
} from "../../../Toolkit/Slices/LeadSlice";
import { Icon } from "@iconify/react";
import { useParams } from "react-router-dom";
const { Text } = Typography;

const Proposal = ({ leadid }) => {
  const dispatch = useDispatch();
  const [form] = Form.useForm();
  const { userid } = useParams();
  const templateList = useSelector((state) => state.leads.templateList);
  const productData = useSelector((state) => state.leads.productDataByLeadName);
  const [templates, setTemplates] = useState([]);
  const [data, setData] = useState("");
  const [openPopOver, setOpenPopOver] = useState(false);
  const [templateName, setTemplateName] = useState("");

  useEffect(() => {
    dispatch(getAllProposalTemplateList());
  }, [dispatch]);

  useEffect(() => {
    setTemplates(templateList);
  }, [templateList]);

  const handleSetData = (description) => {
    setData(description);
    setOpenPopOver(false);
  };

  const handleSubmit = (values) => {
    console.log("Editor Data:", values);
    values.leadId = leadid;
    values.productId = productData?.id;
    values.createdById = userid;
    values.templateName = templateName
    dispatch(sendProposal(values))
      .then((resp) => {
        if (resp.meta.requestStatus === "fulfilled") {
          notification.success({ message: "Propsal sent successfully !." });
        } else {
          notification.error({ message: "Something went wrong !." });
        }
      })
      .catch(() => notification.error({ message: "Something went wrong !." }));
  };
  const content = () => {
    return (
      <div style={{ display: "flex", flexWrap: "wrap", gap: 12 }}>
        {templates?.map((item) => (
          <Card
            style={{ display: "flex", flexDirection: "column" }}
            key={`template${item?.id}`}
            hoverable
            onClick={() => {
              handleSetData(item?.description);
              setTemplateName(item?.name);
            }}
          >
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 12,
              }}
            >
              <img src={template} alt="templates" height={100} width={120} />
              <Text className="heading-text">{item?.name}</Text>
            </div>
          </Card>
        ))}
      </div>
    );
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 20,
        height: "91vh",
        overflow: "auto",
        padding: "12px",
      }}
    >
      <Form
        layout="vertical"
        form={form}
        onFinish={handleSubmit}
        initialValues={{ mailTo: [""], mailCc: [""], mailBcc: [""] }}
      >
        <Form.List name="mailTo">
          {(fields, { add, remove }, { errors }) => (
            <>
              {fields.map((field, index) => (
                <Form.Item
                  {...(index === 0 ? { label: "To", required: true } : {})}
                  key={field.key}
                  style={{ marginBottom: 4 }}
                >
                  <Form.Item
                    {...field}
                    validateTrigger={["onChange", "onBlur"]}
                    rules={[
                      {
                        required: true,
                        whitespace: true,
                        type: "email",
                        message: "Please input email",
                      },
                    ]}
                    style={{ width: "100%", marginBottom: 4 }}
                  >
                    <Input placeholder="example@xyz.com" />
                  </Form.Item>
                  {fields.length > 1 ? (
                    <Button
                      size="small"
                      type="text"
                      onClick={() => remove(field.name)}
                      danger
                    >
                      <Icon icon="fluent:delete-24-regular" />
                    </Button>
                  ) : null}
                </Form.Item>
              ))}
              <Form.Item>
                <Button type="link" onClick={() => add()}>
                  Add to
                </Button>
                <Form.ErrorList errors={errors} />
              </Form.Item>
            </>
          )}
        </Form.List>
        <Form.List name="mailCc">
          {(fields, { add, remove }, { errors }) => (
            <>
              {fields.map((field, index) => (
                <Form.Item
                  {...(index === 0 ? { label: "Cc" } : {})}
                  key={field.key}
                  style={{ marginBottom: 4 }}
                >
                  <Form.Item
                    {...field}
                    validateTrigger={["onChange", "onBlur"]}
                    rules={[
                      {
                        whitespace: true,
                        type: "email",
                        message: "Please input email",
                      },
                    ]}
                    style={{ width: "100%", marginBottom: 4 }}
                  >
                    <Input placeholder="example@xyz.com" />
                  </Form.Item>
                  {fields.length > 1 ? (
                    <Button
                      size="small"
                      type="text"
                      onClick={() => remove(field.name)}
                      danger
                    >
                      <Icon icon="fluent:delete-24-regular" />
                    </Button>
                  ) : null}
                </Form.Item>
              ))}
              <Form.Item>
                <Button type="link" onClick={() => add()}>
                  Add Cc
                </Button>
                <Form.ErrorList errors={errors} />
              </Form.Item>
            </>
          )}
        </Form.List>
        <Form.List name="mailBcc">
          {(fields, { add, remove }, { errors }) => (
            <>
              {fields.map((field, index) => (
                <Form.Item
                  {...(index === 0 ? { label: "Bcc" } : {})}
                  key={field.key}
                  style={{ marginBottom: 4 }}
                >
                  <Form.Item
                    {...field}
                    validateTrigger={["onChange", "onBlur"]}
                    rules={[
                      {
                        whitespace: true,
                        type: "email",
                        message: "Please input email",
                      },
                    ]}
                    style={{ width: "100%", marginBottom: 4 }}
                  >
                    <Input placeholder="example@xyz.com" />
                  </Form.Item>
                  {fields.length > 1 ? (
                    <Button
                      size="small"
                      type="text"
                      onClick={() => remove(field.name)}
                      danger
                    >
                      <Icon icon="fluent:delete-24-regular" />
                    </Button>
                  ) : null}
                </Form.Item>
              ))}
              <Form.Item>
                <Button type="link" onClick={() => add()}>
                  Add bcc
                </Button>
                <Form.ErrorList errors={errors} />
              </Form.Item>
            </>
          )}
        </Form.List>
        <Form.Item
          label="Subject"
          name="mailSubject"
          rules={[{ required: true, message: "please give subject" }]}
        >
          <Input />
        </Form.Item>
        <Form.Item
          label="Mail body"
          name="mailBody"
          rules={[{ required: true, message: "please give mail body" }]}
        >
          <TextEditor
            initialData="<h2>Your email content</h2>"
            data={form.getFieldValue("mailBody")}
            onChange={(prev, editor) =>
              form.setFieldsValue({ mailBody: editor?.getData() })
            }
          />
        </Form.Item>
        <Form.Item>
          <Popover
            trigger={"click"}
            content={content}
            overlayInnerStyle={{ maxWidth: 1200 }}
            placement="bottomLeft"
            open={openPopOver}
            onOpenChange={(e) => setOpenPopOver(e)}
          >
            <Button style={{ width: 250 }}>Proposal templates</Button>
          </Popover>
        </Form.Item>
        <Form.Item label="Proposal" name="template">
          <TextEditor
            initialData="<h2>Your proposal </h2>"
            onChange={(e, editor) => {
              form.setFieldsValue({ template: editor?.getData() });
              setData(editor?.getData());
            }}
            data={data}
          />
        </Form.Item>
        <Form.Item>
          <Button htmlType="submit" type="primary">
            Submit
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
};

export default Proposal;
