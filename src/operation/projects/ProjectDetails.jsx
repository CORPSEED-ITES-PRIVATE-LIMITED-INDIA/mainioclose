import {
  Accordion,
  AccordionItem,
  Card,
  CardHeader,
  Chip,
  User,
} from "@heroui/react";
import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getOperationProjectDetailById } from "../../toolkit/slices/operationSlice";
import { useParams } from "react-router-dom";

const ProjectDetails = () => {
  const dispatch = useDispatch();
  const { projectId, userId } = useParams();
  const detailedData = useSelector(
    (state) => state.operation.operationProjectDetail
  );

  useEffect(() => {
    dispatch(getOperationProjectDetailById({ projectId, userId }));
  }, [projectId]);

  console.log("ujgdsuguigsugs", detailedData);

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-3">
        <h1 className="font-medium">{detailedData[0]?.projectName}</h1>
      </div>

      <Accordion variant="bordered" defaultExpandedKeys={["0"]}>
        {detailedData?.length > 0 &&
          detailedData?.map((detail, idx) => {
            return (
              <AccordionItem
                key={idx}
                aria-label="Accordion 1"
                subtitle={
                  <Chip size="sm" color="primary">
                    {detail?.status}
                  </Chip>
                }
                title={detail?.milestoneName}
                classNames={{ title: "font-medium" }}
              >
                <div className="grid grid-cols-5 border-t border-gray-300 max-h-[20vh] overflow-auto">
                  <div className="col-span-2 border-r border-gray-300 p-4">
                    <Card>
                      <CardHeader>
                        <User
                          description={detail?.assignedUser?.email}
                          name={detail?.assignedUser?.fullName}
                          classNames={{name:'font-medium font-sans'}}
                        />
                      </CardHeader>
                    </Card>
                  </div>

                  <div className="col-span-3 p-4">
                    <div className="flex items-center gap-3">
                      <h2 className="font-medium">{detail?.milestoneName}</h2>
                      <Chip size="sm" color="primary">
                        {detail?.status}
                      </Chip>
                    </div>
                  </div>
                </div>
              </AccordionItem>
            );
          })}
      </Accordion>
    </div>
  );
};

export default ProjectDetails;
