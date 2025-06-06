import React, { useRef, useState } from "react";
import TextEditor from "../Common/TextEditor";
import { Button, Input, notification } from "antd";
import { useDispatch } from "react-redux";
import { createProposalTemplate } from "../../Toolkit/Slices/LeadSlice";

const ProposalTemplate = () => {
  const dispatch = useDispatch();
  const editorInstanceRef = useRef(null);
  const [templateName, setTempateName] = useState("");
  const [data, setData] = useState("");

  const handleSubmit = () => {
    // const data = editorInstanceRef.current?.getData();
    dispatch(createProposalTemplate({ name: templateName, description: data }))
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
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      <Input
        value={templateName}
        placeholder="Template name"
        onChange={(e) => setTempateName(e.target.value)}
      />
      <TextEditor
        editorInstanceRef={editorInstanceRef}
        onChange={(e, x) => setData(x?.getData())}
        menu={true}
        setData={setData}
        data={data}
      />
      <Button disabled={templateName === ""} onClick={handleSubmit}>
        Submit
      </Button>
    </div>
  );
};

export default ProposalTemplate;
