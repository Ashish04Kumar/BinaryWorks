// A feature point written as "Heading: detail": the heading in bold, then the detail.
const Highlight = ({ text }: { text: string }) => {
  const at = text.indexOf(": ");
  if (at < 0) return <>{text}</>;
  return (
    <>
      <b className="font-semibold theme-text-primary">{text.slice(0, at)}.</b> {text.slice(at + 2)}
    </>
  );
};

export default Highlight;
