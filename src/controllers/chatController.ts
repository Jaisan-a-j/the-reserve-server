import { Request, Response } from "express";
import { geminiAi } from "../utils/gemini";
import { grokAi } from "../utils/gemini";

export const chatWithAi = async (
  req: Request,
  res: Response,
): Promise<void> => {

  try {
    const { message } = req.body;

    const restaurantInfo = `
     Restaurant Name: The Reserve
Tagline: Savor Every Bite — flavor, freshness, and hospitality in every plate.
Established: Serving food lovers since 2016.

About:
- The Reserve is a dining experience focused on memorable meals, warm hospitality, and quality ingredients.
- Over 7 years of experience, 30+ dishes on the menu, 500+ customer reviews, and 1000+ happy customers (as shown on the About Us section).

Location:
- Suite 410, 4th Floor
- 720 Marine Drive Promenade
- Ernakulam District, 682031, India

Contact:
- Phone: +91 9920012466
- Email: thereserve@gmail.com

Opening Hours:
- Monday–Sunday: 9:00 AM – 9:00 PM
- (Use your final agreed hours here — reconcile with FAQ if needed)

Website Pages (guide users here):
- Home: /
- About Us: /#aboutus
- Menu / Order Online: /buy-online
- Food details: /buy-online/:foodId
- Checkout: /checkout (login required)
- Login / Register: /auth
- My Account & Order History: /profile
- Table Reservation: /#reservation (on the home page)
- Team: /#team
- Guest Reviews: shown on home page
- FAQs: /#faqs

Services:
1. Dine-in / table reservations
2. Online food ordering (takeaway)
3. Home delivery
4. Pickup at restaurant counter
5. Guest reviews after orders
6. AI chat assistant on website (home, buy-online, profile pages)

Online Table Reservation (website):
- Available on the home page reservation section.
- User must be logged in.
- Required: 10-digit phone number, date, time slot.
- Optional: special message/notes.
- Available time slots: 09:00 AM, 11:00 AM, 01:00 PM, 03:00 PM, 05:00 PM, 07:00 PM.
- Only future/today slots shown for today (past slots hidden).
- Max 2 active bookings per user.
- Only 1 booking allowed per date per user.
- Users can view and cancel active bookings from the reservation section.
- Fully booked slots for a date are unavailable.
- Confirmation message shown after booking.
- Phone booking also available by calling +91 9920012466.

Online Food Ordering:
- Browse menu at /buy-online.
- Menu categories: Appetizers, Salads, Mains, Desserts, Beverages.
- Homepage also highlights: Signature Dishes, Small Bites, Beverages & Desserts.
- Dietary filters: Vegan, Vegetarian, Gluten-Free, Dairy-Free.
- Spice levels: Mild, Medium, Hot.
- Each dish shows title, description, price, category, dietary tags, and spice level.
- Login required to add items to cart.
- Cart supports quantity updates and item removal.
- Checkout requires login.

Checkout & Order Fulfillment:
- Fulfillment options:
  - Delivery: estimated 35–45 minutes
  - Pickup: ready in 20–25 minutes at The Reserve counter
- Payment options:
  - Credit/debit card (pay before kitchen starts)
  - Pay at counter (confirm now, pay on receipt)
- For delivery: address, city, and ZIP code required.
- Contact required: full name, email, 10-digit phone.
- Pricing breakdown:
  - Service fee: ₹4.99 (when cart has items)
  - Delivery fee: ₹6.50 (delivery only, when cart has items)
  - Tax: 5% of subtotal
- Order confirmation email sent after successful order.
- Order history available in /profile after login.

Reviews:
- Logged-in users can submit a review after placing an order (on checkout confirmation screen).
- Review requires 1–5 star rating and written comment.
- Guest reviews are displayed on the home page.
- Average rating shown: 4.8 based on 256+ reviews.

Account & Authentication:
- Email/password login and registration at /auth.
- Registration uses email OTP verification.
- Google sign-in supported.
- Profile page shows user details and past orders.
- Logout available from header profile menu.

Private Events:
- Birthday parties, corporate events, family gatherings, and private celebrations available.
- Contact team by phone or email for custom menus and arrangements.

Dietary Options:
- Vegan, vegetarian, gluten-free, and dairy-free options available.
- Use menu filters on /buy-online to find suitable dishes.

Delivery Partners:
- Orders can also be placed via Swiggy and Zomato (mentioned in FAQs).

Team / Kitchen Leadership:
- Cheyenne Workman — Head Chef
- Corey Rosser — Kitchen Manager
- Marilyn Westervelt — Sous Chef
- Ryan Passaquindici Arcand — Culinary Director
- Emma Watson — Pastry Chef
- James Carter — Executive Chef
- Daniel Brown — Food Specialist

Chatbot Behavior Rules:
- Answer only using the information above.
- If asked about a specific dish name or exact price, tell the user to check the live menu at /buy-online unless that dish is listed below.
- If information is unavailable, politely say so and suggest phone/email contact.
- For booking, ordering, or account actions, guide users to the correct website page.
    `;

    const prompt = `
      You are a restaurant assistant.

      Use ONLY the information below.

      ${restaurantInfo}

      User Question:
      ${message}

      If information is unavailable,
      politely tell the customer,
      if questions come from out of the reserve restaurant answer in just two sentences
    `;

    try {
      const geminiResponse = await geminiAi().models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
      });

      if (geminiResponse.text) {
        res.status(200).json({
          success: true,
          provider: "gemini",
          reply: geminiResponse.text
        });
        return;
      }
    } catch (geminiError) {
      console.error("Gemini Error:", geminiError);
    }

    const completion =
    await grokAi().chat.completions.create({
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
      model: "llama-3.3-70b-versatile",
    });

  res.status(200).json({
    success: true,
    provider: "groq",
    reply:
      completion.choices[0]?.message?.content ??
      "No response generated.",
  });
  res.status(200).json({
    success: true,
    reply:
      "Our assistant is temporarily unavailable. Please try again in a few moments.",
  });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Failed to generate response",
    });
  }
};
