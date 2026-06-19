import BillDashboard from './components/BillDashboard';
import './App.css';

function App() {
  return (
    <>
      <header className="app-header">
        <h1>🧾 Smart Bill Organizer</h1>
        <p>Upload your bills and receipts — we'll extract the data automatically.</p>
      </header>

      <main>
        <BillDashboard />
      </main>
    </>
  );
}

export default App;
