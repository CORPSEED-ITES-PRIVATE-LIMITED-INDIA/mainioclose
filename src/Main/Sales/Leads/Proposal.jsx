import React, { useEffect, useState } from "react";
import TextEditor from "../../Common/TextEditor";
import template from "../../../Images/template.png";
import {
  Button,
  Card,
  Flex,
  Form,
  Input,
  notification,
  Popover,
  Select,
  Typography,
} from "antd";
import { useDispatch, useSelector } from "react-redux";
import {
  editLeadPropposal,
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
  const proposalDataDetail = useSelector(
    (state) => state.leads.proposalDataDetail
  );
  const [templates, setTemplates] = useState([]);
  const [data, setData] = useState("<h2>Your proposal </h2>");
  const [openPopOver, setOpenPopOver] = useState(false);
  const [templateName, setTemplateName] = useState("");
  const [editProposal, setEditProposal] = useState(false);
  const [mailBody, setMailBody] = useState("<h2>Your email body</h2>");

  useEffect(() => {
    dispatch(getAllProposalTemplateList());
  }, [dispatch]);

  useEffect(() => {
    setTemplates(templateList);
  }, [templateList]);

  useEffect(() => {
    if (Object.keys(proposalDataDetail)?.length > 0) {
      setData(proposalDataDetail?.template);
      setMailBody(proposalDataDetail?.mailBody);
      form.setFieldsValue({
        mailTo: proposalDataDetail?.mailTo,
        mailCc: proposalDataDetail?.mailCc,
        mailBcc: proposalDataDetail?.mailBcc,
        mailSubject: proposalDataDetail?.mailSubject,
      });
    } else {
      form.resetFields();
      setData("<h2>Your proposal </h2>");
      setMailBody("<h2>Your email body</h2>");
    }
  }, [proposalDataDetail, form]);

  const handleSetData = (description) => {
    setData(description);
    setOpenPopOver(false);
  };

  const handleSubmit = (values) => {
    values.leadId = leadid;
    values.productId = productData?.id;
    values.createdById = userid;
    values.templateName = templateName;
    if (Object.keys(proposalDataDetail)?.length > 0) {
      dispatch(editLeadPropposal({ id: proposalDataDetail?.id, ...values }))
        .then((resp) => {
          if (resp.meta.requestStatus === "fulfilled") {
            notification.success({
              message: "Propsal updated successfully !.",
            });
          } else {
            notification.error({ message: "Something went wrong !." });
          }
        })
        .catch(() =>
          notification.error({ message: "Something went wrong !." })
        );
    } else {
      dispatch(sendProposal(values))
        .then((resp) => {
          if (resp.meta.requestStatus === "fulfilled") {
            notification.success({ message: "Propsal sent successfully !." });
          } else {
            notification.error({ message: "Something went wrong !." });
          }
        })
        .catch(() =>
          notification.error({ message: "Something went wrong !." })
        );
    }
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

  console.log("dsjbvskdjhbsdkjhsdkj 11111111111", data);

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
      {Object.keys(proposalDataDetail)?.length > 0 && (
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          {!editProposal ? (
            <Flex vertical gap={12}>
              <Flex align="center" gap={8}>
                <Text className="heading-text" type="secondary">
                  Product name
                </Text>
                <Text className="heading-text" type="secondary">
                  :
                </Text>
                <Text className="heading-text">
                  {proposalDataDetail?.productName}
                </Text>
              </Flex>
              <Flex align="center" gap={8}>
                <Text className="heading-text" type="secondary">
                  Created person email
                </Text>
                <Text className="heading-text" type="secondary">
                  :
                </Text>
                <Text className="heading-text">
                  {proposalDataDetail?.createdByEmail}
                </Text>
              </Flex>
            </Flex>
          ) : (
            <div />
          )}
          <Button
            onClick={() => {
              setEditProposal((prev) => !prev);
            }}
          >
            {editProposal ? "Cancel" : "Edit proposal"}
          </Button>
        </div>
      )}

      {Object.keys(proposalDataDetail)?.length > 0 && !editProposal ? (
        <div
          dangerouslySetInnerHTML={{ __html: proposalDataDetail?.template }}
        />
      ) : (
        <Form layout="vertical" form={form} onFinish={handleSubmit}>
          <Form.Item
            name="mailTo"
            label="To"
            layout="horizontal"
            rules={[
              {
                required: true,
                message: "Please enter at least one valid email",
              },
              {
                validator: (_, value) => {
                  const invalid = (value || []).filter(
                    (email) => !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
                  );
                  return invalid.length === 0
                    ? Promise.resolve()
                    : Promise.reject(
                        new Error(`Invalid email(s): ${invalid.join(", ")}`)
                      );
                },
              },
            ]}
          >
            <Select
              mode="tags"
              style={{ width: "100%" }}
              placeholder="Enter emails and press Enter"
              tokenSeparators={[",", " "]}
              open={false} 
              suffixIcon={false}
            />
          </Form.Item>
          <Form.Item
            name="mailCc"
            label="Cc"
            layout="horizontal"
            rules={[
              {
                validator: (_, value) => {
                  const invalid = (value || []).filter(
                    (email) => !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
                  );
                  return invalid.length === 0
                    ? Promise.resolve()
                    : Promise.reject(
                        new Error(`Invalid email(s): ${invalid.join(", ")}`)
                      );
                },
              },
            ]}
          >
            <Select
              mode="tags"
              style={{ width: "100%" }}
              placeholder="Enter emails and press Enter"
              tokenSeparators={[",", " "]}
              open={false}
              suffixIcon={false}
            />
          </Form.Item>
          <Form.Item
            name="mailBcc"
            label="Bcc"
            layout="horizontal"
            rules={[
              {
                validator: (_, value) => {
                  const invalid = (value || []).filter(
                    (email) => !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
                  );
                  return invalid.length === 0
                    ? Promise.resolve()
                    : Promise.reject(
                        new Error(`Invalid email(s): ${invalid.join(", ")}`)
                      );
                },
              },
            ]}
          >
            <Select
              mode="tags"
              style={{ width: "100%" }}
              placeholder="Enter emails and press Enter"
              tokenSeparators={[",", " "]}
              open={false} 
              suffixIcon={false}
            />
          </Form.Item>
          <Form.Item
            label="Subject"
            name="mailSubject"
            layout="horizontal"
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
              data={mailBody}
              onChange={(prev, editor) => {
                form.setFieldsValue({ mailBody: editor?.getData() });
                setMailBody(editor?.getData());
              }}
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
      )}
    </div>
  );
};

export default Proposal;
