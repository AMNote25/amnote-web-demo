import React from "react"

interface SubmitButtonProps {
  isLoading: boolean
  label: string
  loadingLabel: string
}

const SubmitButton: React.FC<SubmitButtonProps> = ({ isLoading, label, loadingLabel }) => (
  <button
    type="submit"
    disabled={isLoading}
    className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-linear-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-105"
  >
    {isLoading ? (
      <div className="flex items-center">
        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
        {loadingLabel}
      </div>
    ) : (
      label
    )}
  </button>
)

export default SubmitButton