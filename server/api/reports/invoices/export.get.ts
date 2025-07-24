import { connectMongoDB } from '~/lib/mongodb'
import { validateTimesheetPermission } from '~/server/utils/timesheetPermissions'

export default defineEventHandler(async (event) => {
  await connectMongoDB()
  
  try {
    // Validate permissions
    const { user } = await validateTimesheetPermission(event, 'reports.invoices')
    
    const query = getQuery(event)
    const { format = 'pdf' } = query
    
    // Get invoice data using the same logic as the main endpoint
    let invoiceData
    try {
      invoiceData = await $fetch('/api/reports/invoices', {
        query: {
          ...query,
          format: undefined // Remove format from the query
        },
        headers: {
          // Forward the authorization header
          authorization: getHeader(event, 'authorization') || ''
        }
      })
    } catch (error: any) {
      console.error('Error fetching invoice data for export:', error)
      
      // Provide sample data if the main endpoint fails
      invoiceData = {
        period: {
          startDate: query.startDate || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          endDate: query.endDate || new Date().toISOString().split('T')[0]
        },
        summary: {
          totalHours: 0,
          billableHours: 0,
          totalAmount: 0,
          billableAmount: 0,
          billablePercentage: 0
        },
        entries: [],
        metadata: {
          totalEntries: 0,
          uniqueEmployees: 0,
          uniqueProjects: 0,
          generatedAt: new Date().toISOString(),
          generatedBy: 'System'
        }
      }
    }
    
    if (format === 'pdf') {
      try {
        return await generatePDF(invoiceData, query, event)
      } catch (pdfError: any) {
        console.error('PDF generation error:', pdfError)
        throw createError({
          statusCode: 500,
          statusMessage: 'Error generating PDF: ' + (pdfError?.message || 'Unknown error')
        })
      }
    } else if (format === 'excel') {
      try {
        return await generateExcel(invoiceData, query, event)
      } catch (excelError: any) {
        console.error('Excel generation error:', excelError)
        throw createError({
          statusCode: 500,
          statusMessage: 'Error generating Excel: ' + (excelError?.message || 'Unknown error')
        })
      }
    } else {
      throw createError({
        statusCode: 400,
        statusMessage: 'Invalid export format. Supported formats: pdf, excel'
      })
    }
  } catch (error: any) {
    console.error('Error exporting invoice report:', error)
    
    if (error.statusCode) {
      throw error
    }
    
    throw createError({
      statusCode: 500,
      statusMessage: 'Error exporting invoice report',
      data: error,
    })
  }
})

function transformTimesheetToInvoice(data: any, query: any) {
  const startDate = query.startDate ? new Date(query.startDate).toLocaleDateString('th-TH') : 'N/A'
  const endDate = query.endDate ? new Date(query.endDate).toLocaleDateString('th-TH') : 'N/A'
  const currentDate = new Date().toLocaleDateString('th-TH')
  
  // Group entries by employee and project for invoice items
  const groupedItems = data.entries ? data.entries.reduce((acc: any, entry: any) => {
    const key = `${entry.employeeName}-${entry.project || 'General'}`
    if (!acc[key]) {
      acc[key] = {
        employeeName: entry.employeeName,
        project: entry.project || 'General',
        totalHours: 0,
        totalAmount: 0,
        entries: []
      }
    }
    acc[key].totalHours += entry.hours
    acc[key].totalAmount += entry.amount
    acc[key].entries.push(entry)
    return acc
  }, {}) : {}
  
  const items = Object.values(groupedItems).map((group: any) => ({
    description: `${group.project} - ${group.employeeName} (${startDate} - ${endDate})`,
    quantity: Math.round(group.totalHours * 100) / 100,
    unitPrice: group.totalHours > 0 ? Math.round((group.totalAmount / group.totalHours) * 100) / 100 : 0,
    totalPrice: Math.round(group.totalAmount * 100) / 100
  }))
  
  const subtotal = data.summary?.billableAmount || 0
  const vat = Math.round(subtotal * 0.07 * 100) / 100
  const total = Math.round((subtotal + vat) * 100) / 100
  
  return {
    company: {
      nameTh: "บริษัท หมูน้อย ฟอร์เวิร์ด จำกัด (สำนักงานใหญ่)",
      nameEn: "Moonoi Forward Co., Ltd.",
      address: "99/101 ม.พิมุกต์ 1 เฟส 5 ซอย 6 ตำบล สันทรายน้อย อำเภอสันทราย เชียงใหม่ 50210<br>Tel. 085-396-7806, 097-954-8922 Tax ID: 0505562001590",
      tel: "085-396-7806, 097-954-8922",
      taxId: "0505562001590"
    },
    customer: {
      name: "ลูกค้า (Customer)",
      address: "ที่อยู่ลูกค้า<br>Customer Address",
      tel: "หมายเลขโทรศัพท์"
    },
    invoice: {
      date: currentDate,
      number: `IV${new Date().getFullYear()}${String(new Date().getMonth() + 1).padStart(2, '0')}${String(new Date().getDate()).padStart(2, '0')}`,
      dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString('th-TH')
    },
    items: items,
    totals: {
      subtotal: subtotal,
      vat: vat,
      total: total,
      amountInWords: convertNumberToThaiText(total)
    },
    reference: `* รายงานการทำงาน ระหว่างวันที่ ${startDate} ถึง ${endDate} จำนวน ${data.summary?.totalHours || 0} ชั่วโมง`,
    payment: {
      companyName: "Moonoi Forward Co., Ltd.",
      accountNumber: "051-8-44336-4",
      bankInfo: "Kasikorn Bank: Central Festival Chiang Mai Branch"
    },
    signer: {
      name: "ผู้มีอำนาจลงนาม"
    }
  }
}

