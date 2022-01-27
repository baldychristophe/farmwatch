export const displayCurrency = (value: number) => {
  if (value < 1) {
    return value.toLocaleString(undefined, { style: "currency", currency: 'USD', maximumSignificantDigits: 4 })
  }
  return value.toLocaleString(undefined, { style: "currency", currency: 'USD' })
}

export const displayNumber = (value: number) => {
  if (value < 1) {
    return value.toLocaleString(undefined, { maximumSignificantDigits: 4 })
  }
  return value.toLocaleString()
}
