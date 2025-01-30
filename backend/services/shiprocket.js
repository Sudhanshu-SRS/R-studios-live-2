import axios from 'axios';

class ShiprocketService {
    constructor() {
        this.token = null;
        this.tokenExpiry = null;
        this.baseURL = 'https://apiv2.shiprocket.in/v1/external';
        this.isAuthenticating = false;
        this.tokenRefreshBuffer = 24 * 60 * 60 * 1000; // 24 hours before expiry
    }

    async authenticate() {
        try {
            if (this.isAuthenticating) {
                // Wait if authentication is in progress
                await new Promise(resolve => setTimeout(resolve, 1000));
                return this.token;
            }

            this.isAuthenticating = true;
            console.log('Authenticating with Shiprocket...');

            const response = await axios.post(`${this.baseURL}/auth/login`, {
                email: process.env.SHIPROCKET_EMAIL,
                password: process.env.SHIPROCKET_PASSWORD
            });

            this.token = response.data.token;
            // Set token expiry to 9 days (24h before actual expiry)
            this.tokenExpiry = Date.now() + (9 * 24 * 60 * 60 * 1000);
            
            console.log('Shiprocket authentication successful');
            return this.token;

        } catch (error) {
            console.error('Shiprocket auth error:', error);
            throw error;
        } finally {
            this.isAuthenticating = false;
        }
    }

    async ensureValidToken() {
        try {
            // Check if token needs refresh
            if (!this.token || !this.tokenExpiry || Date.now() + this.tokenRefreshBuffer >= this.tokenExpiry) {
                console.log('Token expired or about to expire, refreshing...');
                await this.authenticate();
            }
            return this.token;
        } catch (error) {
            console.error('Token refresh error:', error);
            throw error;
        }
    }

    async makeAuthenticatedRequest(requestFn) {
        try {
            await this.ensureValidToken();
            return await requestFn(this.token);
        } catch (error) {
            if (error.response?.status === 401) {
                // Token might be invalid, try to refresh once
                console.log('Token invalid, attempting refresh...');
                await this.authenticate();
                return await requestFn(this.token);
            }
            throw error;
        }
    }

    // Update other methods to use makeAuthenticatedRequest
    async createOrder(orderDetails) {
        return this.makeAuthenticatedRequest(async (token) => {
            const paymentMethod = orderDetails.paymentMethod === "COD" ? "COD" : "Prepaid";
            const data = {
                order_id: orderDetails._id,
                order_date: new Date().toISOString(),
                pickup_location: "Primary",
                billing_customer_name: orderDetails.address.firstName,
                billing_last_name: orderDetails.address.lastName,
                billing_address: orderDetails.address.street,
                billing_city: orderDetails.address.city,
                billing_pincode: orderDetails.address.zipcode,
                billing_state: orderDetails.address.state,
                billing_country: "India",
                billing_email: orderDetails.address.email,
                billing_phone: orderDetails.address.phone,
                shipping_is_billing: true,
                order_items: orderDetails.items.map(item => ({
                    name: item.name,
                    sku: item._id,
                    units: parseInt(item.quantity),
                    selling_price: item.price
                })),
                payment_method: paymentMethod, // Use mapped payment method
                shipping_charges: 150,
                sub_total: orderDetails.amount - 150,
                length: 10,
                breadth: 10,
                height: 10,
                weight: 0.5
            };

            const response = await axios.post(
                `${this.baseURL}/orders/create/adhoc`,
                data,
                {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                }
            );

            return {
                ...response.data,
                shiprocket_order_id: response.data.order_id
            };
        });
    }

    // Similarly update other methods
    async getTracking(awbCode) {
        return this.makeAuthenticatedRequest(async (token) => {
            const response = await axios.get(
                `${this.baseURL}/courier/track/awb/${awbCode}`,
                {
                    headers: { 'Authorization': `Bearer ${token}` }
                }
            );
            return response.data;
        });
    }

    async cancelShipment(shipmentId) {
        return this.makeAuthenticatedRequest(async (token) => {
            const response = await axios.post(
                `${this.baseURL}/orders/cancel/shipment/${shipmentId}`,
                {},
                {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                }
            );
            return response.data;
        });
    }

    async cancelOrder(shiprocketOrderId) {
        return this.makeAuthenticatedRequest(async (token) => {
            const response = await axios.post(
                `${this.baseURL}/orders/cancel`,
                {
                    ids: [shiprocketOrderId]
                },
                {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                }
            );
            return response.data;
        });
    }
}

// Create a singleton instance
const shiprocketService = new ShiprocketService();

// Initialize token on service start
(async () => {
    try {
        await shiprocketService.authenticate();
    } catch (error) {
        console.error('Initial Shiprocket authentication failed:', error);
    }
})();

export default shiprocketService;