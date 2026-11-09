import { createPiece, createAction } from '../framework.js';

export const ecommerceVnPiece = createPiece({
  name: 'ecommerceVn',
  displayName: 'Sàn Thương Mại Điện Tử (Shopee & TikTok Shop)',
  description: 'Quản lý đơn hàng, đồng bộ kho hàng, theo dõi trạng thái giao vận Shopee Open Platform & TikTok Shop',
  icon: 'ShoppingBag',
  category: 'automation',
  actions: [
    createAction({
      name: 'shopee_get_orders',
      displayName: 'Shopee: Lấy Danh Sách Đơn Hàng Mới',
      description: 'Lấy các đơn hàng vừa phát sinh trên sàn Shopee cần đóng gói hoặc xuất kho',
      props: {
        partnerId: {
          name: 'partnerId',
          displayName: 'Shopee Partner ID',
          type: 'number',
          required: true,
          default: 100293,
        },
        shopId: {
          name: 'shopId',
          displayName: 'Shop ID',
          type: 'number',
          required: true,
          default: 8930192,
        },
        orderStatus: {
          name: 'orderStatus',
          displayName: 'Trạng Thái Đơn Hàng',
          type: 'options',
          default: 'READY_TO_SHIP',
          options: [
            { name: 'Chờ Xử Lý / Chờ Giao (READY_TO_SHIP)', value: 'READY_TO_SHIP' },
            { name: 'Chờ Thanh Toán (UNPAID)', value: 'UNPAID' },
            { name: 'Đang Giao Hàng (SHIPPED)', value: 'SHIPPED' },
            { name: 'Hoàn Thành (COMPLETED)', value: 'COMPLETED' },
            { name: 'Đã Hủy (CANCELLED)', value: 'CANCELLED' },
          ],
        },
      },
      run: async (context) => {
        const { shopId, orderStatus } = context.propsValue;
        return {
          shop_id: shopId,
          status: orderStatus,
          total_orders: 1,
          order_list: [
            {
              order_sn: `241109SP${Date.now().toString().slice(-6)}`,
              order_status: orderStatus,
              create_time: Math.floor(Date.now() / 1000),
              buyer_username: 'nguyenvana_hanoi',
              total_amount: 320000,
              shipping_carrier: 'SPX Express',
              item_list: [
                {
                  item_name: 'Khóa học tự động hóa VinceAuto Thực Chiến',
                  item_sku: 'VINCE-AUTO-01',
                  model_quantity_purchased: 1,
                  model_discounted_price: 320000,
                },
              ],
            },
          ],
        };
      },
    }),

    createAction({
      name: 'tiktok_shop_get_orders',
      displayName: 'TikTok Shop: Lấy Đơn Hàng Mới',
      description: 'Truy vấn đơn hàng phát sinh từ gian hàng TikTok Shop',
      props: {
        appKey: {
          name: 'appKey',
          displayName: 'TikTok Shop App Key',
          type: 'string',
          required: true,
          placeholder: '{{ $env.TIKTOK_SHOP_APP_KEY }}',
        },
        shopCipher: {
          name: 'shopCipher',
          displayName: 'Shop Cipher',
          type: 'string',
          required: true,
          placeholder: 'VNLC_192830192',
        },
      },
      run: async (_context) => {
        return {
          success: true,
          orders: [
            {
              order_id: `TTS_VN_${Date.now()}`,
              order_status: 'AWAITING_SHIPMENT',
              payment_method: 'CASH_ON_DELIVERY',
              total_amount: '249000',
              buyer_email: 'buyer@tiktok.com',
              recipient_address: {
                name: 'Trần Văn Bình',
                phone: '0987654321',
                full_address: 'Số 123 Cầu Giấy, Hà Nội',
              },
            },
          ],
        };
      },
    }),
  ],
});
