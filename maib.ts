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

export class MAIBPaymentService {
  private readonly apiUrl: string = 'https://api.maibmerchants.md/v1'
  private readonly projectId: string
  private readonly projectSecret: string
  private readonly signatureKey: string

  constructor() {
    this.projectId = process.env.MAIB_PROJECT_ID!
    this.projectSecret = process.env.MAIB_PROJECT_SECRET!
    this.signatureKey = process.env.MAIB_SIGNATURE_KEY!
  }

  private generateSignature(data: string): string {
    return crypto
      .createHmac('sha256', this.signatureKey)
      .update(data)
      .digest('hex')
  }

  private getAuthHeaders(): Record<string, string> {
    return {
      'Content-Type': 'application/json',
      'X-Project-Id': this.projectId,
      'X-Project-Secret': this.projectSecret
    }
  }

  async createPayment(request: MAIBPaymentRequest): Promise<MAIBPaymentResponse> {
    const paymentData = {
      amount: request.amount,
      currency: request.currency,
      clientIp: request.clientIp,
      language: request.language || 'ru',
      description: request.description,
      clientName: request.clientName,
      email: request.email,
      phone: request.phone,
      orderId: request.orderId,
      delivery: request.delivery,
      items: request.items,
      callbackUrl: request.callbackUrl,
      okUrl: request.okUrl,
      failUrl: request.failUrl
    }

    const response = await fetch(`${this.apiUrl}/pay`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(paymentData)
    })

    if (!response.ok) {
      throw new Error(`MAIB payment creation failed: ${response.statusText}`)
    }

    const data: MAIBPaymentResponse = await response.json()
    return data
  }

  async getPaymentStatus(payId: string): Promise<{
    status: string
    payId?: string
    amount?: number
    currency?: string
  }> {
    const response = await fetch(`${this.apiUrl}/status/${payId}`, {
      headers: this.getAuthHeaders()
    })

    if (!response.ok) {
      throw new Error('Failed to get payment status')
    }

    const data = await response.json()
    
    return {
      status: data.result?.status || 'unknown',
      payId: data.result?.payId,
      amount: data.result?.amount,
      currency: data.result?.currency
    }
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
  } {
    const { result } = webhookData
    
    return {
      payId: result.payId,
      orderId: result.orderId,
      status: result.status,
      amount: result.amount,
      currency: result.currency,
      isSuccess: result.status === 'OK' && result.statusCode === '000'
    }
  }
}