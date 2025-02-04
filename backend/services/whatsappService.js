import axios from "axios";

class WhatsAppService {
  constructor() {
    this.baseURL = "https://graph.facebook.com/v22.0";
    this.phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;
    this.accessToken = process.env.WHATSAPP_ACCESS_TOKEN;
    this.maxRetries =3;
    // Validate configuration
    if (!this.phoneNumberId || !this.accessToken) {
      console.error("WhatsApp configuration missing");
    }
  }

  formatPhoneNumber(phone) {
    if (!phone) {
      console.error("Phone number is missing");
      return null;
    }
    const cleaned = phone.toString().replace(/\D/g, "");
    const formattedNumber = cleaned.startsWith("91") ? cleaned : `91${cleaned}`;
    console.log("Phone Number Formatting:", {
        original: phone,
        cleaned: cleaned,
        final: formattedNumber,
        length: formattedNumber.length
    });
    return formattedNumber;
  }

  async sendOrderConfirmation(phone, orderDetails) {
    try {
      if (!this.accessToken) {
        throw new Error("WhatsApp access token not configured");
      }

      const formattedPhone = this.formatPhoneNumber(phone);

      // Format address for WhatsApp template
      const formattedAddress = `${orderDetails.address?.street}, ${orderDetails.address?.city}, ${orderDetails.address?.state}, ${orderDetails.address?.zipcode}`;

      const response = await axios({
        method: "post",
        url: `${this.baseURL}/${this.phoneNumberId}/messages`,
        headers: {
          Authorization: `Bearer ${this.accessToken}`,
          "Content-Type": "application/json",
        },
        data: {
          messaging_product: "whatsapp",
          to: formattedPhone,
          type: "template",
          template: {
            name: "order_confirmation_1",
            language: { code: "en" },
            components: [
              {
                type: "body",
                parameters: [
                  { type: "text", text: orderDetails._id },
                  { type: "text", text: formattedAddress }, // Add delivery address
                  { type: "text", text: orderDetails.amount.toString() },
                  { type: "text", text: orderDetails.paymentMethod },
                ],
              },
            ],
          },
        },
      });

      console.log("WhatsApp API Response:", response.data);
      console.log("WhatsApp API Complete Response:", {
        status: response.status,
        statusText: response.statusText,
        data: response.data,
        headers: response.headers
      });
      return true;
    } catch (error) {
      console.error("WhatsApp order confirmation error:", {
        error: error.message,
        orderDetails: JSON.stringify(orderDetails, null, 2),
      });
      return false;
    }
  }

