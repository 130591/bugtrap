'use client'

import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'

export function RuleCreation() {
  return (
    <div className="relative flex min-h-screen justify-end p-8 bg-gray-50">
      {/* Coluna da esquerda: Conectores */}
      <div className="relative flex flex-col items-center mt-4"> {/* ↓ Ajuste de altura aqui */}
        {/* Círculo "When" */}
        <div className="relative z-10 flex items-center justify-center h-16 w-16 bg-blue-500 text-white font-bold rounded-full">
          WHEN
        </div>

        {/* Linha horizontal tracejada para o card */}
        <div className="absolute top-8 left-full ml-1 h-px w-[75px] border-t border-dashed border-blue-500" /> {/* ↓ Largura ajustada */}

        {/* Conector vertical */}
        <div className="relative w-px h-16 mt-1">
          <div className="absolute w-full h-full border-l border-dashed border-blue-500" />
        </div>

        {/* Círculo azul com "+" no final */}
        <div className="relative mt-4 flex items-center justify-center w-8 h-8 rounded-full bg-blue-500 text-white font-bold">
          +
        </div>
      </div>

      {/* Cards alinhados à direita */}
      <div className="flex flex-col gap-6 ml-20">
        {/* Card Principal */}
        <div className="rounded-md border border-gray-200 bg-white p-6 shadow-sm w-[540px]">
          <p className="mb-4 text-[12px] font-medium text-gray-800">
            This rule will be executed
          </p>

          <div className="mb-4 flex items-center space-x-6">
            <label className="flex items-center space-x-2 text-[13px] text-gray-700">
              <Checkbox id="user-actions" />
              <span>Based on User actions</span>
            </label>
            <label className="flex items-center space-x-2 text-[13px] text-gray-700">
              <Checkbox id="date-time" />
              <span>Based on Date & Time</span>
            </label>
          </div>

          <div className="mb-4 flex items-center space-x-2">
            <span className="text-[13px] text-gray-700">When a project</span>
            <Select>
              <SelectTrigger className="border-none bg-transparent p-0 text-[13px] text-gray-800 focus:outline-none focus:ring-0">
                <SelectValue placeholder="is Created" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="created">is Created</SelectItem>
                <SelectItem value="updated">is Updated</SelectItem>
                <SelectItem value="comment">Comment is added</SelectItem>
                <SelectItem value="archived">is Archived</SelectItem>
                <SelectItem value="unarchived">is UnArchived</SelectItem>
                <SelectItem value="trashed">is Trashed</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <button
            type="button"
            className="text-[13px] text-blue-600 hover:underline"
          >
            + Add Row
          </button>
        </div>

        {/* Card Condição */}
        <div className="rounded-md border border-gray-200 bg-white p-6 shadow-sm w-[540px]">
          <h3 className="mb-2 text-[13px] font-medium text-gray-800">Condition</h3>
          <p className="mb-4 text-[13px] text-gray-600">
            Add criteria to determine if it will trigger this condition.
          </p>

          <button
            type="button"
            className="text-[13px] text-blue-600 hover:underline"
          >
            + Add Criteria
          </button>
        </div>
      </div>

    </div>
  )
}
