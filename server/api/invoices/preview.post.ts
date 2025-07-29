// HTML template embedded as constant for serverless deployment
const INVOICE_TEMPLATE = `<!DOCTYPE html>
<html lang="th">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>ใบวางบิล/ใบแจ้งหนี้</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: 'Sarabun', Arial, sans-serif;
            font-size: 14px;
            line-height: 1.4;
            background: white;
            color: #333;
        }

        .invoice-container {
            max-width: 800px;
            margin: 20px auto;
            padding: 20px;
            background: white;
            box-shadow: 0 0 10px rgba(0,0,0,0.1);
        }

        .header {
            display: flex;
            align-items: flex-start;
            margin-bottom: 20px;
            border-bottom: 2px solid #333;
            padding-bottom: 15px;
        }

        .company-info {
            flex: 1;
            margin-left: 20px;
        }

        .company-name-th {
            font-size: 18px;
            font-weight: bold;
            margin-bottom: 5px;
        }

        .company-name-en {
            font-size: 16px;
            font-weight: bold;
            margin-bottom: 8px;
        }

        .company-address {
            font-size: 12px;
            margin-bottom: 8px;
            line-height: 1.5;
        }

        .logo {
            width: 120px;
            height: 80px;
            display: flex;
            align-items: center;
            justify-content: center;
        }

        .logo img {
            max-width: 100%;
            max-height: 100%;
            object-fit: contain;
        }

        .invoice-title {
            text-align: center;
            margin: 20px 0;
        }

        .invoice-title h2 {
            font-size: 20px;
            margin-bottom: 5px;
        }

        .invoice-title .subtitle {
            font-size: 16px;
            color: #666;
        }

        .invoice-details {
            display: flex;
            justify-content: space-between;
            margin-bottom: 30px;
        }

        .customer-info {
            flex: 1;
            padding-right: 20px;
        }

        .invoice-meta {
            width: 200px;
            border: 2px solid #333;
            padding: 10px;
        }

        .invoice-meta div {
            margin-bottom: 5px;
            font-weight: bold;
        }

        .items-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 20px;
        }

        .items-table th,
        .items-table td {
            border: 1px solid #333;
            padding: 8px;
            text-align: center;
        }

        .items-table th {
            background-color: #f5f5f5;
            font-weight: bold;
        }

        .items-table .description {
            text-align: left;
        }

        .totals {
            margin-left: auto;
            width: 500px;
        }

        .totals table {
            width: 100%;
            border-collapse: collapse;
        }

        .totals td {
            padding: 5px 10px;
            border: 1px solid #333;
        }

        .totals td:first-child {
            width: 30%;
        }

        .totals td:nth-child(2) {
            width: 40%;
            text-align: center;
        }

        .totals td:last-child {
            width: 30%;
        }

        .totals .total-row {
            font-weight: bold;
            background-color: #f5f5f5;
        }

        .reference-info {
            font-size: 12px;
            margin: 20px 0 10px 0;
            padding: 10px;
            background-color: #f8f9fa;
            border: 1px solid #e0e0e0;
            color: #666;
            line-height: 1.4;
        }

        .payment-info {
            margin: 30px 0;
            border: 1px solid #ccc;
            padding: 15px;
            background-color: #f9f9f9;
        }

        .payment-info h3 {
            margin-bottom: 10px;
        }

        .signature-section {
            margin-top: 50px;
            text-align: center;
            width: 250px;
            margin-left: auto;
            margin-right: 0;
        }

        .signature-line {
            border-bottom: 1px solid #333;
            width: 200px;
            margin: 20px auto 5px auto;
        }

        .amount-text {
            font-size: 12px;
            font-style: italic;
            margin: 0;
            display: inline-block;
        }

        @media print {
            .invoice-container {
                box-shadow: none;
                margin: 0;
            }
        }
    </style>
</head>
<body>
    <div class="invoice-container">
        <!-- Header -->
        <div class="header">
            <div class="logo" id="logo">
                <img src="/images/logo-moonoi.png" alt="Claude AI Tech Logo" id="logoImg" />
            </div>
            <div class="company-info">
                <div class="company-name-th" id="companyNameTh">บริษัท คอร์ดเอไอเทค จำกัด (สำนักงานใหญ่)</div>
                <div class="company-name-en" id="companyNameEn">Claude AI Tech Co., Ltd.</div>
                <div class="company-address" id="companyAddress">
                    99/101 ม.พิมุกต์ 1 เฟส 5 ซอย 6 ตำบล สันทรายน้อย อำเภอสันทราย เชียงใหม่ 50210<br>
                    Tel. <span id="tel">085-396-7806, 097-954-8922</span> Tax ID: <span id="taxId">0505562001590</span>
                </div>
            </div>
        </div>

        <!-- Invoice Title -->
        <div class="invoice-title">
            <h2>ใบวางบิล/ใบแจ้งหนี้</h2>
            <div class="subtitle">(BILLING NOTE/ INVOICE)</div>
        </div>

        <!-- Invoice Details -->
        <div class="invoice-details">
            <div class="customer-info">
                <div><strong>ลูกค้า / Customer:</strong> <span id="customerName">Brainergy Digital (สำนักงานใหญ่)</span></div>
                <div><strong>ที่อยู่/ Address:</strong></div>
                <div id="customerAddress">499 Benchachinda Bldg., Kamphaeng Phet 6 Road., Ladyao,<br>
                Chatuchak, Bangkok 10900, Thailand</div>
                <div><strong>เบอร์โทรศัพท์/Tel :</strong> <span id="customerTel">0-2016-5355</span></div>
            </div>
            <div class="invoice-meta">
                <div>Date <span id="invoiceDate">23/07/2568</span></div>
                <div>No. <span id="invoiceNo">IV2025015</span></div>
                <div>Due Date <span id="dueDate">13/08/2568</span></div>
            </div>
        </div>

        <!-- Items Table -->
        <table class="items-table">
            <thead>
                <tr>
                    <th style="width: 10%">ลำดับ</th>
                    <th style="width: 50%">รายละเอียด</th>
                    <th style="width: 10%">จำนวน</th>
                    <th style="width: 15%">ราคาต่อหน่วย</th>
                    <th style="width: 15%">ราคา</th>
                </tr>
            </thead>
            <tbody id="itemsTableBody">
                <tr>
                    <td>1</td>
                    <td class="description">Outsource Flutter Develop ประจำเดือน กรกฎาคม 2568</td>
                    <td>21</td>
                    <td>3,500</td>
                    <td>73,500</td>
                </tr>
            </tbody>
        </table>

        <!-- Totals -->
        <div class="totals">
            <table>
                <tr>
                    <td>จำนวนเงิน</td>
                    <td style="text-align: right" id="subtotal">73,500</td>
                </tr>
                <tr>
                    <td>ภาษีมูลค่าเพิ่ม(7%)</td>
                    <td style="text-align: right" id="vat">5,145</td>
                </tr>
                <tr class="total-row">
                    <td>จำนวนเงินรวมทั้งสิ้น</td>
                    <td style="text-align: right" id="total">78,645</td>
                </tr>
                <tr class="total-row">
                    <td colspan="2" style="text-align: right"><span class="amount-text" id="amountText">(เจ็ดหมื่นแปดพันหกร้อยสี่สิบห้าบาทถ้วน)</span></td>
                </tr>
            </table>
        </div>

        <!-- Reference Information -->
        <div class="reference-info" id="referenceInfo">
        </div>

        <!-- Payment Information -->
        <div class="payment-info">
            <h3>Payment:</h3>
            <div><strong><span id="paymentCompany">Claude AI Tech Co., Ltd.</span></strong></div>
            <div>Saving Account: <span id="accountNumber">051-8-44336-4</span></div>
            <div><span id="bankName">Kasikorn Bank: Central Festival Chiang Mai Branch</span></div>
        </div>

        <!-- Signature Section -->
        <div class="signature-section">
            <div>เสนอโดย</div>
            <div class="signature-line"></div>
            <div>(<span id="signerName">นายศรัณ จันตุ่ย</span>)</div>
            <div>ผู้มีอำนาจลงนาม</div>
        </div>
    </div>
</body>
</html>`

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event)
    
    // Use embedded template instead of reading from file
    let htmlContent = INVOICE_TEMPLATE
    
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