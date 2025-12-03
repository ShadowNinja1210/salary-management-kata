// Salary calculation service
// TDS rates by country: India = 10%, USA = 12%, Others = 0%

export function calculateSalary(gross: string | number, country: string) {
  const grossValue = typeof gross === "string" ? Number.parseFloat(gross) : gross

  let tdsPercent = 0
  if (/^india$/i.test(country)) {
    tdsPercent = 10
  } else if (/^united ?states$|^usa$|^us$/i.test(country)) {
    tdsPercent = 12
  }

  const tds = (grossValue * tdsPercent) / 100
  const net = grossValue - tds

  return {
    gross: grossValue.toFixed(2),
    tds: tds.toFixed(2),
    net: net.toFixed(2),
  }
}

export function calculateNetSalary(grossSalary: number, country: string): number {
  let tdsRate = 0

  if (country === "India") {
    tdsRate = 0.1 // 10%
  } else if (country === "USA") {
    tdsRate = 0.12 // 12%
  }
  // Others: 0%

  const tdsAmount = grossSalary * tdsRate
  return grossSalary - tdsAmount
}

export function calculateTDS(grossSalary: number, country: string): number {
  let tdsRate = 0

  if (country === "India") {
    tdsRate = 0.1 // 10%
  } else if (country === "USA" || /^united ?states$/i.test(country)) {
    tdsRate = 0.12 // 12%
  }
  // Others: 0%

  return grossSalary * tdsRate
}
