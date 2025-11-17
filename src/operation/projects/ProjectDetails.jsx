import {
  Accordion,
  AccordionItem,
  Button,
  Card,
  CardBody,
  CardHeader,
  Chip,
  Drawer,
  DrawerBody,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  useDisclosure,
  User,
} from "@heroui/react";
import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  getOperationProjectDetailById,
  getRequiredDocumentsByProductId,
} from "../../toolkit/slices/operationSlice";
import { useParams } from "react-router-dom";
import {
  BookText,
  Building,
  Calendar,
  Mail,
  MapPin,
  Phone,
} from "lucide-react";
import dayjs from "dayjs";

export const WhatsAppIcon = (props) => {
  return (
    <svg
      aria-hidden="true"
      fill="none"
      focusable="false"
      height="24"
      role="presentation"
      viewBox="0 0 24 24"
      width="24"
      {...props}
    >
      <path
        d="M12.004 2C6.476 2 2 6.486 2 12.023c0 1.983.579 3.83 1.575 5.386L2 22l4.674-1.53A10.003 10.003 0 0 0 12.004 22C17.532 22 22 17.514 22 11.977 22 6.487 17.532 2 12.004 2Zm-.014 18.005c-1.605 0-3.115-.477-4.377-1.287l-.313-.2-2.774.91.914-2.705-.202-.322a8.002 8.002 0 1 1 6.752 3.604Zm4.445-5.635c-.244-.122-1.446-.713-1.67-.793-.224-.081-.387-.122-.55.122-.163.244-.63.793-.773.957-.142.163-.285.183-.53.061-.244-.122-1.033-.381-1.964-1.216-.726-.648-1.215-1.447-1.36-1.691-.142-.244-.015-.377.107-.498.11-.108.244-.285.366-.428.122-.142.163-.244.244-.407.081-.163.041-.305-.02-.428-.061-.122-.55-1.324-.753-1.812-.199-.479-.402-.413-.55-.42l-.468-.007a.902.902 0 0 0-.651.305c-.224.244-.855.835-.855 2.035s.875 2.362 1.001 2.524c.122.163 1.722 2.627 4.176 3.684.584.252 1.04.402 1.395.514.586.186 1.119.16 1.54.097.47-.07 1.446-.59 1.65-1.162.204-.57.204-1.06.142-1.162-.061-.102-.224-.163-.468-.285Z"
        fill="currentColor"
      />
    </svg>
  );
};

export const PdfIcon = (props) => {
  return (
    <svg
      aria-hidden="true"
      fill="none"
      focusable="false"
      height="24"
      role="presentation"
      viewBox="0 0 24 24"
      width="24"
      {...props}
    >
      <path
        fill="currentColor"
        d="M6 2C4.897 2 4 2.897 4 4v16c0 1.103.897 2 2 2h12c1.103 0 2-.897 2-2V8l-6-6H6zm7 1.414L18.586 9H14a1 1 0 0 1-1-1V3.414zM7 13h1.5a1.5 1.5 0 0 0 0-3H7v3zm1.5-2a.5.5 0 0 1 0 1H8v-1h.5zM11 10v4h1v-1h.5a1.5 1.5 0 0 0 0-3H11zm1.5 1a.5.5 0 0 1 0 1H12v-1h.5zM15 10v4h1v-1h1v-1h-1v-1h1v-1h-2z"
      />
    </svg>
  );
};

