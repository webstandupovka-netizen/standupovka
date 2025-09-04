// lib/payments/maib.ts
import crypto from 'crypto'

export interface MAIBPaymentRequest {
  amount: number
  currency: string
  clientIp: string
  language?: string
  description?: string
  clientName?: string
  email?: string
  phone?: string
  orderId?: string
  delivery?: number
  items?: MAIBItem[]
  callbackUrl?: string
  okUrl?: string
  failUrl?: string
}

export interface MAIBItem {
  id?: string
  name?: string
  price?: number
  quantity?: number
}

export interface MAIBPaymentResponse {
  result?: {
    payId: string
    orderId: string
    payUrl: string
  }
  ok: boolean
  errors?: MAIBError[]
}

export interface MAIBError {
  errorCode: string
  errorMessage: string
  errorArgs?: Record<string, any>
}

export interface MAIBRefundRequest {
  payId: string
  refundAmount?: number
}

export interface MAIBRefundResponse {
  result?: {
    payId: string
    orderId: string
    status: string
    statusCode: string
    statusMessage: string
    refundAmount: number
  }
  ok: boolean
  errors?: MAIBError[]
}

export interface MAIBWebhookPayload {
  result: {
    payId: string
    orderId: string
    status: string
    statusCode: string
    statusMessage: string
    threeDs?: string
    rrn?: string
    approval?: string
    cardNumber?: string
    amount: number
    currency: string
  }
  signature: string
}

export interface MAIBTokenResponse {
  result?: {
    accessToken: string
    expiresIn: number
    refreshToken: string
    refreshExpiresIn: number
    tokenType: string
  }
  ok: boolean
  errors?: MAIBError[]
}

export class MAIBPaymentService {
  private readonly apiUrl: string = 'https://api.maibmerchants.md/v1'
  private readonly projectId: string
  private readonly projectSecret: string
  private readonly signatureKey: string
  private accessToken: string | null = null
  private tokenExpiresAt: number = 0

  constructor() {
    this.projectId = process.env.MAIB_PROJECT_ID!
    this.projectSecret = process.env.MAIB_PROJECT_SECRET!
    this.signatureKey = process.env.MAIB_SIGNATURE_KEY!
    
    console.log('🔧 MAIB Service initialized:', {
      apiUrl: this.apiUrl,
      projectId: this.projectId ? `${this.projectId.slice(0, 8)}...` : 'MISSING',
      projectSecret: this.projectSecret ? 'SET' : 'MISSING',
      signatureKey: this.signatureKey ? 'SET' : 'MISSING'
    })
    
    if (!this.projectId || !this.projectSecret || !this.signatureKey) {
      console.error('❌ MAIB configuration missing:', {
        projectId: !!this.projectId,
        projectSecret: !!this.projectSecret,
        signatureKey: !!this.signatureKey
      })
      throw new Error('MAIB configuration is incomplete')
    }
  }

  private generateSignature(data: string): string {
    return crypto
      .createHmac('sha256', this.signatureKey)
      .update(data)
      .digest('hex')
  }

