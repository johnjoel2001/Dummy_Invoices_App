import { Telegraf } from 'telegraf';
import OpenAI from 'openai';
import { createClient } from '@supabase/supabase-js';

// Initialize OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

// Initialize Supabase
const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
);

// Initialize Telegram Bot
const bot = new Telegraf(process.env.TELEGRAM_BOT_TOKEN);

// Store pending payments (in production, use Redis or database)
const pendingPayments = new Map();

// AI Agent for parsing payment messages
async function parsePaymentMessage(message) {
  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `You are a payment recording assistant. Extract payment information from messages.
          
Rules:
- Extract customer name (could be first name, full name, or company name)
- Extract payment amount (look for numbers with or without currency symbols)
- Return JSON format only: {"customerName": "...", "amount": number}
- If information is unclear, return {"error": "message"}
- Amount should be a number without currency symbols

Examples:
"Joel paid 3000" -> {"customerName": "Joel", "amount": 3000}
"Received Rs 5000 from ABC Company" -> {"customerName": "ABC Company", "amount": 5000}
"John Doe payment 1500" -> {"customerName": "John Doe", "amount": 1500}`
        },
        {
          role: "user",
          content: message
        }
      ],
      temperature: 0.3,
      response_format: { type: "json_object" }
    });

    const result = JSON.parse(completion.choices[0].message.content);
    return result;
  } catch (error) {
    console.error('OpenAI parsing error:', error);
    return { error: 'Failed to parse message' };
  }
}

// Find matching customer in Supabase
async function findCustomer(customerName) {
  try {
    const { data: customers, error } = await supabase
      .from('customers')
      .select('*')
      .ilike('name', `%${customerName}%`);

    if (error) throw error;

    if (customers && customers.length > 0) {
      // Return best match (first one for now, could add fuzzy matching)
      return customers[0];
    }

    return null;
  } catch (error) {
    console.error('Error finding customer:', error);
    return null;
  }
}

// Find unpaid/partial invoices for customer
async function findCustomerInvoices(customerName) {
  try {
    const { data: invoices, error } = await supabase
      .from('invoices')
      .select('*')
      .ilike('buyer_name', `%${customerName}%`)
      .order('invoice_date', { ascending: true }); // Oldest first

    if (error) throw error;

    // Filter for unpaid or partially paid invoices
    const unpaidInvoices = invoices.filter(inv => {
      const payments = inv.payments || [];
      const amountPaid = payments.reduce((sum, p) => sum + p.amount, 0);
      return amountPaid < inv.total;
    });

    return unpaidInvoices;
  } catch (error) {
    console.error('Error finding invoices:', error);
    return [];
  }
}

// Find best matching invoice for payment amount
function findBestMatchingInvoice(invoices, amount) {
  console.log('Finding best match for amount:', amount);
  
  // Calculate balance for each invoice
  const invoicesWithBalance = invoices.map(inv => {
    const payments = inv.payments || [];
    const amountPaid = payments.reduce((sum, p) => sum + p.amount, 0);
    const balance = inv.total - amountPaid;
    
    console.log(`Invoice ${inv.invoice_number}: Total=${inv.total}, Paid=${amountPaid}, Balance=${balance}`);
    
    return { ...inv, balance, amountPaid };
  });
  
  // First priority: Find invoice with exact balance match
  const exactMatch = invoicesWithBalance.find(inv => 
    Math.abs(inv.balance - amount) < 0.01
  );
  
  if (exactMatch) {
    console.log(`✅ Exact match found: Invoice ${exactMatch.invoice_number} (Balance: ${exactMatch.balance})`);
    return exactMatch;
  }
  
  // Second priority: Find invoice where payment amount <= balance (no overpayment)
  const noOverpayment = invoicesWithBalance.find(inv => amount <= inv.balance);
  
  if (noOverpayment) {
    console.log(`✅ Found invoice that can accept full payment without overpayment: Invoice ${noOverpayment.invoice_number}`);
    return noOverpayment;
  }
  
  // Last resort: Use oldest invoice (first in array)
  console.log(`⚠️ No perfect match, using oldest invoice: ${invoicesWithBalance[0].invoice_number}`);
  return invoicesWithBalance[0];
}

