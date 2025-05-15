import React, { useEffect, useRef, useState } from "react";
import TextEditor from "../../Common/TextEditor";
import template from "../../../Images/template.png";
import { Button, Card, Popover, Typography } from "antd";
import { useDispatch, useSelector } from "react-redux";
import { getAllProposalTemplateList } from "../../../Toolkit/Slices/LeadSlice";
const { Text } = Typography;

const Proposal = () => {
  const dispatch = useDispatch();
  const editorInstanceRef = useRef(null);
  const templateList = useSelector((state) => state.leads.templateList);
  const [templates, setTemplates] = useState([]);
  const [templateTextData, setTemplateTextData] = useState("");

  useEffect(() => {
    dispatch(getAllProposalTemplateList());
  }, [dispatch]);

  useEffect(() => {
    setTemplates(templateList);
  }, [templateList]);

  const handleSubmit = () => {
    const data = editorInstanceRef.current?.getData();
    console.log("Editor Data:", data);
  };

  console.log("dskfbkjldshbkjddj", templateList, templates);

  const handleSetData = (description) => {
    setTemplateTextData(description);
  };

  const content = () => {
    return (
      <div style={{ display: "flex", flexWrap: "wrap", gap: 12 }}>
        {templates?.map((item) => (
          <Card
            style={{ display: "flex", flexDirection: "column" }}
            key={`template${item?.id}`}
            hoverable
            onClick={() => handleSetData(item?.description)}
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
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      {/* <div > */}
      <Popover
        trigger={"click"}
        content={content}
        overlayInnerStyle={{ maxWidth: 800 }}
        placement="bottomLeft"
      >
        <Button style={{ width: 100 }}>Templates</Button>
      </Popover>
      <div>
        <TextEditor
          editorInstanceRef={editorInstanceRef}
          initialData={templateTextData}
        />
      </div>
      <Button onClick={handleSubmit}>Submit</Button>
    </div>
  );
};

export default Proposal;
