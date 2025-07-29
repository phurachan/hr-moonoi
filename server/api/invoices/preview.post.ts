import { readFileSync } from 'fs'
import { resolve } from 'path'

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event)
    
    // Read the invoice HTML template
    const templatePath = resolve(process.cwd(), 'server/template/invoice.html')
    let htmlContent = readFileSync(templatePath, 'utf8')
    
    // Use the same transformation logic from the export endpoint
    const invoiceData = transformInvoiceData(body)
    
    // Populate template with data
    htmlContent = populateTemplateWithData(htmlContent, invoiceData)
    
    // Remove scripts since we're showing in modal
    htmlContent = htmlContent.replace(/<script[\s\S]*?<\/script>/gi, '')
    
    return {
      html: htmlContent,
      success: true
    }
  } catch (error: any) {
    console.error('Error generating invoice preview:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Error generating invoice preview',
      data: error.message
    })
  }
})

function transformInvoiceData(data: any) {
  const currentDate = new Date().toLocaleDateString('th-TH')
  
  return {
    company: {
      nameTh: data.company?.nameTh || "บริษัท คอร์ดเอไอเทค จำกัด (สำนักงานใหญ่)",
      nameEn: data.company?.nameEn || "Claude AI Tech Co., Ltd.",
      address: data.company?.address || "99/101 ม.พิมุกต์ 1 เฟส 5 ซอย 6 ตำบล สันทรายน้อย อำเภอสันทราย เชียงใหม่ 50210",
      tel: data.company?.tel || "085-396-7806, 097-954-8922",
      taxId: data.company?.taxId || "0505562001590"
    },
    customer: {
      name: data.customer?.name || "",
      address: data.customer?.address || "",
      tel: data.customer?.tel || "",
      taxId: data.customer?.taxId || ""
    },
    invoice: {
      date: data.invoice?.date ? new Date(data.invoice.date).toLocaleDateString('th-TH') : currentDate,
      number: data.invoice?.number || "",
      dueDate: data.invoice?.dueDate ? new Date(data.invoice.dueDate).toLocaleDateString('th-TH') : ""
    },
    items: data.items || [],
    totals: data.totals || {
      subtotal: 0,
      vat: 0,
      total: 0,
      amountInWords: ""
    },
    reference: data.reference || "",
    payment: {
      companyName: data.payment?.companyName || "Claude AI Tech Co., Ltd.",
      accountNumber: data.payment?.accountNumber || "051-8-44336-4",
      bankInfo: data.payment?.bankInfo || "Kasikorn Bank: Central Festival Chiang Mai Branch"
    },
    signer: {
      name: data.signer || "ผู้มีอำนาจลงนาม"
    }
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
  
  // Fix logo image source to use absolute path
  result = result.replace(/(<img[^>]*src=")[^"]*("[^>]*id="logoImg"[^>]*>)/, '$1/images/logo-moonoi.png$2')
  
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
    result = result.replace(/(<span class="amount-text" id="amountText">)[^<]*(<\/span>)/, `$1${invoiceData.totals.amountInWords || ''}$2`)
  }
  
  // Reference Information
  if (invoiceData.reference && invoiceData.reference.trim()) {
    result = result.replace(/(<div class="reference-info" id="referenceInfo">)[\s\S]*?(<\/div>)/, `$1${invoiceData.reference}$2`)
  } else {
    result = result.replace(/(<div class="reference-info" id="referenceInfo">)[\s\S]*?(<\/div>)/, `$1$2`)
    result = result.replace(/<div class="reference-info" id="referenceInfo"><\/div>/, '<div class="reference-info" id="referenceInfo" style="display: none;"></div>')
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