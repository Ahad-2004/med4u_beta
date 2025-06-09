import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useFirestore } from '../hooks/useFirestore';
import Card from '../components/UI/Card';

const Appointments = () => {
  const { currentUser } = useAuth();
  const { documents: appointments, loading, error, getDocuments, addDocument } = useFirestore('appointments');
  const [form, setForm] = useState({ date: '', time: '', doctor: '', notes: '' });
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (currentUser) {
      getDocuments([{ field: 'userId', operator: '==', value: currentUser.uid }], { field: 'date', direction: 'asc' });
    }
  }, [currentUser, getDocuments]);

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setSubmitting(true);
    setSuccess('');
    try {
      await addDocument({ ...form, userId: currentUser.uid, createdAt: new Date().toISOString() });
      setForm({ date: '', time: '', doctor: '', notes: '' });
      setSuccess('Appointment booked!');
      getDocuments([{ field: 'userId', operator: '==', value: currentUser.uid }], { field: 'date', direction: 'asc' });
    } catch (err) {
      // handle error
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto py-8">
      <h1 className="text-2xl font-bold mb-6 text-center">Appointments</h1>
      <Card className="mb-8">
        <h2 className="text-lg font-semibold mb-4">Book a New Appointment</h2>
        <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-4">
          <input className="input" type="date" name="date" value={form.date} onChange={handleChange} required />
          <input className="input" type="time" name="time" value={form.time} onChange={handleChange} required />
          <input className="input" type="text" name="doctor" placeholder="Doctor or Type" value={form.doctor} onChange={handleChange} required />
          <textarea className="input" name="notes" placeholder="Notes (optional)" value={form.notes} onChange={handleChange} />
          <button className="btn btn-primary w-full" type="submit" disabled={submitting}>{submitting ? 'Booking...' : 'Book Appointment'}</button>
          {success && <div className="text-green-600 text-sm mt-2">{success}</div>}
        </form>
      </Card>
      <Card>
        <h2 className="text-lg font-semibold mb-4">Upcoming Appointments</h2>
        {loading ? <div>Loading...</div> : (
          <ul className="divide-y divide-gray-200">
            {appointments && appointments.length > 0 ? appointments.map(app => (
              <li key={app.id} className="py-3 flex flex-col md:flex-row md:items-center md:justify-between">
                <div>
                  <div className="font-medium text-gray-900">{app.doctor}</div>
                  <div className="text-sm text-gray-500">{app.date} at {app.time}</div>
                  {app.notes && <div className="text-xs text-gray-400 mt-1">{app.notes}</div>}
                </div>
                <div className="text-xs text-gray-400 mt-2 md:mt-0">
                  Booked on {app.createdAt ? new Date(app.createdAt).toLocaleDateString() : '—'}
                </div>
              </li>
            )) : <li className="text-gray-500">No appointments yet.</li>}
          </ul>
        )}
      </Card>
    </div>
  );
};

export default Appointments;