function convertNumberToThaiText(number: number): string {
  // Simple Thai number to text conversion (basic implementation)
  // In production, you'd want a more comprehensive conversion
  const thaiNumbers = ['', 'หนึ่ง', 'สอง', 'สาม', 'สี่', 'ห้า', 'หก', 'เจ็ด', 'แปด', 'เก้า']
  
  if (number === 0) return '(ศูนย์บาทถ้วน)'
  
  const numberStr = Math.floor(number).toString()
  let result = '('
  
  // Simple conversion - just convert the integer part
  if (number < 10) {
    result += thaiNumbers[Math.floor(number)]
  } else if (number < 100) {
    const tens = Math.floor(number / 10)
    const ones = Math.floor(number % 10)
    if (tens === 1) {
      result += 'สิบ'
    } else {
      result += thaiNumbers[tens] + 'สิบ'
    }
    if (ones > 0) {
      result += thaiNumbers[ones]
    }
  } else {
    result += numberStr // Fallback to number for complex cases
  }
  
  result += 'บาตถ้วน)'
  return result
}

function populateTemplateWithData(htmlContent: string, invoiceData: any): string {
  let result = htmlContent
  
  // Company Information - match the actual HTML structure from template
  if (invoiceData.company) {
    result = result.replace(/(<div class="company-name-th" id="companyNameTh">)[^<]*(<\/div>)/, `$1${invoiceData.company.nameTh || ''}$2`)
    result = result.replace(/(<div class="company-name-en" id="companyNameEn">)[^<]*(<\/div>)/, `$1${invoiceData.company.nameEn || ''}$2`)
    result = result.replace(/(<span id="tel">)[^<]*(<\/span>)/, `$1${invoiceData.company.tel || ''}$2`)
    result = result.replace(/(<span id="taxId">)[^<]*(<\/span>)/, `$1${invoiceData.company.taxId || ''}$2`)
    // Update company address in the div with id="companyAddress" - but this doesn't exist, so update the div structure
    result = result.replace(/(99\/101 ม\.พิมุกต์ 1 เฟส 5 ซอย 6 ตำบล สันทรายน้อย อำเภอสันทราย เชียงใหม่ 50210<br>\s*Tel\. )[^T]*(Tel\. [^T]*Tax ID: )[^<]*/, 
      `$1${invoiceData.company.tel || ''}$2${invoiceData.company.taxId || ''}`)
  }
  
  // Customer Information
  if (invoiceData.customer) {
    result = result.replace(/(<span id="customerName">)[^<]*(<\/span>)/, `$1${invoiceData.customer.name || ''}$2`)
    result = result.replace(/(<div id="customerAddress">)[\s\S]*?(<\/div>)/, `$1${invoiceData.customer.address || ''}$2`)
    result = result.replace(/(<span id="customerTel">)[^<]*(<\/span>)/, `$1${invoiceData.customer.tel || ''}$2`)
  }
  
  // Invoice Meta
  if (invoiceData.invoice) {
    result = result.replace(/(<span id="invoiceDate">)[^<]*(<\/span>)/, `$1${invoiceData.invoice.date || ''}$2`)
    result = result.replace(/(<span id="invoiceNo">)[^<]*(<\/span>)/, `$1${invoiceData.invoice.number || ''}$2`)
    result = result.replace(/(<span id="dueDate">)[^<]*(<\/span>)/, `$1${invoiceData.invoice.dueDate || ''}$2`)
  }
  
  // Items Table - Replace the tbody content properly
  if (invoiceData.items && invoiceData.items.length > 0) {
    const itemsHtml = invoiceData.items.map((item: any, index: number) => `
                <tr>
                    <td>${index + 1}</td>
                    <td class="description">${item.description || ''}</td>
                    <td>${item.quantity || ''}</td>
                    <td>${item.unitPrice ? Number(item.unitPrice).toLocaleString() : ''}</td>
                    <td>${item.totalPrice ? Number(item.totalPrice).toLocaleString() : ''}</td>
                </tr>`).join('')
    
    // Replace the tbody content between the tags
    result = result.replace(
      /(<tbody id="itemsTableBody">)[\s\S]*?(<\/tbody>)/,
      `$1${itemsHtml}
            $2`
    )
  }
  
  // Totals - Fix the table closing tags
  if (invoiceData.totals) {
    result = result.replace(/(<td style="text-align: right" id="subtotal">)[^<]*(<\/td>)/, `$1${invoiceData.totals.subtotal ? Number(invoiceData.totals.subtotal).toLocaleString() : '0'}$2`)
    result = result.replace(/(<td style="text-align: right" id="vat">)[^<]*(<\/td>)/, `$1${invoiceData.totals.vat ? Number(invoiceData.totals.vat).toLocaleString() : '0'}$2`)
    result = result.replace(/(<td style="text-align: right" id="total">)[^<]*(<\/td>)/, `$1${invoiceData.totals.total ? Number(invoiceData.totals.total).toLocaleString() : '0'}$2`)
    result = result.replace(/(<div class="amount-text" id="amountText">)[^<]*(<\/div>)/, `$1${invoiceData.totals.amountInWords || ''}$2`)
  }
  
  // Reference Information
  if (invoiceData.reference) {
    result = result.replace(/(<div class="reference-info" id="referenceInfo">)[\s\S]*?(<\/div>)/, `$1
            ${invoiceData.reference || ''}
        $2`)
  }
  
  // Payment Information
  if (invoiceData.payment) {
    result = result.replace(/(<span id="paymentCompany">)[^<]*(<\/span>)/, `$1${invoiceData.payment.companyName || ''}$2`)
    result = result.replace(/(<span id="accountNumber">)[^<]*(<\/span>)/, `$1${invoiceData.payment.accountNumber || ''}$2`)
    result = result.replace(/(<span id="bankName">)[^<]*(<\/span>)/, `$1${invoiceData.payment.bankInfo || ''}$2`)
  }
  
  // Signer
  if (invoiceData.signer) {
    result = result.replace(/(<span id="signerName">)[^<]*(<\/span>)/, `$1${invoiceData.signer.name || ''}$2`)
  }
  
  return result
}

