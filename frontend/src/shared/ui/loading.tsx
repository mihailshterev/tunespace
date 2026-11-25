const Loading = () => {
  return (
    <div className="h-[200px]">
      <span
        className="loader bg-secondary-foreground 
      after:bg-secondary-foreground 
      before:bg-secondary-foreground"
      ></span>
    </div>
  );
};

export default Loading;
