// lib/payments/maib.ts
import crypto from 'crypto'
import https from 'https'
import { URL } from 'url'
import { HttpsProxyAgent } from 'https-proxy-agent'
import { config } from '../config'

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

  private createProxyAgent(): HttpsProxyAgent<string> | undefined {
    const fixieUrl = config.proxy.url;
    if (fixieUrl && config.proxy.enabled) {
      console.log('Using Fixie proxy for MAIB requests:', {
        proxyUrl: fixieUrl.replace(/:\/\/[^:]+:[^@]+@/, '://***:***@'),
        timestamp: new Date().toISOString()
      });
      return new HttpsProxyAgent(fixieUrl);
    }
    return undefined;
  }

  private generateSignature(data: string): string {
    return crypto
      .createHmac('sha256', this.signatureKey)
      .update(data)
      .digest('hex')
  }

  private async generateAccessToken(): Promise<string> {
    const tokenData = {
      projectId: this.projectId,
      projectSecret: this.projectSecret
    }

    console.log('🔑 Generating MAIB access token...')

    return new Promise((resolve, reject) => {
      const url = new URL(`${this.apiUrl}/generate-token`)
      const postData = JSON.stringify(tokenData)
      const agent = this.createProxyAgent()

      const options: https.RequestOptions = {
        hostname: url.hostname,
        port: url.port || 443,
        path: url.pathname,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(postData)
        },
        agent: agent
      }

      const req = https.request(options, (res) => {
        let data = ''
        res.on('data', (chunk) => {
          data += chunk
        })

        res.on('end', () => {
          console.log('🔑 Token generation response status:', res.statusCode, res.statusMessage)

          if (res.statusCode !== 200) {
            console.error('❌ Token generation failed:', {
              status: res.statusCode,
              statusMessage: res.statusMessage,
              body: data
            })
            reject(new Error(`Token generation failed: ${res.statusMessage} - ${data}`))
            return
          }

          try {
            const tokenResponse: MAIBTokenResponse = JSON.parse(data)
            console.log('🔑 Token generation response:', tokenResponse)
            
            if (!tokenResponse.ok || !tokenResponse.result) {
              console.error('❌ Token generation failed - invalid response:', tokenResponse)
              reject(new Error(`Token generation failed: ${tokenResponse.errors?.[0]?.errorMessage || 'Unknown error'}`))
              return
            }

            this.accessToken = tokenResponse.result.accessToken
            this.tokenExpiresAt = Date.now() + (tokenResponse.result.expiresIn * 1000) - 30000 // 30 seconds buffer
            
            console.log('✅ Access token generated successfully')
            resolve(this.accessToken)
          } catch (error) {
            reject(new Error(`Failed to parse token response: ${error}`))
          }
        })
      })

      req.on('error', (error) => {
        console.error('❌ MAIB Token Request Error:', error)
        reject(error)
      })

      req.setTimeout(15000, () => {
        req.destroy()
        reject(new Error('Token request timeout'))
      })

      req.write(postData)
      req.end()
    })
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
    const postData = JSON.stringify(paymentData)

    return new Promise((resolve, reject) => {
      const url = new URL(`${this.apiUrl}/pay`)
      const agent = this.createProxyAgent()

      const options: https.RequestOptions = {
        hostname: url.hostname,
        port: url.port || 443,
        path: url.pathname,
        method: 'POST',
        headers: {
          ...headers,
          'Content-Length': Buffer.byteLength(postData)
        },
        agent: agent
      }

      const req = https.request(options, (res) => {
        let data = ''
        res.on('data', (chunk) => {
          data += chunk
        })

        res.on('end', () => {
          console.log('📡 MAIB Response Status:', res.statusCode, res.statusMessage)

          if (res.statusCode !== 200) {
            console.error('❌ MAIB API Error Response:', {
              status: res.statusCode,
              statusMessage: res.statusMessage,
              body: data
            })
            reject(new Error(`MAIB payment creation failed: ${res.statusMessage} - ${data}`))
            return
          }

          try {
            const paymentResponse: MAIBPaymentResponse = JSON.parse(data)
            console.log('✅ MAIB Payment Response:', paymentResponse)
            resolve(paymentResponse)
          } catch (error) {
            reject(new Error(`Failed to parse payment response: ${error}`))
          }
        })
      })

      req.on('error', (error) => {
        console.error('❌ MAIB Payment Request Error:', error)
        reject(error)
      })

      req.setTimeout(15000, () => {
        req.destroy()
        reject(new Error('Payment request timeout'))
      })

      req.write(postData)
      req.end()
    })
  }

  async getPaymentStatus(payId: string): Promise<{
    status: string
    payId?: string
    amount?: number
    currency?: string
  }> {
    const headers = await this.getAuthHeaders()

    return new Promise((resolve, reject) => {
      const url = new URL(`${this.apiUrl}/pay-info/${payId}`)
      const agent = this.createProxyAgent()

      const options: https.RequestOptions = {
        hostname: url.hostname,
        port: url.port || 443,
        path: url.pathname,
        method: 'GET',
        headers: headers,
        agent: agent
      }

      const req = https.request(options, (res) => {
        let data = ''
        res.on('data', (chunk) => {
          data += chunk
        })

        res.on('end', () => {
          if (res.statusCode !== 200) {
            reject(new Error('Failed to get payment status'))
            return
          }

          try {
             const statusResponse = JSON.parse(data)
     
             // Мапим статусы MAIB на наши внутренние статусы
             const maibStatus = statusResponse.result?.status
             const statusCode = statusResponse.result?.statusCode
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
     
             resolve({
               status: mappedStatus,
               payId: statusResponse.result?.payId,
               amount: statusResponse.result?.amount,
               currency: statusResponse.result?.currency
             })
           } catch (error) {
             reject(new Error(`Failed to parse status response: ${error}`))
           }
         })
       })

       req.on('error', (error) => {
         reject(error)
       })

       req.setTimeout(15000, () => {
         req.destroy()
         reject(new Error('Status request timeout'))
       })

       req.end()
     })
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
    const postData = JSON.stringify(refundData)

    return new Promise((resolve, reject) => {
      const url = new URL(`${this.apiUrl}/refund`)
      const agent = this.createProxyAgent()

      const options: https.RequestOptions = {
        hostname: url.hostname,
        port: url.port || 443,
        path: url.pathname,
        method: 'POST',
        headers: {
          ...headers,
          'Content-Length': Buffer.byteLength(postData)
        },
        agent: agent
      }

      const req = https.request(options, (res) => {
        let data = ''
        res.on('data', (chunk) => {
          data += chunk
        })

        res.on('end', () => {
          if (res.statusCode !== 200) {
            reject(new Error(`MAIB refund failed: ${res.statusMessage}`))
            return
          }

          try {
            const refundResponse: MAIBRefundResponse = JSON.parse(data)
            resolve(refundResponse)
          } catch (error) {
            reject(new Error(`Failed to parse refund response: ${error}`))
          }
        })
      })

      req.on('error', (error) => {
        reject(error)
      })

      req.setTimeout(15000, () => {
        req.destroy()
        reject(new Error('Refund request timeout'))
      })

      req.write(postData)
      req.end()
    })
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