## EMAIL SERVICE

### Transactional Emails: 

1. Snipcart handles the **First "Invoice" Email** (using the Invoice Template), that acts as a proof of order created (/checkout/order-completed.ts), and the **Final "Delivery and Feedback" email** (using the Order Comment Template) when the order status is changed to Delivered by the Shiprocket (/webhooks/logistics-sync.ts). 
2. Shiprocket handles the **Delivery and Updates**, from the moment the package is picked, to the moment the package is delivered on doorstep.

*Note: The Feedback Email (sent using the Order Comment Template) links to the Feedback form created using the Tally.so platform (Free Tier).* 
### Promotional Emails: 

Handled using the **Mailerlite**. Free tier is being used until the usage limit exceed and demands the upper tier. #TheNewsletterEngine 

---

## Emails in Route, being used currently:

*Using Cloudflare Routing, I have made email aliases with following prefixes for zeliavance.com (domain for Brand: **Zelia Vance**):*
1. **hello@** for general inquiries & intros.
2. **support@** for customer care & troubleshooting regarding orders etc.
3. **zee@** to represent the customer inquiries related to the Mailerlite replies in personalized manner.
4. **legal@** for privacy policy & terms of service inquiries
5. **orders@** for Snipcart Template Emails > with reply to set to support@ inbox.
6. **withlove@** for Mailerlite Email Marketing > with reply to set to zee@ inbox. 
7. **test1@** for test purposes
8. **test2@** for test purposes

*For purely Backend purposes, the prefix **"logistics@"** is being used for the **SHIPROCKET API USER**.*

*The email aliases with prefixes hello@, support@, zee@ & legal@ (including the test1@ and test2@) are being routed to the gmail "zeliavance[dot]official[at]gmail[dot]com" for being used via the smtp.gmail.com method using **"App Password"** method by google, so that they can be used to **"send mail as"** from right inside the gmail interface without requiring the Google Workspace paid plan and inbox for all of these stay the same, separating emails using **labels for each category**.*

***Brand Persona is "Zee"**. Anyone who talks to represent Zelia Vance is "Zee".* 



