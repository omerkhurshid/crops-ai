'use client'
import { useState } from 'react'
export function ProfitCalculator() {
  const [acres, setAcres] = useState<number>(0)
  const [profitPerAcre] = useState(45) // Based on research showing $45/acre improvement
  const totalProfit = acres * profitPerAcre
  return (
    <div className="bg-gradient-to-r from-green-50 to-sage-50 p-6 rounded-xl border border-[#DDE4D8] mb-6 max-w-2xl mx-auto">
      <h3 className="text-lg font-semibold text-[#1A1A1A] mb-3">Your Potential Additional Profit:</h3>
      <div className="flex items-center justify-center gap-4 mb-3">
        <input 
          type="number" 
          placeholder="Farm size (acres)" 
          className="px-4 py-2 border border-[#DDE4D8] rounded-lg w-40 text-center"
          value={acres || ''}
          onChange={(e) => setAcres(parseInt(e.target.value) || 0)}
        />
        <span className="text-[#555555]">×</span>
        <span className="text-[#1A1A1A] font-medium">${profitPerAcre}/acre</span>
        <span className="text-[#555555]">=</span>
        <div className="text-2xl font-bold text-green-600">
          ${totalProfit.toLocaleString()}/year
        </div>
      </div>
      <p className="text-sm text-[#555555] text-center">
        Based on industry studies showing precision agriculture increases profits by $45/acre on average.
      </p>
    </div>
  )
}