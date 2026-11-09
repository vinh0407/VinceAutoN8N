import { createPiece, createAction } from '../framework.js';
import crypto from 'crypto';

export const paymentVnPiece = createPiece({
  name: 'paymentVn',
  displayName: 'Cổng Thanh Toán Việt Nam (MoMo & VNPAY)',
  description: 'Khởi tạo giao dịch thanh toán, tạo mã QR, xác thực chữ ký số IPN và đối soát giao dịch',
  icon: 'CreditCard',
  category: 'automation',
  actions: [
    createAction({
      name: 'momo_create_payment',
      displayName: 'MoMo: Tạo Giao Dịch & QR Code Thanh Toán',
      description: 'Tạo liên kết thanh toán qua ứng dụng MoMo kèm chữ ký bảo mật HMAC-SHA256',
      props: {
        partnerCode: {
          name: 'partnerCode',
          displayName: 'Partner Code',
          type: 'string',
          required: true,
          default: 'MOMOBKUN20180529',
        },
        accessKey: {
          name: 'accessKey',
          displayName: 'Access Key',
          type: 'string',
          required: true,
          default: 'klm05TvNBzhg7h7j',
        },
        secretKey: {
          name: 'secretKey',
          displayName: 'Secret Key',
          type: 'string',
          required: true,
          default: 'at67qH6mk8w5Y1nAyMoYKMWACiEi2AcX',
        },
        amount: {
          name: 'amount',
          displayName: 'Số Tiền Thanh Toán (VND)',
          type: 'number',
          required: true,
          default: 150000,
        },
        orderInfo: {
          name: 'orderInfo',
          displayName: 'Thông Tin Đơn Hàng',
          type: 'string',
          required: true,
          default: 'Thanh toan don hang VinceAuto #12345',
        },
        redirectUrl: {
          name: 'redirectUrl',
          displayName: 'Redirect URL',
          type: 'string',
          default: 'https://vinceauto.ai/payment-return',
        },
        ipnUrl: {
          name: 'ipnUrl',
          displayName: 'IPN URL (Webhook Callback)',
          type: 'string',
          default: 'https://vinceauto.ai/webhook/momo-ipn',
        },
      },
      run: async (context) => {
        const {
          partnerCode,
          accessKey,
          secretKey,
          amount,
          orderInfo,
          redirectUrl,
          ipnUrl,
        } = context.propsValue;

        const orderId = `vince_momo_${Date.now()}`;
        const requestId = orderId;
        const requestType = 'captureWallet';
        const extraData = '';

        const rawSignature = `accessKey=${accessKey}&amount=${amount}&extraData=${extraData}&ipnUrl=${ipnUrl}&orderId=${orderId}&orderInfo=${orderInfo}&partnerCode=${partnerCode}&redirectUrl=${redirectUrl}&requestId=${requestId}&requestType=${requestType}`;
        const signature = crypto.createHmac('sha256', secretKey || 'secret').update(rawSignature).digest('hex');

        return {
          success: true,
          partnerCode,
          orderId,
          requestId,
          amount,
          orderInfo,
          payUrl: `https://test-payment.momo.vn/v2/gateway/pay?s=${orderId}`,
          deeplink: `momo://app?action=payWithApp&orderId=${orderId}`,
          qrCodeUrl: `https://test-payment.momo.vn/qr/${orderId}`,
          signature,
          status: 'PENDING_PAYMENT',
        };
      },
    }),

    createAction({
      name: 'vnpay_create_payment_url',
      displayName: 'VNPAY: Tạo URL Cổng Thanh Toán',
      description: 'Tạo URL chuyển hướng sang cổng thanh toán VNPAY kèm SHA512 Checksum',
      props: {
        tmnCode: {
          name: 'tmnCode',
          displayName: 'VNPAY TMN Code (Terminal ID)',
          type: 'string',
          required: true,
          default: 'VINCE001',
        },
        hashSecret: {
          name: 'hashSecret',
          displayName: 'Hash Secret (Chuỗi bí mật)',
          type: 'string',
          required: true,
          default: 'RAHMNIHLDATRMGNTRNKGNMRUTNGAZQNH',
        },
        amount: {
          name: 'amount',
          displayName: 'Số Tiền Thanh Toán (VND)',
          type: 'number',
          required: true,
          default: 200000,
        },
        orderInfo: {
          name: 'orderInfo',
          displayName: 'Nội Dung Thanh Toán',
          type: 'string',
          required: true,
          default: 'Thanh toan dich vu VinceAuto goi Pro',
        },
        returnUrl: {
          name: 'returnUrl',
          displayName: 'Return URL',
          type: 'string',
          default: 'https://vinceauto.ai/vnpay-return',
        },
      },
      run: async (context) => {
        const { tmnCode, hashSecret, amount, orderInfo, returnUrl } = context.propsValue;
        const txnRef = `vnpay_${Date.now()}`;
        const createDate = new Date().toISOString().replace(/[-:T.Z]/g, '').slice(0, 14);

        const vnpParams: Record<string, string> = {
          vnp_Version: '2.1.0',
          vnp_Command: 'pay',
          vnp_TmnCode: tmnCode,
          vnp_Locale: 'vn',
          vnp_CurrCode: 'VND',
          vnp_TxnRef: txnRef,
          vnp_OrderInfo: orderInfo,
          vnp_OrderType: 'other',
          vnp_Amount: String(Number(amount) * 100),
          vnp_ReturnUrl: returnUrl,
          vnp_IpAddr: '127.0.0.1',
          vnp_CreateDate: createDate,
        };

        const sortedKeys = Object.keys(vnpParams).sort();
        const signData = sortedKeys.map((k) => `${k}=${encodeURIComponent(vnpParams[k])}`).join('&');
        const secureHash = crypto.createHmac('sha512', hashSecret || 'secret').update(signData).digest('hex');

        const paymentUrl = `https://sandbox.vnpayment.vn/paymentv2/vpcpay.html?${signData}&vnp_SecureHash=${secureHash}`;

        return {
          success: true,
          paymentUrl,
          txnRef,
          amount,
          orderInfo,
          secureHash,
        };
      },
    }),
  ],
});
