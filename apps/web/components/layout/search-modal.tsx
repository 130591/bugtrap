'use client'

import { useEffect, useState } from 'react'
import { FC } from 'react'
import { Search } from 'lucide-react'

interface SearchModalProps {
  show: boolean;
  onClose: () => void;
}

export const SearchModal: FC<SearchModalProps> = ({ show, onClose }) =>  {
  const [searchTerm, setSearchTerm] = useState('')
  const [highlightedIndex, setHighlightedIndex] = useState<number | null>(null)
	const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    if (show) {
      setIsVisible(true)
    } else {

      const timer = setTimeout(() => setIsVisible(false), 300)
      return () => clearTimeout(timer)
    }
  }, [show])

  const results = [
    { label: 'Projeto Alpha', icon: <Search size={14} /> },
    { label: 'Tarefa Beta', icon: <Search size={14} /> },
    { label: 'Usuário João', icon: <Search size={14} /> },
  ]

	if (!isVisible && !show) return null

  return (
    <>
      <button
        onClick={() => onClose()}
        className="p-2 rounded-lg transition duration-300 hover:bg-blue-500/30 cursor-pointer"
      >
        <Search size={15} />
      </button>

      {show && (
        <div className={`fixed inset-0 z-40 bg-black/50 ${show ? 'animate-fade-in' : 'animate-fade-out'}`}>
          <div className="absolute top-8 left-1/2 transform -translate-x-1/2 bg-white w-full max-w-xl min-w-[400px] rounded-md shadow-md px-4 py-3 flex items-center gap-2 z-50">
            <Search size={18} className="text-blue-500 shrink-0" />
            <input
              type="text"
              placeholder="Type here and press Enter to start your seach"
              className="flex-1 text-sm focus:outline-none placeholder-gray-500 bg-transparent"
              style={{ border: 'none', boxShadow: 'none' }}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <button
              onClick={() => {
                onClose()
                setSearchTerm('')
              }}
              className="text-gray-500 hover:text-gray-700 text-lg cursor-pointer"
            >
              ✕
            </button>
          </div>

          {searchTerm && results.length > 0 && (
            <div className="absolute top-[100px] left-1/2 transform -translate-x-1/2 bg-white border rounded-md shadow-lg w-full max-w-xl min-w-[400px] z-40">
              {results.map((item, i) => (
                <div
                  key={i}
                  className={`flex items-center gap-2 px-4 py-2 text-sm cursor-pointer ${
                    highlightedIndex === i ? 'bg-blue-100' : 'hover:bg-gray-100'
                  }`}
                  onMouseEnter={() => setHighlightedIndex(i)}
                  onClick={() => {
                    alert(`Você selecionou: ${item.label}`)
                    onClose()
                    setSearchTerm('')
                  }}
                >
                  {item.icon}
                  {item.label}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </>
  )
}
