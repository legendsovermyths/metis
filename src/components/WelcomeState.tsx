const WelcomeState = () => {
  return (
    <div className="flex-1 flex items-center justify-center px-4 pb-24">
      <div className="text-center max-w-md animate-fade-in">
        <h1 className="font-serif text-4xl font-light tracking-tight mb-3">
          Metis
        </h1>
        <p className="text-muted-foreground font-sans text-sm leading-relaxed">
          Ask a question or name a topic.<br />
          I'll teach you, clearly and calmly.
        </p>
      </div>
    </div>
  );
};

export default WelcomeState;
