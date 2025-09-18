"use client";

interface UploadLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle: string;
  error?: string | null;
  onSubmit: (e: React.FormEvent) => void;
  onCancel: () => void;
  submitButtonText: string;
  submitButtonColor?: "blue" | "green";
  isSubmitting?: boolean;
  isSubmitDisabled?: boolean;
}

const UploadLayout = ({
  children,
  title,
  subtitle,
  error,
  onSubmit,
  onCancel,
  submitButtonText,
  submitButtonColor = "blue",
  isSubmitting = false,
  isSubmitDisabled = false,
}: UploadLayoutProps) => {
  const buttonColorClasses = {
    blue: "bg-blue-600 hover:bg-blue-700",
    green: "bg-green-600 hover:bg-green-700",
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <h1 className="text-2xl font-bold text-gray-900">
              {title}
            </h1>
            <p className="text-gray-600 mt-2">
              {subtitle}
            </p>
          </div>

          <form onSubmit={onSubmit} className="p-6">
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-6">
                <div className="text-red-800">{error}</div>
              </div>
            )}

            {/* Two Column Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {children}
            </div>

            {/* Submit Button */}
            <div className="flex justify-end space-x-reverse space-x-4 mt-8 pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={onCancel}
                disabled={isSubmitting}
                className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 disabled:opacity-50 transition-colors"
              >
                ביטול
              </button>
              <button
                type="submit"
                disabled={isSubmitDisabled || isSubmitting}
                className={`px-6 py-2 ${buttonColorClasses[submitButtonColor]} text-white rounded-md disabled:opacity-50 disabled:cursor-not-allowed transition-colors`}
              >
                {isSubmitting ? "מעבד..." : submitButtonText}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default UploadLayout;
