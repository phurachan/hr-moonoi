import { validateTimesheetPermission } from '~/server/utils/timesheetPermissions'

export default defineEventHandler(async (event) => {
  try {
    // Validate permissions
    const { user } = await validateTimesheetPermission(event, 'reports.invoices')
    
    const body = await readBody(event)
    
    if (!body) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Invoice data is required'
      })
    }

    // Generate PDF using the same logic as the export endpoint
    const pdfBuffer = await generateInvoicePDF(body)
    
    // Set appropriate headers for PDF download
    setHeader(event, 'Content-Type', 'application/pdf')
    setHeader(event, 'Content-Disposition', `attachment; filename="invoice-${body.invoice?.number || 'custom'}.pdf"`)
    
    return pdfBuffer
  } catch (error: any) {
    console.error('Error generating custom invoice PDF:', error)
    
    if (error.statusCode) {
      throw error
    }
    
    throw createError({
      statusCode: 500,
      statusMessage: 'Error generating PDF',
      data: error,
    })
  }
})

async function generateInvoicePDF(invoiceData: any) {
  try {
    const { default: puppeteer } = await import('puppeteer')
    const fs = await import('fs')
    const path = await import('path')
    
    // Read the template file
    const templatePath = path.resolve(process.cwd(), 'server/template/invoice.html')
    
    if (!fs.existsSync(templatePath)) {
      throw new Error(`Template file not found: ${templatePath}`)
    }
    
    let htmlContent = fs.readFileSync(templatePath, 'utf8')
  
  // Convert logo to base64 for reliable PDF generation
  const logoPath = path.resolve(process.cwd(), 'public/images/logo-moonoi.png')
  try {
    if (fs.existsSync(logoPath)) {
      const logoBuffer = fs.readFileSync(logoPath)
      const logoBase64 = logoBuffer.toString('base64')
      const logoDataUri = `data:image/png;base64,${logoBase64}`
      htmlContent = htmlContent.replace('./public/images/logo-moonoi.png', logoDataUri)
    } else {
      // Remove the img tag if logo can't be found
      htmlContent = htmlContent.replace(/<img[^>]*src="\.\/public\/images\/logo-moonoi\.png"[^>]*>/g, '')
    }
  } catch (logoError) {
    console.error('Logo loading error:', logoError)
    // Remove the img tag if logo can't be loaded
    htmlContent = htmlContent.replace(/<img[^>]*src="\.\/public\/images\/logo-moonoi\.png"[^>]*>/g, '')
  }
  
  // Replace placeholders directly in HTML
  htmlContent = populateTemplateWithData(htmlContent, invoiceData)

  // Launch Puppeteer and generate PDF
  let browser = null
  try {
    browser = await puppeteer.launch({
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-gpu',
        '--disable-dev-shm-usage',
        '--disable-extensions',
        '--disable-plugins',
        '--disable-background-timer-throttling',
        '--disable-backgrounding-occluded-windows',
        '--disable-renderer-backgrounding'
      ],
      timeout: 60000
    })
    
    const page = await browser.newPage()
    
    // Set viewport for consistent rendering
    await page.setViewport({ width: 1200, height: 800 })
    
    // Set content and wait for it to load
    await page.setContent(htmlContent, { 
      waitUntil: 'domcontentloaded' 
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
    
    return pdfBuffer
  } catch (puppeteerError: any) {
    console.error('Puppeteer PDF generation failed:', {
      message: puppeteerError?.message,
      stack: puppeteerError?.stack,
      name: puppeteerError?.name
    })
    throw new Error(`PDF generation failed: ${puppeteerError?.message || 'Unknown Puppeteer error'}`)
  } finally {
    if (browser) {
      try {
        await browser.close()
      } catch (closeError) {
        console.warn('Error closing browser:', closeError)
      }
    }
  }
  } catch (error: any) {
    console.error('PDF generation error:', error)
    throw new Error(`Failed to generate PDF: ${error.message}`)
  }
}

function populateTemplateWithData(htmlContent: string, invoiceData: any): string {
  let result = htmlContent
  
  // Company Information
  if (invoiceData.company) {
    result = result.replace(/(<div class="company-name-th" id="companyNameTh">)[^<]*(<\/div>)/, `$1${invoiceData.company.nameTh || ''}$2`)
    result = result.replace(/(<div class="company-name-en" id="companyNameEn">)[^<]*(<\/div>)/, `$1${invoiceData.company.nameEn || ''}$2`)
    result = result.replace(/(<span id="tel">)[^<]*(<\/span>)/, `$1${invoiceData.company.tel || ''}$2`)
    result = result.replace(/(<span id="taxId">)[^<]*(<\/span>)/, `$1${invoiceData.company.taxId || ''}$2`)
  }
  
  // Customer Information
  if (invoiceData.customer) {
    result = result.replace(/(<span id="customerName">)[^<]*(<\/span>)/, `$1${invoiceData.customer.name || ''}$2`)
    result = result.replace(/(<div id="customerAddress">)[\s\S]*?(<\/div>)/, `$1${invoiceData.customer.address?.replace(/\n/g, '<br>') || ''}$2`)
    result = result.replace(/(<span id="customerTel">)[^<]*(<\/span>)/, `$1${invoiceData.customer.tel || ''}$2`)
  }
  
  // Invoice Meta
  if (invoiceData.invoice) {
    const invoiceDate = invoiceData.invoice.date ? new Date(invoiceData.invoice.date).toLocaleDateString('th-TH') : ''
    const dueDate = invoiceData.invoice.dueDate ? new Date(invoiceData.invoice.dueDate).toLocaleDateString('th-TH') : ''
    
    result = result.replace(/(<span id="invoiceDate">)[^<]*(<\/span>)/, `$1${invoiceDate}$2`)
    result = result.replace(/(<span id="invoiceNo">)[^<]*(<\/span>)/, `$1${invoiceData.invoice.number || ''}$2`)
    result = result.replace(/(<span id="dueDate">)[^<]*(<\/span>)/, `$1${dueDate}$2`)
  }
  
  // Items Table
  if (invoiceData.items && invoiceData.items.length > 0) {
    const itemsHtml = invoiceData.items.map((item: any, index: number) => `
                <tr>
                    <td>${index + 1}</td>
                    <td class="description">${item.description || ''}</td>
                    <td>${item.quantity || ''}</td>
                    <td>${item.unitPrice ? Number(item.unitPrice).toLocaleString() : ''}</td>
                    <td>${item.totalPrice ? Number(item.totalPrice).toLocaleString() : ''}</td>
                </tr>`).join('')
    
    result = result.replace(
      /(<tbody id="itemsTableBody">)[\s\S]*?(<\/tbody>)/,
      `$1${itemsHtml}
            $2`
    )
  }
  
  // Totals
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
    result = result.replace(/(<span id="signerName">)[^<]*(<\/span>)/, `$1${invoiceData.signer || ''}$2`)
  }
  
  return result
}