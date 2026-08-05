const Section = ({ title, children }) => {
  return (
    <div className="border rounded-xl p-3 space-y-2.5">
      <h3 className="text-[13px] font-semibold">{title}</h3>
      {children}
    </div>
  );
};

export default Section;