  private async generateAccessToken(): Promise<string> {
    console.log('🔑 Generating MAIB access token...')
    
    const response = await fetch(`${this.apiUrl}/generate-token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        projectId: this.projectId,
        projectSecret: this.projectSecret
      })
    })

    console.log('🔑 Token generation response status:', response.status, response.statusText)

    if (!response.ok) {
      const errorText = await response.text()
      console.error('❌ Token generation failed:', {
        status: response.status,
        statusText: response.statusText,
        body: errorText
      })
      throw new Error(`Token generation failed: ${response.statusText} - ${errorText}`)
    }

    const data: MAIBTokenResponse = await response.json()
    console.log('🔑 Token generation response:', data)
    
    if (!data.ok || !data.result) {
      console.error('❌ Token generation failed - invalid response:', data)
      throw new Error(`Token generation failed: ${data.errors?.[0]?.errorMessage || 'Unknown error'}`)
    }

    this.accessToken = data.result.accessToken
    this.tokenExpiresAt = Date.now() + (data.result.expiresIn * 1000) - 30000 // 30 seconds buffer
    
    console.log('✅ Access token generated successfully')
    return this.accessToken
  }

  private async getValidAccessToken(): Promise<string> {
    if (!this.accessToken || Date.now() >= this.tokenExpiresAt) {
      return await this.generateAccessToken()
    }
    return this.accessToken
  }

  private async getAuthHeaders(): Promise<Record<string, string>> {
    const token = await this.getValidAccessToken()
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    }
  }

  async createPayment(request: MAIBPaymentRequest): Promise<MAIBPaymentResponse> {
    // Очищаем данные от undefined/null значений
    const paymentData: any = {
      amount: request.amount,
      currency: request.currency,
      clientIp: request.clientIp,
      language: request.language || 'ru',
      description: request.description,
      clientName: request.clientName,
      email: request.email,
      orderId: request.orderId,
      callbackUrl: request.callbackUrl,
      okUrl: request.okUrl,
      failUrl: request.failUrl
    }

    // Добавляем только определенные поля
    if (request.phone) {
      paymentData.phone = request.phone
    }
    if (request.delivery) {
      paymentData.delivery = request.delivery
    }
    if (request.items) {
      paymentData.items = request.items
    }

    console.log('🔄 MAIB Payment Request:', {
      url: `${this.apiUrl}/pay`,
      data: paymentData
    })

    const headers = await this.getAuthHeaders()
    const response = await fetch(`${this.apiUrl}/pay`, {
      method: 'POST',
      headers,
      body: JSON.stringify(paymentData)
    })

    console.log('📡 MAIB Response Status:', response.status, response.statusText)

    if (!response.ok) {
      const errorText = await response.text()
      console.error('❌ MAIB API Error Response:', {
        status: response.status,
        statusText: response.statusText,
        body: errorText
      })
      throw new Error(`MAIB payment creation failed: ${response.statusText} - ${errorText}`)
    }

    const data: MAIBPaymentResponse = await response.json()
    console.log('✅ MAIB Payment Response:', data)
    return data
  }

  async getPaymentStatus(payId: string): Promise<{
    status: string
    payId?: string
    amount?: number
    currency?: string
  }> {
    const headers = await this.getAuthHeaders()
    const response = await fetch(`${this.apiUrl}/pay-info/${payId}`, {
      method: 'GET',
      headers
    })

    if (!response.ok) {
      throw new Error('Failed to get payment status')
    }

    const data = await response.json()
    
    // Мапим статусы MAIB на наши внутренние статусы
    const maibStatus = data.result?.status
    const statusCode = data.result?.statusCode
    let mappedStatus = 'pending'
    
    if (maibStatus === 'OK' && statusCode === '000') {
      mappedStatus = 'completed'
    } else if (maibStatus === 'FAILED' || maibStatus === 'DECLINED' || maibStatus === 'TIMEOUT') {
      mappedStatus = 'failed'
    } else if (maibStatus === 'CREATED' || maibStatus === 'PENDING') {
      mappedStatus = 'pending'
    } else if (!maibStatus) {
      mappedStatus = 'unknown'
    }
    
    return {
      status: mappedStatus,
      payId: data.result?.payId,
      amount: data.result?.amount,
      currency: data.result?.currency
    }
  }

  async refundPayment(request: MAIBRefundRequest): Promise<MAIBRefundResponse> {
    const refundData: any = {
      payId: request.payId
    }

    // Добавляем сумму возврата только если она указана
    if (request.refundAmount !== undefined) {
      refundData.refundAmount = request.refundAmount
    }

    const headers = await this.getAuthHeaders()
    const response = await fetch(`${this.apiUrl}/refund`, {
      method: 'POST',
      headers,
      body: JSON.stringify(refundData)
    })

    if (!response.ok) {
      throw new Error(`MAIB refund failed: ${response.statusText}`)
    }

    const data: MAIBRefundResponse = await response.json()
    return data
  }

  validateWebhookSignature(payload: string, signature: string): boolean {
    const expectedSignature = crypto
      .createHmac('sha256', this.signatureKey)
      .update(payload)
      .digest('hex')
    
    return crypto.timingSafeEqual(
      Buffer.from(signature, 'hex'),
      Buffer.from(expectedSignature, 'hex')
    )
  }

  processWebhook(webhookData: MAIBWebhookPayload): {
    payId: string
    orderId: string
    status: string
    amount: number
    currency: string
    isSuccess: boolean
    rrn?: string
    approvalCode?: string
    metadata: {
      result: string
      resultCode: string
      resultText: string
      cardMask?: string
      authCode?: string
    }
  } {
    const { result } = webhookData
    
    // Мапим статусы MAIB на наши внутренние статусы
    let mappedStatus = 'pending'
    if (result.status === 'OK' && result.statusCode === '000') {
      mappedStatus = 'completed'
    } else if (result.status === 'FAILED' || result.status === 'DECLINED' || result.status === 'TIMEOUT') {
      mappedStatus = 'failed'
    } else if (result.status === 'CREATED' || result.status === 'PENDING') {
      mappedStatus = 'pending'
    }
    
    return {
      payId: result.payId,
      orderId: result.orderId,
      status: mappedStatus,
      amount: result.amount,
      currency: result.currency,
      isSuccess: result.status === 'OK' && result.statusCode === '000',
      rrn: result.rrn,
      approvalCode: result.approval,
      metadata: {
        result: result.status,
        resultCode: result.statusCode,
        resultText: result.statusMessage,
        cardMask: result.cardNumber,
        authCode: result.approval
      }
    }
  }
}