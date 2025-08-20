import React, { useEffect } from "react";
import TableOutlet from "../../components/design/TableOutlet";
import MainHeading from "../../components/design/MainHeading";
import { useDispatch, useSelector } from "react-redux";
import TableScalaton from "../../components/TableScalaton";
import SomethingWrong from "../../components/usefulThings/SomethingWrong";
import { useParams } from "react-router-dom";
import {
  allRatingUsers,
  deleteRatingUser,
} from "../../Toolkit/Slices/RatingSlice";
import { EditUserRating } from "../../Model/EditUserRating";
import { Button, Popconfirm, Typography, notification } from "antd";
import CommonTable from "../../components/CommonTable";
import CreateRatingModel from "../../Model/CreateRatingModel";
const { Text } = Typography;

const UserRating = () => {
  const dispatch = useDispatch();
  const { serviceid } = useParams();

  useEffect(() => {
    dispatch(allRatingUsers({ id: serviceid }));
  }, [dispatch, serviceid]);

  const { allUsersList, allUsersLoading, allUsersError } = useSelector(
    (prev) => prev?.ratingn
  );

  const columns = [
    {
      dataIndex: "id",
      title: "Id",
      width: 80,
    },
    { dataIndex: "urlsName", title: "Service name", width: 250 },
    {
      dataIndex: "user",
      title: "Assignee",
      render: (_, props) =>
        props?.user?.map((item) => (
          <Text style={{ margin: "0px 2px" }}>{item?.name},</Text>
        )),
    },
    {
      dataIndex: "rating",
      title: "Rating",
      render: (_, props) => <Text>{props?.rating}</Text>,
    },
    {
      dataIndex: "edit",
      title: "Edit",
      render: (_, props) => <EditUserRating data={props} />,
    },
    {
      dataIndex: "delete",
      title: "Delete",
      render: (_, props) => (
        <Popconfirm
          title="Delete the item"
          description="Are you sure to delete the Item"
          okText="Ok"
          onConfirm={() =>
            dispatch(deleteRatingUser(props?.id))
              .then((rep) => {
                if (rep.meta.requestStatus === "fulfilled") {
                  dispatch(allRatingUsers({ id: serviceid }));
                  notification.success({
                    message: "Rating user deleted successfully !.",
                  });
                } else {
                  notification.error({ message: "Something went wrong !." });
                }
              })
              .catch(() =>
                notification.error({ message: "Something went wrong !." })
              )
          }
        >
          <Button danger>Delete</Button>
        </Popconfirm>
      ),
    },
  ];

  return (
    <TableOutlet>
      <div className="create-user-box">
        <MainHeading data={"Rating list"} />
        <CreateRatingModel urlRating={true} urlId={serviceid} />
      </div>
      <div>
        {allUsersLoading && <TableScalaton />}
        {allUsersError && <SomethingWrong />}
        {allUsersList && !allUsersLoading && !allUsersError && (
          <CommonTable
            data={allUsersList}
            columns={columns}
            scroll={{ y: 510 }}
          />
        )}
      </div>
    </TableOutlet>
  );
};

export default UserRating;
