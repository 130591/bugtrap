import { useRef, useState } from 'react'
import { ChevronDown } from 'lucide-react'
import { SearchableSelect } from '../ui/searchable-select'

export const ReminderPopover = () => {
  const [open, setOpen] = useState(false)
  const [reminderType, setReminderType] = useState(null)
  const [hour, setHour] = useState(null)
  const [minute, setMinute] = useState(null)
  const [amPm, setAmPm] = useState(null)

  const reminderTypeOptions = [
    { label: 'Daily', value: 'daily' },
    { label: 'Weekly', value: 'weekly' },
    { label: 'Monthly', value: 'monthly' },
  ]

  const hourOptions = Array.from({ length: 12 }, (_, i) => ({
    label: String(i + 1).padStart(2, '0'),
    value: i + 1,
  }))

  const minuteOptions = Array.from({ length: 60 }, (_, i) => ({
    label: String(i).padStart(2, '0'),
    value: i,
  }))

  const amPmOptions = [
    { label: 'AM', value: 'am' },
    { label: 'PM', value: 'pm' },
  ]

  return (
    <div className="relative">
      <div
        onClick={() => setOpen(!open)}
        className="w-full px-3 py-2 border rounded-md text-[13px] flex items-center justify-between cursor-pointer bg-white"
      >
        Select Reminder
        <ChevronDown className="ml-2 w-4 h-4 text-gray-500" />
      </div>

      {/* Dropdown suspenso */}
      {open && (
        <div className="absolute top-[110%] left-0 z-50 w-[340px] bg-white border shadow-lg rounded-md p-4 text-[13px] space-y-4">
          <div className="font-semibold text-gray-800">Reminder Options</div>

          <div className="space-y-2">
            <div className="text-gray-700">Reminder Type</div>
						<SearchableSelect
							options={hourOptions.map((item) => item.label)}
							placeholder="12"
							label=''
						/>
          </div>

          <div className="grid grid-cols-3 gap-2">
            <div>
              <div className="text-gray-700 mb-1">Hour</div>
              <SearchableSelect
                options={hourOptions.map((item) => item.label)}
                placeholder="12"
                label=''
              />
            </div>
            <div>
              <div className="text-gray-700 mb-1">Minute</div>
              <SearchableSelect
                options={minuteOptions.map((item) => item.label)}
                placeholder="00"
                label=''
              />
            </div>
            <div>
              <div className="text-gray-700 mb-1">AM/PM</div>
              <SearchableSelect
                options={amPmOptions.map((item) => item.label)}
                placeholder="AM"
								label=''
              />
            </div>
          </div>

          <label className="flex items-center gap-2 text-gray-600 text-[13px] mt-2">
            <input type="checkbox" />
            Notify users associated with the Bug
          </label>

          <button
            onClick={() => setOpen(false)}
            className="w-full bg-blue-500 text-white rounded-md py-2 text-[13px] hover:bg-blue-600"
          >
            Set Reminder
          </button>
        </div>
      )}
    </div>
  )
}
