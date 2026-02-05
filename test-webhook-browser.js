// Test del webhook per la nuova pagina
// Esegui questo nel browser console su https://tuo-sito.vercel.app

fetch('/api/revalidate', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer ' + 'YOUR_SANITY_REVALIDATE_SECRET'
  },
  body: JSON.stringify({
    _type: 'page',
    slug: { current: 'en/ticketing-intelligente' },
    _id: 'test-id-123'
  })
})
.then(res => res.json())
.then(result => {
  console.log('Webhook result:', result);
  // Dopo 2 secondi, riprova ad accedere alla pagina
  setTimeout(() => {
    window.open('/en/ticketing-intelligente', '_blank');
  }, 2000);
})
.catch(err => console.error('Webhook error:', err));