require('dotenv').config({ path: __dirname + '/../.env' });
const mongoose = require('mongoose');

async function migrate() {
  console.log('Connecting to database...');
  await mongoose.connect(process.env.DATABASE);
  console.log('Connected to MongoDB Atlas.');

  const Customer = mongoose.model('Customer', new mongoose.Schema({}, { strict: false }), 'customers');
  const Order = mongoose.model('Order', new mongoose.Schema({}, { strict: false }), 'orders');

  const customers = await Customer.find({ deleted: { $ne: true } }).lean();
  console.log(`Found ${customers.length} active customers.`);

  // 1. Explicit mapping for demo seed orders
  const demoSeedMap = {
    'OD2026100501': 'user1@gmail.com',
    'OD2026101102': 'user2@gmail.com',
    'OD2026101903': 'user3@gmail.com',
    'OD2026102604': 'user4@gmail.com',
  };

  let updatedCount = 0;

  for (const [code, email] of Object.entries(demoSeedMap)) {
    const cust = customers.find(c => c.email === email);
    if (cust) {
      const res = await Order.updateOne(
        { code: code },
        { $set: { customerId: String(cust._id) } }
      );
      if (res.modifiedCount > 0) {
        console.log(`[Seed Link] Order ${code} linked to ${email} (customerId: ${cust._id})`);
        updatedCount++;
      } else {
        console.log(`[Seed Link] Order ${code} already had customerId or not found.`);
      }
    }
  }

  // 2. Map orders where phone number matches a unique customer
  const phoneCounts = {};
  for (const c of customers) {
    if (c.phone) {
      phoneCounts[c.phone] = (phoneCounts[c.phone] || 0) + 1;
    }
  }

  const uniquePhoneToCustomer = new Map();
  for (const c of customers) {
    if (c.phone && phoneCounts[c.phone] === 1) {
      uniquePhoneToCustomer.set(c.phone.trim(), c);
    }
  }

  const unlinkedOrders = await Order.find({
    deleted: false,
    $or: [{ customerId: null }, { customerId: { $exists: false } }, { customerId: '' }]
  }).lean();

  console.log(`\nFound ${unlinkedOrders.length} unlinked active orders.`);

  for (const o of unlinkedOrders) {
    if (demoSeedMap[o.code]) continue; // Already handled above

    const phone = o.phoneNumber?.trim();
    if (phone && uniquePhoneToCustomer.has(phone)) {
      const cust = uniquePhoneToCustomer.get(phone);
      await Order.updateOne(
        { _id: o._id },
        { $set: { customerId: String(cust._id) } }
      );
      console.log(`[Auto Link] Order ${o.code} (${o.fullName}, phone: ${phone}) -> linked to ${cust.email} (${cust._id})`);
      updatedCount++;
    }
  }

  console.log(`\nMigration completed! Total orders updated: ${updatedCount}`);
  await mongoose.disconnect();
}

migrate().catch(err => {
  console.error('Migration failed:', err);
  process.exit(1);
});
