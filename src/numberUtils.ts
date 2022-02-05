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

export const displayPercentage = (value: number) => {
  const percentagedValue = value * 100
  if (percentagedValue < 1) {
    return `${percentagedValue.toLocaleString(undefined, { maximumSignificantDigits: 2 })}%`
  }
  return `${percentagedValue.toLocaleString(undefined, { maximumFractionDigits: 2, minimumFractionDigits: 2 })}%`
}