// Record payment to invoice
async function recordPayment(invoice, amount, method = 'GPay') {
  try {
    const payments = invoice.payments || [];
    const newPayment = {
      id: Date.now().toString(),
      amount: amount,
      date: new Date().toISOString().split('T')[0],
      method: method,
      reference: 'Telegram Bot',
      notes: `Recorded via Telegram (${method})`
    };

    payments.push(newPayment);
    const amountPaid = payments.reduce((sum, p) => sum + p.amount, 0);
    const balance = invoice.total - amountPaid;
    const paymentStatus = amountPaid === 0 ? 'Unpaid' : amountPaid >= invoice.total ? 'Paid' : 'Partial';

    const { data, error } = await supabase
      .from('invoices')
      .update({
        payments: payments,
        amount_paid: amountPaid,
        balance: balance,
        payment_status: paymentStatus,
        updated_at: new Date().toISOString()
      })
      .eq('invoice_number', invoice.invoice_number)
      .select();

    if (error) throw error;

    return {
      success: true,
      invoice: data[0],
      payment: newPayment,
      newBalance: balance,
      status: paymentStatus
    };
  } catch (error) {
    console.error('Error recording payment:', error);
    return { success: false, error: error.message };
  }
}

// Handle incoming messages
bot.on('text', async (ctx) => {
  const message = ctx.message.text;
  
  // Ignore commands
  if (message.startsWith('/')) return;

  try {
    await ctx.reply('🤖 Processing your payment message...');

    // Parse message with AI
    const parsed = await parsePaymentMessage(message);

    if (parsed.error) {
      await ctx.reply(`❌ ${parsed.error}\n\nPlease use format: "Customer Name paid Amount"\nExample: "Joel paid 3000"`);
      return;
    }

    const { customerName, amount } = parsed;

    // Find customer
    const customer = await findCustomer(customerName);
    if (!customer) {
      await ctx.reply(`❌ Customer "${customerName}" not found in the system.\n\nPlease check the name and try again.`);
      return;
    }

    // Find unpaid invoices
    const invoices = await findCustomerInvoices(customer.name);
    console.log(`Found ${invoices.length} unpaid invoices for ${customer.name}`);
    
    if (invoices.length === 0) {
      await ctx.reply(`✅ Customer "${customer.name}" found, but no unpaid invoices.\n\nAll invoices are already paid!`);
      return;
    }

    // Find best matching invoice (exact amount match or oldest)
    const invoice = findBestMatchingInvoice(invoices, amount);
    const payments = invoice.payments || [];
    const currentPaid = payments.reduce((sum, p) => sum + p.amount, 0);
    const currentBalance = invoice.total - currentPaid;
    const isExactMatch = currentBalance === amount;
    
    // Store pending payment data
    const userId = ctx.from.id;
    pendingPayments.set(userId, {
      customer,
      invoice,
      amount,
      isExactMatch,
      invoicesCount: invoices.length
    });
    
    // Ask for payment method
    await ctx.reply(
      `💰 Payment Details:\n\n` +
      `👤 Customer: ${customer.name}\n` +
      `💵 Amount: Rs. ${amount.toFixed(2)}\n` +
      `📄 Invoice: ${invoice.invoice_number}\n` +
      `📊 Balance: Rs. ${currentBalance.toFixed(2)}\n\n` +
      `💳 Please select payment method:`,
      {
        reply_markup: {
          inline_keyboard: [
            [
              { text: '📱 GPay', callback_data: 'method_gpay' },
              { text: '💵 Cash', callback_data: 'method_cash' }
            ]
          ]
        }
      }
    );

  } catch (error) {
    console.error('Bot error:', error);
    await ctx.reply('❌ An error occurred. Please try again.');
  }
});

