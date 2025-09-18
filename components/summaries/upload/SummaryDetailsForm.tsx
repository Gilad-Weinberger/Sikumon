"use client";

interface SummaryDetailsFormProps {
  formData: {
    name: string;
    description: string;
  };
  setFormData: React.Dispatch<
    React.SetStateAction<{
      name: string;
      description: string;
    }>
  >;
  disabled?: boolean;
}

const SummaryDetailsForm = ({
  formData,
  setFormData,
  disabled = false,
}: SummaryDetailsFormProps) => {
  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <h3 className="text-lg font-medium text-gray-900">פרטי הסיכום</h3>
        <div>
          <label
            htmlFor="name"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            נושא הסיכום *
          </label>
          <input
            type="text"
            id="name"
            required
            value={formData.name}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, name: e.target.value }))
            }
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-right"
            placeholder="הזן נושא תיאורי לסיכום שלך"
            disabled={disabled}
          />
        </div>

        <div>
          <label
            htmlFor="description"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            תיאור
          </label>
          <textarea
            id="description"
            rows={8}
            value={formData.description}
            onChange={(e) =>
              setFormData((prev) => ({
                ...prev,
                description: e.target.value,
              }))
            }
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none text-right"
            placeholder="הוסף תיאור כדי לעזור לאחרים להבין את הסיכום שלך (אופציונלי)"
            disabled={disabled}
          />
        </div>
      </div>
    </div>
  );
};

export default SummaryDetailsForm;
