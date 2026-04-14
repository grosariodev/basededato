import { useState } from 'preact/hooks';
import Landing from './components/Landing';
import DemoPage from './components/DemoPage';

export default function App() {
  const [showDemo, setShowDemo] = useState(false);

  if (showDemo) {
    return <DemoPage onVolver={() => setShowDemo(false)} />;
  }

  return <Landing onProbarDemo={() => setShowDemo(true)} />;
}
