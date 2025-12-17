import React from "react";

export default function TemplateDrawer({ open, onClose, templates, onSelect }) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/40">
      <div className="fixed bottom-0 left-0 right-0 max-h-[70vh] bg-white dark:bg-gray-900 rounded-t-2xl p-4 overflow-y-auto">
        <div className="flex justify-between items-center mb-3">
          <h2 className="font-semibold text-lg">⚡ Templates</h2>
          <button
            onClick={onClose}
            className="text-sm px-3 py-1 rounded bg-gray-200 dark:bg-gray-700"
          >
            Close
          </button>
        </div>

        {templates.length === 0 ? (
          <p className="text-gray-500 text-sm">No templates saved.</p>
        ) : (
          <ul className="space-y-2">
            {templates.map((t, i) => (
              <li key={i}>
                <button
                  onClick={() => onSelect(t)}
                  className="w-full flex justify-between items-center p-3 rounded bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700"
                >
                  <div className="text-left">
                    <div className="font-medium">{t.description}</div>
                    <div className="text-sm text-gray-500">
                      {t.type}
                    </div>
                  </div>
                  <div className="font-semibold">
                    ${t.amount}
                  </div>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
