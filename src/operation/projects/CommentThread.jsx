import dayjs from "dayjs";

// Recursively renders a comment and its nested replies (used by ActivityItem
// for the COMMENT activity type).
const CommentThread = ({ comment, level = 0, onReply }) => {
  return (
    <div className="mt-3" style={{ marginLeft: Math.min(level * 14, 56) }}>
      <div className="group border-l border-default-200 pl-3 text-xs">
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[11px] text-default-500">
          <span className="font-semibold text-foreground">
            {comment.createdByUserName || "-"}
          </span>
          <span>•</span>
          <span>
            {comment.createdDate
              ? dayjs(comment.createdDate).format("DD/MM/YYYY, HH:mm")
              : "-"}
          </span>
        </div>

        <p className="mt-1 whitespace-pre-wrap break-words text-default-700">
          {comment.commentText || "-"}
        </p>

        <button
          type="button"
          onClick={() => onReply(comment.id)}
          className="mt-1 text-[11px] font-medium text-primary opacity-80 hover:opacity-100"
        >
          Reply
        </button>
      </div>

      {comment.children?.length > 0 && (
        <div className="mt-2">
          {comment.children.map((child) => (
            <CommentThread
              key={child.id}
              comment={child}
              level={level + 1}
              onReply={onReply}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default CommentThread;