const ProjectDetails = () => {
  const dispatch = useDispatch();
  const { projectId, userId } = useParams();
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const detailedData = useSelector(
    (state) => state.operation.operationProjectDetail
  );
  const requiredDocsList = useSelector(
    (state) => state.operation.requiredDoucmentListOfProduct
  );

  useEffect(() => {
    dispatch(getOperationProjectDetailById({ projectId, userId }));
  }, [projectId]);

  return (
    <div className="flex flex-col gap-3">
      <div className="flex justify-between gap-3">
        <div className="flex gap-3">
          <div className="flex flex-col gap-2">
            <div>
              <h1 className="font-medium">
                {detailedData?.projectDetails?.name}
              </h1>
              <h3 className="text-default-500 text-xs">
                {detailedData?.projectDetails?.projectNo}{" "}
                {detailedData?.projectDetails?.date &&
                  `(created date : ${dayjs(detailedData?.projectDetails?.createdDate).format("DD-MM-YYYY")})`}
              </h3>
            </div>
            <div className="flex items-center gap-2">
              <Building className="w-4 h-4" />{" "}
              <h3 className="text-sm font-medium">
                {detailedData?.projectDetails?.companyName}
              </h3>
            </div>
            <div className="flex items-start gap-2">
              <MapPin className="w-4 h-4" />{" "}
              <div className="flex flex-col ">
                <p className="text-sm">
                  {detailedData?.projectDetails?.address}
                  {", "}
                  {[
                    detailedData?.projectDetails?.city,
                    detailedData?.projectDetails?.state,
                    detailedData?.projectDetails?.country,
                  ].join(",")}
                </p>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <Calendar className="w-4 h-4" />{" "}
              <div className="flex flex-col ">
                <p className="text-sm">
                  Last updated : {" "}
                   {dayjs(detailedData?.projectDetails?.updatedDate).format(
                    "DD-MM-YYYY"
                  )}
                </p>
              </div>
            </div>
          </div>
        </div>

        <Button
          endContent={<BookText className="h-4 w-4" />}
          onPress={() => {
            onOpen();
            dispatch(
              getRequiredDocumentsByProductId({
                userId,
                productId: detailedData?.projectDetails?.productId,
                projectId,
              })
            );
          }}
        >
          Documents
        </Button>
      </div>

      <Accordion variant="splitted" defaultExpandedKeys={["0"]}>
        {detailedData?.milestones?.length > 0 &&
          detailedData?.milestones?.map((detail, idx) => {
            return (
              <AccordionItem
                key={idx}
                aria-label="Accordion 1"
                subtitle={""}
                title={
                  <>
                    {detail?.milestoneName}{" "}
                    <Chip size="sm" color="primary" className="ml-1">
                      {detail?.status}
                    </Chip>
                  </>
                }
                classNames={{ title: "font-medium" }}
              >
                <div className="grid grid-cols-4 border-t border-gray-300 max-h-[60vh] overflow-auto">
                  <div className="col-span-1 border-r border-gray-300 p-4">
                    <Card key={`contact${idx}`}>
                      <CardHeader>
                        <User
                          description={detail?.assignedUser?.email}
                          name={detail?.salesPersonName}
                          classNames={{ name: "font-medium font-sans" }}
                        />
                      </CardHeader>
                      <CardBody>
                        <div className="flex items-center gap-2">
                          <Phone className="w-4 h-4" />
                          <p className="text-muted-foreground text-sm">
                            {detail?.assignedUser?.contactNo}
                          </p>
                        </div>
                        {/* <div className="flex items-center gap-2">
                              <WhatsAppIcon className="w-4 h-4" />
                              <p className="text-muted-foreground text-sm">
                                {item?.contactNo}
                              </p>
                            </div> */}
                      </CardBody>
                    </Card>
                  </div>

                  <div className="col-span-3 p-4">
                    <div className="flex items-center gap-3">
                      <h2 className="font-medium">
                        {detailedData?.projectDetails?.productName}
                      </h2>
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
      <Drawer isOpen={isOpen} onOpenChange={onOpenChange}>
        <DrawerContent>
          {(onClose) => (
            <>
              <DrawerHeader className="flex flex-col gap-1">
                Documents
              </DrawerHeader>
              <DrawerBody className="max-h-[90vh] overflow-auto">
                {requiredDocsList?.map((doc, idx) => (
                  <Card
                    key={`doc${idx}`}
                    className="min-h-[150px] max-h-[200px]"
                  >
                    <CardBody className="flex flex-col gap-2">
                      <div>
                        <p className="text-small font-sans">{doc?.name}</p>
                        <p className="text-small text-default-500">
                          {doc?.description}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button startContent={<PdfIcon />}>Document</Button>
                      </div>
                    </CardBody>
                  </Card>
                ))}
              </DrawerBody>
              <DrawerFooter>
                <Button color="danger" variant="light" onPress={onClose}>
                  Close
                </Button>
                <Button color="primary" onPress={onClose}>
                  Action
                </Button>
              </DrawerFooter>
            </>
          )}
        </DrawerContent>
      </Drawer>
    </div>
  );
};

export default ProjectDetails;
