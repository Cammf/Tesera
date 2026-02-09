import { Toolbar } from './components/ui/Toolbar';
import { ColorPalette } from './components/ui/ColorPalette';
import { SaveLoadPanel } from './components/ui/SaveLoadPanel';
import { ShapePanel } from './components/ui/ShapePanel';
import { Viewport } from './components/viewport/Viewport';
import { ShapeOverlay } from './components/shapes/ShapeOverlay';
import './App.css';

function App() {
  return (
    <div className="app">
      <header className="app-header">
        <SaveLoadPanel />
        <Toolbar />
      </header>
      <div className="app-body">
        <ColorPalette />
        <main className="app-viewport">
          <Viewport />
          <ShapeOverlay />
        </main>
        <ShapePanel />
      </div>
    </div>
  );
}

export default App;
