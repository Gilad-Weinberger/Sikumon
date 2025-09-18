"use client";

interface FileSectionProps {
  children: React.ReactNode;
  title?: string;
  showTitle?: boolean;
}

const FileSection = ({
  children,
  title = "קבצי הסיכום",
  showTitle = true,
}: FileSectionProps) => {
  return (
    <div className="space-y-6">
      {showTitle && (
        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-4">{title}</h3>
        </div>
      )}
      {children}
    </div>
  );
};

export default FileSection;
