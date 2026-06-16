require('dotenv').config();
const express  = require('express');
const cors     = require('cors');
const mongoose = require('mongoose');

const app  = express();
const PORT = process.env.PORT || 4000;

// ── CORS ─────────────────────────────────────────────────────────
app.use(cors({ origin: '*' }));
app.use(express.json());

// ── MongoDB ───────────────────────────────────────────────────────
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('✅ MongoDB connected'))
  .catch(err => { console.error('MongoDB error:', err); process.exit(1); });

// ── Schemas ───────────────────────────────────────────────────────
const appointmentSchema = new mongoose.Schema({
  name:          { type: String, required: true, trim: true },
  phone:         { type: String, required: true, trim: true },
  services:      [{ type: String }],
  servicePrices: { type: Map, of: Number, default: {} },
  datetime:      { type: String, required: true },
  price:         { type: Number, required: true, min: 0 },
  note:          { type: String, default: '' },
  status:        { type: String, enum: ['pending','done','cancelled'], default: 'pending' }
}, { timestamps: true });

const catalogSchema = new mongoose.Schema({
  name:  { type: String, required: true, unique: true, trim: true },
  price: { type: Number, required: true, min: 0 }
});

const customerSchema = new mongoose.Schema({
  name:   { type: String, required: true, trim: true },
  phone:  { type: String, required: true, trim: true, unique: true },
  remark: { type: String, default: '' }
}, { timestamps: true });

const Appointment = mongoose.model('Appointment', appointmentSchema);
const Catalog     = mongoose.model('Catalog', catalogSchema);
const Customer    = mongoose.model('Customer', customerSchema);

// ── Appointments CRUD ─────────────────────────────────────────────
app.get('/api/appointments', async (req, res) => {
  try { res.json(await Appointment.find().sort({ datetime: -1 })); }
  catch (e) { res.status(500).json({ error: e.message }); }
});

app.post('/api/appointments', async (req, res) => {
  try { res.status(201).json(await new Appointment(req.body).save()); }
  catch (e) { res.status(400).json({ error: e.message }); }
});

app.put('/api/appointments/:id', async (req, res) => {
  try {
    const doc = await Appointment.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!doc) return res.status(404).json({ error: 'Not found' });
    res.json(doc);
  } catch (e) { res.status(400).json({ error: e.message }); }
});

app.delete('/api/appointments/:id', async (req, res) => {
  try {
    const doc = await Appointment.findByIdAndDelete(req.params.id);
    if (!doc) return res.status(404).json({ error: 'Not found' });
    res.json({ ok: true });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// ── Catalog CRUD ──────────────────────────────────────────────────
app.get('/api/catalog', async (req, res) => {
  try { res.json(await Catalog.find().sort({ name: 1 })); }
  catch (e) { res.status(500).json({ error: e.message }); }
});

app.post('/api/catalog', async (req, res) => {
  try { res.status(201).json(await new Catalog(req.body).save()); }
  catch (e) { res.status(400).json({ error: e.message }); }
});

app.put('/api/catalog/:id', async (req, res) => {
  try {
    const doc = await Catalog.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!doc) return res.status(404).json({ error: 'Not found' });
    res.json(doc);
  } catch (e) { res.status(400).json({ error: e.message }); }
});

app.delete('/api/catalog/:id', async (req, res) => {
  try {
    await Catalog.findByIdAndDelete(req.params.id);
    res.json({ ok: true });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// ── Customers CRUD ────────────────────────────────────────────────
app.get('/api/customers', async (req, res) => {
  try { res.json(await Customer.find().sort({ name: 1 })); }
  catch (e) { res.status(500).json({ error: e.message }); }
});

app.post('/api/customers', async (req, res) => {
  try { res.status(201).json(await new Customer(req.body).save()); }
  catch (e) { res.status(400).json({ error: e.message }); }
});

app.put('/api/customers/:id', async (req, res) => {
  try {
    const doc = await Customer.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!doc) return res.status(404).json({ error: 'Not found' });
    res.json(doc);
  } catch (e) { res.status(400).json({ error: e.message }); }
});

app.delete('/api/customers/:id', async (req, res) => {
  try {
    await Customer.findByIdAndDelete(req.params.id);
    res.json({ ok: true });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// ── Health ────────────────────────────────────────────────────────
app.get('/api/health', (req, res) => res.json({ status: 'ok', time: new Date() }));

app.listen(PORT, () => console.log(`🚀 Server on port ${PORT}`));