async function generatePDF(data: any, query: any, event: any) {
  // Generate PDF using Puppeteer with external template
  const puppeteer = await import('puppeteer')
  const fs = await import('fs')
  const path = await import('path')
  
  // Read the template file
  const templatePath = path.resolve(process.cwd(), 'server/template/invoice.html')
  let htmlContent = fs.readFileSync(templatePath, 'utf8')
  
  // Transform timesheet data to invoice format
  const invoiceData = transformTimesheetToInvoice(data, query)
  
  // Replace placeholders directly in HTML instead of using JavaScript
  htmlContent = populateTemplateWithData(htmlContent, invoiceData)

  // Launch Puppeteer and generate PDF
  let browser = null
  try {
    browser = await puppeteer.default.launch({
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-gpu',
        '--disable-dev-shm-usage'
      ]
    })
    
    const page = await browser.newPage()
    
    // Set viewport for consistent rendering
    await page.setViewport({ width: 1200, height: 800 })
    
    // Set content and wait for fonts/images to load
    await page.setContent(htmlContent, { 
      waitUntil: ['networkidle0', 'domcontentloaded'] 
    })
    
    // Generate PDF with options
    const pdfBuffer = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: {
        top: '0.5in',
        right: '0.5in',
        bottom: '0.5in',
        left: '0.5in'
      },
      displayHeaderFooter: false,
      preferCSSPageSize: false
    })
    
    // Set appropriate headers for PDF download
    setHeader(event, 'Content-Type', 'application/pdf')
    setHeader(event, 'Content-Disposition', `attachment; filename="invoice-report-${new Date().toISOString().split('T')[0]}.pdf"`)
    
    return pdfBuffer
  } catch (puppeteerError: any) {
    console.error('Puppeteer PDF generation failed:', puppeteerError)
    throw new Error('PDF generation failed: ' + (puppeteerError?.message || 'Unknown error'))
  } finally {
    if (browser) {
      await browser.close()
    }
  }
}

