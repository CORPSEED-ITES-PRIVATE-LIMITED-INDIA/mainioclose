import {
  addToast,
  Avatar,
  Button,
  Card,
  CardBody,
  CardFooter,
  CardHeader,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownTrigger,
  Snippet,
  Textarea,
} from "@heroui/react";
import {
  ChartBarDecreasing,
  EllipsisVertical,
  Factory,
  FileText,
  Link,
  MapPin,
  MessageCircle,
  MessageSquareMore,
  Pencil,
  Phone,
  Plus,
  Trash,
  User,
  X,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import NewSelect from "../../components/NewSelect";
import { useDispatch, useSelector } from "react-redux";
import {
  getAllComments,
  getAllSlugList,
} from "../../toolkit/slices/settingSlice";
import {
  createRemakWithFile,
  getAllRemarkAndCommnts,
  getSingleLeadDataByLeadId,
  updateSingleLeadName,
} from "../../toolkit/slices/leadSlice";
import { useParams } from "react-router-dom";
import FileUploader from "../../components/FileUploader";
import ImageGroup from "../../components/ImageGroup";
const iconClass="h-4 w-4"

const phoneData = [
  {
    key: "1",
    name: "Tony Reichert",
    email: "tony@yahoo.com",
    phone: "785964",
  },
  {
    key: "2",
    name: "Zoey Lang",
    email: "zoey@lang.com",
    phone: "8852461",
  },
  {
    key: "3",
    name: "Jane Fisher",
    email: "jabne@email.com",
    phone: "88997877885",
  },
  {
    key: "4",
    name: "William Howard",
    email: "willian@tyigi.com",
    phone: "88777445",
  },
];

const LeadInfo = ({ leadData }) => {
  const dispatch = useDispatch();
  const { userId, leadId } = useParams();
  const [toggleSlug, setToggleSlug] = useState(true);
  const [toggleAssignee, setToggleAssignee] = useState(true);
  const [customComment, setCustomComment] = useState("");
  const [selectedComment, setSelectedComment] = useState(null);
  const [toggleStatus, setToggleStatus] = useState(true);
  const [files, setFiles] = useState([]);
  const slugList = useSelector((state) => state.setting.slugList);
  const allComments = useSelector((state) => state.setting.allComments);
  const remarkData = useSelector((state) => state.leads.remarkData);

  useEffect(() => {
    dispatch(getAllSlugList());
    dispatch(getAllComments());
    dispatch(getAllRemarkAndCommnts(leadId));
  }, [dispatch, leadId]);

  const handleUpdateLeadName = (leadName) => {
    dispatch(updateSingleLeadName({ leadName, leadId, userId }))
      .then((resp) => {
        if (resp.meta.requestStatus === "fulfilled") {
          addToast({
            title: "Lead name updated successfully !.",
            color: "success",
          });
          dispatch(getSingleLeadDataByLeadId({ leadId, userId }));
          setToggleSlug(true);
        } else {
          addToast({
            title: "Something went wrong !.",
            color: "danger",
          });
        }
      })
      .catch(() => {
        addToast({
          title: "Something went wrong !.",
          color: "danger",
        });
      });
  };

  const onSubmit = useCallback(() => {
    let data = {
      leadId: leadId,
      userId: userId,
      type: selectedComment === "Other" ? "Other" : "selected",
      message: selectedComment === "Other" ? customComment : selectedComment,
      file: files?.map((item) => item?.url),
    };
    if (customComment || selectedComment) {
      dispatch(createRemakWithFile(data))
        .then((resp) => {
          if (resp.meta.requestStatus === "fulfilled") {
            addToast({
              title: "Remark added successfully !.",
              color: "success",
            });
            setFiles([]);
            setCustomComment("");
            setSelectedComment(null);
            dispatch(getAllRemarkAndCommnts(leadId));
          } else {
            addToast({ title: "Something went wrong !.", color: "danger" });
          }
        })
        .catch(() => {
          addToast({ title: "Something went wrong !.", color: "danger" });
        });
    } else {
      addToast({ title: "Select comment to proceed", color: "warning" });
    }
  }, [files, leadId, userId, selectedComment, customComment, dispatch]);

  return (
    <div className="grid grid-cols-2 gap-3 p-2 max-h-[78vh] overflow-auto">
      <div className="grid grid-cols-2 gap-3">
        <div className="w-full">
          <Card className="dark:bg-gray-700 my-2">
            <CardBody>
              {toggleSlug ? (
                <div className="flex justify-between items-center">
                  <h6 className="font-medium">{leadData?.leadName}</h6>
                  <Button
                    onPress={() => setToggleSlug(false)}
                    size="sm"
                    isIconOnly
                    variant="light"
                    className="w-6 h-6 rounded-full bg-none"
                  >
                    <Pencil className={iconClass} />
                  </Button>
                </div>
              ) : (
                <div className="flex justify-between items-center">
                  <NewSelect
                    data={slugList}
                    labelKey={"name"}
                    valueKey={"name"}
                    label={"Select slug"}
                    onChange={handleUpdateLeadName}
                  />
                  <Button
                    onPress={() => setToggleSlug(true)}
                    size="sm"
                    isIconOnly
                    variant="light"
                    className="w-6 h-6 rounded-full bg-none"
                  >
                    <X className={iconClass} />
                  </Button>
                </div>
              )}
            </CardBody>
          </Card>
          <Card className="dark:bg-gray-700  my-2">
            <CardHeader>
              <div className="flex justify-between items-center w-full">
                <div className="flex items-center gap-2">
                  <MapPin className={iconClass} /> <h3 className="font-medium">Address Info</h3>
                </div>
                <Button
                  size="sm"
                  isIconOnly
                  variant="light"
                  className="w-6 h-6 rounded-full bg-none"
                >
                  <Pencil className={iconClass} />
                </Button>
              </div>
            </CardHeader>
            <CardBody>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <p className="text-foreground-500 text-tiny">Address</p>
                  <p className="text-tiny">A-41 Ramji nagar</p>
                </div>
                <div>
                  <p className="text-foreground-500 text-tiny">Country</p>
                  <p className="text-tiny">India</p>
                </div>
                <div>
                  <p className="text-foreground-500 text-tiny">State</p>
                  <p className="text-tiny">Uttar pradesh</p>
                </div>
                <div>
                  <p className="text-foreground-500 text-tiny">City</p>
                  <p className="text-tiny">Lucknow</p>
                </div>
              </div>
            </CardBody>
          </Card>
          <Card className="dark:bg-gray-700 my-2">
            <CardHeader>
              <div className="flex justify-between items-center w-full">
                <div className="flex items-center gap-2">
                  <Factory className={iconClass} /> <h3 className="font-medium" >Industry Info</h3>
                </div>
                <Button
                  size="sm"
                  isIconOnly
                  variant="light"
                  className="w-6 h-6 rounded-full bg-none"
                >
                  <Pencil className={iconClass} />
                </Button>
              </div>
            </CardHeader>
            <CardBody>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <p className="text-foreground-500 text-tiny">Industry</p>
                  <p className="text-tiny">Electronics</p>
                </div>
                <div>
                  <p className="text-foreground-500 text-tiny">Sub Industry</p>
                  <p className="text-tiny">Electronics Metal</p>
                </div>
                <div>
                  <p className="text-foreground-500 text-tiny">Category</p>
                  <p className="text-tiny">Wire</p>
                </div>
                <div>
                  <p className="text-foreground-500 text-tiny">
                    Business activity
                  </p>
                  <p className="text-tiny">Aluminum wire , Copper wire</p>
                </div>
              </div>
            </CardBody>
          </Card>
          <Card className="dark:bg-gray-700 my-2">
            <CardHeader>
              <div className="flex justify-between items-center w-full">
                <div className="flex items-center gap-2">
                  <User className={iconClass} /> <h3 className="font-medium">Assignee</h3>
                </div>

                {toggleAssignee ? (
                  <Button
                    variant="light"
                    onPress={() => setToggleAssignee(false)}
                    size="sm"
                    isIconOnly
                    className="w-6 h-6 rounded-full bg-none"
                  >
                    <Pencil className={iconClass} />
                  </Button>
                ) : (
                  <Button
                    onPress={() => setToggleAssignee(true)}
                    size="sm"
                    variant="light"
                    isIconOnly
                    className="w-6 h-6 rounded-full bg-none"
                  >
                    <X className={iconClass} />
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardBody>
              {toggleAssignee ? (
                <div className="flex flex-col">
                  <span className="font-semibold text-tiny">Nishu singh</span>
                  <span className="text-tiny text-gray-400">
                    nishu@corpseed.com
                  </span>
                </div>
              ) : (
                <NewSelect
                  data={slugList}
                  labelKey={"name"}
                  valueKey={"name"}
                  label={"Select assignee"}
                  onChange={handleUpdateLeadName}
                />
              )}
            </CardBody>
          </Card>
          <Card className="dark:bg-gray-700 my-2">
            <CardHeader>
              <div className="flex justify-between items-center w-full">
                <div className="flex items-center gap-2">
                  <ChartBarDecreasing className={iconClass} /> <h3 className="font-medium" >Status</h3>
                </div>

                {toggleStatus ? (
                  <Button
                    variant="light"
                    onPress={() => setToggleStatus(false)}
                    size="sm"
                    isIconOnly
                    className="w-6 h-6 rounded-full bg-none"
                  >
                    <Pencil className={iconClass} />
                  </Button>
                ) : (
                  <Button
                    variant="light"
                    onPress={() => setToggleStatus(true)}
                    size="sm"
                    isIconOnly
                    className="w-6 h-6 rounded-full bg-none"
                  >
                    <X className={iconClass} />
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardBody>
              {toggleStatus ? (
                <div className="flex flex-col">
                  <span className="text-sm">New</span>
                </div>
              ) : (
                <NewSelect
                  data={slugList}
                  labelKey={"name"}
                  valueKey={"name"}
                  label={"Select status"}
                  onChange={handleUpdateLeadName}
                />
              )}
            </CardBody>
          </Card>
        </div>
        <div className="w-full">
          <Card className="dark:bg-gray-700 my-2">
            <CardHeader>
              <div className="flex items-center gap-2">
                <FileText className={iconClass} /> <h3 className="font-medium">Lead description</h3>
              </div>
            </CardHeader>
            <CardBody>
              <p className="text-tiny">
                Lorem ipsum, dolor sit amet consectetur adipisicing elit. Ipsa
                veritatis culpa fugit recusandae placeat, in vitae? Dicta nam
                incidunt odit aut ipsa provident excepturi explicabo iste
                dolore. Assumenda, odio reprehenderit.
              </p>
            </CardBody>
          </Card>
          <Card className="dark:bg-gray-700 my-2">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Link className={iconClass} /> <h3 className="font-medium">Website link</h3>
              </div>
            </CardHeader>
            <CardBody>
              <Snippet>https://www.corpseed.com</Snippet>
            </CardBody>
          </Card>
          <Card className="dark:bg-gray-700 my-2">
            <CardHeader>
              <div className="flex justify-between items-center w-full">
                <div className="flex items-center gap-2">
                  <Phone className={iconClass} /> <h3 className="font-medium">Contacts</h3>
                </div>
                <Button
                  size="sm"
                  isIconOnly
                  variant="light"
                  className="w-6 h-6 rounded-full bg-none"
                >
                  <Plus className={iconClass} />
                </Button>
              </div>
            </CardHeader>
            <CardBody className="max-h-[300px] overflow-auto">
              {phoneData?.map((item) => {
                return (
                  <div className="flex justify-between items-center border rounded-md mb-1 px-2">
                    <div className="flex flex-col">
                      <span className="font-semibold text-sm">
                        {item?.name || "-"}
                      </span>
                      <span className="text-sm text-gray-400">
                        {item?.email || ""}
                      </span>
                      <span className="text-sm text-gray-400">
                        {item?.phone || ""}
                      </span>
                    </div>
                    <Dropdown>
                      <DropdownTrigger>
                        <Button variant="light" isIconOnly size="sm">
                          <EllipsisVertical className={iconClass} />
                        </Button>
                      </DropdownTrigger>
                      <DropdownMenu aria-label="Static Actions">
                        <DropdownItem
                          key="edit"
                          startContent={<Pencil className={iconClass} />}
                        >
                          Edit
                        </DropdownItem>
                        <DropdownItem
                          key="delete"
                          color="danger"
                          className="text-danger"
                          startContent={<Trash className={iconClass} />}
                        >
                          Delete
                        </DropdownItem>
                      </DropdownMenu>
                    </Dropdown>
                  </div>
                );
              })}
            </CardBody>
          </Card>
        </div>
      </div>
      <div>
        <Card className="dark:bg-gray-700 my-2">
          <CardHeader>
            <div className="flex items-center gap-2">
              <MessageCircle className={iconClass} />
              <h3 className="font-medium">Comments / Upload </h3>
            </div>
          </CardHeader>
          <CardBody>
            <NewSelect
              placeholder="Select comment..."
              data={[{ name: "Other" }, ...allComments]}
              valueKey={"name"}
              labelKey={"name"}
              label={"Comments"}
              isClearable
              onChange={(e) => {
                setSelectedComment(e);
                setCustomComment("");
              }}
            />
            {selectedComment === "Other" && (
              <Textarea
                className="my-2"
                value={customComment}
                placeholder="Please write your remarks"
                onChange={(e) => setCustomComment(e.target.value)}
              />
            )}
            <FileUploader files={files} setFiles={setFiles} />
          </CardBody>
          <CardFooter className="flex justify-end">
            <div>
              <Button color="primary" onPress={onSubmit}>
                Submit
              </Button>
            </div>
          </CardFooter>
        </Card>
        <Card className="dark:bg-gray-700 my-2">
          <CardHeader>
            <div className="flex items-center gap-2">
              <MessageSquareMore className={iconClass} />
              <h3 className="font-medium">Remarks </h3>
            </div>
          </CardHeader>
          <CardBody className="max-h-[200px] overflow-auto">
            {remarkData?.map((remark) => {
              return (
                <div
                  key={`remark${remark?.id}`}
                  className="rounded-md border-1 p-2 my-1"
                >
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <Avatar className="w-5 h-5 text-tiny">
                        {remark?.updatedBy?.fullName?.[0]}
                      </Avatar>
                      <span className="font-medium text-tiny">
                        {remark?.updatedBy?.fullName}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Pencil className={iconClass} />
                      <Trash className={iconClass} color="red" />
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <p className="text-tiny text-gray-500">{remark?.message}</p>
                    <ImageGroup
                      images={remark?.imageList?.map((item) => item?.filePath)}
                    />
                  </div>
                </div>
              );
            })}
          </CardBody>
        </Card>
      </div>
    </div>
  );
};

export default LeadInfo;
