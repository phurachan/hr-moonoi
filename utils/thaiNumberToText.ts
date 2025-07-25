/**
 * Convert number to Thai text representation
 * Supports numbers up to billions with decimal places (satang)
 */
export function convertNumberToThaiText(number: number): string {
  if (number === 0) return '(ศูนย์บาทถ้วน)'
  
  const thaiNumbers = ['', 'หนึ่ง', 'สอง', 'สาม', 'สี่', 'ห้า', 'หก', 'เจ็ด', 'แปด', 'เก้า']
  
  function convertHundreds(num: number): string {
    if (num === 0) return ''
    
    let result = ''
    const hundreds = Math.floor(num / 100)
    const remainder = num % 100
    const tens = Math.floor(remainder / 10)
    const ones = remainder % 10
    
    // Hundreds place
    if (hundreds > 0) {
      if (hundreds === 1) {
        result += 'หนึ่งร้อย'
      } else {
        result += thaiNumbers[hundreds] + 'ร้อย'
      }
    }
    
    // Tens place
    if (tens > 0) {
      if (tens === 1) {
        result += 'สิบ'
      } else if (tens === 2) {
        result += 'ยี่สิบ'
      } else {
        result += thaiNumbers[tens] + 'สิบ'
      }
    }
    
    // Ones place
    if (ones > 0) {
      if (ones === 1 && tens > 0) {
        result += 'เอ็ด'
      } else {
        result += thaiNumbers[ones]
      }
    }
    
    return result
  }
  
  // Split number into integer and decimal parts
  const absoluteNumber = Math.abs(number)
  const integerPart = Math.floor(absoluteNumber)
  const decimalPart = Math.round((absoluteNumber - integerPart) * 100) // Convert to satang (cents)
  
  let result = '('
  
  // Handle integer part (baht)
  if (integerPart === 0) {
    result += 'ศูนย์บาท'
  } else {
    // Handle millions
    const millions = Math.floor(integerPart / 1000000)
    const remainder = integerPart % 1000000
    
    if (millions > 0) {
      result += convertHundreds(millions) + 'ล้าน'
    }
    
    // Handle thousands
    const thousands = Math.floor(remainder / 1000)
    const finalRemainder = remainder % 1000
    
    if (thousands > 0) {
      if (thousands === 1) {
        result += 'หนึ่งพัน'
      } else {
        result += convertHundreds(thousands) + 'พัน'
      }
    }
    
    // Handle hundreds, tens, ones
    if (finalRemainder > 0) {
      result += convertHundreds(finalRemainder)
    }
    
    result += 'บาท'
  }
  
  // Handle decimal part (satang)
  if (decimalPart > 0) {
    if (decimalPart < 10) {
      // Single digit satang (1-9 satang)
      result += thaiNumbers[decimalPart] + 'สตางค์'
    } else {
      // Two digit satang (10-99 satang)
      const satangText = convertHundreds(decimalPart)
      result += satangText + 'สตางค์'
    }
  } else {
    result += 'ถ้วน'
  }
  
  result += ')'
  
  return result
}