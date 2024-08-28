export const EmptyState = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="flex items-center justify-center h-full text-muted-foreground">
      {children}
    </div>
  );
};
