#!/usr/bin/env node

/**
 * Telegram Configuration Test Script
 * 
 * This script helps you verify your Telegram bot setup
 * Run: npx tsx test-telegram-config.ts
 */

// Load environment variables from .env.local
import { config } from 'dotenv';
import { resolve } from 'path';

config({ path: resolve(process.cwd(), '.env.local') });

// Load environment variables
const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const CHANNEL_ID = process.env.TELEGRAM_CHANNEL_ID;

console.log('🔍 Telegram Configuration Test\n');
console.log('================================\n');

// Check 1: Environment Variables
console.log('1️⃣ Checking Environment Variables...');
console.log(`   Bot Token: ${BOT_TOKEN ? '✅ Set' : '❌ Missing'}`);
console.log(`   Channel ID: ${CHANNEL_ID ? '✅ Set' : '❌ Missing'}`);

if (BOT_TOKEN) {
    console.log(`   Token Length: ${BOT_TOKEN.length} characters`);
    console.log(`   Token Format: ${BOT_TOKEN.includes(':') ? '✅ Valid format' : '⚠️  Invalid format'}`);
}

if (CHANNEL_ID) {
    console.log(`   Channel ID: ${CHANNEL_ID}`);
    console.log(`   ID Format: ${CHANNEL_ID.startsWith('-') ? '✅ Correct (numeric)' : '⚠️  Should start with -'}`);
}

console.log('');

// Check 2: Bot Info
if (BOT_TOKEN) {
    console.log('2️⃣ Fetching Bot Information...');

    fetch(`https://api.telegram.org/bot${BOT_TOKEN}/getMe`)
        .then(res => res.json())
        .then(data => {
            if (data.ok) {
                console.log(`   ✅ Bot is valid!`);
                console.log(`   Bot Name: ${data.result.first_name}`);
                console.log(`   Bot Username: @${data.result.username}`);
                console.log(`   Bot ID: ${data.result.id}`);
            } else {
                console.log(`   ❌ Bot token is invalid!`);
                console.log(`   Error: ${data.description}`);
            }
            console.log('');

            // Check 3: Send Test Message
            if (data.ok && CHANNEL_ID) {
                testSendMessage();
            }
        })
        .catch(err => {
            console.log(`   ❌ Failed to fetch bot info: ${err.message}`);
            console.log('');
        });
} else {
    console.log('2️⃣ ⚠️  Skipping bot check (no token provided)\n');
}

// Check 3: Test Message
async function testSendMessage() {
    console.log('3️⃣ Testing Message Sending...');

    try {
        const url = `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`;
        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                chat_id: CHANNEL_ID,
                text: '✅ Test message from Ailar platform!\n\nIf you see this, your Telegram integration is working correctly! 🎉',
                parse_mode: 'HTML'
            })
        });

        const data = await response.json();

        if (data.ok) {
            console.log('   ✅ Message sent successfully!');
            console.log(`   Message ID: ${data.result.message_id}`);
            console.log(`   Channel: ${data.result.chat.title || data.result.chat.username}`);
            console.log('');
            console.log('🎉 SUCCESS! Your Telegram integration is working!\n');
        } else {
            console.log('   ❌ Failed to send message!');
            console.log(`   Error Code: ${data.error_code}`);
            console.log(`   Error: ${data.description}`);
            console.log('');

            // Provide specific help based on error
            if (data.description.includes('chat not found')) {
                console.log('💡 SOLUTION:');
                console.log('   1. Make sure your bot is added to the channel as an administrator');
                console.log('   2. Verify the channel ID is correct (should start with -100)');
                console.log('   3. Forward a message from your channel to @userinfobot to get the correct ID');
                console.log('');
                console.log('   See TELEGRAM_TROUBLESHOOTING.md for detailed instructions.');
            } else if (data.description.includes('bot was kicked')) {
                console.log('💡 SOLUTION:');
                console.log('   Your bot was removed from the channel.');
                console.log('   1. Go to your channel settings');
                console.log('   2. Add the bot back as an administrator');
                console.log('   3. Grant "Post Messages" permission');
            } else if (data.description.includes('not enough rights')) {
                console.log('💡 SOLUTION:');
                console.log('   Your bot doesn\'t have permission to post.');
                console.log('   1. Go to channel → Administrators');
                console.log('   2. Find your bot');
                console.log('   3. Enable "Post Messages" permission');
            }
            console.log('');
        }
    } catch (err: any) {
        console.log(`   ❌ Network error: ${err.message}`);
        console.log('');
    }
}

// Instructions
if (!BOT_TOKEN || !CHANNEL_ID) {
    console.log('⚠️  SETUP REQUIRED\n');
    console.log('Please add these to your .env.local file:');
    console.log('');
    console.log('TELEGRAM_BOT_TOKEN=your_bot_token_here');
    console.log('TELEGRAM_CHANNEL_ID=-1001234567890');
    console.log('');
    console.log('Then restart your dev server and run this test again.');
    console.log('');
}