// Handle payment method selection
bot.on('callback_query', async (ctx) => {
  const callbackData = ctx.callbackQuery.data;
  const userId = ctx.from.id;
  
  if (callbackData.startsWith('method_')) {
    const method = callbackData === 'method_gpay' ? 'GPay' : 'Cash';
    const pending = pendingPayments.get(userId);
    
    if (!pending) {
      await ctx.answerCbQuery();
      await ctx.reply('❌ Payment session expired. Please send the payment message again.');
      return;
    }
    
    // Record payment with selected method
    const result = await recordPayment(pending.invoice, pending.amount, method);
    
    // Answer callback query to remove loading state
    await ctx.answerCbQuery(`Payment method: ${method}`);
    
    if (result.success) {
      const statusEmoji = result.status === 'Paid' ? '✅' : '⚠️';
      const matchInfo = pending.isExactMatch ? '🎯 Exact amount match!' : '📅 Applied to oldest invoice';
      
      await ctx.editMessageText(
        `${statusEmoji} Payment Recorded!\n\n` +
        `👤 Customer: ${pending.customer.name}\n` +
        `💰 Amount: Rs. ${pending.amount.toFixed(2)}\n` +
        `💳 Method: ${method}\n` +
        `${matchInfo}\n\n` +
        `📄 Invoice: ${pending.invoice.invoice_number}\n` +
        `💵 Invoice Total: Rs. ${pending.invoice.total.toFixed(2)}\n` +
        `💳 Amount Paid: Rs. ${(pending.invoice.total - result.newBalance).toFixed(2)}\n` +
        `📊 Balance: Rs. ${result.newBalance.toFixed(2)}\n` +
        `📈 Status: ${result.status}\n\n` +
        (result.status === 'Paid' ? '🎉 Invoice fully paid!' : '⏳ Partial payment recorded') +
        (pending.invoicesCount > 1 ? `\n\n📝 ${pending.invoicesCount - 1} more unpaid invoice(s) for this customer` : '')
      );
      
      // Clear pending payment
      pendingPayments.delete(userId);
    } else {
      await ctx.reply(`❌ Failed to record payment: ${result.error}`);
    }
  }
});

// Start command
bot.command('start', (ctx) => {
  ctx.reply(
    '👋 Welcome to Safetex Payment Bot!\n\n' +
    '💡 How to use:\n' +
    'Simply send a message like:\n' +
    '"Joel paid 3000"\n' +
    '"Received 5000 from ABC Company"\n' +
    '"John Doe payment 1500"\n\n' +
    'I will automatically:\n' +
    '✅ Find the customer\n' +
    '✅ Find their unpaid invoice\n' +
    '✅ Record the payment\n' +
    '✅ Update the status\n\n' +
    'Try it now! 🚀'
  );
});

// Help command
bot.command('help', (ctx) => {
  ctx.reply(
    '📖 Payment Bot Help\n\n' +
    '✅ Supported formats:\n' +
    '• "Customer paid Amount"\n' +
    '• "Received Amount from Customer"\n' +
    '• "Customer payment Amount"\n\n' +
    '💡 Examples:\n' +
    '• Joel paid 3000\n' +
    '• Received Rs 5000 from ABC Company\n' +
    '• John Doe payment 1500\n\n' +
    '🔍 The bot will:\n' +
    '1. Parse your message using AI\n' +
    '2. Find matching customer\n' +
    '3. Smart match to invoice:\n' +
    '   • Exact amount match (if available)\n' +
    '   • Or oldest unpaid invoice\n' +
    '4. Record payment automatically\n' +
    '5. Update invoice status'
  );
});

// Error handling
bot.catch((err, ctx) => {
  console.error('Bot error:', err);
  ctx.reply('❌ An error occurred. Please try again or contact support.');
});

// Manual start function
export async function startBot() {
  try {
    console.log('⏳ Getting bot info...');
    const botInfo = await bot.telegram.getMe();
    console.log(`✅ Connected to bot: @${botInfo.username}`);
    
    console.log('⏳ Starting polling (this may take a moment)...');
    
    // Use startPolling directly instead of launch
    bot.startPolling();
    
    // Give it a moment to start
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    console.log('✅ Bot is now active and listening!');
    return true;
  } catch (error) {
    console.error('❌ Bot start error:', error.message);
    throw error;
  }
}

export default bot;