  async sendOrderStatusUpdate(phone, name, orderId, status, additionalInfo, trackingUrl) {
    try {
        const formattedPhone = this.formatPhoneNumber(phone);
        console.log('Sending status update to:', formattedPhone);

        const parameters = [
            { type: "text", text: name || "Customer" },
            { type: "text", text: orderId.toString() },
            { type: "text", text: status || "Updated" },
            { type: "text", text: additionalInfo || "" },
            { type: "text", text: trackingUrl || "-" } // Use "-" instead of null/empty string
        ];

        console.log('Template parameters:', parameters);

        const response = await axios({
            method: "post",
            url: `${this.baseURL}/${this.phoneNumberId}/messages`,
            headers: {
                Authorization: `Bearer ${this.accessToken}`,
                "Content-Type": "application/json"
            },
            data: {
                messaging_product: "whatsapp",
                to: formattedPhone,
                type: "template",
                template: {
                    name: "order_status_update", // Make sure this matches your approved template name
                    language: { code: "en" },
                    components: [
                        {
                            type: "body",
                            parameters: parameters
                        }
                    ]
                }
            }
        });

        console.log('WhatsApp API response:', response.data);
        console.log("WhatsApp API Complete Response:", {
          status: response.status,
          statusText: response.statusText,
          data: response.data,
          headers: response.headers
        });
        return true;
    } catch (error) {
        console.error('WhatsApp status update error:', {
            error: error.message,
            response: error.response?.data,
            params: { phone, name, orderId, status, additionalInfo, trackingUrl }
        });
        return false;
    }
}


async checkMessageStatus(messageId) {
  try {
    const response = await axios({
      method: "GET",
      url: `${this.baseURL}/${messageId}`,
      headers: {
        Authorization: `Bearer ${this.accessToken}`,
      }
    });
    console.log("Message status check:", {
      messageId,
      status: response.data?.status,
      timestamp: new Date().toISOString()
    });
    return response.data?.status;
  } catch (error) {
    console.error("Error checking message status:", {
      messageId,
      error: error.message
    });
    return null;
  }
}

async sendTrackingUpdate(phone, orderDetails, trackingInfo) {
  try {
    const formattedPhone = this.formatPhoneNumber(phone);
    
    const response = await axios.post(
      `${this.baseURL}/${this.phoneNumberId}/messages`,
      {
        messaging_product: "whatsapp",
        to: formattedPhone,
        type: "template",
        template: {
          name: "tracking_update",
          language: { code: "en" },
          components: [
            {
              type: "body",
              parameters: [
                { type: "text", text: orderDetails._id },
                { type: "text", text: trackingInfo.courier_name },
                { type: "text", text: trackingInfo.awb_code },
                { type: "text", text: new Date(trackingInfo.etd).toLocaleDateString() },
                { type: "text", text: trackingInfo.current_status }
              ]
            }
          ]
        }
      },
      {
        headers: {
          Authorization: `Bearer ${this.accessToken}`,
          "Content-Type": "application/json"
        }
      }
    );

    return true;
  } catch (error) {
    console.error("WhatsApp tracking update error:", error);
    return false;
  }
}

async sendMessage(phone, templateName, parameters) {
  try {
    const formattedPhone = this.formatPhoneNumber(phone);
    if (!formattedPhone) {
      throw new Error("Invalid phone number format");
    }

    console.log("Sending WhatsApp welcome message:", {
      phone: formattedPhone,
      template: templateName,
      parameters
    });

    // Ensure parameters is an array
    if (!Array.isArray(parameters)) {
      throw new Error("Parameters must be an array");
    }

    // Format parameters as proper JSON objects
    const formattedParameters = parameters.map(param => ({
      type: "text",
      text: param.toString()
    }));

    const response = await axios.post(
      `${this.baseURL}/${this.phoneNumberId}/messages`,
      {
        messaging_product: "whatsapp",
        to: formattedPhone,
        type: "template",
        template: {
          name: templateName,
          language: { code: "en" },
          components: [
            {
              type: "body",
              parameters: formattedParameters
            }
          ]
        }
      },
      {
        headers: {
          Authorization: `Bearer ${this.accessToken}`,
          "Content-Type": "application/json"
        }
      }
    );

    console.log("WhatsApp API Response:", response.data);
    return true;
  } catch (error) {
    console.error("WhatsApp message error:", {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status,
      parameters
    });
    return false;
  }
}
  async sendOrderCancellationNotification(phone, orderDetails, reason) {
    try {
      const formattedPhone = this.formatPhoneNumber(phone);

      const response = await axios({
        method: "post",
        url: `${this.baseURL}/${this.phoneNumberId}/messages`,
        headers: {
          Authorization: `Bearer ${this.accessToken}`,
          "Content-Type": "application/json",
        },
        data: {
          messaging_product: "whatsapp",
          to: formattedPhone,
          type: "template",
          template: {
            name: "order_cancellation",
            language: { code: "en" },
            components: [
              {
                type: "body",
                parameters: [
                  { type: "text", text: orderDetails._id },
                  { type: "text", text: reason },
                  { type: "text", text: orderDetails.amount.toString() },
                ],
              },
            ],
          },
        },
      });

      console.log("WhatsApp cancellation notification sent:", response.data);
      console.log("WhatsApp API Complete Response:", {
        status: response.status,
        statusText: response.statusText,
        data: response.data,
        headers: response.headers
      });
      return true;
    } catch (error) {
      console.error("WhatsApp cancellation notification error:", error);
      return false;
    }
  }
  async sendVerifyOtp(phone, templateName, parameters) {
    try {
      const formattedPhone = this.formatPhoneNumber(phone);
      if (!formattedPhone) {
        throw new Error("Invalid phone number format");
      }

      const templates = {
        'otp_alert': {
          buttonText: "Verify"
        },
        'reset_otp': {
          buttonText: "Verify"
        }
      };

      console.log('Sending template message:', {
        phone: formattedPhone,
        template: templateName,
        parameters
      });

      const response = await axios.post(
        `${this.baseURL}/${this.phoneNumberId}/messages`,
        {
          messaging_product: "whatsapp",
          to: formattedPhone,
          type: "template",
          template: {
            name: templateName,
            language: { code: "en" },
            components: [
              {
                type: "body",
                parameters: parameters
              },
              {
                type: "button",
                sub_type: "url",
                index: 0,
                parameters: [
                  {
                    type: "text",
                    text: templates[templateName]?.buttonText || "Verify"
                  }
                ]
              }
            ]
          }
        },
        {
          headers: {
            Authorization: `Bearer ${this.accessToken}`,
            "Content-Type": "application/json"
          }
        }
      );

      console.log("WhatsApp API Response:", response.data);
      return true;
    } catch (error) {
      console.error("WhatsApp template message error:", error.response?.data || error);
      return false;
    }
  }

}

export default new WhatsAppService();
