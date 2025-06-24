import React, { useRef, useState } from "react";
import TextEditor from "../Common/TextEditor";
import { Button, Flex, Input, notification, Typography } from "antd";
import { useDispatch } from "react-redux";
import { createProposalTemplate } from "../../Toolkit/Slices/LeadSlice";
const {Text}=Typography

const ProposalTemplate = () => {
  const dispatch = useDispatch();
  const editorInstanceRef = useRef(null);
  const [data, setData] = useState({
    name: "",
    description: "",
    body: "",
  });

  const handleSubmit = () => {
    // const data = editorInstanceRef.current?.getData();
    dispatch(createProposalTemplate(data))
      .then((resp) => {
        if (resp.meta.requestStatus === "fulfilled") {
          notification.success({ message: "Template created successfully !." });
        } else {
          notification.error({ message: "Something went wrong !." });
        }
      })
      .catch(() => notification.error({ message: "Something went wrong !." }));
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8,maxHeight:'88vh',overflow:'auto' }}>
      <Input
        value={data?.name}
        placeholder="Template name"
        onChange={(e) => setData((prev) => ({ ...prev, name: e.target.value }))}
      />
      <Flex vertical gap={8} style={{margin:'8px 0px'}}>
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
      <Flex vertical gap={8} style={{margin:'8px 0px'}}>
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
      <Button disabled={data?.name === ""} onClick={handleSubmit} style={{padding:'8px 0px'}}>
        Submit
      </Button>
    </div>
  );
};

export default ProposalTemplate;
