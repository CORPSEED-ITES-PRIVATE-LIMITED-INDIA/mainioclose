const Section = ({ title, children }) => {
  return (
    <div className="border rounded-xl p-4 space-y-4">
      <h3 className="text-lg font-semibold">{title}</h3>
      {children}
    </div>
  );
};

export default Section;
