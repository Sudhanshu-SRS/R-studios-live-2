import React from 'react';
import Title from '../components/Title';

const ReturnPolicy = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <Title text1="RETURN AND REFUND" text2="POLICY" />
      <div className="mt-8 space-y-4">
        <p>At Rashi Studio, we take immense pride in offering high-quality women's fashion. To maintain the integrity of our products and services, we have a no-return and no-refund policy. Please read this policy carefully before making a purchase.</p>
        
        <h2 className="text-lg font-semibold">No Return Policy</h2>
        <ul className="list-disc list-inside">
          <li>We do not accept return requests for any purchased items.</li>
          <li>We urge our customers to carefully review the product description, size chart, and images before placing an order.</li>
          <li>For assistance in choosing the right product, feel free to reach out to our support team.</li>
        </ul>

        <h2 className="text-lg font-semibold">No Refund Policy</h2>
        <ul className="list-disc list-inside">
          <li>Once the payment is processed and the order is confirmed, we do not issue refunds under any circumstances.</li>
        </ul>
        <p>In case of exceptional situations like wrong product delivery or damaged goods, please notify us within 24 hours of receiving the product by Tel: (+91) 9764804422 Email: rashifashionoffice@gmail.com with photos and details. Such cases will be reviewed, and a resolution will be provided based on our discretion, which may include product replacement or store credit.</p>

        <h2 className="text-lg font-semibold">Order Cancellations</h2>
        <ul className="list-disc list-inside">
          <li>Cancellations are only permitted within 1 hour of placing the order. Beyond this window, the order will be processed, and no changes or cancellations will be allowed.</li>
        </ul>

        <h2 className="text-lg font-semibold">Customer Support</h2>
        <p>For any queries or concerns, please contact our customer care team at:</p>
        <p>Tel: (+91) 9764804422</p>
        <p>Email: rashifashionoffice@gmail.com during business hours.</p>

        <p>We appreciate your understanding and cooperation in adhering to these policies. Your satisfaction remains our top priority, and we are committed to providing the best shopping experience possible.</p>
      </div>
    </div>
  );
};

export default ReturnPolicy;