async function generateExcel(data: any, query: any, event: any) {
  // Import CSV utilities for proper escaping
  const { arrayToCsvRow, addCsvSummary } = await import('~/utils/csvUtils')
  
  // Start with summary at the top
  let csvContent = 'INVOICE REPORT SUMMARY'
  
  // Add summary section first
  csvContent += '\n\nOVERALL TOTALS'
  const summaryData = {
    'Total Hours': data.summary.totalHours || 0,
    'Billable Hours': data.summary.billableHours || 0,
    'Total Amount': `$${(data.summary.totalAmount || 0).toFixed(2)}`,
    'Billable Amount': `$${(data.summary.billableAmount || 0).toFixed(2)}`,
    'Billable Percentage': `${(data.summary.billablePercentage || 0).toFixed(1)}%`
  }
  
  Object.entries(summaryData).forEach(([key, value]) => {
    csvContent += '\n' + arrayToCsvRow([key, value])
  })
  
  // Add metadata information
  if (data.metadata) {
    csvContent += '\n\nREPORT METADATA'
    csvContent += '\n' + arrayToCsvRow(['Total Entries', data.metadata.totalEntries || 0])
    csvContent += '\n' + arrayToCsvRow(['Unique Employees', data.metadata.uniqueEmployees || 0])
    csvContent += '\n' + arrayToCsvRow(['Unique Projects', data.metadata.uniqueProjects || 0])
    csvContent += '\n' + arrayToCsvRow(['Generated At', new Date(data.metadata.generatedAt || new Date()).toLocaleString()])
  }
  
  // Add detailed records section
  const headers = ['Date', 'Employee', 'Department', 'Project', 'Description', 'Hours', 'Rate', 'Amount', 'Billable', 'Overtime', 'Status']
  
  csvContent += '\n\nDETAILED RECORDS'
  csvContent += '\n' + arrayToCsvRow(headers)
  
  // Add data rows with proper escaping
  if (data.entries && data.entries.length > 0) {
    const dataRows = data.entries.map((entry: any) => 
      arrayToCsvRow([
        new Date(entry.date).toLocaleDateString(),
        entry.employeeName || '',
        entry.department || '',
        entry.project || '',
        entry.description || '', // Now properly escaped by arrayToCsvRow
        entry.hours || 0,
        entry.rate || 0,
        (entry.amount || 0).toFixed(2),
        entry.isBillable ? 'Yes' : 'No',
        entry.isOT ? 'Yes' : 'No',
        entry.status || ''
      ])
    )
    csvContent += '\n' + dataRows.join('\n')
  } else {
    csvContent += '\n' + arrayToCsvRow(['No timesheet data found for the selected period'])
  }
  
  // Set appropriate headers for CSV download
  setHeader(event, 'Content-Type', 'text/csv; charset=utf-8')
  setHeader(event, 'Content-Disposition', `attachment; filename="invoice-report-${new Date().toISOString().split('T')[0]}.csv"`)
  
  return csvContent
}